# EPIC 8.3 — Tipografia e Hierarquia Visual dos Nodes

> **Status**: Planejado
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

- [ ] Implementar `font-lora` (serif) para titulos de nodes no canvas
- [ ] Usar `font-inter` para metadados (capitulo, categoria) via `TYPOGRAPHY` tokens
- [ ] Escalar tamanho de fonte dinamicamente com zoom level (`globalScale`)
- [ ] Implementar collision detection ou truncamento inteligente para labels
- [ ] Diferenciar nodes por status visualmente: cor de borda, forma, ou icone (nao so tamanho)
- [ ] Pre-carregar fontes Lora no canvas (Canvas API requer fonts ja carregadas)

---

## Criterio de Aceite

- [ ] Labels legiveis em todos os niveis de zoom (0.3x a 3x)
- [ ] Sem sobreposicao de labels em grafo com 50+ nodes
- [ ] Status visualmente distinguivel sem precisar hover
- [ ] Fontes Lora e Inter carregadas corretamente no canvas

---

## Nota Tecnica

`react-force-graph-2d` usa Canvas API para renderizacao. Fontes customizadas (Lora) precisam estar carregadas via `document.fonts.ready` ou `@font-face` antes do primeiro render do canvas. Caso contrario, o canvas usa fallback serif generico.

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Canvas rendering: fontes, labels, node shapes |
| `src/app/layout.tsx` | Garantir preload de Lora para canvas |

---

**Ultima atualizacao**: 2026-01-31
