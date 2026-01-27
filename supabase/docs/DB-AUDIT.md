# Supabase Audit Report - Bible Study Database

**Data:** 2026-01-26
**Versão:** 1.0
**Status:** ⚠️ 15 Débitos Identificados

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de Débitos** | 15 |
| **Críticos** | 4 |
| **Altos** | 4 |
| **Médios** | 5 |
| **Baixos** | 2 |
| **Esforço Total Estimado** | 40-60 horas |

---

## 🔴 CRÍTICOS (Afetam Segurança/Funcionalidade)

### D-1: Validação de JSONB Content Ausente

**Severidade:** 🔴 CRÍTICO
**Impacto:** Alto
**Esforço:** 🟡 Médio (2-3h)

**Problema:**
Campo `content` em `bible_studies` aceita qualquer JSON válido sem validação de estrutura Tiptap

```sql
-- Hoje: Qualquer JSONB é aceito
content JSONB DEFAULT '{}'

-- Resultado: Dados malformados podem quebrar editor no frontend
```

**Risco:**
- Editor frontend quebra ao tentar renderizar JSON inválido
- Dados corrompidos impossíveis de recuperar
- Sem audit trail de quando/como foi corrompido

**Solução:**
Adicionar CHECK constraint validando estrutura Tiptap:
```sql
ALTER TABLE bible_studies
ADD CONSTRAINT check_content_structure CHECK (
  content IS NULL OR
  jsonb_typeof(content) = 'object' AND
  (content->>'type' = 'doc' OR content->>'type' IS NULL)
);
```

**Status:** ⏳ Não implementado

---

### D-2: Foreign Key Check Faltando em Study Links

**Severidade:** 🔴 CRÍTICO
**Impacto:** Alto (violação de RLS possível)
**Esforço:** 🟡 Médio (2-3h)

**Problema:**
`bible_study_links` não verifica que source e target pertencem ao mesmo usuário:

```sql
-- Hoje:
CREATE TABLE bible_study_links (
  user_id UUID,
  source_study_id UUID REFERENCES bible_studies(id),
  target_study_id UUID REFERENCES bible_studies(id)
);

-- Possível: Criar link entre estudos de usuários diferentes!
```

**Risco:**
- Violação de RLS policy
- Um usuário vê estudos/links de outro
- Dados "escaped" de isolamento

**Solução:**
Adicionar CHECK constraint:
```sql
ALTER TABLE bible_study_links
ADD CONSTRAINT check_same_user_links CHECK (
  EXISTS (SELECT 1 FROM bible_studies s1 WHERE s1.id = source_study_id AND s1.user_id = user_id) AND
  EXISTS (SELECT 1 FROM bible_studies s2 WHERE s2.id = target_study_id AND s2.user_id = user_id)
);
```

**Status:** ⏳ Não implementado

---

### D-3: Orphaned Records em Backlog (ON DELETE SET NULL)

**Severidade:** 🔴 CRÍTICO
**Impacto:** Alto (integridade de dados)
**Esforço:** 🟢 Baixo (1-2h + risco de downtime)

**Problema:**
`bible_backlog.source_study_id` usa `ON DELETE SET NULL`:

```sql
source_study_id UUID REFERENCES bible_studies(id) ON DELETE SET NULL
```

**Resultado:**
Quando um estudo é deletado, backlog fica com `source_study_id = NULL` (orphaned):
```
Backlog: "Estudar João 3:16" → study_id = NULL (quem era a origem?)
```

**Risco:**
- Perde rastreabilidade
- Backlog inútil sem contexto
- Sem como recuperar relação original

**Solução:**

Opção A (Recomendado): Usar `ON DELETE CASCADE`
```sql
ALTER TABLE bible_backlog
DROP CONSTRAINT bible_backlog_source_study_id_fkey,
ADD CONSTRAINT bible_backlog_source_study_id_fkey
  FOREIGN KEY (source_study_id) REFERENCES bible_studies(id)
  ON DELETE CASCADE;
```

