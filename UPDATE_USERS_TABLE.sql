-- ============================================================================
-- MEDILINK - ADD COLUMNS TO USERS TABLE (if not already present)
-- ============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → Copy & Paste → Run
-- This adds additional fields needed for registration and admin approval
-- ============================================================================

-- ============================================================================
-- ALTER USERS TABLE - Add missing columns if needed
-- ============================================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS created_by_admin BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- Add indexes for common queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_created_by_admin ON users(created_by_admin);
CREATE INDEX IF NOT EXISTS idx_users_approved_at ON users(approved_at);
CREATE INDEX IF NOT EXISTS idx_users_registered_at ON users(registered_at);

-- ============================================================================
-- VERIFY COLUMNS
-- ============================================================================

SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- ============================================================================
-- SUCCESS - Users table is ready for authentication
-- ============================================================================
