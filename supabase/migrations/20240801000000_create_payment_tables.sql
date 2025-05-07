-- Create group_savings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  goal_amount NUMERIC NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial record if none exists
INSERT INTO public.group_savings (total_amount, goal_amount)
SELECT 0, 2000000
WHERE NOT EXISTS (SELECT 1 FROM public.group_savings);

-- Add RLS policies for group_savings
ALTER TABLE public.group_savings ENABLE ROW LEVEL SECURITY;

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

-- Allow everyone to view group_savings
CREATE POLICY "Everyone can view group savings"
  ON public.group_savings
  FOR SELECT
  USING (true);

-- Update payments table if it exists, or create it if it doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    -- Add new columns to existing payments table if they don't exist
    BEGIN
      ALTER TABLE public.payments 
        ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id),
        ADD COLUMN IF NOT EXISTS notes TEXT;
    EXCEPTION WHEN duplicate_column THEN
      -- Do nothing, columns already exist
    END;
  ELSE
    -- Create payments table if it doesn't exist
    CREATE TABLE public.payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      amount NUMERIC NOT NULL,
      month VARCHAR(20) NOT NULL,
      due_date TIMESTAMP WITH TIME ZONE NOT NULL,
      payment_date TIMESTAMP WITH TIME ZONE,
      payment_method VARCHAR(50),
      transaction_id VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      is_paid BOOLEAN DEFAULT FALSE,
      recorded_by UUID REFERENCES auth.users(id),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END
$$;

-- Add RLS policies for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own payments
CREATE POLICY IF NOT EXISTS "Users can view their own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to view all payments
CREATE POLICY IF NOT EXISTS "Admins can view all payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to insert payments
CREATE POLICY IF NOT EXISTS "Admins can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to update payments
CREATE POLICY IF NOT EXISTS "Admins can update payments"
  ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create function to update group savings
CREATE OR REPLACE FUNCTION public.update_group_savings(amount_to_add NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.group_savings
  SET 
    total_amount = total_amount + amount_to_add,
    last_updated_at = NOW(),
    updated_by = auth.uid()
  WHERE id = (SELECT id FROM public.group_savings ORDER BY created_at ASC LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
