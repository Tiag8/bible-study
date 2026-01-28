# QA & Testing Documentation

Documentação completa de QA, testes e qualidade para o projeto Bible Study.

---

## 📋 Documentos

### 1. QA-REPORT-INTERNAL-LINKS-FEATURE.md (CRITICAL)

**Escopo**: Análise post-mortem da feature "Links Internos" que foi mergeada sem testes

**Conteúdo**:
- ✅ Análise do bug crítico (links não navigáveis)
- ✅ Testes que faltaram (17 unit + 5 E2E + manuais)
- ✅ Regressões potenciais (links externos, deeplinks, mobile)
- ✅ Fixes recomendados (P0, P1, P2)
- ✅ Métricas de qualidade

**Ler quando**: Receber bug em produção ou análise de falha de QA

---

### 2. TEST-PLAN-INTERNAL-LINKS.md (EXECUTÁVEL)

**Escopo**: Plano de teste detalhado para a feature (manual + automatizado)

**Conteúdo**:
- ✅ 12 Test Cases manuais (TC 1.1 - 1.12)
- ✅ Unit Tests code (6 testes)
- ✅ Integration Tests code (1 fluxo completo)
- ✅ E2E Tests code (Playwright, 5 cenários)
- ✅ Security Tests (RLS validation)
- ✅ Accessibility Tests (WCAG AA)
- ✅ Performance Tests (baseline)

**Como usar**:
```bash
# Copiar test cases no Jira/Trello
# Executar manuais primeiro (TC 1.1 - 1.12)
# Implementar testes automatizados

# Unit tests
npm run test -- src/components/Editor/BubbleMenu/useBubbleMenuHandlers.test.ts

# E2E tests
npx playwright test e2e/internal-links.spec.ts
```

---

### 3. DEFINITION-OF-DONE.md (FRAMEWORK)

**Escopo**: Checklist de completude para TODA feature antes de merge

**Conteúdo**:
- ✅ Tier 1: Must Have (Blocking) - 8 itens
- ✅ Tier 2: Should Have (Review Focus) - 8 itens
- ✅ Tier 3: Nice to Have - 5 itens
- ✅ Pre-Merge Checklist (para developer)
- ✅ Code Review Checklist (para reviewer)
- ✅ GitHub Branch Protection Rules setup
- ✅ Success metrics

**Como usar**:
1. Adicionar template à PR (`.github/pull_request_template.md`)
2. Developer completa antes de criar PR
3. Reviewer valida antes de aprovar
4. CI/CD bloqueia merge se falhar

---

## 🚨 Status Atual

| Item | Status | Descrição |
|------|--------|-----------|
| Unit tests | 🔴 0% | Nenhum teste para handlers, components |
| E2E tests | 🔴 0% | Nenhum teste para navegação |
| Manual testing | 🔴 0% | Feature não testada antes do merge |
| QA process | 🔴 Ausente | Nenhum QA validou feature |
| Code review | ⚠️ Incompleto | Revisão não detectou falta de handlers |

---

## 🎯 Próximos Passos

### Immediate (Today)
1. [ ] Fix P0: Implementar click handler para links internos
2. [ ] Manual test: Executar Test Cases 1.1 - 1.12
3. [ ] Criar PR com fix + test results

### This Sprint
4. [ ] Setup Vitest + Testing Library config
5. [ ] Implementar 17 unit tests (Part 2 do TEST-PLAN)
6. [ ] Setup Playwright E2E + 5 testes
7. [ ] Configurar CI/CD para bloquear merge se testes falharem
8. [ ] Adicionar PR template com Definition of Done

### Next Sprint
9. [ ] 80% test coverage target (todos arquivos)
10. [ ] Treinar team em testing practices
11. [ ] Code review training (2-person review obrigatório)
12. [ ] Implementar mutations testing

### Long-term
13. [ ] TDD workflow (testes antes de código)
14. [ ] Visual regression testing (screenshots)
15. [ ] Performance monitoring (Sentry, analytics)
16. [ ] Accessibility audit framework

---

## 📊 Matriz de Cobertura

### Testes que Faltaram

```
FEATURE: Links Internos
├── Unit Tests (0/17)
│   ├── useBubbleMenuHandlers.setReference() ❌
│   ├── useBubbleMenuHandlers.setLink() ❌
│   ├── parseContent() preserves links ❌
│   └── 14 mais...
├── Integration Tests (0/1)
│   └── Create → Save → Load → Navigate ❌
├── E2E Tests (0/5)
│   ├── Happy path navigation ❌
│   ├── Multiple links ❌
│   ├── Link persistence ❌
│   ├── Deleted target handling ❌
│   └── Visual differentiation ❌
├── Manual Tests (0/12)
│   ├── TC 1.1: Link creation ❌
│   ├── TC 1.2: Link navigation ❌
│   └── 10 mais...
└── Security Tests (0/3)
    ├── RLS enforcement ❌
    ├── Cross-user access ❌
    └── Link deletion handling ❌
```

**Total**: 0/38 testes executados

---

## 🔍 Exemplo: Como Usar para Outra Feature

### Scenario: Você vai implementar feature "Tags on Studies"

