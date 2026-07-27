-- Stripe is the source of truth for billing. These tables are intentionally
-- service-role only: client-side code must never be able to grant itself Pro.

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create table public.stripe_customers (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stripe_customers_id_format check (left(stripe_customer_id, 4) = 'cus_')
);

create table public.stripe_subscriptions (
  stripe_subscription_id text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text not null references public.stripe_customers(stripe_customer_id) on delete cascade,
  stripe_price_id text not null,
  status text not null check (status in ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  cancel_at timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,
  stripe_event_created_at timestamptz not null,
  stripe_event_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stripe_subscriptions_id_format check (left(stripe_subscription_id, 4) = 'sub_'),
  constraint stripe_subscriptions_price_format check (left(stripe_price_id, 6) = 'price_'),
  constraint stripe_subscriptions_event_format check (left(stripe_event_id, 4) = 'evt_')
);

create index stripe_subscriptions_profile_id_idx on public.stripe_subscriptions (profile_id);
create index stripe_subscriptions_expiration_idx on public.stripe_subscriptions (profile_id, status, current_period_end);

create table public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  stripe_event_created_at timestamptz not null,
  received_at timestamptz not null default now(),
  constraint stripe_webhook_events_id_format check (left(stripe_event_id, 4) = 'evt_')
);

alter table public.stripe_customers enable row level security;
alter table public.stripe_subscriptions enable row level security;
alter table public.stripe_webhook_events enable row level security;

revoke all on table public.stripe_customers from anon, authenticated;
revoke all on table public.stripe_subscriptions from anon, authenticated;
revoke all on table public.stripe_webhook_events from anon, authenticated;

grant select, insert, update on table public.stripe_customers to service_role;
grant select on table public.stripe_subscriptions to service_role;

create or replace function private.refresh_profile_billing_plan(p_profile_id uuid)
returns public.account_plan
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_plan public.account_plan;
begin
  if not exists (
    select 1
    from public.profiles profile
    where profile.id = p_profile_id
    for update
  ) then
    return 'free'::public.account_plan;
  end if;

  select case when exists (
    select 1
    from public.stripe_subscriptions subscription
    where subscription.profile_id = p_profile_id
      and subscription.status in ('active', 'trialing')
      and subscription.current_period_end > now()
  ) then 'pro'::public.account_plan else 'free'::public.account_plan end
  into next_plan;

  update public.profiles profile
  set plan = next_plan
  where profile.id = p_profile_id
    and profile.plan is distinct from next_plan;

  return next_plan;
end;
$$;

