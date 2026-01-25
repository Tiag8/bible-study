# Claude Code - Bible Study (Segundo Cérebro)

> Aplicativo de estudo bíblico com editor rico e visualização em grafo estilo "Segundo Cérebro" (Obsidian/Roam Research).

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
│   ├── page.tsx              # Dashboard (66 livros)
│   ├── estudo/[id]/page.tsx  # Editor de estudo
│   └── grafo/page.tsx        # Visualização do grafo
├── components/
│   ├── dashboard/            # Sidebar, TopBar, BookGrid, ChapterView, BacklogPanel
│   ├── Editor/               # Tiptap Editor, BubbleMenu, SlashMenu
│   └── ui/                   # shadcn/ui components
└── lib/
    └── mock-data.ts          # Dados mockados (66 livros, estudos, links)
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
| `/estudo/[id]` | Editor de estudo (id = `{bookId}-{chapter}`, ex: `gen-1`) |
| `/grafo` | Visualização do grafo de conexões |
| `/settings` | Configurações (futuro) |

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

---

## 📝 PRÓXIMOS PASSOS (Roadmap)

1. [ ] Integração com Supabase (persistência real)
2. [ ] Autenticação de usuários
3. [ ] Criação de links entre estudos
4. [ ] Busca full-text nos estudos
5. [ ] Tags e categorização manual
6. [ ] Exportação (PDF, Markdown)
7. [ ] Modo offline (PWA)

---

**Última atualização**: 2025-01-25
**Versão**: 1.0.0
**Projeto**: Bible Study (Segundo Cérebro)
**Stack Core**: Next.js 15 + React 18 + TypeScript + TailwindCSS + Tiptap + react-force-graph-2d
