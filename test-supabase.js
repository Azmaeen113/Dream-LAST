// Simple script to test Supabase connection
// Run with: node test-supabase.js

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

// Function to test the connection
async function testConnection() {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials in .env file');
      console.log('Please make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
      process.exit(1);
    }
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Testing connection...');
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test the connection by fetching a small amount of data
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Connection successful!');
    console.log('Data:', data);
    
    // Test database connection string
    const dbUrl = process.env.VITE_SUPABASE_DB_URL;
    if (dbUrl) {
      console.log('Database URL is configured');
    } else {
      console.warn('Database URL is not configured');
    }
    
    // Test pooler connection string
    const poolerUrl = process.env.VITE_SUPABASE_POOLER_URL;
    if (poolerUrl) {
      console.log('Pooler URL is configured');
    } else {
      console.warn('Pooler URL is not configured');
    }
    
    // Test direct connection string
    const directUrl = process.env.VITE_SUPABASE_DIRECT_URL;
    if (directUrl) {
      console.log('Direct URL is configured');
    } else {
      console.warn('Direct URL is not configured');
    }
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    process.exit(1);
  }
}

// Run the test
testConnection();
