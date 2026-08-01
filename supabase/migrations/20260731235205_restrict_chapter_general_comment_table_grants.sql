-- Supabase default grants can be broader than this feedback surface needs.
-- Keep the API role to the four DML operations governed by RLS.
revoke all on table public.chapter_general_comments from public, anon, authenticated;
grant select, insert, update, delete on table public.chapter_general_comments to authenticated;
