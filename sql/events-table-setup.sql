-- Events Table Setup for QR Attendance System
-- Run this in your Supabase SQL Editor AFTER running supabase-setup.sql

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON events;
CREATE TRIGGER trigger_update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Function to ensure only one active event at a time
CREATE OR REPLACE FUNCTION ensure_single_active_event()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting an event as active, deactivate all others
  IF NEW.is_active = true THEN
    UPDATE events
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_active_event ON events;
CREATE TRIGGER trigger_ensure_single_active_event
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_event();

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can manage events
CREATE POLICY "Admins can manage events" ON events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Allow scanners to read events (for validation during scanning)
CREATE POLICY "Scanners can read events" ON events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('scanner', 'admin')
    )
  );

-- Pre-seed fixed events
INSERT INTO events (name, description, is_active)
VALUES
  ('Worship Service', 'Weekly worship service attendance', true),
  ('Night of Power', 'Monthly night of power event attendance', false),
  ('Life Group', 'Life group meeting attendance', false),
  ('Youth Zone', 'Youth Zone event attendance', false)
ON CONFLICT (name) DO NOTHING;

-- Migrate existing attendance records to use "Worship Service" event
-- First, ensure the event exists (in case migration runs before seed)
INSERT INTO events (name, description, is_active)
VALUES ('Worship Service', 'Weekly worship service attendance', true)
ON CONFLICT (name) DO NOTHING;

-- Update existing attendance records with 'default' event_id to 'Worship Service'
UPDATE qr_attendance
SET event_id = 'Worship Service'
WHERE event_id = 'default' OR event_id IS NULL;

-- Enable Realtime for events table
-- This allows scanners to receive real-time updates when events are activated/deactivated
ALTER TABLE events REPLICA IDENTITY FULL;

-- Add events table to Supabase Realtime publication
-- Note: This may need to be done via Supabase Dashboard > Database > Replication
-- or via: ALTER PUBLICATION supabase_realtime ADD TABLE events;
-- The publication is managed by Supabase, so we'll add a comment here
-- To enable: Go to Supabase Dashboard > Database > Replication > Enable for 'events' table

