-- Financial Tables Setup
-- Creates tables for Tithes, Offerings, and Pledges with proper RLS policies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tithes table
CREATE TABLE IF NOT EXISTS tithes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Offerings table
CREATE TABLE IF NOT EXISTS offerings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  offering_type TEXT NOT NULL DEFAULT 'general' CHECK (offering_type IN ('general', 'building', 'mission')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_tithes_member_id ON tithes(member_id);
CREATE INDEX IF NOT EXISTS idx_tithes_date ON tithes(date DESC);
CREATE INDEX IF NOT EXISTS idx_tithes_created_by ON tithes(created_by);
CREATE INDEX IF NOT EXISTS idx_offerings_member_id ON offerings(member_id);
CREATE INDEX IF NOT EXISTS idx_offerings_date ON offerings(date DESC);
CREATE INDEX IF NOT EXISTS idx_offerings_offering_type ON offerings(offering_type);
CREATE INDEX IF NOT EXISTS idx_offerings_created_by ON offerings(created_by);
CREATE INDEX IF NOT EXISTS idx_pledges_member_id ON pledges(member_id);
CREATE INDEX IF NOT EXISTS idx_pledges_date ON pledges(date DESC);
CREATE INDEX IF NOT EXISTS idx_pledges_created_by ON pledges(created_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tithes_updated_at
  BEFORE UPDATE ON tithes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offerings_updated_at
  BEFORE UPDATE ON offerings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pledges_updated_at
  BEFORE UPDATE ON pledges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for tithes
ALTER TABLE tithes ENABLE ROW LEVEL SECURITY;

-- Allow admin and finance roles to manage tithes
CREATE POLICY "Admin and finance can manage tithes"
  ON tithes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'finance')
    )
  );

-- Allow authenticated users to read tithes
CREATE POLICY "Authenticated users can read tithes"
  ON tithes
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for offerings
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;

-- Allow admin and finance roles to manage offerings
CREATE POLICY "Admin and finance can manage offerings"
  ON offerings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'finance')
    )
  );

-- Allow authenticated users to read offerings
CREATE POLICY "Authenticated users can read offerings"
  ON offerings
  FOR SELECT
  USING (auth.role() = 'authenticated');

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




