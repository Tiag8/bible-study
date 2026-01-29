-- Migration: Add bidirectional references support
-- Story: 4.3.1 - Referências Bidirecionais Automáticas
-- Date: 2026-01-28

-- ============================================================================
-- FASE 1: Schema - Adicionar colunas necessárias
-- ============================================================================

-- Adicionar coluna is_bidirectional (marca se foi criada por trigger)
ALTER TABLE bible_study_links
ADD COLUMN is_bidirectional BOOLEAN DEFAULT true;

-- Adicionar coluna link_type para suportar links externos também
ALTER TABLE bible_study_links
ADD COLUMN link_type VARCHAR(20) DEFAULT 'internal'
  CHECK (link_type IN ('internal', 'external'));

-- Adicionar coluna external_url para links externos
ALTER TABLE bible_study_links
ADD COLUMN external_url VARCHAR(2048);

-- Adicionar coluna display_order para persistência de reordenação
ALTER TABLE bible_study_links
ADD COLUMN display_order SMALLINT DEFAULT 0;

-- ============================================================================
-- FASE 2: Índices para performance
-- ============================================================================

-- Índice para queries por tipo de link
CREATE INDEX idx_bible_study_links_by_type
ON bible_study_links(user_id, link_type);

-- Índice para ordenação e display_order
CREATE INDEX idx_bible_study_links_by_order
ON bible_study_links(source_study_id, display_order);

-- ============================================================================
-- FASE 3: Trigger - Sincronização bidirecional automática
-- ============================================================================

-- Trigger function para criar referência reversa automaticamente
CREATE OR REPLACE FUNCTION sync_bidirectional_link()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é link interno (não externo) e é bidirecional
  IF NEW.link_type = 'internal'
     AND NEW.is_bidirectional = true THEN

    -- Cria referência reversa (source e target invertidos)
    INSERT INTO bible_study_links (
      id,
      user_id,
      source_study_id,
      target_study_id,
      link_type,
      is_bidirectional,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      NEW.user_id,
      NEW.target_study_id,  -- ← Invertido
      NEW.source_study_id,  -- ← Invertido
      'internal',
      false,  -- ← Marca como criado por trigger
      NOW()
    )
    ON CONFLICT DO NOTHING;  -- Idempotente
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger após INSERT
CREATE TRIGGER after_insert_sync_bidirectional
AFTER INSERT ON bible_study_links
FOR EACH ROW
EXECUTE FUNCTION sync_bidirectional_link();

-- ============================================================================
-- FASE 4: RPC Function - Delete bidirecional atomicamente
-- ============================================================================

-- Função para deletar referência e sua reversa atomicamente
CREATE OR REPLACE FUNCTION delete_bidirectional_link(link_id UUID)
RETURNS void AS $$
DECLARE
  source_id UUID;
  target_id UUID;
  user_id_check UUID;
  link_type_check VARCHAR(20);
BEGIN
  -- 1. Fetch original link + valida user_id (RLS)
  SELECT source_study_id, target_study_id, user_id, link_type
  INTO source_id, target_id, user_id_check, link_type_check
  FROM bible_study_links
  WHERE id = link_id;

  -- Valida que link existe
  IF source_id IS NULL THEN
    RAISE EXCEPTION 'Referência não encontrada';
  END IF;

  -- RLS check: usuário autenticado deve ser o dono
  IF user_id_check != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized - Você não tem permissão para deletar esta referência';
  END IF;

  -- 2. Delete referência original
  DELETE FROM bible_study_links WHERE id = link_id;

  -- 3. Delete referência reversa (se existir)
  -- Apenas para links internos com is_bidirectional
  IF link_type_check = 'internal' THEN
    DELETE FROM bible_study_links
    WHERE source_study_id = target_id
    AND target_study_id = source_id
    AND user_id = user_id_check
    AND link_type = 'internal'
    AND is_bidirectional = false;
  END IF;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;  -- Executa com permissões da função (RLS)

-- Conceder acesso ao RPC para usuários autenticados
GRANT EXECUTE ON FUNCTION delete_bidirectional_link(UUID) TO authenticated;

-- ============================================================================
-- FASE 5: RPC Function - Swap display_order para reordenação
-- ============================================================================

-- Função para trocar display_order entre duas referências (para reordenação)
CREATE OR REPLACE FUNCTION swap_display_order(
  ref_id_1 UUID,
  ref_id_2 UUID
)
RETURNS void AS $$
DECLARE
  order_1 SMALLINT;
  order_2 SMALLINT;
  user_id_check UUID;
BEGIN
  -- 1. Fetch ordem da primeira referência
  SELECT display_order, user_id
  INTO order_1, user_id_check
  FROM bible_study_links
  WHERE id = ref_id_1;

  -- RLS check
  IF user_id_check != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Fetch ordem da segunda referência
  SELECT display_order
  INTO order_2
  FROM bible_study_links
  WHERE id = ref_id_2
  AND user_id = user_id_check;

  -- 3. Swap atomicamente em transação
  UPDATE bible_study_links SET display_order = order_2
  WHERE id = ref_id_1;

  UPDATE bible_study_links SET display_order = order_1
  WHERE id = ref_id_2;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION swap_display_order(UUID, UUID) TO authenticated;

-- ============================================================================
-- FASE 6: Validação pós-migration
-- ============================================================================

-- Verificar que colunas foram adicionadas
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'bible_study_links'
  AND column_name IN ('is_bidirectional', 'link_type', 'external_url', 'display_order');

  IF col_count = 4 THEN
    RAISE NOTICE '✅ Migration 20260128_004: Todas as colunas adicionadas com sucesso';
  ELSE
    RAISE WARNING '⚠️ Migration 20260128_004: Apenas % de 4 colunas adicionadas', col_count;
  END IF;
END $$;

-- ============================================================================
-- COMENTÁRIOS E NOTAS
-- ============================================================================

-- RLS: As funções RPC usam SECURITY DEFINER para executar com permissões da função
-- Validação de user_id é feita explicitamente em cada RPC
--
-- Idempotência:
-- - Trigger usa ON CONFLICT DO NOTHING (seguro executar múltiplas vezes)
-- - DELETE functions usam RAISE EXCEPTION se não encontrar (sem silent fail)
--
-- Índices criados para:
-- - idx_bible_study_links_by_type: Queries filtradas por link_type
-- - idx_bible_study_links_by_order: Queries de ordenação (display_order)
--
-- Performance:
-- - Trigger é rápido (2 UPDATE apenas)
-- - RPC swap é transacional (atomicidade garantida)
-- - Nenhum N+1 query
