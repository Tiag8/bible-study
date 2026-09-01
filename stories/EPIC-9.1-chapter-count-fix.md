# EPIC 9.1: Correção de Contagem de Capítulos & Melhorias UX

**Status**: ✅ Done
**Priority**: 🔴 CRÍTICA (Bug em produção)
**Assignee**: @dev
**Arch Review**: @architect (Aria - Análise 360° completa)
**QA Review**: @qa (Quinn - Gaps de testes identificados)

---

## 📊 CONTEXTO

### Visão Geral
Corrigir bug crítico que conta **estudos** ao invés de **capítulos únicos** no dashboard, e melhorar a clareza UX das métricas de progresso.

### Problema Identificado
- **Sintoma**: Gênesis mostra "2 de 50 estudados" mas só tem 1 capítulo (cap 2) com 2 estudos
- **Root Cause**: `bookStudies.map(s => s.chapter_number)` não remove duplicatas
- **Impacto**: 100% dos usuários veem informação incorreta

### Usuário-alvo
Estudioso bíblico que quer:
- Ver progresso REAL de capítulos estudados
- Entender claramente o que os números significam
- Confiar nas métricas do sistema

### Valor de Negócio
- 🎯 **Confiança**: Informação correta aumenta credibilidade
- 📊 **Clareza**: Labels explícitos reduzem confusão
- 🧪 **Qualidade**: Testes previnem regressões futuras

---

## 🎯 OBJETIVOS

| Objetivo | Sucesso |
|----------|---------|
| Contagem correta de capítulos | Gênesis com 2 estudos no cap 2 → "1 de 50" |
| Labels claros | "X de Y capítulos estudados" (não apenas "estudados") |
| Cobertura de testes | 100% da lógica de contagem testada |
| Zero regressão | Funcionalidades existentes mantidas |

---

## 📋 HISTÓRIAS DE USUÁRIO

### **Story 9.1.1: Fix Bug de Contagem Duplicada** ⭐ CRÍTICO

**Arquivo**: `docs/stories/9.1.1-fix-duplicate-count.md`

| Aspecto | Detalhe |
|---------|---------|
| **Prioridade** | 🔴 MUST HAVE |
| **Esforço** | 5 min |
| **Risco** | BAIXO |
| **Agentes** | @dev |

---

### **Story 9.1.2: Testes Unitários para Lógica de Contagem** 🧪

**Arquivo**: `docs/stories/9.1.2-unit-tests.md`

| Aspecto | Detalhe |
|---------|---------|
| **Prioridade** | 🟠 SHOULD HAVE |
| **Esforço** | 40 min |
| **Risco** | BAIXO |
| **Agentes** | @qa, @dev |

---

### **Story 9.1.3: Clarificar Labels de Progresso** 🎨

**Arquivo**: `docs/stories/9.1.3-ux-labels.md`

| Aspecto | Detalhe |
|---------|---------|
| **Prioridade** | 🟠 SHOULD HAVE |
| **Esforço** | 15 min |
| **Risco** | BAIXO |
| **Agentes** | @dev |

---

## 📊 ROADMAP & PRIORIZAÇÃO

| # | Story | Prioridade | Esforço | Dependências |
|---|-------|------------|---------|--------------|
| 1 | 9.1.1 Fix Bug | 🔴 MUST | 5 min | Nenhuma |
| 2 | 9.1.2 Testes | 🟠 SHOULD | 40 min | Após 9.1.1 |
| 3 | 9.1.3 Labels | 🟠 SHOULD | 15 min | Nenhuma |

**Total**: ~1 hora
**Recomendação**: Executar 9.1.1 imediatamente, depois 9.1.2 e 9.1.3 em paralelo

---

## 🏗️ ANÁLISE TÉCNICA (Análise 360°)

