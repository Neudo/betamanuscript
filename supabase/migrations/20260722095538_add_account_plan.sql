create type public.account_plan as enum ('free', 'pro');

alter table public.profiles
  add column plan public.account_plan not null default 'free';

comment on column public.profiles.plan is
  'Server-managed subscription tier. Updated only by trusted billing workflows.';
