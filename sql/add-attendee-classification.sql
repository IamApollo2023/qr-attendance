-- Migration: Add ATTENDEE as a valid classification value
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing CHECK constraint for classification
ALTER TABLE members
DROP CONSTRAINT IF EXISTS members_classification_check;

-- Step 2: Add new CHECK constraint for classification including ATTENDEE
ALTER TABLE members
ADD CONSTRAINT members_classification_check CHECK (
  classification IS NULL OR classification IN (
    'MEMBER',
    'WORKER',
    'PASTOR',
    'ATTENDEE'
  )
);


