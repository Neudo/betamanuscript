-- A manual Pro entitlement is intentionally separate from Stripe. It is
-- service-role only and can be granted or revoked by the internal admin console.

create table public.profile_plan_overrides (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  expires_at timestamptz,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_plan_overrides_expiration_after_creation
    check (expires_at is null or expires_at > created_at)
);

alter table public.profile_plan_overrides enable row level security;

revoke all on table public.profile_plan_overrides from anon, authenticated;
grant select, insert, update, delete on table public.profile_plan_overrides to service_role;

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

  select case when
    exists (
      select 1
      from public.stripe_subscriptions subscription
      where subscription.profile_id = p_profile_id
        and subscription.status in ('active', 'trialing')
        and subscription.current_period_end > now()
    )
    or exists (
      select 1
      from public.profile_plan_overrides override
      where override.profile_id = p_profile_id
        and (override.expires_at is null or override.expires_at > now())
    )
  then 'pro'::public.account_plan else 'free'::public.account_plan end
  into next_plan;

  update public.profiles profile
  set plan = next_plan
  where profile.id = p_profile_id
    and profile.plan is distinct from next_plan;

  return next_plan;
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
      case when
        exists (
          select 1
          from public.stripe_subscriptions subscription
          where subscription.profile_id = profile.id
            and subscription.status in ('active', 'trialing')
            and subscription.current_period_end > now()
        )
        or exists (
          select 1
          from public.profile_plan_overrides override
          where override.profile_id = profile.id
            and (override.expires_at is null or override.expires_at > now())
        )
      then 'pro'::public.account_plan else 'free'::public.account_plan end as plan
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

create or replace function private.refresh_profile_plan_after_override_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.refresh_profile_billing_plan(old.profile_id);
    return old;
  end if;

  perform private.refresh_profile_billing_plan(new.profile_id);
  return new;
end;
$$;

revoke all on function private.refresh_profile_plan_after_override_change() from public, anon, authenticated;

create trigger profile_plan_overrides_refresh_billing_plan
after insert or update or delete on public.profile_plan_overrides
for each row execute procedure private.refresh_profile_plan_after_override_change();
