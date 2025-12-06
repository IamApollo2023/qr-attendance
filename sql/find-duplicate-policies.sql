-- Find Duplicate and Redundant RLS Policies
-- Run this to see which policies might be duplicates

-- 1. List all policies grouped by table and name to find exact duplicates
SELECT
  tablename,
  policyname,
  cmd as command,
  COUNT(*) as occurrence_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename, policyname, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, policyname;

-- 2. List all policies for qr_attendance (most likely to have duplicates)
SELECT
  policyname,
  cmd as command,
  permissive,
  roles,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'qr_attendance'
ORDER BY policyname, cmd;

-- 3. List all policies for events table
SELECT
  policyname,
  cmd as command,
  permissive,
  roles,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'events'
ORDER BY policyname, cmd;

-- 4. List all policies for user_profiles table
SELECT
  policyname,
  cmd as command,
  permissive,
  roles,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_profiles'
ORDER BY policyname, cmd;

-- 5. Count policies per table
SELECT
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(DISTINCT cmd::text, ', ') as commands
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;

