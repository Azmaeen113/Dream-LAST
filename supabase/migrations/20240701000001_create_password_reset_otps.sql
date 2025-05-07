-- Create password_reset_otps table
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS password_reset_otps_email_idx ON public.password_reset_otps (email);
CREATE INDEX IF NOT EXISTS password_reset_otps_otp_idx ON public.password_reset_otps (otp);

-- Add RLS policies
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to view their own OTPs
CREATE POLICY "Users can view their own OTPs"
  ON public.password_reset_otps
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Allow service role to manage all OTPs
CREATE POLICY "Service role can manage all OTPs"
  ON public.password_reset_otps
  USING (auth.role() = 'service_role');

-- Allow authenticated users to create OTPs
CREATE POLICY "Authenticated users can create OTPs"
  ON public.password_reset_otps
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION clean_expired_password_reset_otps()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.password_reset_otps
  WHERE expires_at < NOW() OR used = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up expired OTPs
CREATE TRIGGER clean_expired_password_reset_otps_trigger
AFTER INSERT ON public.password_reset_otps
EXECUTE FUNCTION clean_expired_password_reset_otps(); 