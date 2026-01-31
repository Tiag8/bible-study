# EPIC 8 — Redesign Completo do Grafo (Overview)

> **Status**: Planejado
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

| Epic | Nome | Prioridade | Pre-requisito | Arquivo |
|------|------|-----------|---------------|---------|
| **8.1** | Type Safety e Integridade de Dados | P0 (Blocker) | Nenhum | [EPIC-8.1](EPIC-8.1-type-safety.md) |
| **8.2** | Migrar Grafo para Parchment Theme | P0 | 8.1 concluido | [EPIC-8.2](EPIC-8.2-parchment-theme.md) |
| **8.3** | Tipografia e Hierarquia Visual | P0 | 8.2 concluido | [EPIC-8.3](EPIC-8.3-tipografia.md) |
| **8.4** | Legenda e Controles Redesenhados | P0 | 8.2 concluido | [EPIC-8.4](EPIC-8.4-legenda-controles.md) |
| **8.5** | UI de Gestao de Links | P1 | 8.2 concluido | [EPIC-8.5](EPIC-8.5-gestao-links.md) |
| **8.6** | Busca, Filtro e Integracoes | P1 | 8.4 concluido | [EPIC-8.6](EPIC-8.6-busca-filtro.md) |
| **8.7** | Mobile e Responsividade | P2 | 8.4 concluido | [EPIC-8.7](EPIC-8.7-mobile.md) |

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

| Metrica | Antes | Target |
|---------|-------|--------|
| Cores hardcoded | 12+ | 0 |
| `any` casts | 5+ | 0 |
| Lighthouse Accessibility | ~60 | >= 90 |
| Touch targets >= 44px | 0% | 100% |
| Contraste WCAG AA | Parcial | 100% |
| Links criados via grafo | 0 (sem UI) | Possivel |
| Busca no grafo | Inexistente | Funcional |

---

## Decisoes em Aberto

1. **Theme do grafo**: Manter dark mode (harmonizado com Parchment) ou migrar para light mode como o resto do app?
2. **Biblioteca de grafo**: Manter `react-force-graph-2d` ou avaliar alternativa com melhor tipagem TypeScript?
3. **Escopo de tags no grafo**: Mostrar como cor do node, badge, ou layer separada?

---

**Ultima atualizacao**: 2026-01-31
