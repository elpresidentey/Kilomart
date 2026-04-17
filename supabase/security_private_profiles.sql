-- Harden profile access so users can only read their own private profile data.
-- Run this in the Supabase SQL editor for existing environments.

drop policy if exists "Users can view all profiles" on users;
drop policy if exists "Users can view own profile" on users;
drop policy if exists "Admins can view all profiles" on users;
drop policy if exists "Users can update own profile" on users;
drop policy if exists "Admins can manage profiles" on users;

create policy "Users can view own profile"
  on users for select
  to authenticated
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on users for select
  to authenticated
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "Users can update own profile"
  on users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can manage profiles"
  on users for all
  to authenticated
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from users where id = auth.uid() and role = 'admin'));
