-- SQL script to fix the group_savings table structure

-- Create a new table with the correct structure
CREATE TABLE IF NOT EXISTS public.group_savings_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  goal_amount NUMERIC NOT NULL DEFAULT 2000000,
  note TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Copy data from old table
INSERT INTO public.group_savings_new (id, total_amount)
SELECT id, total_amount FROM public.group_savings;

-- Drop old table
DROP TABLE public.group_savings;

-- Rename new table to old name
ALTER TABLE public.group_savings_new RENAME TO group_savings;

-- Set up RLS policies
ALTER TABLE public.group_savings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view group_savings
CREATE POLICY "Everyone can view group savings"
  ON public.group_savings
  FOR SELECT
  USING (true);

-- Allow admins to update group_savings
CREATE POLICY "Admins can update group savings"
  ON public.group_savings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to insert into group_savings
CREATE POLICY "Admins can insert group savings"
  ON public.group_savings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert a default record if none exists
INSERT INTO public.group_savings (total_amount, goal_amount, note)
SELECT 0, 2000000, 'Initial setup'
WHERE NOT EXISTS (SELECT 1 FROM public.group_savings);
