-- Drop existing policies
DROP POLICY IF EXISTS "Admins can update group savings" ON public.group_savings;
DROP POLICY IF EXISTS "Admins can insert group savings" ON public.group_savings;
DROP POLICY IF EXISTS "Everyone can view group savings" ON public.group_savings;

-- Enable RLS
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

-- Allow service role to bypass RLS
CREATE POLICY "Service role can bypass RLS"
  ON public.group_savings
  USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON public.group_savings TO authenticated;
GRANT ALL ON public.group_savings TO service_role;

-- Create or replace the update_group_savings function
CREATE OR REPLACE FUNCTION public.update_group_savings(
  new_amount NUMERIC,
  new_goal_amount NUMERIC DEFAULT NULL,
  update_note TEXT DEFAULT NULL
)
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
    WHERE id = current_user_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can update group savings';
  END IF;

  -- Update the group savings
  UPDATE public.group_savings
  SET 
    total_amount = new_amount,
    goal_amount = COALESCE(new_goal_amount, goal_amount),
    last_updated_at = NOW(),
    updated_by = current_user_id,
    note = COALESCE(update_note, note)
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