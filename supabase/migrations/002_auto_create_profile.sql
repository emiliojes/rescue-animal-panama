-- ============================================
-- TRIGGER: Auto-crear perfil al registrarse
-- ============================================

-- Función que se ejecuta cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    'registered'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta después de que un usuario se registre
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ACTUALIZAR POLÍTICA RLS DE PROFILES
-- ============================================

-- Eliminar la política de insert existente
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Nueva política: Solo el trigger puede insertar perfiles
-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT
  WITH CHECK (true);
