-- Migration: Add database validations for data integrity
-- Story 1.5: Validação de Integridade no Database
-- Date: 2026-01-26

-- ============================================
-- 1. Validação de content JSONB (DB-01)
-- ============================================
-- Aceita: NULL, {} vazio, ou objeto válido
ALTER TABLE bible_studies
ADD CONSTRAINT check_content_structure CHECK (
  content IS NULL OR
  content = '{}'::jsonb OR
  (jsonb_typeof(content) = 'object')
);

-- ============================================
-- 2. CASCADE Delete para backlog (DB-03)
-- ============================================
-- Remove constraint existente
ALTER TABLE bible_backlog
DROP CONSTRAINT IF EXISTS bible_backlog_source_study_id_fkey;

-- Adiciona com CASCADE
ALTER TABLE bible_backlog
ADD CONSTRAINT bible_backlog_source_study_id_fkey
  FOREIGN KEY (source_study_id)
  REFERENCES bible_studies(id)
  ON DELETE CASCADE;

-- ============================================
-- 3. Comentários para documentação
-- ============================================
COMMENT ON CONSTRAINT check_content_structure ON bible_studies IS
  'Garante que content é NULL, objeto vazio {} ou objeto JSONB válido';

COMMENT ON CONSTRAINT bible_backlog_source_study_id_fkey ON bible_backlog IS
  'FK com CASCADE delete - ao deletar estudo, backlog items são removidos';
