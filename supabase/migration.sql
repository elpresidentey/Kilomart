-- Farmers Market Database Migration
-- Run this to add new tables to existing schema

-- ============================================
-- NEW TABLES (these won't conflict)
-- ============================================

-- Product Categories table
create table if not exists categories (
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

-- Cart table (for shopping cart functionality)
create table if not exists cart_items (
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

-- Order Items (for orders with multiple items)
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete set null,
  quantity_kg decimal(10,2) not null,
  price_per_kg decimal(10,2) not null,
  total_price decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Payments table
create table if not exists payments (
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

-- Reviews and Ratings table
create table if not exists reviews (
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
create table if not exists notifications (
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
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, listing_id)
);

-- Messages/Conversations table
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references users(id) on delete cascade not null,
  seller_id uuid references users(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete set null,
  last_message_at timestamp with time zone default now(),
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references users(id) on delete cascade not null,
  message text not null,
  is_read boolean default false,
  read_at timestamp with time zone,
  attachments jsonb,
  created_at timestamp with time zone default now()
);

-- Activity Log
create table if not exists activity_logs (
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

-- ============================================
-- ALTER EXISTING TABLES (add missing columns)
-- ============================================

-- Add columns to users table if they don't exist
alter table users add column if not exists avatar_url text;
alter table users add column if not exists bio text;
alter table users add column if not exists is_verified boolean default false;
alter table users add column if not exists verification_documents jsonb;
alter table users add column if not exists updated_at timestamp with time zone default now();

-- Add columns to produce_listings table
alter table produce_listings add column if not exists category_id uuid references categories(id);
alter table produce_listings add column if not exists slug text;
alter table produce_listings add column if not exists min_order_kg decimal(10,2) default 1;
alter table produce_listings add column if not exists max_order_kg decimal(10,2);
alter table produce_listings add column if not exists short_description text;
alter table produce_listings add column if not exists tags text[];
alter table produce_listings add column if not exists is_organic boolean default false;
alter table produce_listings add column if not exists harvest_date date;
alter table produce_listings add column if not exists expiry_date date;
alter table produce_listings add column if not exists view_count integer default 0;

-- Update produce_listings status check constraint
do $$
begin
  alter table produce_listings drop constraint if exists produce_listings_status_check;
  alter table produce_listings add constraint produce_listings_status_check 
    check (status in ('active', 'sold_out', 'withdrawn', 'suspended'));
exception
  when others then null;
end $$;

-- Add columns to orders table
alter table orders add column if not exists order_number text unique;
alter table orders add column if not exists seller_id uuid references users(id);
alter table orders add column if not exists price_per_kg decimal(10,2);
alter table orders add column if not exists subtotal decimal(10,2);
alter table orders add column if not exists delivery_fee decimal(10,2) default 0;
alter table orders add column if not exists service_fee decimal(10,2) default 0;
alter table orders add column if not exists total_amount decimal(10,2);
alter table orders add column if not exists delivery_address jsonb;
alter table orders add column if not exists delivery_instructions text;
alter table orders add column if not exists estimated_delivery_date date;
alter table orders add column if not exists actual_delivery_date date;
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists tracking_url text;

-- Update orders status check constraint
do $$
begin
  alter table orders drop constraint if exists orders_status_check;
  alter table orders add constraint orders_status_check 
    check (status in ('pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'));
exception
  when others then null;
end $$;

-- Add columns to warehouses table
alter table warehouses add column if not exists address text;
alter table warehouses add column if not exists available_space_kg decimal(10,2);
alter table warehouses add column if not exists contact_phone text;
alter table warehouses add column if not exists contact_email text;
alter table warehouses add column if not exists facilities text[];
alter table warehouses add column if not exists updated_at timestamp with time zone default now();

-- Update warehouses status check constraint
do $$
begin
  alter table warehouses drop constraint if exists warehouses_status_check;
  alter table warehouses add constraint warehouses_status_check 
    check (status in ('active', 'maintenance', 'full', 'inactive'));
exception
  when others then null;
end $$;

-- Add columns to inventory table
alter table inventory add column if not exists batch_number text;
alter table inventory add column if not exists expires_at timestamp with time zone;
alter table inventory add column if not exists total_storage_fee decimal(10,2) generated always as (quantity_kg * storage_fee_per_kg) stored;
alter table inventory add column if not exists updated_at timestamp with time zone default now();

-- Update inventory status check constraint
do $$
begin
  alter table inventory drop constraint if exists inventory_status_check;
  alter table inventory add constraint inventory_status_check 
    check (status in ('in_storage', 'listed', 'sold', 'withdrawn', 'expired'));
exception
  when others then null;
end $$;

-- ============================================
-- ENABLE RLS ON NEW TABLES
-- ============================================

alter table categories enable row level security;
alter table cart_items enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table favorites enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

-- Categories policies
drop policy if exists "Anyone can view active categories" on categories;
create policy "Anyone can view active categories"
  on categories for select
  using (is_active = true);

drop policy if exists "Admins can manage categories" on categories;
create policy "Admins can manage categories"
  on categories for all
  to authenticated
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- Cart policies
drop policy if exists "Users can view own cart" on cart_items;
create policy "Users can view own cart"
  on cart_items for select
  to authenticated
  using (buyer_id = auth.uid());

drop policy if exists "Users can manage own cart" on cart_items;
create policy "Users can manage own cart"
  on cart_items for all
  to authenticated
  using (buyer_id = auth.uid());

-- Reviews policies
drop policy if exists "Anyone can view approved reviews" on reviews;
create policy "Anyone can view approved reviews"
  on reviews for select
  using (status = 'active');

drop policy if exists "Users can create reviews for their purchases" on reviews;
create policy "Users can create reviews for their purchases"
  on reviews for insert
  to authenticated
  with check (reviewer_id = auth.uid());

drop policy if exists "Users can update own reviews" on reviews;
create policy "Users can update own reviews"
  on reviews for update
  to authenticated
  using (reviewer_id = auth.uid());

-- Notifications policies
drop policy if exists "Users can view own notifications" on notifications;
create policy "Users can view own notifications"
  on notifications for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can update own notifications" on notifications;
create policy "Users can update own notifications"
  on notifications for update
  to authenticated
  using (user_id = auth.uid());

-- Favorites policies
drop policy if exists "Users can view own favorites" on favorites;
create policy "Users can view own favorites"
  on favorites for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can manage own favorites" on favorites;
create policy "Users can manage own favorites"
  on favorites for all
  to authenticated
  using (user_id = auth.uid());

-- Conversations policies
drop policy if exists "Participants can view conversations" on conversations;
create policy "Participants can view conversations"
  on conversations for select
  to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "Participants can create conversations" on conversations;
create policy "Participants can create conversations"
  on conversations for insert
  to authenticated
  with check (buyer_id = auth.uid());

-- Messages policies
drop policy if exists "Participants can view messages" on messages;
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

drop policy if exists "Participants can send messages" on messages;
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

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_listings_seller on produce_listings(seller_id);
create index if not exists idx_listings_category on produce_listings(category_id);
create index if not exists idx_listings_status on produce_listings(status);
create index if not exists idx_listings_location on produce_listings(location);
create index if not exists idx_listings_created on produce_listings(created_at desc);

create index if not exists idx_orders_buyer on orders(buyer_id);
create index if not exists idx_orders_seller on orders(seller_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);

create index if not exists idx_reviews_listing on reviews(listing_id);
create index if not exists idx_reviews_reviewee on reviews(reviewee_id);
create index if not exists idx_reviews_rating on reviews(rating);

create index if not exists idx_cart_buyer on cart_items(buyer_id);
create index if not exists idx_favorites_user on favorites(user_id);
create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_unread on notifications(user_id, is_read) where is_read = false;

create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_conversations_buyer on conversations(buyer_id);
create index if not exists idx_conversations_seller on conversations(seller_id);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert categories (CORE AGRICULTURAL PRODUCE ONLY)
insert into categories (name, slug, icon, description, sort_order) values
  ('Rice', 'rice', 'ðŸŒ¾', 'All varieties of rice including local and imported', 1),
  ('Beans', 'beans', 'ðŸ«˜', 'Nigerian beans varieties - honey, iron, olotu', 2),
  ('Maize', 'maize', 'ðŸŒ½', 'Yellow and white maize for consumption and feed', 3),
  ('Cassava', 'cassava', 'ðŸ ', 'Fresh cassava tubers and cassava products', 4),
  ('Yam', 'yam', 'ðŸ ', 'Puna, water yam, and chinese yam varieties', 5),
  ('Plantain', 'plantain', 'ðŸŒ', 'Green and ripe plantain for cooking', 6),
  ('Vegetables', 'vegetables', 'ðŸ¥¬', 'Fresh leafy and root vegetables', 7),
  ('Fruits', 'fruits', 'ðŸŠ', 'Tropical and local fruits', 8),
  ('Poultry', 'poultry', 'ðŸ”', 'Chicken, turkey, and eggs', 9),
  ('Livestock', 'livestock', 'ðŸ„', 'Goat, sheep, cattle, and pig', 10),
  ('Grains', 'grains', 'ðŸŒ¾', 'Millet, sorghum, and other grains', 11),
  ('Oil Seeds', 'oil-seeds', 'ðŸŒ»', 'Groundnut, sesame, and palm products', 12)
on conflict (slug) do nothing;

-- ============================================
-- SAMPLE DATA - CATEGORIES ONLY
-- ============================================
-- Note: Sample users and listings require those users to exist in auth.users first
-- For now, only categories are inserted. To add sample listings:
-- 1. Create users in Supabase Auth panel
-- 2. Then uncomment and run the sample data section below

/*
-- Sample Listings - Rice (Category: rice)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  c.id,
  'Premium Long Grain Rice (50kg bags)',
  'premium-long-grain-rice',
  950.00,
  5000,
  50,
  'A',
  'Ibadan, Oyo State',
  'Premium quality long grain rice, directly from our farm in Ibadan. Well dried, properly sorted, and stone-free. Perfect for jollof rice, fried rice, and all your favorite dishes. Available in 50kg bags. We ensure consistent quality with every order.',
  'Stone-free premium long grain rice from Ibadan',
  array['https://example.com/rice1.jpg', 'https://example.com/rice2.jpg'],
  array['stone-free', 'premium', 'export-quality'],
  true,
  'active'
from categories c where c.slug = 'rice'
on conflict do nothing;

insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  c.id,
  'Ofada Rice (Local Variety)',
  'ofada-rice-local',
  1800.00,
  2000,
  25,
  'A',
  'Ibadan, Oyo State',
  'Authentic Ofada rice - the favorite for local dishes. Rich aroma, perfect texture. This indigenous variety is highly sought after for its unique taste. Great for Ofada sauce and traditional ceremonies.',
  'Authentic Ofada rice with rich aroma',
  array['https://example.com/ofada1.jpg'],
  array['ofada', 'local', 'aromatic'],
  true,
  'active'
from categories c where c.slug = 'rice'
on conflict do nothing;

-- Sample Listings - Beans (Category: beans)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  c.id,
  'Honey Beans (Oloyin)',
  'honey-beans-oloyin',
  1450.00,
  3000,
  50,
  'A',
  'Awka, Anambra State',
  'Sweet honey beans, perfect for ewa agoyin and other bean dishes. Our beans are carefully handpicked, cleaned, and sorted to ensure zero stones or debris. The natural sweetness makes every meal delicious.',
  'Sweet honey beans, stone-free and clean',
  array['https://example.com/beans1.jpg'],
  array['oloyin', 'sweet', 'stone-free', 'ewa-agoyin'],
  false,
  'active'
from categories c where c.slug = 'beans'
on conflict do nothing;

insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  c.id,
  'Iron Beans (Oloi)',
  'iron-beans-oloi',
  1200.00,
  4000,
  50,
  'B',
  'Awka, Anambra State',
  'Iron-rich beans perfect for moin-moin and akara. High protein content and great texture when cooked. Available in bulk quantities for restaurants and food vendors.',
  'Iron-rich beans for moin-moin and akara',
  array['https://example.com/ironbeans.jpg'],
  array['iron-beans', 'protein-rich', 'bulk'],
  false,
  'active'
from categories c where c.slug = 'beans'
on conflict do nothing;

-- Sample Listings - Yam (Category: yam)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  c.id,
  'Puna Yam (White)',
  'puna-yam-white',
  450.00,
  2500,
  'A',
  'Abeokuta, Ogun State',
  'Premium Puna yam from our family farm. These yams are carefully harvested at the right maturity for the best taste and texture. Perfect for pounded yam, yam porridge, or roasting. Firm texture, sweet taste.',
  'Premium Puna yam, firm and sweet',
  array['https://example.com/punayam.jpg'],
  array['puna', 'white-yam', 'sweet'],
  true,
  'active'
from categories c where c.slug = 'yam'
on conflict do nothing;

insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  c.id,
  'Water Yam',
  'water-yam',
  380.00,
  1800,
  'B',
  'Abeokuta, Ogun State',
  'Water yam for all your cooking needs. Great for boiling, frying, or making into yam flour. Soft texture when cooked. Ideal for families and restaurants.',
  'Soft water yam, great for all cooking',
  array['https://example.com/wateryam.jpg'],
  array['water-yam', 'soft', 'versatile'],
  false,
  'active'
from categories c where c.slug = 'yam'
on conflict do nothing;

-- Sample Listings - Cassava (Category: cassava)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  c.id,
  'Fresh Cassava Tubers',
  'fresh-cassava-tubers',
  280.00,
  5000,
  100,
  'A',
  'Abeokuta, Ogun State',
  'Fresh cassava tubers harvested daily. Perfect for making garri, fufu, tapioca, or cooking as porridge. High starch content, excellent quality. We supply in bulk for processing plants too.',
  'Fresh daily-harvested cassava tubers',
  array['https://example.com/cassava.jpg'],
  array['fresh', 'high-starch', 'garri-making'],
  false,
  'active'
from categories c where c.slug = 'cassava'
on conflict do nothing;

-- Sample Listings - Maize (Category: maize)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  c.id,
  'Yellow Maize (Animal Feed Grade)',
  'yellow-maize-animal-feed',
  320.00,
  10000,
  500,
  'B',
  'Kano, Kano State',
  'High-quality yellow maize suitable for animal feed and human consumption. Large-scale production from our Northern farms. Available in bulk for poultry farmers and feed mills.',
  'Bulk yellow maize for feed and consumption',
  array['https://example.com/maize.jpg'],
  array['yellow-maize', 'bulk', 'animal-feed'],
  false,
  'active'
from categories c where c.slug = 'maize'
on conflict do nothing;

-- Sample Listings - Grains (Category: grains)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  c.id,
  'Pearl Millet (Gero)',
  'pearl-millet-gero',
  450.00,
  3500,
  100,
  'A',
  'Kano, Kano State',
  'Premium pearl millet (gero) from Northern Nigeria. Highly nutritious, perfect for making tuwo, porridge, or flour. A staple in many Nigerian households. Cleaned and sorted for immediate use.',
  'Premium pearl millet from Northern farms',
  array['https://example.com/millet.jpg'],
  array['millet', 'gero', 'nutritious', 'tuwo'],
  true,
  'active'
from categories c where c.slug = 'grains'
on conflict do nothing;

-- Sample Listings - Oil Seeds (Category: oil-seeds)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  c.id,
  'Groundnut (Peanut) Kernels',
  'groundnut-peanut-kernels',
  750.00,
  4000,
  50,
  'A',
  'Kano, Kano State',
  'High-quality groundnut kernels for making oil, snacks, or adding to dishes. Rich in oil content and protein. Perfect for kulikuli, groundnut soup, or roasting. Fresh from the farm.',
  'High-oil groundnut kernels from Kano',
  array['https://example.com/groundnut.jpg'],
  array['groundnut', 'peanut', 'high-oil', 'kulikuli'],
  false,
  'active'
from categories c where c.slug = 'oil-seeds'
on conflict do nothing;
*/

-- ============================================
-- VIEWS
-- ============================================

-- Drop existing views if they exist
drop view if exists active_listings_view;
drop view if exists orders_view;
drop view if exists seller_stats_view;

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

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at (if not exists)
do $$
declare
  tables text[] := array['users', 'produce_listings', 'cart_items', 'orders', 'payments', 'warehouses', 'inventory', 'reviews'];
  t text;
begin
  foreach t in array tables
  loop
    execute format('drop trigger if exists %I_updated_at on %I', t, t);
    execute format('create trigger %I_updated_at before update on %I for each row execute function update_updated_at_column()', t, t);
  end loop;
end $$;

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

-- Update existing orders with order numbers
update orders set order_number = generate_order_number() where order_number is null;
