-- Migration: Backfill display_order para referências existentes
-- Story: 4.3.4 - Persistência de Ordem de Referências
-- Date: 2026-01-29
-- Purpose: Ordenar referências existentes por created_at dentro de cada source_study_id

-- ============================================================================
-- FASE 1: Backfill display_order com valores sequenciais
-- ============================================================================

-- Atualiza display_order para ser sequencial (0, 1, 2, ...) dentro de cada source_study_id
-- Usa created_at como critério de ordenação para refs existentes
WITH ordered_refs AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY source_study_id ORDER BY created_at
  ) - 1 AS new_order
  FROM bible_study_links
  WHERE display_order = 0 OR display_order IS NULL
)
UPDATE bible_study_links
SET display_order = ordered_refs.new_order
FROM ordered_refs
WHERE bible_study_links.id = ordered_refs.id;

-- ============================================================================
-- FASE 2: Validação pós-backfill
-- ============================================================================

DO $$
DECLARE
  gap_count INTEGER;
BEGIN
  -- Verificar se há gaps em display_order
  SELECT COUNT(*)
  INTO gap_count
  FROM (
    SELECT source_study_id, display_order,
           LAG(display_order) OVER (PARTITION BY source_study_id ORDER BY display_order) as prev_order
    FROM bible_study_links
  ) sub
  WHERE prev_order IS NOT NULL AND display_order - prev_order > 1;

  IF gap_count > 0 THEN
    RAISE WARNING '⚠️ Migration 20260129_001: Encontrados % gaps em display_order', gap_count;
  ELSE
    RAISE NOTICE '✅ Migration 20260129_001: Backfill concluído sem gaps';
  END IF;
END $$;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

-- Este backfill é idempotente:
-- - Só atualiza linhas com display_order = 0 ou NULL
-- - Mantém ordem relativa baseada em created_at
-- - Garante sequência contígua (0, 1, 2, ...) por source_study_id
--
-- Performance:
-- - Usa window function (ROW_NUMBER) que é O(n log n)
-- - CTE materializa resultado antes do UPDATE
-- - Índice em (source_study_id, display_order) já existe (4.3.1)
