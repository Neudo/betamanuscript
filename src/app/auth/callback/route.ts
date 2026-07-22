import { NextResponse } from "next/server";

import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const safeNext = getSafeInternalPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) {
          const response = NextResponse.redirect(
            new URL(safeNext ?? getWorkspaceHome(profile.role), url.origin),
          );
          response.headers.set("Cache-Control", "private, no-store");
          return response;
        }
      }
    }
  }

  const response = NextResponse.redirect(
    new URL("/login?error=confirmation", url.origin),
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
