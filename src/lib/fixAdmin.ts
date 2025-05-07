import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth';

/**
 * Check and fix the admin status of the current user
 * This function is used to ensure the current user has admin privileges
 * @returns Boolean indicating if the operation was successful
 */
export const checkAndFixAdminStatus = async (): Promise<boolean> => {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('Failed to get current user - user is not logged in');
      return false;
    }

    console.log('Checking admin status for user:', currentUser.id, currentUser.email);

    // Check if the user exists in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_admin, email')
      .eq('id', currentUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      
      // If the profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            is_admin: true, // Set as admin
            name: currentUser.user_metadata?.name || 'Admin User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return false;
        }
        
        console.log('Successfully created admin profile');
        return true;
      }
      
      return false;
    }

    console.log('Current profile data:', profileData);

    // If the user is not an admin, make them an admin
    if (!profileData.is_admin) {
      console.log('User is not an admin, updating to admin');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', currentUser.id);

      if (updateError) {
        console.error('Error updating admin status:', updateError);
        return false;
      }
      
      console.log('Successfully updated user to admin');
    } else {
      console.log('User is already an admin');
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in checkAndFixAdminStatus:', error);
    return false;
  }
};

/**
 * Set a specific user as admin by email
 * @param email The email of the user to set as admin
 * @returns Boolean indicating if the operation was successful
 */
export const setUserAsAdminByEmail = async (email: string): Promise<boolean> => {
  try {
    console.log('Setting user as admin by email:', email);
    
    // Find the user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error finding user by email:', userError);
      return false;
    }

    console.log('Found user:', userData);

    // Update the user's profile to set is_admin to true
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Error setting user as admin:', updateError);
      return false;
    }

    console.log('Successfully set user as admin');
    return true;
  } catch (error) {
    console.error('Unexpected error in setUserAsAdminByEmail:', error);
    return false;
  }
};
