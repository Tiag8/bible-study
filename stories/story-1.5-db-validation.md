# Story 1.5: Validação de Integridade no Database

**Story ID:** STORY-1.5
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 1
**Pontos:** 3
**Status:** 📋 READY FOR DEVELOPMENT

---

## 📋 User Story

**Como** desenvolvedor/admin do Bible Study,
**Quero** garantir que dados inválidos não entrem no banco,
**Para que** o app não quebre por dados corrompidos.

---

## 🎯 Objetivo

Resolver os 3 débitos críticos de database identificados no assessment:
1. Validação de JSONB content (DB-01)
2. Orphaned records em backlog - CASCADE delete (DB-03)
3. Status enum consistente (DB-04)

---

## ✅ Critérios de Aceite

### Validação JSONB (DB-01)
- [ ] Criar migration com CHECK constraint para `content`
- [ ] Constraint aceita `{}` vazio ou objeto com `type`
- [ ] Dados inválidos são rejeitados pelo banco

### CASCADE Delete (DB-03)
- [ ] Alterar FK de `bible_backlog.source_study_id` para `ON DELETE CASCADE`
- [ ] Ao deletar estudo, backlog items relacionados são deletados

### Enum TypeScript (DB-04)
- [ ] Verificar se tipos em `src/types/database.ts` estão corretos
- [ ] Regenerar tipos se necessário: `supabase gen types typescript`
- [ ] Garantir que 'estudando', 'revisando', 'concluído' são os únicos valores

---

## 📝 Tasks

- [ ] **1.5.1** Criar migration `005_add_db_validations.sql`
- [ ] **1.5.2** Adicionar CHECK constraint para content JSONB
- [ ] **1.5.3** Alterar FK backlog para CASCADE
- [ ] **1.5.4** Verificar e regenerar tipos TypeScript
- [ ] **1.5.5** Aplicar migration localmente e testar
- [ ] **1.5.6** Aplicar em produção (se houver)

---

## 🔧 Implementação

```sql
-- supabase/migrations/005_add_db_validations.sql

-- 1. Validação de content JSONB
ALTER TABLE bible_studies
ADD CONSTRAINT check_content_structure CHECK (
  content IS NULL OR
  content = '{}'::jsonb OR
  (jsonb_typeof(content) = 'object')
);

-- 2. Alterar FK de backlog para CASCADE
ALTER TABLE bible_backlog
DROP CONSTRAINT IF EXISTS bible_backlog_source_study_id_fkey;

ALTER TABLE bible_backlog
ADD CONSTRAINT bible_backlog_source_study_id_fkey
  FOREIGN KEY (source_study_id)
  REFERENCES bible_studies(id)
  ON DELETE CASCADE;

-- 3. Verificar enum de status (já deve estar correto)
-- SELECT DISTINCT status FROM bible_studies;
-- Deve retornar apenas: 'estudando', 'revisando', 'concluído'
```

### Verificar TypeScript
```bash
# Regenerar tipos do Supabase
npx supabase gen types typescript --local > src/types/database.ts

# Verificar status type
grep -A5 "status:" src/types/database.ts
# Deve mostrar: 'estudando' | 'revisando' | 'concluído'
```

---

## 📊 Débitos Resolvidos

| ID | Débito | Severidade |
|----|--------|-----------|
| DB-01 | Validação JSONB content ausente | 🔴 CRÍTICO |
| DB-03 | Orphaned records em backlog | 🔴 CRÍTICO |
| DB-04 | Status enum inconsistente | 🔴 CRÍTICO |

---

## 🧪 Testes

### Validação JSONB
```sql
-- Deve FALHAR:
INSERT INTO bible_studies (user_id, title, book_name, chapter_number, content)
VALUES ('...', 'Test', 'Gênesis', 1, '"invalid"');

-- Deve PASSAR:
INSERT INTO bible_studies (user_id, title, book_name, chapter_number, content)
VALUES ('...', 'Test', 'Gênesis', 1, '{"type": "doc"}');
```

### CASCADE Delete
```sql
-- Criar estudo e backlog
INSERT INTO bible_studies (...) VALUES (...) RETURNING id;
INSERT INTO bible_backlog (user_id, reference_label, source_study_id) VALUES (...);

-- Deletar estudo
DELETE FROM bible_studies WHERE id = '...';

-- Verificar backlog deletado
SELECT * FROM bible_backlog WHERE source_study_id = '...';
-- Deve retornar 0 rows
```

---

## ⚠️ Riscos

| Risco | Mitigação |
|-------|-----------|
| Dados existentes inválidos | Rodar query de verificação antes de aplicar constraint |
| Backlog items perdidos | Fazer backup antes de alterar FK |
| Downtime durante migration | Aplicar em horário de baixo uso |

### Query de Verificação
```sql
-- Verificar se há content inválido
SELECT id, title, jsonb_typeof(content)
FROM bible_studies
WHERE content IS NOT NULL
  AND content != '{}'::jsonb
  AND jsonb_typeof(content) != 'object';
-- Deve retornar 0 rows
```

---

## ✅ Definition of Done

- [ ] Migration criada e testada localmente
- [ ] CHECK constraint funcionando
- [ ] FK CASCADE funcionando
- [ ] Tipos TypeScript atualizados
- [ ] Nenhum dado existente é invalidado
- [ ] PR aprovado e merged

---

**Estimativa:** 2 horas
**Assignee:** Pendente
**Data:** 2026-01-26
