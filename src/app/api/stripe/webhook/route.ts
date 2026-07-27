import type Stripe from "stripe";

import {
  getStripeSubscriptionId,
  syncStripeSubscription,
} from "@/features/billing/server/billing";
import { getStripeClient } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function stripeResourceId(resource: string | { id: string } | null) {
  if (!resource) {
    return null;
  }

  return typeof resource === "string" ? resource : resource.id;
}

async function syncSubscriptionFromEvent({
  event,
  fallbackProfileId,
  subscription,
}: {
  event: Stripe.Event;
  fallbackProfileId?: string | null;
  subscription: Stripe.Subscription;
}) {
  await syncStripeSubscription({
    eventCreatedAt: event.created,
    eventId: event.id,
    eventType: event.type,
    fallbackProfileId,
    subscription,
  });
}

async function handleEvent(event: Stripe.Event) {
  const stripe = getStripeClient();

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = stripeResourceId(session.subscription);

      if (!subscriptionId || session.mode !== "subscription") {
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscriptionFromEvent({
        event,
        fallbackProfileId: session.client_reference_id ?? session.metadata?.supabase_profile_id,
        subscription,
      });
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscriptionFromEvent({
        event,
        subscription: event.data.object as Stripe.Subscription,
      });
      return;
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = getStripeSubscriptionId(invoice);

      if (!subscriptionId) {
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscriptionFromEvent({ event, subscription });
      return;
    }

    default:
      return;
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return Response.json({ ok: false, error: "Webhook signature verification is not configured." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch {
    return Response.json({ ok: false, error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (error) {
    console.error("Stripe webhook processing failed", {
      eventId: event.id,
      eventType: event.type,
      error,
    });
    return Response.json({ ok: false }, { status: 500 });
  }

  return Response.json({ ok: true });
}
