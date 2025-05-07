# Fixing Row Level Security (RLS) Issues in Supabase

This guide will help you fix both the "new row violates row-level security policy for table 'profiles'" error during registration and profile editing issues.

## Understanding the Issues

### Registration Error
The error occurs because:
1. Supabase has Row Level Security (RLS) enabled on your `profiles` table
2. When a new user signs up, your code tries to insert a row into the `profiles` table
3. The RLS policies are preventing this insertion because the user is not yet authenticated

### Profile Editing Issues
Profile editing may fail because:
1. The RLS policies might not be properly configured to allow users to update their own profiles
2. The update approach might not be handling the RLS constraints correctly
3. Storage permissions might be preventing profile photo uploads

## Solution

We'll implement a comprehensive solution to fix both issues:

1. Modify the sign-up process to rely on a database trigger instead of manual profile creation
2. Create a database trigger and appropriate RLS policies in Supabase
3. Update the profile editing functionality to work with RLS
4. Add storage bucket policies for profile photos

### Step 1: Run the Initial SQL Script in Supabase

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Navigate to your project
3. Go to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the contents of the `supabase/migrations/20240101000000_create_profile_trigger.sql` file
6. Run the query

This script will:
- Create a function to handle new user creation
- Create a trigger to automatically create a profile when a new user signs up
- Set up initial RLS policies for the profiles table

### Step 2: Run the Updated RLS Policies Script

1. Stay in the SQL Editor
2. Create another new query
3. Copy and paste the contents of the `supabase/migrations/20240102000000_update_profile_policies.sql` file
4. Run the query

This script will:
- Update the RLS policies to properly allow profile updates
- Add storage policies for profile photos

### Step 3: Create Storage Buckets

1. Stay in the SQL Editor
2. Create another new query
3. Copy and paste the contents of the `supabase/migrations/20240103000000_create_storage_buckets.sql` file
4. Run the query

This script will:
- Create the necessary storage buckets if they don't exist
- Set up RLS policies for the storage buckets
- Configure proper permissions for file uploads and access

### Step 4: Test the Sign-Up and Profile Editing

After implementing these changes:
1. Try signing up again - it should work without the RLS error
2. Log in and try editing your profile - it should now save successfully

## How It Works

### For Registration
1. When a user signs up, we include all profile data in the user metadata
2. The database trigger automatically creates a profile entry using this metadata
3. The RLS policies allow this insertion because it's done by the trigger function with elevated privileges

### For Profile Editing
1. We update both the user metadata and the profile table in a single operation
2. The RLS policies allow users to update their own profiles
3. Storage policies allow users to upload and access their profile photos

## Troubleshooting

If you still encounter issues:

1. Check the browser console for detailed error messages
2. Verify that both SQL scripts ran successfully without errors
3. Make sure your Supabase tables have the correct structure
4. Check that your storage buckets have appropriate permissions
5. Try clearing your browser cache and logging in again

### Common Issues and Solutions

#### Profile Updates Not Saving
- Make sure you've run both SQL scripts
- Check that the user is properly authenticated
- Verify that the profile ID matches the authenticated user ID

#### Profile Photo Upload Issues
- Check that the 'profile_photos' bucket exists in Supabase Storage
- Verify that the storage policies are correctly applied
- Check file size limits (Supabase has a default 2MB limit)

## Additional Resources

- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Database Triggers](https://supabase.com/docs/guides/database/triggers)
- [Supabase Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
