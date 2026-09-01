# Project Brief: Dashboard Redesign - Bible Study

**Data:** 2026-01-30
**Autor:** Atlas (Analyst Agent)
**Status:** Draft para revisão

---

## Executive Summary

Redesign visual completo do Dashboard do Bible Study (Segundo Cérebro), modernizando os componentes Sidebar, TopBar, BookGrid e BookCard para uma estética mais clean, moderna e agradável para leitura prolongada. Inspiração: Notion, Linear, Apple Books.

**Problema central:** A interface atual é funcional mas visualmente genérica — fundo cinza padrão, cards sem personalidade, sidebar convencional. Não transmite a experiência premium de um "segundo cérebro" para estudo bíblico.

**Proposta:** Elevar a qualidade visual sem alterar funcionalidades existentes. Foco em tipografia, espaçamento, hierarquia visual e micro-interações.

---

## Problem Statement

### Estado Atual
- Layout padrão `bg-gray-50` com cards brancos e borders cinza
- Sidebar funcional mas sem refinamento visual
- TopBar com busca e filtros sem destaque visual
- BookCards informativos mas sem diferenciação visual por categoria bíblica
- Grid uniforme sem hierarquia visual entre livros estudados e não estudados
- Ausência de animações/transições que deem "vida" à interface

### Impacto
- Primeira impressão fraca para novos usuários (amigos - friend launch planejado para fev/2026)
- Fadiga visual em sessões longas de estudo
- Dificuldade em localizar rapidamente livros de interesse
- Não aproveita as cores por categoria bíblica que já existem nos dados

### Por que soluções existentes não bastam
- Design tokens já existem mas são aplicados de forma conservadora
- shadcn/ui fornece a base mas precisa de customização além do default
- O sistema de cores por categoria (10 cores para Pentateuco, Históricos, Poéticos, etc.) não é aproveitado visualmente

---

## Proposed Solution

### Abordagem: Redesign Progressivo por Componente

Usar MCP Magic (21st.dev) para gerar inspiração/código de componentes modernos, adaptando ao sistema de design tokens existente. Implementar componente por componente, sem breaking changes.

### Diferenciadores do novo design
1. **Tipografia expressiva** - Títulos com mais peso, subtítulos refinados
2. **Espaçamento generoso** - Mais breathing room entre elementos
3. **Cores por categoria** - Cada grupo de livros com identidade visual própria
4. **Micro-interações** - Hover states, transições suaves, feedback visual
5. **Hierarquia clara** - Livros estudados destacados vs não estudados sutis
6. **Sidebar refinada** - Design inspirado em Linear/Notion

### O que NÃO muda
- Funcionalidades (busca, filtros, navegação, backlog)
- Estrutura de dados e hooks
- Sistema de autenticação
- Rotas da aplicação

---

## Target Users

### Segmento Primário: Estudante Bíblico Individual
- **Perfil:** Pessoa que estuda a Bíblia regularmente, 25-55 anos
- **Comportamento:** Sessões de 30-60min, geralmente manhã ou noite
- **Necessidades:** Interface que convida à leitura, fácil localização de livros, sensação de progresso
- **Pain point atual:** Interface genérica não inspira foco e concentração

### Segmento Secundário: Amigos do Criador (Friend Launch)
- **Perfil:** Primeiros usuários convidados, familiaridade variada com tecnologia
- **Necessidade:** Primeira impressão positiva, interface intuitiva sem tutorial
- **Pain point:** Interface que pareça "app de produção" e não "projeto em desenvolvimento"

---

## Goals & Success Metrics

### Objetivos de Negócio
- Aumentar percepção de qualidade do app antes do friend launch (fev/2026)
- Reduzir time-to-first-study para novos usuários
- Criar identidade visual memorável e única

### Métricas de Sucesso do Usuário
- Feedback qualitativo positivo dos primeiros amigos
- Tempo médio de sessão mantido ou aumentado
- Taxa de retorno semanal > 60%

### KPIs
- **Lighthouse Performance:** > 90 (manter performance com novo design)
- **Build size:** Aumento máximo de 5% no bundle
- **WCAG AA:** Mantido em todos os componentes redesenhados
- **Componentes migrados:** 100% dos 5 componentes-alvo

---

## MVP Scope

### Core Features (Must Have)

- **Sidebar redesenhada:** Layout minimalista inspirado em Linear, tipografia refinada, hover states suaves, avatar com gradiente
- **TopBar modernizada:** Busca com placeholder contextual, filtros com visual clean, menos ruído visual
- **BookCard premium:** Cores por categoria bíblica, barra de progresso elegante, hover com elevação suave, tipografia hierárquica
- **BookGrid com hierarquia:** Seções AT/NT com headers estilizados, grid responsivo otimizado, empty states atraentes
- **DashboardClient layout:** Background com sutil gradiente ou textura, transições entre views

