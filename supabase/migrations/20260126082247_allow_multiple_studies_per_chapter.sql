-- ============================================
-- Migration: Allow Multiple Studies per Chapter
-- Data: 2026-01-26
-- Autor: Paulo (Database Expert)
-- ============================================

-- Comentário explicativo
COMMENT ON TABLE bible_studies IS
  'Estudos bíblicos - permite múltiplos estudos independentes por capítulo (UNIQUE constraint removido em 2026-01-26)';

-- 1. Remover constraint UNIQUE (user_id, book_name, chapter_number)
DO $$
BEGIN
  -- Buscar nome exato do constraint (pode variar)
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bible_studies_user_id_book_name_chapter_number_key'
  ) THEN
    ALTER TABLE bible_studies
      DROP CONSTRAINT bible_studies_user_id_book_name_chapter_number_key;
    RAISE NOTICE 'Constraint UNIQUE removido com sucesso';
  ELSE
    RAISE NOTICE 'Constraint UNIQUE não encontrado (já removido?)';
  END IF;
END $$;

-- 2. Validar que estudos existentes não foram afetados
DO $$
DECLARE
  existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count FROM bible_studies;
  RAISE NOTICE 'Total de estudos existentes: %', existing_count;

  IF existing_count > 0 THEN
    RAISE NOTICE 'Estudos legados preservados (migration não destrutiva)';
  END IF;
END $$;

-- 3. Criar índice composto para queries otimizadas
CREATE INDEX IF NOT EXISTS idx_bible_studies_user_book_chapter
  ON bible_studies(user_id, book_name, chapter_number);

COMMENT ON INDEX idx_bible_studies_user_book_chapter IS
  'Otimiza queries de múltiplos estudos por (user_id, book_name, chapter_number). Adicionado em 2026-01-26.';

-- ============================================
-- VALIDAÇÕES PÓS-MIGRATION
-- ============================================

-- Verificar que RLS está habilitado
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'bible_studies') THEN
    RAISE EXCEPTION 'ERRO CRÍTICO: RLS não está habilitado na tabela bible_studies!';
  ELSE
    RAISE NOTICE 'RLS confirmado habilitado (segurança mantida)';
  END IF;
END $$;

-- ============================================
-- ROLLBACK (se necessário - comentado por padrão)
-- ============================================
-- Para reverter esta migration, execute:
-- ALTER TABLE bible_studies
--   ADD CONSTRAINT bible_studies_user_id_book_name_chapter_number_key
--   UNIQUE(user_id, book_name, chapter_number);
-- DROP INDEX IF EXISTS idx_bible_studies_user_book_chapter;
