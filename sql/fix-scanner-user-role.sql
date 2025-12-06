-- Fix Scanner User Role
-- Run this in your Supabase SQL Editor
-- This will check and fix the scanner user's role

-- STEP 1: List all users and their profiles to find your scanner user
-- Look for the scanner email in the results
SELECT
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  up.role,
  CASE
    WHEN up.id IS NULL THEN '❌ NO PROFILE'
    WHEN up.role IS NULL THEN '❌ NULL ROLE'
    WHEN up.role != 'scanner' THEN '❌ WRONG ROLE: ' || up.role
    ELSE '✅ OK'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;

-- STEP 2: Fix a specific scanner user (replace email with your scanner email)
-- Option A: If user already has a profile, just update the role
UPDATE user_profiles
SET role = 'scanner'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'scanner@test.com'
)
AND (role IS NULL OR role != 'scanner');

-- Option B: If user doesn't have a profile, create one
INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'scanner'
FROM auth.users
WHERE email = 'scanner@test.com'
  AND id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO UPDATE SET role = 'scanner';

-- STEP 3: Fix ALL users that should be scanners (use with caution)
-- This sets all users without a specific role to 'scanner'
-- UPDATE user_profiles
-- SET role = 'scanner'
-- WHERE role IS NULL OR role NOT IN ('admin', 'finance');

-- STEP 4: Verify the fix
SELECT
  u.email,
  up.role,
  '✅ Fixed' as status
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'scanner@test.com';

