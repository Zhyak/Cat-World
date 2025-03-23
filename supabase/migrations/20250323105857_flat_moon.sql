/*
  # Create storage bucket for cat images

  1. New Storage Bucket
    - Creates a new public bucket named 'cat-images' for storing cat photos
    - Enables public access for reading images
    - Sets up appropriate security policies

  2. Security
    - Enables RLS on the storage bucket
    - Adds policy for authenticated users to upload images
    - Adds policy for public access to read images
*/

-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('cat-images', 'cat-images', true)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Allow authenticated users to upload files
create policy "Users can upload cat images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cat-images' AND
    auth.uid() = owner
  );

-- Allow authenticated users to update their own files
create policy "Users can update own cat images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'cat-images' AND
    auth.uid() = owner
  );

-- Allow authenticated users to delete their own files
create policy "Users can delete own cat images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'cat-images' AND
    auth.uid() = owner
  );

-- Allow public access to read files
create policy "Public can view cat images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'cat-images');