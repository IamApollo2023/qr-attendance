-- Comprehensive RLS Fix for QR Attendance
-- Run this ENTIRE script in your Supabase SQL Editor
-- This will completely reset and fix all RLS policies

-- STEP 1: Drop ALL existing policies on qr_attendance (start fresh)
DROP POLICY IF EXISTS "Scanners can insert attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Scanners can read attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Admins can read all attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Admins can delete attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Users can read own profile" ON qr_attendance;
DROP POLICY IF EXISTS "Users can update own profile" ON qr_attendance;

-- STEP 2: Verify RLS is enabled
ALTER TABLE qr_attendance ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create PERMISSIVE policies (default, but making it explicit)
-- Scanner role: Can insert attendance records for ANY event_id
CREATE POLICY "Scanners can insert attendance" ON qr_attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'scanner'
    )
  );

-- Scanner role: Can read attendance records (needed for duplicate checking)
CREATE POLICY "Scanners can read attendance" ON qr_attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'scanner'
    )
  );

-- Admin role: Can read all attendance records
CREATE POLICY "Admins can read all attendance" ON qr_attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admin role: Can delete attendance records
CREATE POLICY "Admins can delete attendance" ON qr_attendance
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- STEP 4: Verify the scanner user has the correct role
-- Replace 'scanner@test.com' with your actual scanner email
UPDATE user_profiles
SET role = 'scanner'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'scanner@test.com'
);

-- If user doesn't have a profile, create it
INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'scanner'
FROM auth.users
WHERE email = 'scanner@test.com'
  AND id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO UPDATE SET role = 'scanner';

-- STEP 5: Verify everything is set up correctly
SELECT
  'Policies' as check_type,
  COUNT(*) as count,
  STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies
WHERE tablename = 'qr_attendance';

SELECT
  'User Role' as check_type,
  u.email,
  up.role,
  CASE
    WHEN up.role = 'scanner' THEN '✅ OK'
    ELSE '❌ NEEDS FIX'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'scanner@test.com';

-- STEP 6: Test the policy logic (this will show NULL in SQL Editor, but works in app)
SELECT
  auth.uid() as current_user_id,
  (SELECT role FROM user_profiles WHERE id = auth.uid()) as current_role,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'scanner'
    ) THEN '✅ Policy would PASS'
    ELSE '❌ Policy would FAIL'
  END as insert_policy_check;




