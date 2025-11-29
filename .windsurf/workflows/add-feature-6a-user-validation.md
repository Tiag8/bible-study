---
description: Workflow 6a - User Validation (Validação com Usuário Real)
auto_execution_mode: 1
---

## Pré-requisito

Ler: `docs/PLAN.md`, `docs/TASK.md`, `.claude/CLAUDE.md`

---

## FASE 0: LOAD CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
./scripts/context-load-all.sh $BRANCH_PREFIX
```

---

## FASE 12: PREPARAÇÃO VALIDAÇÃO

### 12.1. Screenshot DEPOIS (ADR-029)

```bash
./scripts/validate-screenshot-gate.sh 6a
```

**SE REJEITADO**: Capturar screenshot → `screenshots/after/feature-after.png`

### 12.2. Checklist Pré-Validação

- [ ] Build OK? (`npm run build`)
- [ ] Deploy staging/local disponível?
- [ ] Screenshot ANTES + DEPOIS capturados?

---

## FASE 13: EXECUÇÃO VALIDAÇÃO

### 13.1. Template Cenário (PADRÃO OBRIGATÓRIO)

```markdown
## Cenário [N]: [Nome]
**Cenário**: [descrição específica]
**Steps**:
1. [ação 1]
2. [ação 2]
3. [ação 3]
**Validação**:
- [ ] [check 1]
- [ ] [check 2]
**Status**: ⏸️ PENDING | ✅ PASS | ❌ FAIL
```

### 13.2. 6 Cenários Batch (Executar TODOS)

| # | Cenário | Foco |
|---|---------|------|
| F1 | Funcionalidade Core | Happy path E2E |
| F2 | Integrações | RLS, Edge Functions |
| R1 | Responsividade | Mobile, Tablet, Desktop |
| C1 | Cross-Browser | Chrome, Safari, Firefox |
| P1 | Performance | Bundle < 500KB, Load < 2s |
| E1 | Edge Cases | Vazio, 1000+ chars, offline |

**Regra**: Executar TODOS P0/P1 ANTES de reportar.

### 13.3. Validation Loop (.context/validation-loop.md)

**Template Iteração**:
```markdown
### Iteração X ([STATUS])
- **Data**: YYYY-MM-DD HH:MM
- **Tentativa**: [o que testando]
- **Resultado**: ✅ SUCESSO | ❌ FALHA
- **RCA (se falha)**: [5 Whys]
- **Fix Aplicado**: [mudanças]
- **Meta-Learning**: [prevenção]
```

**⚠️ Timing Trap (ADR-027)**: SE fix + test pass < 5min, validar:
1. Test negative case
2. Revert fix
3. Re-test (confirmar sintoma retorna)

---

## FASE 14: ANÁLISE RESULTADOS

### 14.1. Classificação Bugs

| Severidade | Critério | Ação |
|------------|----------|------|
| Blocker | Feature inutilizável | Fix ANTES merge |
| Critical | Core quebrado | Fix ANTES merge |
| Major | UX ruim mas funciona | Fix ou doc |
| Minor | Cosmético | Backlog |

### 14.2. Decision Matrix

| Bugs | Ação |
|------|------|
| 0 Blocker/Critical | ✅ Prosseguir |
| 1+ Blocker | ⛔ Fix obrigatório |
| 1+ Critical | ⚠️ Fix ou aprovação |

---

## GATE 3: Confirmação

**Checklist**:
- [ ] 6 cenários batch executados?
- [ ] Screenshots coletados?
- [ ] 0 Blocker/Critical?
- [ ] Console limpo (F12)?
- [ ] Responsivo OK?

**Decisão**: ✅ APROVAR | ⚠️ AJUSTAR

---

## FASE FINAL: UPDATE CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
echo "[$TIMESTAMP] WORKFLOW: 6a - Validação completa" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$TIMESTAMP] GATE 3: APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## Checklist Final

- [ ] **Fase 12**: Pré-validação + screenshots OK?
- [ ] **Fase 13**: 6 cenários batch executados?
- [ ] **Fase 14**: Bugs classificados?
- [ ] **GATE 3**: Aprovação recebida?
- [ ] **Final**: .context/ atualizado?

---

## REGRA ANTI-ROI

**NUNCA**: ROI, tempo, "horas economizadas"
**PERMITIDO**: "X bugs encontrados", evidências concretas

---

**Versão**: 2.0 (Otimizado)
**Próximo**: Workflow 6b (Visual Refinement) ou 7a (Merge)
