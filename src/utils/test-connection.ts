import { supabase } from '@/integrations/supabase/client';

/**
 * Test the Supabase connection
 * Run this function to verify that your Supabase connection is working properly
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test authentication service
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth service error:', authError);
    } else {
      console.log('Auth service is working properly');
      console.log('Session:', authData.session ? 'Active' : 'None');
    }
    
    // Test database connection
    const { data: dbData, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.error('Database connection error:', dbError);
    } else {
      console.log('Database connection is working properly');
      console.log('Data:', dbData);
    }
    
    // Test storage
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();
    
    if (storageError) {
      console.error('Storage service error:', storageError);
    } else {
      console.log('Storage service is working properly');
      console.log('Available buckets:', buckets.map(b => b.name).join(', '));
    }
    
    console.log('Supabase connection test completed');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error during connection test:', error);
    return { success: false, error };
  }
};

// Uncomment to run the test directly
// testSupabaseConnection();
