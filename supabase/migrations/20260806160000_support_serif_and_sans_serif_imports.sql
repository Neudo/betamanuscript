-- Keep imported font information intentionally small and portable: the reader
-- only receives the generic serif or sans-serif category, never a raw font.

create or replace function private.is_valid_manuscript_rich_content(
  p_content text,
  p_rich_content jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  run jsonb;
  marks jsonb;
  joined_content text := '';
  mark_key text;
begin
  if p_rich_content is null
    or jsonb_typeof(p_rich_content) <> 'object'
    or p_rich_content -> 'version' <> '1'::jsonb
    or jsonb_typeof(p_rich_content -> 'runs') <> 'array' then
    return false;
  end if;

  for run in
    select value
    from jsonb_array_elements(p_rich_content -> 'runs')
  loop
    if jsonb_typeof(run) <> 'object'
      or jsonb_typeof(run -> 'text') <> 'string' then
      return false;
    end if;

    joined_content := joined_content || (run ->> 'text');
    if char_length(joined_content) > 25000 then
      return false;
    end if;

    if not run ? 'marks' then
      continue;
    end if;

    marks := run -> 'marks';
    if jsonb_typeof(marks) <> 'object' then
      return false;
    end if;

    for mark_key in
      select key
      from jsonb_object_keys(marks) as key
    loop
      if mark_key not in ('bold', 'fontFamily', 'italic') then
        return false;
      end if;
    end loop;

    if (marks ? 'bold' and marks -> 'bold' <> 'true'::jsonb)
      or (marks ? 'italic' and marks -> 'italic' <> 'true'::jsonb)
      or (
        marks ? 'fontFamily'
        and (
          jsonb_typeof(marks -> 'fontFamily') <> 'string'
          or marks ->> 'fontFamily' not in ('serif', 'sans-serif')
        )
      ) then
      return false;
    end if;
  end loop;

  return joined_content = coalesce(p_content, '');
end;
$$;
