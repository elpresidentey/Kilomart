-- Fix infinite recursion in `users` RLS policies.
-- Run this in the Supabase SQL editor for existing environments.

drop policy if exists "Admins can view all profiles" on users;
drop policy if exists "Admins can manage profiles" on users;

create policy "Admins can view all profiles"
  on users for select
  to authenticated
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

create policy "Admins can manage profiles"
  on users for all
  to authenticated
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
  with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');
