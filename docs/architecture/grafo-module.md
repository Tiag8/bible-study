# Arquitetura do Modulo Grafo ("Segundo Cerebro")

> **Ultima atualizacao**: 2026-01-31
> **Versao**: 1.0 (pos EPIC 8.1-8.7)
> **Responsavel**: @architect (Aria)

---

## Visao Geral

O modulo Grafo visualiza conexoes entre estudos biblicos usando um grafo force-directed (estilo Obsidian/Roam Research). Permite buscar, filtrar, criar/deletar conexoes e navegar para estudos.

### Rota

`/grafo` (protegida por auth via middleware)

---

## Arquivos e Responsabilidades

```
src/app/grafo/
  page.tsx                    # Server Component (Suspense wrapper)
  GrafoPageClient.tsx         # Client Component principal (~940 linhas)

src/hooks/
  useGraph.ts                 # Hook de dados: fetch, create, delete links (214 linhas)

src/types/
  database.ts                 # Tipos gerados: Study, StudyLink, StudyLinkInsert

src/lib/
  design-tokens.ts            # PARCHMENT, PARCHMENT_HEX, TYPOGRAPHY, SHADOW_WARM
  mock-data.ts                # bookCategoryColors, BookCategory, mockBibleBooks, getBookCategory
```

---

## Diagrama de Dependencias

```
page.tsx (Server)
  └─ GrafoPageClient.tsx (Client)
       ├─ useGraph.ts (hook)
       │    ├─ supabase client
       │    ├─ AuthContext (user)
       │    └─ types/database.ts (Study, StudyLink)
       ├─ react-force-graph-2d (dynamic import, SSR disabled)
       ├─ design-tokens.ts (PARCHMENT, PARCHMENT_HEX, TYPOGRAPHY)
       ├─ mock-data.ts (categorias, cores, livros)
       ├─ Sidebar (componente compartilhado)
       └─ sonner (toasts)
```

---

## Tipos Principais

### GraphNode (useGraph.ts)

```typescript
interface GraphNode {
  id: string;          // UUID do estudo (bible_studies.id)
  name: string;        // titulo do estudo
  book: string;        // nome do livro biblico
  chapter: number;     // numero do capitulo
  category: BookCategory; // pentateuco, evangelhos, etc (10 categorias)
  color: string;       // hex da categoria (via bookCategoryColors)
  val: number;         // tamanho do node (8 = concluido, 5 = demais)
  status: 'estudar' | 'estudando' | 'revisando' | 'concluido';
}
```

### ForceGraphNode (GrafoPageClient.tsx)

```typescript
// Combina NodeObject (da lib) com GraphNode (nosso)
type ForceGraphNode = NodeObject & GraphNode;
// NodeObject adiciona: x, y, vx, vy, fx, fy (atribuidos em runtime pelo D3)
```

### GraphLink / GraphData (useGraph.ts)

```typescript
interface GraphLink { source: string; target: string; }
interface GraphData { nodes: GraphNode[]; links: GraphLink[]; }
```

### Tipos do Supabase (database.ts)

```
bible_studies → Study (id, user_id, title, content, book_name, chapter_number, status, tags)
bible_study_links → StudyLink (id, user_id, source_study_id, target_study_id, link_type, is_bidirectional)
```

---

## Hook useGraph

**Arquivo**: `src/hooks/useGraph.ts`

### Responsabilidades

- Fetch paralelo de `bible_studies` + `bible_study_links` (filtrado por user_id)
- Transformacao de Study → GraphNode (mapeia categoria, cor, tamanho)
- CRUD de links (createLink, deleteLink) com update otimista do state local
- Deduplicacao de links (verifica existencia antes de criar)

### Retorno

```typescript
{
  graphData: GraphData,      // { nodes: GraphNode[], links: GraphLink[] }
  links: StudyLink[],        // dados raw do Supabase (para UI de gestao)
  loading: boolean,
  error: string | null,
  fetchGraphData: () => void, // refetch manual
  createLink: (sourceId, targetId) => Promise<StudyLink | null>,
  deleteLink: (linkId) => Promise<boolean>,
  getStudyLinks: (studyId) => StudyLink[],  // links de um estudo especifico
}
```

### Padrao AuthLoading

Segue o padrao obrigatorio do projeto:
1. `authLoading` check primeiro
2. Early return se `!user?.id`
3. `user?.id` e `authLoading` nas deps do useCallback

---

## GrafoPageClient - Componente Principal

**Arquivo**: `src/app/grafo/GrafoPageClient.tsx`

### Estrutura de Estado

| Estado | Tipo | Funcionalidade |
|--------|------|----------------|
| `sidebarCollapsed` | boolean | Sidebar recolhida |
| `showLegend` | boolean | Legenda visivel (default: closed mobile, open desktop) |
| `hoveredNode` | ForceGraphNode | Info no hover (desktop only) |
| `fontsReady` | boolean | Aguarda `document.fonts.ready` para Canvas |
| `hiddenCategories` | Set\<BookCategory\> | Categorias filtradas |
| `hiddenStatuses` | Set\<string\> | Status filtrados |
| `linkingSource` | ForceGraphNode | Modo de criacao de link (source node) |
| `contextMenu` | {node, x, y} | Menu de contexto (right-click) |
| `selectedNode` | ForceGraphNode | Node selecionado (mostra painel) |
| `searchQuery` | string | Busca por nome/livro/capitulo |
| `highlightedNodeId` | string | Node em destaque (amber glow, 3s) |
| `isMobile` | boolean | Viewport < 768px |

