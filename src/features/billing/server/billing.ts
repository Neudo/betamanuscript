import "server-only";

import { randomBytes } from "node:crypto";

import type Stripe from "stripe";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/server";

export type BillingInterval = "monthly" | "yearly";

type BillingAccount = {
  email: string;
  id: string;
};

const profileIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getBillingOrigin(request: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredOrigin) {
    return new URL(configuredOrigin).origin;
  }

  return new URL(request.url).origin;
}

function getPriceId(interval: BillingInterval) {
  const priceId = interval === "monthly"
    ? process.env.STRIPE_BETAMANUSCRIPT_PRO_PRICE_ID
    : process.env.STRIPE_BETAMANUSCRIPT_PRO_YEARLY_PRICE_ID;

  if (!priceId) {
    throw new Error(`Stripe ${interval} price is not configured.`);
  }

  return priceId;
}

function getConfiguredPriceIds() {
  return new Set([
    getPriceId("monthly"),
    getPriceId("yearly"),
  ]);
}

function createIntegrationIdentifier() {
  const suffix = Array.from(randomBytes(8), (value) => String.fromCharCode(97 + (value % 26))).join("");
  return `betamanuscript_checkout_${suffix}`;
}

function stripeId(resource: string | { id: string } | null) {
  if (!resource) {
    return null;
  }

  return typeof resource === "string" ? resource : resource.id;
}

function toIsoDate(unixTimestamp: number | null | undefined) {
  return unixTimestamp ? new Date(unixTimestamp * 1_000).toISOString() : null;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((periodEnd) => Number.isFinite(periodEnd));

  return periodEnds.length > 0 ? Math.max(...periodEnds) : null;
}

function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price;
  return price ? stripeId(price) : null;
}

function isRecoverableSubscription(status: string) {
  return !["canceled", "incomplete_expired"].includes(status);
}

function isMissingStripeCustomer(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: unknown; param?: unknown };
  return candidate.code === "resource_missing" && candidate.param === "customer";
}

async function removeDeletedStripeCustomer({
  account,
  stripeCustomerId,
  supabase,
}: {
  account: BillingAccount;
  stripeCustomerId: string;
  supabase: ReturnType<typeof createSupabaseAdminClient>;
}) {
  const { data: removedCustomer, error: removeCustomerError } = await supabase
    .from("stripe_customers")
    .delete()
    .eq("profile_id", account.id)
    .eq("stripe_customer_id", stripeCustomerId)
    .select("profile_id")
    .maybeSingle();

  if (removeCustomerError) {
    throw new Error("Unable to replace the deleted billing customer.");
  }

  if (!removedCustomer) {
    return;
  }

  // Deleting a Stripe customer cancels its subscriptions. Keep the local plan
  // in sync while the replacement customer is created for the next checkout.
  const { error: resetPlanError } = await supabase
    .from("profiles")
    .update({ plan: "free" })
    .eq("id", account.id);

  if (resetPlanError) {
    throw new Error("Unable to reset the billing plan for the deleted customer.");
  }
}

async function getOrCreateStripeCustomer(account: BillingAccount) {
  const supabase = createSupabaseAdminClient();
  const stripe = getStripeClient();
  const { data: existingCustomer, error: existingCustomerError } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("profile_id", account.id)
    .maybeSingle();

  if (existingCustomerError) {
    throw new Error("Unable to load the billing customer.");
  }

  let deletedStripeCustomerId: string | null = null;

  if (existingCustomer) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomer.stripe_customer_id);

      if (!customer.deleted) {
        return existingCustomer.stripe_customer_id;
      }
    } catch (error) {
      if (!isMissingStripeCustomer(error)) {
        throw error;
      }
    }

    deletedStripeCustomerId = existingCustomer.stripe_customer_id;
    await removeDeletedStripeCustomer({
      account,
      stripeCustomerId: deletedStripeCustomerId,
      supabase,
    });
  }

  const customer = await stripe.customers.create(
    {
      email: account.email || undefined,
      metadata: { supabase_profile_id: account.id },
    },
    {
      // A previous customer can have been manually deleted in Stripe. Use a
      // distinct key for its replacement so Stripe does not replay the old,
      // now-deleted customer from its idempotency cache.
      idempotencyKey: deletedStripeCustomerId
        ? `betamanuscript/customer/${account.id}/replacement/${deletedStripeCustomerId}`
        : `betamanuscript/customer/${account.id}`,
    },
  );

  const { data: savedCustomer, error: saveCustomerError } = await supabase
    .from("stripe_customers")
    .upsert(
      {
        profile_id: account.id,
        stripe_customer_id: customer.id,
      },
      { onConflict: "profile_id" },
    )
    .select("stripe_customer_id")
    .single();

  if (saveCustomerError || !savedCustomer) {
    throw new Error("Unable to save the billing customer.");
  }

  return savedCustomer.stripe_customer_id;
}

