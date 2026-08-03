create index pending_public_feedback_public_link_idx
  on public.pending_public_feedback (public_link_id);

create index pending_public_feedback_chapter_idx
  on public.pending_public_feedback (chapter_id);

create index pending_public_feedback_chapter_block_idx
  on public.pending_public_feedback (chapter_block_id)
  where chapter_block_id is not null;

create index pending_public_feedback_tag_idx
  on public.pending_public_feedback (tag_id)
  where tag_id is not null;

create index pending_public_feedback_selection_end_block_idx
  on public.pending_public_feedback (selection_end_chapter_block_id)
  where selection_end_chapter_block_id is not null;
