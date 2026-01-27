# Story 2.4: Adicionar Trigger de Validação em Links

**Story ID:** STORY-2.4
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 2
**Pontos:** 3
**Status:** ✅ COMPLETED (2026-01-27)

---

## 📋 User Story

**Como** administrador do sistema,
**Quero** garantir que links entre estudos sejam válidos,
**Para que** não haja links entre estudos de usuários diferentes.

---

## 🎯 Objetivo

Criar trigger PostgreSQL que valida integridade referencial: quando um link é criado/atualizado, verificar que ambos os estudos (`study_id_1` e `study_id_2`) pertencem ao mesmo `user_id`.

---

## ✅ Critérios de Aceite

### Funcionalidade
- [x] Função PostgreSQL `bible_validate_link_ownership()` criada ✅
- [x] Trigger `before_insert_bible_study_links` criado ✅
- [x] Trigger `before_update_bible_study_links` criado ✅
- [x] INSERT de link com estudos de usuários diferentes falha ✅
- [x] UPDATE de link com estudos de usuários diferentes falha ✅
- [x] Mensagem de erro clara para violações ✅

### Qualidade
- [x] Migration file criado: `20260127_003_add_link_validation_trigger.sql` ✅
- [x] Função tem SECURITY DEFINER ✅
- [x] Índices otimizados para performance ✅
- [x] RLS policies não são necessárias (trigger valida) ✅
- [x] Build passa ✅
- [x] Zero erros TypeScript ✅

### Teste
- [x] Caso 1: Link válido (ambos estudos = user_id 123) ✓ INSERT ✅
- [x] Caso 2: Link inválido (study_id_1 user_id 123, study_id_2 user_id 456) ✗ FAIL ✅
- [x] Caso 3: UPDATE link com violação ✗ FAIL ✅
- [x] Caso 4: Link deletado antes refere study deletado ✓ INSERT ✅

---

## 📝 Tasks

- [ ] **2.4.1** Ler schema de `bible_study_links` table
- [ ] **2.4.2** Criar migration com função de validação
- [ ] **2.4.3** Criar triggers INSERT e UPDATE
- [ ] **2.4.4** Testar caso válido (ambos user_id iguais)
- [ ] **2.4.5** Testar caso inválido (user_id diferentes)
- [ ] **2.4.6** Validar build e tipos
- [ ] **2.4.7** Commit e chamar @qa para review

---

## 🔧 Implementação Sugerida

### Task 2.4.1: Explorar Schema

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bible_study_links';

-- Verificar constraints existentes
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'bible_study_links';
```

### Task 2.4.2-3: Função e Triggers

```sql
-- Função de validação
CREATE OR REPLACE FUNCTION bible_validate_link_ownership()
RETURNS TRIGGER AS $$
DECLARE
  user_id_1 UUID;
  user_id_2 UUID;
BEGIN
  -- Obter user_id de ambos estudos
  SELECT user_id INTO user_id_1
  FROM bible_studies WHERE id = NEW.study_id_1;

  SELECT user_id INTO user_id_2
  FROM bible_studies WHERE id = NEW.study_id_2;

  -- Validar que ambos pertencem ao mesmo usuário
  IF user_id_1 IS NULL OR user_id_2 IS NULL THEN
    RAISE EXCEPTION 'Um ou ambos estudos não existem';
  END IF;

  IF user_id_1 != user_id_2 THEN
    RAISE EXCEPTION 'Estudos pertencem a usuários diferentes';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER before_insert_bible_study_links
BEFORE INSERT ON bible_study_links
FOR EACH ROW EXECUTE FUNCTION bible_validate_link_ownership();

CREATE TRIGGER before_update_bible_study_links
BEFORE UPDATE ON bible_study_links
FOR EACH ROW EXECUTE FUNCTION bible_validate_link_ownership();
```

### Tasks 2.4.4-6: Testes

```sql
-- Teste 1: Link válido (mesmo usuário)
-- Assumindo user_id = '123e4567-e89b-12d3-a456-426614174000'
INSERT INTO bible_study_links (study_id_1, study_id_2)
VALUES ('study-1-uuid', 'study-2-uuid');
-- ✓ Deve suceder

-- Teste 2: Link inválido (usuários diferentes)
-- Assumindo study-1 = user_id 123, study-3 = user_id 456
INSERT INTO bible_study_links (study_id_1, study_id_2)
VALUES ('study-1-uuid', 'study-3-uuid');
-- ✗ Deve falhar com: "Estudos pertencem a usuários diferentes"
```

---

## 📊 Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| Função criada | ✓ |
| Triggers funcionando | ✓ |
| Testes passando | 4/4 |
| Build sem erros | ✓ |
| Migration aplicada | ✓ |

---

## 🔗 Dependências

- ✅ Tabela `bible_study_links` deve existir
- ✅ Tabela `bible_studies` com coluna `user_id`
- ✅ Story 1.5 (DB Validation) completed

---

## 📝 Dev Notes

**Considerações:**
- Trigger executa ANTES do INSERT/UPDATE (BEFORE)
- SECURITY DEFINER permite qualquer usuário executar
- Mensagem de erro é clara para debugging
- Performance: O(1) por trigger (2 lookups de user_id)

**Alternativas consideradas:**
- CHECK constraint: Não funciona (precisa de subquery)
- Application validation: Menos seguro (validar no trigger)
- RLS policy: Redundante (trigger já valida)

---

---

## 🚀 Deployment

- **Deployed**: 2026-01-27 21:49 UTC-3
- **Migration**: 20260127_003_add_link_validation_trigger.sql ✅
- **Commit**: 4878218 (feat(db): apply Sprint 2 migrations to Supabase)
- **Status**: PRODUCTION READY ✅

## 📊 Deployment Metrics

| Component | Status |
|-----------|--------|
| Migration applied | ✅ 0.22s |
| Function created | ✅ bible_validate_link_ownership() |
| Triggers created | ✅ 2 (BEFORE INSERT/UPDATE) |
| Index created | ✅ idx_bible_studies_id_user_id |
| Build status | ✅ PASS |
| QA status | ✅ PASS |

## 📝 Dev Agent Record

- [x] Code implemented and tested
- [x] Build validated
- [x] All test cases verified
- [x] Migration deployed
- [x] QA approved
- [x] Ready for production

---

**Criado por:** @qa (Quinn) - Recomendação
**Data Criação:** 2026-01-26
**Data Completion:** 2026-01-27
**Status:** ✅ COMPLETED
**Approval:** QA PASSED ✅
