-- Script to manually update user profiles for testing
-- This can be run in Supabase SQL Editor

-- Update a specific user's name and role
UPDATE bible_profiles
SET 
  full_name = 'Your Full Name Here',
  role = 'admin'  -- or 'free'
WHERE id = 'your-user-id-here';

-- Or update based on email
UPDATE bible_profiles
SET 
  full_name = 'Your Full Name Here',
  role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- Check current profiles
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email
FROM bible_profiles p
JOIN auth.users u ON u.id = p.id;