**Dia 1 - Planning**
1. Ler `DEFINITION-OF-DONE.md` (10 min)
2. Criar Test Plan similar a `TEST-PLAN-INTERNAL-LINKS.md` (2h)
3. Definir Acceptance Criteria

**Dia 2-4 - Development**
4. Escrever testes ANTES (TDD)
5. Implementar código até testes passarem
6. Cumprir Definition of Done checklist

**Dia 5 - Review**
7. Executar pre-merge checklist (30 min)
8. Criar PR com checklist preenchida
9. Code reviewer valida com Code Review Checklist
10. Merge quando tudo PASS

**Tempo**: ~5 dias vs riscos

---

## 📚 Estrutura de Arquivos

```
docs/qa/
├── README.md (este arquivo)
├── QA-REPORT-INTERNAL-LINKS-FEATURE.md
├── TEST-PLAN-INTERNAL-LINKS.md
├── DEFINITION-OF-DONE.md
└── (próximos arquivos)
    ├── TEST-PLAN-TEMPLATE.md (para copiar)
    ├── MANUAL-TEST-RESULTS-TEMPLATE.csv
    ├── TEST-SCRIPTS/
    │   ├── unit-tests-template.test.ts
    │   ├── e2e-tests-template.spec.ts
    │   └── security-tests.sql
    └── METRICS/
        ├── test-coverage-baseline.json
        └── bug-postmortem-log.md
```

---

## 🛠️ Tools & Setup

### Unit Testing: Vitest

```bash
# Install
npm install -D vitest @testing-library/react @testing-library/user-event

# Run
npm run test
npm run test -- --watch
npm run test:coverage
```

**Docs**: https://vitest.dev/

### E2E Testing: Playwright

```bash
# Install
npm install -D @playwright/test

# Run
npx playwright test
npx playwright test --debug
npx playwright show-trace trace.zip
```

**Docs**: https://playwright.dev/

### Coverage Target

- **Unit/Integration**: 60% minimum (can add later)
- **Critical paths**: 100% (before merge)
- **Overall target**: 70%+

---

## 🚀 Quick Reference

### Before Creating PR

```bash
# Pre-merge checklist
npm run lint         # ✅ ESLint
npm run build        # ✅ TypeScript
npm run test         # ✅ Unit tests
npm run test:e2e     # ✅ E2E tests
npm run test:coverage # ✅ Coverage report

# All must PASS ✅ before push
```

### Code Review Focus

```
1. Does it work? (Manual test first)
2. Is it tested? (Unit + E2E coverage)
3. Is it secure? (Auth, RLS, secrets)
4. Is it performant? (No N+1 queries, memory leaks)
5. Is it accessible? (WCAG AA)
6. Is it documented? (Code comments, README)
```

### Definition of Done Tiers

```
Tier 1 (BLOCKING):
✅ Feature complete
✅ Tests written
✅ Linting passes
✅ Security validated

Tier 2 (REVIEW):
✅ 60% test coverage
✅ Edge cases handled
✅ Mobile responsive
✅ WCAG AA compliant

Tier 3 (BONUS):
✅ Analytics added
✅ Storybook stories
✅ Performance logged
```

---

## 📝 Checklist para Time

### For Developers
- [ ] Li Definition of Done? (`docs/qa/DEFINITION-OF-DONE.md`)
- [ ] Criei testes para critical path?
- [ ] Executei pre-merge checklist?
- [ ] Adicionei comentários de código?
- [ ] Testei em mobile?

### For Reviewers
- [ ] Feature atende requirements?
- [ ] Testes existem e passam?
- [ ] Code review checklist atendido?
- [ ] Segurança validada (RLS, secrets)?
- [ ] Acessibilidade OK (WCAG AA)?

### For QA
- [ ] Test plan criado?
- [ ] Cenários manuais executados?
- [ ] Bugs documentados com screenshots?
- [ ] Regressões testadas?
- [ ] Sign-off de qualidade?

---

## 📞 Support

**Dúvidas sobre**:
- ❓ Vitest → `docs/qa/TEST-PLAN-INTERNAL-LINKS.md` Part 2
- ❓ Playwright → `docs/qa/TEST-PLAN-INTERNAL-LINKS.md` Part 4
- ❓ Definition of Done → `docs/qa/DEFINITION-OF-DONE.md`
- ❓ Bug no teste → Abrir issue com `[QA]` prefix

---

## 🎓 Learning Resources

**Internal**:
- Test strategy: `DEFINITION-OF-DONE.md` → Tier 2
- Test examples: `TEST-PLAN-INTERNAL-LINKS.md` → Parts 2-4

**External**:
- Testing Library Best Practices: https://testing-library.com/
- Playwright Tutorial: https://learn.microsoft.com/en-us/playwright/
- WCAG 2.1 Checklist: https://www.w3.org/WAI/WCAG21/checklist/
- OWASP Security: https://owasp.org/www-project-top-ten/

---

## 📊 Metrics Dashboard (TBD)

Próximo passo: Criar dashboard em Notion/Grafana com:
- Test coverage trend
- Bug trend (open/closed)
- Mean time to fix (MTTR)
- Release quality metrics
- Revert rate

---

**Último update**: 2026-01-27
**Versão**: 1.0 (WIP)
**Maintainer**: QA Team
