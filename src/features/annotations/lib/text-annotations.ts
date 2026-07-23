export const MULTIPLE_ANNOTATIONS_COLOR = "#6D5E9C";

export type TextAnnotationRange = {
  id: string;
  selectionEnd: number;
  selectionStart: number;
  tag: {
    color: string;
    label: string;
    slug?: string;
  };
};

export type TextAnnotationGroup<T extends TextAnnotationRange> = {
  annotations: T[];
  color: string;
  end: number;
  hasMultipleTags: boolean;
  key: string;
  start: number;
};

export type TextAnnotationSegment<T extends TextAnnotationRange> = {
  content: string;
  group?: TextAnnotationGroup<T>;
  key: string;
};

function getTagIdentity(annotation: TextAnnotationRange) {
  return annotation.tag.slug ?? annotation.tag.label;
}

/**
 * Groups annotations that point to the exact same text range. A group with
 * different tag identities deliberately uses the neutral multiple-comment
 * color instead of choosing one reader's tag over another.
 */
export function groupTextAnnotations<T extends TextAnnotationRange>(
  content: string,
  annotations: T[],
): TextAnnotationGroup<T>[] {
  const groups = new Map<string, T[]>();

  for (const annotation of annotations) {
    if (
      annotation.selectionStart < 0
      || annotation.selectionEnd > content.length
      || annotation.selectionStart >= annotation.selectionEnd
    ) {
      continue;
    }

    const key = `${annotation.selectionStart}:${annotation.selectionEnd}`;
    const group = groups.get(key) ?? [];
    group.push(annotation);
    groups.set(key, group);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const [start, end] = key.split(":").map(Number);
      const tagIdentities = new Set(group.map(getTagIdentity));
      const hasMultipleTags = tagIdentities.size > 1;

      return {
        annotations: group,
        color: hasMultipleTags ? MULTIPLE_ANNOTATIONS_COLOR : group[0].tag.color,
        end,
        hasMultipleTags,
        key,
        start,
      };
    })
    .sort((left, right) => left.start - right.start || left.end - right.end);
}

/**
 * Produces safe, non-overlapping fragments for inline rendering. Exact ranges
 * are already grouped above; partially overlapping ranges keep the earliest
 * anchor visible instead of producing invalid nested interactive elements.
 */
export function getTextAnnotationSegments<T extends TextAnnotationRange>(
  content: string,
  annotations: T[],
): TextAnnotationSegment<T>[] {
  const groups = groupTextAnnotations(content, annotations);
  const segments: TextAnnotationSegment<T>[] = [];
  let cursor = 0;

  for (const group of groups) {
    if (group.start < cursor) continue;

    if (group.start > cursor) {
      segments.push({
        content: content.slice(cursor, group.start),
        key: `text:${cursor}:${group.start}`,
      });
    }

    segments.push({
      content: content.slice(group.start, group.end),
      group,
      key: `annotation:${group.key}`,
    });
    cursor = group.end;
  }

  if (cursor < content.length) {
    segments.push({
      content: content.slice(cursor),
      key: `text:${cursor}:${content.length}`,
    });
  }

  return segments;
}

export function annotationBackgroundColor(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? `${color}2E` : "hsl(var(--primary) / 0.16)";
}