### Dados Derivados (useMemo)

| Derivado | Dependencias | O que faz |
|----------|-------------|-----------|
| `filteredGraphData` | graphData, hiddenCategories, hiddenStatuses | Filtra nodes e links por categoria + status |
| `searchResults` | searchQuery, graphData.nodes | Busca case-insensitive por nome/livro/capitulo (max 8) |
| `selectedNodeLinks` | selectedNode, getStudyLinks | Links do node selecionado |
| `stats` | graphData, filteredGraphData | Contagens (total vs filtrado) |

---

## Canvas Rendering (nodeCanvasObject)

O grafo usa `nodeCanvasObjectMode="replace"`, ou seja, nos desenhamos TUDO via Canvas API. Nao usa DOM/SVG.

### Regra Critica: Cores

- **Canvas API** requer valores hex raw → usar `PARCHMENT_HEX` (ex: `PARCHMENT_HEX.espresso`)
- **Elementos HTML** (header, legenda, paineis) → usar classes Tailwind via `PARCHMENT` (ex: `PARCHMENT.text.heading`)
- **NUNCA** usar classes Tailwind dentro de `nodeCanvasObject` ou `nodePointerAreaPaint`

### Hierarquia de Rendering por Node

```
1. Circulo principal (preenchido com cor da categoria)
2. Borda por status (dash pattern + alpha varia)
3. [Se busca ativa] Double ring amber (highlight 3s)
4. [Se linking source] Anel tracejado amber
5. [Se selecionado] Anel walnut translucido
6. [Se concluido] Anel externo translucido (cor do node)
7. [Se zoom > 0.4] Label titulo (Lora serif, truncado se necessario)
8. [Se zoom > 0.8] Label metadados (Inter sans, livro + capitulo)
```

### Fontes no Canvas

```typescript
const CANVAS_FONTS = {
  title: (size: number) => `600 ${size}px Lora, Georgia, serif`,
  meta: (size: number) => `${size}px Inter, system-ui, sans-serif`,
};
```

Usa `document.fonts.ready` para garantir que Lora esta carregada antes de renderizar. Fallback: Georgia (serif) / system-ui (sans).

### Status Visual (NODE_STATUS_STYLE)

| Status | Borda | Dash | Alpha |
|--------|-------|------|-------|
| estudar | 2px | [3,3] pontilhada | 60% |
| estudando | 1.5px | [] solida | 50% |
| revisando | 2px | [6,3] tracejada | 70% |
| concluido | 2.5px | [] solida + anel externo | 90% |

### Touch Hitbox (nodePointerAreaPaint)

```typescript
// Hitbox minima de 20px para touch-friendly
const hitboxRadius = Math.max(n.val, 20);
```

Area invisivel maior que o node visual. Essencial para mobile.

---

## Funcionalidades UI

### Busca (EPIC 8.6)

- Input no header com dropdown (max 8 resultados)
- Match case-insensitive: nome, livro, "livro capitulo"
- Ao clicar resultado: `centerAt(x, y, 600)` + `zoom(3, 600)` + highlight amber 3s

### Filtros (EPIC 8.4 + 8.6)

- **Por categoria**: click na legenda (Set-based, O(1) lookup)
- **Por status**: pills no header (estudar, estudando, revisando, concluido)
- **Combinavel**: categoria + status filtram simultaneamente
- `filteredGraphData` remove nodes E links dos nodes ocultos

### Gestao de Links (EPIC 8.5)

- **Criar**: right-click → "Criar conexao" → click outro node → toast success
- **Visualizar**: click node → painel com lista de conexoes
- **Deletar**: hover no link → icone trash → toast success
- **Feedback**: anel amber tracejado no source, banner no header durante criacao

### Context Menu (right-click)

3 opcoes: Criar conexao, Ver conexoes (com contagem), Abrir estudo

### Responsividade (EPIC 8.7)

| Elemento | Mobile (< 768px) | Desktop (>= 768px) |
|----------|-------------------|---------------------|
| Header | 2 linhas, labels ocultos | 2 linhas, labels visiveis |
| Zoom controls | 48px (w-12) | 44px (w-11) |
| Legenda | Bottom drawer (max 50vh) | Side panel (top-24 right-6 w-64) |
| Selected panel | Bottom drawer (max 50vh) | bottom-6 right-6 w-72 |
| Hover info | Desabilitado | bottom-6 right-6 |
| Node hitbox | >= 20px | >= 20px |
| Pinch-to-zoom | Nativo d3-zoom | Scroll wheel |

---

## Integracao com Design System

### Tokens Usados

