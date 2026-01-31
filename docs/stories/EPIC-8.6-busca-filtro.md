# EPIC 8.6 — Busca, Filtro e Integracoes

> **Status**: Concluido
> **Fase**: 3 (Features)
> **Prioridade**: P1
> **Pre-requisito**: EPIC 8.4 concluido (legenda interativa)
> **Agente**: @dev
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Encontrar estudos no grafo rapidamente e filtrar por status.

---

## Tasks

- [x] Barra de busca no grafo: buscar por livro, capitulo ou titulo
- [x] Ao encontrar resultado, focalizar/centralizar no node com animacao (centerAt + zoom)
- [x] Highlight do node encontrado (double ring amber, fade apos 3s)
- [x] Filtros por status: estudar, estudando, revisando, concluido (toggle pills no header)
- [x] Items com status 'estudar' ja aparecem no grafo com visual diferenciado (borda pontilhada, EPIC 8.3)
- [x] Tags visiveis no hover info e selected node panel (via categoria badge)

---

## Criterio de Aceite

- [x] Busca encontra node e focaliza com animacao (centerAt + zoom 3x)
- [x] Filtros por status combinaveis (multiplos ativos, toggle independente)
- [x] Tags/categoria visiveis nos nodes via hover e panel
- [x] Nodes 'estudar' aparecem com visual distinto (borda pontilhada desde EPIC 8.3)

---

## Implementacao

- **Search bar** no header: input com icone, dropdown de resultados (max 8), click focaliza node
- **Search results**: filtra por nome, livro, "livro capitulo" - match case-insensitive
- **Focus node**: `centerAt(x, y, 600)` + `zoom(3, 600)` com highlight amber por 3s
- **Highlight**: double ring amber no Canvas (inner solid, outer translucent)
- **Status filter pills**: toggle buttons no header para cada status com contagem
- **hiddenStatuses** state: Set<string> combinavel com hiddenCategories
- **filteredGraphData** agora filtra por categoria E status (useMemo otimizado com Set de IDs)
- Estatisticas no header e legenda refletem dados filtrados

---

## Nota sobre Tags

Tags individuais nao foram adicionadas ao canvas para evitar clutter visual. As categorias biblicas (que ja sao o agrupamento principal) servem como tag visual. Tags customizadas do usuario sao visiveis no selected node panel e hover info.

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Search bar, status filters, highlight, filteredGraphData otimizado |

---

**Ultima atualizacao**: 2026-01-31
