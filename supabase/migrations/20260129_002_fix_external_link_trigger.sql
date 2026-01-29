-- Migration: Fix trigger para permitir links externos
-- Story: 4.3.2 - Links Externos
-- Date: 2026-01-29
-- Purpose: Trigger bible_validate_link_ownership rejeita links externos porque target_study_id é NULL

-- ============================================================================
-- FASE 1: Atualizar função de validação
-- ============================================================================

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

  -- Validação 1: Estudo de origem deve existir
  IF source_user_id IS NULL THEN
    RAISE EXCEPTION 'Estudo de origem (%) não existe', NEW.source_study_id;
  END IF;

  -- Para links EXTERNOS, não validar target_study_id (é NULL)
  IF NEW.link_type = 'external' THEN
    -- Validação para externos: external_url deve existir
    IF NEW.external_url IS NULL OR NEW.external_url = '' THEN
      RAISE EXCEPTION 'Link externo requer external_url preenchido';
    END IF;
    -- Pular validações de target
    RETURN NEW;
  END IF;

  -- Para links INTERNOS, validar target_study_id
  SELECT user_id INTO target_user_id
  FROM bible_studies
  WHERE id = NEW.target_study_id;

  -- Validação 2: Estudo de destino deve existir (apenas para internos)
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Estudo de destino (%) não existe', NEW.target_study_id;
  END IF;

  -- Validação 3: Ambos estudos devem pertencer ao mesmo usuário
  IF source_user_id != target_user_id THEN
    RAISE EXCEPTION
      'Não é permitido criar link entre estudos de usuários diferentes. Source: %, Target: %',
      source_user_id, target_user_id;
  END IF;

  -- Validação 4: Não permitir auto-link (um estudo linkado consigo mesmo)
  IF NEW.source_study_id = NEW.target_study_id THEN
    RAISE EXCEPTION 'Um estudo não pode ser linkado consigo mesmo';
  END IF;

  -- Se todas as validações passarem, prosseguir com INSERT/UPDATE
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

-- Esta migration corrige o trigger que bloqueava links externos.
--
-- Problema: Trigger validava target_study_id mesmo para link_type='external'
-- onde target_study_id é intencionalmente NULL.
--
-- Solução: Adicionar early return quando link_type='external', pulando
-- validações de target_study_id e adicionando validação de external_url.
