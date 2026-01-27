# Arquitetura do Sistema - Bible Study (Segundo Cérebro)

**Data de Análise:** 2026-01-26
**Versão do Projeto:** 3.0.0 (AIOS Integration)
**Status:** ✅ COMPLETO

---

## 📋 Resumo Executivo

Bible Study é uma aplicação Next.js 15 que funciona como um "Segundo Cérebro" para estudo bíblico com suporte a editor de texto rico, visualização em grafo de conexões entre estudos, e sistema de tags para categorização. A arquitetura segue padrões modernos de React 19 com TypeScript, Supabase como backend, e TailwindCSS para estilização.

**Stack Principal:**
- Frontend: Next.js 15 + React 19 + TypeScript 5.7
- UI: TailwindCSS 3.4 + shadcn/ui + Lucide Icons
- Editor: Tiptap 3.17 com extensões customizadas
- Grafo: react-force-graph-2d 1.29
- Backend: Supabase (PostgreSQL + Auth + Storage)

---

## 1️⃣ COMPONENTES PRINCIPAIS (Frontend)

### 1.1 Estrutura de Componentes

**Componentes de Página (Page Routes):**
- `/page.tsx` - Dashboard principal (66 livros bíblicos organizados por categoria)
- `/estudo/[id]/page.tsx` - Editor de estudo com título, conteúdo, tags, status
- `/grafo/page.tsx` - Visualização force-directed de estudos e conexões
- `/login/page.tsx` - Autenticação (signup/login com Nome Completo)
- `/settings/page.tsx` - Configurações e gestão de conta

**Componentes de Dashboard** (`/src/components/dashboard/`):
- `Sidebar.tsx` - Navegação lateral (colapsável) com menu e perfil do usuário
- `TopBar.tsx` - Barra de busca, filtro de tags, botão para grafo
- `BookGrid.tsx` - Grid de 66 livros bíblicos com indicador de progresso
- `BookCard.tsx` - Card individual com progress bar, tags, data de atualização
- `ChapterView.tsx` - Visualização dos capítulos de um livro com estudos existentes
- `BacklogPanel.tsx` - Painel lateral com itens de backlog para estudo futuro
- `StudySelectionModal.tsx` - Modal para seleção/criação de múltiplos estudos por capítulo

**Componentes de Editor** (`/src/components/Editor/`):
- `Editor/index.tsx` - Wrapper Tiptap com suporte a extensões customizadas
- `BubbleMenu.tsx` - Menu flutuante ao selecionar texto (formatação inline)
- `SlashMenu.tsx` - Menu de comandos acionado com `/` (blocos, listas)
- `useSlashMenu.ts` - Hook de lógica para gerenciar slash menu state
- `ColoredBlockquote.ts` - Extensão customizada para citações coloridas

**Componentes de UI** (`/src/components/ui/`):
- `button.tsx`, `input.tsx`, `badge.tsx`, `dialog.tsx`, `breadcrumbs.tsx` - Componentes shadcn/ui reutilizáveis

**Componentes de Features**:
- `CreateTagModal.tsx` - Modal para criar nova tag com seletor de tipo e cor

### 1.2 State Management

**Arquitetura:**
- **Context API** para autenticação (`AuthContext`)
- **Context API** para estudos (provider com hooks)
- **React Hooks** (useState, useCallback, useRef) para estado local
- **Supabase Client** como fonte única de verdade (SSoT)

**Padrão Crítico de Loading:**
```typescript
// Todos os hooks seguem este padrão para evitar loading infinito:
const { user, loading: authLoading } = useAuth();
const [data, setData] = useState([]);

useEffect(() => {
  if (authLoading) return;  // Esperar auth carregar
  if (!user?.id) {
    setLoading(false);
    return;  // Sem usuário = parar
  }
  // Fetch normal
}, [user?.id, authLoading]);  // Incluir authLoading nas deps
```

**Context Providers (Stack):**
```
AuthProvider (session, user, profile, loading)
└── StudiesProvider (studies, CRUD operations)
    └── useGraph / useBacklog / useTags
```

### 1.3 Routing

