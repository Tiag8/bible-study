-- Migration: Add Soft Delete support
-- Story 2.2: Implementar Soft Delete
-- Date: 2026-01-27

-- ============================================
-- 1. Adicionar coluna deleted_at em bible_studies
-- ============================================
ALTER TABLE bible_studies
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================
-- 2. Adicionar coluna deleted_at em bible_tags
-- ============================================
ALTER TABLE bible_tags
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================
-- 3. Criar índice para filtrar registros ativos
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bible_studies_not_deleted
ON bible_studies(user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bible_tags_not_deleted
ON bible_tags(user_id) WHERE deleted_at IS NULL;

-- ============================================
-- 4. Atualizar RLS Policies para filtrar soft-deleted
-- ============================================
-- Nota: Estas políticas devem ser aplicadas manualmente ou via Supabase Dashboard
-- já que o RLS é gerenciado pelo Supabase UI

-- ============================================
-- 5. RPC para soft delete um study
-- ============================================
CREATE OR REPLACE FUNCTION bible_soft_delete_study(
  p_study_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bible_studies
  SET deleted_at = NOW()
  WHERE id = p_study_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ============================================
-- 6. RPC para restore um study
-- ============================================
CREATE OR REPLACE FUNCTION bible_restore_study(
  p_study_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bible_studies
  SET deleted_at = NULL
  WHERE id = p_study_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ============================================
-- 7. RPC para listar studies deletados (para restore UI)
-- ============================================
CREATE OR REPLACE FUNCTION bible_get_deleted_studies(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  book_id TEXT,
  chapter_number INTEGER,
  deleted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.book_id,
    s.chapter_number,
    s.deleted_at
  FROM bible_studies s
  WHERE s.user_id = p_user_id AND s.deleted_at IS NOT NULL
  ORDER BY s.deleted_at DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ============================================
-- 8. Grant permissões para RPCs
-- ============================================
GRANT EXECUTE ON FUNCTION bible_soft_delete_study(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION bible_restore_study(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION bible_get_deleted_studies(UUID) TO authenticated;

-- ============================================
-- 9. Comentários de documentação
-- ============================================
COMMENT ON COLUMN bible_studies.deleted_at IS
  'Timestamp de soft delete - NULL significa estudo ativo';

COMMENT ON COLUMN bible_tags.deleted_at IS
  'Timestamp de soft delete - NULL significa tag ativa';

COMMENT ON FUNCTION bible_soft_delete_study(UUID, UUID) IS
  'RPC para fazer soft delete de um study (define deleted_at = NOW())';

COMMENT ON FUNCTION bible_restore_study(UUID, UUID) IS
  'RPC para restaurar um study deletado (define deleted_at = NULL)';

COMMENT ON FUNCTION bible_get_deleted_studies(UUID) IS
  'RPC para listar studies deletados do usuário (útil para UI de restore)';
