-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS password_reset_tokens_email_idx ON public.password_reset_tokens (email);
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON public.password_reset_tokens (token);

-- Add RLS policies
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to view their own reset tokens
CREATE POLICY "Users can view their own reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Allow service role to manage all tokens
CREATE POLICY "Service role can manage all tokens"
  ON public.password_reset_tokens
  USING (auth.role() = 'service_role');

-- Allow authenticated users to create tokens
CREATE POLICY "Authenticated users can create tokens"
  ON public.password_reset_tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION clean_expired_password_reset_tokens()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() OR used = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up expired tokens
CREATE TRIGGER clean_expired_password_reset_tokens_trigger
AFTER INSERT ON public.password_reset_tokens
EXECUTE FUNCTION clean_expired_password_reset_tokens();
