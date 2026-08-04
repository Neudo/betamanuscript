import {
  deleteAccountData,
  deleteAuthenticationUser,
} from "@/features/settings/server/delete-account";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

function hasValidRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : new URL(request.url).origin;

  return origin === appOrigin
    && request.headers.get("x-requested-with") === "XMLHttpRequest";
}

export async function DELETE(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return errorResponse("This account deletion request could not be verified.", 403);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse("Sign in to delete your account.", 401);
  }

  try {
    await deleteAccountData({ email: user.email ?? null, userId: user.id });

    const { error: signOutError } = await supabase.auth.signOut({ scope: "global" });

    if (signOutError) {
      throw new Error("Unable to revoke active sessions.");
    }

    await deleteAuthenticationUser(user.id);

    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Account deletion failed", error);
    return errorResponse("Unable to delete your account. Please try again.", 500);
  }
}
