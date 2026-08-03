import { z } from "zod";

import { socialPlatforms, type SocialPlatform } from "@/features/account/domain/social-links";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  assignmentId: z.string().uuid(),
});

function errorResponse(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

function toHttpUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const parsedQuery = querySchema.safeParse({
    assignmentId: new URL(request.url).searchParams.get("assignmentId"),
  });

  if (!parsedQuery.success) {
    return errorResponse("Invalid manuscript details request.", 400);
  }

  const account = await getAuthenticatedAccount();
  if (!account) {
    return errorResponse("You need to sign in to view manuscript details.", 401);
  }

  const admin = createSupabaseAdminClient();
  const { data: assignment, error: assignmentError } = await admin
    .from("reader_assignments")
    .select("id, reading_round_id")
    .eq("id", parsedQuery.data.assignmentId)
    .eq("reader_profile_id", account.id)
    .neq("status", "revoked")
    .maybeSingle();

  if (assignmentError) {
    console.error("Unable to load reader assignment for manuscript details", assignmentError);
    return errorResponse("Manuscript details are unavailable right now.", 500);
  }

  if (!assignment) {
    return errorResponse("This manuscript is unavailable.", 404);
  }

  const { data: readingRound, error: readingRoundError } = await admin
    .from("reading_rounds")
    .select("manuscript_version_id, reading_deadline, reader_note, show_author_profile, status, welcome_message")
    .eq("id", assignment.reading_round_id)
    .neq("status", "archived")
    .maybeSingle();

  if (readingRoundError) {
    console.error("Unable to load reading round for manuscript details", readingRoundError);
    return errorResponse("Manuscript details are unavailable right now.", 500);
  }

  if (!readingRound) {
    return errorResponse("This manuscript is unavailable.", 404);
  }

  const { data: version, error: versionError } = await admin
    .from("manuscript_versions")
    .select("id, logline, manuscript_id")
    .eq("id", readingRound.manuscript_version_id)
    .is("archived_at", null)
    .maybeSingle();

  if (versionError) {
    console.error("Unable to load manuscript version for manuscript details", versionError);
    return errorResponse("Manuscript details are unavailable right now.", 500);
  }

  if (!version) {
    return errorResponse("This manuscript is unavailable.", 404);
  }

  const { data: manuscript, error: manuscriptError } = await admin
    .from("manuscripts")
    .select("owner_id")
    .eq("id", version.manuscript_id)
    .is("archived_at", null)
    .maybeSingle();

  if (manuscriptError) {
    console.error("Unable to load manuscript owner for manuscript details", manuscriptError);
    return errorResponse("Manuscript details are unavailable right now.", 500);
  }

  if (!manuscript) {
    return errorResponse("This manuscript is unavailable.", 404);
  }

  const { data: manuscriptGenres, error: manuscriptGenresError } = await admin
    .from("manuscript_version_genres")
    .select("genre_slug")
    .eq("manuscript_version_id", version.id)
    .order("sort_order", { ascending: true });

  if (manuscriptGenresError) {
    console.error("Unable to load manuscript genres for manuscript details", manuscriptGenresError);
    return errorResponse("Manuscript details are unavailable right now.", 500);
  }

  const genreSlugs = (manuscriptGenres ?? []).map((genre) => genre.genre_slug);
  const { data: genres, error: genresError } = genreSlugs.length > 0
    ? await admin.from("genres").select("label, slug").in("slug", genreSlugs)
    : { data: [], error: null };

  if (genresError) {
    console.error("Unable to load genre labels for manuscript details", genresError);
    return errorResponse("Manuscript details are unavailable right now.", 500);
  }

  const genreLabelsBySlug = new Map((genres ?? []).map((genre) => [genre.slug, genre.label]));
  const genresInOrder = genreSlugs.flatMap((slug) => {
    const label = genreLabelsBySlug.get(slug);
    return label ? [label] : [];
  });

  let author = null;

  if (readingRound.show_author_profile) {
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("avatar_path, bio, display_name, website")
      .eq("id", manuscript.owner_id)
      .maybeSingle();

    if (profileError) {
      console.error("Unable to load author profile for manuscript details", profileError);
      return errorResponse("Manuscript details are unavailable right now.", 500);
    }

    if (profile) {
      const { data: socialLinks, error: socialLinksError } = await admin
        .from("profile_social_links")
        .select("platform, url")
        .eq("profile_id", manuscript.owner_id);

      if (socialLinksError) {
        console.error("Unable to load author social links for manuscript details", socialLinksError);
        return errorResponse("Manuscript details are unavailable right now.", 500);
      }

      const avatarUrl = profile.avatar_path
        ? (await admin.storage.from("profile-avatars").createSignedUrl(profile.avatar_path, 60 * 60)).data?.signedUrl ?? null
        : null;

      author = {
        avatarUrl,
        bio: profile.bio ?? "",
        displayName: profile.display_name,
        socialLinks: (socialLinks ?? []).flatMap((link) => {
          const url = toHttpUrl(link.url);
          return url && socialPlatforms.includes(link.platform as SocialPlatform)
            ? [{ platform: link.platform as SocialPlatform, url }]
            : [];
        }),
        website: toHttpUrl(profile.website),
      };
    }
  }

  return Response.json(
    {
      ok: true,
      details: {
        author,
        authorNote: readingRound.welcome_message,
        deadline: readingRound.reading_deadline,
        genres: genresInOrder,
        logline: version.logline,
        readerNote: readingRound.reader_note,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
