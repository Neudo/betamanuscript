-- Pending invitations are intentionally not reader slots. A slot begins only
-- once an authenticated recipient accepts their invitation.
alter type public.reader_assignment_status add value if not exists 'pending';
alter type public.reader_assignment_status add value if not exists 'started';
