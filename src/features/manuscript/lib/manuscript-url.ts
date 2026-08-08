const manuscriptUrlKeyPattern = /^[a-f0-9]{12}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ManuscriptUrlIdentity = {
  id: string;
  title: string;
  urlKey: string;
};

export function getManuscriptReference({ title, urlKey }: Pick<ManuscriptUrlIdentity, "title" | "urlKey">) {
  return `${slugifyManuscriptTitle(title)}--${urlKey}`;
}

export function getReaderManuscriptPath(manuscript: Pick<ManuscriptUrlIdentity, "title" | "urlKey">) {
  return `/reader/${getManuscriptReference(manuscript)}`;
}

export function getManuscriptUrlKeyFromReference(reference: string | null) {
  if (!reference) return null;

  const urlKey = reference.split("--").at(-1)?.toLowerCase() ?? "";
  return manuscriptUrlKeyPattern.test(urlKey) ? urlKey : null;
}

export function findManuscriptByReference<T extends ManuscriptUrlIdentity>(
  manuscripts: T[],
  reference: string | null,
) {
  if (!reference) return null;

  if (uuidPattern.test(reference)) {
    return manuscripts.find((manuscript) => manuscript.id === reference) ?? null;
  }

  const urlKey = getManuscriptUrlKeyFromReference(reference);
  return urlKey
    ? manuscripts.find((manuscript) => manuscript.urlKey === urlKey) ?? null
    : null;
}

export function withManuscriptReference(
  searchParams: URLSearchParams,
  manuscript: Pick<ManuscriptUrlIdentity, "title" | "urlKey">,
) {
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  nextSearchParams.delete("manuscriptId");
  nextSearchParams.set("manuscript", getManuscriptReference(manuscript));
  return nextSearchParams;
}

function slugifyManuscriptTitle(title: string) {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

  return slug || "manuscript";
}
