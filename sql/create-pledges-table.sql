-- Create Pledges Table
-- This migration creates the pledges table with proper structure, indexes, triggers, and RLS policies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pledges table
CREATE TABLE IF NOT EXISTS pledges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_pledges_member_id ON pledges(member_id);
CREATE INDEX IF NOT EXISTS idx_pledges_date ON pledges(date DESC);
CREATE INDEX IF NOT EXISTS idx_pledges_created_by ON pledges(created_by);

-- Function to update updated_at timestamp (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_pledges_updated_at
  BEFORE UPDATE ON pledges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for pledges
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;

-- Allow admin and finance roles to manage pledges
CREATE POLICY "Admin and finance can manage pledges"
  ON pledges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'finance')
    )
  );

-- Allow authenticated users to read pledges
CREATE POLICY "Authenticated users can read pledges"
  ON pledges
  FOR SELECT
  USING (auth.role() = 'authenticated');


