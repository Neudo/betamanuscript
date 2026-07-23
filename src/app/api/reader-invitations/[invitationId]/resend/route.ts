import { createHash, randomBytes } from "node:crypto";

import { z } from "zod";

import { sendReaderInvitationEmail } from "@/features/readers/server/invitation-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ResendReaderInvitationRouteProps = {
  params: Promise<{ invitationId: string }>;
};

function invitationOrigin(request: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;
  return configuredOrigin
    ? new URL(configuredOrigin).origin
    : new URL(request.url).origin;
}

export async function POST(
  request: Request,
  { params }: ResendReaderInvitationRouteProps,
) {
  const { invitationId } = await params;
  if (!z.string().uuid().safeParse(invitationId).success) {
    return Response.json({ ok: false, error: "Invalid invitation." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ ok: false, error: "Sign in before resending an invitation." }, { status: 401 });
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenDigest = createHash("sha256").update(rawToken).digest("hex");
  const { data, error } = await supabase.rpc("renew_reading_invitation", {
    p_invitation_id: invitationId,
    p_token_digest: tokenDigest,
  });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 400 });
  }

  const invitation = data?.[0];
  if (!invitation) {
    return Response.json({ ok: false, error: "The invitation could not be renewed." }, { status: 500 });
  }

  const inviteUrl = new URL("/invite/reader", invitationOrigin(request));
  inviteUrl.searchParams.set("token", rawToken);

  try {
    await sendReaderInvitationEmail({
      idempotencyKey: `reader-invitation/${invitationId}/${tokenDigest.slice(0, 16)}`,
      inviteUrl: inviteUrl.toString(),
      personalNote: invitation.personal_note,
      recipientEmail: invitation.recipient_email,
    });

    const { error: sentAtError } = await supabase
      .from("reading_invitations")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", invitationId);

    if (sentAtError) {
      console.error("Reader invitation sent_at update failed", sentAtError);
    }
  } catch (emailError) {
    console.error("Reader invitation resend failed", emailError);
    return Response.json(
      { ok: false, error: "The invitation was renewed, but the email could not be sent." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, expiresAt: invitation.expires_at });
}