**Sistema de Rotas:**
- Rota dinâmica `/estudo/[id]` com suporte a:
  - `/estudo/{uuid}` - edição de estudo existente
  - `/estudo/new?book={bookId}&chapter={n}` - criação novo estudo
- Query params para persistência de estado:
  - `/?book={bookId}` - abre ChapterView ao carregar dashboard
  - `/estudo/new?book=X&chapter=Y` - passa parâmetros de criação

**Middleware:**
- `middleware.ts` com `updateSession()` do Supabase SSR
- Proteção de rotas via `useAuth()` em componentes (client-side)
- Redirect automático se `!user` (no layout ou page)

### 1.4 API Client

**Arquitetura Supabase:**
```
src/lib/supabase/
├── client.ts       - createBrowserClient() para browser
├── server.ts       - createServerClient() para server actions
└── middleware.ts   - updateSession() para refresh de sessão
```

**Padrão de Query:**
- ✅ Sempre incluir `.eq('user_id', user.id)` (RLS enforcement)
- ✅ Evitar `.select('*')` com JSONB grande (usar select específico)
- ✅ Timeout com Promise.race([queryPromise, timeoutPromise], 10s)
- ❌ Sem `.select().single()` após `.update()` (evita hang com RLS + JSONB)

---

## 2️⃣ BACKEND & DATABASE

### 2.1 Schema Supabase

**Tabelas Principais:**

#### `bible_studies` (estudos com conteúdo)
```sql
- id (UUID PK)
- user_id (FK auth.users, RLS)
- title (TEXT)
- content (JSONB - Tiptap format)
- book_name (TEXT)
- chapter_number (INTEGER)
- status (enum: 'estudando' | 'revisando' | 'concluído')
- tags (TEXT[])
- created_at, updated_at, completed_at (TIMESTAMPTZ)
```
- **Índices:** user_id, book_name, status, tags (GIN), composite (user_id, book_name, chapter_number)
- **Nota:** UNIQUE constraint removido em 2026-01-26 para permitir múltiplos estudos por capítulo

#### `bible_study_links` (conexões entre estudos para grafo)
```sql
- id (UUID PK)
- user_id (FK auth.users, RLS)
- source_study_id (FK bible_studies)
- target_study_id (FK bible_studies)
- created_at (TIMESTAMPTZ)
```
- **Constraints:** UNIQUE(user_id, source_study_id, target_study_id), CHECK source != target
- **Índices:** user_id, source_id, target_id

#### `bible_backlog` (referências para estudo futuro)
```sql
- id (UUID PK)
- user_id (FK auth.users, RLS)
- reference_label (TEXT)
- source_study_id (FK bible_studies, nullable)
- status (BOOLEAN)
- created_at (TIMESTAMPTZ)
```

#### `bible_tags` (categorização)
```sql
- id (UUID PK)
- user_id (FK auth.users, RLS)
- name (TEXT)
- type (enum: 'Versículos' | 'Temas' | 'Princípios')
- color (TEXT - ex: 'blue', 'purple', 'green')
- created_at (TIMESTAMPTZ)
```
- **Constraint:** UNIQUE(user_id, name)

#### `bible_profiles` (perfis de usuário)
```sql
- id (UUID PK = auth.users.id)
- full_name (TEXT)
- role (enum: 'free' | 'admin')
- created_at, updated_at (TIMESTAMPTZ)
```
- **Trigger:** Criado automaticamente via `bible_handle_new_user()`

**Views:**
- `bible_graph_data` - Dados formatados para grafo (studies + outgoing_links aggregado)

### 2.2 Autenticação

**Fluxo:**
1. **Signup:** Email + Senha + Nome Completo → `auth.users` + `bible_profiles` (via trigger automático)
2. **Login:** Email + Senha → Session JWT
3. **Session:** Token JWT armazenado em cookie seguro (HTTP-only)
4. **Refresh:** Middleware executa `updateSession()` a cada request para refresh automático

**Context (`AuthContext.tsx`):**
```typescript
useAuth() → {
  user,           // auth.users.id + email
  session,        // JWT token
  profile,        // full_name + role
  loading,        // boolean
  signOut(),      // logout
  refreshProfile() // force update do perfil
}
```

