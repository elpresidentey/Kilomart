-- Run this in the Supabase SQL editor after creating your project.
-- It creates a public bucket for listing photos and allows authenticated users
-- to upload/update/delete only their own files under `<user-id>/...`.

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Public can view listing images"
on storage.objects
for select
to public
using (bucket_id = 'listing-images');

create policy "Authenticated users can upload their listing images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "Authenticated users can update their listing images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = split_part(name, '/', 1)
)
with check (
  bucket_id = 'listing-images'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "Authenticated users can delete their listing images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = split_part(name, '/', 1)
);
