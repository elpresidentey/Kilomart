-- Apply the same plantain image to every plantain listing in the database.
-- Run this in the Supabase SQL editor after you upload/serve the image.

update produce_listings
set images = array['/images/listings/ripe-sweet-plantains.jpg']
where
  category_id in (select id from categories where slug = 'plantain')
  or lower(product_name) like '%plantain%'
  or lower(slug) like '%plantain%';
