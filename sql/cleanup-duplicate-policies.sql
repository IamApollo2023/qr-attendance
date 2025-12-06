-- Cleanup Duplicate RLS Policies
-- Run this AFTER reviewing find-duplicate-policies.sql results
-- WARNING: This will drop and recreate policies - review carefully first!

-- ============================================
-- STEP 1: Backup current policies (for reference)
-- ============================================
-- View current policies before cleanup:
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- STEP 2: Clean up qr_attendance policies
-- ============================================
-- Drop ALL existing policies on qr_attendance
DROP POLICY IF EXISTS "Scanners can insert attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Scanners can read attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Admins can read all attendance" ON qr_attendance;
DROP POLICY IF EXISTS "Admins can delete attendance" ON qr_attendance;

-- Recreate clean policies (one of each type)
CREATE POLICY "Scanners can insert attendance" ON qr_attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'scanner'
    )
  );

CREATE POLICY "Scanners can read attendance" ON qr_attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'scanner'
    )
  );

CREATE POLICY "Admins can read all attendance" ON qr_attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete attendance" ON qr_attendance
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- STEP 3: Verify cleanup
-- ============================================
SELECT
  'After cleanup' as status,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'qr_attendance'
GROUP BY tablename;

-- List remaining policies
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

