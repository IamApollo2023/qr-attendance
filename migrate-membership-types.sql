-- Migration: Simplify membership types from MEMBER (SELDOMLY ATTENDS) and MEMBER (REGULARLY ATTENDS) to just MEMBER
-- Run this in your Supabase SQL Editor AFTER updating the application code

-- Step 1: Update existing records to use "MEMBER" instead of the two variants
UPDATE members
SET membership_type = 'MEMBER'
WHERE membership_type IN ('MEMBER (SELDOMLY ATTENDS)', 'MEMBER (REGULARLY ATTENDS)');

-- Step 2: Drop the old CHECK constraint
ALTER TABLE members
DROP CONSTRAINT IF EXISTS members_membership_type_check;

-- Step 3: Add the new CHECK constraint with simplified membership types
ALTER TABLE members
ADD CONSTRAINT members_membership_type_check CHECK (
  membership_type IN (
    'MEMBER',
    'WORKER',
    'PASTOR'
  )
);


