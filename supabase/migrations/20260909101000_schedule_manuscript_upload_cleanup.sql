-- pg_net owns the `net` schema used by `net.http_post`; it is not relocatable.
create extension if not exists pg_net;

-- The scheduler credential is generated in Vault and never exposed to the browser.
select vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'manuscript_upload_cleanup_token')
where not exists(select 1 from vault.secrets where name='manuscript_upload_cleanup_token');
select vault.create_secret('https://zirvdaqbowlyifoiregn.supabase.co/functions/v1/cleanup-manuscript-uploads','manuscript_upload_cleanup_url')
where not exists(select 1 from vault.secrets where name='manuscript_upload_cleanup_url');

create function public.authorize_manuscript_upload_cleanup(p_token text)
returns boolean language sql security definer set search_path = '' as $$
  select p_token is not null and p_token = (select decrypted_secret from vault.decrypted_secrets where name='manuscript_upload_cleanup_token');
$$;
revoke all on function public.authorize_manuscript_upload_cleanup(text) from public, anon, authenticated;
grant execute on function public.authorize_manuscript_upload_cleanup(text) to service_role;

select cron.schedule('cleanup_pending_manuscript_uploads','0 * * * *', $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='manuscript_upload_cleanup_url'),
    headers := jsonb_build_object('Content-Type','application/json','x-cleanup-token',(select decrypted_secret from vault.decrypted_secrets where name='manuscript_upload_cleanup_token')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$job$);
