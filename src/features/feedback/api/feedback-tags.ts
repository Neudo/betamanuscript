import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type ManuscriptAnnotationTag = {
  color: string;
  id: string;
  isActive: boolean;
  label: string;
  manuscriptId: string;
  slug: string;
  sortOrder: number;
};

type ManuscriptAnnotationTagRow = {
  color: string;
  id: string;
  is_active: boolean;
  label: string;
  manuscript_id: string;
  slug: string;
  sort_order: number;
};

const hexColorPattern = /^#[0-9a-f]{6}$/i;

export async function getManuscriptAnnotationTags(
  manuscriptId: string,
): Promise<ManuscriptAnnotationTag[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("manuscript_annotation_tags")
    .select("id, manuscript_id, slug, label, color, sort_order, is_active")
    .eq("manuscript_id", manuscriptId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as ManuscriptAnnotationTagRow[]).map(toTag);
}

export async function createManuscriptAnnotationTag({
  color,
  label,
  manuscriptId,
}: {
  color: string;
  label: string;
  manuscriptId: string;
}) {
  const normalizedLabel = label.trim();
  const normalizedColor = normalizeColor(color);
  if (!normalizedLabel || normalizedLabel.length > 80) {
    throw new Error("A tag name must contain between 1 and 80 characters.");
  }

  const supabase = createSupabaseBrowserClient();
  const { data: existingRows, error: existingError } = await supabase
    .from("manuscript_annotation_tags")
    .select("slug, label, sort_order")
    .eq("manuscript_id", manuscriptId);

  if (existingError) throw new Error(existingError.message);

  const existing = existingRows ?? [];
  if (existing.some((tag) => tag.label.localeCompare(normalizedLabel, undefined, { sensitivity: "accent" }) === 0)) {
    throw new Error("A tag with this name already exists for this manuscript.");
  }

  const sortOrder = Math.max(0, ...existing.map((tag) => tag.sort_order)) + 1;
  if (sortOrder > 32_767) throw new Error("You have reached the maximum number of tags.");

  const slug = uniqueSlug(slugify(normalizedLabel), new Set(existing.map((tag) => tag.slug)));
  const { data, error } = await supabase
    .from("manuscript_annotation_tags")
    .insert({
      color: normalizedColor,
      is_active: true,
      label: normalizedLabel,
      manuscript_id: manuscriptId,
      slug,
      sort_order: sortOrder,
    })
    .select("id, manuscript_id, slug, label, color, sort_order, is_active")
    .single();

  if (error) throw new Error(error.message);
  return toTag(data as ManuscriptAnnotationTagRow);
}

export async function updateManuscriptAnnotationTagColor({
  color,
  manuscriptId,
  tagId,
}: {
  color: string;
  manuscriptId: string;
  tagId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("manuscript_annotation_tags")
    .update({ color: normalizeColor(color) })
    .eq("id", tagId)
    .eq("manuscript_id", manuscriptId);

  if (error) throw new Error(error.message);
}

export async function setManuscriptAnnotationTagActive({
  isActive,
  manuscriptId,
  tagId,
}: {
  isActive: boolean;
  manuscriptId: string;
  tagId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("manuscript_annotation_tags")
    .update({ is_active: isActive })
    .eq("id", tagId)
    .eq("manuscript_id", manuscriptId);

  if (error) throw new Error(error.message);
}

function toTag(row: ManuscriptAnnotationTagRow): ManuscriptAnnotationTag {
  return {
    color: row.color,
    id: row.id,
    isActive: row.is_active,
    label: row.label,
    manuscriptId: row.manuscript_id,
    slug: row.slug,
    sortOrder: row.sort_order,
  };
}

function normalizeColor(value: string) {
  const color = value.trim();
  if (!hexColorPattern.test(color)) throw new Error("Choose a valid six-digit hex color.");
  return color.toUpperCase();
}

function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "tag";
}

function uniqueSlug(baseSlug: string, existingSlugs: Set<string>) {
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}
