// Script to run the migration for group tables
// Run with: node scripts/run-migration.js

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

// Function to run the migration
async function runMigration() {
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
    console.log('Running migration...');
    
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Read the migration file
    const migrationPath = resolve(__dirname, '../supabase/migrations/20240901000001_create_group_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Execute the SQL statement
        const { error } = await supabase.rpc('pgmigrate', { query: statement + ';' });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error.message);
          console.log('Statement:', statement);
          
          // Continue with the next statement
          console.log('Continuing with the next statement...');
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (statementError) {
        console.error(`Exception executing statement ${i + 1}:`, statementError.message);
        console.log('Statement:', statement);
        
        // Continue with the next statement
        console.log('Continuing with the next statement...');
      }
    }
    
    console.log('\nMigration completed. Some errors may be expected if objects already exist.');
    console.log('Run the test script to verify the tables were created correctly:');
    console.log('node scripts/test-group-tables.js');
    
  } catch (error) {
    console.error('Unexpected error in runMigration:', error);
  }
}

// Create the pgmigrate function in Supabase if it doesn't exist
async function createPgmigrateFunction() {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return;
    }
    
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Create the pgmigrate function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION pgmigrate(query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE query;
      END;
      $$;
    `;
    
    const { error } = await supabase.rpc('pgmigrate', { query: createFunctionSQL });
    
    if (error && !error.message.includes('does not exist')) {
      // Create the function directly
      const { error: directError } = await supabase.rpc('exec', { sql: createFunctionSQL });
      
      if (directError && !directError.message.includes('does not exist')) {
        console.error('Error creating pgmigrate function:', directError.message);
        console.log('You may need to run the migration manually in the Supabase dashboard SQL editor');
      }
    }
  } catch (error) {
    console.error('Error creating pgmigrate function:', error.message);
    console.log('You may need to run the migration manually in the Supabase dashboard SQL editor');
  }
}

// Run the migration
createPgmigrateFunction()
  .then(() => runMigration())
  .catch(error => console.error('Error:', error));
