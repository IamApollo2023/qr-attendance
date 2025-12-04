-- Fix RLS Policies for QR Attendance Scanner
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Scanners can insert attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Admins can read all attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Scanners can read attendance" ON qr_attendance;

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
DROP POLICY IF EXISTS "Admins can delete attendance" ON qr_attendance;
CREATE POLICY "Admins can delete attendance" ON qr_attendance
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Verify user has a profile (run this to check your user)
-- Replace 'your-email@example.com' with the scanner user's email
SELECT 
  u.id,
  u.email,
  up.role,
  up.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'your-email@example.com';

-- If user doesn't have a profile, create one manually:
-- Replace 'user-uuid-here' with the actual user UUID from auth.users
-- Replace 'scanner' with 'admin' if this is an admin user
-- INSERT INTO user_profiles (id, email, role)
-- VALUES ('user-uuid-here', 'user@example.com', 'scanner')
-- ON CONFLICT (id) DO UPDATE SET role = 'scanner';


