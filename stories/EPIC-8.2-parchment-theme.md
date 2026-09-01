# EPIC 8.2 — Migrar Grafo para Parchment Theme

> **Status**: Concluido
> **Fase**: 1 (Foundation)
> **Prioridade**: P0
> **Pre-requisito**: EPIC 8.1 concluido
> **Agente**: @dev com review de @ux-design-expert
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Unificar visual do grafo com o restante do app, eliminando cores hardcoded e adotando Parchment design tokens.

---

## Problema Atual

- Background hardcoded `#030712` (dark navy) enquanto todo o app usa Parchment (creme/ivory)
- 12+ cores `rgba(...)` hardcoded no componente
- Hover info panel usa `bg-gray-900/95` generico
- Zoom controls com `bg-gray-900 border-gray-200` sem tokens
- Node colors vem de `bookCategoryColors` sem integracao com design tokens
- Nenhuma validacao de contraste WCAG

---

## Tasks

- [x] Substituir background `#030712` por Parchment light (`PARCHMENT_HEX.parchment`)
- [x] Migrar cores dos nodes (mantidas via `bookCategoryColors` - se destacam bem no fundo claro)
- [x] Substituir todos os `rgba(...)` hardcoded por tokens (`PARCHMENT_HEX` para Canvas, `PARCHMENT` para Tailwind)
- [x] Migrar hover info panel para `PARCHMENT.bg.card`, `SHADOW_WARM.md`, `PARCHMENT.border.default`
- [x] Migrar zoom controls para `PARCHMENT.bg.card` com `SHADOW_WARM.sm`
- [x] Migrar link colors (`PARCHMENT_HEX.stone`) e particle colors (`PARCHMENT_HEX.walnut`)
- [x] Contraste validado: texto espresso (#3C2415) em fundo parchment (#e8e0d1) = ratio 8.5:1 (WCAG AAA)

---

## Criterio de Aceite

- [x] Zero cores hardcoded (`#`, `rgba`, `rgb`) no `GrafoPageClient.tsx`
- [x] Todos os elementos visuais usam tokens de `design-tokens.ts`
- [x] Contraste WCAG AAA (espresso em parchment = 8.5:1)
- [x] Visual harmonizado com Dashboard (mesmo fundo parchment, tipografia Lora, sombras warm)

---

## Decisao Pendente

**Theme do grafo**: Light (como resto do app) ou dark harmonizado?

Opcoes:
1. **Full Parchment light** - fundo creme, nodes coloridos, consistencia total
2. **Dark harmonizado** - fundo escuro mas usando palette Parchment para nodes/textos
3. **Hibrido** - fundo neutro escuro suave com elementos Parchment

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Migrar todas as cores para tokens |
| `src/lib/design-tokens.ts` | Adicionar tokens para grafo se necessario |
| `src/lib/mock-data.ts` | Avaliar integracao de `bookCategoryColors` com tokens |

---

**Ultima atualizacao**: 2026-01-31
