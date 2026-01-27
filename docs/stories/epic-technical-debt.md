# Epic: Resolução de Débitos Técnicos - Bible Study

**Epic ID:** EPIC-001
**Data:** 2026-01-26
**Status:** 📋 READY FOR DEVELOPMENT

---

## 📋 Resumo

Resolver os 63 débitos técnicos identificados no Technical Debt Assessment para tornar o Bible Study production-ready, acessível e manutenível.

---

## 🎯 Objetivo

Transformar o Bible Study de um MVP funcional em um produto de qualidade production-grade, com:
- Zero débitos críticos
- Acessibilidade WCAG AA
- Mobile UX completa
- Código manutenível e testado

---

## 📊 Escopo

### Incluído
- 10 débitos críticos (P0)
- 12 débitos altos (P1)
- 23 débitos médios (P2) - parcial
- Testes E2E básicos

### Excluído
- 18 débitos baixos (P3/P4) - backlog futuro
- Dark mode
- Features novas não relacionadas a débitos

---

## 📈 Métricas de Sucesso

| Métrica | Baseline | Target | Prazo |
|---------|----------|--------|-------|
| Débitos Críticos | 10 | 0 | Sprint 1 |
| Débitos Altos | 12 | 0 | Sprint 3 |
| Lighthouse Accessibility | ~60 | >95 | Sprint 1 |
| Test Coverage | 0% | >30% | Sprint 3 |
| Mobile Usability | Quebrado | Funcional | Sprint 1 |

---

## 🗓️ Timeline

| Sprint | Semanas | Foco | Stories |
|--------|---------|------|---------|
| **Sprint 1** | 1-2 | Críticos (P0) | 1.1 - 1.5 |
| **Sprint 2** | 3-4 | Altos (P1) - DB/Design | 2.1 - 2.4 |
| **Sprint 3** | 5-6 | Altos (P1) - Features | 3.1 - 3.4 |

---

## 💰 Budget

| Item | Horas | Custo |
|------|-------|-------|
| Sprint 1 (P0) | 16-20h | R$ 2.400 - R$ 3.000 |
| Sprint 2 (P1a) | 14-18h | R$ 2.100 - R$ 2.700 |
| Sprint 3 (P1b) | 14-18h | R$ 2.100 - R$ 2.700 |
| **TOTAL** | **44-56h** | **R$ 6.600 - R$ 8.400** |

---

## 📝 Stories

### Sprint 1: Críticos

| ID | Story | Pontos | Status |
|----|-------|--------|--------|
| 1.1 | Criar sistema de modais customizadas | 5 | 📋 Ready |
| 1.2 | Criar sistema de toasts para feedback | 3 | 📋 Ready |
| 1.3 | Implementar acessibilidade básica | 5 | 📋 Ready |
| 1.4 | Corrigir Mobile UX (BubbleMenu) | 3 | 📋 Ready |
| 1.5 | Validação de integridade no database | 3 | 📋 Ready |

### Sprint 2: Foundation

| ID | Story | Pontos | Status |
|----|-------|--------|--------|
| 2.1 | Implementar Full-Text Search | 5 | 📋 Ready |
| 2.2 | Implementar soft delete | 5 | 📋 Ready |
| 2.3 | Centralizar design tokens | 3 | 📋 Ready |
| 2.4 | Adicionar trigger de validação em links | 3 | 📋 Ready |

### Sprint 3: Features

| ID | Story | Pontos | Status |
|----|-------|--------|--------|
| 3.1 | UI para múltiplos estudos por capítulo | 5 | 📋 Ready |
| 3.2 | UI para links entre estudos | 5 | 📋 Ready |
| 3.3 | Feedback visual completo (salvando, undo) | 3 | 📋 Ready |
| 3.4 | Testes E2E para fluxos críticos | 5 | 📋 Ready |

---

## ✅ Definition of Done (Epic)

- [ ] Zero `confirm()` ou `alert()` no codebase
- [ ] Lighthouse Accessibility > 95
- [ ] Mobile UX funcional em 375px
- [ ] Busca funcional com FTS
- [ ] Soft delete implementado
- [ ] Design tokens centralizados
- [ ] 3+ testes E2E passando
- [ ] Documentação atualizada

---

## 📎 Referências

- [Technical Debt Assessment](../prd/technical-debt-assessment.md)
- [Relatório Executivo](../reports/TECHNICAL-DEBT-REPORT.md)
- [Arquitetura do Sistema](../architecture/system-architecture.md)

---

**Criado por:** @pm Agent
**Data:** 2026-01-26
**Aprovado por:** Pendente
