-- Diagnostic Script for RLS Issue
-- Run this in your Supabase SQL Editor to diagnose the RLS problem
-- Replace 'your-scanner-email@example.com' with your actual scanner email

-- 1. Check if the user exists and has a profile
SELECT
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  up.id as profile_id,
  up.role,
  up.created_at as profile_created,
  CASE
    WHEN up.id IS NULL THEN '❌ NO PROFILE - User needs a profile created'
    WHEN up.role IS NULL THEN '❌ NULL ROLE - Role needs to be set'
    WHEN up.role != 'scanner' THEN '❌ WRONG ROLE - Current role: ' || up.role || ' (should be scanner)'
    ELSE '✅ OK - User has scanner role'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'your-scanner-email@example.com';

-- 2. Check all RLS policies on qr_attendance table
SELECT
  policyname,
  cmd as command,
  permissive,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'qr_attendance'
ORDER BY policyname;

-- 3. Check if RLS is enabled on the table
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'qr_attendance';

-- 4. Test if a scanner user can see their profile (run this while logged in as scanner)
-- This will show what auth.uid() returns and if the user can see their profile
SELECT
  auth.uid() as current_auth_uid,
  (SELECT role FROM user_profiles WHERE id = auth.uid()) as current_user_role,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'scanner'
    ) THEN '✅ Policy check would PASS'
    ELSE '❌ Policy check would FAIL'
  END as policy_check_result;

-- 5. If user doesn't have a profile, create it:
-- First, get the user UUID:
-- SELECT id, email FROM auth.users WHERE email = 'your-scanner-email@example.com';

-- Then create the profile (replace with actual UUID):
-- INSERT INTO user_profiles (id, email, role)
-- VALUES ('PASTE-UUID-HERE', 'your-scanner-email@example.com', 'scanner')
-- ON CONFLICT (id) DO UPDATE SET role = 'scanner';

-- 6. If user has wrong role, fix it:
-- UPDATE user_profiles
-- SET role = 'scanner'
-- WHERE id = 'PASTE-UUID-HERE';

