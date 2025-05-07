-- Fix RLS policies for group_savings table

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can insert group savings" ON public.group_savings;
DROP POLICY IF EXISTS "Admins can delete group savings" ON public.group_savings;
DROP POLICY IF EXISTS "Admins can update group savings" ON public.group_savings;
DROP POLICY IF EXISTS "Everyone can view group savings" ON public.group_savings;

-- Allow admins to insert into group_savings
CREATE POLICY "Admins can insert group savings"
  ON public.group_savings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to delete from group_savings
CREATE POLICY "Admins can delete group savings"
  ON public.group_savings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update group_savings
CREATE POLICY "Admins can update group savings"
  ON public.group_savings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow everyone to view group_savings
CREATE POLICY "Everyone can view group savings"
  ON public.group_savings
  FOR SELECT
  USING (true);

-- Update the update_group_savings function to handle errors better
CREATE OR REPLACE FUNCTION public.update_group_savings(amount_to_add NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN := FALSE;
  current_user_id UUID;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if the user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = current_user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update group savings';
  END IF;

  -- Update the group savings
  UPDATE public.group_savings
  SET 
    total_amount = total_amount + amount_to_add,
    last_updated_at = NOW(),
    updated_by = current_user_id
  WHERE id = (SELECT id FROM public.group_savings ORDER BY created_at ASC LIMIT 1);

  -- Check if the update was successful
  IF FOUND THEN
    success := TRUE;
  END IF;

  RETURN success;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error updating group savings: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
