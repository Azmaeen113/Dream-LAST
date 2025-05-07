// This script fixes the group savings update issue by applying the necessary SQL changes
// Run with: node scripts/fix-group-savings.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your environment variables.');
  console.error('Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL to fix the group savings issue
const fixGroupSavingsSQL = `
-- Allow admins to insert into group_savings
CREATE POLICY IF NOT EXISTS "Admins can insert group savings"
  ON public.group_savings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to delete from group_savings (if needed)
CREATE POLICY IF NOT EXISTS "Admins can delete group savings"
  ON public.group_savings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Update the update_group_savings function to handle errors better
CREATE OR REPLACE FUNCTION public.update_group_savings(amount_to_add NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN := FALSE;
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can update group savings';
  END IF;

  -- Update the group savings
  UPDATE public.group_savings
  SET 
    total_amount = total_amount + amount_to_add,
    last_updated_at = NOW(),
    updated_by = auth.uid()
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
`;

async function applyFixes() {
  try {
    console.log('Applying SQL fixes for group savings...');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: fixGroupSavingsSQL });
    
    if (error) {
      // If the exec_sql RPC doesn't exist, we'll need to run the SQL statements individually
      console.warn('Could not execute SQL via RPC. Trying individual statements...');
      
      // Split the SQL into individual statements
      const statements = fixGroupSavingsSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      // Execute each statement
      for (const stmt of statements) {
        console.log(`Executing: ${stmt.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });
        if (error) {
          console.error(`Error executing statement: ${error.message}`);
        }
      }
      
      console.log('Attempted to apply fixes individually.');
    } else {
      console.log('SQL fixes applied successfully!');
    }
    
    // Verify the policies exist
    console.log('Verifying policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .ilike('policyname', '%group savings%');
    
    if (policiesError) {
      console.error('Error verifying policies:', policiesError.message);
    } else {
      console.log('Policies found:', policies.length);
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}`);
      });
    }
    
    console.log('\nFix completed! Please try updating group savings again.');
    console.log('If you still encounter issues, please check the browser console for detailed error messages.');
    
  } catch (error) {
    console.error('Error applying fixes:', error.message);
    console.error('Please run the SQL manually in the Supabase SQL Editor.');
    console.log('\nSQL to run manually:');
    console.log(fixGroupSavingsSQL);
  }
}

applyFixes();
