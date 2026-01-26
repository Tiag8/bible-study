-- Migration: Atualizar status de estudos para 3 estados (estudando, revisando, concluído)
-- Created: 2025-01-25
-- Fixed: Ordem correta (DROP → UPDATE → ADD)

-- 1. Remover constraint antiga
ALTER TABLE bible_studies
DROP CONSTRAINT IF EXISTS bible_studies_status_check;

-- 2. Migrar dados existentes PRIMEIRO (antes de adicionar nova constraint)
-- 'draft' → 'estudando' (default)
-- 'completed' → 'concluído'
UPDATE bible_studies
SET status = CASE
  WHEN status = 'draft' THEN 'estudando'
  WHEN status = 'completed' THEN 'concluído'
  ELSE 'estudando'  -- fallback para valores inesperados
END;

-- 3. Adicionar nova constraint (DEPOIS da migração de dados)
ALTER TABLE bible_studies
ADD CONSTRAINT bible_studies_status_check
CHECK (status IN ('estudando', 'revisando', 'concluído'));

-- 4. Atualizar default para novos estudos
ALTER TABLE bible_studies
ALTER COLUMN status SET DEFAULT 'estudando';

-- 5. Comentário para documentação
COMMENT ON COLUMN bible_studies.status IS 'Status do estudo: estudando (azul), revisando (roxo), concluído (verde)';
