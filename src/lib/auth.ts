import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Get the current session
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, userData: any) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
};

// Sign out
export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Reset password
export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

// Update user
export const updateUser = async (userData: any) => {
  return await supabase.auth.updateUser({
    data: userData
  });
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

// Update user profile - this uses a two-step approach to handle RLS
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    // First, update the user metadata in auth.users
    // This is important because it keeps the metadata in sync with the profile
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        name: profileData.name,
        full_name: profileData.name,
        address: profileData.address,
        mobile_number: profileData.mobile_number,
        updated_at: profileData.updated_at
      }
    });

    if (authError) {
      console.error("Error updating user metadata:", authError);
      // Continue anyway to try the profile update
    }

    // Then update the profile in the profiles table
    return await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
};
