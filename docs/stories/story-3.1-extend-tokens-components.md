# Story 3.1: Estender Design Tokens para Componentes Restantes

**Story ID:** STORY-3.1
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 3
**Pontos:** 5
**Status:** 📋 READY FOR DEVELOPMENT

---

## 📋 User Story

**Como** desenvolvedor,
**Quero** que todos os componentes usem design tokens centralizados,
**Para que** tenhamos consistência visual completa em toda a aplicação.

---

## 🎯 Objetivo

Estender o uso de design tokens criados em Story 2.3 para os componentes restantes (Editor, Sidebar, TopBar, BubbleMenu, SlashMenu, CreateTagModal, Backlog, etc.), atingindo 100% de cobertura em todo o codebase.

---

## ✅ Critérios de Aceite

### Cobertura de Componentes
- [ ] Editor components (Editor/index.tsx, BubbleMenu.tsx, SlashMenu.tsx)
- [ ] Dashboard components (Sidebar, TopBar, BacklogPanel)
- [ ] Modal components (CreateTagModal, StudySelectionModal)
- [ ] Page components (page.tsx, estudo/[id]/page.tsx, login/page.tsx)
- [ ] Ui components (badge, button, input, dialog, etc.)

### Qualidade
- [ ] Zero hardcoded Tailwind color classes em arquivo .tsx
- [ ] Todos os COLORS e TAG_COLORS importados e usados
- [ ] Build passa sem erros
- [ ] TypeScript sem erros
- [ ] ESLint sem novos avisos

### Documentação
- [ ] Arquivo `COMPONENT_TOKENS_MAPPING.md` criado com mapeamento
- [ ] Cada componente tem comentário /* TOKENS */ indicando uso

---

## 📝 Tasks

- [ ] **3.1.1** Refatorar Editor components com tokens
- [ ] **3.1.2** Refatorar Dashboard components com tokens
- [ ] **3.1.3** Refatorar Modal components com tokens
- [ ] **3.1.4** Refatorar Page components com tokens
- [ ] **3.1.5** Refatorar UI base components com tokens
- [ ] **3.1.6** Validar build e tipos
- [ ] **3.1.7** Criar arquivo de mapeamento tokens
- [ ] **3.1.8** Testar visual em desktop e mobile

---

## 📊 Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| % componentes refatorados | 100% |
| Hardcoded colors | 0 |
| Build errors | 0 |
| TypeScript errors | 0 |
| New ESLint warnings | 0 |

---

## 🔗 Dependências

- ✅ Story 2.3 (Design Tokens) deve estar DONE
- Design tokens file (`src/lib/design-tokens.ts`) estável

---

## 📝 Dev Notes

**Componentes prioritários:**
1. Editor (alta visibilidade) - 2h
2. Sidebar + TopBar (dashboard) - 1.5h
3. Modal components - 1h
4. Remaining UI components - 1.5h

**Estratégia:**
- Usar find/replace para substituir padrões comuns
- Teste visual após cada grupo
- Manter compatibilidade com design atual

---

**Criado por:** @qa (Quinn) - Recomendação
**Data:** 2026-01-26
**Status:** Ready for Sprint 3
