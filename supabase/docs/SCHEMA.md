# Supabase Schema - Bible Study

**Data de Análise:** 2026-01-26
**Status:** ✅ Documentado

---

## 📊 Tabelas do Projeto

### 1. `bible_studies` (Core - Estudos)

```sql
CREATE TABLE bible_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  book_name TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  status TEXT DEFAULT 'estudando' CHECK (status IN ('estudando', 'revisando', 'concluído')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Índices
  CONSTRAINT idx_bible_studies_user_id UNIQUE (id, user_id),
  CONSTRAINT idx_bible_studies_book_chapter UNIQUE (user_id, book_name, chapter_number) -- REMOVIDO para múltiplos estudos
);

-- Índices estratégicos
CREATE INDEX idx_bible_studies_user_id ON bible_studies(user_id);
CREATE INDEX idx_bible_studies_book ON bible_studies(book_name);
CREATE INDEX idx_bible_studies_status ON bible_studies(status);
CREATE INDEX idx_bible_studies_tags ON bible_studies USING GIN(tags);
CREATE INDEX idx_bible_studies_user_book_chapter ON bible_studies(user_id, book_name, chapter_number);
```

**Colunas:**
- `id` - UUID primária (gerada automaticamente)
- `user_id` - Referência ao usuário (RLS)
- `title` - Título do estudo
- `content` - JSONB com formato Tiptap
- `book_name` - Nome do livro bíblico (ex: "Gênesis")
- `chapter_number` - Número do capítulo (1-150)
- `status` - enum: 'estudando' | 'revisando' | 'concluído'
- `tags` - Array de strings com IDs de tags
- `created_at`, `updated_at`, `completed_at` - Timestamps

**RLS Policy:**
```sql
-- Todos os operações filtrpor user_id
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

---

### 2. `bible_study_links` (Grafo - Conexões)

```sql
CREATE TABLE bible_study_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_study_id UUID NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  target_study_id UUID NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_links UNIQUE(user_id, source_study_id, target_study_id),
  CONSTRAINT no_self_links CHECK (source_study_id != target_study_id)
);

-- Índices
CREATE INDEX idx_bible_study_links_user_id ON bible_study_links(user_id);
CREATE INDEX idx_bible_study_links_source ON bible_study_links(source_study_id);
CREATE INDEX idx_bible_study_links_target ON bible_study_links(target_study_id);
```

**Propósito:** Criar conexões entre estudos para grafo de "segundo cérebro"

**RLS Policy:** Similar ao bible_studies (filtrpor user_id)

---

### 3. `bible_backlog` (Backlog)

```sql
CREATE TABLE bible_backlog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_label TEXT NOT NULL,
  source_study_id UUID REFERENCES bible_studies(id) ON DELETE SET NULL,
  status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Propósito:** Referências para estudar no futuro

**Problema:** `ON DELETE SET NULL` deixa orphaned records

---

### 4. `bible_tags` (Tags/Categorização)

```sql
CREATE TABLE bible_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Versículos', 'Temas', 'Princípios')),
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_tag_per_user UNIQUE(user_id, name)
);
```

**Propósito:** Sistema de tagging com 3 tipos de tags

**Campos:**
- `type` - 'Versículos' | 'Temas' | 'Princípios'
- `color` - Cor para exibição (formato: tailwind color ou hex)

---

### 5. `bible_profiles` (Perfis de Usuário)

```sql
CREATE TABLE bible_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Criar perfil automaticamente ao signup
CREATE FUNCTION bible_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bible_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'free'
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bible_new_user_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION bible_handle_new_user();
```

---

## 🔍 Índices Estratégicos

| Tabela | Índice | Tipo | Propósito |
|--------|--------|------|----------|
| `bible_studies` | (user_id) | B-tree | RLS filtering |
| `bible_studies` | (book_name) | B-tree | Busca por livro |
| `bible_studies` | (status) | B-tree | Filtro de status |
| `bible_studies` | (tags) | GIN | Busca em array de tags |
| `bible_studies` | (user_id, book_name, chapter_number) | B-tree | Query composta mais comum |
| `bible_study_links` | (user_id) | B-tree | RLS filtering |
| `bible_study_links` | (source_study_id) | B-tree | Navegação grafo |
| `bible_study_links` | (target_study_id) | B-tree | Navegação grafo |

**Status:** ✅ Índices bem dimensionados para queries esperadas

---

## 🔐 RLS Policies

**Princípio:** Isolamento completo por `auth.uid() = user_id`

```sql
-- Exemplo: bible_studies
CREATE POLICY "Users can only see their own studies"
ON bible_studies FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own studies"
ON bible_studies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own studies"
ON bible_studies FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own studies"
ON bible_studies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

**Tabelas com RLS:**
- ✅ bible_studies
- ✅ bible_study_links
- ✅ bible_backlog
- ✅ bible_tags
- ✅ bible_profiles

---

## 📈 Views

### `bible_graph_data`

Dados formatados para renderizar o grafo force-directed:

```sql
SELECT
  s.id,
  s.title,
  s.book_name,
  s.chapter_number,
  s.status,
  json_agg(sl.target_study_id) FILTER (WHERE sl.target_study_id IS NOT NULL) as outgoing_links
FROM bible_studies s
LEFT JOIN bible_study_links sl ON s.id = sl.source_study_id
GROUP BY s.id, s.title, s.book_name, s.chapter_number, s.status;
```

---

## 📝 Migrations Versionadas

| # | Data | Descrição | Status |
|---|------|-----------|--------|
| 001 | 2025-12-XX | Criar schema base (studies, links, backlog, tags) | ✅ Applied |
| 002 | 2025-12-XX | Atualizar enum de status (draft → estudando/revisando/concluído) | ✅ Applied |
| 003 | 2025-12-XX | Criar profiles e trigger de novo usuário | ✅ Applied |
| 004 | 2026-01-XX | Remover UNIQUE constraint para múltiplos estudos por capítulo + índice composto | ✅ Applied |

---

## 🛡️ Segurança

**Auditado:**
- ✅ Todas as tabelas têm RLS habilitado
- ✅ Todas as queries forçam user_id check
- ✅ Nenhum acesso direto a dados de outros usuários
- ✅ Foreign keys com ON DELETE CASCADE (exceto backlog)

**Pontos de Atenção:**
- ⚠️ `bible_backlog` usa `ON DELETE SET NULL` (pode deixar orphaned records)
- ⚠️ `content` JSONB sem validação de schema
- ⚠️ `color` em tags sem validação de formato

---

**Próxima Fase:** 📋 FASE 3 - Auditar Frontend/UX
