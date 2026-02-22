-- Add claimed_by column to cases table
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cases_claimed_by ON cases(claimed_by);
