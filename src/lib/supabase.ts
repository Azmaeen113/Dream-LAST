import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghktrlqtngdnnftxzool.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoa3RybHF0bmdkbm5mdHh6b29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjA4OTksImV4cCI6MjA2MTc5Njg5OX0.38KRCncPWSOwRatda2j9PhE-vhEX0maO_aKO-_Pg9Vs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations (use with caution - only on server-side)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
