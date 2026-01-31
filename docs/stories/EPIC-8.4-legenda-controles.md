# EPIC 8.4 — Legenda e Controles Redesenhados

> **Status**: Concluido
> **Fase**: 2 (Polish)
> **Prioridade**: P0
> **Pre-requisito**: EPIC 8.2 concluido
> **Agente**: @dev com review de @ux-design-expert
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Legenda funcional e acessivel com design Parchment, controles touch-friendly e filtragem interativa.

---

## Tasks

- [x] Redesenhar legenda como componente colapsavel com estilo Parchment (fundo creme, bordas linen, sombra suave, tipografia Lora)
- [x] Tornar legenda interativa: clicar em categoria filtra/destaca nodes no grafo
- [x] Indicador visual de filtro ativo (categoria selecionada vs desmarcada com opacity + grayscale)
- [x] Redesenhar zoom controls com estilo Parchment e tamanho touch-friendly (44px - w-11 h-11)
- [x] Adicionar estatisticas basicas na legenda: total de estudos, total de conexoes, categorias ativas

---

## Criterio de Aceite

- [x] Legenda segue 100% design tokens Parchment
- [x] Clicar em categoria filtra nodes (mostra/oculta)
- [x] Todos os controles >= 44px (touch-friendly) - w-11 = 2.75rem = 44px
- [x] Estatisticas visiveis (estudos, conexoes)

---

## Implementacao

- `hiddenCategories` state (Set<BookCategory>) para toggle de visibilidade
- `filteredGraphData` derivado: nodes e links filtrados por categorias visíveis
- Categorias clicáveis com contagem de nodes, opacity 40% quando ocultas
- Botão "Mostrar todas" quando há filtros ativos
- Zoom controls com `w-11 h-11` (44px) e ícones `w-5 h-5`
- Estatísticas em grid 2 colunas: estudos e conexões (com "de X" quando filtrado)
- Header atualizado para mostrar contagem filtrada + indicador de categorias ocultas

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Legenda interativa, controles 44px, filtro, estatísticas |

---

**Ultima atualizacao**: 2026-01-31