### Out of Scope para MVP
- Dark mode (será Sprint 3, Story 3.3 - depende deste redesign)
- Animações complexas (Framer Motion, page transitions)
- Novo design do Editor (fase futura)
- Novo design do Grafo (fase futura)
- Componentes novos (apenas redesign dos existentes)
- Alterações no BacklogPanel (menor prioridade visual)

### Critérios de Sucesso do MVP
- 5 componentes redesenhados (Sidebar, TopBar, BookCard, BookGrid, DashboardClient)
- Zero regressões funcionais
- Build passing sem erros
- Performance mantida (Lighthouse > 90)
- Acessibilidade WCAG AA mantida

---

## Post-MVP Vision

### Phase 2 - Editor Redesign
- Aplicar mesma linguagem visual ao editor de estudo
- Redesign do ReferencesSidebar
- Bubble Menu com estética refinada

### Phase 3 - Dark Mode
- Aproveitar tokens do redesign para criar tema escuro
- Story 3.3 já planejada

### Expansão
- Design system documentado como Storybook/Pattern Library
- Componentes reutilizáveis para futuras features

---

## Technical Considerations

### Plataforma
- **Target:** Desktop-first (responsivo mobile é secondary)
- **Browsers:** Chrome, Safari, Firefox (últimas 2 versões)
- **Performance:** Lighthouse > 90 em todas as métricas

### Stack (existente, sem mudanças)
- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **Design Tokens:** `src/lib/design-tokens.ts` (será atualizado, não substituído)
- **Fonts:** Geist Sans/Mono (já configuradas)

### Arquitetura de Impacto
- **Arquivos modificados:** ~6 arquivos (5 componentes + design-tokens.ts)
- **Arquivos novos:** 0 (apenas edições)
- **Migrations:** 0 (zero impacto no DB)
- **Hooks:** 0 alterações (lógica permanece intacta)

### Estratégia de Implementação
1. Atualizar `design-tokens.ts` com novos tokens visuais se necessário
2. Redesenhar componente por componente
3. Cada componente = 1 commit atômico
4. Build + lint check após cada componente

---

## Constraints & Assumptions

### Restrições
- **Budget:** Zero (apenas tempo de desenvolvimento com AI)
- **Timeline:** Antes do friend launch (meta: primeira semana de fev/2026)
- **Recursos:** Claude Code + MCP Magic para inspiração/geração
- **Técnicas:** Manter design tokens, não adicionar novas dependências

### Premissas
- Design tokens atuais são suficientes (podem ser estendidos, não substituídos)
- shadcn/ui permite customização suficiente para o nível de redesign desejado
- Geist font é adequada para a estética desejada
- Não é necessário Framer Motion ou bibliotecas adicionais de animação
- CSS transitions/animations nativas são suficientes

---

## Risks & Open Questions

### Riscos
- **Inconsistência visual:** Redesenhar 5 componentes pode criar dissonância com componentes não redesenhados (Editor, Grafo)
  - *Mitigação:* Manter paleta neutra compartilhada, isolar mudanças drásticas aos componentes-alvo
- **Performance degradation:** Novos estilos/animações podem impactar Lighthouse
  - *Mitigação:* Testar Lighthouse após cada componente
- **Regressão funcional:** Alterar JSX pode quebrar lógica existente
  - *Mitigação:* Commits atômicos, build check a cada mudança

### Perguntas Abertas
- Usar cores da categoria bíblica no BookCard? (ex: Pentateuco = verde, Evangelhos = azul)
- Sidebar deve ter fundo colorido sutil ou manter branco/neutro?
- Manter separação AT/NT no grid ou agrupar por categoria (10 grupos)?
- Incluir stats/overview section no topo do dashboard?

### Áreas que Precisam de Pesquisa
- Referências visuais específicas de apps de leitura/estudo (Kindle, Logos Bible, YouVersion)
- Padrões de design para grids com 66+ items
- Best practices para progress visualization em apps educacionais

---

## Next Steps

### Ações Imediatas
1. **Revisar e aprovar este brief** (usuário)
2. **@pm** cria Epic + Stories com critérios de aceite detalhados
3. **@architect** analisa impacto técnico nos componentes existentes
4. **@ux-design-expert** gera wireframes/mockups com MCP Magic
5. **@dev** implementa componente por componente

### Handoff para PM
Este Project Brief fornece o contexto completo para o redesign do Dashboard do Bible Study. O próximo passo é a criação de um Epic com Stories individuais para cada componente, seguindo o padrão existente em `stories/`.

---

*— Atlas, investigando a verdade 🔎*
