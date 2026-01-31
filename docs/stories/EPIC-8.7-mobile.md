# EPIC 8.7 — Mobile e Responsividade

> **Status**: Planejado
> **Fase**: 4 (Reach)
> **Prioridade**: P2
> **Pre-requisito**: EPIC 8.4 concluido
> **Agente**: @dev
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Grafo utilizavel em dispositivos touch (smartphones e tablets).

---

## Problema Atual

- Nodes com 5-8px de raio (impossivel clicar com dedo)
- Botoes de zoom menores que 44px (padrao minimo touch)
- Sem pinch-to-zoom ou pan gestures nativas
- Legenda ocupa espaco fixo sem adaptacao para telas pequenas
- Hover tooltip nao funciona em touch (nao existe hover)

---

## Tasks

- [ ] Aumentar raio de click/tap dos nodes (hitbox >= 20px)
- [ ] Controles de zoom maiores em mobile (48px touch targets)
- [ ] Implementar pinch-to-zoom e pan gestures
- [ ] Layout responsivo: legenda como drawer bottom em mobile
- [ ] Substituir hover info por tap-to-show info (long press ou tap)
- [ ] Testar em viewport 375px (iPhone SE) e 768px (iPad)

---

## Criterio de Aceite

- [ ] Grafo navegavel em iPhone SE (375px)
- [ ] Todos os touch targets >= 44px
- [ ] Pinch-to-zoom funcional
- [ ] Info de node acessivel via tap (sem depender de hover)

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Touch targets, gestures, responsive layout |

---

**Ultima atualizacao**: 2026-01-31
