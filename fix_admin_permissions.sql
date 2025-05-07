-- SQL script to fix admin permissions

-- Check if is_admin column exists in profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'is_admin'
    ) THEN
        -- Add is_admin column if it doesn't exist
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Set specific user as admin
UPDATE public.profiles
SET is_admin = true
WHERE email = 'sajink2016@gmail.com';

-- Make sure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Make sure RLS is enabled on group_savings table
ALTER TABLE public.group_savings ENABLE ROW LEVEL SECURITY;

-- Create or replace policies for group_savings table
DROP POLICY IF EXISTS "Everyone can view group savings" ON public.group_savings;
CREATE POLICY "Everyone can view group savings"
ON public.group_savings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can update group savings" ON public.group_savings;
CREATE POLICY "Admins can update group savings"
ON public.group_savings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

DROP POLICY IF EXISTS "Admins can insert group savings" ON public.group_savings;
CREATE POLICY "Admins can insert group savings"
ON public.group_savings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Make sure RLS is enabled on payment_history table
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Create or replace policies for payment_history table
DROP POLICY IF EXISTS "Everyone can view payment history" ON public.payment_history;
CREATE POLICY "Everyone can view payment history"
ON public.payment_history
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert payment history" ON public.payment_history;
CREATE POLICY "Admins can insert payment history"
ON public.payment_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
