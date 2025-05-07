# Supabase Group Savings Implementation

This implementation allows admins to update the group savings amount, which is then immediately reflected on the homepage. All data is stored in Supabase.

## How It Works

1. The group savings data is stored in the `group_savings` table in Supabase
2. Admins can update both the total savings amount and the goal amount
3. Each update is recorded in the `payment_history` table for tracking
4. The homepage periodically checks for updates to the savings amount
5. When an admin updates the savings, the homepage automatically reflects the changes

## Features

- **Real-time Updates**: Changes to savings are immediately reflected on the homepage
- **Goal Tracking**: Progress towards the savings goal is visually displayed
- **Transaction History**: All updates are recorded in the payment history
- **Admin-only Access**: Only users with admin privileges can update the savings
- **Secure Storage**: All data is securely stored in your Supabase database

## Supabase Configuration

The implementation uses the following Supabase tables:

1. `group_savings` - Stores the current savings amount and goal
   - `id`: UUID (primary key)
   - `total_amount`: Numeric (current savings)
   - `goal_amount`: Numeric (savings goal)
   - `note`: Text (optional note about the last update)
   - `last_updated_at`: Timestamp
   - `updated_by`: UUID (reference to auth.users)
   - `created_at`: Timestamp

2. `payment_history` - Records all savings updates
   - `id`: UUID (primary key)
   - `user_id`: UUID (reference to auth.users)
   - `type`: Text ('deposit' or 'withdrawal')
   - `amount`: Numeric
   - `note`: Text
   - `created_at`: Timestamp

## Row Level Security (RLS) Policies

The implementation uses the following RLS policies:

1. Everyone can view group savings:
   ```sql
   CREATE POLICY "Everyone can view group savings"
     ON public.group_savings
     FOR SELECT
     USING (true);
   ```

2. Only admins can update group savings:
   ```sql
   CREATE POLICY "Admins can update group savings"
     ON public.group_savings
     FOR UPDATE
     USING (
       EXISTS (
         SELECT 1 FROM public.profiles
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

3. Only admins can insert group savings:
   ```sql
   CREATE POLICY "Admins can insert group savings"
     ON public.group_savings
     FOR INSERT
     WITH CHECK (
       EXISTS (
         SELECT 1 FROM public.profiles
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

## Usage

1. Log in as an admin
2. Navigate to the Admin page by clicking on "Admin" in the bottom navigation bar
3. View the current savings amount and goal
4. Click "Update Savings" to open the update dialog
5. Enter the new savings amount and optionally update the goal amount
6. Add an optional note to describe the reason for the update
7. Click "Update Savings" to save the changes
8. The homepage will automatically reflect the updated amounts

## Troubleshooting

If you encounter any issues:

1. Check that your Supabase connection is working
2. Verify that you have admin privileges
3. Check the browser console for any errors
4. Ensure that the RLS policies are correctly set up in Supabase
5. Verify that the `group_savings` table exists and has the correct structure
