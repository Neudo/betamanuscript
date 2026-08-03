type AnnotationTagColor = {
  color: string;
  slug?: string;
};

const defaultTagColorTokens: Record<string, { sourceColors: string[]; token: string }> = {
  confusing: { sourceColors: ["#8A6D1D", "#B45309"], token: "hsl(var(--annotation-tag-confusing))" },
  pacing: { sourceColors: ["#8A6D1D", "#9333EA"], token: "hsl(var(--annotation-tag-pacing))" },
  "missing-context": { sourceColors: ["#8A6D1D", "#0F766E"], token: "hsl(var(--annotation-tag-missing-context))" },
  "strong-line": { sourceColors: ["#2C3E2D"], token: "hsl(var(--annotation-tag-strong-line))" },
  "emotional-impact": { sourceColors: ["#7B1D1D"], token: "hsl(var(--annotation-tag-emotional-impact))" },
  character: { sourceColors: ["#3B4A8A"], token: "hsl(var(--annotation-tag-character))" },
  worldbuilding: { sourceColors: ["#3B4A8A"], token: "hsl(var(--annotation-tag-worldbuilding))" },
  prose: { sourceColors: ["#2C3E2D"], token: "hsl(var(--annotation-tag-prose))" },
  other: { sourceColors: ["#6B7280"], token: "hsl(var(--annotation-tag-other))" },
  __general_annotation__: { sourceColors: [], token: "hsl(var(--annotation-tag-general))" },
};

function getDefaultAnnotationTagToken(tag: AnnotationTagColor) {
  if (!tag.slug) return null;

  const definition = defaultTagColorTokens[tag.slug];
  if (!definition) return null;
  if (tag.slug === "__general_annotation__") return definition.token;

  return definition.sourceColors.some((color) => color.toLowerCase() === tag.color.toLowerCase())
    ? definition.token
    : null;
}

export function isDefaultAnnotationTag(tag: AnnotationTagColor) {
  return getDefaultAnnotationTagToken(tag) !== null;
}

export function getAnnotationTagColor(tag: AnnotationTagColor) {
  return getDefaultAnnotationTagToken(tag) ?? tag.color;
}

export function getAnnotationTagTint(tag: AnnotationTagColor, percentage: number) {
  return `color-mix(in srgb, ${getAnnotationTagColor(tag)} ${percentage}%, transparent)`;
}
