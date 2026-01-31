# EPIC 8.6 — Busca, Filtro e Integracoes

> **Status**: Planejado
> **Fase**: 3 (Features)
> **Prioridade**: P1
> **Pre-requisito**: EPIC 8.4 concluido (legenda interativa)
> **Agente**: @dev
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Encontrar estudos no grafo e integrar dados faltantes (tags, status 'estudar').

---

## Problema Atual

- Nao existe busca no grafo (unico jeito de encontrar node eh scrollar/zoom)
- Nao existe filtro por status
- Tags dos estudos nao sao visualizadas nos nodes
- Items com status 'estudar' (ex-backlog) nao aparecem no grafo

---

## Tasks

- [ ] Barra de busca no grafo: buscar por livro, capitulo ou titulo
- [ ] Ao encontrar resultado, focalizar/centralizar no node com animacao
- [ ] Highlight do node encontrado (glow, borda, pulsacao)
- [ ] Filtros por status: estudar, estudando, revisando, concluido (toggle buttons)
- [ ] Mostrar tags como badges coloridos nos nodes ou como layer visual
- [ ] Incluir items com status 'estudar' no grafo com visual diferenciado (node tracejado, cor muted)

---

## Criterio de Aceite

- [ ] Busca encontra node e focaliza com animacao
- [ ] Filtros por status combinaveis (multiplos ativos)
- [ ] Tags visiveis nos nodes ou via hover
- [ ] Nodes 'estudar' aparecem com visual distinto

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Barra busca, filtros, tags display |
| `src/hooks/useGraph.ts` | Incluir estudos com status 'estudar', carregar tags |

---

**Ultima atualizacao**: 2026-01-31
