-- Migration: Add Link Validation Trigger
-- Story 2.4: Adicionar Trigger de Validação em Links
-- Date: 2026-01-27

-- ============================================
-- 1. Criar função de validação de ownership
-- ============================================
-- Valida que source_study_id e target_study_id
-- pertencem ao mesmo user_id

CREATE OR REPLACE FUNCTION bible_validate_link_ownership()
RETURNS TRIGGER AS $$
DECLARE
  source_user_id UUID;
  target_user_id UUID;
BEGIN
  -- Obter user_id do estudo de origem
  SELECT user_id INTO source_user_id
  FROM bible_studies
  WHERE id = NEW.source_study_id;

  -- Obter user_id do estudo de destino
  SELECT user_id INTO target_user_id
  FROM bible_studies
  WHERE id = NEW.target_study_id;

  -- Validação 1: Ambos estudos devem existir
  IF source_user_id IS NULL THEN
    RAISE EXCEPTION 'Estudo de origem (%) não existe', NEW.source_study_id;
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Estudo de destino (%) não existe', NEW.target_study_id;
  END IF;

  -- Validação 2: Ambos estudos devem pertencer ao mesmo usuário
  IF source_user_id != target_user_id THEN
    RAISE EXCEPTION
      'Não é permitido criar link entre estudos de usuários diferentes. Source: %, Target: %',
      source_user_id, target_user_id;
  END IF;

  -- Validação 3: Não permitir auto-link (um estudo linkado consigo mesmo)
  IF NEW.source_study_id = NEW.target_study_id THEN
    RAISE EXCEPTION 'Um estudo não pode ser linkado consigo mesmo';
  END IF;

  -- Se todas as validações passarem, prosseguir com INSERT/UPDATE
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ============================================
-- 2. Criar índice para validação rápida
-- ============================================
-- Índice compound para queries de validação
CREATE INDEX IF NOT EXISTS idx_bible_studies_id_user_id
ON bible_studies(id, user_id);

-- ============================================
-- 3. Trigger BEFORE INSERT
-- ============================================
-- Executa antes de cada INSERT em bible_study_links
DROP TRIGGER IF EXISTS before_insert_bible_study_links ON bible_study_links;

CREATE TRIGGER before_insert_bible_study_links
BEFORE INSERT ON bible_study_links
FOR EACH ROW
EXECUTE FUNCTION bible_validate_link_ownership();

-- ============================================
-- 4. Trigger BEFORE UPDATE
-- ============================================
-- Executa antes de cada UPDATE em bible_study_links
DROP TRIGGER IF EXISTS before_update_bible_study_links ON bible_study_links;

CREATE TRIGGER before_update_bible_study_links
BEFORE UPDATE ON bible_study_links
FOR EACH ROW
WHEN (
  OLD.source_study_id IS DISTINCT FROM NEW.source_study_id
  OR OLD.target_study_id IS DISTINCT FROM NEW.target_study_id
)
EXECUTE FUNCTION bible_validate_link_ownership();

-- ============================================
-- 5. Grant permissões
-- ============================================
GRANT EXECUTE ON FUNCTION bible_validate_link_ownership() TO authenticated;

-- ============================================
-- 6. Documentação
-- ============================================
COMMENT ON FUNCTION bible_validate_link_ownership() IS
  'Valida integridade de links entre estudos. Garante que source_study_id e target_study_id pertencem ao mesmo user_id. Previne links entre estudos de usuários diferentes.';

COMMENT ON TRIGGER before_insert_bible_study_links ON bible_study_links IS
  'Trigger BEFORE INSERT que executa bible_validate_link_ownership() para validar novo link';

COMMENT ON TRIGGER before_update_bible_study_links ON bible_study_links IS
  'Trigger BEFORE UPDATE que executa bible_validate_link_ownership() se source ou target mudarem';