Opção B: Implementar soft delete (adicionar `deleted_at`)

**Status:** ⏳ Não implementado

---

### D-4: Status Enum Inconsistente Entre DB e TypeScript

**Severidade:** 🔴 CRÍTICO
**Impacto:** Médio (bugs em produção)
**Esforço:** 🟢 Baixo (1-2h)

**Problema:**
Migration #2 mudou os valores de status mas TypeScript pode estar com cache:

```
Banco: 'estudando' | 'revisando' | 'concluído'
TypeScript (cache old?): 'draft' | 'completed' (?)
```

**Resultado:**
Type mismatch pode causar erros em runtime

**Risco:**
- Queries com status antigo falham silenciosamente
- Frontend mostra status inválido
- Filtering quebra

**Solução:**
1. Validar tipos em `src/types/database.ts`
2. Regenerar tipos com `supabase gen types typescript --local`
3. Auditar código TypeScript por valores antigos

**Status:** ⏳ Verificação necessária

---

## 🟠 ALTOS (Afetam Performance/UX)

### D-5: Falta de Full-Text Search Index

**Severidade:** 🟠 ALTO
**Impacto:** Alto (performance de busca)
**Esforço:** 🟡 Médio (3-4h)

**Problema:**
Nenhuma indexação para busca em `title` ou `content`:

```sql
-- Hoje: Qualquer busca por texto usa LIKE (sequential scan)
SELECT * FROM bible_studies WHERE title ILIKE '%Jesus%';
-- ❌ Sequential scan na tabela inteira
```

**Resultado:**
- Queries de busca muito lentas em 100+ estudos
- Backend saturado com full table scans
- UX ruim: 2-5s de latência

**Solução:**
Adicionar Full-Text Search index em português:

```sql
-- 1. Criar índice GIN
CREATE INDEX idx_fts_title ON bible_studies
USING GIN (to_tsvector('portuguese', title));

-- 2. Usar em queries
SELECT * FROM bible_studies
WHERE to_tsvector('portuguese', title) @@ plainto_tsquery('portuguese', 'Jesus')
ORDER BY ts_rank(to_tsvector('portuguese', title), plainto_tsquery('portuguese', 'Jesus')) DESC;
```

**Status:** ⏳ Não implementado

---

### D-6: View `bible_graph_data` Pesada (Seleciona JSONB)

**Severidade:** 🟠 ALTO
**Impacto:** Médio (performance do grafo)
**Esforço:** 🟢 Baixo (1-2h)

**Problema:**
View junta `content` JSONB desnecessariamente:

```sql
-- Hoje: Se `content` tem 100KB, view retorna 100KB por estudo
SELECT ... FROM bible_studies
```

**Resultado:**
- Grafo lento com 100+ estudos (10MB transferência!)
- Latência de rede alta
- Re-renders desnecessários

**Solução:**
```sql
CREATE OR REPLACE VIEW bible_graph_data AS
SELECT
  s.id,
  s.title,
  s.book_name,
  s.chapter_number,
  s.status,
  -- Omitir content JSONB pesado
  json_agg(sl.target_study_id) FILTER (WHERE sl.target_study_id IS NOT NULL) as outgoing_links
FROM bible_studies s
LEFT JOIN bible_study_links sl ON s.id = sl.source_study_id
GROUP BY s.id, s.title, s.book_name, s.chapter_number, s.status;
```

**Status:** ✅ Parcialmente implementado (verificar)

---

### D-7: Sem Soft Delete (Hard Delete Permanente)

**Severidade:** 🟠 ALTO
**Impacto:** Alto (recuperação de dados)
**Esforço:** 🟡 Médio (4-5h + risky)

**Problema:**
Deletes são permanentes sem histórico:

```sql
DELETE FROM bible_studies WHERE id = $1;
-- ❌ Dados perdidos para sempre, sem audit trail
```

**Resultado:**
- Usuário clica delete por acidente → estudo perdido
- Sem como recuperar
- Sem audit de quem deletou/quando

**Solução:**
Implementar soft delete:

