-- Add new values to user_role enum if they don't exist
-- Note: After adding enum values, you must commit before using them
-- Run this migration, then run the next commands separately

-- Add 'rescuer' if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'rescuer' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
        ALTER TYPE user_role ADD VALUE 'rescuer';
    END IF;
END $$;

-- Add 'reporter' if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'reporter' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
        ALTER TYPE user_role ADD VALUE 'reporter';
    END IF;
END $$;

-- Add 'public' if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'public' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
        ALTER TYPE user_role ADD VALUE 'public';
    END IF;
END $$;

-- Ensure role column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role user_role;
        CREATE INDEX idx_profiles_role ON profiles(role);
    END IF;
END $$;

-- Add comment to document the role system
COMMENT ON COLUMN profiles.role IS 'User role: admin (full access), rescuer (can claim cases), reporter (can report cases), public (read-only)';
