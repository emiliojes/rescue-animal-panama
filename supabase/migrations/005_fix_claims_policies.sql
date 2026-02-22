-- Enable RLS on case_claims if not already enabled
ALTER TABLE case_claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own claims" ON case_claims;
DROP POLICY IF EXISTS "Authenticated users can create claims" ON case_claims;
DROP POLICY IF EXISTS "Users can update their own claims" ON case_claims;
DROP POLICY IF EXISTS "Anyone can view claims" ON case_claims;

-- Allow anyone to view all claims (needed to check if case is claimed)
CREATE POLICY "Anyone can view claims"
ON case_claims FOR SELECT
USING (true);

-- Allow authenticated users to create claims
CREATE POLICY "Authenticated users can create claims"
ON case_claims FOR INSERT
WITH CHECK (auth.uid() = rescuer_id);

-- Allow users to update their own claims
CREATE POLICY "Users can update their own claims"
ON case_claims FOR UPDATE
USING (auth.uid() = rescuer_id);

-- Allow authenticated users to update cases when claiming
CREATE POLICY "Users can update cases when claiming"
ON cases FOR UPDATE
USING (auth.uid() = claimed_by OR claimed_by IS NULL);
