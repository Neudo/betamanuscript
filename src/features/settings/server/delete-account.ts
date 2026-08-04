import "server-only";

import { getStripeClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ACCOUNT_STORAGE_BUCKETS = [
  "profile-avatars",
  "manuscript-covers",
  "manuscript-sources",
] as const;
const STORAGE_BATCH_SIZE = 1_000;

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

function uniquePaths(paths: string[]) {
  return [...new Set(paths)];
}

function isMissingStripeCustomer(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: unknown; param?: unknown };
  return candidate.code === "resource_missing" && candidate.param === "customer";
}

async function listStoragePaths({
  bucket,
  client,
  prefix,
}: {
  bucket: string;
  client: SupabaseAdminClient;
  prefix: string;
}) {
  const paths: string[] = [];

  async function visit(path: string) {
    let offset = 0;

    while (true) {
      const { data, error } = await client.storage.from(bucket).list(path, {
        limit: STORAGE_BATCH_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) {
        throw new Error(`Unable to list account files in ${bucket}.`);
      }

      const entries = data ?? [];

      for (const entry of entries) {
        const entryPath = path ? `${path}/${entry.name}` : entry.name;

        if (entry.id === null) {
          await visit(entryPath);
        } else {
          paths.push(entryPath);
        }
      }

      if (entries.length < STORAGE_BATCH_SIZE) {
        return;
      }

      offset += entries.length;
    }
  }

  await visit(prefix);
  return paths;
}

async function removeStoragePaths({
  bucket,
  client,
  paths,
}: {
  bucket: string;
  client: SupabaseAdminClient;
  paths: string[];
}) {
  for (let index = 0; index < paths.length; index += STORAGE_BATCH_SIZE) {
    const { error } = await client.storage
      .from(bucket)
      .remove(paths.slice(index, index + STORAGE_BATCH_SIZE));

    if (error) {
      throw new Error(`Unable to delete account files from ${bucket}.`);
    }
  }
}

async function deleteAccountStorage({
  avatarPath,
  client,
  userId,
}: {
  avatarPath: string | null;
  client: SupabaseAdminClient;
  userId: string;
}) {
  await Promise.all(
    ACCOUNT_STORAGE_BUCKETS.map(async (bucket) => {
      const paths = await listStoragePaths({ bucket, client, prefix: userId });

      if (bucket === "profile-avatars" && avatarPath) {
        paths.push(avatarPath);
      }

      await removeStoragePaths({
        bucket,
        client,
        paths: uniquePaths(paths),
      });
    }),
  );
}

async function deleteStripeCustomer(client: SupabaseAdminClient, userId: string) {
  const { data: customer, error: customerError } = await client
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (customerError) {
    throw new Error("Unable to load billing information.");
  }

  if (!customer) {
    return;
  }

  try {
    await getStripeClient().customers.del(customer.stripe_customer_id);
  } catch (error) {
    if (!isMissingStripeCustomer(error)) {
      throw new Error("Unable to cancel the billing subscription.");
    }
  }
}

export async function deleteAccountData({
  email,
  userId,
}: {
  email: string | null;
  userId: string;
}) {
  const client = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("avatar_path")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error("Unable to load account data.");
  }

  const { error: accountDataError } = await client.rpc("delete_account_data", {
    p_email: email ?? "",
    p_user_id: userId,
  });

  if (accountDataError) {
    throw new Error("Unable to delete account data.");
  }

  await deleteAccountStorage({
    avatarPath: profile?.avatar_path ?? null,
    client,
    userId,
  });
  await deleteStripeCustomer(client, userId);
}

export async function deleteAuthenticationUser(userId: string) {
  const { error } = await createSupabaseAdminClient().auth.admin.deleteUser(userId);

  if (error) {
    throw new Error("Unable to delete the account login.");
  }
}
