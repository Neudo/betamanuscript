import "server-only";

import { createHash } from "node:crypto";

import { socialPlatforms, type SocialPlatform } from "@/features/account/domain/social-links";
import { getBlockAnnotationRanges } from "@/features/annotations/lib/multi-block-annotations";
import {
  normalizeRichText,
  type ManuscriptRichText,
} from "@/features/manuscript/lib/rich-text";
import type {
  ReaderAnnotation,
  ReaderAnnotationTag,
  ReaderChapterGeneralComment,
} from "@/features/reading/api/reading";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicReaderManuscript = {
  accessLinkId: string;
  author: {
    avatarUrl: string | null;
    bio: string;
    displayName: string;
    socialLinks: Array<{
      platform: SocialPlatform;
      url: string;
    }>;
    website: string | null;
  } | null;
  authorNote: string | null;
  chapters: Array<{
    blocks: Array<{
      annotations: ReaderAnnotation[];
      content: string;
      id: string;
      position: number;
      richContent: ManuscriptRichText;
    }>;
    generalComment: ReaderChapterGeneralComment | null;
    id: string;
    position: number;
    title: string;
  }>;
  coverUrl: string | null;
  deadline: string | null;
  genres: string[];
  logline: string | null;
  manuscriptId: string;
  readerNote: string | null;
  readingRoundId: string;
  tags: ReaderAnnotationTag[];
  title: string;
  versionId: string;
  versionNumber: number;
};

export type PublicReadingAccess = {
  isAuthenticated: boolean;
  manuscript: PublicReaderManuscript;
  readerAssignmentId: string | null;
};

type PublicLinkRow = {
  expires_at: string | null;
  reading_round_id: string;
};

type ReadingRoundRow = {
  access_mode: "invite_only" | "open_signup";
  id: string;
  manuscript_version_id: string;
  reader_note: string | null;
  reading_deadline: string | null;
  show_author_profile: boolean;
  status: "archived" | "closed" | "draft" | "open";
  welcome_message: string | null;
};

type ManuscriptVersionRow = {
  id: string;
  logline: string | null;
  manuscript_id: string;
  title: string;
  version_number: number;
};

type ManuscriptRow = {
  id: string;
  owner_id: string;
};

type ManuscriptCoverRow = {
  storage_bucket: string;
  storage_path: string;
};

function toHttpUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function publicReadingFingerprint(input: {
  forwardedFor: string | null;
  realIp: string | null;
  userAgent: string | null;
}) {
  const ip = input.forwardedFor?.split(",")[0]?.trim() || input.realIp?.trim() || "unknown";
  return createHash("sha256")
    .update(`${ip}\n${input.userAgent ?? "unknown"}`)
    .digest("hex");
}

