-- Migration: Create Activity Albums System
-- Run this in your Supabase SQL Editor

-- Step 1: Create activity_albums table
CREATE TABLE IF NOT EXISTS activity_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL CHECK (
    activity_type IN (
      'life-group',
      'icare',
      'water-baptism',
      'house-blessings',
      'necros-services',
      'non-jil-related'
    )
  ),
  caption TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Step 2: Create activity_album_images table
CREATE TABLE IF NOT EXISTS activity_album_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES activity_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_activity_albums_type ON activity_albums(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_albums_created_at ON activity_albums(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_albums_created_by ON activity_albums(created_by);
CREATE INDEX IF NOT EXISTS idx_activity_album_images_album_id ON activity_album_images(album_id);
CREATE INDEX IF NOT EXISTS idx_activity_album_images_order ON activity_album_images(album_id, image_order);

-- Step 4: Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_activity_albums_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_activity_albums_updated_at ON activity_albums;
CREATE TRIGGER trigger_update_activity_albums_updated_at
  BEFORE UPDATE ON activity_albums
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_albums_updated_at();

-- Step 5: Enable Row Level Security
ALTER TABLE activity_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_album_images ENABLE ROW LEVEL SECURITY;

-- Step 6: RLS Policies for activity_albums
-- Admins can manage albums
CREATE POLICY "Admins can manage activity albums" ON activity_albums
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Everyone can read albums (for public viewing)
CREATE POLICY "Everyone can read activity albums" ON activity_albums
  FOR SELECT
  USING (true);

-- Step 7: RLS Policies for activity_album_images
-- Admins can manage images
CREATE POLICY "Admins can manage activity album images" ON activity_album_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Everyone can read images (for public viewing)
CREATE POLICY "Everyone can read activity album images" ON activity_album_images
  FOR SELECT
  USING (true);

-- Step 8: Create Supabase Storage bucket for activity images
-- IMPORTANT: This bucket must be created manually via Supabase Dashboard
--
-- Instructions:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: 'activity-images'
-- 4. Enable "Public bucket" (check the box)
-- 5. File size limit: 5MB
-- 6. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- 7. Click "Create bucket"
--
-- OR try this SQL (may not work on all Supabase instances):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'activity-images',
  'activity-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Step 9: Storage policies for activity-images bucket
-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload activity images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'activity-images' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Allow authenticated admins to update
CREATE POLICY "Admins can update activity images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'activity-images' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Allow authenticated admins to delete
CREATE POLICY "Admins can delete activity images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'activity-images' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Allow everyone to read (public access)
CREATE POLICY "Everyone can read activity images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'activity-images');

