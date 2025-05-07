// This script sets a specific user as an admin by email
// Run with: node scripts/set-admin.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// The email of the user to set as admin
const ADMIN_EMAIL = 'sajink2016@gmail.com';

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your environment variables.');
  process.exit(1);
}

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
