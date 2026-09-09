-- Public uploads are accessible only through server-validated capabilities.
create table public.pending_manuscript_uploads (
  id uuid primary key default gen_random_uuid(),
  token_digest text not null check (token_digest ~ '^[0-9a-f]{64}$'),
  original_filename text not null check (char_length(original_filename) between 1 and 512),
  byte_size bigint not null check (byte_size between 1 and 20971520),
  mime_type text not null,
  storage_path text not null unique,
  state text not null default 'uploading' check (state in ('uploading','ready','claimed','completed','deleting')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '4 hours',
  owner_id uuid references auth.users(id) on delete set null,
  manuscript_id uuid,
  manuscript_version_id uuid,
  reading_round_id uuid
);
alter table public.pending_manuscript_uploads enable row level security;
revoke all on public.pending_manuscript_uploads from public, anon, authenticated;
grant all on public.pending_manuscript_uploads to service_role;
create index pending_manuscript_upload_expiry on public.pending_manuscript_uploads(expires_at) where owner_id is null or state in ('completed','deleting');
create index pending_manuscript_upload_owner on public.pending_manuscript_uploads(owner_id) where owner_id is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pending-manuscripts','pending-manuscripts',false,20971520,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','text/markdown'])
on conflict (id) do nothing;

create function public.reserve_manuscript_upload(p_filename text,p_size bigint,p_mime text,p_token_digest text,p_fingerprint text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare upload_id uuid := gen_random_uuid();
begin
  if p_fingerprint !~ '^[0-9a-f]{64}$' or p_mime not in ('application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','text/markdown') then
    raise exception 'Invalid upload.';
  end if;
  if not private.consume_reader_request_rate_limit('manuscript-upload',p_fingerprint,5,interval '1 hour') then
    return null;
  end if;
  insert into public.pending_manuscript_uploads(id,original_filename,byte_size,mime_type,token_digest,storage_path)
  values(upload_id,p_filename,p_size,p_mime,p_token_digest,upload_id::text || '/source');
  return upload_id;
end $$;

create function public.claim_manuscript_upload(p_id uuid,p_digest text,p_owner uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.pending_manuscript_uploads set owner_id=p_owner,state='claimed'
  where id=p_id and token_digest=p_digest and owner_id is null and state='ready' and expires_at>now();
  return found;
end $$;

-- This helper can only associate a manuscript owned by the current authenticated user.
-- The outer creation RPC stays SECURITY INVOKER, preserving all existing RLS and quotas.
create function public.pending_manuscript_creation(p_id uuid,p_created jsonb default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare upload public.pending_manuscript_uploads%rowtype;
begin
  select * into upload from public.pending_manuscript_uploads where id=p_id for update;
  if auth.uid() is null or upload.owner_id is distinct from auth.uid() or upload.state not in ('claimed','completed') then
    raise exception 'This upload is not available.' using errcode='42501';
  end if;
  if upload.manuscript_id is not null then
    return jsonb_build_object('manuscript_id',upload.manuscript_id,'manuscript_version_id',upload.manuscript_version_id,'reading_round_id',upload.reading_round_id);
  end if;
  if p_created is not null then
    if not exists (
      select 1 from public.manuscripts m
      join public.manuscript_versions v on v.manuscript_id=m.id
      join public.reading_rounds r on r.manuscript_version_id=v.id
      where m.owner_id=auth.uid() and m.id=(p_created->>'manuscript_id')::uuid
      and v.id=(p_created->>'manuscript_version_id')::uuid and r.id=(p_created->>'reading_round_id')::uuid
    ) then raise exception 'Invalid manuscript owner.' using errcode='42501'; end if;
    update public.pending_manuscript_uploads set manuscript_id=(p_created->>'manuscript_id')::uuid,
      manuscript_version_id=(p_created->>'manuscript_version_id')::uuid,reading_round_id=(p_created->>'reading_round_id')::uuid where id=p_id;
  end if;
  return p_created;
end $$;

create function public.create_manuscript_from_pending_upload(p_upload_id uuid,p_draft jsonb)
returns table(manuscript_id uuid,manuscript_version_id uuid,reading_round_id uuid)
language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
  result := public.pending_manuscript_creation(p_upload_id);
  if result is null then
    select to_jsonb(created) into result from public.create_manuscript_from_draft(p_draft) created;
    perform public.pending_manuscript_creation(p_upload_id,result);
  end if;
  return query select (result->>'manuscript_id')::uuid,(result->>'manuscript_version_id')::uuid,(result->>'reading_round_id')::uuid;
end $$;

-- Claiming and cleanup serialize on the same row; failed deletions remain retryable.
create function public.take_expired_manuscript_uploads()
returns table(id uuid,storage_path text) language sql security definer set search_path = '' as $$
  delete from private.reader_request_rate_limits where bucket='manuscript-upload' and updated_at < now()-interval '1 day';
  update public.pending_manuscript_uploads u set state='deleting'
  where u.id in (
    select p.id from public.pending_manuscript_uploads p
    -- Keep completed objects through the original TTL so an unexpired signed upload URL
    -- cannot recreate an orphan after cleanup (Supabase upload signatures last two hours).
    where ((p.owner_id is null or p.state='completed') and p.expires_at<=now()) or p.state='deleting'
    order by p.expires_at limit 100 for update skip locked
  ) returning u.id,u.storage_path;
$$;

revoke all on function public.reserve_manuscript_upload(text,bigint,text,text,text),public.claim_manuscript_upload(uuid,text,uuid),public.take_expired_manuscript_uploads() from public,anon,authenticated;
grant execute on function public.reserve_manuscript_upload(text,bigint,text,text,text),public.claim_manuscript_upload(uuid,text,uuid),public.take_expired_manuscript_uploads() to service_role;
revoke all on function public.pending_manuscript_creation(uuid,jsonb),public.create_manuscript_from_pending_upload(uuid,jsonb) from public,anon;
grant execute on function public.pending_manuscript_creation(uuid,jsonb),public.create_manuscript_from_pending_upload(uuid,jsonb) to authenticated;
