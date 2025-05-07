-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can bypass RLS" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated users to insert payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can view all payments" ON public.payments;

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view all payments
CREATE POLICY "Authenticated users can view all payments"
  ON public.payments
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow admins to insert payments
CREATE POLICY "Admins can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to update payments
CREATE POLICY "Admins can update payments"
  ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow service role to bypass RLS
CREATE POLICY "Service role can bypass RLS"
  ON public.payments
  USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role; 