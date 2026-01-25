# Claude Code - Bible Study (Segundo Cérebro)

> Aplicativo de estudo bíblico com editor rico e visualização em grafo estilo "Segundo Cérebro" (Obsidian/Roam Research).

---

## 🔴 REGRA #0: READ-BEFORE-EDIT (ABSOLUTA PRIORIDADE)

**Ver completo**: `~/.claude/rules/00-read-before-edit.md`

**CRÍTICO**: NUNCA editar código sem ANTES ler o arquivo COMPLETO.

**Checklist OBRIGATÓRIO**:
- [ ] Li o arquivo COMPLETO que vou modificar?
- [ ] Identifiquei TODAS as variáveis existentes?
- [ ] A variável que preciso JÁ EXISTE com outro nome?
- [ ] Minha nomenclatura SEGUE o padrão existente?

**Evidência**: RCA-311 - `buttonClickPayload is not defined` (variável correta: `buttonMetadata`)

---

## 🎯 VISÃO DO PROJETO

Ferramenta para estudo bíblico pessoal que permite:
- Navegar pelos 66 livros da Bíblia
- Criar anotações ricas por capítulo
- Visualizar conexões entre estudos em grafo interativo
- Manter backlog de referências para estudo futuro

---

## 🗄️ REGRA DE INFRAESTRUTURA SUPABASE

> **🚨 REGRA ABSOLUTA 🚨**
>
> Todos os recursos criados no Supabase DEVEM obrigatoriamente utilizar o prefixo **`bible_`**

### Recursos Afetados:
- **Tabelas**: `bible_studies`, `bible_study_links`, `bible_tags`, etc.
- **Views**: `bible_studies_with_tags`, `bible_connections_graph`, etc.
- **Triggers**: `bible_update_timestamps`, `bible_sync_links`, etc.
- **Functions**: `bible_get_study_stats()`, `bible_search_studies()`, etc.
- **Migrations**: Devem criar recursos com prefixo `bible_`

### Exemplos:
```sql
-- ✅ CORRETO
CREATE TABLE bible_studies (
  id UUID PRIMARY KEY,
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bible_study_links (
  id UUID PRIMARY KEY,
  source_study_id UUID REFERENCES bible_studies(id),
  target_study_id UUID REFERENCES bible_studies(id)
);

-- ❌ INCORRETO (sem prefixo)
CREATE TABLE studies (...);
CREATE TABLE study_links (...);
```

### Checklist Pré-Migration:
- [ ] Tabela tem prefixo `bible_`?
- [ ] View tem prefixo `bible_`?
- [ ] Function tem prefixo `bible_`?
- [ ] Trigger tem prefixo `bible_`?

---

## 🔐 REGRA DE AUTENTICAÇÃO E SEGURANÇA

> **🚨 REGRA ABSOLUTA 🚨**
>
> TODAS as queries ao Supabase DEVEM utilizar o contexto de usuário autenticado (`user_id = auth.uid()`)

### Padrões Obrigatórios:

1. **Context de Auth**: Usar `useAuth()` hook de `@/contexts/AuthContext` em todos os componentes
2. **Filtro user_id**: TODA query SELECT deve incluir `.eq('user_id', user?.id)`
3. **Insert com user_id**: Todo INSERT deve incluir `user_id: user.id`
4. **Early return**: Funções devem retornar cedo se `!user?.id`

### Arquitetura de Auth:

```
src/
├── contexts/AuthContext.tsx    # Provider + useAuth hook
├── lib/supabase/
│   ├── client.ts               # Browser client
│   ├── server.ts               # Server client
│   └── middleware.ts           # Route protection
├── middleware.ts               # Next.js middleware
└── app/login/page.tsx          # Login/Signup page
```

### Rotas Protegidas:
- `/` - Dashboard (requer auth)
- `/estudo/*` - Editor (requer auth)
- `/grafo` - Grafo (requer auth)
- `/login` - Página de login (redireciona se já logado)

### Exemplo de Hook com Auth:

```typescript
import { useAuth } from "@/contexts/AuthContext";

export function useMyHook() {
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user?.id) return; // Early return obrigatório

    const { data } = await supabase
      .from('bible_table')
      .select('*')
      .eq('user_id', user.id); // Filtro obrigatório
  }, [user?.id]);

  const insertData = async (item: Item) => {
    if (!user?.id) return;

    await supabase
      .from('bible_table')
      .insert({ ...item, user_id: user.id }); // user_id obrigatório
  };
}
```

