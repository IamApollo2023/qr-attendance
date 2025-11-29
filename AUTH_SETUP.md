# Authentication Setup Guide

This app uses **Supabase Auth** with role-based access control (RBAC). Users are separated into two roles: **scanner** and **admin**.

## How It Works

### Role-Based Access Control

- **Scanner Role**: Can only access `/scanner` route and scan QR codes
- **Admin Role**: Can only access `/admin` route and view/manage attendance

**Security Feature**: Even if you have admin credentials, logging in through `/scanner/login` will **deny access** if you're not a scanner. Each route enforces its own role requirement.

### Routes

- **`/`** - Landing page with scanner/admin selection cards
- **`/scanner/login`** - Scanner login page
- **`/scanner`** - Protected scanner interface (requires scanner role)
- **`/admin/login`** - Admin login page
- **`/admin`** - Protected admin dashboard (requires admin role)

## Setting Up Users

### Step 1: Enable Email Auth in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Configure email templates

### Step 2: Create Users

You have two options:

#### Option A: Manual User Creation (Recommended for initial setup)

1. Go to **Authentication** → **Users** → **Add User**
2. Enter email and password
3. Click **Create User**
4. The user will be automatically created in `user_profiles` with default role `scanner`

#### Option B: Self-Registration

1. Users can sign up at `/scanner/login` (if you enable signup)
2. They'll automatically get `scanner` role
3. You'll need to manually promote users to `admin` role

### Step 3: Assign Roles

After creating users, update their roles in the database:

```sql
-- Make a user an admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Make a user a scanner (usually already default)
UPDATE user_profiles 
SET role = 'scanner' 
WHERE email = 'scanner@example.com';
```

Or do it via Supabase Dashboard:
1. Go to **Table Editor** → `user_profiles`
2. Find the user by email
3. Update the `role` field to `admin` or `scanner`

## Testing the Flow

### Test Scanner Access

1. Create a user with `scanner` role
2. Go to `http://localhost:3000/scanner/login`
3. Sign in with scanner credentials
4. You should be redirected to `/scanner` and see the QR scanner
5. Try accessing `/admin` - you should be redirected to login

### Test Admin Access

1. Create a user with `admin` role
2. Go to `http://localhost:3000/admin/login`
3. Sign in with admin credentials
4. You should be redirected to `/admin` and see the dashboard
5. Try accessing `/scanner` - you should be redirected to login

### Test Security

1. Create an admin user
2. Try logging in at `/scanner/login` with admin credentials
3. You should see "Access denied. Scanner role required."
4. This proves the route-based security is working!

## Database Schema

### `user_profiles` Table

- `id` (UUID) - References `auth.users(id)`
- `email` (TEXT) - User email
- `role` (TEXT) - Either `'scanner'` or `'admin'`
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### `qr_attendance` Table

- `id` (UUID) - Primary key
- `attendee_id` (TEXT) - QR code value
- `scanned_at` (TIMESTAMPTZ) - When scanned
- `event_id` (TEXT) - Event identifier
- `scanned_by` (UUID) - References `auth.users(id)` - who scanned it
- `created_at` (TIMESTAMPTZ)

**Note:** Table is named `qr_attendance` to avoid conflicts with existing attendance tables.

## Row Level Security (RLS)

The database uses RLS policies to enforce security:

- **Scanners** can only INSERT attendance records
- **Admins** can SELECT and DELETE attendance records
- Users can only read their own profile

## Troubleshooting

**"Access denied" error:**
- Check user role in `user_profiles` table
- Make sure you're logging in to the correct route (`/scanner/login` for scanner, `/admin/login` for admin)

**User profile not found:**
- The trigger should auto-create profiles on signup
- If missing, manually create:
  ```sql
  INSERT INTO user_profiles (id, email, role)
  VALUES ('user-uuid-here', 'email@example.com', 'scanner');
  ```

**Can't access routes:**
- Make sure you're signed in
- Check browser console for errors
- Verify Supabase environment variables are set

## Next Steps

Once auth is set up:
1. Create your first admin user
2. Create scanner users for your team
3. Test the flow on both mobile (scanner) and desktop (admin)
4. Deploy to Vercel and configure environment variables

