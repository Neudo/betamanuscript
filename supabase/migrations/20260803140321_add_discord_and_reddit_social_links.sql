alter table public.profile_social_links
  drop constraint if exists profile_social_links_platform_check;

alter table public.profile_social_links
  add constraint profile_social_links_platform_check
  check (platform in ('instagram', 'tiktok', 'x', 'facebook', 'linkedin', 'discord', 'reddit'));
