-- Migration: Adicionar novo status "estudar" (laranja) para estudos criados via backlog
-- Created: 2026-01-27
-- Purpose: Suporta estudos vazios criados do backlog com destaque visual

-- 1. Remover constraint antiga (estudando, revisando, concluído)
ALTER TABLE bible_studies
DROP CONSTRAINT IF EXISTS bible_studies_status_check;

-- 2. Adicionar nova constraint com 'estudar'
-- Ordem de prioridade visual: estudar (laranja) > estudando (azul) > revisando (roxo) > concluído (verde)
ALTER TABLE bible_studies
ADD CONSTRAINT bible_studies_status_check
CHECK (status IN ('estudar', 'estudando', 'revisando', 'concluído'));

-- 3. Atualizar default para novos estudos criados via backlog
ALTER TABLE bible_studies
ALTER COLUMN status SET DEFAULT 'estudar';

-- 4. Documentação
COMMENT ON COLUMN bible_studies.status IS 'Status do estudo: estudar (laranja) → estudando (azul) → revisando (roxo) → concluído (verde)';
