# EPIC 7.1 — Redesenho do Backlog: Quadro de Estudos

> **Status**: Implementado
> **Data**: 2026-01-31
> **Agentes**: @pm (Morgan), @architect (Aria), @aios-master (Orion)

---

## Epic Goal

Substituir o sistema de backlog dual (`bible_backlog` + `bible_studies`) por um quadro visual unificado que reflete todos os estudos do usuário em tempo real, com filtros e ordenação, usando apenas a tabela `bible_studies`.

---

## Contexto do Sistema Existente

- **Stack**: Next.js 15, React 19, TypeScript, Supabase, TailwindCSS
- **Tabelas impactadas**: `bible_studies` (manter), `bible_backlog` (deprecar)
- **Componentes impactados**: BacklogPanel, BacklogAddStudyModal, useBacklog, useStudies, SlashMenu
- **Padrões existentes**: auth via `useAuth()`, RLS por `user_id`, design tokens Parchment, StatusBadge component

### O que muda vs. hoje

| Aspecto | Antes | Depois |
|---|---|---|
| Tabela | `bible_backlog` + `bible_studies` | Só `bible_studies` |
| Fonte de dados | Hook separado `useBacklog` | Direto do `useStudies` |
| Status "futuro" | Item em `bible_backlog` sem estudo | Estudo com status `estudar` |
| Filtros | Nenhum | Status + Livro |
| Ordenação | Fixo (created_at DESC) | Toggle ASC/DESC |
| Datas no card | Só created_at | created_at + updated_at ou completed_at |
| Reatividade | Parcial (só backlog) | Total (qualquer estudo aparece) |

---

## Stories

### Story 7.1.1: Migration de Dados — Unificar backlog em bible_studies

- [x] **Concluída**

**User Story**: Como sistema, quero migrar todos os items de `bible_backlog` para `bible_studies`, para que exista uma única fonte de verdade.

**Acceptance Criteria**:
1. Items de `bible_backlog` COM `source_study_id` — nenhuma ação (já existem em `bible_studies`)
2. Items SEM `source_study_id` — criar estudo vazio com status `estudar`, parseando `reference_label` para `book_name` + `chapter_number`
3. Migration é idempotente (rodar 2x não duplica)
4. Após migration, validar contagem: todos items de backlog têm correspondência em studies
5. Tabela `bible_backlog` permanece no banco (sem DROP), mas sem referências no código

**Technical Notes**:
- Parse de `reference_label` contra lista de 66 livros em `mock-data.ts`
- Fallback para chapter 1 se parse falhar
- Migration file: `supabase/migrations/XXXX_migrate_backlog_to_studies.sql`

**Predicted Agents**: @dev, @data-engineer
**Quality Gates**: Pre-Commit (validar SQL), Pre-PR (testar migration com dados reais)

---

### Story 7.1.2: Estender useStudies com filtros e ordenação

- [x] **Concluída**

**User Story**: Como desenvolvedor, quero que o hook `useStudies` suporte filtros por status e livro e ordenação por data, para alimentar o novo quadro.

**Acceptance Criteria**:
1. `useStudies` expõe funções de filtro client-side:
   - `filterByStatus(status: StudyStatus): StudySummary[]`
   - `filterByBook(bookName: string): StudySummary[]`
   - Composição de filtros (status + livro simultaneamente)
2. `useStudies` expõe ordenação:
   - `sortBy(field: 'created_at' | 'updated_at', direction: 'asc' | 'desc')`
3. Remover `useBacklog.ts` completamente
4. Remover todos os imports de `useBacklog` no codebase
5. Todos os hooks existentes continuam funcionando (sem regressão)

**Technical Notes**:
- Filtros operam sobre o array `studies` já carregado (sem queries adicionais)
- Usar `useMemo` para memoizar resultados filtrados
- Manter a interface do `useStudies` backward-compatible

**Predicted Agents**: @dev
**Quality Gates**: Pre-Commit (lint, type-check)

---

