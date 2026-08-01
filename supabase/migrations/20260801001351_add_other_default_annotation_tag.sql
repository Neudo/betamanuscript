insert into public.annotation_tags (slug, label, color, sort_order, is_active)
values ('other', 'Other', '#6B7280', 9, true)
on conflict (slug) do update
set
  label = excluded.label,
  color = excluded.color,
  is_active = true;

insert into public.manuscript_annotation_tags (
  manuscript_id,
  slug,
  label,
  color,
  sort_order,
  is_active
)
select
  manuscript.id,
  default_tag.slug,
  default_tag.label,
  default_tag.color,
  coalesce(
    (
      select max(existing_tag.sort_order) + 1
      from public.manuscript_annotation_tags as existing_tag
      where existing_tag.manuscript_id = manuscript.id
    ),
    1
  ),
  default_tag.is_active
from public.manuscripts as manuscript
join public.annotation_tags as default_tag
  on default_tag.slug = 'other'
where not exists (
  select 1
  from public.manuscript_annotation_tags as manuscript_tag
  where manuscript_tag.manuscript_id = manuscript.id
    and manuscript_tag.slug = 'other'
)
on conflict (manuscript_id, slug) do nothing;