### RLS Policies (já configuradas):
- `bible_studies`: SELECT, INSERT, UPDATE, DELETE filtrados por `auth.uid() = user_id`
- `bible_study_links`: SELECT, INSERT, UPDATE, DELETE filtrados por `auth.uid() = user_id`
- `bible_backlog`: SELECT, INSERT, UPDATE, DELETE filtrados por `auth.uid() = user_id`
- `bible_tags`: SELECT, INSERT, UPDATE, DELETE filtrados por `auth.uid() = user_id`
- `bible_profiles`: SELECT/UPDATE próprio perfil, admins podem atualizar roles

---

## 👤 SISTEMA DE PERFIS E ROLES

### Tabela `bible_profiles`:
```sql
CREATE TABLE bible_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Roles Disponíveis:
| Role | Permissões |
|------|------------|
| `free` | Acesso completo aos próprios dados |
| `admin` | + Pode alterar roles de outros usuários |

### Trigger Automático:
- `bible_handle_new_user()`: Cria perfil automaticamente após signup
- Extrai `full_name` do `raw_user_meta_data` ou usa email como fallback

### Acessando Perfil via useAuth():
```typescript
const { user, profile, refreshProfile } = useAuth();

// Dados disponíveis:
profile?.full_name  // Nome completo
profile?.role       // 'free' | 'admin'

// Após atualizar perfil:
await refreshProfile();
```

### Signup com Nome:
```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: 'Nome Completo' }
  }
});
```

### Checklist Pré-Implementação:
- [ ] Hook usa `useAuth()` para obter user?
- [ ] Query SELECT tem `.eq('user_id', user?.id)`?
- [ ] INSERT inclui `user_id: user.id`?
- [ ] Função tem early return se `!user?.id`?
- [ ] useCallback/useEffect inclui `user?.id` nas deps?

---

## 🛠️ STACK TÉCNICO

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + TypeScript + TailwindCSS
- **Componentes**: shadcn/ui (Radix UI)
- **Editor**: Tiptap (rich text)
- **Grafo**: react-force-graph-2d
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Ícones**: Lucide React

---

## 📁 ESTRUTURA DO PROJETO

```
src/
├── app/
│   ├── page.tsx              # Dashboard (66 livros) - PROTEGIDO
│   ├── login/page.tsx        # Login/Signup (tema escuro, com Nome Completo)
│   ├── estudo/[id]/page.tsx  # Editor de estudo - PROTEGIDO
│   ├── grafo/page.tsx        # Visualização do grafo - PROTEGIDO
│   └── settings/page.tsx     # Configurações e Gestão de Conta - PROTEGIDO
├── components/
│   ├── dashboard/            # Sidebar, TopBar, BookGrid, ChapterView, BacklogPanel
│   ├── Editor/               # Tiptap Editor, BubbleMenu, SlashMenu
│   └── ui/                   # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx       # Provider e hook de autenticação
├── hooks/
│   ├── useStudies.ts         # CRUD estudos (com auth)
│   ├── useBacklog.ts         # CRUD backlog (com auth)
│   ├── useGraph.ts           # Dados do grafo (com auth)
│   └── useTags.ts            # CRUD tags (com auth)
└── lib/
    ├── supabase/
    │   ├── client.ts         # Browser client
    │   ├── server.ts         # Server client
    │   └── middleware.ts     # Auth refresh
    ├── supabase.ts           # Cliente legado (compatibilidade)
    └── mock-data.ts          # Dados estáticos (66 livros)