### Story 7.1.3: Redesenhar BacklogPanel como Quadro de Estudos

- [x] **Concluída**

**User Story**: Como usuário, quero ver todos meus estudos no painel lateral com filtros por status e livro e ordenação por data, para acompanhar meu progresso de estudo.

**Acceptance Criteria**:
1. BacklogPanel usa `useStudies()` em vez de `useBacklog()`
2. Header mostra controles:
   - Select/dropdown de status (todos, estudar, estudando, revisando, concluído)
   - Select/dropdown de livro (todos + lista de livros com estudos)
   - Toggle de ordenação (crescente/decrescente por data)
3. Card de estudo mostra:
   - `StatusBadge` com status atual
   - Título do estudo (ex: "Gênesis 1")
   - Datas: `created_at` + `updated_at` (se não concluído) OU `created_at` + `completed_at` (se concluído)
4. Click no card navega para `/estudo/[id]`
5. Botão "Adicionar Estudo" cria estudo com status `estudar` via `createStudy()` (sem `addToBacklog`)
6. Reusa código visual do card atual (Parchment tokens, StatusBadge)
7. BacklogAddStudyModal simplificado (remove referências a `useBacklog`)

**Technical Notes**:
- Manter layout sidebar fixo w-80
- Reutilizar StatusBadge de `src/components/ui/status-badge.tsx`
- Simplificar BacklogAddStudyModal para chamar apenas `createStudy()`

**Predicted Agents**: @dev, @ux-design-expert
**Quality Gates**: Pre-Commit (lint, build), Pre-PR (visual review)

---

### Story 7.1.4: Fix SlashMenu — integrar com createStudy

- [x] **Concluída**

**User Story**: Como usuário, quero que a opção "Adicionar ao Backlog" no editor crie um estudo real com status `estudar`, para que ele apareça no quadro.

**Acceptance Criteria**:
1. Opção "Adicionar ao Backlog" no SlashMenu chama `createStudy()` com status `estudar`
2. Mantém inserção visual `📖 [Backlog: ...]` no editor
3. Remove TODO existente (linha 207)
4. Remove qualquer referência a `useBacklog` no SlashMenu

**Predicted Agents**: @dev
**Quality Gates**: Pre-Commit (lint, build)

---

## Compatibilidade e Riscos

| Risco | Mitigação |
|---|---|
| Parse de `reference_label` falha | Fallback robusto (chapter=1, nome literal) |
| Dados duplicados na migration | Query idempotente com check de existência |
| Regressão no dashboard | Stories 2-4 mantêm interfaces backward-compatible |

**Rollback**: Manter `bible_backlog` intacta no banco. Se necessário reverter, restaurar imports e hook.

---

## Ordem de Execução

```
Story 7.1.1 (migration)
    └── Story 7.1.2 (hook)
            ├── Story 7.1.3 (UI) ──── paralelas
            └── Story 7.1.4 (SlashMenu)
```

---

## Arquivos Impactados (6)

| Arquivo | Ação |
|---|---|
| `supabase/migrations/XXXX_migrate_backlog_to_studies.sql` | **Novo** — migration de dados |
| `src/hooks/useStudies.ts` | **Editar** — adicionar filtros/ordenação |
| `src/hooks/useBacklog.ts` | **Deletar** |
| `src/components/dashboard/BacklogPanel.tsx` | **Editar** — redesenho completo |
| `src/components/dashboard/BacklogAddStudyModal.tsx` | **Editar** — simplificar |
| `src/components/Editor/SlashMenu.tsx` | **Editar** — fix TODO |

---

## Definition of Done

- [x] Todos os estudos aparecem no quadro (independente de onde foram criados)
- [x] Filtros por status e livro funcionam corretamente
- [x] Ordenação crescente/decrescente por data funciona
- [x] Cards mostram datas corretas (created+updated OU created+completed)
- [x] Click no card navega para editor
- [x] `bible_backlog` sem referências no código
- [x] `npm run build` passa sem erros
- [ ] Nenhuma regressão nas features existentes
