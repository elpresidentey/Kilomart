-- ============================================
-- COMPREHENSIVE SAMPLE PRODUCTS FOR MARKETPLACE
-- Run this AFTER running migration.sql
-- ============================================

-- ============================================
-- STEP 1: CREATE SAMPLE FARMER USERS
-- ============================================

-- Insert into auth.users (this will trigger profile creation)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values 
  ('550e8400-e29b-41d4-a716-446655440001', 'farmer1@farmersmarket.ng', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"full_name": "Alhaji Ibrahim Danladi", "role": "farmer", "location": "Kano, Kano State", "phone": "+2348012345678"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'farmer2@farmersmarket.ng', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"full_name": "Mama Nkechi Okafor", "role": "farmer", "location": "Enugu, Enugu State", "phone": "+2348023456789"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'farmer3@farmersmarket.ng', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"full_name": "Chief Oluwaseun Adeyemi", "role": "farmer", "location": "Ibadan, Oyo State", "phone": "+2348034567890"}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'farmer4@farmersmarket.ng', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"full_name": "Hajiya Amina Bello", "role": "farmer", "location": "Zaria, Kaduna State", "phone": "+2348045678901"}')
on conflict (id) do nothing;

-- Ensure public.users records exist (in case trigger didn't work)
insert into public.users (id, email, full_name, role, location, phone, is_verified)
values 
  ('550e8400-e29b-41d4-a716-446655440001', 'farmer1@farmersmarket.ng', 'Alhaji Ibrahim Danladi', 'farmer', 'Kano, Kano State', '+2348012345678', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'farmer2@farmersmarket.ng', 'Mama Nkechi Okafor', 'farmer', 'Enugu, Enugu State', '+2348023456789', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'farmer3@farmersmarket.ng', 'Chief Oluwaseun Adeyemi', 'farmer', 'Ibadan, Oyo State', '+2348034567890', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'farmer4@farmersmarket.ng', 'Hajiya Amina Bello', 'farmer', 'Zaria, Kaduna State', '+2348045678901', true)
on conflict (id) do update set 
  full_name = excluded.full_name,
  role = excluded.role,
  location = excluded.location,
  phone = excluded.phone,
  is_verified = excluded.is_verified;

-- ============================================
-- STEP 2: CREATE SAMPLE PRODUCTS
-- ============================================

-- Long Grain Rice varieties
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Premium Long Grain Rice (Ofada)',
  'premium-long-grain-ofada-rice',
  1200.00,
  5000,
  25,
  'A',
  'Abeokuta, Ogun State',
  'Authentic Ofada rice, known for its distinctive aroma and flavor. This indigenous Nigerian rice variety is highly sought after for special occasions and everyday meals. Our Ofada rice is stone-free, properly destoned, and packaged in 25kg bags. Perfect for Ofada sauce and traditional dishes.',
  'Authentic Ofada rice with distinctive aroma, stone-free',
  array['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', 'https://images.unsplash.com/photo-1599455219476-65f6c5a8c78c?w=800'],
  array['ofada', 'long-grain', 'premium', 'aromatic', 'indigenous'],
  false,
  'active'
from categories c where c.slug = 'rice'
on conflict do nothing;

-- Jasmine Rice
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Thai Jasmine Rice - Premium Import Quality',
  'thai-jasmine-rice-premium',
  1500.00,
  3000,
  50,
  'A',
  'Lagos, Lagos State',
  'Premium Thai Jasmine rice with floral fragrance and soft, sticky texture when cooked. Perfect for Asian cuisine, fried rice, and special occasions. High-quality import grade at local prices. Available in 50kg bags.',
  'Fragrant Thai Jasmine rice, soft and sticky texture',
  array['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800'],
  array['jasmine', 'thai', 'fragrant', 'premium', 'import-quality'],
  false,
  'active'
from categories c where c.slug = 'rice'
on conflict do nothing;

-- Local White Rice
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Local White Rice - Direct from Farm',
  'local-white-rice-farm-direct',
  800.00,
  10000,
  100,
  'B',
  'Kano, Kano State',
  'Affordable local white rice direct from Northern farms. Well-milled and properly dried. Ideal for restaurants, caterers, and bulk buyers. Bulk discounts available for orders above 500kg.',
  'Affordable local white rice, bulk pricing available',
  array['https://images.unsplash.com/photo-1599455219476-65f6c5a8c78c?w=800'],
  array['local', 'white-rice', 'bulk', 'affordable', 'restaurant-grade'],
  false,
  'active'
from categories c where c.slug = 'rice'
on conflict do nothing;

-- Parboiled Rice
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Parboiled Rice - Nutrient Rich',
  'parboiled-rice-nutrient-rich',
  950.00,
  8000,
  50,
  'A',
  'Benin City, Edo State',
  'Nutrient-rich parboiled rice that retains more vitamins and minerals. Less sticky when cooked, perfect for jollof rice and party rice. Pre-cooked before milling for better nutritional value.',
  'Nutrient-rich parboiled rice, perfect for jollof',
  array['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800'],
  array['parboiled', 'nutritious', 'jollof', 'party-rice'],
  false,
  'active'
from categories c where c.slug = 'rice'
on conflict do nothing;

-- Basmati Rice
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Indian Basmati Rice - Extra Long',
  'indian-basmati-rice-extra-long',
  2200.00,
  1500,
  25,
  'A',
  'Abuja, FCT',
  'Premium Indian Basmati rice with extra-long grains that elongate further when cooked. Delicate aroma and fluffy texture. Perfect for biryanis and special occasions. Aged for 2 years for optimal flavor.',
  'Premium aged Basmati, extra-long grains, aromatic',
  array['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800', 'https://images.unsplash.com/photo-1599455219476-65f6c5a8c78c?w=800'],
  array['basmati', 'indian', 'premium', 'biryani', 'aged'],
  false,
  'active'
from categories c where c.slug = 'rice'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - BEANS CATEGORY
-- ============================================

-- Honey Beans (Oloyin)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Honey Beans (Oloyin) - Premium Select',
  'honey-beans-oloyin-premium',
  1800.00,
  3000,
  10,
  'A',
  'Ilorin, Kwara State',
  'Sweet honey beans (Oloyin) known for their naturally sweet taste that requires less seasoning. Carefully selected, stone-free, and properly cleaned. Perfect for moi-moi, akara, and gbegiri soup. Fast cooking time.',
  'Sweet Oloyin beans, stone-free, fast-cooking',
  array['https://images.unsplash.com/photo-1515543904379-3d757afe72e3?w=800', 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800'],
  array['honey-beans', 'oloyin', 'sweet', 'stone-free', 'moi-moi'],
  false,
  'active'
from categories c where c.slug = 'beans'
on conflict do nothing;

-- Iron Beans (Olofi)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Iron Beans (Olofi) - High Protein',
  'iron-beans-olofi-protein',
  1200.00,
  5000,
  25,
  'A',
  'Zaria, Kaduna State',
  'Iron-rich beans (Olofi) with high protein content and firm texture. Holds shape well when cooked, perfect for salads and side dishes. Popular in Northern Nigeria. Cleaned and ready to cook.',
  'Iron-rich beans, high protein, firm texture',
  array['https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800'],
  array['iron-beans', 'olofi', 'protein', 'firm', 'salad'],
  false,
  'active'
from categories c where c.slug = 'beans'
on conflict do nothing;

-- White Beans
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'White Beans - Clean & Sorted',
  'white-beans-clean-sorted',
  1000.00,
  4000,
  20,
  'B',
  'Makurdi, Benue State',
  'Clean white beans, properly sorted and stone-free. Mild flavor that absorbs seasonings well. Great for porridge, stews, and baking. Affordable option for caterers and restaurants.',
  'Clean white beans, affordable, versatile',
  array['https://images.unsplash.com/photo-1515543904379-3d757afe72e3?w=800'],
  array['white-beans', 'clean', 'affordable', 'porridge'],
  false,
  'active'
from categories c where c.slug = 'beans'
on conflict do nothing;

-- Brown Beans
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Brown Beans - Nutty Flavor',
  'brown-beans-nutty-flavor',
  1300.00,
  3500,
  15,
  'A',
  'Oshogbo, Osun State',
  'Brown beans with rich, nutty flavor. Higher fiber content than white beans. Excellent for traditional Nigerian dishes. Hand-picked and cleaned to ensure quality.',
  'Nutty brown beans, high fiber, hand-picked',
  array['https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800'],
  array['brown-beans', 'nutty', 'fiber', 'traditional'],
  false,
  'active'
from categories c where c.slug = 'beans'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - YAM CATEGORY
-- ============================================

-- Puna Yam
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Fresh Puna Yam - Large Tubers',
  'fresh-puna-yam-large',
  800.00,
  2000,
  10,
  'A',
  'Zaki Biam, Benue State',
  'Premium Puna yam from the yam capital of Nigeria. Large, smooth tubers with white flesh that cooks soft and fluffy. Perfect for pounded yam, porridge, and frying. Harvested fresh and carefully selected.',
  'Premium Puna yam, large tubers, fluffy when cooked',
  array['https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800'],
  array['puna', 'yam', 'white', 'fluffy', 'pounded'],
  false,
  'active'
from categories c where c.slug = 'yam'
on conflict do nothing;

-- Water Yam
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Water Yam - Sweet & Moist',
  'water-yam-sweet-moist',
  700.00,
  1500,
  5,
  'A',
  'Oturkpo, Benue State',
  'Sweet water yam with moist, tender flesh. Higher water content makes it softer when cooked. Excellent for boiling and roasting. Naturally sweet flavor that kids love.',
  'Sweet water yam, moist flesh, great for roasting',
  array['https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800'],
  array['water-yam', 'sweet', 'moist', 'boiling', 'kids-favorite'],
  false,
  'active'
from categories c where c.slug = 'yam'
on conflict do nothing;

-- Chinese Yam (Cocoyam)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Chinese Yam - Nutritious & Slimy',
  'chinese-yam-nutritious',
  1200.00,
  1000,
  5,
  'A',
  'Umuahia, Abia State',
  'Nutritious Chinese yam (cocoyam) with slimy texture when cooked. High in dietary fiber and vitamins. Popular for medicinal purposes and special soups. Organic farming methods used.',
  'Nutritious Chinese yam, high fiber, medicinal',
  array['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800'],
  array['chinese-yam', 'cocoyam', 'nutritious', 'fiber', 'medicinal'],
  true,
  'active'
from categories c where c.slug = 'yam'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - PLANTAIN CATEGORY
-- ============================================

-- Unripe Plantain
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Green Unripe Plantain - Cooking Grade',
  'green-plantain-cooking-grade',
  600.00,
  3000,
  20,
  'A',
  'Ondo Town, Ondo State',
  'Fresh green unripe plantains perfect for boiling, frying, and making plantain porridge. Firm texture and starchy taste. Excellent source of resistant starch. Harvested at optimal maturity for cooking.',
  'Fresh green plantains, firm, starchy, perfect for cooking',
  array['https://images.unsplash.com/photo-1527963662183-79e9f5c6f33c?w=800', 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800'],
  array['green', 'unripe', 'plantain', 'cooking', 'starch'],
  false,
  'active'
from categories c where c.slug = 'plantain'
on conflict do nothing;

-- Semi-Ripe Plantain
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Semi-Ripe Plantain - Sweet & Firm',
  'semi-ripe-plantain-sweet',
  700.00,
  2500,
  15,
  'A',
  'Sapele, Delta State',
  'Semi-ripe plantains with perfect balance of sweetness and firmness. Great for roasting and frying (dodo). Naturally sweet without being mushy. Hand-selected for consistent quality.',
  'Semi-ripe plantains, sweet & firm, perfect for dodo',
  array['https://images.unsplash.com/photo-1527963662183-79e9f5c6f33c?w=800'],
  array['semi-ripe', 'plantain', 'sweet', 'dodo', 'roasting'],
  false,
  'active'
from categories c where c.slug = 'plantain'
on conflict do nothing;

-- Ripe Plantain
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Ripe Yellow Plantain - Sweet & Soft',
  'ripe-plantain-yellow-sweet',
  800.00,
  2000,
  10,
  'A',
  'Calabar, Cross River State',
  'Fully ripe yellow plantains with sweet, soft flesh. Perfect for caramelized plantain dishes and desserts. High in natural sugars and potassium. Ready to eat or cook.',
  'Ripe sweet plantains, perfect for desserts',
  array['https://images.unsplash.com/photo-1527963662183-79e9f5c6f33c?w=800', 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800'],
  array['ripe', 'yellow', 'plantain', 'sweet', 'dessert'],
  false,
  'active'
from categories c where c.slug = 'plantain'
on conflict do nothing;

-- Plantain Suckers (for planting)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Plantain Suckers - Hybrid Variety',
  'plantain-suckers-hybrid',
  350.00,
  1000,
  50,
  'A',
  'Ibadan, Oyo State',
  'High-yielding hybrid plantain suckers for farming. Disease-resistant variety with faster maturity. Each sucker produces a full bunch in 10-12 months. Free planting guide included with bulk orders.',
  'Hybrid plantain suckers, high-yield, disease-resistant',
  array['https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800'],
  array['suckers', 'hybrid', 'planting', 'farming', 'seedlings'],
  false,
  'active'
from categories c where c.slug = 'plantain'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - CASSAVA CATEGORY
-- ============================================

-- Fresh Cassava Tubers
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Fresh Cassava Tubers - Sweet Variety',
  'fresh-cassava-sweet-variety',
  400.00,
  5000,
  50,
  'A',
  'Ado Ekiti, Ekiti State',
  'Sweet cassava variety perfect for boiling and eating fresh. Low cyanide content, safe for direct consumption. Large, smooth tubers with white flesh. Also great for making garri and fufu.',
  'Sweet cassava, low cyanide, safe for fresh eating',
  array['https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800'],
  array['cassava', 'sweet', 'fresh', 'garri', 'fufu'],
  false,
  'active'
from categories c where c.slug = 'cassava'
on conflict do nothing;

-- Cassava Chips
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Dried Cassava Chips (Krokro)',
  'dried-cassava-chips-krokro',
  600.00,
  3000,
  25,
  'A',
  'Iseyin, Oyo State',
  'Traditionally dried cassava chips (krokro) for making flour or animal feed. Sun-dried to preserve nutrients. Can be milled into cassava flour for baking or rehydrated for cooking.',
  'Dried cassava chips, multipurpose, traditional',
  array['https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800'],
  array['chips', 'krokro', 'dried', 'flour', 'animal-feed'],
  false,
  'active'
from categories c where c.slug = 'cassava'
on conflict do nothing;

-- Cassava Flour
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Premium Cassava Flour (Lafun)',
  'premium-cassava-flour-lafun',
  900.00,
  2000,
  10,
  'A',
  'Abeokuta, Ogun State',
  'Fine-textured cassava flour (lafun) for making smooth fufu and as wheat flour substitute in baking. Fermented for improved nutrition and digestibility. No additives or preservatives.',
  'Premium cassava flour, fermented, fine-textured',
  array['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'],
  array['flour', 'lafun', 'fufu', 'baking', 'gluten-free'],
  false,
  'active'
from categories c where c.slug = 'cassava'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - MAIZE CATEGORY
-- ============================================

-- Yellow Maize
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Yellow Maize - Human Consumption Grade',
  'yellow-maize-human-grade',
  550.00,
  10000,
  100,
  'A',
  'Kaduna, Kaduna State',
  'Premium yellow maize for human consumption. High in carotenoids and vitamins. Perfect for making pap, tuwo, and animal feed. Well-dried and properly stored to prevent weevils.',
  'Yellow maize, high vitamins, human consumption grade',
  array['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800', 'https://images.unsplash.com/photo-1601593768794-8638842357e5?w=800'],
  array['maize', 'yellow', 'corn', 'pap', 'tuwo'],
  false,
  'active'
from categories c where c.slug = 'maize'
on conflict do nothing;

-- White Maize
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'White Maize - Premium Quality',
  'white-maize-premium',
  500.00,
  8000,
  100,
  'A',
  'Jos, Plateau State',
  'Premium white maize with large, full kernels. Preferred for traditional dishes and brewing. Lower fat content than yellow maize. Grown in the cool Plateau climate for superior quality.',
  'White maize, large kernels, premium Plateau quality',
  array['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800'],
  array['white-maize', 'premium', 'plateau', 'brewing', 'traditional'],
  false,
  'active'
from categories c where c.slug = 'maize'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - POULTRY CATEGORY
-- ============================================

-- Live Chicken
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Live Broiler Chickens - Ready for Market',
  'live-broiler-chickens-ready',
  2500.00,
  500,
  10,
  'A',
  'Ota, Ogun State',
  'Healthy broiler chickens, 6-8 weeks old, raised on quality feed. Average weight 2-3kg. Vaccinated and dewormed. Perfect for festive seasons and restaurants. Live delivery or processing available.',
  'Live broilers, 2-3kg, vaccinated, ready for market',
  array['https://images.unsplash.com/photo-1548550023-2bdb3c5b4b6b?w=800', 'https://images.unsplash.com/photo-1569396116180-2f03f3e7fe73?w=800'],
  array['chicken', 'broiler', 'live', 'poultry', 'festive'],
  false,
  'active'
from categories c where c.slug = 'poultry'
on conflict do nothing;

-- Live Layers
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Point of Lay Hens - Egg Production Ready',
  'point-of-lay-hens-ready',
  3500.00,
  300,
  5,
  'A',
  'Ikorodu, Lagos State',
  'Point-of-lay hens ready to start producing eggs. 18-20 weeks old, fully vaccinated. High egg production potential (280+ eggs/year). ISA Brown and Black Austrolorp breeds available.',
  'Point-of-lay hens, ready to lay, high production',
  array['https://images.unsplash.com/photo-1569396116180-2f03f3e7fe73?w=800'],
  array['layers', 'hens', 'eggs', 'poultry', 'point-of-lay'],
  false,
  'active'
from categories c where c.slug = 'poultry'
on conflict do nothing;

-- Fresh Eggs
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Fresh Farm Eggs - Jumbo Size',
  'fresh-farm-eggs-jumbo',
  2800.00,
  500,
  10,
  'A',
  'Epe, Lagos State',
  'Fresh jumbo eggs from free-range chickens. Rich orange yolks indicating high nutrition. Daily collection ensures maximum freshness. Packaged in crates of 30. Delivery within 24 hours of laying.',
  'Fresh jumbo eggs, free-range, daily collection',
  array['https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800'],
  array['eggs', 'jumbo', 'fresh', 'free-range', 'crates'],
  false,
  'active'
from categories c where c.slug = 'poultry'
on conflict do nothing;

-- Day Old Chicks
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Day Old Chicks - Broilers & Layers',
  'day-old-chicks-broilers-layers',
  450.00,
  2000,
  50,
  'A',
  'Abeokuta, Ogun State',
  'Healthy day-old chicks for starting your poultry farm. Broilers and layers available. Vaccinated against Newcastle and Gumboro. High survival rate, 95%+. Free feeding guide included.',
  'Day-old chicks, vaccinated, 95%+ survival rate',
  array['https://images.unsplash.com/photo-1548550023-2bdb3c5b4b6b?w=800'],
  array['chicks', 'day-old', 'broilers', 'layers', 'vaccinated'],
  false,
  'active'
from categories c where c.slug = 'poultry'
on conflict do nothing;

-- Turkey
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Live Turkeys - Festive Season Ready',
  'live-turkeys-festive',
  4500.00,
  100,
  2,
  'A',
  'Ibadan, Oyo State',
  'Large healthy turkeys ready for Christmas and festive celebrations. 4-6 months old, 5-8kg live weight. Well-fed on quality grain. Available live or dressed. Bulk discounts for orders above 10 birds.',
  'Large turkeys, 5-8kg, festive season ready',
  array['https://images.unsplash.com/photo-1569396116180-2f03f3e7fe73?w=800'],
  array['turkey', 'live', 'festive', 'christmas', 'large'],
  false,
  'active'
from categories c where c.slug = 'poultry'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - VEGETABLES CATEGORY
-- ============================================

-- Ugwu (Fluted Pumpkin Leaves)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Fresh Ugwu (Fluted Pumpkin Leaves)',
  'fresh-ugwu-fluted-pumpkin-leaves',
  800.00,
  500,
  5,
  'A',
  'Abeokuta, Ogun State',
  'Fresh ugwu leaves, also known as fluted pumpkin leaves. Highly nutritious and popular for making egusi soup. Harvested daily to ensure maximum freshness. Rich in iron and vitamins.',
  'Fresh ugwu leaves, highly nutritious, daily harvest',
  array['https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800'],
  array['ugwu', 'fluted-pumpkin', 'leaves', 'nutritious', 'egusi'],
  false,
  'active'
from categories c where c.slug = 'vegetables'
on conflict do nothing;

-- Spinach (Efo Shoko)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Fresh Spinach (Efo Shoko)',
  'fresh-spinach-efo-shoko',
  600.00,
  400,
  5,
  'A',
  'Ibadan, Oyo State',
  'Fresh Nigerian spinach (efo shoko), perfect for soups and stews. Crisp leaves with excellent flavor. Organically grown without pesticides. Great for efo riro and other traditional dishes.',
  'Fresh Nigerian spinach, organic, perfect for soups',
  array['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800'],
  array['spinach', 'efo-shoko', 'organic', 'soup', 'fresh'],
  true,
  'active'
from categories c where c.slug = 'vegetables'
on conflict do nothing;

-- Fresh Tomatoes
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Fresh Red Tomatoes - Jos Variety',
  'fresh-red-tomatoes-jos',
  1200.00,
  1000,
  10,
  'A',
  'Jos, Plateau State',
  'Premium Jos tomatoes, known for their rich flavor and deep red color. Perfect for stews, salads, and sauces. Grown in the cool Plateau climate for superior taste. Firm and ripe.',
  'Premium Jos tomatoes, rich flavor, deep red color',
  array['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'],
  array['tomatoes', 'jos', 'red', 'flavorful', 'fresh'],
  false,
  'active'
from categories c where c.slug = 'vegetables'
on conflict do nothing;

-- Fresh Peppers (Tatashe)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Red Bell Peppers (Tatashe)',
  'red-bell-peppers-tatashe',
  1500.00,
  800,
  5,
  'A',
  'Lagos, Lagos State',
  'Fresh red bell peppers (tatashe), perfect for garnishing and cooking. Sweet flavor, thick flesh. Adds vibrant color and taste to any dish. Pesticide-free cultivation.',
  'Fresh red bell peppers, sweet, thick flesh',
  array['https://images.unsplash.com/photo-1563565375-f3fdf5f516ae?w=800'],
  array['peppers', 'tatashe', 'red', 'bell-peppers', 'sweet'],
  false,
  'active'
from categories c where c.slug = 'vegetables'
on conflict do nothing;

-- Scotch Bonnet Peppers (Ata Rodo)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Hot Scotch Bonnet Peppers (Ata Rodo)',
  'hot-scotch-bonnet-peppers-ata-rodo',
  2000.00,
  600,
  2,
  'A',
  'Ibadan, Oyo State',
  'Fiery scotch bonnet peppers (ata rodo), essential for authentic Nigerian cooking. Intense heat and unique flavor. Perfect for ofada stew, pepper soup, and all spicy dishes.',
  'Fiery scotch bonnet peppers, intense heat, authentic flavor',
  array['https://images.unsplash.com/photo-1588252303782-cb80119abd6c?w=800'],
  array['peppers', 'scotch-bonnet', 'ata-rodo', 'hot', 'spicy'],
  false,
  'active'
from categories c where c.slug = 'vegetables'
on conflict do nothing;

-- Fresh Okra
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Fresh Green Okra',
  'fresh-green-okra',
  900.00,
  700,
  5,
  'A',
  'Kano, Kano State',
  'Fresh green okra, tender and perfect for making delicious okra soup. Harvested young for best texture and flavor. Rich in fiber and nutrients.',
  'Fresh green okra, tender, perfect for soup',
  array['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800'],
  array['okra', 'green', 'tender', 'soup', 'nutritious'],
  false,
  'active'
from categories c where c.slug = 'vegetables'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - FRUITS CATEGORY
-- ============================================

-- Sweet Oranges
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Sweet Oranges - Juicy',
  'sweet-oranges-juicy',
  600.00,
  2000,
  10,
  'A',
  'Benin City, Edo State',
  'Sweet juicy oranges from Benin. Perfect for fresh juice or eating. High in vitamin C, naturally ripened on the tree. Seedless variety with thin skin.',
  'Sweet juicy oranges, high vitamin C, seedless',
  array['https://images.unsplash.com/photo-1547514701-42782101795e?w=800'],
  array['oranges', 'sweet', 'juicy', 'vitamin-c', 'fresh'],
  false,
  'active'
from categories c where c.slug = 'fruits'
on conflict do nothing;

-- Ripe Plantains
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Ripe Sweet Plantains',
  'ripe-sweet-plantains',
  700.00,
  1500,
  5,
  'A',
  'Ondo Town, Ondo State',
  'Sweet ripe plantains, perfect for frying (dodo), baking, or boiling. Naturally sweet with soft texture. A family favorite for breakfast and snacks.',
  'Sweet ripe plantains, perfect for frying and baking',
  array['https://images.unsplash.com/photo-1527963662183-79e9f5c6f33c?w=800'],
  array['plantains', 'ripe', 'sweet', 'dodo', 'snacks'],
  false,
  'active'
from categories c where c.slug = 'fruits'
on conflict do nothing;

-- Fresh Pineapples
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Sweet Pineapples - Smooth Cayenne',
  'sweet-pineapples-smooth-cayenne',
  800.00,
  800,
  5,
  'A',
  'Oshogbo, Osun State',
  'Sweet pineapples of the smooth cayenne variety. Juicy, aromatic flesh with perfect balance of sweet and tart. Ideal for fruit salad, juice, or eating fresh.',
  'Sweet pineapples, juicy, aromatic, perfect balance',
  array['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800'],
  array['pineapples', 'smooth-cayenne', 'sweet', 'juicy', 'aromatic'],
  false,
  'active'
from categories c where c.slug = 'fruits'
on conflict do nothing;

-- Fresh Mangoes
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Ripe Mangoes - Sweet Variety',
  'ripe-mangoes-sweet',
  1000.00,
  1200,
  5,
  'A',
  'Maiduguri, Borno State',
  'Sweet ripe mangoes from the north, known for their intense flavor and smooth texture. Perfect for eating fresh, smoothies, or fruit salads. Naturally ripened.',
  'Sweet ripe mangoes, intense flavor, smooth texture',
  array['https://images.unsplash.com/photo-1553279768-865429fa0078?w=800'],
  array['mangoes', 'sweet', 'ripe', 'smooth', 'flavorful'],
  false,
  'active'
from categories c where c.slug = 'fruits'
on conflict do nothing;

-- Fresh Papayas (Pawpaw)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Fresh Papayas (Pawpaw)',
  'fresh-papayas-pawpaw',
  500.00,
  900,
  5,
  'A',
  'Akure, Ondo State',
  'Fresh papayas (pawpaw) with sweet orange flesh. Rich in vitamins and digestive enzymes. Perfect for fruit salads, smoothies, or eating fresh. Harvested at optimal ripeness.',
  'Fresh papayas, sweet orange flesh, rich in vitamins',
  array['https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=800'],
  array['papayas', 'pawpaw', 'sweet', 'vitamins', 'enzymes'],
  false,
  'active'
from categories c where c.slug = 'fruits'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - LIVESTOCK CATEGORY
-- ============================================

-- Goats
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'West African Dwarf Goats',
  'west-african-dwarf-goats',
  3500.00,
  50,
  1,
  'A',
  'Osogbo, Osun State',
  'Healthy West African dwarf goats, perfect for ceremonies and celebrations. Well-fed and vaccinated. Average 20-30kg live weight. Hardy breed suitable for Nigerian climate. Male and female available.',
  'West African dwarf goats, 20-30kg, ceremonies',
  array['https://images.unsplash.com/photo-1569396116180-2f03f3e7fe73?w=800'],
  array['goats', 'dwarf', 'west-african', 'ceremonies', 'celebrations'],
  false,
  'active'
from categories c where c.slug = 'livestock'
on conflict do nothing;

-- Sheep
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'Balami Sheep - Large Frame',
  'balami-sheep-large',
  4000.00,
  30,
  1,
  'A',
  'Sokoto, Sokoto State',
  'Large Balami sheep from Northern Nigeria, known for their size and meat quality. 40-60kg live weight. Ideal for Sallah and special occasions. Well-maintained, dewormed, and ready for market.',
  'Large Balami sheep, 40-60kg, Sallah ready',
  array['https://images.unsplash.com/photo-1569396116180-2f03f3e7fe73?w=800'],
  array['sheep', 'balami', 'large', 'sallah', 'meat'],
  false,
  'active'
from categories c where c.slug = 'livestock'
on conflict do nothing;

-- Rams
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Big Rams for Ileya/Sallah',
  'big-rams-ileya-sallah',
  4500.00,
  25,
  1,
  'A',
  'Kano, Kano State',
  'Big healthy rams specially bred for Ileya/Sallah celebrations. 50-80kg live weight. Well-fed on grain and grass. Vaccinated and in excellent condition. Reserve early for best selection.',
  'Big Sallah rams, 50-80kg, reserve early',
  array['https://images.unsplash.com/photo-1569396116180-2f03f3e7fe73?w=800'],
  array['rams', 'ileya', 'sallah', 'celebration', 'big'],
  false,
  'active'
from categories c where c.slug = 'livestock'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - GRAINS CATEGORY
-- ============================================

-- Millet
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Pearl Millet (Gero) - Premium',
  'pearl-millet-gero-premium',
  650.00,
  4000,
  50,
  'A',
  'Katsina, Katsina State',
  'Premium pearl millet (gero) from Northern Nigeria. High in iron and protein. Perfect for making fura, kunu, and traditional porridges. Clean, sorted, and stone-free. Excellent for brewing local drinks.',
  'Pearl millet, high iron, for fura and kunu',
  array['https://images.unsplash.com/photo-1515543904379-3d757afe72e3?w=800'],
  array['millet', 'gero', 'pearl', 'fura', 'kunu'],
  false,
  'active'
from categories c where c.slug = 'grains'
on conflict do nothing;

-- Sorghum
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'White Sorghum - Food Grade',
  'white-sorghum-food-grade',
  600.00,
  5000,
  50,
  'A',
  'Bauchi, Bauchi State',
  'Food-grade white sorghum for human consumption and brewing. Gluten-free grain alternative. Great for making pap, flour, and animal feed. Clean, well-dried, and properly stored.',
  'White sorghum, gluten-free, food grade',
  array['https://images.unsplash.com/photo-1515543904379-3d757afe72e3?w=800'],
  array['sorghum', 'white', 'gluten-free', 'brewing', 'food-grade'],
  false,
  'active'
from categories c where c.slug = 'grains'
on conflict do nothing;

-- Guinea Corn
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Red Guinea Corn - Traditional',
  'red-guinea-corn-traditional',
  700.00,
  3000,
  25,
  'A',
  'Zaria, Kaduna State',
  'Traditional red guinea corn for making tuwo, pap, and local beverages. Prized for its rich flavor and cultural significance. Stone-free and ready to mill. Preferred for traditional ceremonies.',
  'Red guinea corn, traditional, rich flavor',
  array['https://images.unsplash.com/photo-1515543904379-3d757afe72e3?w=800'],
  array['guinea-corn', 'red', 'traditional', 'tuwo', 'ceremonies'],
  false,
  'active'
from categories c where c.slug = 'grains'
on conflict do nothing;

-- ============================================
-- SAMPLE PRODUCTS - OIL SEEDS CATEGORY
-- ============================================

-- Groundnut
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Shelled Groundnuts (Peanuts) - Raw',
  'shelled-groundnuts-raw',
  1400.00,
  3000,
  10,
  'A',
  'Kano, Kano State',
  'Premium shelled groundnuts from Kano, Nigeria groundnut capital. High oil content, perfect for making oil, peanut butter, or snacking. Clean, uniform size, minimal breakage. Ready for processing or roasting.',
  'Premium shelled groundnuts, high oil content, Kano origin',
  array['https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800', 'https://images.unsplash.com/photo-1536591375315-196000ea3666?w=800'],
  array['groundnut', 'peanut', 'shelled', 'kano', 'oil'],
  false,
  'active'
from categories c where c.slug = 'oil-seeds'
on conflict do nothing;

-- Sesame Seeds
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  'White Sesame Seeds - Export Quality',
  'white-sesame-seeds-export',
  2500.00,
  1500,
  25,
  'A',
  'Jigawa, Jigawa State',
  'Export-quality white sesame seeds from Jigawa State. High oil content (50%+), clean and pure. Perfect for oil extraction, baking, and confectionery. Meets international export standards.',
  'Export-quality white sesame, 50%+ oil content',
  array['https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800'],
  array['sesame', 'white', 'export', 'oil', 'confectionery'],
  false,
  'active'
from categories c where c.slug = 'oil-seeds'
on conflict do nothing;

-- Palm Kernel
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  'Palm Kernel Nuts - Crushed',
  'palm-kernel-nuts-crushed',
  450.00,
  5000,
  100,
  'B',
  'Benin City, Edo State',
  'Crushed palm kernel nuts for oil extraction and animal feed. High oil yield. By-product of palm oil production. Available in bulk for industrial buyers and feed mills.',
  'Crushed palm kernel, high oil yield, bulk available',
  array['https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800'],
  array['palm-kernel', 'nuts', 'crushed', 'oil', 'feed'],
  false,
  'active'
from categories c where c.slug = 'oil-seeds'
on conflict do nothing;

-- Melon Seeds (Egusi)
insert into produce_listings (seller_id, category_id, product_name, slug, price_per_kg, available_quantity, min_order_kg, quality_grade, location, description, short_description, images, tags, is_organic, status)
select 
  '550e8400-e29b-41d4-a716-446655440001',
  c.id,
  'Egusi Seeds (Melon) - Shelled',
  'egusi-seeds-melon-shelled',
  3500.00,
  1000,
  5,
  'A',
  'Nsukka, Enugu State',
  'Premium shelled egusi (melon) seeds for making traditional soups. Large, white seeds with high oil content. Clean, properly dried, and ready to grind. Essential for Nigerian cuisine.',
  'Premium egusi seeds, large white, for soup',
  array['https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800'],
  array['egusi', 'melon', 'seeds', 'soup', 'traditional'],
  false,
  'active'
from categories c where c.slug = 'oil-seeds'
on conflict do nothing;

-- ============================================
-- VIEWS FOR ENHANCED MARKETPLACE
-- ============================================

-- Create view for active listings with seller info
create or replace view active_listings_view as
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

-- Create view for featured products (high quality, verified sellers)
create or replace view featured_listings_view as
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
where l.status = 'active' 
  and l.quality_grade = 'A'
  and u.is_verified = true
order by l.created_at desc;
