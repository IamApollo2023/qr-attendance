# Manual Supabase Setup Instructions

Since you're using a different Supabase account, follow these steps to set up the database manually.

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**

## Step 2: Run the Setup SQL

1. Open the file `supabase-setup.sql` in this project
2. **Copy the entire contents** of the file
3. **Paste it into the SQL Editor** in Supabase
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

You should see: **"Success. No rows returned"** or similar success message.

## Step 3: Verify Tables Were Created

Run this query to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'qr_attendance');
```

You should see both `user_profiles` and `qr_attendance` tables.

## Step 4: Check Table Editor

1. Go to **Table Editor** in Supabase dashboard
2. You should now see:
   - `user_profiles` table
   - `qr_attendance` table

## Step 5: Create Your First Users

### Option A: Via Supabase Dashboard

1. Go to **Authentication** → **Users** → **Add User**
2. Enter email and password
3. Click **Create User**
4. The user profile will be auto-created with `scanner` role

### Option B: Via SQL

After creating a user in Authentication, update their role:

```sql
-- Make a user an admin
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';

-- Make a user a scanner (usually already default)
UPDATE user_profiles
SET role = 'scanner'
WHERE email = 'your-scanner@email.com';
```

## Step 6: Update Environment Variables

In your `.env.local` file, make sure you have:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in:

- Supabase Dashboard → **Settings** → **API**
- **Project URL** = `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key = `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

**"relation already exists" error:**

- The tables might already exist. You can drop them first:
  ```sql
  DROP TABLE IF EXISTS qr_attendance CASCADE;
  DROP TABLE IF EXISTS user_profiles CASCADE;
  ```
  Then run the setup SQL again.

**"permission denied" error:**

- Make sure you're running the SQL as a database admin
- Check that you have the correct permissions in Supabase

**Tables not showing in Table Editor:**

- Refresh the page (Ctrl+F5)
- Check that you're in the correct project
- Verify the tables exist using the SQL query in Step 3

## What Gets Created

✅ `user_profiles` table - Stores user roles (scanner/admin)  
✅ `qr_attendance` table - Stores QR scan records  
✅ Row Level Security (RLS) policies - Enforces role-based access  
✅ Auto-profile creation trigger - Creates profile when user signs up  
✅ Indexes - For fast queries  
✅ Stats function - `get_qr_attendance_stats()` for analytics

Once setup is complete, your app will be ready to use!
