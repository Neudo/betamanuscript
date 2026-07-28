-- The default tag vocabulary is seeded by a trusted database trigger. Manual
-- additions use the policy below and are reserved for authors on Pro.
create or replace function private.can_create_manuscript_annotation_tag(
  p_manuscript_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_profile_id uuid;
  current_plan public.account_plan;
begin
  select manuscript.owner_id into owner_profile_id
  from public.manuscripts manuscript
  where manuscript.id = p_manuscript_id;

  if owner_profile_id is null or owner_profile_id is distinct from (select auth.uid()) then
    return false;
  end if;

  select private.refresh_profile_billing_plan(owner_profile_id)
  into current_plan;

  return current_plan = 'pro';
end;
$$;

revoke all on function private.can_create_manuscript_annotation_tag(uuid)
from public, anon, authenticated;

grant execute on function private.can_create_manuscript_annotation_tag(uuid)
to authenticated;

drop policy if exists "Manuscript owners can create annotation tags"
on public.manuscript_annotation_tags;

create policy "Pro manuscript owners can create annotation tags"
on public.manuscript_annotation_tags for insert to authenticated
with check (private.can_create_manuscript_annotation_tag(manuscript_id));
