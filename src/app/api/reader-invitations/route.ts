import { createHash, randomBytes } from "node:crypto";

import { z } from "zod";

import { sendReaderInvitationEmail } from "@/features/readers/server/invitation-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const invitationSchema = z.object({
  personalNote: z.string().trim().max(4000).optional().default(""),
  readingRoundId: z.string().uuid(),
  recipientEmail: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
});

function errorResponse(message: string, status: number) {
  return Response.json({ ok: false, error: message }, { status });
}

function invitationOrigin(request: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredOrigin) {
    return new URL(configuredOrigin).origin;
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  let payload: z.infer<typeof invitationSchema>;

  try {
    payload = invitationSchema.parse(await request.json());
  } catch {
    return errorResponse("Invalid invitation details.", 400);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse("You need to sign in before inviting a reader.", 401);
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenDigest = createHash("sha256").update(rawToken).digest("hex");
  const { data, error } = await supabase.rpc("create_reading_invitation", {
    p_personal_note: payload.personalNote,
    p_reading_round_id: payload.readingRoundId,
    p_recipient_email: payload.recipientEmail,
    p_token_digest: tokenDigest,
  });

  if (error) {
    const status = error.code === "23505" ? 409 : 400;
    return errorResponse(error.message, status);
  }

  const invitation = data?.[0];
  if (!invitation) {
    return errorResponse("The invitation could not be created.", 500);
  }

  const inviteUrl = new URL("/invite/reader", invitationOrigin(request));
  inviteUrl.searchParams.set("token", rawToken);

  try {
    await sendReaderInvitationEmail({
      idempotencyKey: `reader-invitation/${invitation.invitation_id}/${tokenDigest.slice(0, 16)}`,
      inviteUrl: inviteUrl.toString(),
      personalNote: payload.personalNote || null,
      recipientEmail: payload.recipientEmail,
    });

    const { error: sentAtError } = await supabase
      .from("reading_invitations")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", invitation.invitation_id);

    if (sentAtError) {
      console.error("Reader invitation sent_at update failed", sentAtError);
    }
  } catch (emailError) {
    console.error("Reader invitation email failed", emailError);
    return errorResponse(
      "The invitation was created, but the email could not be sent. Use Resend from the readers list to retry.",
      502,
    );
  }

  return Response.json({
    expiresAt: invitation.expires_at,
    invitationId: invitation.invitation_id,
    ok: true,
  });
}