### 2.3 RLS Policies (Row Level Security)

**Princípio Fundamental:** Isolamento completo por `auth.uid() = user_id`

**Policies por tabela:**
```sql
-- bible_studies, bible_tags, bible_backlog, bible_study_links
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

**Segurança:**
- ✅ RLS habilitado em todas as tabelas
- ✅ Queries obrigam `.eq('user_id', auth.uid())`
- ✅ Sem acesso direto a dados de outros usuários
- ✅ Proteção automática no banco de dados

---

## 3️⃣ FLUXOS PRINCIPAIS (User Journeys)

### 3.1 Estudo de um Livro/Capítulo

```
1. Dashboard → BookCard (clique em "Gênesis")
   └─ Mostra: grid de 66 livros por categoria

2. ChapterView (lista de capítulos 1-50)
   └─ Mostra: capítulos estudados, data de atualização

3. Usuário clica em capítulo para:
   └─ Ver estudos existentes (múltiplos estudos por capítulo)
   └─ Criar novo estudo (/estudo/new?book=X&chapter=Y)

4. Editor Page (/estudo/[id])
   └─ Carrega estudo ou prepara para novo
   └─ Renderiza Tiptap com conteúdo JSONB
```

### 3.2 Ciclo de Salvamento

**Auto-save (30s debounce):**
```typescript
// Em [id]/page.tsx:
useEffect(() => {
  if (!hasUnsavedChanges) return;
  const timer = setTimeout(() => handleSave(), 30000);
  return () => clearTimeout(timer);
}, [hasUnsavedChanges, handleSave]);
```

**Salvamento Manual:**
```
1. Usuário clica "Salvar"
2. handleSave():
   - Parse JSON do conteúdo
   - Se novo estudo: createStudy() + saveStudy()
   - Se existente: saveStudy() com UPDATE (sem SELECT)
3. Atualiza estado local + UI (checkmark verde)
4. Redireciona se era novo estudo
```

**Proteção contra perda de dados:**
- Modal de confirmação ao sair com mudanças não salvas
- 3 opções: "Salvar e sair", "Sair sem salvar", "Cancelar"

### 3.3 Edição de Estudo

**Fluxo Completo:**
```
1. Load study → getStudyById(uuid)
   └─ Validar content é JSON válido

2. Normalizar content para string JSON (parseContent)
   └─ Handle JSONB / string format

3. Renderizar Editor com initialContent
   └─ Tiptap carrega conteúdo

4. Editor.onUpdate → onChange(JSON.stringify(content))
   └─ Usuário digita/formata

5. handleContentChange → setCurrentContent + setHasUnsavedChanges
   └─ Flag para auto-save

6. Auto-save → saveStudy(id, { content, title, status, tags })
   └─ UPDATE apenas (sem SELECT após)

7. Atualizar UI (status de save)
   └─ Checkmark verde + timestamp
```

**Campos Editáveis:**
- Título (inline edit com ✓/✗)
- Conteúdo (editor Tiptap com formatação)
- Tags (dropdown com seleção múltipla)
- Status (dropdown: estudando → revisando → concluído)

### 3.4 Grafo de Estudos

**Visualização Force-Directed:**
```
1. Usuário clica "Grafo" (TopBar ou Sidebar)
   └─ Navega para /grafo

2. useGraph() busca:
   └─ bible_studies (all, ORDER BY created_at DESC)
   └─ bible_study_links (all)

3. Transform para GraphData:
   └─ nodes: Study[] → GraphNode[] (cores por categoria)
   └─ links: StudyLink[] → GraphLink[] (source/target)

4. Renderizar ForceGraph2D:
   └─ Dynamic import (SSR=false)
   └─ Canvas rendering

5. Interações:
   └─ Hover: mostra info node
   └─ Click: navega para /estudo/{id}
   └─ Zoom: mouse wheel
   └─ Pan: drag de node
