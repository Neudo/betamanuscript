create schema if not exists private;
revoke all on schema private from public;

create type public.user_role as enum ('reader', 'writer', 'both');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null
    constraint profiles_display_name_length check (char_length(trim(display_name)) between 2 and 80),
  role public.user_role not null default 'reader',
  bio text
    constraint profiles_bio_length check (bio is null or char_length(bio) <= 2000),
  website text
    constraint profiles_website_length check (website is null or char_length(website) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, role, bio, website) on table public.profiles to authenticated;

create policy "Profiles are visible to their owner"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Profiles can be updated by their owner"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_display_name text;
  requested_role text;
begin
  requested_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );
  requested_role := new.raw_user_meta_data ->> 'role';

  if char_length(requested_display_name) < 2 then
    requested_display_name := 'New user';
  end if;

  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    left(requested_display_name, 80),
    case
      when requested_role in ('reader', 'writer', 'both')
        then requested_role::public.user_role
      else 'reader'::public.user_role
    end
  );

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure private.set_updated_at();