| Token | Onde | Exemplo |
|-------|------|---------|
| `PARCHMENT.bg.page` | Fundo da pagina | `bg-parchment` |
| `PARCHMENT.bg.card` | Paineis, legenda | `bg-cream` |
| `PARCHMENT.text.heading` | Titulos | `text-espresso` |
| `PARCHMENT.text.muted` | Textos secundarios | `text-sand` |
| `PARCHMENT.border.default` | Bordas | `border-linen` |
| `PARCHMENT_HEX.parchment` | Canvas background | `#e8e0d1` |
| `PARCHMENT_HEX.espresso` | Canvas labels | `#3C2415` |
| `PARCHMENT_HEX.walnut` | Canvas bordas | `#5C4033` |
| `PARCHMENT_HEX.stone` | Canvas links, meta | `#7A6F64` |
| `PARCHMENT_HEX.amber` | Canvas highlights | `#B8860B` |
| `TYPOGRAPHY.families.serif` | Titulos (Lora) | `font-serif` |
| `SHADOW_WARM.md` | Elevacao paineis | CSS module |

---

## Tabelas Supabase Envolvidas

| Tabela | Uso no Grafo | RLS |
|--------|-------------|-----|
| `bible_studies` | Fonte dos nodes (SELECT por user_id) | user_id = auth.uid() |
| `bible_study_links` | Fonte dos links + CRUD | user_id = auth.uid() |

### Queries

- **Fetch**: `Promise.all([studies.select('*'), links.select('*')])` filtrado por `user_id`
- **Create link**: `insert({ user_id, source_study_id, target_study_id })`
- **Delete link**: `delete().eq('id', linkId)`

---

## Decisoes Arquiteturais (ADRs)

### ADR-1: Manter react-force-graph-2d

**Contexto**: Considerado migrar para D3 puro, vis.js, ou Cytoscape.
**Decisao**: Manter `react-force-graph-2d` (wrapper de `force-graph` + D3).
**Motivo**: Canvas performatico, tipagem resolvida com types customizados (ForceGraphNode), suporte nativo a zoom/pan/pinch.

### ADR-2: Canvas API vs DOM/SVG para nodes

**Contexto**: Poderiamos usar `nodeCanvasObjectMode="append"` e combinar DOM com Canvas.
**Decisao**: `nodeCanvasObjectMode="replace"` (100% Canvas).
**Motivo**: Performance superior com muitos nodes. Labels, bordas e highlights sao todos desenhados via Canvas API.

### ADR-3: PARCHMENT_HEX para Canvas

**Contexto**: Design tokens usam classes Tailwind (PARCHMENT), mas Canvas API precisa hex.
**Decisao**: Criar `PARCHMENT_HEX` como espelho com valores raw hex.
**Motivo**: Canvas `ctx.fillStyle` nao aceita classes CSS. Manter sincronizados evita drift visual.

### ADR-4: Dynamic import com SSR disabled

**Contexto**: `react-force-graph-2d` depende de Canvas/DOM (nao funciona no server).
**Decisao**: `dynamic(() => import("react-force-graph-2d"), { ssr: false })`.
**Motivo**: Next.js 15 App Router renderiza no server por default. Dynamic import com `ssr: false` garante client-only.

### ADR-5: State local com update otimista

**Contexto**: Refetch completo apos cada operacao CRUD vs update local.
**Decisao**: Update otimista do state local (`setLinks`, `setGraphData`) apos operacao.
**Motivo**: UX imediata sem flicker. Trade-off: possivel dessincronizacao (mitigado pelo refetch na montagem).

---

## Possibilidades de Extensao

| Feature | Onde mexer | Complexidade |
|---------|-----------|-------------|
| Realtime sync (Supabase) | useGraph.ts (adicionar subscription) | Media |
| Tags visiveis no canvas | nodeCanvasObject (adicionar badges) | Media |
| Multiplos layouts (tree, radial) | ForceGraph2D props (d3Force) | Media |
| Export como imagem | Canvas toDataURL | Baixa |
| Drag-and-drop para reposicionar | ForceGraph2D enableNodeDrag | Baixa (ja suportado) |
| Clusters/agrupamento visual | d3-force custom (forceCluster) | Alta |
| Animacao de entrada | nodeCanvasObject + transition state | Media |

---

## Nota para Agentes

- **Para modificar visual de nodes**: editar `nodeCanvasObject` em `GrafoPageClient.tsx:828-923`. Usar PARCHMENT_HEX para cores.
- **Para adicionar dados ao node**: editar `GraphNode` em `useGraph.ts:10-19` e o map em `useGraph.ts:72-84`.
- **Para adicionar filtros**: seguir pattern de `hiddenCategories`/`hiddenStatuses` (Set + toggle + filteredGraphData useMemo).
- **Para adicionar paineis/controles**: usar tokens `PARCHMENT.bg.card`, `PARCHMENT.border.default`, `SHADOW_WARM.md`. Posicionar com `absolute` + z-20.
- **Build check**: sempre rodar `npm run build` apos mudancas (Canvas issues nao aparecem no lint).
