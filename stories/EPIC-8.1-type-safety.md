# EPIC 8.1 — Type Safety e Integridade de Dados

> **Status**: Concluido
> **Fase**: 1 (Foundation)
> **Prioridade**: P0 (Blocker)
> **Pre-requisito**: Nenhum
> **Agente**: @dev
> **Parent**: [EPIC 8 - Grafo Redesign](EPIC-8-grafo-redesign-overview.md)

---

## Objetivo

Eliminar riscos de runtime errors por tipos desatualizados e corrigir inconsistencias entre schema real e TypeScript.

---

## Problema Atual

- `database.ts` nao reflete schema real (faltam colunas adicionadas na migration `20260128_004`)
- `target_study_id` deveria ser nullable (para links externos)
- Colunas `is_bidirectional`, `link_type`, `external_url`, `display_order` ausentes nos tipos
- `useReferences.ts` define tipos localmente (2 fontes de verdade)
- ForceGraph2D props usam `as any` (bypassa type checking)
- `useGraph.ts` nao faz cleanup de subscriptions (memory leak risk)

---

## Tasks

- [x] Atualizar `src/types/database.ts`: `target_study_id` como `string | null`, adicionar `is_bidirectional: boolean`, `link_type: 'internal' | 'external'`, `external_url: string | null`, `display_order: number`
- [x] Consolidar tipos de Reference: single source em `types/reference.ts`, importar em `useReferences.ts` (remover interface local duplicada)
- [x] Remover type casting `as any` no ForceGraph2D - usar `NodeObject` + `ForceGraphMethods` da propria lib
- [x] Adicionar cleanup de subscriptions/listeners no `useGraph.ts` (cancelled flag no useEffect)
- [x] Rodar `npm run build` e confirmar zero warnings de tipo

---

## Criterio de Aceite

- [x] Zero `any` casting em arquivos do grafo
- [x] `database.ts` reflete 100% do schema real (post-migration 20260128_004)
- [x] Uma unica fonte de verdade para tipos de Reference (`src/types/reference.ts`)
- [x] `npm run build` limpo sem erros de tipo
- [x] useEffect com cleanup function em useGraph.ts

---

## Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/types/database.ts` | Atualizar bible_study_links Row/Insert/Update |
| `src/hooks/useReferences.ts` | Remover interface local, importar de database.ts |
| `src/hooks/useGraph.ts` | Cleanup de subscriptions |
| `src/app/grafo/GrafoPageClient.tsx` | Remover `as any` casts |

---

**Ultima atualizacao**: 2026-01-31
