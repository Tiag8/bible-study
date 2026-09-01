# EPIC 8.7 — Mobile e Responsividade

> **Status**: Concluido
> **Fase**: 4 (Reach)
> **Prioridade**: P2
> **Pre-requisito**: EPIC 8.4 concluido
> **Agente**: @dev
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Grafo utilizavel em dispositivos touch (smartphones e tablets).

---

## Tasks

- [x] Aumentar raio de click/tap dos nodes (hitbox >= 20px via nodePointerAreaPaint)
- [x] Controles de zoom maiores em mobile (48px touch targets, w-12 h-12)
- [x] Implementar pinch-to-zoom e pan gestures (nativo do react-force-graph-2d/d3-zoom)
- [x] Layout responsivo: legenda como drawer bottom em mobile
- [x] Substituir hover info por tap-to-show info (hover desabilitado em mobile, click seleciona node)
- [x] Header responsivo: 2 linhas (titulo+acoes, busca+filtros), texto oculto em mobile
- [x] Selected node panel como bottom drawer em mobile

---

## Criterio de Aceite

- [x] Grafo navegavel em iPhone SE (375px)
- [x] Todos os touch targets >= 44px (48px em mobile)
- [x] Pinch-to-zoom funcional (nativo d3-zoom)
- [x] Info de node acessivel via tap (click seleciona, hover desabilitado em mobile)

---

## Implementacao

- **isMobile** state: detecta viewport < 768px via resize listener
- **Legend defaults**: fechada em mobile, aberta em desktop
- **Header**: 2 rows - titulo+acoes (row 1), busca+filtros (row 2)
- **Zoom controls**: `w-12 h-12 md:w-11 md:h-11` (48px mobile, 44px desktop)
- **Legend panel**: bottom drawer (`bottom-0 left-0 right-0 max-h-[50vh]`) em mobile, side panel em desktop
- **Selected node panel**: bottom drawer em mobile, `bottom-6 right-6 w-72` em desktop
- **Hover info**: oculto em mobile (isMobile check), visivel em desktop
- **nodePointerAreaPaint**: hitbox minima de 20px para todos os nodes (area invisivel maior)
- **Pinch-to-zoom**: nativo do d3-zoom (react-force-graph-2d ja suporta)
- **Context menu**: funciona via long-press no mobile (nativo browser)

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Touch targets, responsive layout, hitbox, panels como drawers |

---

**Ultima atualizacao**: 2026-01-31
