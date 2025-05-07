-- This file contains updated RLS policies to fix profile editing issues

-- First, let's make sure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with better definitions
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create a policy to allow users to read their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create a policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create a policy to allow authenticated users to insert profiles
-- This is needed for the initial profile creation
CREATE POLICY "Enable insert for users"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create a policy to allow service role to insert any profile
-- This is needed for the trigger function
CREATE POLICY "Service role can insert any profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Create a policy to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create a policy to allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create a policy to allow authenticated users to update their own profile photo
CREATE POLICY "Users can update their own profile photo"
  ON storage.objects
  FOR ALL
  USING (auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Create a policy to allow public access to profile photos
CREATE POLICY "Public access to profile photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile_photos');
