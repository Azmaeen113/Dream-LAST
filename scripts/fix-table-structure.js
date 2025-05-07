// Script to fix the group_savings table structure
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ghktrlqtngdnnftxzool.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoa3RybHF0bmdkbm5mdHh6b29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjA4OTksImV4cCI6MjA2MTc5Njg5OX0.38KRCncPWSOwRatda2j9PhE-vhEX0maO_aKO-_Pg9Vs';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fix the group_savings table structure
 */
async function fixTableStructure() {
  try {
    console.log('Checking group_savings table structure...');
    
    // First, let's get the current structure by examining a record
    const { data: records, error: recordsError } = await supabase
      .from('group_savings')
      .select('*')
      .limit(1);
    
    if (recordsError) {
      console.error('Error checking group_savings table:', recordsError);
      return;
    }
    
    if (records.length === 0) {
      console.log('No records found in group_savings table');
      return;
    }
    
    const record = records[0];
    console.log('Current record structure:', record);
    
    // Check if the table has the correct columns
    const missingColumns = [];
    
    if (!('total_amount' in record)) missingColumns.push('total_amount');
    if (!('goal_amount' in record)) missingColumns.push('goal_amount');
    if (!('note' in record)) missingColumns.push('note');
    if (!('last_updated_at' in record)) missingColumns.push('last_updated_at');
    if (!('updated_by' in record)) missingColumns.push('updated_by');
    
    if (missingColumns.length === 0) {
      console.log('Table structure looks good!');
      return;
    }
    
    console.log('Missing columns:', missingColumns);
    
    // We need to run SQL to add the missing columns
    // For this, we'll use the SQL API
    
    // Build the SQL statement
    let sql = '';
    
    if (missingColumns.includes('goal_amount')) {
      sql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS goal_amount NUMERIC DEFAULT 2000000;\n';
    }
    
    if (missingColumns.includes('note')) {
      sql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS note TEXT;\n';
    }
    
    if (missingColumns.includes('last_updated_at')) {
      sql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();\n';
    }
    
    if (missingColumns.includes('updated_by')) {
      sql += 'ALTER TABLE public.group_savings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);\n';
    }
    
    if (sql) {
      console.log('Running SQL to fix table structure:');
      console.log(sql);
      
      // Execute the SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
      
      if (sqlError) {
        console.error('Error executing SQL:', sqlError);
        
        // Try an alternative approach - create a new table and copy data
        console.log('Trying alternative approach...');
        
        // Create a new table with the correct structure
        const createTableSql = `
          CREATE TABLE IF NOT EXISTS public.group_savings_new (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            total_amount NUMERIC NOT NULL DEFAULT 0,
            goal_amount NUMERIC NOT NULL DEFAULT 2000000,
            note TEXT,
            last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Copy data from old table
          INSERT INTO public.group_savings_new (id, total_amount)
          SELECT id, total_amount FROM public.group_savings;
          
          -- Drop old table
          DROP TABLE public.group_savings;
          
          -- Rename new table to old name
          ALTER TABLE public.group_savings_new RENAME TO group_savings;
          
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
        `;
        
        console.log('Running alternative SQL:');
        console.log(createTableSql);
        
        const { error: createTableError } = await supabase.rpc('exec_sql', { sql: createTableSql });
        
        if (createTableError) {
          console.error('Error with alternative approach:', createTableError);
          return;
        }
        
        console.log('Alternative approach successful!');
      } else {
        console.log('SQL executed successfully!');
      }
    }
    
    // Verify the changes
    const { data: updatedRecords, error: updatedError } = await supabase
      .from('group_savings')
      .select('*')
      .limit(1);
    
    if (updatedError) {
      console.error('Error checking updated table:', updatedError);
      return;
    }
    
    if (updatedRecords.length === 0) {
      console.log('No records found in updated table');
      return;
    }
    
    console.log('Updated record structure:', updatedRecords[0]);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
fixTableStructure()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
