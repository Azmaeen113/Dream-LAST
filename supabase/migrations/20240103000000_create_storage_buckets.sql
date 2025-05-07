-- This script creates the necessary storage buckets if they don't exist

-- Function to check if a bucket exists and create it if it doesn't
CREATE OR REPLACE FUNCTION create_bucket_if_not_exists(bucket_name text, public_access boolean DEFAULT false)
RETURNS void AS $$
DECLARE
  bucket_exists boolean;
BEGIN
  -- Check if the bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = bucket_name
  ) INTO bucket_exists;
  
  -- If the bucket doesn't exist, create it
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES (bucket_name, bucket_name, public_access, false, 5242880, -- 5MB limit
    ARRAY[
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/svg+xml',
      'image/webp'
    ]::text[]);
    
    RAISE NOTICE 'Created bucket: %', bucket_name;
  ELSE
    RAISE NOTICE 'Bucket already exists: %', bucket_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the profile_photos bucket if it doesn't exist
SELECT create_bucket_if_not_exists('profile_photos', false);

-- Create the project_photos bucket if it doesn't exist
SELECT create_bucket_if_not_exists('project_photos', false);

-- Drop the function as it's no longer needed
DROP FUNCTION create_bucket_if_not_exists(text, boolean);

-- Set up RLS for the storage buckets
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
CREATE POLICY "Users can upload to their own folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    (bucket_id = 'profile_photos' AND auth.uid()::text = (storage.foldername(name))[1]) OR
    (bucket_id = 'project_photos' AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE created_by = auth.uid()
    ))
  );

-- Create a policy to allow users to update their own files
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files"
  ON storage.objects
  FOR UPDATE
  USING (
    (bucket_id = 'profile_photos' AND auth.uid()::text = (storage.foldername(name))[1]) OR
    (bucket_id = 'project_photos' AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE created_by = auth.uid()
    ))
  );

-- Create a policy to allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  USING (
    (bucket_id = 'profile_photos' AND auth.uid()::text = (storage.foldername(name))[1]) OR
    (bucket_id = 'project_photos' AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE created_by = auth.uid()
    ))
  );

-- Create a policy to allow public access to all files (for reading)
DROP POLICY IF EXISTS "Public access to all files" ON storage.objects;
CREATE POLICY "Public access to all files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('profile_photos', 'project_photos'));
