export type AnnotationAnchor = {
  chapterBlockId: string;
  selectionEnd: number;
  selectionEndChapterBlockId: string | null;
  selectionEndOffset: number | null;
  selectionStart: number;
};

export type TextBlock = {
  content: string;
  id: string;
};

export type MultiBlockTextSelection = AnnotationAnchor & {
  contextAfter: string | null;
  contextBefore: string | null;
  quote: string;
};

const CONTEXT_LENGTH = 180;

export function getBlockAnnotationRanges<T extends AnnotationAnchor>(
  blocks: TextBlock[],
  block: TextBlock,
  annotations: T[],
): T[] {
  const blockIndex = blocks.findIndex((item) => item.id === block.id);
  if (blockIndex === -1) return [];

  return annotations.flatMap((annotation) => {
    const startBlockIndex = blocks.findIndex((item) => item.id === annotation.chapterBlockId);
    const endBlockId = annotation.selectionEndChapterBlockId ?? annotation.chapterBlockId;
    const endBlockIndex = blocks.findIndex((item) => item.id === endBlockId);

    if (startBlockIndex === -1 || endBlockIndex === -1 || endBlockIndex < startBlockIndex) {
      return [];
    }

    if (blockIndex < startBlockIndex || blockIndex > endBlockIndex) return [];

    const selectionStart = blockIndex === startBlockIndex ? annotation.selectionStart : 0;
    const selectionEnd = blockIndex === endBlockIndex
      ? annotation.selectionEndOffset ?? annotation.selectionEnd
      : block.content.length;

    if (selectionStart < 0 || selectionEnd > block.content.length || selectionStart >= selectionEnd) {
      return [];
    }

    return [{ ...annotation, selectionEnd, selectionStart }];
  });
}

export function getAnnotationEndAnchor<T extends AnnotationAnchor>(annotation: T) {
  return {
    chapterBlockId: annotation.selectionEndChapterBlockId ?? annotation.chapterBlockId,
    selectionEnd: annotation.selectionEndOffset ?? annotation.selectionEnd,
  };
}

export function createMultiBlockTextSelection({
  blocks,
  endBlockId,
  rawSelectionEnd,
  rawSelectionStart,
  startBlockId,
}: {
  blocks: TextBlock[];
  endBlockId: string;
  rawSelectionEnd: number;
  rawSelectionStart: number;
  startBlockId: string;
}): MultiBlockTextSelection | null {
  const initialStartBlockIndex = blocks.findIndex((block) => block.id === startBlockId);
  const initialEndBlockIndex = blocks.findIndex((block) => block.id === endBlockId);

  if (
    initialStartBlockIndex === -1
    || initialEndBlockIndex === -1
    || initialEndBlockIndex < initialStartBlockIndex
  ) {
    return null;
  }

  let startBlockIndex = initialStartBlockIndex;
  let endBlockIndex = initialEndBlockIndex;
  let selectionStart = clampOffset(blocks[startBlockIndex].content, rawSelectionStart);
  let selectionEnd = clampOffset(blocks[endBlockIndex].content, rawSelectionEnd);

  while (startBlockIndex <= endBlockIndex) {
    const startBlock = blocks[startBlockIndex];
    const startOffset = startBlockIndex === initialStartBlockIndex ? selectionStart : 0;
    const endOffset = startBlockIndex === initialEndBlockIndex
      ? selectionEnd
      : startBlock.content.length;
    const firstNonWhitespaceOffset = startBlock.content.slice(startOffset, endOffset).search(/\S/);

    if (firstNonWhitespaceOffset !== -1) {
      selectionStart = startOffset + firstNonWhitespaceOffset;
      break;
    }

    startBlockIndex += 1;
  }

  while (endBlockIndex >= startBlockIndex) {
    const endBlock = blocks[endBlockIndex];
    const startOffset = endBlockIndex === initialStartBlockIndex ? selectionStart : 0;
    const endOffset = endBlockIndex === initialEndBlockIndex
      ? selectionEnd
      : endBlock.content.length;
    const selectedText = endBlock.content.slice(startOffset, endOffset);
    const trailingWhitespaceLength = selectedText.length - selectedText.trimEnd().length;

    if (selectedText.length > trailingWhitespaceLength) {
      selectionEnd = endOffset - trailingWhitespaceLength;
      break;
    }

    endBlockIndex -= 1;
  }

  if (startBlockIndex > endBlockIndex) return null;

  const startBlock = blocks[startBlockIndex];
  const endBlock = blocks[endBlockIndex];
  const isMultiBlock = startBlockIndex !== endBlockIndex;
  const quote = blocks
    .slice(startBlockIndex, endBlockIndex + 1)
    .map((block, index, selectedBlocks) => {
      const isFirstBlock = index === 0;
      const isLastBlock = index === selectedBlocks.length - 1;
      return block.content.slice(
        isFirstBlock ? selectionStart : 0,
        isLastBlock ? selectionEnd : block.content.length,
      );
    })
    .join("\n\n");

  if (!quote) return null;

  return {
    chapterBlockId: startBlock.id,
    contextAfter: endBlock.content.slice(selectionEnd, selectionEnd + CONTEXT_LENGTH) || null,
    contextBefore: startBlock.content.slice(
      Math.max(0, selectionStart - CONTEXT_LENGTH),
      selectionStart,
    ) || null,
    quote,
    selectionEnd: isMultiBlock ? startBlock.content.length : selectionEnd,
    selectionEndChapterBlockId: isMultiBlock ? endBlock.id : null,
    selectionEndOffset: isMultiBlock ? selectionEnd : null,
    selectionStart,
  };
}

function clampOffset(content: string, offset: number) {
  return Math.max(0, Math.min(content.length, offset));
}
