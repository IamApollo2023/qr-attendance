-- Activities Table Setup for QR Attendance System
-- Run this in your Supabase SQL Editor AFTER running supabase-setup.sql

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  date DATE,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_activities_name ON activities(name);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON activities(created_by);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_activities_updated_at ON activities;
CREATE TRIGGER trigger_update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage activities
CREATE POLICY "Admins can manage activities" ON activities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Allow scanners to read activities (for validation during scanning)
CREATE POLICY "Scanners can read activities" ON activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('scanner', 'admin')
    )
  );

-- Pre-seed initial activities
INSERT INTO activities (name, description, status) VALUES
  ('iCare', 'iCare ministry activities', 'active'),
  ('Water Baptism', 'Water baptism ceremonies and events', 'active'),
  ('House Blessings', 'House blessing services', 'active'),
  ('Necro Service', 'Necrological services', 'active'),
  ('Non JIL related activities', 'Activities not directly related to JIL church', 'active')
ON CONFLICT (name) DO NOTHING;



















