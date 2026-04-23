-- Repair missing public.users rows for auth users and make profile creation resilient.
-- Run this in Supabase after your schema is in place.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, phone, role, location, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'User'
    ),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = excluded.role,
    location = excluded.location,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

drop policy if exists "Users can create own profile" on users;
create policy "Users can create own profile"
  on users for insert
  to authenticated
  with check (auth.uid() = id);

insert into public.users (id, email, full_name, phone, role, location, avatar_url)
select
  au.id,
  au.email,
  coalesce(
    nullif(trim(coalesce(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')), ''),
    nullif(split_part(coalesce(au.email, ''), '@', 1), ''),
    'User'
  ),
  au.raw_user_meta_data->>'phone',
  coalesce(au.raw_user_meta_data->>'role', 'buyer'),
  au.raw_user_meta_data->>'location',
  au.raw_user_meta_data->>'avatar_url'
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  phone = excluded.phone,
  role = excluded.role,
  location = excluded.location,
  avatar_url = excluded.avatar_url;
