-- Migration: Add Full-Text Search support
-- Story 2.1: Implementar Full-Text Search
-- Date: 2026-01-27

-- ============================================
-- 1. Adicionar coluna tsvector para FTS (DB-05)
-- ============================================
ALTER TABLE bible_studies
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ============================================
-- 2. Criar índice GIN para busca rápida
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bible_studies_search
ON bible_studies USING GIN(search_vector);

-- ============================================
-- 3. Função para gerar search_vector
-- ============================================
CREATE OR REPLACE FUNCTION bible_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('portuguese', COALESCE(NEW.title, '')) ||
    to_tsvector('portuguese', COALESCE(NEW.book_id, '')) ||
    to_tsvector('portuguese', COALESCE(NEW.content::text, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Trigger para atualizar search_vector automaticamente
-- ============================================
DROP TRIGGER IF EXISTS bible_trigger_update_search_vector ON bible_studies;
CREATE TRIGGER bible_trigger_update_search_vector
BEFORE INSERT OR UPDATE ON bible_studies
FOR EACH ROW
EXECUTE FUNCTION bible_update_search_vector();

-- ============================================
-- 5. RPC para busca full-text com segurança de user_id
-- ============================================
CREATE OR REPLACE FUNCTION bible_search_studies(
  query_text TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  book_id TEXT,
  chapter_number INTEGER,
  status TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.book_id,
    s.chapter_number,
    s.status,
    ts_rank(s.search_vector, plainto_tsquery('portuguese', query_text))::REAL as similarity
  FROM bible_studies s
  WHERE
    (p_user_id IS NULL OR s.user_id = p_user_id)
    AND s.search_vector @@ plainto_tsquery('portuguese', query_text)
    AND s.deleted_at IS NULL
  ORDER BY similarity DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ============================================
-- 6. Grant permissões para RPC
-- ============================================
GRANT EXECUTE ON FUNCTION bible_search_studies(TEXT, UUID) TO authenticated;

-- ============================================
-- 7. Comentários de documentação
-- ============================================
COMMENT ON COLUMN bible_studies.search_vector IS
  'tsvector para Full-Text Search em título, livro e conteúdo';

COMMENT ON INDEX idx_bible_studies_search IS
  'Índice GIN para busca rápida de studies';

COMMENT ON FUNCTION bible_search_studies(TEXT, UUID) IS
  'RPC para buscar studies por texto completo - filtra por user_id para segurança';
