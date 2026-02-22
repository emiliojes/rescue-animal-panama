-- This migration should be run AFTER 009_add_user_roles.sql
-- It updates existing users to have the 'reporter' role if they don't have one

-- Update existing users to have 'reporter' role if null
UPDATE profiles SET role = 'reporter'::user_role WHERE role IS NULL;

-- Set default for future inserts
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'reporter'::user_role;
