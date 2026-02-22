-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view non-flagged comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;

-- Allow anyone to view non-flagged comments
CREATE POLICY "Anyone can view non-flagged comments"
ON comments FOR SELECT
USING (flagged = false);

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

-- Enable RLS on flags table
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can create flags" ON flags;
DROP POLICY IF EXISTS "Users can view their own flags" ON flags;

-- Allow authenticated users to create flags
CREATE POLICY "Authenticated users can create flags"
ON flags FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own flags
CREATE POLICY "Users can view their own flags"
ON flags FOR SELECT
USING (auth.uid() = user_id);