export async function createBillingCheckout({
  account,
  interval,
  request,
}: {
  account: BillingAccount;
  interval: BillingInterval;
  request: Request;
}) {
  const stripeCustomerId = await getOrCreateStripeCustomer(account);
  const stripe = getStripeClient();
  const existingSubscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    limit: 100,
    status: "all",
  });

  if (existingSubscriptions.data.some((subscription) => isRecoverableSubscription(subscription.status))) {
    return {
      url: await createBillingPortalUrl({ request, stripeCustomerId }),
    };
  }

  const origin = getBillingOrigin(request);
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      // Managed Payments is enabled at the account level, but this product has
      // no verified tax classification yet. We must not guess one: opt out of
      // Managed Payments until the product tax code and tax setup are ready.
      managed_payments: { enabled: false },
      customer: stripeCustomerId,
      client_reference_id: account.id,
      integration_identifier: createIntegrationIdentifier(),
      line_items: [{ price: getPriceId(interval), quantity: 1 }],
      metadata: {
        billing_interval: interval,
        supabase_profile_id: account.id,
      },
      subscription_data: {
        metadata: { supabase_profile_id: account.id },
      },
      success_url: `${origin}/dashboard/settings?section=plan&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/settings?section=plan&checkout=canceled`,
    },
    {
      idempotencyKey: `betamanuscript/checkout/${account.id}/${interval}/${Math.floor(Date.now() / 30_000)}`,
    },
  );

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return { url: session.url };
}

export async function createBillingPortalUrl({
  request,
  stripeCustomerId,
}: {
  request: Request;
  stripeCustomerId: string;
}) {
  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getBillingOrigin(request)}/dashboard/settings?section=plan`,
  });

  return session.url;
}

export async function createBillingPortal({
  account,
  request,
}: {
  account: BillingAccount;
  request: Request;
}) {
  const supabase = createSupabaseAdminClient();
  const { data: customer, error } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("profile_id", account.id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load the billing customer.");
  }

  if (!customer) {
    throw new Error("No billing subscription is associated with this account.");
  }

  return { url: await createBillingPortalUrl({ request, stripeCustomerId: customer.stripe_customer_id }) };
}

async function findProfileIdForStripeCustomer(stripeCustomerId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("stripe_customers")
    .select("profile_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to resolve the Stripe customer.");
  }

  return data?.profile_id ?? null;
}

function validProfileId(value: string | null | undefined) {
  return value && profileIdPattern.test(value) ? value : null;
}

export async function syncStripeSubscription({
  eventCreatedAt,
  eventId,
  eventType,
  fallbackProfileId,
  subscription,
}: {
  eventCreatedAt: number;
  eventId: string;
  eventType: string;
  fallbackProfileId?: string | null;
  subscription: Stripe.Subscription;
}) {
  const stripeCustomerId = stripeId(subscription.customer);
  const stripePriceId = getSubscriptionPriceId(subscription);

  if (!stripeCustomerId || !stripePriceId) {
    throw new Error("Stripe subscription is missing customer or price data.");
  }

  if (!getConfiguredPriceIds().has(stripePriceId)) {
    console.warn("Ignoring a Stripe subscription with an unrecognized price.", {
      subscriptionId: subscription.id,
    });
    return false;
  }

  const profileId = validProfileId(subscription.metadata.supabase_profile_id)
    ?? validProfileId(fallbackProfileId)
    ?? await findProfileIdForStripeCustomer(stripeCustomerId);

  if (!profileId) {
    console.warn("Ignoring a Stripe subscription that is not linked to a BetaManuscript profile.", {
      subscriptionId: subscription.id,
    });
    return false;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("sync_stripe_billing_subscription", {
    p_canceled_at: toIsoDate(subscription.canceled_at),
    p_cancel_at: toIsoDate(subscription.cancel_at),
    p_cancel_at_period_end: subscription.cancel_at_period_end,
    p_current_period_end: toIsoDate(getSubscriptionPeriodEnd(subscription)),
    p_ended_at: toIsoDate(subscription.ended_at),
    p_event_created_at: new Date(eventCreatedAt * 1_000).toISOString(),
    p_event_type: eventType,
    p_profile_id: profileId,
    p_status: subscription.status,
    p_stripe_customer_id: stripeCustomerId,
    p_stripe_event_id: eventId,
    p_stripe_price_id: stripePriceId,
    p_stripe_subscription_id: subscription.id,
  });

  if (error) {
    throw new Error("Unable to synchronize the subscription entitlement.");
  }

  return data;
}

export function getStripeSubscriptionId(invoice: Stripe.Invoice) {
  const subscription = invoice.parent?.subscription_details?.subscription;
  return stripeId(subscription ?? null);
}
