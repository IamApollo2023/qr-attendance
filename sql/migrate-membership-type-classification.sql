-- Migration: Update membership_type to new values and add classification field
-- Run this in your Supabase SQL Editor

-- Step 1: Add classification column (nullable)
ALTER TABLE members
ADD COLUMN IF NOT EXISTS classification TEXT;

-- Step 2: Migrate existing data - move current membership_type to classification
UPDATE members
SET classification = membership_type
WHERE membership_type IN ('MEMBER', 'WORKER', 'PASTOR')
  AND classification IS NULL;

-- Step 3: Set default membership_type for existing records (you may want to adjust this)
UPDATE members
SET membership_type = 'Attendee'
WHERE membership_type IN ('MEMBER', 'WORKER', 'PASTOR');

-- Step 4: Drop the old CHECK constraint
ALTER TABLE members
DROP CONSTRAINT IF EXISTS members_membership_type_check;

-- Step 5: Add new CHECK constraint for membership_type
ALTER TABLE members
ADD CONSTRAINT members_membership_type_check CHECK (
  membership_type IN (
    'WSAM-LGAM',
    'LGAM',
    'WSAM',
    'Attendee'
  )
);

-- Step 6: Add CHECK constraint for classification
ALTER TABLE members
ADD CONSTRAINT members_classification_check CHECK (
  classification IS NULL OR classification IN (
    'MEMBER',
    'WORKER',
    'PASTOR'
  )
);

-- Step 7: Create index for classification if needed
CREATE INDEX IF NOT EXISTS idx_members_classification ON members(classification);

