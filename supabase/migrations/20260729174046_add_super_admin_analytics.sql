alter type public.user_role add value if not exists 'super_admin';

alter table public.profiles
  add column if not exists last_active_at timestamptz;

create index if not exists profiles_last_active_at_idx
  on public.profiles (last_active_at)
  where last_active_at is not null;

comment on column public.profiles.last_active_at is
  'Last authenticated application activity, refreshed at most once every 24 hours.';

create or replace function private.prevent_super_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
    and (
      new.role = 'super_admin'::public.user_role
      or old.role = 'super_admin'::public.user_role
    )
    and (select auth.uid()) is not null then
    raise exception 'The super_admin role can only be changed by a trusted server process.';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_super_admin_role_change() from public, anon, authenticated;

drop trigger if exists profiles_prevent_super_admin_role_change on public.profiles;

create trigger profiles_prevent_super_admin_role_change
  before update of role on public.profiles
  for each row execute procedure private.prevent_super_admin_role_change();

create or replace function public.touch_current_profile_activity()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required to record account activity.';
  end if;

  update public.profiles
  set last_active_at = now()
  where id = (select auth.uid())
    and (last_active_at is null or last_active_at < now() - interval '24 hours');
end;
$$;

revoke all on function public.touch_current_profile_activity() from public, anon;
grant execute on function public.touch_current_profile_activity() to authenticated;
