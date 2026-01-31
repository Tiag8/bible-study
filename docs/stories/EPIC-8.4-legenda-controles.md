# EPIC 8.4 — Legenda e Controles Redesenhados

> **Status**: Planejado
> **Fase**: 2 (Polish)
> **Prioridade**: P0
> **Pre-requisito**: EPIC 8.2 concluido
> **Agente**: @dev com review de @ux-design-expert
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Legenda funcional e acessivel com design Parchment, controles touch-friendly e filtragem interativa.

---

## Problema Atual

- Legenda usa `bg-gray-900/95 backdrop-blur-sm rounded-lg` generico (nao segue Parchment)
- Legenda eh apenas visual (nao interativa - nao filtra nodes)
- Zoom controls pequenos (`bg-gray-900 border-gray-200`) sem design tokens
- Botoes de controle menores que 44px (nao touch-friendly)
- Sem estatisticas do grafo visiveis

---

## Tasks

- [ ] Redesenhar legenda como componente colapsavel com estilo Parchment (fundo creme, bordas linen, sombra suave, tipografia Lora)
- [ ] Tornar legenda interativa: clicar em categoria filtra/destaca nodes no grafo
- [ ] Indicador visual de filtro ativo (categoria selecionada vs desmarcada)
- [ ] Redesenhar zoom controls com estilo Parchment e tamanho touch-friendly (min 44px)
- [ ] Adicionar estatisticas basicas na legenda: total de estudos, total de conexoes, categorias ativas

---

## Criterio de Aceite

- [ ] Legenda segue 100% design tokens Parchment
- [ ] Clicar em categoria filtra nodes (mostra/oculta)
- [ ] Todos os controles >= 44px (touch-friendly)
- [ ] Estatisticas visiveis (estudos, conexoes)

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Legenda, controles, filtro logica |

---

**Ultima atualizacao**: 2026-01-31
