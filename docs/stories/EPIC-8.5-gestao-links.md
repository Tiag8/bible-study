# EPIC 8.5 — UI de Gestao de Links no Grafo

> **Status**: Concluido
> **Fase**: 3 (Features)
> **Prioridade**: P1
> **Pre-requisito**: EPIC 8.2 concluido
> **Agente**: @dev
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Permitir criar, visualizar e deletar conexoes entre estudos diretamente no grafo.

---

## Tasks

- [x] Implementar right-click context menu no node: "Criar conexao", "Ver conexoes", "Ir para estudo"
- [x] Modo de criacao de link: clicar source → clicar target → cria link automaticamente
- [x] Feedback visual durante criacao: anel tracejado amber no node source + banner no header
- [x] Painel expandido para visualizar e deletar links existentes de um node selecionado
- [x] Usar `createLink()` e `deleteLink()` do useGraph (ja existem)
- [x] Toast de feedback apos criar/deletar link (sonner)

---

## Criterio de Aceite

- [x] Usuario cria link entre 2 nodes via interacao no grafo (right-click → Criar conexao → click target)
- [x] Usuario deleta link existente via painel de links (hover → icone trash)
- [x] Feedback visual claro durante todo o fluxo (anel amber, banner header, toasts)
- [x] Grafo atualiza em tempo real apos criar/deletar (state local atualizado)

---

## Implementacao

- **Context menu** (right-click): 3 opcoes - Criar conexao, Ver conexoes (com contagem), Abrir estudo
- **Link creation mode**: `linkingSource` state, click em outro node chama `createLink()`
- **Visual feedback**: anel tracejado amber no source node (Canvas), banner no header com nome e X para cancelar
- **Painel de links** (click em node): mostra lista de conexoes com cor do node conectado, botao trash em hover
- **Selected node panel**: acoes "Conectar" e "Abrir", lista de links com delete
- **Toasts**: sonner para success/error em create/delete
- Background click fecha context menu e deseleciona node

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/app/grafo/GrafoPageClient.tsx` | Context menu, link creation mode, selected node panel, canvas highlights |

---

**Ultima atualizacao**: 2026-01-31