### Arquivos Afetados

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `src/app/DashboardClient.tsx` | 49 | Adicionar `new Set()` |
| `src/components/dashboard/ChapterView.tsx` | 69 | Adicionar `new Set()` |
| `src/components/dashboard/BookCard.tsx` | 72 | Clarificar label |
| `src/components/dashboard/BookGrid.tsx` | 67 | Adicionar contexto total |
| `tests/unit/chapter-counting.test.ts` | NEW | Suite de testes |

### Código do Fix

```typescript
// ANTES (2 arquivos)
const studiedChapters = bookStudies.map((s) => s.chapter_number);

// DEPOIS
const studiedChapters = [...new Set(bookStudies.map((s) => s.chapter_number))];
```

### Decisões Arquiteturais (@architect)

1. **Onde vive a lógica**: Frontend (YAGNI - volume baixo não justifica DB)
2. **Performance**: O(n) com Set é negligível para 66 livros
3. **Trade-off aceito**: Duplicação mínima (2 lugares) vs complexidade de RPC

---

## 🚨 RISCOS & MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Quebrar contagem existente | Baixa | Alto | Testes unitários (9.1.2) |
| Performance com Set | Muito Baixa | Baixo | Volume baixo (66 livros) |
| UI breaking | Baixa | Médio | Visual review |

**Rollback**: `git revert` se necessário

---

## ⚙️ CHECKLIST DE IMPLEMENTAÇÃO

### Gate 1: Fix Crítico
- [ ] 9.1.1: `DashboardClient.tsx:49` corrigido
- [ ] 9.1.1: `ChapterView.tsx:69` corrigido
- [ ] Build passa sem erros
- [ ] Validação manual: Gênesis mostra "1 de 50"

### Gate 2: Qualidade
- [ ] 9.1.2: Suite de testes criada
- [ ] 9.1.2: Todos os edge cases cobertos
- [ ] 9.1.2: Coverage 100% na lógica de contagem

### Gate 3: UX
- [ ] 9.1.3: Labels atualizados para "capítulos"
- [ ] 9.1.3: Total com contexto (X de 1189)
- [ ] Visual review aprovado

### Gate 4: Deploy
- [ ] Commit seguindo Conventional Commits
- [ ] PR review aprovado
- [ ] Merge em main
- [ ] Validação em produção

---

## 📈 MÉTRICAS DE SUCESSO

| Métrica | Antes | Depois |
|---------|-------|--------|
| Contagem correta | ❌ Bug | ✅ Correto |
| Cobertura de testes (lógica) | 0% | 100% |
| Clareza UX (label) | Ambíguo | Explícito |
| Tempo para detectar regressão | ~1 semana | < 1 min (CI) |

---

## 📝 HANDOFF (Para @dev)

### Próximos Passos
1. **Imediato**: Aplicar fix 9.1.1 (2 linhas de código)
2. **Hoje**: Criar testes 9.1.2
3. **Hoje**: Atualizar labels 9.1.3
4. **Commit**: `fix(dashboard): contar capítulos únicos ao invés de estudos`

### Branches
- `fix/9.1-chapter-count` (ou direto em main se preferir)

### Success Criteria
- ✅ Gênesis com 2 estudos no cap 2 mostra "1 de 50 capítulos"
- ✅ Testes passando
- ✅ Zero bugs em produção

---

## 📚 REFERÊNCIAS

- **Análise 360°**: Sessão anterior com 5 agentes especializados
- **Código**: `src/app/DashboardClient.tsx`, `src/components/dashboard/`
- **Padrões**: Design tokens em `src/lib/design-tokens.ts`

---

## 🎯 CONCLUSÃO

Este Epic resolve um **bug crítico** de informação incorreta ao usuário:
- ✅ Root cause identificado (falta de `Set`)
- ✅ Fix trivial (2 linhas de código)
- ✅ Testes para prevenir regressão
- ✅ UX melhorada com labels claros

**Recomendação**: Prioridade CRÍTICA, iniciar imediatamente.

---

**Criado por**: Morgan (Product Manager) 📋
**Análise por**: Aria (Architect) 🏛️, Sally (UX) 🎨, Quinn (QA) 🧪
**Data**: 2026-02-05
**Versão**: 1.0
