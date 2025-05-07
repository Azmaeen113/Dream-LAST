# Fixing Savings Persistence Issues

This guide will help you fix the issue where savings updates disappear after a page refresh.

## Understanding the Issue

The issue occurs because:

1. The `group_savings` table might not have all the necessary columns
2. The data retrieval logic isn't handling different table structures properly
3. The update logic might not be saving the data correctly

## Solution

I've made several changes to fix these issues:

1. **Improved Data Retrieval**: The code now handles different table structures and column names
2. **Enhanced Data Saving**: The update logic now tries multiple approaches to ensure data is saved
3. **Added Table Structure Checking**: The code now checks and adapts to the existing table structure
4. **Created a Fix Script**: A script to fix the table structure directly

## How to Fix the Issue

### Step 1: Run the Fix Script

Run the following command to fix the table structure:

```
npm run fix:savings-persistence
```

This script will:
- Check if the `group_savings` table exists and create it if needed
- Check the table structure and add any missing columns
- Create an initial record if none exists
- Update existing records to ensure they have all necessary fields

### Step 2: Restart the Application

After running the fix script, restart the application:

```
npm run dev
```

### Step 3: Test the Savings Update

1. Log in with your admin account
2. Navigate to the Admin page
3. Update the savings amount
4. Refresh the page to verify the changes persist

## Technical Details

### Table Structure

The `group_savings` table should have the following structure:

```sql
CREATE TABLE public.group_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  goal_amount NUMERIC NOT NULL DEFAULT 2000000,
  note TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Code Changes

1. **getSavings Function**: Now retrieves the most recent record and handles different table structures
2. **getGroupSavingsRecord Function**: Creates a standardized GroupSavings object regardless of table structure
3. **updateSavings Function**: Checks table structure and adapts the update data accordingly
4. **GroupSavings Component**: Now handles different date formats and missing fields

## Troubleshooting

If you're still experiencing issues:

### Check Browser Console

1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. Look for error messages related to saving or retrieving data

### Check Database Structure

1. In the Supabase dashboard, go to the Table Editor
2. Check the structure of the `group_savings` table
3. Make sure it has all the necessary columns

### Run SQL Directly

If needed, you can run the following SQL in the Supabase SQL Editor:

```sql
-- Create the table with the correct structure
CREATE TABLE public.group_savings_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  goal_amount NUMERIC NOT NULL DEFAULT 2000000,
  note TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Copy data from old table
INSERT INTO public.group_savings_new (id, total_amount)
SELECT id, total_amount FROM public.group_savings;

-- Drop old table
DROP TABLE public.group_savings;

-- Rename new table to old name
ALTER TABLE public.group_savings_new RENAME TO group_savings;

-- Set up RLS policies
ALTER TABLE public.group_savings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view group_savings
CREATE POLICY "Everyone can view group savings"
  ON public.group_savings
  FOR SELECT
  USING (true);

-- Allow admins to update group_savings
CREATE POLICY "Admins can update group savings"
  ON public.group_savings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to insert into group_savings
CREATE POLICY "Admins can insert group savings"
  ON public.group_savings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert a default record if none exists
INSERT INTO public.group_savings (total_amount, goal_amount, note, last_updated_at)
SELECT 0, 2000000, 'Initial setup', now()
WHERE NOT EXISTS (SELECT 1 FROM public.group_savings);
```

If you continue to experience issues, please check the browser console for detailed error messages and contact support.
