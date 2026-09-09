// Run with: PGLITE_MODULE=/path/to/@electric-sql/pglite/dist/index.js node scripts/verification/pending-manuscript-upload.mjs
// Isolated PostgreSQL fixture: exercises the real upload migration, without external storage/auth.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { PGlite } = await import(process.env.PGLITE_MODULE ? pathToFileURL(process.env.PGLITE_MODULE).href : '@electric-sql/pglite');
const db = await PGlite.create();
const sql = (text, args = []) => db.query(text, args);
const value = async (text, args) => Object.values((await sql(text,args)).rows[0])[0];
let assertions = 0;
const check = (actual, expected) => { assert.deepEqual(actual,expected); assertions++; };
await db.exec(`
  create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth; create schema private; create schema storage;
  create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table public.manuscripts(id uuid primary key default gen_random_uuid(),owner_id uuid not null);
  create table public.manuscript_versions(id uuid primary key default gen_random_uuid(),manuscript_id uuid);
  create table public.reading_rounds(id uuid primary key default gen_random_uuid(),manuscript_version_id uuid);
  alter table public.manuscripts enable row level security;
  create policy owns_manuscript on public.manuscripts to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
  grant select,insert on public.manuscripts,public.manuscript_versions,public.reading_rounds to authenticated;
  create function public.create_manuscript_from_draft(p_draft jsonb)
  returns table(manuscript_id uuid,manuscript_version_id uuid,reading_round_id uuid)
  language plpgsql security invoker as $$
  declare m uuid; v uuid; r uuid;
  begin
    if current_user <> 'authenticated' then raise exception 'Creation bypassed invoker security'; end if;
    if p_draft->>'deny'='true' then raise exception 'Quota exceeded'; end if;
    insert into public.manuscripts(owner_id) values(auth.uid()) returning id into m;
    insert into public.manuscript_versions(manuscript_id) values(m) returning id into v;
    insert into public.reading_rounds(manuscript_version_id) values(v) returning id into r;
    return query select m,v,r;
  end $$;
`);
const previous = await readFile(new URL('../../supabase/migrations/20260803154643_add_public_reading_and_place_requests.sql',import.meta.url),'utf8');
await db.exec(previous.slice(previous.indexOf('create table private.reader_request_rate_limits'),previous.indexOf('alter table public.reader_place_requests')));
await db.exec(previous.slice(previous.indexOf('create or replace function private.consume_reader_request_rate_limit'),previous.indexOf('create or replace function public.consume_public_reading_rate_limit')));
await db.exec(await readFile(new URL('../../supabase/migrations/20260909100000_add_pending_manuscript_uploads.sql',import.meta.url),'utf8'));
const owner='843ef547-994c-4c55-bb7e-cb319ef1fa38';
const other='cedb70df-d3c9-4f53-ab4d-f2d78d357fcf';
await sql('insert into auth.users values($1),($2)',[owner,other]);
const reserve = (fingerprint='b'.repeat(64)) => value("select public.reserve_manuscript_upload('story.txt',12,'text/plain',$1,$2)",['a'.repeat(64),fingerprint]);
const id=await reserve();
check(await value("select expires_at-created_at=interval '4 hours' from public.pending_manuscript_uploads where id=$1",[id]),true);
check(await value("select public from storage.buckets where id='pending-manuscripts'"),false);
for(let i=0;i<4;i++) await reserve();
check(await reserve(),null);
check(await value("select public.claim_manuscript_upload($1,$2,$3)",[id,'a'.repeat(64),owner]),false); // unfinished upload
await sql("update public.pending_manuscript_uploads set state='ready' where id=$1",[id]);
check(await value("select public.claim_manuscript_upload($1,$2,$3)",[id,'c'.repeat(64),owner]),false);
check(await value("select public.claim_manuscript_upload($1,$2,$3)",[id,'a'.repeat(64),owner]),true);
check(await value("select public.claim_manuscript_upload($1,$2,$3)",[id,'a'.repeat(64),other]),false);
await sql("update public.pending_manuscript_uploads set expires_at=now()-interval '1 hour' where id=$1",[id]);
check((await sql('select * from public.take_expired_manuscript_uploads()')).rows.length,0); // bound account survives expiry
for (const role of ['anon','authenticated']) {
  await db.exec(`set role ${role}`);
  await assert.rejects(sql('select * from public.pending_manuscript_uploads'), /permission denied/); assertions++;
  await assert.rejects(sql('select * from public.take_expired_manuscript_uploads()'), /permission denied/); assertions++;
  await db.exec('reset role');
}
await sql("select set_config('request.jwt.claim.sub',$1,false)",[other]);
await db.exec('set role authenticated');
await assert.rejects(sql("select * from public.create_manuscript_from_pending_upload($1,'{}')",[id]),/not available/); assertions++;
await sql("select set_config('request.jwt.claim.sub',$1,false)",[owner]);
await assert.rejects(sql(`select * from public.create_manuscript_from_pending_upload($1,'{"deny":true}')`,[id]),/Quota exceeded/); assertions++;
const first=(await sql("select * from public.create_manuscript_from_pending_upload($1,'{}')",[id])).rows;
const second=(await sql("select * from public.create_manuscript_from_pending_upload($1,'{}')",[id])).rows;
check(first,second);
check(await value('select count(*)::int from public.manuscripts'),1);
await db.exec('reset role');
const freshCompleted=await reserve('e'.repeat(64));
await sql("update public.pending_manuscript_uploads set state='completed',owner_id=$2 where id=$1",[freshCompleted,owner]);
check((await sql('select * from public.take_expired_manuscript_uploads()')).rows.length,0); // signed upload URL cannot recreate an orphan
const expired=await reserve('d'.repeat(64));
await sql("update public.pending_manuscript_uploads set state='ready',expires_at=now()-interval '1 hour' where id=$1",[expired]);
check(await value("select public.claim_manuscript_upload($1,$2,$3)",[expired,'a'.repeat(64),owner]),false);
check((await sql('select * from public.take_expired_manuscript_uploads()')).rows.map(row=>row.id),[expired]);
check((await sql('select * from public.take_expired_manuscript_uploads()')).rows.map(row=>row.id),[expired]); // failed deletion retried
await sql("delete from public.pending_manuscript_uploads where id=$1",[expired]);
await sql("update public.pending_manuscript_uploads set state='completed' where id=$1",[id]);
check((await sql('select * from public.take_expired_manuscript_uploads()')).rows.map(row=>row.id),[id]);
check(await value('select count(*)::int from public.manuscripts'),1); // cleanup never removes the manuscript
await db.close();
console.log(`${assertions} PostgreSQL assertions passed (expiry, ownership, privileges, rate limit, idempotency, cleanup).`);
