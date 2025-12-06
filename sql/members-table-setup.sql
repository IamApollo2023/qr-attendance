-- Members Table Setup for QR Attendance System
-- Run this in your Supabase SQL Editor AFTER running supabase-setup.sql

-- Create members table with proper normalization
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id TEXT UNIQUE NOT NULL, -- Format: JIL-LUNA-001, JIL-LUNA-002, etc.
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  address TEXT, -- Deprecated: kept only for backward compatibility
  province_code TEXT,
  province_name TEXT,
  city_municipality_code TEXT,
  city_municipality_name TEXT,
  barangay_code TEXT,
  barangay_name TEXT,
  birthday DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  membership_type TEXT NOT NULL CHECK (
    membership_type IN (
      'MEMBER',
      'WORKER',
      'PASTOR'
    )
  ),
  age_category TEXT NOT NULL, -- Auto-calculated: Children, KKB, YAN, Men, Women
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_members_age_category ON members(age_category);
CREATE INDEX IF NOT EXISTS idx_members_barangay_code ON members(barangay_code);
CREATE INDEX IF NOT EXISTS idx_members_created_by ON members(created_by);

-- Function to calculate age category from birthday and gender
CREATE OR REPLACE FUNCTION calculate_age_category(birth_date DATE, member_gender TEXT)
RETURNS TEXT AS $$
DECLARE
  age_years INTEGER;
BEGIN
  age_years := EXTRACT(YEAR FROM AGE(birth_date));

  IF age_years <= 12 THEN
    RETURN 'Children';
  ELSIF age_years <= 24 THEN
    RETURN 'KKB';
  ELSIF age_years <= 34 THEN
    RETURN 'YAN';
  ELSIF member_gender = 'male' THEN
    RETURN 'Men';
  ELSE
    RETURN 'Women';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get next member ID in sequence (JIL-LUNA-001 format)
CREATE OR REPLACE FUNCTION get_next_member_id()
RETURNS TEXT AS $$
DECLARE
  last_number INTEGER;
  next_number INTEGER;
  next_id TEXT;
BEGIN
  -- Get the highest number from existing member_ids
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_id FROM 'JIL-LUNA-(\d+)') AS INTEGER)), 0)
  INTO last_number
  FROM members
  WHERE member_id ~ '^JIL-LUNA-\d+$';

  next_number := last_number + 1;
  next_id := 'JIL-LUNA-' || LPAD(next_number::TEXT, 3, '0');

  RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate age_category on insert/update
CREATE OR REPLACE FUNCTION update_age_category()
RETURNS TRIGGER AS $$
BEGIN
  NEW.age_category := calculate_age_category(NEW.birthday, NEW.gender);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_age_category ON members;
CREATE TRIGGER trigger_update_age_category
  BEFORE INSERT OR UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_age_category();

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage members
CREATE POLICY "Admins can manage members" ON members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Allow scanners to read members (for validation during scanning)
CREATE POLICY "Scanners can read members" ON members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('scanner', 'admin')
    )
  );

-- Update qr_attendance table to add member_id foreign key (for better normalization)
ALTER TABLE qr_attendance
  ADD COLUMN IF NOT EXISTS member_id UUID;

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_qr_attendance_member_id ON qr_attendance(member_id);

-- Add foreign key constraint with explicit name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'qr_attendance_member_id_fkey'
  ) THEN
    ALTER TABLE qr_attendance
    ADD CONSTRAINT qr_attendance_member_id_fkey
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Function to link existing attendance records to members (optional migration)
-- This can be run manually if you have existing data
CREATE OR REPLACE FUNCTION link_attendance_to_members()
RETURNS INTEGER AS $$
DECLARE
  linked_count INTEGER;
BEGIN
  UPDATE qr_attendance qa
  SET member_id = m.id
  FROM members m
  WHERE qa.attendee_id = m.member_id
    AND qa.member_id IS NULL;

  GET DIAGNOSTICS linked_count = ROW_COUNT;
  RETURN linked_count;
END;
$$ LANGUAGE plpgsql;