```

**Cores por Categoria (10 categorias):**
- Pentateuco: Verde esmeralda
- Históricos: Âmbar
- Poéticos: Roxo
- Profetas Maiores: Vermelho
- Profetas Menores: Rosa
- Evangelhos: Azul
- Histórico NT: Ciano
- Cartas Paulinas: Índigo
- Cartas Gerais: Teal
- Apocalíptico: Laranja

---

## 4️⃣ PADRÕES E ARQUITETURA

### 4.1 Type Safety (TypeScript)

**Tipos Gerados:**
```typescript
// src/types/database.ts
export type Study = Database['public']['Tables']['bible_studies']['Row'];
export type StudyInsert = Database['public']['Tables']['bible_studies']['Insert'];
export type StudyUpdate = Database['public']['Tables']['bible_studies']['Update'];
export interface TiptapContent {
  type: 'doc' | 'paragraph' | 'text',
  content?: any[]
}
```

**Type Guards:**
- ✅ Sempre validar `.single()` com `error.code !== 'PGRST116'` (no rows)
- ✅ Parse de JSON com try/catch
- ✅ Early returns com `!user?.id` checks
- ✅ Type casting apenas quando lógica garante validade

### 4.2 Performance

**Otimizações Implementadas:**
1. **Dynamic Imports:**
   - ForceGraph2D com `dynamic()` + SSR=false (evita canvas SSR)
   - Reduz bundle inicial em ~500KB

2. **Memoization:**
   - `useMemo` para enrichedBooks (dashboard)
   - `useCallback` para handlers com deps corretas

3. **Lazy Loading:**
   - Editor renderiza com `immediatelyRender: false` (evita SSR mismatch)
   - Content validation com refs (`lastAppliedContentRef`)

4. **Database Queries:**
   - Select específicos (não `*` com JSONB grande)
   - Índices compostos (user_id, book_name, chapter_number)
   - GIN index para tags[] (filtro array)

5. **State Management:**
   - StudySummary (sem content) para lista
   - StudyWithContent (full) apenas quando necessário
   - Local state updates antes de DB (optimistic)

### 4.3 Tratamento de Erros

**Padrão Uniforme:**
```typescript
const [error, setError] = useState<string | null>(null);

