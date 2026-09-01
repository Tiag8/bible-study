---
id: EP01
title: Mobile/Tablet UX Refactor
status: In Progress
created: 2026-05-04
last_updated: 2026-05-04 07:24
owner: tiago
clickup_task: 868jga2hv
---

# EP01 — Mobile/Tablet UX Refactor

## Contexto

Uso real do app em tablet (2026-05-04) revelou 3 problemas P0 que invalidam a experiência:

1. **Conflito Tiptap × Chrome**: edit menu nativo do Chrome dispara junto com o BubbleMenu do Tiptap, quebra fluxo de edição.
2. **Layout não responsivo**: viewport < 1024px renderiza como desktop com zoom out — pan horizontal obrigatório.
3. **Emoji picker do editor atrapalha mais do que ajuda** — pedido explícito de remoção (BubbleMenu, SlashMenu, toolbar).

Além dos P0, usuário pediu auditoria UX/UI completa para mobile/tablet (5 telas: dashboard, editor, grafo, settings, login). O escopo do epic foi reduzido via Scope Drift Checkpoint (caminho C) para entregar valor incremental: P0 hoje + roadmap claro para P1/P2 amanhã.

## Objetivo

Tornar o app utilizável em mobile/tablet sem regressão desktop. Entregar P0 (3 fixes reportados) e gerar roadmap auditado para P1/P2.

## North Star

App utilizável em iPad e iPhone sem pan horizontal. Editor Tiptap não conflita com Chrome edit menu. Zero emoji picker no editor.

## Success Metrics

- **Leading**: 100% das 3 issues P0 resolvidas + smoke test passa em DevTools responsive (360/768/1024).
- **Lagging**: Tiago consegue criar e editar estudo no iPad sem fricção em uma sessão real (validação empírica pós-deploy).

## Stories

| Story | Título | Status | Depends_on |
|-------|--------|--------|------------|
| **EP01-S1.0** | Resolver 3 problemas P0 reportados (conflito Tiptap×Chrome, responsividade básica, remover emoji picker) | Draft | — |
| **EP01-S2.0** | Auditoria UX/UI mobile/tablet (Dashboard + Editor) — gera `docs/ux/mobile-tablet-audit.md` com P1/P2 priorizados, NÃO implementa. Grafo/Settings/Login adiados | Draft | EP01-S1.0 |

## Out of Scope (explicitamente)

- Implementação de P1/P2 (touch targets, drawer/bottom-nav, pinch-zoom no grafo, performance) — fica como roadmap em `mobile-tablet-audit.md`. Cada item vira EP02+ se priorizado depois.
- PWA / app nativo / offline-first — fora do epic.
- Redesign visual — só ajustes responsivos.

## Decisões arquiteturais

- **EP01-S1.0** entrega valor de uso imediato. Após GO do @po, vai direto para @dev.
- **EP01-S2.0** é audit-only (sem código de feature) — output é doc de findings. Cada finding vira candidato a story futura.
- Stack atual (Tailwind + shadcn/ui + Tiptap) já tem responsividade básica disponível (`md:`, `sm:` breakpoints). Não introduzir libs novas para resolver P0.
- Conflito Tiptap × Chrome edit menu: investigar `contenteditable` + `inputmode` + Tiptap `editorProps.attributes` antes de qualquer hack.

## Risks

- **R1**: Conflito Tiptap × Chrome pode não ter solução limpa client-side (depende do Chrome). Mitigação: documentar workaround mesmo que imperfeito (ex: desabilitar edit menu nativo via CSS `-webkit-user-modify`).
- **R2**: Audit pode descobrir que arquitetura responsiva atual exige refactor maior (ex: sidebar fixa não vira drawer trivialmente). Mitigação: audit é doc, não implementação — descoberta vira story EP02+.

## DoD do Epic

- [ ] Story S1.0 entregue (3 P0 resolvidos, build PASS, smoke em 360/768/1024)
- [ ] Story S2.0 entregue (`docs/ux/mobile-tablet-audit.md` com findings P1/P2)
- [ ] Time entry retroativo registrado no ClickUp 868jga2hv
- [ ] Resumo final via Skill `resumo` no comentário da task
- [ ] Status ClickUp 868jga2hv = Done
