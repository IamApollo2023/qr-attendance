-- FINAL RLS Fix - Simple and Direct
-- Run this ENTIRE script in your Supabase SQL Editor
-- This removes the TO authenticated clause which might be causing issues

-- STEP 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Scanners can insert attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Scanners can read attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Admins can read all attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Admins can delete attendance" ON qr_attendance;

-- STEP 2: Ensure RLS is enabled
ALTER TABLE qr_attendance ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create policies WITHOUT TO authenticated (let it apply to all roles)
-- Scanner role: Can insert attendance records
CREATE POLICY "Scanners can insert attendance" ON qr_attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'scanner'
    )
  );

-- Scanner role: Can read attendance records
CREATE POLICY "Scanners can read attendance" ON qr_attendance
  FOR SELECT
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
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- STEP 4: Fix scanner user (replace email)
UPDATE user_profiles
SET role = 'scanner'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'scanner@test.com'
);

INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'scanner'
FROM auth.users
WHERE email = 'scanner@test.com'
  AND id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO UPDATE SET role = 'scanner';

-- STEP 5: Verify setup
SELECT
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'qr_attendance'
ORDER BY policyname;

SELECT
  u.email,
  up.role,
  CASE WHEN up.role = 'scanner' THEN '✅' ELSE '❌' END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'scanner@test.com';