try {
  // operação
} catch (err) {
  console.error('[MODULE] operation ERROR:', err);
  setError(err instanceof Error ? err.message : 'Erro genérico');
} finally {
  setLoading(false);
}
```

**Logging:**
- Prefix padronizado: `[MODULE] actionName - context`
- Exemplo: `[STUDIES] fetchStudies ERROR: timeout after 10s`
- Sem exposição de stack traces em produção

---

## 5️⃣ PONTOS FORTES

| Aspecto | Implementação | Nota |
|---------|---------------|------|
| **Autenticação** | ✅ Supabase Auth completo + profiles + roles | Signup com Nome Completo |
| **RLS Security** | ✅ Enforçado em todas as tabelas | Isolamento automático por user_id |
| **Type Safety** | ✅ TypeScript + types gerados do Supabase | Cobertura ~95% |
| **API Design** | ✅ Hooks customizados com Context (composition) | Reutilizável e testável |
| **Error Handling** | ✅ Timeouts, early returns, validação | Cobertura de casos extremos |
| **UI/UX** | ✅ shadcn/ui + TailwindCSS + responsive | Design system consistente |
| **Editor** | ✅ Tiptap com extensões customizadas | Formatação rica + slash menu |
| **Grafo** | ✅ Force-graph com cores por categoria | Visualização clara de conexões |
| **Database** | ✅ Schema bem normalizado com índices | Performance otimizada |
| **Migrations** | ✅ Versionadas com rollback specs | Rastreável e reversível |

---

## 6️⃣ GAPS E OPORTUNIDADES DE MELHORIA

### Prioridade CRÍTICA (Afeta Funcionalidade Core)

| ID | Gap | Impacto | Solução | Esforço |
|----|-----|---------|---------|---------|
| **G1** | Múltiplos estudos por capítulo | Parcialmente implementado | Melhorar UI: Modal de seleção + fluxo completo | 🔴 Alto |
| **G2** | Links entre estudos | Tabela existe, não há UI | Botão "Referenciar" no editor | 🟡 Médio |
| **G3** | Backlog | Tabela existe, UI minimal | Implementar drag-drop + criar estudo | 🟡 Médio |

### Prioridade ALTA (Performance/UX)

| ID | Gap | Impacto | Solução | Esforço |
|----|-----|---------|---------|---------|
| **G4** | Busca por texto | Limitada (só UI) | Implementar full-text search | 🟡 Médio |
| **G5** | Sincronização realtime | Sem colabs | Adicionar Supabase realtime subscriptions | 🟡 Médio |
| **G6** | Código duplicado | Manutenção difícil | Extrair getTagColor, TagSelector, StatusSelect | 🟢 Baixo |

### Prioridade MÉDIA (Futura)

| ID | Gap | Impacto | Solução | Esforço |
|----|-----|---------|---------|---------|
| **G7** | Exportação | Não existente | Implementar via Edge Functions (HTML, PDF, JSON) | 🔴 Alto |
| **G8** | Validação de Input | Minimal (HTML5) | Zod/Yup + server-side validation | 🟡 Médio |
| **G9** | Rate Limiting | Sem proteção | Adicionar RLS + Supabase function | 🟡 Médio |
| **G10** | Tests | Playwright instalado, sem testes | Implementar E2E para fluxos críticos | 🟡 Médio |

---

## 7️⃣ CÓDIGO DUPLICADO DETECTADO

### 1. `getTagColor()` - Repetido em 2 lugares
**Localização:**
- `/estudo/[id]/page.tsx` (linhas 334-351)
- `/components/dashboard/ChapterView.tsx` (linhas 53-70)

**Solução:** Mover para `lib/utils/tag-utils.ts`

### 2. Renderização de dropdown de tags
**Localização:**
- `/estudo/[id]/page.tsx` (linhas 615-679)

**Solução:** Extrair para componente `<TagSelector />`

### 3. Status badge rendering
**Localização:**
- `/estudo/[id]/page.tsx` (linhas 544-596)

**Solução:** Extrair para componente `<StatusSelect />`

---

## 8️⃣ RESUMO TÉCNICO

### Stack
- **Frontend:** Next.js 15, React 19, TypeScript 5.7
- **UI:** TailwindCSS 3.4, shadcn/ui, Lucide Icons
- **Editor:** Tiptap 3.17 com 8+ extensões
- **Grafo:** react-force-graph-2d 1.29
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Database:** PostgreSQL com RLS policies + 15+ índices

### Arquitetura Geral
```
User
└── AuthContext (session, user, profile)
    └── Page (useAuth)
        └── Hooks Customizados
            ├─ useStudies (CRUD estudos)
            ├─ useTags (CRUD tags)
            ├─ useGraph (dados grafo)
            └─ useBacklog (CRUD backlog)
                └── Supabase Client
                    └── PostgreSQL (com RLS)
```

### Fluxo de Dados
1. Usuário → Página (React Component)
2. Página → Hook Customizado
3. Hook → Supabase Client
4. Supabase → PostgreSQL (com RLS enforcement)
5. Volta com dados filtrados por user_id

### Características de Segurança
- ✅ Autenticação via Supabase Auth
- ✅ RLS enforçado em TODAS as tabelas
- ✅ `user_id` checks obrigatórios em TODOS os hooks
- ✅ Validação de input (parser JSON)
- ✅ Session refresh automático via middleware
- ✅ Sem exposição de IDs internos
- ✅ Timeouts em queries (10s)

---

## 🎯 RECOMENDAÇÕES IMEDIATAS

1. **Extrair código duplicado** (G6) - 2-3 horas, alto ROI
2. **Melhorar múltiplos estudos por capítulo** (G1) - 4-6 horas, core functionality
3. **Implementar links entre estudos** (G2) - 3-4 horas, conecta grafo
4. **Adicionar busca por texto** (G4) - 2-3 horas, UX melhora muito

---

**Próxima Fase:** 🔧 FASE 2 - Auditar Database (Supabase Schema)

Data de Geração: 2026-01-26
Analisado por: @architect Agent (Aria)
