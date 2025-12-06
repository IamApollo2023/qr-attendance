-- Fix RLS Policies for QR Attendance - Ensure scanners can insert for all events
-- Run this in your Supabase SQL Editor
-- This fixes the issue where scanners cannot insert records for new events like "Youth Zone"

-- First, let's check current policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'qr_attendance'
ORDER BY policyname;

-- Drop ALL existing policies on qr_attendance to start fresh
DROP POLICY IF EXISTS "Scanners can insert attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Scanners can read attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Admins can read all attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Admins can delete attendance" ON qr_attendance;

-- IMPORTANT: Scanner role: Can insert attendance records for ANY event_id
-- This policy uses SECURITY DEFINER-like behavior by checking user_profiles directly
-- It allows scanners to insert records regardless of event_id, member_id, or any other field
CREATE POLICY "Scanners can insert attendance" ON qr_attendance
  FOR INSERT
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

-- Verify the policies are correct
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'qr_attendance'
ORDER BY policyname;

-- Check if your scanner user has the correct role
-- Replace 'your-scanner-email@example.com' with the actual scanner email
SELECT
  u.id,
  u.email,
  up.role,
  up.created_at,
  CASE
    WHEN up.id IS NULL THEN 'NO PROFILE - NEEDS TO BE CREATED'
    WHEN up.role != 'scanner' THEN 'WRONG ROLE - CURRENTLY: ' || up.role
    ELSE 'OK'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'your-scanner-email@example.com';

-- Test the RLS policy by checking if the current user can see their profile
-- Run this while logged in as the scanner user
SELECT
  auth.uid() as current_user_id,
  up.role as current_user_role,
  CASE
    WHEN up.role = 'scanner' THEN 'CAN INSERT'
    ELSE 'CANNOT INSERT - ROLE IS: ' || COALESCE(up.role, 'NULL')
  END as insert_permission
FROM user_profiles up
WHERE up.id = auth.uid();

-- If the user doesn't have a profile or has the wrong role, fix it:
-- STEP 1: Get the user UUID (replace email)
-- SELECT id, email FROM auth.users WHERE email = 'your-scanner-email@example.com';

-- STEP 2: Create or update the profile (replace with actual UUID and email)
-- INSERT INTO user_profiles (id, email, role)
-- VALUES ('user-uuid-here', 'user@example.com', 'scanner')
-- ON CONFLICT (id) DO UPDATE SET role = 'scanner';

-- Alternative: Update all scanner users to ensure they have the correct role
-- UPDATE user_profiles
-- SET role = 'scanner'
-- WHERE role IS NULL OR role NOT IN ('scanner', 'admin', 'finance')
-- AND id IN (SELECT id FROM auth.users);

