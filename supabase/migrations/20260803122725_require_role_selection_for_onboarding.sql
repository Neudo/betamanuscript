-- A workspace role is selected during onboarding, never inferred at account
-- creation. Existing accounts keep their current role.
alter table public.profiles
  alter column role drop default,
  alter column role drop not null;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_display_name text;
begin
  requested_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );

  if char_length(requested_display_name) < 2 then
    requested_display_name := 'New user';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, left(requested_display_name, 80));

  return new;
end;
$$;

-- The Auth trigger may create an incomplete profile, but an authenticated user
-- must select a valid role before making any later profile change.
drop policy if exists "Profiles can be updated by their owner" on public.profiles;
create policy "Profiles can be updated by their owner"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  and role is not null
);
