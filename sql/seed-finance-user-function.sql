-- Seed Finance User Function
-- This creates a helper function to seed users (requires admin privileges)
-- Run this in your Supabase SQL Editor

-- Create a function to seed users (uses SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION seed_finance_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'financial@test.com';

  -- If user doesn't exist, create it
  -- Note: This requires direct access to auth.users which may not be available
  -- The recommended approach is to create the user via Supabase Dashboard or Auth API
  -- and then update the profile role

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User financial@test.com does not exist. Please create the user first via Supabase Dashboard (Authentication > Users > Add User) or Auth API, then run: UPDATE public.user_profiles SET role = ''finance'' WHERE email = ''financial@test.com'';';
  ELSE
    -- Update the user profile role
    UPDATE public.user_profiles
    SET role = 'finance'
    WHERE id = user_id;

    RAISE NOTICE 'User profile updated successfully. User ID: %', user_id;
  END IF;
END;
$$;

-- To use this function after creating the user via Dashboard:
-- SELECT seed_finance_user();







