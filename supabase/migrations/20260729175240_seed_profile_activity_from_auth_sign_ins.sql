update public.profiles as profile
set last_active_at = auth_user.last_sign_in_at
from auth.users as auth_user
where profile.id = auth_user.id
  and auth_user.last_sign_in_at is not null
  and (
    profile.last_active_at is null
    or profile.last_active_at < auth_user.last_sign_in_at
  );

comment on column public.profiles.last_active_at is
  'Last authenticated application activity, seeded from Auth sign-ins and refreshed at most once every 24 hours.';
