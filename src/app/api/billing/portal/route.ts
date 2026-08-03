import { canWrite } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import { createBillingPortal } from "@/features/billing/server/billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
  const account = await getAuthenticatedAccount();

  if (!account) {
    return errorResponse("You need to sign in before managing your plan.", 401);
  }

  if (account.role === null || !canWrite(account.role)) {
    return errorResponse("Only writer workspaces can manage a Pro subscription.", 403);
  }

  try {
    const portal = await createBillingPortal({ account, request });
    return Response.json({ ok: true, url: portal.url });
  } catch (error) {
    console.error("Stripe billing portal creation failed", error);
    return errorResponse("Unable to open subscription management. Please try again.", 502);
  }
}