middleware.ts                 # Proteção de rotas Next.js
```

---

## 📖 DADOS BÍBLICOS

### 66 Livros Organizados por Categoria:

| Categoria | Livros | Cor |
|-----------|--------|-----|
| Pentateuco | Gênesis, Êxodo, Levítico, Números, Deuteronômio | Verde |
| Históricos | Josué, Juízes, Rute, 1-2 Samuel, 1-2 Reis, 1-2 Crônicas, Esdras, Neemias, Ester | Âmbar |
| Poéticos | Jó, Salmos, Provérbios, Eclesiastes, Cantares | Roxo |
| Profetas Maiores | Isaías, Jeremias, Lamentações, Ezequiel, Daniel | Vermelho |
| Profetas Menores | Oséias, Joel, Amós, Obadias, Jonas, Miquéias, Naum, Habacuque, Sofonias, Ageu, Zacarias, Malaquias | Rosa |
| Evangelhos | Mateus, Marcos, Lucas, João | Azul |
| Histórico NT | Atos | Ciano |
| Cartas Paulinas | Romanos, 1-2 Coríntios, Gálatas, Efésios, Filipenses, Colossenses, 1-2 Tessalonicenses, 1-2 Timóteo, Tito, Filemom | Índigo |
| Cartas Gerais | Hebreus, Tiago, 1-2 Pedro, 1-3 João, Judas | Teal |
| Apocalíptico | Apocalipse | Laranja |

---

## 📐 CONVENÇÕES DE CÓDIGO

### Naming:
- **Variáveis/funções**: camelCase
- **Componentes**: PascalCase
- **Database**: snake_case + prefixo `bible_`
- **Rotas**: kebab-case (`/estudo/[id]`)

### Comentários:
- **Código**: Português
- **Commits**: Português + Conventional Commits (`feat:`, `fix:`, `refactor:`)

---

## 🔄 ROTAS DA APLICAÇÃO

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard com grid de 66 livros |
| `/login` | Login/Signup com Nome Completo |
| `/estudo/[id]` | Editor de estudo (id = `{bookId}-{chapter}`, ex: `gen-1`) |
| `/grafo` | Visualização do grafo de conexões |
| `/settings` | Configurações e Gestão de Conta |

---

## 🎨 FEATURES IMPLEMENTADAS

### Dashboard
- Grid de livros organizados por categoria
- Barra de busca e filtro por tags
- Visualização de capítulos ao clicar em um livro
- Painel de backlog lateral

### Editor de Estudo
- Tiptap Editor com formatação rica
- Bubble Menu (seleção de texto)
- Slash Menu (comandos `/`)
- Auto-save a cada 30 segundos
- Proteção contra perda de dados (modal de confirmação)
- Breadcrumbs de navegação

### Grafo (Segundo Cérebro)
- Visualização force-directed dos estudos
- Nodes coloridos por categoria bíblica
- Zoom in/out e centralizar
- Click em node → navega para estudo
- Legenda de categorias
- Hover info com detalhes

### Autenticação e Perfis
- Login/Signup com email e senha
- Campo Nome Completo no signup
- Perfil automático via trigger
- Sistema de roles (free/admin)
- Sidebar com nome do usuário e badge de role
- Proteção de rotas via middleware

### Configurações (/settings)
- Edição de nome e email
- Alteração de senha
- Logout da conta
- Exclusão de conta (com confirmação)
- Badge de role (Admin/Free)

---

## ⚠️ PADRÃO AUTHLOADING NOS HOOKS

**CRÍTICO**: Todos os hooks que dependem de autenticação DEVEM seguir este padrão para evitar loading infinito:

```typescript
export function useMyHook() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // 1. Se auth ainda está carregando, aguardar
    if (authLoading) return;

    // 2. Se não tem usuário após auth carregar, parar loading
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // 3. Fetch normal
    try {
      setLoading(true);
      // ... fetch logic
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading]); // 4. Incluir authLoading nas deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading };
}
```

**Hooks que seguem este padrão**:
- `useStudies.ts`
- `useBacklog.ts`
- `useGraph.ts`
- `useTags.ts`

---

## 📝 PRÓXIMOS PASSOS (Roadmap)

1. [x] ~~Integração com Supabase (persistência real)~~ ✅
2. [x] ~~Autenticação de usuários~~ ✅
3. [x] ~~Sistema de perfis e gestão de conta~~ ✅
4. [ ] Criação de links entre estudos
5. [ ] Busca full-text nos estudos
6. [ ] Tags e categorização manual
7. [ ] Exportação (PDF, Markdown)
8. [ ] Modo offline (PWA)

---

**Última atualização**: 2026-01-25
**Versão**: 2.1.0 (Profiles + Settings)
**Projeto**: Bible Study (Segundo Cérebro)
**Stack Core**: Next.js 15 + React 18 + TypeScript + TailwindCSS + Tiptap + react-force-graph-2d