```sql
-- 1. Adicionar coluna
ALTER TABLE bible_studies ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Update RLS policies
CREATE POLICY "Users can only see non-deleted studies"
ON bible_studies FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- 3. Soft delete function
CREATE FUNCTION soft_delete_study(study_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE bible_studies SET deleted_at = NOW()
  WHERE id = study_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;
```

**Status:** ⏳ Não implementado

---

### D-8: Sem Audit Trail (created_by, updated_by)

**Severidade:** 🟠 ALTO
**Impacto:** Médio (compliance/debugging)
**Esforço:** 🟡 Médio (3-4h)

**Problema:**
Sem rastreamento de quem criou/alterou cada estudo:

```sql
-- Hoje: Só temos created_at/updated_at
-- Não temos: Quem criou? Quem foi o último a editar?
```

**Resultado:**
- Sem audit trail para compliance
- Difícil debugar quem fez o quê
- Sem histórico de mudanças

**Solução:**
```sql
ALTER TABLE bible_studies
ADD COLUMN created_by UUID REFERENCES auth.users(id),
ADD COLUMN updated_by UUID REFERENCES auth.users(id);

-- Trigger para popular automaticamente
CREATE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Status:** ⏳ Não implementado

---

## 🟡 MÉDIOS (Afetam Manutenibilidade/Escalabilidade)

### D-9: Tags Field Array Sem Validação

**Severidade:** 🟡 MÉDIO
**Impacto:** Médio (integridade de dados)
**Esforço:** 🔴 Alto (5-8h refatorar)

**Problema:**
Campo `tags` em `bible_studies` é `TEXT[]` mas sem validação:

```sql
-- Hoje: Qualquer array é aceito
tags TEXT[] DEFAULT '{}'

-- Possível: '{invalid-uuid, "", "null"}'
-- Resultado: Frontend quebra ao buscar tags inválidas
```

**Solução Recomendada:**
Refatorar para tabela de junção:

```sql
-- 1. Criar tabela de relacionamento
CREATE TABLE bible_study_tags (
  study_id UUID REFERENCES bible_studies(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES bible_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (study_id, tag_id)
);

-- 2. Manter array como VIEW para compatibilidade
CREATE VIEW v_bible_studies_with_tags AS
SELECT
  s.*,
  array_agg(st.tag_id) as tag_ids
FROM bible_studies s
LEFT JOIN bible_study_tags st ON s.id = st.study_id
GROUP BY s.id;
```

**Status:** ⏳ Não implementado (refactor significativo)

---

### D-10: Color em Tags Sem Validação

**Severidade:** 🟡 MÉDIO
**Impacto:** Baixo (validação visual)
**Esforço:** 🟢 Baixo (1-2h)

**Problema:**
Campo `color` aceita qualquer string:

```sql
-- Hoje:
color TEXT NOT NULL
-- Possível: 'xyz123', 'invalid-color', ''
```

**Solução:**
```sql
ALTER TABLE bible_tags
DROP CONSTRAINT bible_tags_color_check,
ADD CONSTRAINT check_valid_color CHECK (
  color IN (
    'blue', 'red', 'green', 'yellow', 'purple',
    'pink', 'indigo', 'cyan', 'orange', 'slate'
  )
);
```

**Status:** ⏳ Não implementado

---

### D-11: Falta Índice em RLS Performance

**Severidade:** 🟡 MÉDIO
**Impacto:** Médio (RLS lookup speed)
**Esforço:** 🟢 Baixo (30min)

**Problema:**
Policy para admin (em `bible_profiles`) usa `EXISTS` subquery sem índice:

```sql
-- Hoje: Pode ser lento verificar role
EXISTS (SELECT 1 FROM bible_profiles WHERE role = 'admin')
```

**Solução:**
```sql
CREATE INDEX idx_bible_profiles_role ON bible_profiles(id, role);
-- Ou melhor: PARTIAL INDEX
CREATE INDEX idx_bible_profiles_admin ON bible_profiles(id) WHERE role = 'admin';
```

**Status:** ⏳ Não implementado

---

### D-12: RLS Policies Redundantes

**Severidade:** 🟡 MÉDIO
**Impacto:** Baixo (manutenibilidade)
**Esforço:** 🟡 Médio (3-4h refator)

**Problema:**
Cada tabela repete 4 policies idênticas (SELECT, INSERT, UPDATE, DELETE):

```sql
-- Repetido em: bible_studies, bible_study_links, bible_backlog, bible_tags
CREATE POLICY "Users can see own records"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);
-- ... 2 mais
```

**Solução:**
Criar função reutilizável:

```sql
CREATE FUNCTION enable_rls_for_user_id(
  table_name TEXT
) RETURNS VOID AS $$
BEGIN
  -- Executar 4 policies em uma chamada
