# Farmers Market - Agricultural Marketplace Platform

A digital platform that connects farmers, wholesalers, retailers, and consumers through a standardized per-kilogram marketplace, supported by storage and logistics infrastructure.

## Features

- **Standardized Pricing**: All produce listed with per-kilogram (â‚¦/kg) pricing
- **Farmer Dashboard**: Manage inventory, create listings, track earnings
- **Buyer Marketplace**: Browse, filter, and purchase produce
- **Order Management**: Track orders from purchase to delivery
- **Operations View**: Basic warehouse and inventory visibility for storage/logistics teams
- **Quality Grading**: A-D quality grading system for produce
- **Mobile-First Design**: Optimized for low-end Android devices

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Project Structure

```
src/
â”œâ”€â”€ components/       # React components
â”‚   â”œâ”€â”€ ui/          # Reusable UI components (Button, Card, Input, Badge)
â”‚   â”œâ”€â”€ Layout.tsx   # Navigation layout
â”‚   â””â”€â”€ ProduceCard.tsx
â”œâ”€â”€ pages/           # Page components
â”‚   â”œâ”€â”€ Login.tsx
â”‚   â”œâ”€â”€ Signup.tsx
â”‚   â”œâ”€â”€ Marketplace.tsx
â”‚   â”œâ”€â”€ FarmerDashboard.tsx
â”‚   â”œâ”€â”€ BuyerOrders.tsx
â”‚   â””â”€â”€ CreateListing.tsx
â”œâ”€â”€ hooks/           # Custom React hooks
â”‚   â””â”€â”€ useAuth.ts   # Authentication hook
â”œâ”€â”€ lib/             # Utility functions
â”‚   â”œâ”€â”€ supabase.ts  # Supabase client
â”‚   â””â”€â”€ utils.ts     # Helper functions
â”œâ”€â”€ types/           # TypeScript types
â”‚   â””â”€â”€ index.ts
â”œâ”€â”€ App.tsx          # Main app with routing
â””â”€â”€ main.tsx         # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-folder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Set up Supabase database:
   - For a fresh project, run `supabase/schema.sql`
   - If you already have the earlier schema, run `supabase/migration.sql` after the base schema so newer tables, columns, and policies are added safely

6. Start the development server:
```bash
npm run dev
```

## MVP Scope

The current MVP covers authentication, produce listings, marketplace browsing, cart and checkout, order tracking, and a basic storage/logistics operations view.
Deeper warehouse automation, route planning, and cold-chain workflows should stay in phase 2 unless you want to expand the first release.

## Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table (extends Supabase auth.users)
create table users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  phone text,
  role text not null check (role in ('farmer', 'buyer', 'warehouse_manager', 'logistics')),
  location text,
  created_at timestamp with time zone default now()
);

-- Produce Listings table
create table produce_listings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references users(id) on delete cascade not null,
  product_name text not null,
  price_per_kg decimal(10,2) not null,
  available_quantity decimal(10,2) not null,
  quality_grade text check (quality_grade in ('A', 'B', 'C', 'D')) not null,
  location text not null,
  description text,
  images text[],
  status text default 'active' check (status in ('active', 'sold', 'withdrawn')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references users(id) on delete cascade not null,
  listing_id uuid references produce_listings(id) on delete cascade not null,
  quantity_kg decimal(10,2) not null,
  total_price decimal(10,2) not null,
  status text default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  delivery_address text not null,
  payment_method text check (payment_method in ('card', 'bank_transfer', 'wallet')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS Policies
alter table users enable row level security;
alter table produce_listings enable row level security;
alter table orders enable row level security;

-- Users policies
create policy "Users can view their own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on users for update
  using (auth.uid() = id);

-- Listings policies
create policy "Anyone can view active listings"
  on produce_listings for select
  using (status = 'active');

create policy "Farmers can manage their listings"
  on produce_listings for all
  using (auth.uid() = seller_id);

-- Orders policies
create policy "Buyers can view their orders"
  on orders for select
  using (auth.uid() = buyer_id);

create policy "Sellers can view orders for their listings"
  on orders for select
  using (
    exists (
      select 1 from produce_listings
      where produce_listings.id = orders.listing_id
      and produce_listings.seller_id = auth.uid()
    )
  );

create policy "Buyers can create orders"
  on orders for insert
  with check (auth.uid() = buyer_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, phone, role, location)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'role')::text,
    new.raw_user_meta_data->>'location'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Design System

### Colors
- **Primary**: Deep muted green (#16a34a)
- **Secondary**: Soft earthy brown tones
- **Background**: Stone/off-white (#fafaf9)
- **Text**: Stone gray palette

### Typography
- **Font**: Inter (system-ui fallback)
- **Hierarchy**: Bold numbers for prices, subtle labels

### Components
- **Cards**: Soft edges, minimal borders, subtle shadows
- **Buttons**: Rounded corners, clear hierarchy
- **Inputs**: Clean borders, focus states with primary color

## Deployment

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Paystack setup

- `VITE_API_BASE_URL` should point to the deployed app origin when using the Paystack initialize and verify routes.
- `PAYSTACK_SECRET_KEY` must be set in the server environment, not in the browser bundle.
- In local development, run through a server that exposes `/api/paystack/*` routes, or keep checkout on cash-on-delivery/bank transfer until those routes are available.

## License

MIT
