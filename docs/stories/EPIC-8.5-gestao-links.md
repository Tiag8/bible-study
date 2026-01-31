# EPIC 8.5 — UI de Gestao de Links no Grafo

> **Status**: Planejado
> **Fase**: 3 (Features)
> **Prioridade**: P1
> **Pre-requisito**: EPIC 8.2 concluido
> **Agente**: @dev
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Permitir criar, visualizar e deletar conexoes entre estudos diretamente no grafo.

---

## Problema Atual

- `useGraph` expoe `createLink()` e `deleteLink()` mas nao existe UI para usa-los no grafo
- Links so podem ser criados/gerenciados no editor de estudo (via References sidebar)
- Grafo eh somente visualizacao (read-only)

---

## Tasks

- [ ] Implementar right-click context menu no node: "Criar conexao", "Ver conexoes", "Ir para estudo"
- [ ] Modo de criacao de link: clicar source → clicar target → dialog de confirmacao
- [ ] Feedback visual durante criacao: linha tracejada do source ate o cursor
- [ ] Painel ou tooltip expandido para visualizar e deletar links existentes de um node
- [ ] Usar `createLink()` e `deleteLink()` do useGraph (ja existem)
- [ ] Toast de feedback apos criar/deletar link

---

## Criterio de Aceite

- [ ] Usuario cria link entre 2 nodes via interacao no grafo
- [ ] Usuario deleta link existente via context menu ou painel
- [ ] Feedback visual claro durante todo o fluxo
- [ ] Grafo atualiza em tempo real apos criar/deletar

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Context menu, modo criacao, feedback visual |
| `src/hooks/useGraph.ts` | Possiveis ajustes no refetch apos mutacao |

---

**Ultima atualizacao**: 2026-01-31