export async function getPublicReadingAccess(
  accessLinkId: string,
  fingerprintHash: string,
  options: { includeReadingContent?: boolean } = {},
): Promise<PublicReadingAccess | null> {
  if (!isUuid(accessLinkId)) return null;

  const admin = createSupabaseAdminClient();
  const { data: isWithinRateLimit, error: rateLimitError } = await admin.rpc(
    "consume_public_reading_rate_limit",
    {
      p_fingerprint_hash: fingerprintHash,
      p_public_link_id: accessLinkId,
    },
  );

  if (rateLimitError || !isWithinRateLimit) return null;

  const { data: link, error: linkError } = await admin
    .from("reading_round_access_links")
    .select("reading_round_id, expires_at")
    .eq("id", accessLinkId)
    .is("revoked_at", null)
    .maybeSingle();

  if (linkError || !link || (link.expires_at && Date.parse(link.expires_at) <= Date.now())) {
    return null;
  }

  const publicLink = link as PublicLinkRow;
  const { data: readingRound, error: roundError } = await admin
    .from("reading_rounds")
    .select("id, manuscript_version_id, status, access_mode, reading_deadline, reader_note, welcome_message, show_author_profile")
    .eq("id", publicLink.reading_round_id)
    .eq("status", "open")
    .eq("access_mode", "open_signup")
    .maybeSingle();

  if (roundError || !readingRound) return null;

  const round = readingRound as ReadingRoundRow;
  const { data: version, error: versionError } = await admin
    .from("manuscript_versions")
    .select("id, manuscript_id, title, logline, version_number")
    .eq("id", round.manuscript_version_id)
    .is("archived_at", null)
    .maybeSingle();

  if (versionError || !version) return null;

  const manuscriptVersion = version as ManuscriptVersionRow;
  const { data: manuscript, error: manuscriptError } = await admin
    .from("manuscripts")
    .select("id, owner_id")
    .eq("id", manuscriptVersion.manuscript_id)
    .is("archived_at", null)
    .maybeSingle();

  if (manuscriptError || !manuscript) return null;

  const manuscriptRecord = manuscript as ManuscriptRow;
  const [chaptersResult, tagsResult, viewerResult, coverResult, genreRowsResult, author] = await Promise.all([
    options.includeReadingContent
      ? admin
        .from("manuscript_chapters")
        .select("id, position, title")
        .eq("manuscript_version_id", manuscriptVersion.id)
        .is("archived_at", null)
        .order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    options.includeReadingContent
      ? admin
        .from("manuscript_annotation_tags")
        .select("id, slug, label, color")
        .eq("manuscript_id", manuscriptVersion.manuscript_id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    getCurrentReaderAssignment(round.id),
    admin
      .from("manuscript_assets")
      .select("storage_bucket, storage_path")
      .eq("manuscript_version_id", manuscriptVersion.id)
      .eq("asset_kind", "cover")
      .eq("processing_status", "available")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("manuscript_version_genres")
      .select("genre_slug")
      .eq("manuscript_version_id", manuscriptVersion.id)
      .order("sort_order", { ascending: true }),
    round.show_author_profile
      ? getPublicAuthor(manuscriptRecord.owner_id)
      : Promise.resolve(null),
  ]);

  if (chaptersResult.error || tagsResult.error || coverResult.error || genreRowsResult.error) return null;

  const genreSlugs = (genreRowsResult.data ?? []).map((genre) => genre.genre_slug);
  const { data: genres, error: genresError } = genreSlugs.length > 0
    ? await admin.from("genres").select("label, slug").in("slug", genreSlugs)
    : { data: [], error: null };

  if (genresError) return null;

  const genreLabelsBySlug = new Map((genres ?? []).map((genre) => [genre.slug, genre.label]));
  const cover = coverResult.data as ManuscriptCoverRow | null;
  const coverUrl = cover
    ? (await admin.storage.from(cover.storage_bucket).createSignedUrl(cover.storage_path, 60 * 60)).data?.signedUrl ?? null
    : null;

  const chapters = chaptersResult.data ?? [];
  const chapterIds = chapters.map((chapter) => chapter.id);
  const { data: blocks, error: blocksError } = options.includeReadingContent && chapterIds.length > 0
    ? await admin
      .from("chapter_blocks")
      .select("id, chapter_id, position, content, rich_content")
      .in("chapter_id", chapterIds)
      .is("archived_at", null)
      .order("position", { ascending: true })
    : { data: [], error: null };

  if (blocksError) return null;

  const [annotationsResult, generalCommentsResult] = viewerResult.assignmentId && chapterIds.length > 0
    ? await Promise.all([
      admin
        .from("annotations")
        .select(`
          id,
          chapter_id,
          chapter_block_id,
          tag_id,
          quote,
          selection_start,
          selection_end,
          selection_end_chapter_block_id,
          selection_end_offset,
          context_before,
          context_after,
          comment
        `)
        .eq("reader_assignment_id", viewerResult.assignmentId)
        .in("chapter_id", chapterIds)
        .is("archived_at", null),
      admin
        .from("chapter_general_comments")
        .select("id, chapter_id, comment")
        .eq("reader_assignment_id", viewerResult.assignmentId)
        .in("chapter_id", chapterIds)
        .is("archived_at", null),
    ])
    : [
      { data: [], error: null },
      { data: [], error: null },
    ];

  if (annotationsResult.error || generalCommentsResult.error) return null;

  const tagsById = new Map((tagsResult.data ?? []).map((tag) => [tag.id, tag]));
  const annotationsByChapter = new Map<string, ReaderAnnotation[]>();
  const generalCommentsByChapter = new Map<string, ReaderChapterGeneralComment>();

  for (const generalComment of generalCommentsResult.data ?? []) {
    generalCommentsByChapter.set(generalComment.chapter_id, {
      comment: generalComment.comment,
      id: generalComment.id,
    });
  }

  for (const annotation of annotationsResult.data ?? []) {
    const tag = tagsById.get(annotation.tag_id);
    const chapterAnnotations = annotationsByChapter.get(annotation.chapter_id) ?? [];

    chapterAnnotations.push({
      chapterBlockId: annotation.chapter_block_id,
      chapterId: annotation.chapter_id,
      comment: annotation.comment,
      contextAfter: annotation.context_after,
      contextBefore: annotation.context_before,
      id: annotation.id,
      quote: annotation.quote,
      selectionEnd: annotation.selection_end,
      selectionEndChapterBlockId: annotation.selection_end_chapter_block_id,
      selectionEndOffset: annotation.selection_end_offset,
      selectionStart: annotation.selection_start,
      tag: {
        color: tag?.color ?? "#6B7280",
        id: annotation.tag_id,
        label: tag?.label ?? "Unknown tag",
        slug: tag?.slug ?? "unknown",
      },
    });
    annotationsByChapter.set(annotation.chapter_id, chapterAnnotations);
  }

  const blocksByChapter = new Map<string, Array<{
    content: string;
    id: string;
    position: number;
    richContent: ManuscriptRichText;
  }>>();
  for (const block of blocks ?? []) {
    const chapterBlocks = blocksByChapter.get(block.chapter_id) ?? [];
    chapterBlocks.push({
      content: block.content,
      id: block.id,
      position: block.position,
      richContent: normalizeRichText(block.rich_content, block.content),
    });
    blocksByChapter.set(block.chapter_id, chapterBlocks);
  }

  return {
    manuscript: {
      accessLinkId,
      author,
      authorNote: round.welcome_message,
      chapters: chapters.map((chapter) => {
        const chapterBlocks = blocksByChapter.get(chapter.id) ?? [];
        const chapterAnnotations = annotationsByChapter.get(chapter.id) ?? [];

        return {
          blocks: chapterBlocks.map((block) => ({
            ...block,
            annotations: getBlockAnnotationRanges(chapterBlocks, block, chapterAnnotations),
          })),
          generalComment: generalCommentsByChapter.get(chapter.id) ?? null,
          id: chapter.id,
          position: chapter.position,
          title: chapter.title,
        };
      }),
      coverUrl,
      deadline: round.reading_deadline,
      genres: genreSlugs.flatMap((slug) => {
        const label = genreLabelsBySlug.get(slug);
        return label ? [label] : [];
      }),
      logline: manuscriptVersion.logline,
      manuscriptId: manuscriptVersion.manuscript_id,
      readerNote: round.reader_note,
      readingRoundId: round.id,
      tags: tagsResult.data ?? [],
      title: manuscriptVersion.title,
      versionId: manuscriptVersion.id,
      versionNumber: manuscriptVersion.version_number,
    },
    isAuthenticated: viewerResult.isAuthenticated,
    readerAssignmentId: viewerResult.assignmentId,
  };
}

async function getPublicAuthor(profileId: string): Promise<PublicReaderManuscript["author"]> {
  const admin = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("avatar_path, bio, display_name, website")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError || !profile) return null;

  const { data: socialLinks, error: socialLinksError } = await admin
    .from("profile_social_links")
    .select("platform, url")
    .eq("profile_id", profileId);

  if (socialLinksError) return null;

  const avatarUrl = profile.avatar_path
    ? (await admin.storage.from("profile-avatars").createSignedUrl(profile.avatar_path, 60 * 60)).data?.signedUrl ?? null
    : null;

  return {
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

async function getCurrentReaderAssignment(readingRoundId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { assignmentId: null, isAuthenticated: false };
  }

  const { data } = await supabase
    .from("reader_assignments")
    .select("id")
    .eq("reading_round_id", readingRoundId)
    .eq("reader_profile_id", user.id)
    .in("status", ["started", "completed"])
    .maybeSingle();

  return { assignmentId: data?.id ?? null, isAuthenticated: true };
}
