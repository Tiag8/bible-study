# EPIC 8.3 — Tipografia e Hierarquia Visual dos Nodes

> **Status**: Concluido
> **Fase**: 2 (Polish)
> **Prioridade**: P0
> **Pre-requisito**: EPIC 8.2 concluido
> **Agente**: @dev
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Labels legiveis, hierarquia tipografica clara e diferenciacao visual de nodes por status.

---

## Problema Atual

- Font fixa `Inter, sans-serif` em 12px no canvas (sem hierarquia)
- Tamanho de fonte nao escala com zoom
- Labels sobrepostos em grafos densos (50+ nodes)
- Nodes diferenciados apenas por tamanho (5px vs 8px) - dificil distinguir status
- Sem uso da font Lora (serif) do design system Parchment

---

## Tasks

- [x] Implementar `font-lora` (serif) para titulos de nodes no canvas
- [x] Usar `font-inter` para metadados (capitulo, categoria) via `TYPOGRAPHY` tokens
- [x] Escalar tamanho de fonte dinamicamente com zoom level (`globalScale`)
- [x] Implementar collision detection ou truncamento inteligente para labels
- [x] Diferenciar nodes por status visualmente: cor de borda, forma, ou icone (nao so tamanho)
- [x] Pre-carregar fontes Lora no canvas (Canvas API requer fonts ja carregadas)

---

## Criterio de Aceite

- [x] Labels legiveis em todos os niveis de zoom (0.3x a 3x)
- [x] Sem sobreposicao de labels em grafo com 50+ nodes (truncamento com ellipsis)
- [x] Status visualmente distinguivel sem precisar hover (bordas diferenciadas por status)
- [x] Fontes Lora e Inter carregadas corretamente no canvas (`document.fonts.ready`)

---

## Implementacao

- `CANVAS_FONTS` constants: Lora para titulos, Inter para metadados
- `NODE_STATUS_STYLE` config: border width/dash patterns por status (estudar=pontilhado, estudando=fino, revisando=tracejado, concluido=grosso+anel)
- Font scaling dinamico com `globalScale` (clamped min/max)
- `measureText` + truncamento com ellipsis para evitar sobreposicao
- Two-level label hierarchy: titulo (Lora) + livro/capitulo (Inter) em zoom alto
- Status legend no painel de legenda com indicadores visuais

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Canvas rendering: fontes, labels, node shapes, status legend |
| `src/hooks/useGraph.ts` | Adicionado campo `status` ao `GraphNode` interface |

---

**Ultima atualizacao**: 2026-01-31
