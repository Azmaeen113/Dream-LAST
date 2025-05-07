// Test script for group-related tables
// Run with: node scripts/test-group-tables.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Function to test the group tables
async function testGroupTables() {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials in .env file');
      console.log('Please make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file');
      process.exit(1);
    }
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Testing group tables...');
    
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Check if groups table exists
    console.log('\n--- Test 1: Check if groups table exists ---');
    const { data: groupsTableExists, error: groupsTableError } = await supabase
      .from('groups')
      .select('count')
      .limit(1);
    
    if (groupsTableError) {
      console.error('Error checking groups table:', groupsTableError.message);
      console.error('Make sure you have run the migration script to create the groups table');
      return;
    }
    
    console.log('✅ Groups table exists');
    
    // Test 2: Check if payment_history table exists
    console.log('\n--- Test 2: Check if payment_history table exists ---');
    const { data: paymentHistoryTableExists, error: paymentHistoryTableError } = await supabase
      .from('payment_history')
      .select('count')
      .limit(1);
    
    if (paymentHistoryTableError) {
      console.error('Error checking payment_history table:', paymentHistoryTableError.message);
      console.error('Make sure you have run the migration script to create the payment_history table');
      return;
    }
    
    console.log('✅ Payment history table exists');
    
    // Test 3: Check if group_id column exists in profiles table
    console.log('\n--- Test 3: Check if group_id column exists in profiles table ---');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('group_id')
      .limit(1);
    
    if (profilesError) {
      console.error('Error checking profiles table:', profilesError.message);
      return;
    }
    
    console.log('✅ group_id column exists in profiles table');
    
    // Test 4: Check if role column exists in profiles table
    console.log('\n--- Test 4: Check if role column exists in profiles table ---');
    const { data: profilesRoleData, error: profilesRoleError } = await supabase
      .from('profiles')
      .select('role')
      .limit(1);
    
    if (profilesRoleError) {
      console.error('Error checking profiles table for role column:', profilesRoleError.message);
      return;
    }
    
    console.log('✅ role column exists in profiles table');
    
    // Test 5: Check if group_id column exists in group_savings table
    console.log('\n--- Test 5: Check if group_id column exists in group_savings table ---');
    const { data: groupSavingsData, error: groupSavingsError } = await supabase
      .from('group_savings')
      .select('group_id')
      .limit(1);
    
    if (groupSavingsError) {
      console.error('Error checking group_savings table:', groupSavingsError.message);
      return;
    }
    
    console.log('✅ group_id column exists in group_savings table');
    
    // Test 6: Create a test group
    console.log('\n--- Test 6: Create a test group ---');
    const testGroupName = `Test Group ${new Date().toISOString()}`;
    const { data: newGroup, error: newGroupError } = await supabase
      .from('groups')
      .insert({ name: testGroupName })
      .select()
      .single();
    
    if (newGroupError) {
      console.error('Error creating test group:', newGroupError.message);
      return;
    }
    
    console.log('✅ Created test group:', newGroup);
    const testGroupId = newGroup.id;
    
    // Test 7: Create a test group savings record
    console.log('\n--- Test 7: Create a test group savings record ---');
    const { data: newGroupSavings, error: newGroupSavingsError } = await supabase
      .from('group_savings')
      .insert({
        group_id: testGroupId,
        amount: 1000,
        goal_amount: 10000,
        note: 'Test group savings',
        last_updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (newGroupSavingsError) {
      console.error('Error creating test group savings:', newGroupSavingsError.message);
      return;
    }
    
    console.log('✅ Created test group savings:', newGroupSavings);
    
    // Test 8: Create a test payment history record
    console.log('\n--- Test 8: Create a test payment history record ---');
    
    // Get an admin user to use as the user_id
    const { data: adminUser, error: adminUserError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .single();
    
    if (adminUserError || !adminUser) {
      console.error('Error getting admin user:', adminUserError?.message || 'No admin user found');
      return;
    }
    
    const { data: newPaymentHistory, error: newPaymentHistoryError } = await supabase
      .from('payment_history')
      .insert({
        group_id: testGroupId,
        user_id: adminUser.id,
        type: 'deposit',
        amount: 500,
        note: 'Test payment history',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (newPaymentHistoryError) {
      console.error('Error creating test payment history:', newPaymentHistoryError.message);
      return;
    }
    
    console.log('✅ Created test payment history:', newPaymentHistory);
    
    // Test 9: Clean up test data
    console.log('\n--- Test 9: Clean up test data ---');
    
    // Delete test payment history
    const { error: deletePaymentHistoryError } = await supabase
      .from('payment_history')
      .delete()
      .eq('id', newPaymentHistory.id);
    
    if (deletePaymentHistoryError) {
      console.error('Error deleting test payment history:', deletePaymentHistoryError.message);
    } else {
      console.log('✅ Deleted test payment history');
    }
    
    // Delete test group savings
    const { error: deleteGroupSavingsError } = await supabase
      .from('group_savings')
      .delete()
      .eq('id', newGroupSavings.id);
    
    if (deleteGroupSavingsError) {
      console.error('Error deleting test group savings:', deleteGroupSavingsError.message);
    } else {
      console.log('✅ Deleted test group savings');
    }
    
    // Delete test group
    const { error: deleteGroupError } = await supabase
      .from('groups')
      .delete()
      .eq('id', testGroupId);
    
    if (deleteGroupError) {
      console.error('Error deleting test group:', deleteGroupError.message);
    } else {
      console.log('✅ Deleted test group');
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error in testGroupTables:', error);
  }
}

// Run the test
testGroupTables();
