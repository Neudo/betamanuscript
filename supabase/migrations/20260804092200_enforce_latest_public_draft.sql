-- A manuscript has one public draft at a time. Keep the newest currently
-- public draft when normalizing existing data, then enforce the same rule for
-- every future public-link activation.
with ranked_active_links as (
  select
    access_link.id,
    access_link.reading_round_id,
    row_number() over (
      partition by manuscript_version.manuscript_id
      order by manuscript_version.version_number desc, access_link.created_at desc
    ) as rank
  from public.reading_round_access_links access_link
  join public.reading_rounds reading_round
    on reading_round.id = access_link.reading_round_id
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  where access_link.revoked_at is null
),
revoked_links as (
  update public.reading_round_access_links access_link
  set revoked_at = now(), updated_at = now()
  from ranked_active_links ranked_link
  where access_link.id = ranked_link.id
    and ranked_link.rank > 1
  returning access_link.reading_round_id
)
update public.reading_rounds reading_round
set access_mode = 'invite_only', updated_at = now()
where reading_round.id in (select reading_round_id from revoked_links);

create or replace function public.enable_public_reading_link(p_reading_round_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  latest_active_version_id uuid;
  public_link_id uuid;
  target_manuscript_id uuid;
  target_round_status public.reading_round_status;
  target_version_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select
    reading_round.status,
    manuscript.id,
    manuscript_version.id
  into
    target_round_status,
    target_manuscript_id,
    target_version_id
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  where reading_round.id = p_reading_round_id
    and manuscript.owner_id = auth.uid()
    and manuscript.archived_at is null
    and manuscript_version.archived_at is null
  for update of reading_round, manuscript_version, manuscript;

  if target_round_status is null then
    raise exception 'This reading round does not exist or is not yours.' using errcode = '42501';
  end if;

  if target_round_status not in ('draft', 'open') then
    raise exception 'A public link can only be enabled for a draft or open reading round.' using errcode = '22023';
  end if;

  select manuscript_version.id
  into latest_active_version_id
  from public.manuscript_versions manuscript_version
  where manuscript_version.manuscript_id = target_manuscript_id
    and manuscript_version.archived_at is null
  order by manuscript_version.version_number desc
  limit 1;

  if target_version_id is distinct from latest_active_version_id then
    raise exception 'Only the latest active draft can be made public.' using errcode = '22023';
  end if;

  -- Activating the latest draft closes every prior public reading link for
  -- this manuscript, including an earlier link for the target round itself.
  update public.reading_round_access_links access_link
  set revoked_at = now(), updated_at = now()
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  where access_link.reading_round_id = reading_round.id
    and manuscript_version.manuscript_id = target_manuscript_id
    and access_link.revoked_at is null;

  update public.reading_rounds reading_round
  set access_mode = 'invite_only', updated_at = now()
  from public.manuscript_versions manuscript_version
  where reading_round.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = target_manuscript_id
    and reading_round.id <> p_reading_round_id
    and reading_round.access_mode = 'open_signup';

  insert into public.reading_round_access_links (
    reading_round_id,
    token_digest
  )
  values (
    p_reading_round_id,
    encode(extensions.digest(gen_random_uuid()::text || clock_timestamp()::text, 'sha256'), 'hex')
  )
  returning id into public_link_id;

  update public.reading_rounds
  set
    access_mode = 'open_signup',
    status = case when target_round_status = 'draft' then 'open' else status end,
    opened_at = case when target_round_status = 'draft' then coalesce(opened_at, now()) else opened_at end,
    updated_at = now()
  where id = p_reading_round_id;

  return public_link_id;
end;
$$;
