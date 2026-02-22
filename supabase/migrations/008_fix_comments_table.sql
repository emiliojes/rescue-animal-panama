-- Fix comments table - add user_id column if missing
DO $$ 
BEGIN
    -- Check if user_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'comments' 
        AND column_name = 'user_id'
    ) THEN
        -- Add user_id column
        ALTER TABLE comments 
        ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
        
        -- Create index
        CREATE INDEX idx_comments_user_id ON comments(user_id);
        
        RAISE NOTICE 'Added user_id column to comments table';
    ELSE
        RAISE NOTICE 'user_id column already exists in comments table';
    END IF;
    
    -- Check if updated_at column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'comments' 
        AND column_name = 'updated_at'
    ) THEN
        -- Add updated_at column
        ALTER TABLE comments 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Added updated_at column to comments table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in comments table';
    END IF;
END $$;
