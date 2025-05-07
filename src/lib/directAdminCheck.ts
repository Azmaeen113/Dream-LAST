import { supabase } from '@/integrations/supabase/client';

/**
 * Directly check if the current user is an admin
 * This bypasses the normal admin check and directly queries the database
 */
export const directAdminCheck = async (): Promise<boolean> => {
  try {
    console.log('Performing direct admin check...');
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user is logged in');
      return false;
    }
    
    console.log('Current user ID:', user.id);
    
    // Check if the user has a profile with is_admin=true
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    console.log('Profile data:', data);
    
    // If is_admin is not a boolean, try to convert it
    let isAdmin = false;
    
    if (typeof data.is_admin === 'boolean') {
      isAdmin = data.is_admin;
    } else if (data.is_admin === 'true' || data.is_admin === '1' || data.is_admin === 1) {
      isAdmin = true;
    }
    
    console.log('Is admin?', isAdmin);
    
    return isAdmin;
  } catch (error) {
    console.error('Error in directAdminCheck:', error);
    return false;
  }
};

/**
 * Force set the current user as admin
 */
export const forceSetAsAdmin = async (): Promise<boolean> => {
  try {
    console.log('Forcing current user as admin...');
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user is logged in');
      return false;
    }
    
    console.log('Current user ID:', user.id);
    
    // Check if the user has a profile
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, is_admin')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error checking profile:', error);
      
      // If no profile exists, create one
      if (error.code === 'PGRST116') {
        console.log('No profile found, creating one...');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            is_admin: true,
            name: user.user_metadata?.name || 'Admin User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return false;
        }
        
        console.log('Successfully created admin profile');
        return true;
      }
      
      return false;
    }
    
    console.log('Existing profile:', data);
    
    // Update the profile to set is_admin=true
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error updating profile:', updateError);
      return false;
    }
    
    console.log('Successfully set user as admin');
    return true;
  } catch (error) {
    console.error('Error in forceSetAsAdmin:', error);
    return false;
  }
};
