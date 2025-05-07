import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// For server-side operations that require elevated privileges
const createServiceClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service credentials. Check your environment variables.');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

// For direct database connections (if needed)
const getDatabaseUrl = () => {
  return process.env.VITE_SUPABASE_DB_URL || import.meta.env.VITE_SUPABASE_DB_URL;
};

// For connection pooling (recommended for production)
const getPoolerUrl = () => {
  return process.env.VITE_SUPABASE_POOLER_URL || import.meta.env.VITE_SUPABASE_POOLER_URL;
};

// For direct connections (useful for some operations)
const getDirectUrl = () => {
  return process.env.VITE_SUPABASE_DIRECT_URL || import.meta.env.VITE_SUPABASE_DIRECT_URL;
};

export {
  createServiceClient,
  getDatabaseUrl,
  getPoolerUrl,
  getDirectUrl
};
