-- Seed Finance User - SQL Instructions
-- ====================================
--
-- IMPORTANT: Before creating the finance user, you MUST update the CHECK constraint!
-- Run this first: update-user-profiles-constraint.sql
--
-- Supabase doesn't allow direct SQL inserts into auth.users for security reasons.
-- You have two options to create the user:

-- OPTION 1: Using Supabase Dashboard (Easiest)
-- ---------------------------------------------
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to: Authentication > Users
-- 3. Click "Add User" > "Create new user"
-- 4. Fill in:
--    - Email: financial@test.com
--    - Password: financial123
--    - Auto Confirm User: Yes (check this box)
-- 5. Click "Create User"
-- 6. After creating, run this SQL to set the role:
UPDATE public.user_profiles
SET role = 'finance'
WHERE email = 'financial@test.com';

-- Verify the user was created:
SELECT id, email, role, created_at
FROM public.user_profiles
WHERE email = 'financial@test.com';


-- OPTION 2: Using Node.js Script (Recommended for automation)
-- -----------------------------------------------------------
-- Run the provided script:
--   node scripts/seed-finance-user.js
--
-- Make sure to set these environment variables:
--   SUPABASE_URL=your_supabase_url
--   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
--
-- Get the service_role key from: Supabase Dashboard > Settings > API


-- OPTION 3: Manual SQL Update (if user already exists)
-- -----------------------------------------------------
-- If the user already exists but has the wrong role, just run:
UPDATE public.user_profiles
SET role = 'finance'
WHERE email = 'financial@test.com';
