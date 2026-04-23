-- Update all pepper listings to use the requested Unsplash image.

update produce_listings
set images = array[
  'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8YmVsbCUyMHBlcHBlcnN8ZW58MHx8fHwxNzYxMjU5ODk3fDA&ixlib=rb-4.1.0&q=80&w=1080'
]
where product_name ilike '%pepper%'
   or slug ilike '%pepper%'
   or 'peppers' = any(coalesce(tags, array[]::text[]))
   or 'tatashe' = any(coalesce(tags, array[]::text[]))
   or 'ata-rodo' = any(coalesce(tags, array[]::text[]))
   or 'scotch-bonnet' = any(coalesce(tags, array[]::text[]));