create or replace function public.sync_stripe_billing_subscription(
  p_stripe_event_id text,
  p_event_type text,
  p_event_created_at timestamptz,
  p_profile_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_price_id text,
  p_status text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_cancel_at timestamptz,
  p_canceled_at timestamptz,
  p_ended_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  mapped_profile_id uuid;
  mapped_customer_id text;
  stored_event_created_at timestamptz;
begin
  -- A user might be deleted after a Checkout Session was started. That Stripe
  -- event is harmless and must not be retried forever.
  if not exists (
    select 1 from public.profiles profile where profile.id = p_profile_id
  ) then
    return false;
  end if;

  insert into public.stripe_webhook_events (
    stripe_event_id,
    event_type,
    stripe_event_created_at
  ) values (
    p_stripe_event_id,
    p_event_type,
    p_event_created_at
  ) on conflict (stripe_event_id) do nothing;

  if not found then
    return false;
  end if;

  select customer.profile_id into mapped_profile_id
  from public.stripe_customers customer
  where customer.stripe_customer_id = p_stripe_customer_id
  for update;

  if mapped_profile_id is not null and mapped_profile_id <> p_profile_id then
    raise exception 'Stripe customer is already associated with a different profile.';
  end if;

  select customer.stripe_customer_id into mapped_customer_id
  from public.stripe_customers customer
  where customer.profile_id = p_profile_id
  for update;

  if mapped_customer_id is not null and mapped_customer_id <> p_stripe_customer_id then
    raise exception 'Profile is already associated with a different Stripe customer.';
  end if;

  insert into public.stripe_customers (profile_id, stripe_customer_id)
  values (p_profile_id, p_stripe_customer_id)
  on conflict (profile_id) do update
    set updated_at = now();

  select subscription.stripe_event_created_at into stored_event_created_at
  from public.stripe_subscriptions subscription
  where subscription.stripe_subscription_id = p_stripe_subscription_id
  for update;

  if stored_event_created_at is not null and stored_event_created_at > p_event_created_at then
    perform private.refresh_profile_billing_plan(p_profile_id);
    return false;
  end if;

  insert into public.stripe_subscriptions (
    stripe_subscription_id,
    profile_id,
    stripe_customer_id,
    stripe_price_id,
    status,
    current_period_end,
    cancel_at_period_end,
    cancel_at,
    canceled_at,
    ended_at,
    stripe_event_created_at,
    stripe_event_id
  ) values (
    p_stripe_subscription_id,
    p_profile_id,
    p_stripe_customer_id,
    p_stripe_price_id,
    p_status,
    p_current_period_end,
    p_cancel_at_period_end,
    p_cancel_at,
    p_canceled_at,
    p_ended_at,
    p_event_created_at,
    p_stripe_event_id
  ) on conflict (stripe_subscription_id) do update
    set profile_id = excluded.profile_id,
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_price_id = excluded.stripe_price_id,
        status = excluded.status,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = excluded.cancel_at_period_end,
        cancel_at = excluded.cancel_at,
        canceled_at = excluded.canceled_at,
        ended_at = excluded.ended_at,
        stripe_event_created_at = excluded.stripe_event_created_at,
        stripe_event_id = excluded.stripe_event_id,
        updated_at = now()
    where public.stripe_subscriptions.stripe_event_created_at <= excluded.stripe_event_created_at;

  perform private.refresh_profile_billing_plan(p_profile_id);

  return true;
end;
$$;

create or replace function public.expire_stripe_billing_entitlements()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_profiles integer;
begin
  with expected_plans as (
    select
      profile.id,
      case when exists (
        select 1
        from public.stripe_subscriptions subscription
        where subscription.profile_id = profile.id
          and subscription.status in ('active', 'trialing')
          and subscription.current_period_end > now()
      ) then 'pro'::public.account_plan else 'free'::public.account_plan end as plan
    from public.profiles profile
  )
  update public.profiles profile
  set plan = expected_plans.plan
  from expected_plans
  where profile.id = expected_plans.id
    and profile.plan is distinct from expected_plans.plan;

  get diagnostics affected_profiles = row_count;
  return affected_profiles;
end;
$$;

revoke all on function private.refresh_profile_billing_plan(uuid) from public, anon, authenticated;
revoke all on function public.sync_stripe_billing_subscription(text, text, timestamptz, uuid, text, text, text, text, timestamptz, boolean, timestamptz, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.expire_stripe_billing_entitlements() from public, anon, authenticated;

grant execute on function public.sync_stripe_billing_subscription(text, text, timestamptz, uuid, text, text, text, text, timestamptz, boolean, timestamptz, timestamptz, timestamptz) to service_role;
grant execute on function public.expire_stripe_billing_entitlements() to service_role;

create or replace function private.enforce_manuscript_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_plan public.account_plan;
begin
  perform private.refresh_profile_billing_plan(new.owner_id);

  select profile.plan into current_plan
  from public.profiles profile
  where profile.id = new.owner_id
  for update;

  if current_plan is null then
    raise exception 'The manuscript owner must have a profile.';
  end if;

  if current_plan = 'free' and new.archived_at is null and (
    select count(*)
    from public.manuscripts manuscript
    where manuscript.owner_id = new.owner_id
      and manuscript.archived_at is null
      and (tg_op = 'INSERT' or manuscript.id <> new.id)
  ) >= 1 then
    raise exception 'The free plan is limited to one active manuscript.';
  end if;

  return new;
end;
$$;

create or replace function private.enforce_reading_round_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_profile_id uuid;
  current_plan public.account_plan;
  assigned_readers integer;
begin
  select manuscript.owner_id into owner_profile_id
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where manuscript_version.id = new.manuscript_version_id;

  if owner_profile_id is null then
    raise exception 'The reading round must belong to a manuscript owner profile.';
  end if;

  perform private.refresh_profile_billing_plan(owner_profile_id);

  select profile.plan into current_plan
  from public.profiles profile
  where profile.id = owner_profile_id
  for update;

  if current_plan = 'free' and new.max_readers > 5 then
    raise exception 'The free plan is limited to five readers per reading round.';
  end if;

  if tg_op = 'UPDATE' then
    select count(*) into assigned_readers
    from public.reader_assignments reader_assignment
    where reader_assignment.reading_round_id = new.id
      and reader_assignment.status in ('started', 'completed');

    if assigned_readers > new.max_readers then
      raise exception 'The reader limit cannot be lower than the current started reader count.';
    end if;
  end if;

  return new;
end;
$$;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'expire_betamanuscript_billing_entitlements';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'expire_betamanuscript_billing_entitlements',
    '*/15 * * * *',
    $cron$select public.expire_stripe_billing_entitlements();$cron$
  );
end;
$$;
