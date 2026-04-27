-- Logistics module for Farmers Market
-- Run this after the core schema to enable logistics providers, drivers, vehicles, and shipment tracking.

create extension if not exists "pgcrypto";

-- Keep the shared updated_at helper in place if this file is run on its own.
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

create or replace function public.is_logistics_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role in ('logistics', 'admin')
  );
$$;

create or replace function public.generate_logistics_reference()
returns text
language plpgsql
as $$
declare
  ref text;
  exists_check boolean;
begin
  loop
    ref := 'LG-' || to_char(now(), 'YYYYMMDD') || '-' || floor(random() * 10000)::text;
    select exists (
      select 1
      from public.logistics_shipments
      where reference = ref
    ) into exists_check;
    exit when not exists_check;
  end loop;
  return ref;
end;
$$;

create table if not exists public.logistics_providers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  company_name text not null,
  service_name text not null,
  service_type text not null default 'dispatch' check (service_type in ('dispatch', 'last_mile', 'regional', 'cold_chain')),
  registration_number text unique,
  contact_phone text,
  contact_email text,
  service_area text not null,
  coverage_states text[],
  fleet_size integer default 0 check (fleet_size >= 0),
  description text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'under_review', 'verified', 'suspended')),
  verification_documents jsonb,
  verified_at timestamp with time zone,
  verified_by uuid references public.users(id),
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.logistics_drivers (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references public.logistics_providers(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  phone text,
  license_number text unique,
  license_class text,
  vehicle_name text,
  pickup_area text,
  destination text,
  route text,
  rate_from text,
  capacity_kg numeric(10,2),
  status text not null default 'available' check (status in ('available', 'busy', 'soon', 'off_duty', 'suspended')),
  is_verified boolean default false,
  notes text,
  joined_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.logistics_drivers add column if not exists pickup_area text;
alter table public.logistics_drivers add column if not exists destination text;
alter table public.logistics_drivers add column if not exists route text;
alter table public.logistics_drivers add column if not exists rate_from text;
alter table public.logistics_drivers add column if not exists capacity_kg numeric(10,2);
alter table public.logistics_drivers add column if not exists vehicle_name text;
alter table public.logistics_drivers add column if not exists status text default 'available';
update public.logistics_drivers
set status = coalesce(status, 'available')
where status is null;

do $$
begin
  alter table public.logistics_drivers
    add constraint logistics_drivers_status_check
    check (status in ('available', 'busy', 'soon', 'off_duty', 'suspended'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.logistics_vehicles (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references public.logistics_providers(id) on delete cascade not null,
  driver_id uuid references public.logistics_drivers(id) on delete set null,
  vehicle_name text not null,
  vehicle_type text not null check (vehicle_type in ('truck', 'van', 'pickup', 'lorry', 'bike', 'other')),
  plate_number text not null unique,
  capacity_kg numeric(10,2) not null check (capacity_kg > 0),
  status text not null default 'available' check (status in ('available', 'on_trip', 'maintenance', 'inactive')),
  tracking_code text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.logistics_shipments (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references public.logistics_providers(id) on delete cascade not null,
  driver_id uuid references public.logistics_drivers(id) on delete set null,
  vehicle_id uuid references public.logistics_vehicles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  reference text unique not null,
  pickup_location text not null,
  dropoff_location text not null,
  pickup_contact jsonb,
  dropoff_contact jsonb,
  cargo_description text not null,
  weight_kg numeric(10,2) not null check (weight_kg > 0),
  distance_km numeric(10,2),
  status text not null default 'ready' check (status in ('ready', 'assigned', 'in_transit', 'delivered', 'cancelled')),
  scheduled_pickup_at timestamp with time zone,
  picked_up_at timestamp with time zone,
  delivered_at timestamp with time zone,
  tracking_code text unique,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.logistics_bookings (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references public.logistics_providers(id) on delete cascade not null,
  driver_id uuid references public.logistics_drivers(id) on delete cascade not null,
  booked_by uuid references public.users(id) on delete cascade not null,
  pickup_location text not null,
  dropoff_location text not null,
  booking_status text not null default 'booked' check (booking_status in ('booked', 'cancelled', 'completed')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.logistics_bookings add column if not exists provider_id uuid references public.logistics_providers(id) on delete cascade;
alter table public.logistics_bookings add column if not exists driver_id uuid references public.logistics_drivers(id) on delete cascade;
alter table public.logistics_bookings add column if not exists booked_by uuid references public.users(id) on delete cascade;
alter table public.logistics_bookings add column if not exists pickup_location text;
alter table public.logistics_bookings add column if not exists dropoff_location text;
alter table public.logistics_bookings add column if not exists booking_status text default 'booked';
alter table public.logistics_bookings add column if not exists notes text;

do $$
begin
  alter table public.logistics_bookings
    add constraint logistics_bookings_status_check
    check (booking_status in ('booked', 'cancelled', 'completed'));
exception
  when duplicate_object then null;
end $$;

alter table public.logistics_providers enable row level security;
alter table public.logistics_drivers enable row level security;
alter table public.logistics_vehicles enable row level security;
alter table public.logistics_shipments enable row level security;
alter table public.logistics_bookings enable row level security;

drop policy if exists "Logistics providers can view their record" on public.logistics_providers;
create policy "Logistics providers can view their record"
  on public.logistics_providers for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists "Logistics users can create their provider record" on public.logistics_providers;
create policy "Logistics users can create their provider record"
  on public.logistics_providers for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_logistics_user());

drop policy if exists "Logistics providers can update their record" on public.logistics_providers;
create policy "Logistics providers can update their record"
  on public.logistics_providers for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin_user())
  with check (user_id = auth.uid() or public.is_admin_user());

drop policy if exists "Logistics providers can delete their record" on public.logistics_providers;
create policy "Logistics providers can delete their record"
  on public.logistics_providers for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists "Logistics teams can view drivers" on public.logistics_drivers;
create policy "Logistics teams can view drivers"
  on public.logistics_drivers for select
  to anon, authenticated
  using (
    public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
    or status = 'available'
  );

drop policy if exists "Logistics teams can manage drivers" on public.logistics_drivers;
create policy "Logistics teams can manage drivers"
  on public.logistics_drivers for all
  to authenticated
  using (
    public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Logistics teams can view vehicles" on public.logistics_vehicles;
create policy "Logistics teams can view vehicles"
  on public.logistics_vehicles for select
  to authenticated
  using (
    public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Logistics teams can manage vehicles" on public.logistics_vehicles;
create policy "Logistics teams can manage vehicles"
  on public.logistics_vehicles for all
  to authenticated
  using (
    public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Logistics teams can view shipments" on public.logistics_shipments;
create policy "Logistics teams can view shipments"
  on public.logistics_shipments for select
  to authenticated
  using (
    public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.logistics_drivers d
      where d.id = driver_id
        and d.user_id = auth.uid()
    )
  );

drop policy if exists "Anyone can book available drivers" on public.logistics_bookings;
create policy "Anyone can book available drivers"
  on public.logistics_bookings for insert
  to authenticated
  with check (
    booked_by = auth.uid()
    and exists (
      select 1
      from public.logistics_drivers d
      where d.id = driver_id
        and d.status = 'available'
    )
  );

drop policy if exists "Users can view own bookings" on public.logistics_bookings;
create policy "Users can view own bookings"
  on public.logistics_bookings for select
  to authenticated
  using (
    booked_by = auth.uid()
    or public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can manage own bookings" on public.logistics_bookings;
create policy "Users can manage own bookings"
  on public.logistics_bookings for update
  to authenticated
  using (
    booked_by = auth.uid()
    or public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    booked_by = auth.uid()
    or public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  );

create or replace function public.book_logistics_driver(
  p_driver_id uuid,
  p_pickup_location text,
  p_dropoff_location text,
  p_notes text default null
)
returns public.logistics_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider_id uuid;
  v_booking public.logistics_bookings;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select provider_id
    into v_provider_id
  from public.logistics_drivers
  where id = p_driver_id
    and status = 'available'
  limit 1;

  if v_provider_id is null then
    raise exception 'Driver is not available';
  end if;

  insert into public.logistics_bookings (
    provider_id,
    driver_id,
    booked_by,
    pickup_location,
    dropoff_location,
    notes
  ) values (
    v_provider_id,
    p_driver_id,
    auth.uid(),
    p_pickup_location,
    p_dropoff_location,
    p_notes
  )
  returning * into v_booking;

  update public.logistics_drivers
    set status = 'busy'
  where id = p_driver_id;

  return v_booking;
end;
$$;

drop policy if exists "Logistics teams can manage shipments" on public.logistics_shipments;
create policy "Logistics teams can manage shipments"
  on public.logistics_shipments for all
  to authenticated
  using (
    public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin_user()
    or exists (
      select 1
      from public.logistics_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
    )
  );

drop trigger if exists update_logistics_providers_updated_at on public.logistics_providers;
create trigger update_logistics_providers_updated_at
  before update on public.logistics_providers
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_logistics_drivers_updated_at on public.logistics_drivers;
create trigger update_logistics_drivers_updated_at
  before update on public.logistics_drivers
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_logistics_vehicles_updated_at on public.logistics_vehicles;
create trigger update_logistics_vehicles_updated_at
  before update on public.logistics_vehicles
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_logistics_shipments_updated_at on public.logistics_shipments;
create trigger update_logistics_shipments_updated_at
  before update on public.logistics_shipments
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_logistics_shipment_reference on public.logistics_shipments;
create or replace function public.set_logistics_shipment_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference is null or trim(new.reference) = '' then
    new.reference := public.generate_logistics_reference();
  end if;
  return new;
end;
$$;

create trigger set_logistics_shipment_reference
  before insert on public.logistics_shipments
  for each row execute function public.set_logistics_shipment_reference();

drop trigger if exists update_logistics_bookings_updated_at on public.logistics_bookings;
create trigger update_logistics_bookings_updated_at
  before update on public.logistics_bookings
  for each row execute function public.update_updated_at_column();

create index if not exists idx_logistics_providers_user on public.logistics_providers(user_id);
create index if not exists idx_logistics_providers_status on public.logistics_providers(verification_status);
create index if not exists idx_logistics_drivers_provider on public.logistics_drivers(provider_id);
create index if not exists idx_logistics_drivers_availability on public.logistics_drivers(status);
create index if not exists idx_logistics_vehicles_provider on public.logistics_vehicles(provider_id);
create index if not exists idx_logistics_vehicles_driver on public.logistics_vehicles(driver_id);
create index if not exists idx_logistics_shipments_provider on public.logistics_shipments(provider_id);
create index if not exists idx_logistics_shipments_driver on public.logistics_shipments(driver_id);
create index if not exists idx_logistics_shipments_vehicle on public.logistics_shipments(vehicle_id);
create index if not exists idx_logistics_shipments_status on public.logistics_shipments(status);
create index if not exists idx_logistics_bookings_driver on public.logistics_bookings(driver_id);
create index if not exists idx_logistics_bookings_booked_by on public.logistics_bookings(booked_by);
create index if not exists idx_logistics_bookings_status on public.logistics_bookings(booking_status);
