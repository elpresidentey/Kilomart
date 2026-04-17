-- Farmers Market Database Schema - Complete Version
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
create table users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  phone text,
  role text not null check (role in ('farmer', 'buyer', 'warehouse_manager', 'logistics', 'admin')),
  location text,
  avatar_url text,
  bio text,
  is_verified boolean default false,
  verification_documents jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Product Categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  icon text,
  description text,
  parent_id uuid references categories(id),
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Produce Listings table
create table produce_listings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references users(id) on delete cascade not null,
  category_id uuid references categories(id),
  product_name text not null,
  slug text,
  price_per_kg decimal(10,2) not null,
  available_quantity decimal(10,2) not null,
  min_order_kg decimal(10,2) default 1,
  max_order_kg decimal(10,2),
  quality_grade text check (quality_grade in ('A', 'B', 'C', 'D')) not null,
  location text not null,
  description text,
  short_description text,
  images text[],
  tags text[],
  is_organic boolean default false,
  harvest_date date,
  expiry_date date,
  status text default 'active' check (status in ('active', 'sold_out', 'withdrawn', 'suspended')),
  view_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Cart table (for shopping cart functionality)
create table cart_items (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references users(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete cascade not null,
  quantity_kg decimal(10,2) not null,
  price_per_kg decimal(10,2) not null,
  total_price decimal(10,2) generated always as (quantity_kg * price_per_kg) stored,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(buyer_id, listing_id)
);

-- Orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  buyer_id uuid references users(id) on delete cascade not null,
  seller_id uuid references users(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete set null,
  quantity_kg decimal(10,2) not null,
  price_per_kg decimal(10,2) not null,
  subtotal decimal(10,2) not null,
  delivery_fee decimal(10,2) default 0,
  service_fee decimal(10,2) default 0,
  total_amount decimal(10,2) not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')),
  delivery_address jsonb not null,
  delivery_instructions text,
  estimated_delivery_date date,
  actual_delivery_date date,
  tracking_number text,
  tracking_url text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Order Items (for orders with multiple items)
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete set null,
  quantity_kg decimal(10,2) not null,
  price_per_kg decimal(10,2) not null,
  total_price decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Payments table
create table payments (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  payer_id uuid references users(id) on delete cascade not null,
  payee_id uuid references users(id) on delete cascade not null,
  amount decimal(10,2) not null,
  currency text default 'NGN',
  payment_method text check (payment_method in ('card', 'bank_transfer', 'wallet', 'cash_on_delivery', 'paystack', 'flutterwave')),
  provider text,
  provider_reference text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  metadata jsonb,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- WAREHOUSE & STORAGE
-- ============================================

-- Warehouses table
create table warehouses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text not null,
  address text,
  capacity_kg decimal(10,2) not null,
  available_space_kg decimal(10,2) not null,
  manager_id uuid references users(id),
  contact_phone text,
  contact_email text,
  facilities text[],
  status text default 'active' check (status in ('active', 'maintenance', 'full', 'inactive')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Inventory table (for warehouse storage)
create table inventory (
  id uuid default gen_random_uuid() primary key,
  warehouse_id uuid references warehouses(id) on delete cascade not null,
  farmer_id uuid references users(id) on delete cascade not null,
  product_name text not null,
  quantity_kg decimal(10,2) not null,
  quality_grade text check (quality_grade in ('A', 'B', 'C', 'D')) not null,
  batch_number text,
  stored_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  status text default 'in_storage' check (status in ('in_storage', 'listed', 'sold', 'withdrawn', 'expired')),
  storage_fee_per_kg decimal(10,2) default 0,
  total_storage_fee decimal(10,2) generated always as (quantity_kg * storage_fee_per_kg) stored,
  listing_id uuid references produce_listings(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- ENGAGEMENT TABLES
-- ============================================

-- Reviews and Ratings table
create table reviews (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  reviewer_id uuid references users(id) on delete cascade not null,
  reviewee_id uuid references users(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  is_buyer_review boolean default true,
  images text[],
  is_verified_purchase boolean default false,
  helpful_count integer default 0,
  status text default 'active' check (status in ('active', 'flagged', 'removed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Notifications table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  type text not null check (type in ('order', 'payment', 'listing', 'system', 'message', 'review')),
  title text not null,
  message text not null,
  data jsonb,
  action_url text,
  is_read boolean default false,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Favorites/Wishlist table
create table favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, listing_id)
);

-- Messages/Conversations table
create table conversations (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references users(id) on delete cascade not null,
  seller_id uuid references users(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete set null,
  last_message_at timestamp with time zone default now(),
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references users(id) on delete cascade not null,
  message text not null,
  is_read boolean default false,
  read_at timestamp with time zone,
  attachments jsonb,
  created_at timestamp with time zone default now()
);

-- ============================================
-- AUDIT & LOGGING
-- ============================================

-- Activity Log
create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table categories enable row level security;
alter table produce_listings enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table warehouses enable row level security;
alter table inventory enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table favorites enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Users policies
create policy "Users can view own profile"
  on users for select
  to authenticated
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on users for select
  to authenticated
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

create policy "Users can update own profile"
  on users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can manage profiles"
  on users for all
  to authenticated
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
  with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

-- Categories policies
create policy "Anyone can view active categories"
  on categories for select
  using (is_active = true);

create policy "Admins can manage categories"
  on categories for all
  to authenticated
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- Listings policies
create policy "Anyone can view active listings"
  on produce_listings for select
  to authenticated, anon
  using (status = 'active' or status = 'sold_out');

create policy "Sellers can manage their listings"
  on produce_listings for all
  to authenticated
  using (seller_id = auth.uid());

-- Cart policies
create policy "Users can view own cart"
  on cart_items for select
  to authenticated
  using (buyer_id = auth.uid());

create policy "Users can manage own cart"
  on cart_items for all
  to authenticated
  using (buyer_id = auth.uid());

-- Orders policies
create policy "Buyers can view their orders"
  on orders for select
  to authenticated
  using (buyer_id = auth.uid());

create policy "Sellers can view orders for their products"
  on orders for select
  to authenticated
  using (seller_id = auth.uid());

create policy "Buyers can create orders"
  on orders for insert
  to authenticated
  with check (buyer_id = auth.uid());

create policy "Sellers can update order status"
  on orders for update
  to authenticated
  using (seller_id = auth.uid());

-- Reviews policies
create policy "Anyone can view approved reviews"
  on reviews for select
  using (status = 'active');

create policy "Users can create reviews for their purchases"
  on reviews for insert
  to authenticated
  with check (reviewer_id = auth.uid());

create policy "Users can update own reviews"
  on reviews for update
  to authenticated
  using (reviewer_id = auth.uid());

-- Notifications policies
create policy "Users can view own notifications"
  on notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on notifications for update
  to authenticated
  using (user_id = auth.uid());

-- Favorites policies
create policy "Users can view own favorites"
  on favorites for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can manage own favorites"
  on favorites for all
  to authenticated
  using (user_id = auth.uid());

-- Conversations policies
create policy "Participants can view conversations"
  on conversations for select
  to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy "Participants can create conversations"
  on conversations for insert
  to authenticated
  with check (buyer_id = auth.uid());

-- Messages policies
create policy "Participants can view messages"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from conversations
      where id = messages.conversation_id
      and (buyer_id = auth.uid() or seller_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on messages for insert
  to authenticated
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from conversations
      where id = messages.conversation_id
      and (buyer_id = auth.uid() or seller_id = auth.uid())
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, phone, role, location, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON produce_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
create or replace function generate_order_number()
returns text as $$
declare
  order_num text;
  exists_check boolean;
begin
  loop
    order_num := 'KM-' || to_char(now(), 'YYYYMMDD') || '-' || floor(random() * 10000)::text;
    select exists(select 1 from orders where order_number = order_num) into exists_check;
    exit when not exists_check;
  end loop;
  return order_num;
end;
$$ language plpgsql;

-- ============================================
-- INDEXES (for performance)
-- ============================================

create index idx_listings_seller on produce_listings(seller_id);
create index idx_listings_category on produce_listings(category_id);
create index idx_listings_status on produce_listings(status);
create index idx_listings_location on produce_listings(location);
create index idx_listings_price on produce_listings(price_per_kg);
create index idx_listings_created on produce_listings(created_at desc);

create index idx_orders_buyer on orders(buyer_id);
create index idx_orders_seller on orders(seller_id);
create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);

create index idx_reviews_listing on reviews(listing_id);
create index idx_reviews_reviewee on reviews(reviewee_id);
create index idx_reviews_rating on reviews(rating);

create index idx_cart_buyer on cart_items(buyer_id);
create index idx_favorites_user on favorites(user_id);
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_unread on notifications(user_id, is_read) where is_read = false;

create index idx_messages_conversation on messages(conversation_id);
create index idx_conversations_buyer on conversations(buyer_id);
create index idx_conversations_seller on conversations(seller_id);

-- ============================================
-- SAMPLE DATA (Enabled for development)
-- ============================================

-- Insert categories
insert into categories (name, slug, icon, description, sort_order) values
  ('Rice', 'rice', 'ðŸŒ¾', 'All varieties of rice including local and imported', 1),
  ('Beans', 'beans', 'ðŸ«˜', 'Nigerian beans varieties - honey, iron, olotu', 2),
  ('Maize', 'maize', 'ðŸŒ½', 'Yellow and white maize for consumption and feed', 3),
  ('Cassava', 'cassava', 'ðŸ ', 'Fresh cassava tubers and cassava products', 4),
  ('Yam', 'yam', 'ðŸ ', 'Puna, water yam, and chinese yam varieties', 5),
  ('Plantain', 'plantain', 'ðŸŒ', 'Green and ripe plantain for cooking', 6),
  ('Vegetables', 'vegetables', 'ðŸ¥¬', 'Leafy greens and vegetables', 7),
  ('Fruits', 'fruits', 'ðŸŠ', 'Seasonal and perennial fruits', 8),
  ('Poultry', 'poultry', 'ðŸ”', 'Chicken, turkey, and eggs', 9),
  ('Livestock', 'livestock', 'ðŸ„', 'Goat, sheep, cattle, and pig', 10),
  ('Grains', 'grains', 'ðŸŒ¾', 'Millet, sorghum, and other grains', 11),
  ('Oil Seeds', 'oil-seeds', 'ðŸŒ»', 'Groundnut, sesame, and palm products', 12);

-- ============================================
-- VIEWS (for easier querying)
-- ============================================

-- View for active listings with seller info
create view active_listings_view as
select 
  l.*,
  u.full_name as seller_name,
  u.location as seller_location,
  u.is_verified as seller_verified,
  c.name as category_name,
  c.slug as category_slug
from produce_listings l
join users u on l.seller_id = u.id
left join categories c on l.category_id = c.id
where l.status = 'active';

-- View for orders with details
create view orders_view as
select 
  o.*,
  buyer.full_name as buyer_name,
  seller.full_name as seller_name,
  l.product_name
from orders o
join users buyer on o.buyer_id = buyer.id
join users seller on o.seller_id = seller.id
left join produce_listings l on o.listing_id = l.id;

-- View for seller stats
create view seller_stats_view as
select 
  u.id as seller_id,
  u.full_name as seller_name,
  count(distinct l.id) as total_listings,
  count(distinct o.id) as total_orders,
  coalesce(sum(o.total_amount), 0) as total_revenue,
  coalesce(avg(r.rating), 0) as average_rating
from users u
left join produce_listings l on u.id = l.seller_id
left join orders o on l.id = o.listing_id and o.status = 'completed'
left join reviews r on u.id = r.reviewee_id
where u.role = 'farmer'
group by u.id, u.full_name;
