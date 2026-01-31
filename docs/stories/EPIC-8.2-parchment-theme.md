# EPIC 8.2 — Migrar Grafo para Parchment Theme

> **Status**: Planejado
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

- [ ] Substituir background `#030712` por token Parchment (decidir: variante escura harmonizada OU light theme)
- [ ] Migrar cores dos nodes para paleta categorica integrada ao token system
- [ ] Substituir todos os `rgba(...)` hardcoded por referencias a tokens (`COLORS`, `PARCHMENT`, `TAG_COLORS`)
- [ ] Migrar hover info panel para usar `COLORS`, `SHADOW_CLASSES`, `BORDER_RADIUS`
- [ ] Migrar zoom controls para design tokens Parchment
- [ ] Migrar link colors e particle colors para tokens
- [ ] Validar contraste WCAG AA (4.5:1 para texto, 3:1 para elementos grandes)

---

## Criterio de Aceite

- [ ] Zero cores hardcoded (`#`, `rgba`, `rgb`) no `GrafoPageClient.tsx`
- [ ] Todos os elementos visuais usam tokens de `design-tokens.ts`
- [ ] Contraste WCAG AA em todos os textos e elementos interativos
- [ ] Visual harmonizado com Dashboard e Editor (mesmo "feeling" Parchment)

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
