import { z } from "zod";

import { canWrite } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import { createBillingCheckout } from "@/features/billing/server/billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const checkoutSchema = z.object({
  interval: z.enum(["monthly", "yearly"]),
});

function errorResponse(message: string, status: number) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
  let payload: z.infer<typeof checkoutSchema>;

  try {
    payload = checkoutSchema.parse(await request.json());
  } catch {
    return errorResponse("Choose a valid billing interval.", 400);
  }

  const account = await getAuthenticatedAccount();

  if (!account) {
    return errorResponse("You need to sign in before choosing a plan.", 401);
  }

  if (account.role === null || !canWrite(account.role)) {
    return errorResponse("Only writer workspaces can subscribe to Pro.", 403);
  }

  try {
    const checkout = await createBillingCheckout({
      account,
      interval: payload.interval,
      request,
    });

    return Response.json({ ok: true, url: checkout.url });
  } catch (error) {
    console.error("Stripe checkout creation failed", error);
    return errorResponse("Unable to start secure checkout. Please try again.", 502);
  }
}
