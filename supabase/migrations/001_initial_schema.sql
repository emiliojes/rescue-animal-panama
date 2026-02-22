-- ============================================
-- EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('public', 'registered', 'rescuer', 'admin');
CREATE TYPE case_type AS ENUM ('rescue', 'abuse', 'lost', 'found');
CREATE TYPE case_status AS ENUM ('new', 'under_review', 'in_progress', 'resolved', 'closed', 'spam');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE species_type AS ENUM ('dog', 'cat', 'bird', 'other');
CREATE TYPE contact_method AS ENUM ('phone', 'email', 'whatsapp');

-- ============================================
-- TABLA: profiles
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role DEFAULT 'registered',
  phone TEXT,
  organization TEXT,
  verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: cases
-- ============================================
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  case_type case_type NOT NULL,
  species species_type NOT NULL,
  urgency urgency_level DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status case_status DEFAULT 'new',
  
  -- Ubicación pública (aproximada)
  public_lat DECIMAL(10, 7),
  public_lng DECIMAL(10, 7),
  public_location GEOGRAPHY(POINT, 4326),
  
  -- Ubicación exacta (solo rescatistas/admin)
  exact_lat DECIMAL(10, 7),
  exact_lng DECIMAL(10, 7),
  exact_location GEOGRAPHY(POINT, 4326),
  address TEXT,
  
  -- Contacto (solo rescatistas/admin)
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_method contact_method,
  
  -- Metadata
  consent_given BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  flagged BOOLEAN DEFAULT FALSE,
  flag_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_cases_public_location ON cases USING GIST(public_location);
CREATE INDEX idx_cases_exact_location ON cases USING GIST(exact_location);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_urgency ON cases(urgency);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);

-- ============================================
-- TABLA: case_photos
-- ============================================
CREATE TABLE case_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  flagged BOOLEAN DEFAULT FALSE,
  is_sensitive BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_photos_case_id ON case_photos(case_id);

-- ============================================
-- TABLA: case_updates
-- ============================================
CREATE TABLE case_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  old_status case_status,
  new_status case_status,
  note TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_updates_case_id ON case_updates(case_id);
CREATE INDEX idx_case_updates_created_at ON case_updates(created_at DESC);

-- ============================================
-- TABLA: case_claims
-- ============================================
CREATE TABLE case_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  rescuer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT
);

CREATE INDEX idx_case_claims_case_id ON case_claims(case_id);
CREATE INDEX idx_case_claims_rescuer_id ON case_claims(rescuer_id);
CREATE INDEX idx_case_claims_active ON case_claims(active);

-- ============================================
-- TABLA: comments
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_case_id ON comments(case_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- ============================================
-- TABLA: flags
-- ============================================
CREATE TABLE flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES case_photos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (
    (case_id IS NOT NULL AND comment_id IS NULL AND photo_id IS NULL) OR
    (case_id IS NULL AND comment_id IS NOT NULL AND photo_id IS NULL) OR
    (case_id IS NULL AND comment_id IS NULL AND photo_id IS NOT NULL)
  )
);

CREATE INDEX idx_flags_case_id ON flags(case_id);
CREATE INDEX idx_flags_resolved ON flags(resolved);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar ubicación aproximada
CREATE OR REPLACE FUNCTION approximate_location(lat DECIMAL, lng DECIMAL, radius_meters INTEGER DEFAULT 300)
RETURNS GEOGRAPHY AS $$
DECLARE
  random_angle DECIMAL;
  random_distance DECIMAL;
  approx_lat DECIMAL;
  approx_lng DECIMAL;
BEGIN
  random_angle := random() * 2 * PI();
  random_distance := random() * radius_meters;
  
  approx_lat := lat + (random_distance * COS(random_angle)) / 111320;
  approx_lng := lng + (random_distance * SIN(random_angle)) / (111320 * COS(RADIANS(lat)));
  
  RETURN ST_SetSRID(ST_MakePoint(approx_lng, approx_lat), 4326)::GEOGRAPHY;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar ubicación pública
CREATE OR REPLACE FUNCTION set_public_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.exact_lat IS NOT NULL AND NEW.exact_lng IS NOT NULL THEN
    NEW.exact_location := ST_SetSRID(ST_MakePoint(NEW.exact_lng, NEW.exact_lat), 4326)::GEOGRAPHY;
    NEW.public_location := approximate_location(NEW.exact_lat, NEW.exact_lng, 400);
    NEW.public_lat := ST_Y(NEW.public_location::GEOMETRY);
    NEW.public_lng := ST_X(NEW.public_location::GEOMETRY);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_public_location BEFORE INSERT OR UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION set_public_location();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- Funciones helper para RLS
CREATE OR REPLACE FUNCTION is_rescuer_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('rescuer', 'admin')
    AND verified = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas: profiles
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas: cases
CREATE POLICY "Public can view non-spam cases" ON cases FOR SELECT
  USING (status NOT IN ('spam', 'closed') OR created_by = auth.uid() OR is_rescuer_or_admin());

CREATE POLICY "Anyone can create cases" ON cases FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Rescuers can update cases" ON cases FOR UPDATE
  USING (is_rescuer_or_admin() OR created_by = auth.uid());

CREATE POLICY "Admins can delete cases" ON cases FOR DELETE USING (is_admin());

-- Políticas: case_photos
CREATE POLICY "Public can view non-flagged photos" ON case_photos FOR SELECT
  USING (flagged = FALSE OR is_rescuer_or_admin());

CREATE POLICY "Case creators can upload photos" ON case_photos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM cases WHERE id = case_id));

CREATE POLICY "Rescuers can update photos" ON case_photos FOR UPDATE
  USING (is_rescuer_or_admin());

-- Políticas: case_updates
CREATE POLICY "Public can view public updates" ON case_updates FOR SELECT
  USING (is_public = TRUE OR is_rescuer_or_admin());

CREATE POLICY "Rescuers can create updates" ON case_updates FOR INSERT
  WITH CHECK (is_rescuer_or_admin());

-- Políticas: case_claims
CREATE POLICY "Public can view claims" ON case_claims FOR SELECT USING (TRUE);

CREATE POLICY "Rescuers can claim cases" ON case_claims FOR INSERT
  WITH CHECK (is_rescuer_or_admin() AND rescuer_id = auth.uid());

CREATE POLICY "Rescuers can update own claims" ON case_claims FOR UPDATE
  USING (rescuer_id = auth.uid() OR is_admin());

-- Políticas: comments
CREATE POLICY "Public can view non-flagged comments" ON comments FOR SELECT
  USING (flagged = FALSE OR is_rescuer_or_admin());

CREATE POLICY "Registered users can comment" ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own comments" ON comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON comments FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- Políticas: flags
CREATE POLICY "Rescuers can view flags" ON flags FOR SELECT
  USING (is_rescuer_or_admin());

CREATE POLICY "Registered users can create flags" ON flags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update flags" ON flags FOR UPDATE
  USING (is_admin());