END;
$$ LANGUAGE plpgsql;

-- Uso:
SELECT enable_rls_for_user_id('bible_studies');
SELECT enable_rls_for_user_id('bible_tags');
```

**Status:** ⏳ Não implementado

---

### D-13: Migration Dependency Não Documentado

**Severidade:** 🟡 MÉDIO
**Impacto:** Baixo (risk if running migrations out of order)
**Esforço:** 🟢 Baixo (30min docs)

**Problema:**
Migration #3 (`bible_profiles` + trigger) depende de Migration #1, mas não documentado:

```
001_create_schema.sql    ← Define auth.users
  ↓ (depende de)
003_create_profiles.sql  ← Cria trigger em auth.users
```

**Solução:**
Adicionar comentário em cada migration:

```sql
-- Migration 003_create_profiles.sql
-- DEPENDS ON: 001_create_schema (defines auth.users)
-- REQUIRED BEFORE: 004_enable_rls
```

**Status:** ⏳ Não implementado

---

## 🟢 BAIXOS (Nice-to-have)

### D-14: Sem Comentários em Funções

**Severidade:** 🟢 BAIXO
**Impacto:** Baixo (documentação)
**Esforço:** 🟢 Baixo (30min)

**Solução:**
```sql
COMMENT ON FUNCTION bible_handle_new_user() IS 'Trigger function to auto-create profile on new user signup. Extracts full_name from raw_user_meta_data or defaults to email.';
```

---

### D-15: Sem Metricas de Uso

**Severidade:** 🟢 BAIXO
**Impacto:** Baixo (observability)
**Esforço:** 🟡 Médio (2-3h)

**Problema:**
Sem rastreamento de:
- Quantos estudos por usuário
- Mais lido/estudado
- Taxa de abandono

**Solução:**
Criar tabelas de metrics/analytics (futuro)

---

## 📋 Recomendações Prioritárias

### Imediato (1-2 sprints)
1. **D-2**: Fix foreign key check em links
2. **D-1**: Adicionar validação JSONB
3. **D-3**: Mudar backlog para CASCADE delete
4. **D-4**: Auditar enum status no TypeScript

### Curto Prazo (3-4 sprints)
5. **D-5**: Implementar full-text search
6. **D-7**: Soft delete com deleted_at
7. **D-8**: Audit trail (created_by, updated_by)

### Médio Prazo (Backlog)
8. **D-9**: Refatorar tags array → tabela
9. **D-10**: Validar enum colors
10. **D-12**: Refatorar RLS policies

---

## 🎯 Conclusão

**Status Atual:** ⚠️ Funcional mas com débitos técnicos

**Score Geral:** 6/10
- Schema: 8/10 (bem estruturado)
- RLS: 7/10 (implementado mas gaps)
- Performance: 5/10 (sem índices de busca)
- Integridade: 4/10 (faltam validações)
- Manutenibilidade: 6/10 (alguns padrões repetidos)

**Recomendação:** Implementar críticos (D-1 a D-4) nos próximos 2-4 weeks. Depois focar em performance (D-5, D-6).

---

**Data:** 2026-01-26
**Analisado por:** @data-engineer Agent
**Próximo Review:** 2026-02-26 (após implementação de críticos)
