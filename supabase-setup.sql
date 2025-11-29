-- QR Attendance Scanner - Supabase Setup
-- Run this in your Supabase SQL Editor

-- Create user profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('scanner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create QR attendance table (separate from existing attendance table if it exists)
CREATE TABLE IF NOT EXISTS qr_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendee_id TEXT NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_id TEXT DEFAULT 'default',
  scanned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_qr_attendance_attendee_event ON qr_attendance(attendee_id, event_id);
CREATE INDEX IF NOT EXISTS idx_qr_attendance_scanned_at ON qr_attendance(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_attendance_event_id ON qr_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_qr_attendance_scanned_by ON qr_attendance(scanned_by);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_attendance ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Attendance Policies
-- Scanner role: Can insert attendance records
CREATE POLICY "Scanners can insert attendance" ON qr_attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'scanner'
    )
  );

-- Admin role: Can read all attendance records
CREATE POLICY "Admins can read all attendance" ON qr_attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admin role: Can delete attendance records
CREATE POLICY "Admins can delete attendance" ON qr_attendance
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'scanner'); -- Default role is scanner
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Add a function to get stats
CREATE OR REPLACE FUNCTION get_qr_attendance_stats(p_event_id TEXT DEFAULT 'default')
RETURNS TABLE (
  total_scans BIGINT,
  today_scans BIGINT,
  unique_attendees BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_scans,
    COUNT(*) FILTER (WHERE DATE(scanned_at) = CURRENT_DATE)::BIGINT as today_scans,
    COUNT(DISTINCT attendee_id)::BIGINT as unique_attendees
  FROM qr_attendance
  WHERE event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;

