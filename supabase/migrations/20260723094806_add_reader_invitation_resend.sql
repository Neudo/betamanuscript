create or replace function public.renew_reading_invitation(
  p_invitation_id uuid,
  p_token_digest text
)
returns table (
  recipient_email text,
  personal_note text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_invitation public.reading_invitations%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if p_token_digest !~ '^[a-f0-9]{64}$' then
    raise exception 'The invitation token is invalid.' using errcode = '22023';
  end if;

  select invitation.* into target_invitation
  from public.reading_invitations invitation
  join public.reading_rounds reading_round on reading_round.id = invitation.reading_round_id
  join public.manuscript_versions manuscript_version on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where invitation.id = p_invitation_id
    and manuscript.owner_id = auth.uid()
  for update of invitation;

  if not found then
    raise exception 'This invitation does not exist or is not yours.' using errcode = '42501';
  end if;

  if target_invitation.status <> 'pending' then
    raise exception 'Only pending invitations can be resent.' using errcode = '22023';
  end if;

  update public.reading_invitations
  set
    token_digest = p_token_digest,
    expires_at = now() + interval '14 days',
    sent_at = null
  where id = p_invitation_id
  returning reading_invitations.recipient_email,
    reading_invitations.personal_note,
    reading_invitations.expires_at
  into recipient_email, personal_note, expires_at;

  return next;
end;
$$;

revoke all on function public.renew_reading_invitation(uuid, text) from public, anon;
grant execute on function public.renew_reading_invitation(uuid, text) to authenticated;
