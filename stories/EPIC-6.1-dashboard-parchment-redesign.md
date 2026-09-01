# EPIC 6.1: Dashboard Redesign - Estetica Parchment

**Status**: Done
**Priority**: Alta
**Assignee**: @dev
**Arch Review**: @architect (pendente)
**PM**: @pm (Morgan)
**UX**: @ux-design-expert (Uma)

---

## CONTEXTO

### Visao Geral
Redesign visual completo do Dashboard do Bible Study, substituindo a estetica cinza generica por uma identidade visual "Parchment" (pergaminho) - tons quentes de bege, tipografia serif/sans-serif refinada, e micro-interacoes sutis. O objetivo e criar uma experiencia de leitura premium que remeta a livros e manuscritos, mantendo minimalismo profissional.

### Documentos de Referencia
- Brief: `docs/brief-dashboard-redesign.md`
- Estudo de Design: `docs/design-study-parchment.md`

### Usuario-alvo
Estudioso biblico que:
- Passa 30-60min em sessoes de estudo
- Valoriza conforto visual para leitura prolongada
- Espera uma interface que respeite o conteudo (nao generica)
- Primeiros amigos convidados (friend launch fev/2026)

### Valor de Negocio
- Primeira impressao premium para novos usuarios
- Identidade visual unica e memoravel
- Conforto visual que incentiva sessoes mais longas
- Preparacao para friend launch

---

## DECISOES DE DESIGN (Confirmadas)

### Paleta de Cores
| Token | Hex | Uso |
|-------|-----|-----|
| bg-parchment | #FAF6F0 | Background principal |
| bg-cream | #F5F0E8 | Cards, superficies elevadas |
| bg-ivory | #FFFEF9 | Sidebar |
| bg-warm-white | #FEFCF8 | Inputs, TopBar |
| border-linen | #EDE8E0 | Bordas, separadores |
| text-primary | #272626 | Corpo de texto |
| text-espresso | #3C2415 | Titulos (Lora Bold) |
| text-walnut | #5C4033 | Subtitulos |
| text-stone | #7A6F64 | Texto secundario |
| text-sand | #A69B8D | Placeholders, muted |
| accent-amber | #B8860B | Acoes primarias, links |
| accent-amber-light | #F5E6C8 | Hover states |

### Tipografia
| Elemento | Fonte | Weight |
|----------|-------|--------|
| Titulos (h1, h2) | Lora | 700 Bold |
| Subtitulos (h3) | Lora | 600 SemiBold |
| Corpo, UI | Inter | 400 Regular |
| Labels, Botoes | Inter | 500-600 Medium/Semi |

### Status (Pasteis Quentes)
| Status | BG | Text |
|--------|-----|------|
| Estudando | #FFF8E7 | #92742B |
| Revisando | #F3EEF8 | #6B5B7B |
| Concluido | #EEF5EC | #4A6741 |
| Estudar | #FEF0E7 | #8B5E3C |

### Tags (Pasteis Quentes)
blue=#C5D5E4, purple=#D1C4E0, green=#C5D9C0, orange=#E8D0B3, pink=#E0C8CF, cyan=#BDD8D6, red=#DEC0B8, yellow=#E0D8B0

---

## OBJETIVOS

| Objetivo | Sucesso |
|----------|---------|
| Atualizar design tokens | Paleta parchment + fontes Lora/Inter |
| Redesenhar Sidebar | Fundo ivory, Lora no logo, nav refinada |
| Redesenhar TopBar | Busca clean, filtros com estilo quente |
| Redesenhar BookCard | Hover elevado, Lora nos titulos, progress amber |
| Redesenhar BookGrid/Dashboard | Background parchment, secoes AT/NT estilizadas |
| Zero regressoes | Todas as funcionalidades mantidas |
| Performance mantida | Lighthouse > 90 |
| Acessibilidade | WCAG AA em todos os componentes |

---

## STORIES

### Story 6.1.1: Atualizar Design Tokens + Fontes Google
**Descricao**: Atualizar `design-tokens.ts` com paleta parchment e configurar fontes Lora + Inter no layout.

**Escopo**:
- [x]Atualizar COLORS com novos tokens parchment
- [x]Atualizar TAG_COLORS com pasteis quentes
- [x]Adicionar STATUS_CONFIG com cores pasteis
- [x]Configurar Lora + Inter em `layout.tsx` (next/font/google)
- [x]Atualizar CSS variables para fontes
- [x]Atualizar BORDERS com cor linen
- [x]Atualizar SHADOWS com tons quentes (rgba sepia)

**Pontos**: 3
**Depends On**: Nenhuma (fundacao)
**Blocks**: Todas as stories seguintes

---

### Story 6.1.2: Redesign Sidebar
**Descricao**: Aplicar estetica parchment na Sidebar com fundo ivory, tipografia Lora no logo, e refinamento visual.

