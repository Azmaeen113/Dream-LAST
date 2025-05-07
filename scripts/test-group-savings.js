// This script tests the updateGroupSavings function
// Run with: node scripts/test-group-savings.js

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

async function testGroupSavings() {
  try {
    console.log('Testing group savings functionality...');
    
    // Get current group savings
    const { data: currentSavings, error: getSavingsError } = await supabase
      .from('group_savings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (getSavingsError) {
      console.error('Error fetching current savings:', getSavingsError.message);
      return;
    }
    
    console.log('Current group savings:', currentSavings);
    
    // Test the update_group_savings RPC function
    console.log('Testing update_group_savings RPC function...');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('update_group_savings', {
      amount_to_add: 100
    });
    
    if (rpcError) {
      console.error('Error calling update_group_savings RPC:', rpcError.message);
      console.error('Error details:', {
        code: rpcError.code,
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint
      });
    } else {
      console.log('RPC result:', rpcResult);
    }
    
    // Get updated group savings
    const { data: updatedSavings, error: getUpdatedError } = await supabase
      .from('group_savings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (getUpdatedError) {
      console.error('Error fetching updated savings:', getUpdatedError.message);
      return;
    }
    
    console.log('Updated group savings:', updatedSavings);
    
    // Check if the update was successful
    if (updatedSavings.total_amount === currentSavings.total_amount + 100) {
      console.log('Update successful! The total amount was increased by 100.');
    } else {
      console.log('Update may have failed. Expected total amount to be', currentSavings.total_amount + 100, 'but got', updatedSavings.total_amount);
    }
    
  } catch (error) {
    console.error('Error testing group savings:', error.message);
  }
}

testGroupSavings();
