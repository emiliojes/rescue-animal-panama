-- ============================================
-- TABLA: notifications
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Create notification
-- ============================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title TEXT,
  p_message TEXT,
  p_case_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, related_case_id, related_comment_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_case_id, p_comment_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Notify when someone comments on your case
-- ============================================
CREATE OR REPLACE FUNCTION notify_case_owner_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_case_owner_id UUID;
  v_case_title TEXT;
  v_commenter_name TEXT;
BEGIN
  -- Get case owner
  SELECT user_id, title INTO v_case_owner_id, v_case_title
  FROM cases
  WHERE id = NEW.case_id;
  
  -- Get commenter name
  SELECT name INTO v_commenter_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Don't notify if commenting on own case
  IF v_case_owner_id IS NOT NULL AND v_case_owner_id != NEW.user_id THEN
    PERFORM create_notification(
      v_case_owner_id,
      'comment',
      'Nuevo comentario en tu caso',
      v_commenter_name || ' comentó en "' || v_case_title || '"',
      NEW.case_id,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_case_owner_on_comment
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION notify_case_owner_on_comment();

-- ============================================
-- TRIGGER: Notify when someone claims your case
-- ============================================
CREATE OR REPLACE FUNCTION notify_case_owner_on_claim()
RETURNS TRIGGER AS $$
DECLARE
  v_case_owner_id UUID;
  v_case_title TEXT;
  v_rescuer_name TEXT;
BEGIN
  -- Get case owner and title
  SELECT user_id, title INTO v_case_owner_id, v_case_title
  FROM cases
  WHERE id = NEW.case_id;
  
  -- Get rescuer name
  SELECT name INTO v_rescuer_name
  FROM profiles
  WHERE id = NEW.rescuer_id;
  
  -- Don't notify if claiming own case
  IF v_case_owner_id IS NOT NULL AND v_case_owner_id != NEW.rescuer_id THEN
    PERFORM create_notification(
      v_case_owner_id,
      'claim',
      'Un rescatista tomó tu caso',
      v_rescuer_name || ' tomó el caso "' || v_case_title || '"',
      NEW.case_id,
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_case_owner_on_claim
AFTER INSERT ON case_claims
FOR EACH ROW
WHEN (NEW.active = TRUE)
EXECUTE FUNCTION notify_case_owner_on_claim();

-- ============================================
-- TRIGGER: Notify when case status changes
-- ============================================
CREATE OR REPLACE FUNCTION notify_case_owner_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_case_owner_id UUID;
  v_case_title TEXT;
  v_status_label TEXT;
BEGIN
  -- Only notify on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get case owner and title
    SELECT user_id, title INTO v_case_owner_id, v_case_title
    FROM cases
    WHERE id = NEW.case_id;
    
    -- Get status label
    v_status_label := CASE NEW.new_status
      WHEN 'new' THEN 'Nuevo'
      WHEN 'under_review' THEN 'En revisión'
      WHEN 'in_progress' THEN 'En progreso'
      WHEN 'resolved' THEN 'Resuelto'
      WHEN 'closed' THEN 'Cerrado'
      ELSE NEW.new_status
    END;
    
    -- Notify case owner
    IF v_case_owner_id IS NOT NULL THEN
      PERFORM create_notification(
        v_case_owner_id,
        'status_update',
        'Actualización de caso',
        'El estado de "' || v_case_title || '" cambió a: ' || v_status_label,
        NEW.case_id,
        NULL
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_case_owner_on_status_change
AFTER INSERT ON case_updates
FOR EACH ROW
EXECUTE FUNCTION notify_case_owner_on_status_change();
