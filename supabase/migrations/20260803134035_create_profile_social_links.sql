create table public.profile_social_links (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'x', 'facebook', 'linkedin')),
  url text not null check (
    char_length(url) <= 2048
    and url ~* '^https?://[^[:space:]]+$'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, platform)
);

alter table public.profile_social_links enable row level security;

revoke all on table public.profile_social_links from anon, authenticated;
grant select, insert, update, delete on table public.profile_social_links to authenticated;

create policy "Users can manage their social links"
on public.profile_social_links for all to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

create trigger profile_social_links_set_updated_at
before update on public.profile_social_links
for each row execute procedure private.set_updated_at();
