# Fixing Admin Permissions for Group Savings

This guide will help you fix the "Failed to update savings, please check your admin permissions" error.

## Understanding the Issue

The error occurs because:
1. The user trying to update the savings is not properly set as an admin in the database
2. The Row Level Security (RLS) policies for the `group_savings` table are blocking the update
3. There might be issues with the `group_savings` table structure

## Solution

Follow these steps to fix the issue:

### Step 1: Set Your Email as Admin

1. Open a terminal in the project directory
2. Run the following command to set your email as admin:
   ```
   npm run set:admin
   ```
   
   This script will:
   - Find your user account by email (sajink2016@gmail.com)
   - Set the `is_admin` flag to `true` in the `profiles` table
   - Create a profile record if one doesn't exist

### Step 2: Fix the Group Savings Table

1. In the same terminal, run:
   ```
   npm run fix:savings-table
   ```
   
   This script will:
   - Check if the `group_savings` table has any records
   - Create an initial record if none exists
   - Update existing records to ensure they have the correct structure
   - Test the RLS policies to make sure they're working correctly

### Step 3: Restart the Application

1. Close the application if it's running
2. Start it again with:
   ```
   npm run dev
   ```

### Step 4: Test the Group Savings Update

1. Log in with your admin account (sajink2016@gmail.com)
2. Navigate to the Admin page
3. Try updating the group savings amount
4. Check the browser console (F12) for any error messages

## Troubleshooting

If you're still experiencing issues:

### Check Admin Status in the Browser Console

1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. Look for messages like "Is user admin?" and "Current user:"
4. Make sure your user is correctly identified as an admin

### Check Supabase RLS Policies

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Navigate to your project
3. Go to the SQL Editor (left sidebar)
4. Run the following query to check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'group_savings';
   ```
5. Make sure there are policies allowing admins to update the table

### Manually Update Admin Status in Supabase

1. In the Supabase dashboard, go to the Table Editor
2. Select the `profiles` table
3. Find your user record (search by email)
4. Edit the record and set `is_admin` to `true`
5. Save the changes

## Understanding the Code Changes

The following changes were made to fix the issue:

1. **Fixed Supabase Client Import**: Updated the import path to use the correct Supabase client.

2. **Added Admin Status Check**: Added a function to check and fix admin status before updating savings.

3. **Enhanced Error Logging**: Added detailed logging to help diagnose permission issues.

4. **Created Helper Scripts**: Added scripts to set admin status and fix the group_savings table.

If you continue to experience issues, please check the browser console for detailed error messages and contact support.
