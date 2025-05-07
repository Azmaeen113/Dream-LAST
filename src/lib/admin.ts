import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from './auth';
import { deleteFile } from './storage';
import type { Database } from '@/integrations/supabase/types';

// Create a service client for admin operations
const createServiceClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase service credentials. Check your environment variables.');
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

// Helper function to delete records from a table
const deleteRecords = async (serviceClient: any, table: string, userId: string): Promise<boolean> => {
  try {
    console.log(`Deleting records from ${table}...`);
    const { error } = await serviceClient
      .from(table)
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      return false;
    }
    console.log(`Successfully deleted from ${table}`);
    return true;
  } catch (error) {
    console.error(`Exception while deleting from ${table}:`, error);
    return false;
  }
};

/**
 * Check if the current user is an admin
 * @returns Boolean indicating if the current user is an admin
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!data.is_admin;
  } catch (error) {
    console.error('Unexpected error in isCurrentUserAdmin:', error);
    return false;
  }
};

/**
 * Check if a specific user is an admin
 * @param userId The ID of the user to check
 * @returns Boolean indicating if the user is an admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!data.is_admin;
  } catch (error) {
    console.error('Unexpected error in isUserAdmin:', error);
    return false;
  }
};

/**
 * Grant admin rights to a user
 * @param userId The ID of the user to grant admin rights to
 * @returns Boolean indicating if the operation was successful
 */
export const grantAdminRights = async (userId: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;

    // Check if the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can grant admin rights');
      return false;
    }

    // Update the user's profile to set is_admin to true
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Error granting admin rights:', updateError);
      return false;
    }

    // Record the admin rights grant in the admin_rights table
    const { error: insertError } = await supabase
      .from('admin_rights')
      .insert({
        user_id: userId,
        granted_by: currentUser.id,
        granted_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error recording admin rights grant:', insertError);
      // Continue anyway since the user is already an admin
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in grantAdminRights:', error);
    return false;
  }
};

/**
 * Revoke admin rights from a user
 * @param userId The ID of the user to revoke admin rights from
 * @returns Boolean indicating if the operation was successful
 */
export const revokeAdminRights = async (userId: string): Promise<boolean> => {
  try {
    // Check if the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can revoke admin rights');
      return false;
    }

    // Update the user's profile to set is_admin to false
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', userId);

    if (error) {
      console.error('Error revoking admin rights:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in revokeAdminRights:', error);
    return false;
  }
};

/**
 * Set a specific user as admin by email (used for initial setup)
 * @param email The email of the user to set as admin
 * @returns Boolean indicating if the operation was successful
 */
export const setUserAsAdminByEmail = async (email: string): Promise<boolean> => {
  try {
    // Find the user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('Error finding user by email:', userError);
      return false;
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

    return true;
  } catch (error) {
    console.error('Unexpected error in setUserAsAdminByEmail:', error);
    return false;
  }
};

/**
 * Remove a member from the system
 * @param userId The ID of the user to remove
 * @returns Boolean indicating if the operation was successful
 */
export const removeMember = async (userId: string): Promise<boolean> => {
  try {
    console.log('Starting member removal process for user:', userId);

    // Check if the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can remove members');
      return false;
    }
    console.log('Admin check passed');

    // Create a service client with admin privileges
    const serviceClient = createServiceClient();
    if (!serviceClient) {
      console.error('Failed to create service client');
      return false;
    }
    console.log('Service client created');

    // Get the user's profile to get their photo URL and email
    console.log('Fetching user profile...');
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('photo_url, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return false;
    }
    console.log('Successfully fetched user profile');

    // Delete all related records first
    console.log('Deleting related records...');

    // List of tables to check and their possible column names
    const relatedTables = [
      { name: 'payment_history' as const, columns: ['user_id', 'member_id'] },
      { name: 'payments' as const, columns: ['user_id', 'member_id'] },
      { name: 'admin_rights' as const, columns: ['user_id', 'member_id'] },
      { name: 'group_savings' as const, columns: ['user_id', 'member_id'] }
    ];

    // Delete from each table in order
    for (const table of relatedTables) {
      console.log(`Attempting to delete from ${table.name}...`);
      
      // Try each possible column name
      for (const column of table.columns) {
        try {
          const { error } = await serviceClient
            .from(table.name)
            .delete()
            .eq(column, userId);

          if (error) {
            console.error(`Error deleting from ${table.name} using ${column}:`, error);
            // Continue to next column
          } else {
            console.log(`Successfully deleted records from ${table.name} using ${column}`);
            break; // If successful, no need to try other columns
          }
        } catch (error) {
          console.error(`Exception when deleting from ${table.name} using ${column}:`, error);
          // Continue to next column
        }
      }
    }

    // Delete the user's profile photo if it exists
    if (profile?.photo_url) {
      console.log('Attempting to delete profile photo...');
      const fileName = profile.photo_url.split('/').pop();
      if (fileName) {
        try {
          await deleteFile('profile_photos', fileName);
          console.log('Successfully deleted profile photo');
        } catch (photoError) {
          console.error('Error deleting profile photo:', photoError);
          // Continue anyway as the photo might not exist
        }
      }
    }

    // Delete the user's profile
    console.log('Deleting user profile...');
    const { error: profileDeleteError } = await serviceClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileDeleteError) {
      console.error('Error deleting user profile:', profileDeleteError);
      return false;
    }
    console.log('Successfully deleted user profile');

    // Finally, delete the user from auth.users
    console.log('Attempting to delete user from auth.users...');
    try {
      const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(userId);
      if (authDeleteError) {
        console.error('Error deleting user from auth:', authDeleteError);
        // If we've deleted the profile but auth deletion fails, we should still return true
        // as the user is effectively removed from the system
      } else {
        console.log('Successfully deleted user from auth.users');
      }
    } catch (authError) {
      console.error('Exception when deleting user from auth:', authError);
      // If we've deleted the profile but auth deletion fails, we should still return true
      // as the user is effectively removed from the system
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in removeMember:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};
