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

## AUTO-INVOKE: regression-guard (Gap A3 - MANDATORY) 🆕

**Objetivo**: Prevenir regressões via snapshot BEFORE/AFTER comparison. Executa ANTES e DEPOIS da validação para detectar breaking changes.

**Quando executar**: SEMPRE antes de Workflow 6a (automático para TODAS features).

**Agent**: `regression-guard`
**Invocação**: Automática (Claude detecta Workflow 6a iniciado)

**O que faz** (9 phases):
1. **Validate Modification Reason** (Phase 1): Bug comprovado? Requisito explícito? Problema medido?
2. **Capture BEFORE** (Phase 2): Screenshots, logs, DB state, performance baseline
3. **Plan Modification** (Phase 3): O QUE, POR QUE, COMO, rollback plan
4. **Create Branch** (Phase 4): Proteção git (nunca main direto)
5. **Monitor Implementation** (Phase 5): Watch errors, tests, file changes
6. **Capture AFTER** (Phase 6): Same tests as BEFORE, comparison table
7. **Post-Modification Validation** (Phase 7): Manual testing, edge cases, logs
8. **Pre-Deploy Quality Gate** (Phase 8): 8-item gate checklist
9. **Document Result** (Phase 9): Deploy report, snapshots references

**Output esperado**:
- `.context/{branch}_regression-before.md` (snapshot ANTES)
- `.context/{branch}_regression-after.md` (snapshot DEPOIS)
- `.context/{branch}_regression-comparison.md` (BEFORE vs AFTER table)
- `docs/deploy-reports/YYYY-MM-DD-feature-name.md` (validation summary)

**Checklist**:
- [ ] Agent executou Phase 1 (validate reason)?
- [ ] BEFORE snapshot capturado (Phase 2)?
- [ ] AFTER snapshot capturado (Phase 6)?
- [ ] Comparison table gerada (BEFORE vs AFTER)?
- [ ] Zero regressions detectados?
- [ ] Quality gate checklist 100% completo?

**SE regressions detectados**: ⛔ REJECT + rollback recomendado

**SE all gates pass**: ✅ Prosseguir para Fase 12

**Evidence** (from regression-guard.md):
- 9-phase systematic validation process
- BEFORE/AFTER snapshot comparison prevents 100% undetected regressions
- Quality gate (8 items) ensures deploy readiness
- Rollback plan documented (< 5min recovery target)

**Integration Points**:
- **Fase 12.0** (line 23): Executa regression-guard --mode before
- **Fase 15** (line 131): Executa regression-guard --mode after
- **GATE 3** (line 154): Verifica zero breaking changes

---

## FASE 12: PREPARAÇÃO VALIDAÇÃO

### 12.0. Regression Guard (Gap A3 - MANDATORY) 🆕

**CRÍTICO**: Executar ANTES de qualquer validação/deploy. NUNCA OPCIONAL.

```bash
# Invocar regression-guard skill (auto-executa agent)
# Cria BEFORE snapshot do estado atual
/regression-guard --mode before
```

**O que faz**:
- Captura snapshot ANTES das mudanças serem validadas/deployed
- Valida que GATE 1 foi executado (reframing)
- Executa bundle de validações (run-all-validations.sh)
- Cria baseline para comparação AFTER deploy

**Output**: `.context/{branch}_regression-before.md`

**SE FALHOU**: ⛔ NÃO prosseguir para deploy/validação

### 12.1. Screenshot DEPOIS (ADR-029)

```bash
./scripts/validate-screenshot-gate.sh 6a
```

**SE REJEITADO**: Capturar screenshot → `screenshots/after/feature-after.png`

### 12.2. Checklist Pré-Validação

- [ ] **Regression Guard executado?** (MANDATORY - Gap A3) 🆕
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

## FASE 15: REGRESSION VERIFICATION (Gap A3 - MANDATORY) 🆕

**CRÍTICO**: Executar DEPOIS da validação, ANTES de GATE 3 final.

```bash
# Invocar regression-guard skill (auto-executa agent)
# Cria AFTER snapshot e compara com BEFORE
/regression-guard --mode after
```

**O que faz**:
- Captura snapshot DEPOIS das mudanças validadas
- Compara BEFORE vs AFTER (detecta breaking changes)
- Valida que funcionalidades existentes ainda funcionam
- Detecta regressões introduzidas pela feature

**Output**: `.context/{branch}_regression-comparison.md`

**SE BREAKING CHANGES**: ⛔ REJECT + rollback recomendado
**SE OK**: ✅ Prosseguir para GATE 3

---

## GATE 3: Confirmação

**Checklist**:
- [ ] **Regression Guard BEFORE executado?** (MANDATORY - Gap A3) 🆕
- [ ] 6 cenários batch executados?
- [ ] Screenshots coletados?
- [ ] **Regression Guard AFTER executado?** (MANDATORY - Gap A3) 🆕
- [ ] **Zero breaking changes detectados?** (Regression Guard) 🆕
- [ ] 0 Blocker/Critical?
- [ ] Console limpo (F12)?
- [ ] Responsivo OK?

**Decisão**: ✅ APROVAR | ⚠️ AJUSTAR

---

## FASE FINAL: UPDATE CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')

# Atualizar workflow-progress.md
cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 6a: User Validation ✅
- **Data**: $TIMESTAMP
- **Cenários**: 6/6 executados
- **Bugs**: [X] Blocker, [Y] Critical, [Z] Minor
- **Status**: GATE 3 APROVADO
- **Next**: Workflow 6b/7a
EOF

# Log em attempts.log
echo "[$TIMESTAMP] WORKFLOW: 6a - Validação completa" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$TIMESTAMP] GATE 3: APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## Checklist Final

- [ ] **Fase 12.0**: Regression Guard BEFORE executado? (MANDATORY - Gap A3) 🆕
- [ ] **Fase 12**: Pré-validação + screenshots OK?
- [ ] **Fase 13**: 6 cenários batch executados?
- [ ] **Fase 14**: Bugs classificados?
- [ ] **Fase 15**: Regression Guard AFTER executado? (MANDATORY - Gap A3) 🆕
- [ ] **Fase 15**: Zero breaking changes detectados?🆕
- [ ] **GATE 3**: Aprovação recebida?
- [ ] **Final**: .context/ atualizado?

---

## REGRA ANTI-ROI

**NUNCA**: ROI, tempo, "horas economizadas"
**PERMITIDO**: "X bugs encontrados", evidências concretas

---

**Versão**: 2.0 (Otimizado)

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 7a] - Quality Gates**: Validação aprovada → código precisa code review + security scan antes de merge.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| Bug encontrado na validação | 5b (Refactoring RCA) | Corrigir bug com RCA antes de quality gates |
| Edge case descoberto | 6b (Edge Cases) | Tratar edge case antes de quality gates |
| Ajustes visuais necessários | 6c (Visual Refinement) | Refinamento UI antes de quality gates |
| Vulnerabilidade identificada | 7b (Security RCA) | Resolver issue de segurança imediatamente |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| Múltiplos bugs Blocker/Critical | 5a (Implementation) | Implementação incompleta, não apenas fix |
| Escopo mudou durante validação | 1 (Planning) | Re-planejar com novo escopo + GATE 1 |
| 5+ iterações 6a sem aprovação | 2b (Technical Design) | Problema de design, não implementação |

### Regras de Ouro
- ⛔ **NUNCA pular**: Workflow 7a - código NÃO vai para merge sem quality gates
- ⚠️ **Loop 6a→5b→6a (3+x)**: Voltar para 2b - problema é de design
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto

