-- These author-side procedures are fully covered by their existing RLS
-- policies. Only acceptance needs SECURITY DEFINER because a pending reader
-- assignment is intentionally invisible to the recipient before acceptance.
alter function public.create_reading_invitation(uuid, text, text, text) security invoker;
alter function public.renew_reading_invitation(uuid, text) security invoker;
alter function public.revoke_reading_invitation(uuid) security invoker;
