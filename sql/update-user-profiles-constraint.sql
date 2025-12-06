-- Update user_profiles CHECK constraint to include 'finance' role
-- Run this in your Supabase SQL Editor BEFORE creating the finance user

-- Drop the existing constraint
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add the updated constraint with 'finance' role
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_role_check
CHECK (role IN ('scanner', 'admin', 'finance'));

-- Verify the constraint was updated
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass
AND conname = 'user_profiles_role_check';







