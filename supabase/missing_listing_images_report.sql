-- Report: listings with no usable images
-- Run this in Supabase SQL editor to get the current list.

select
  id,
  product_name,
  slug,
  location,
  status,
  created_at,
  updated_at,
  images
from produce_listings
where
  images is null
  or coalesce(cardinality(images), 0) = 0
  or not exists (
    select 1
    from unnest(coalesce(images, array[]::text[])) as img
    where nullif(trim(img), '') is not null
  )
order by created_at desc;

-- Batch-fix template:
-- update produce_listings
-- set images = array['https://example.com/your-image.jpg']
-- where id in (
--   select id from produce_listings
--   where images is null or coalesce(cardinality(images), 0) = 0
-- );
