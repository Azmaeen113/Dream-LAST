-- Migration to create group-related tables and set up RLS policies
-- This implements the group structure with users, groups, group_savings, and payment_history

-- Create groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add group_id column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN group_id UUID REFERENCES public.groups(id);
  END IF;
END
$$;

-- Add role column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member'));
  END IF;
END
$$;

-- Update existing admins to have 'admin' role
UPDATE public.profiles
SET role = 'admin'
WHERE is_admin = true AND (role IS NULL OR role = 'member');

-- Update non-admins to have 'member' role
UPDATE public.profiles
SET role = 'member'
WHERE (is_admin = false OR is_admin IS NULL) AND (role IS NULL);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Modify group_savings table to match the new schema
DO $$
BEGIN
  -- Check if group_id column exists in group_savings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'group_savings' AND column_name = 'group_id'
  ) THEN
    -- Add group_id column
    ALTER TABLE public.group_savings ADD COLUMN group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;
    
    -- Rename total_amount to amount if needed
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'group_savings' AND column_name = 'total_amount'
    ) THEN
      ALTER TABLE public.group_savings RENAME COLUMN total_amount TO amount;
    END IF;
    
    -- Add note column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'group_savings' AND column_name = 'note'
    ) THEN
      ALTER TABLE public.group_savings ADD COLUMN note TEXT;
    END IF;
  END IF;
END
$$;

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups table
-- Everyone can view groups they belong to
CREATE POLICY "Users can view their groups"
  ON public.groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.group_id = groups.id
    )
  );

-- Only admins can create groups
CREATE POLICY "Admins can create groups"
  ON public.groups
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can update groups
CREATE POLICY "Admins can update groups"
  ON public.groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can delete groups
CREATE POLICY "Admins can delete groups"
  ON public.groups
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for group_savings table
-- Everyone in the group can view group savings
CREATE POLICY "View group savings"
  ON public.group_savings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.group_id = group_savings.group_id
    )
  );

-- Only admin can update group savings
CREATE POLICY "Admin can update savings"
  ON public.group_savings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.group_id = group_savings.group_id 
      AND profiles.role = 'admin'
    )
  );

-- Only admin can insert group savings
CREATE POLICY "Admin can insert group savings"
  ON public.group_savings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.group_id = NEW.group_id 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for payment_history table
-- Everyone in the group can view payment history
CREATE POLICY "Members can view payment history"
  ON public.payment_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.group_id = payment_history.group_id
    )
  );

-- Only admin can insert payment history
CREATE POLICY "Admin can insert payment history"
  ON public.payment_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.group_id = NEW.group_id 
      AND profiles.role = 'admin'
    )
  );

-- Create a default group if none exists
INSERT INTO public.groups (name)
SELECT 'Default Group'
WHERE NOT EXISTS (SELECT 1 FROM public.groups);

-- Get the ID of the default group
DO $$
DECLARE
  default_group_id UUID;
BEGIN
  SELECT id INTO default_group_id FROM public.groups LIMIT 1;
  
  -- Update existing profiles to belong to the default group if they don't have a group
  UPDATE public.profiles
  SET group_id = default_group_id
  WHERE group_id IS NULL;
  
  -- Update existing group_savings to belong to the default group if they don't have a group
  UPDATE public.group_savings
  SET group_id = default_group_id
  WHERE group_id IS NULL;
END
$$;
