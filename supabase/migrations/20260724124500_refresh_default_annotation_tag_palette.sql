-- The first feedback tags used the same ochre color for three separate
-- concepts. Give each default concept its own visual identity while leaving
-- author-customized colors intact.
with palette (slug, previous_color, color) as (
  values
    ('confusing', '#8A6D1D', '#B45309'),
    ('pacing', '#8A6D1D', '#9333EA'),
    ('missing-context', '#8A6D1D', '#0F766E')
)
update public.annotation_tags tag
set color = palette.color
from palette
where tag.slug = palette.slug
  and tag.color = palette.previous_color;

with palette (slug, previous_color, color) as (
  values
    ('confusing', '#8A6D1D', '#B45309'),
    ('pacing', '#8A6D1D', '#9333EA'),
    ('missing-context', '#8A6D1D', '#0F766E')
)
update public.manuscript_annotation_tags tag
set color = palette.color
from palette
where tag.slug = palette.slug
  and tag.color = palette.previous_color;
