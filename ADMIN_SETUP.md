# Admin Setup Instructions

This document explains how to set up the initial admin user for the Dreamland Group application.

## Initial Admin Setup

The application is configured to have `sajink2016@gmail.com` as the initial admin user. This user will have the ability to:

1. Create and edit projects
2. Grant admin rights to other members
3. Revoke admin rights from other members

## Setting Up the Admin User

To set up the initial admin user, follow these steps:

1. Make sure you have Node.js installed on your system
2. Create a `.env` file in the root of the project with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
3. Run the admin setup script:
   ```
   node scripts/set-admin.js
   ```
4. The script will find the user with the email `sajink2016@gmail.com` and set them as an admin.

## Database Schema Changes

The admin functionality requires the following changes to your database schema:

1. Add an `is_admin` boolean column to the `profiles` table:
   ```sql
   ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
   ```

2. Create an `admin_rights` table to track admin rights changes:
   ```sql
   CREATE TABLE admin_rights (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES profiles(id),
     granted_by UUID NOT NULL REFERENCES profiles(id),
     granted_at TIMESTAMP WITH TIME ZONE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

## Admin Features

Once set up, admin users can:

1. Create new projects by clicking the "Create Project" button on the Projects page
2. Edit existing projects by clicking the "Edit Project" button on the Project Detail page
3. Grant admin rights to other members by visiting their profile page and using the admin controls
4. Revoke admin rights from other members by visiting their profile page and using the admin controls

## Security Considerations

- The admin setup script requires the Supabase service role key, which has full access to your database. Keep this key secure and never expose it in client-side code.
- Only run the admin setup script once during initial setup or when you need to reset the admin user.
- Consider implementing additional security measures such as audit logs for admin actions in a production environment.
