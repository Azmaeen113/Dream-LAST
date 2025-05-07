import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the credentials provided by the user
const supabaseUrl = "https://ghktrlqtngdnnftxzool.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoa3RybHF0bmdkbm5mdHh6b29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjA4OTksImV4cCI6MjA2MTc5Njg5OX0.38KRCncPWSOwRatda2j9PhE-vhEX0maO_aKO-_Pg9Vs";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_SERVICE_ROLE_KEY in environment variables');
  throw new Error('Missing VITE_SUPABASE_SERVICE_ROLE_KEY in environment variables');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create a service client for admin operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});