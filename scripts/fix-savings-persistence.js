// Script to fix the group_savings table persistence issues
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ghktrlqtngdnnftxzool.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoa3RybHF0bmdkbm5mdHh6b29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjA4OTksImV4cCI6MjA2MTc5Njg5OX0.38KRCncPWSOwRatda2j9PhE-vhEX0maO_aKO-_Pg9Vs';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fix the group_savings table persistence issues
 */
async function fixSavingsPersistence() {
  try {
    console.log('Checking group_savings table...');
    
    // First, check if the table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'group_savings')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      console.error('Error checking for group_savings table:', tablesError);
      return;
    }
    
    if (!tables || tables.length === 0) {
      console.log('group_savings table does not exist, creating it...');
      
      // Create the table
      const createTableSql = `
        CREATE TABLE public.group_savings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          total_amount NUMERIC NOT NULL DEFAULT 0,
          goal_amount NUMERIC NOT NULL DEFAULT 2000000,
          note TEXT,
          last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Set up RLS policies
        ALTER TABLE public.group_savings ENABLE ROW LEVEL SECURITY;
        
        -- Allow everyone to view group_savings
        CREATE POLICY "Everyone can view group savings"
          ON public.group_savings
          FOR SELECT
          USING (true);
        
        -- Allow admins to update group_savings
        CREATE POLICY "Admins can update group savings"
          ON public.group_savings
          FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND is_admin = true
            )
          );
        
        -- Allow admins to insert into group_savings
        CREATE POLICY "Admins can insert group savings"
          ON public.group_savings
          FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND is_admin = true
            )
          );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSql });
      
      if (createError) {
        console.error('Error creating group_savings table:', createError);
        return;
      }
      
      console.log('Successfully created group_savings table');
    } else {
      console.log('group_savings table exists, checking structure...');
      
      // Check the table structure
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'group_savings')
        .eq('table_schema', 'public');
        
      if (columnsError) {
        console.error('Error checking table structure:', columnsError);
        return;
      }
      
      console.log('Current columns:', columns.map(col => col.column_name));
      
      // Check if we have all the necessary columns
      const columnNames = columns.map(col => col.column_name);
      const missingColumns = [];
      
      if (!columnNames.includes('total_amount')) missingColumns.push('total_amount');
      if (!columnNames.includes('goal_amount')) missingColumns.push('goal_amount');
      if (!columnNames.includes('note')) missingColumns.push('note');
      if (!columnNames.includes('last_updated_at')) missingColumns.push('last_updated_at');
      if (!columnNames.includes('updated_by')) missingColumns.push('updated_by');
      if (!columnNames.includes('created_at')) missingColumns.push('created_at');
      
      if (missingColumns.length > 0) {
        console.log('Missing columns:', missingColumns);
        
        // Add missing columns
        let alterTableSql = '';
        
        for (const column of missingColumns) {
          switch (column) {
            case 'total_amount':
              alterTableSql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS total_amount NUMERIC NOT NULL DEFAULT 0;\n';
              break;
            case 'goal_amount':
              alterTableSql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS goal_amount NUMERIC NOT NULL DEFAULT 2000000;\n';
              break;
            case 'note':
              alterTableSql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS note TEXT;\n';
              break;
            case 'last_updated_at':
              alterTableSql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();\n';
              break;
            case 'updated_by':
              alterTableSql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);\n';
              break;
            case 'created_at':
              alterTableSql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();\n';
              break;
          }
        }
        
        if (alterTableSql) {
          console.log('Altering table with SQL:', alterTableSql);
          
          const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterTableSql });
          
          if (alterError) {
            console.error('Error altering group_savings table:', alterError);
            return;
          }
          
          console.log('Successfully altered group_savings table');
        }
      } else {
        console.log('Table structure looks good');
      }
    }
    
    // Check if we have any records
    const { data: records, error: recordsError } = await supabase
      .from('group_savings')
      .select('*');
      
    if (recordsError) {
      console.error('Error checking for records:', recordsError);
      return;
    }
    
    if (!records || records.length === 0) {
      console.log('No records found, creating initial record...');
      
      // Create an initial record
      const { error: insertError } = await supabase
        .from('group_savings')
        .insert({
          total_amount: 0,
          goal_amount: 2000000,
          note: 'Initial setup',
          last_updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error creating initial record:', insertError);
        return;
      }
      
      console.log('Successfully created initial record');
    } else {
      console.log('Found', records.length, 'records');
      
      // Check if the most recent record has all the necessary fields
      const latestRecord = records[records.length - 1];
      console.log('Latest record:', latestRecord);
      
      // Update the record if needed
      const updateData = {};
      
      if (latestRecord.goal_amount === undefined || latestRecord.goal_amount === null) {
        updateData.goal_amount = 2000000;
      }
      
      if (latestRecord.last_updated_at === undefined || latestRecord.last_updated_at === null) {
        updateData.last_updated_at = new Date().toISOString();
      }
      
      if (Object.keys(updateData).length > 0) {
        console.log('Updating latest record with:', updateData);
        
        const { error: updateError } = await supabase
          .from('group_savings')
          .update(updateData)
          .eq('id', latestRecord.id);
          
        if (updateError) {
          console.error('Error updating latest record:', updateError);
          return;
        }
        
        console.log('Successfully updated latest record');
      }
    }
    
    console.log('Savings persistence fix complete');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
fixSavingsPersistence()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
