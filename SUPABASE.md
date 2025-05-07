# Supabase Integration Guide

This document provides instructions for setting up and using Supabase with this project.

## Setup Instructions

### 1. Environment Variables

The project uses environment variables to configure Supabase. Create a `.env` file in the root of the project with the following variables:

```
VITE_SUPABASE_URL=https://ghktrlqtngdnnftxzool.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_DB_URL=postgresql://postgres:your_password@db.ghktrlqtngdnnftxzool.supabase.co:5432/postgres
VITE_SUPABASE_POOLER_URL=postgresql://postgres.ghktrlqtngdnnftxzool:your_password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
VITE_SUPABASE_DIRECT_URL=postgresql://postgres.ghktrlqtngdnnftxzool:your_password@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

Replace `your_anon_key`, `your_service_role_key`, and `your_password` with your actual Supabase credentials.

### 2. Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### 3. Test the Connection

Run the Supabase connection test to verify that everything is working:

```bash
npm run test:supabase
```

## Database Schema

The project uses the following tables in Supabase:

### Profiles

Stores user profile information:

- `id`: UUID (primary key, linked to auth.users)
- `name`: String
- `email`: String
- `address`: String
- `mobile_number`: String
- `is_admin`: Boolean
- `photo_url`: String (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Projects

Stores project information:

- `id`: UUID (primary key)
- `title`: String
- `description`: String (nullable)
- `caption`: String (nullable)
- `status`: String
- `start_date`: Date (nullable)
- `end_date`: Date (nullable)
- `budget`: Number (nullable)
- `progress`: Number (nullable)
- `photo_url`: String (nullable)
- `created_by`: UUID (foreign key to profiles.id)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Admin Rights

Stores admin rights for users:

- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to profiles.id)
- `granted_by`: UUID (foreign key to profiles.id)
- `granted_at`: Timestamp

### Messages

Stores messages:

- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to profiles.id)
- `content`: String
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Storage Buckets

The project uses the following storage buckets:

- `profile_photos`: For storing user profile photos
- `project_photos`: For storing project images

## Authentication

The project uses Supabase Authentication for user management. The following auth features are used:

- Email/password authentication
- Password reset
- User profile management

## API Usage

The project uses the Supabase JavaScript client for all API calls. The client is initialized in `src/integrations/supabase/client.ts`.

Example usage:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Query data
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

// Insert data
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    // ...
  });

// Update data
const { data, error } = await supabase
  .from('profiles')
  .update({ name: 'Jane Doe' })
  .eq('id', userId);

// Delete data
const { data, error } = await supabase
  .from('profiles')
  .delete()
  .eq('id', userId);
```

## Utility Functions

The project includes utility functions for common Supabase operations:

- `src/lib/auth.ts`: Functions for authentication and user management
- `src/server/db.ts`: Functions for server-side database operations
- `src/utils/test-connection.ts`: Function for testing the Supabase connection

## Troubleshooting

If you encounter issues with Supabase:

1. Check that your environment variables are correctly set
2. Run the connection test: `npm run test:supabase`
3. Check the browser console for error messages
4. Verify that your Supabase project is active and the services are running
5. Check that your IP is allowed in the Supabase project settings

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
