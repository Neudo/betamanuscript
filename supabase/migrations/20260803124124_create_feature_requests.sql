create table public.feature_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  manuscript_id uuid references public.manuscripts(id) on delete set null,
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  created_at timestamptz not null default now()
);

create index feature_requests_profile_created_idx
  on public.feature_requests (profile_id, created_at desc);

alter table public.feature_requests enable row level security;

revoke all on table public.feature_requests from anon, authenticated;
grant select, insert on table public.feature_requests to authenticated;

create policy "Authors can read their feature requests"
on public.feature_requests for select to authenticated
using ((select auth.uid()) = profile_id);

create policy "Authors can submit feature requests"
on public.feature_requests for insert to authenticated
with check (
  (select auth.uid()) = profile_id
  and (
    manuscript_id is null
    or exists (
      select 1
      from public.manuscripts manuscript
      where manuscript.id = feature_requests.manuscript_id
        and manuscript.owner_id = (select auth.uid())
    )
  )
);
