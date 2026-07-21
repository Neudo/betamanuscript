import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const safeNext =
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : null;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data } = await supabase.auth.getUser();
      const role = data.user?.user_metadata.role;
      const roleHome = role === "reader" ? "/reader" : "/dashboard";

      return NextResponse.redirect(new URL(safeNext ?? roleHome, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/signup?error=confirmation", url.origin));
}
