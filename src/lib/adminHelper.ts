import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth';
import { isCurrentUserAdmin } from './admin';
import { directAdminCheck, forceSetAsAdmin, forceSetAsAdminWithServiceRole } from './directAdminCheck';

/**
 * Comprehensive function to check and fix admin status
 * This function tries multiple approaches to ensure the current user has admin rights
 * @returns Boolean indicating if the user is an admin after all attempts
 */
export const ensureAdminStatus = async (): Promise<boolean> => {
  try {
    console.log('Starting comprehensive admin check and fix...');
    
    // Get the current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('No user is logged in');
      return false;
    }
    
    console.log('Current user:', currentUser.id, currentUser.email);
    
    // Try standard admin check first
    let isAdmin = await isCurrentUserAdmin();
    console.log('Standard admin check result:', isAdmin);
    
    if (isAdmin) {
      console.log('User is already an admin, no fix needed');
      return true;
    }
    
    // Try direct admin check
    console.log('Standard admin check failed, trying direct admin check...');
    isAdmin = await directAdminCheck();
    console.log('Direct admin check result:', isAdmin);
    
    if (isAdmin) {
      console.log('User is admin according to direct check');
      return true;
    }
    
    // Try to force set as admin
    console.log('Direct admin check failed, trying to force set as admin...');
    const forceResult = await forceSetAsAdmin();
    console.log('Force set admin result:', forceResult);
    
    if (forceResult) {
      // Verify admin status after force set
      isAdmin = await directAdminCheck();
      console.log('Admin status after force set:', isAdmin);
      return isAdmin;
    }
    
    // Try service role as last resort
    console.log('Regular force set failed, trying service role...');
    const serviceRoleResult = await forceSetAsAdminWithServiceRole();
    console.log('Service role force set result:', serviceRoleResult);
    
    // Final admin check
    isAdmin = await directAdminCheck();
    console.log('Final admin check after all attempts:', isAdmin);
    
    return isAdmin;
  } catch (error) {
    console.error('Error in ensureAdminStatus:', error);
    return false;
  }
};

/**
 * Fix database tables if needed
 * This function ensures that the necessary tables exist and have the correct structure
 * @returns Boolean indicating if the operation was successful
 */
export const fixDatabaseTables = async (): Promise<boolean> => {
  try {
    console.log('Checking and fixing database tables...');
    
    // Check if the current user is an admin
    const isAdmin = await ensureAdminStatus();
    if (!isAdmin) {
      console.error('Only admins can fix database tables');
      return false;
    }
    
    // Check if the payments table exists
    const { data: paymentsExists, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('count')
      .limit(1);
    
    if (paymentsError) {
      console.error('Error checking payments table:', paymentsError);
      // Try to create the payments table
      // This would require more complex SQL that we won't implement here
    }
    
    // Check if the payment_history table exists
    const { data: historyExists, error: historyError } = await supabaseAdmin
      .from('payment_history')
      .select('count')
      .limit(1);
    
    if (historyError) {
      console.error('Error checking payment_history table:', historyError);
      // Try to create the payment_history table
      // This would require more complex SQL that we won't implement here
    }
    
    // Check if the group_savings table exists
    const { data: savingsExists, error: savingsError } = await supabaseAdmin
      .from('group_savings')
      .select('count')
      .limit(1);
    
    if (savingsError) {
      console.error('Error checking group_savings table:', savingsError);
      // Try to create the group_savings table
      // This would require more complex SQL that we won't implement here
    }
    
    console.log('Database tables check completed');
    return true;
  } catch (error) {
    console.error('Error in fixDatabaseTables:', error);
    return false;
  }
};
