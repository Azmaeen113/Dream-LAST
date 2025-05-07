// Script to fix the group_savings table
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ghktrlqtngdnnftxzool.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoa3RybHF0bmdkbm5mdHh6b29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjA4OTksImV4cCI6MjA2MTc5Njg5OX0.38KRCncPWSOwRatda2j9PhE-vhEX0maO_aKO-_Pg9Vs';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fix the group_savings table
 */
async function fixGroupSavingsTable() {
  try {
    console.log('Checking group_savings table...');
    
    // Check if the table exists and has records
    const { data: records, error: recordsError } = await supabase
      .from('group_savings')
      .select('*');
    
    if (recordsError) {
      console.error('Error checking group_savings table:', recordsError);
      return;
    }
    
    console.log(`Found ${records.length} records in group_savings table`);
    
    if (records.length === 0) {
      // Create a new record
      console.log('Creating initial group_savings record...');
      
      const { data: newRecord, error: insertError } = await supabase
        .from('group_savings')
        .insert({
          total_amount: 0,
          goal_amount: 2000000,
          note: 'Initial setup',
          last_updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.error('Error creating initial record:', insertError);
        return;
      }
      
      console.log('Successfully created initial record:', newRecord);
    } else {
      // Update the existing record
      const record = records[0];
      console.log('Updating existing record:', record);
      
      // Make sure total_amount and goal_amount are numbers
      const totalAmount = typeof record.total_amount === 'number' ? record.total_amount : 0;
      const goalAmount = typeof record.goal_amount === 'number' ? record.goal_amount : 2000000;
      
      const { data: updatedRecord, error: updateError } = await supabase
        .from('group_savings')
        .update({
          total_amount: totalAmount,
          goal_amount: goalAmount,
          note: 'Updated by fix script',
          last_updated_at: new Date().toISOString()
        })
        .eq('id', record.id)
        .select();
      
      if (updateError) {
        console.error('Error updating record:', updateError);
        return;
      }
      
      console.log('Successfully updated record:', updatedRecord);
    }
    
    // Check RLS policies
    console.log('Checking RLS policies...');
    
    // We can't directly check RLS policies through the API, but we can try to
    // create a test record to see if it works
    const { data: testRecord, error: testError } = await supabase
      .from('group_savings')
      .insert({
        total_amount: 1000,
        goal_amount: 2000000,
        note: 'Test record',
        last_updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select();
    
    if (testError) {
      console.log('RLS policy is working correctly (insert blocked)');
    } else {
      console.log('WARNING: RLS policy is not blocking inserts!');
      
      // Clean up the test record
      if (testRecord && testRecord.length > 0) {
        const { error: deleteError } = await supabase
          .from('group_savings')
          .delete()
          .eq('id', testRecord[0].id);
        
        if (deleteError) {
          console.error('Error deleting test record:', deleteError);
        } else {
          console.log('Deleted test record');
        }
      }
    }
    
    console.log('Group savings table check complete');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
fixGroupSavingsTable()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