**Escopo**:
- [x]Background ivory (#FFFEF9) na sidebar
- [x]Logo "Bible Graph" com Lora Bold, cor espresso
- [x]Nav items com Inter, hover com bg-cream
- [x]Avatar com gradiente amber
- [x]Bordas linen (#EDE8E0)
- [x]Botao logout com tom pastel danger
- [x]Transicoes suaves (200ms)

**Pontos**: 3
**Depends On**: 6.1.1

---

### Story 6.1.3: Redesign TopBar
**Descricao**: Modernizar TopBar com busca clean e filtros na estetica quente.

**Escopo**:
- [x]Background warm-white (#FEFCF8)
- [x]Search input com bg-parchment, border linen, placeholder text-sand
- [x]Botao tags com outline amber, texto walnut
- [x]Botao grafo com estilo amber
- [x]Dropdown de tags com fundo cream, borders linen
- [x]Active tag badges em pastel quente
- [x]Border-bottom linen

**Pontos**: 3
**Depends On**: 6.1.1

---

### Story 6.1.4: Redesign BookCard
**Descricao**: Transformar BookCard com estetica premium - Lora nos titulos, progress bar amber, hover elevado.

**Escopo**:
- [x]Background cream (#F5F0E8), border linen
- [x]Hover: translate Y -2px + shadow warm md + bg-warm-white
- [x]Titulo do livro com Lora SemiBold, cor espresso
- [x]Metadata (capitulos, data) com Inter, cor stone
- [x]Progress bar com gradient amber → amber-dark
- [x]Tag badges em pasteis quentes
- [x]Badge AT/NT com estilo quente
- [x]Cards sem estudo: opacity 0.7, bg mais neutro
- [x]Transition 200ms ease para hover

**Pontos**: 5
**Depends On**: 6.1.1

---

### Story 6.1.5: Redesign BookGrid + DashboardClient (Layout)
**Descricao**: Aplicar background parchment ao layout principal e estilizar secoes AT/NT.

**Escopo**:
- [x]DashboardClient: background parchment (#FAF6F0) substituindo bg-gray-50
- [x]Titulo "Biblioteca Biblica" com Lora Bold, cor espresso
- [x]Subtitulo com Inter, cor stone
- [x]Section headers AT/NT com Lora Bold + linha decorativa amber-light
- [x]Stats com Inter, cor stone
- [x]Empty state com estilo quente
- [x]Loading spinner com cor amber
- [x]Espacamento generoso (gap 20px, padding 32px)
- [x]Secao AT/NT com separacao de 48px

**Pontos**: 3
**Depends On**: 6.1.1, 6.1.4

---

## ORDEM DE IMPLEMENTACAO

```
6.1.1 (Tokens + Fontes) ──┬──> 6.1.2 (Sidebar)
                           ├──> 6.1.3 (TopBar)
                           ├──> 6.1.4 (BookCard)
                           └──> 6.1.5 (BookGrid + Layout)
                                  └── depende de 6.1.4
```

Stories 6.1.2, 6.1.3 e 6.1.4 podem ser implementadas em paralelo apos 6.1.1.
Story 6.1.5 depende de 6.1.1 e 6.1.4 (usa BookCard redesenhado).

---

## COMPATIBILIDADE

- [x]Funcionalidades existentes nao afetadas (zero mudanca logica)
- [x]Hooks nao modificados (useStudies, useTags, useBacklog, useAuth)
- [x]Rotas nao modificadas
- [x]Database nao modificada (zero migrations)
- [x]Editor nao modificado (out of scope)
- [x]Grafo nao modificado (out of scope)
- [x]BacklogPanel nao modificado (out of scope)

## RISCOS E MITIGACAO

| Risco | Mitigacao |
|-------|----------|
| Inconsistencia com Editor/Grafo | Manter neutros compartilhados, parchment so no dashboard |
| Performance com fontes extras | next/font/google otimiza automaticamente (subset, preload) |
| Contraste insuficiente | Todos os pares validados para WCAG AA (ver design study) |
| Regressao funcional | Commits atomicos, build check a cada story |
| Fonte Lora nao renderiza bem | Fallback para Georgia (serif similar) |

## ROLLBACK

- Reverter commits das stories (atomicos por componente)
- Design tokens anteriores preservados no git history
- Zero impacto em dados ou funcionalidade

---

## OUT OF SCOPE

- Dark mode (depende deste redesign, sera Sprint futuro)
- Redesign do Editor (fase futura)
- Redesign do Grafo (fase futura)
- BacklogPanel redesign (menor prioridade)
- Calendario de estudos (feature separada)
- Animacoes complexas (Framer Motion)
- Novas funcionalidades

---

## DEFINITION OF DONE

- [x]5 componentes redesenhados com estetica parchment
- [x]Fontes Lora + Inter configuradas e aplicadas
- [x]Design tokens atualizados com paleta completa
- [x]Build e lint passando
- [x]Lighthouse > 90
- [x]WCAG AA em todos os componentes redesenhados
- [x]Zero regressoes funcionais
- [x]Testado em desktop (Chrome, Safari, Firefox)

---

## HANDOFF

**Para @architect**: Validar impacto tecnico das fontes Google, shadow tokens, e compatibilidade com design tokens existentes.

**Para @ux-design-expert**: Gerar mockups com MCP Magic usando as especificacoes deste epic + design study.

**Para @dev**: Implementar stories em ordem, commits atomicos, build check a cada story.

---

*-- Morgan, planejando o futuro*
