-- Add archived_at column to cases table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'cases' 
        AND column_name = 'archived_at'
    ) THEN
        ALTER TABLE cases 
        ADD COLUMN archived_at TIMESTAMPTZ DEFAULT NULL;
        
        CREATE INDEX idx_cases_archived_at ON cases(archived_at);
        
        RAISE NOTICE 'Added archived_at column to cases table';
    END IF;
END $$;

-- Function to auto-archive resolved cases older than 30 days
CREATE OR REPLACE FUNCTION auto_archive_resolved_cases()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE cases
  SET archived_at = NOW()
  WHERE status IN ('resolved', 'closed')
    AND archived_at IS NULL
    AND updated_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  RAISE NOTICE 'Archived % cases', archived_count;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function that can be called via Supabase Edge Function or pg_cron
-- To run manually: SELECT auto_archive_resolved_cases();

-- Also create a trigger to auto-archive when status changes to 'closed'
-- This sets archived_at immediately for closed cases
CREATE OR REPLACE FUNCTION set_archive_on_close()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.archived_at = NOW() + INTERVAL '30 days';
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_archive_on_close ON cases;
CREATE TRIGGER trigger_set_archive_on_close
BEFORE UPDATE ON cases
FOR EACH ROW
EXECUTE FUNCTION set_archive_on_close();
