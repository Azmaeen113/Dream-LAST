// This script sets aharifhasan2000@gmail.com as an admin
// Run with: node scripts/add-admin.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// The email of the user to set as admin
const ADMIN_EMAIL = 'aharifhasan2000@gmail.com';

// Create Supabase client with the provided service role key
const supabaseUrl = 'https://ghktrlqtngdnnftxzool.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoa3RybHF0bmdkbm5mdHh6b29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIyMDg5OSwiZXhwIjoyMDYxNzk2ODk5fQ.o6GEzDWwbLLTUAzGeMFV3nLjQICJW9W_lPWNw-qfG5s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setUserAsAdmin(email) {
  try {
    console.log(`Setting user with email ${email} as admin...`);

    // Find the user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, name, is_admin')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error finding user:', userError);
      return false;
    }

    if (!userData) {
      console.error(`No user found with email ${email}`);
      return false;
    }

    console.log(`Found user: ${userData.name} (${userData.id})`);
    console.log(`Current admin status: ${userData.is_admin ? 'Admin' : 'Not Admin'}`);

    if (userData.is_admin) {
      console.log('User is already an admin. No changes needed.');
      return true;
    }

    // Update the user's profile to set is_admin to true
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Error setting user as admin:', updateError);
      return false;
    }

    console.log(`Successfully set ${userData.name} as admin!`);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Run the function
setUserAsAdmin(ADMIN_EMAIL)
  .then(success => {
    if (success) {
      console.log('Operation completed successfully.');
    } else {
      console.error('Operation failed.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 