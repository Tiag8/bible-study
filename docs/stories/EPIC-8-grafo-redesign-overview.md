# EPIC 8 — Redesign Completo do Grafo (Overview)

> **Status**: Em progresso (4/7 concluidos)
> **Data**: 2026-01-31
> **Agentes**: @pm (Morgan), @architect (Aria)
> **Origem**: Analise 360 do grafo + feedback do usuario

---

## Epic Goal

Redesenhar completamente o grafo de conexoes do Bible Study: migrar visual para Parchment theme, corrigir type safety, melhorar tipografia/contrastes/legenda, e adicionar funcionalidades de gestao de links e busca.

---

## Contexto

- **Stack**: Next.js 15, React 19, TypeScript, Supabase, TailwindCSS, react-force-graph-2d
- **Arquivos principais**: `GrafoPageClient.tsx` (331 linhas), `useGraph.ts` (196 linhas), `database.ts`
- **Problema central**: Grafo usa dark theme hardcoded (`#030712`) enquanto o resto do app migrou para Parchment
- **Schema DB**: Robusto (triggers, RPCs, bidirecional) - nao precisa de mudancas

---

## Sub-Epics e Ordem de Execucao

```
Fase 1 (Foundation):  EPIC 8.1 → EPIC 8.2
Fase 2 (Polish):      EPIC 8.3 → EPIC 8.4
Fase 3 (Features):    EPIC 8.5 → EPIC 8.6
Fase 4 (Reach):       EPIC 8.7
```

> Fase 1 eh pre-requisito para todas as demais.

| Epic | Nome | Prioridade | Pre-requisito | Arquivo | Status |
|------|------|-----------|---------------|---------|--------|
| **8.1** | Type Safety e Integridade de Dados | P0 (Blocker) | Nenhum | [EPIC-8.1](EPIC-8.1-type-safety.md) | ✅ Concluido |
| **8.2** | Migrar Grafo para Parchment Theme | P0 | 8.1 concluido | [EPIC-8.2](EPIC-8.2-parchment-theme.md) | ✅ Concluido |
| **8.3** | Tipografia e Hierarquia Visual | P0 | 8.2 concluido | [EPIC-8.3](EPIC-8.3-tipografia.md) | ✅ Concluido |
| **8.4** | Legenda e Controles Redesenhados | P0 | 8.2 concluido | [EPIC-8.4](EPIC-8.4-legenda-controles.md) | ✅ Concluido |
| **8.5** | UI de Gestao de Links | P1 | 8.2 concluido | [EPIC-8.5](EPIC-8.5-gestao-links.md) | Proximo |
| **8.6** | Busca, Filtro e Integracoes | P1 | 8.4 concluido | [EPIC-8.6](EPIC-8.6-busca-filtro.md) | Pendente |
| **8.7** | Mobile e Responsividade | P2 | 8.4 concluido | [EPIC-8.7](EPIC-8.7-mobile.md) | Pendente |

### Diagrama de Dependencias

```
EPIC 8.1 (Type Safety)
  └──→ EPIC 8.2 (Parchment Theme)
         ├──→ EPIC 8.3 (Tipografia)
         ├──→ EPIC 8.4 (Legenda/Controles)
         │      ├──→ EPIC 8.6 (Busca/Filtro)
         │      └──→ EPIC 8.7 (Mobile)
         └──→ EPIC 8.5 (Gestao Links)
```

---

## O que muda vs. hoje

| Aspecto | Antes | Depois |
|---|---|---|
| Theme | Dark hardcoded (`#030712`) | Parchment tokens |
| Cores nodes | `bookCategoryColors` direto | Design tokens integrados |
| Tipografia | `Inter 12px` fixo | Lora (titulos) + Inter (meta), dinamico com zoom |
| Legenda | `bg-gray-900/95` generica | Parchment styled, interativa |
| Controles | Botoes pequenos cinza | Parchment styled, touch-friendly (44px+) |
| Contrastes | Parcial, sem validacao | WCAG AA compliant |
| Types | `database.ts` desatualizado, `any` casts | Sincronizado, zero `any` |
| Labels | Sobrepostos em grafos densos | Collision detection/truncamento |
| Links UI | Sem UI (so API) | Context menu + modo criacao |
| Busca | Inexistente | Busca por livro/capitulo/titulo |
| Mobile | Nodes 5-8px, sem touch | Hitbox 20px+, pinch-to-zoom |

---

## Metricas de Sucesso

| Metrica | Antes | Target | Atual |
|---------|-------|--------|-------|
| Cores hardcoded | 12+ | 0 | ✅ 0 (EPIC 8.2) |
| `any` casts | 5+ | 0 | ✅ 0 (EPIC 8.1) |
| Lighthouse Accessibility | ~60 | >= 90 | Pendente |
| Touch targets >= 44px | 0% | 100% | ✅ Controles 44px (EPIC 8.4) |
| Contraste WCAG AA | Parcial | 100% | ✅ AAA 8.5:1 (EPIC 8.2) |
| Links criados via grafo | 0 (sem UI) | Possivel | Pendente (EPIC 8.5) |
| Busca no grafo | Inexistente | Funcional | Pendente (EPIC 8.6) |

---

## Decisoes Tomadas

1. ~~**Theme do grafo**~~: **Parchment light** - fundo creme, consistencia total com o app (decidido EPIC 8.2)
2. **Biblioteca de grafo**: Mantido `react-force-graph-2d` - tipagem resolvida com types customizados (EPIC 8.1)
3. **Escopo de tags no grafo**: Em aberto (planejado para EPIC 8.6)

---

**Ultima atualizacao**: 2026-01-31
