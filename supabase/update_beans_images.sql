-- Apply the same bean image to every beans listing in the database.
-- Run this in Supabase after uploading /images/listings/beans.jpg to your public assets.

update produce_listings
set images = array['/images/listings/beans.jpg']
where
  category_id in (select id from categories where slug = 'beans')
  or lower(product_name) like '%bean%'
  or lower(slug) like '%bean%'
  or 'beans' = any(coalesce(tags, array[]::text[]))
  or 'oloyin' = any(coalesce(tags, array[]::text[]))
  or 'olofi' = any(coalesce(tags, array[]::text[]));
