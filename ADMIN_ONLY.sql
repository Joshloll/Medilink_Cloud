-- ============================================================================
-- MEDILINK - CREATE ADMIN ACCOUNT WITH FULL DETAILS
-- ============================================================================
-- This script creates ONE admin account with complete information
-- Run this in: Supabase Dashboard → SQL Editor → Copy & Paste → Run
-- ============================================================================

-- Create Admin User with Full Details
INSERT INTO users (
  email, 
  full_name, 
  role, 
  status, 
  created_by_admin,
  created_at
)
VALUES (
  'admin@medilink.com',
  'TestAdmin',
  'admin',
  'approved',
  true,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- VERIFY ADMIN ACCOUNT WAS CREATED
-- ============================================================================

SELECT 
  id, 
  email, 
  full_name, 
  role, 
  status, 
  created_by_admin,
  created_at
FROM users
WHERE email = 'admin@medilink.com';

-- ============================================================================
-- SUCCESS - LOGIN CREDENTIALS
-- ============================================================================
-- Admin account created successfully!
-- 
-- ✓ ADMIN LOGIN DETAILS:
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--   Email:        admin@medilink.com
--   Full Name:    TestAdmin
--   Role:         Administrator
--   Status:       Approved ✓
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 
-- ✓ PASSWORD SETUP:
-- Note: Password is set through Supabase Authentication
-- When you log in with this email in your app:
-- 1. The app will recognize it as an admin account
-- 2. You'll set the password during first login or via email reset
-- 3. Supabase Auth handles password securely
-- 
-- ✓ NEXT STEPS:
-- 1. Go to your MediLink application
-- 2. Login with: admin@medilink.com
-- 3. Use the admin dashboard to create doctor and patient accounts
-- 4. Start managing the system from the Admin panel
-- ============================================================================
