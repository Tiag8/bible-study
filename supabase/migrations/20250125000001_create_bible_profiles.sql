-- ============================================
-- Bible Study - Profiles Migration
-- Prefixo obrigatório: bible_
-- ============================================

-- ============================================
-- TABELA: bible_profiles
-- Perfis de usuários do Bible Study
-- ============================================
CREATE TABLE IF NOT EXISTS bible_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_bible_profiles_role ON bible_profiles(role);

-- ============================================
-- TRIGGER FUNCTION: handle_new_user
-- Cria automaticamente um profile quando um novo usuário é criado
-- ============================================
CREATE OR REPLACE FUNCTION bible_handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
BEGIN
  -- Extrai full_name do metadata ou usa email como fallback
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Cria o profile
  INSERT INTO bible_profiles (id, full_name, role)
  VALUES (NEW.id, user_full_name, 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Criar profile automaticamente para novos usuários
-- ============================================
CREATE TRIGGER bible_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION bible_handle_new_user();

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================
CREATE TRIGGER bible_profiles_update_timestamp
  BEFORE UPDATE ON bible_profiles
  FOR EACH ROW
  EXECUTE FUNCTION bible_update_timestamp();

-- ============================================
-- RLS POLICIES
-- Row Level Security para isolamento por usuário
-- ============================================

-- Habilitar RLS
ALTER TABLE bible_profiles ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: usuários podem ler apenas seu próprio profile
CREATE POLICY "Users can view own profile" ON bible_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy UPDATE: usuários podem atualizar apenas seu próprio profile (exceto role)
CREATE POLICY "Users can update own profile" ON bible_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Previne que usuários alterem seu próprio role
    role = (SELECT role FROM bible_profiles WHERE id = auth.uid())
  );

-- Policy UPDATE para admins: admins podem alterar roles de outros usuários
CREATE POLICY "Admins can update any profile" ON bible_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM bible_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sem INSERT policy (criação é feita apenas via trigger)
-- Sem DELETE policy (deleção é feita via CASCADE de auth.users)

-- ============================================
-- Comentários para documentação
-- ============================================
COMMENT ON TABLE bible_profiles IS 'Perfis de usuários do Bible Study com metadata e role';
COMMENT ON FUNCTION bible_handle_new_user() IS 'Trigger function que cria automaticamente um profile quando um novo usuário é criado via Supabase Auth';
COMMENT ON COLUMN bible_profiles.role IS 'Role do usuário: free (padrão) ou admin';
COMMENT ON COLUMN bible_profiles.full_name IS 'Nome completo do usuário, extraído do metadata do auth ou email';
