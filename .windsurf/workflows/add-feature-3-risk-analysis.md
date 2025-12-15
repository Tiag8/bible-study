---
description: Workflow Add-Feature (3/11) - Risk Analysis (Análise de Riscos)
auto_execution_mode: 1
---

# Workflow 3/11: Risk Analysis - Análise de Riscos e Mitigações

**Objetivo**: Analisar riscos específicos da solução escolhida, planejar mitigações baseadas em evidências, e obter aprovação do plano.

---

## 1️⃣ O QUE FAZER (5W1H Framework)

### WHO (Quem está envolvido?)
- **Developer/AI**: Identificar riscos técnicos/negócio/segurança
- **User**: Aprovar plano de riscos e mitigações
- **Agents**: MÁXIMO paralelo (3-5 agents: técnico, segurança, negócio, mitigações)

### WHAT (O que deve ser feito?)
- **Core**: Análise riscos detalhada da solução escolhida (Workflow 2a)
- **Mitigations**: Estratégias baseadas em evidências (não teoria)
- **Rollback Plan**: 4 opções (git revert, backup, feature flag, redeploy)

### WHERE (Onde acontece?)
- **Research**: WebSearch (CVEs, issues), context7 (docs), Grep (codebase)
- **Documentation**: `.context/{branch}_decisions.md`
- **Next**: Workflow 4 (Planning)

### WHEN (Quando executar?)
1. **ANTES**: Workflow 2a (Solution chosen) completo, 5 agents Workflow 2b executados
2. **DURANTE**: Análise paralela (riscos + mitigações), GATE 6.1 (Evidence Validation)
3. **DEPOIS**: GATE 2 (User approval) → atualizar .context/

### WHY (Por quê importa?)
- **Quality**: 30-40% bugs preveníveis via risk analysis
- **Business**: Evitar custos rollback/downtime
- **Security**: Detectar vulnerabilidades ANTES prod

### HOW (Como executar?)
- **Pattern**: Evidence-Based Risks → Mitigations → Rollback Plan → User Approval
- **Agents**: MÁXIMO paralelo (20-30min vs 2-3h)
- **Validation**: GATE 6.1 (evidências obrigatórias), GATE 2 (user approval)

---

## 2️⃣ PRINCÍPIOS DE RISK ANALYSIS

### P1: Evidence-Based Risks (COMO identificar?)
**Princípio**: NUNCA criar riscos baseados em teoria - SEMPRE em evidências

**Guidelines**:
- **Dados projeto**: Logs, métricas, histórico (debugging-cases/, ADRs)
- **Casos passados**: Issues conhecidos, CVEs, benchmarks
- **Fatos mensuráveis**: Carga atual, volume dados, performance baselines

**Red Flags**:
- ❌ "Pode acontecer" (teoria sem dados)
- ❌ "Geralmente problemático" (genérico)
- ❌ Medo/paranoia sem fundamento

**Categorias**:
1. **Performance**: Latência, throughput, memory usage
2. **Breaking Changes**: APIs, schema, dependencies
3. **Security**: SQL injection, XSS, RLS bypass, CVEs
4. **Business**: User impact, analytics, feedback

---

### P2: Multi-Agent Parallel Analysis (QUANDO executar?)
**Princípio**: SEMPRE 3-5 agents paralelos (não sequencial)

**Guidelines**:
- **Agent 1**: Riscos técnicos (performance, breaking changes)
- **Agent 2**: Riscos segurança (CVEs, vulnerabilities)
- **Agent 3**: Riscos negócio (user impact, analytics)
- **Agent 4**: Mitigações (evidências obrigatórias)
- **Agent 5**: Rollback plan (opções viáveis)

**Red Flags**:
- ❌ Análise sequencial (20-30min → 2-3h)
- ❌ < 3 agents (coverage incompleto)

**Pre-requisito**: Workflow 2b DEVE ter executado 5 agents (validar `./scripts/validate-5-agents-executed.sh`)

---

### P3: Evidence-Based Mitigations (COMO mitigar?)
**Princípio**: TODAS mitigações DEVEM ter evidências (não intuição)

**Critérios Evidências**:
1. **Fonte Primária**: Docs oficiais, papers, codebase
2. **Atualidade**: < 2 anos (tech) OU < 5 anos (teoria)
3. **Múltiplas Fontes**: 2+ fontes (riscos críticos 🔴)
4. **Contexto Aplicável**: Mesmo stack/domínio

**Red Flags**:
- ❌ Mitigação sem evidência (intuição)
- ❌ Fonte > 2 anos (tecnologia desatualizada)
- ❌ 1 fonte única (risco crítico)

**GATE 6.1 Bloqueio**: SE evidências insuficientes → ⛔ PARAR, buscar evidências OU rejeitar mitigação

---

### P4: Risk Prioritization (O QUE priorizar?)
**Princípio**: Priorizar por Probabilidade × Impacto (não "tudo importante")

**Severidade Matrix**:
| Prob/Impact | Alto | Médio | Baixo |
|-------------|------|-------|-------|
| **Alta** | 🔴 Crítico | 🟡 Alto | 🟢 Médio |
| **Média** | 🟡 Alto | 🟢 Médio | 🟢 Baixo |
| **Baixa** | 🟢 Médio | 🟢 Baixo | ⚪ Ignorar |

**Guidelines**:
- **🔴 Crítico**: Mitigar ANTES implementação
- **🟡 Alto**: Mitigar DURANTE implementação
- **🟢 Médio/Baixo**: Monitorar, mitigar SE ocorrer
- **⚪ Ignorar**: Probabilidade/impacto desprezíveis

---

### P5: Rollback Plan (QUANDO reverter?)
**Princípio**: SEMPRE ter 2+ opções rollback (não "não vai falhar")

**Opções** (ordem preferência):
1. **Git revert**: Bugs código, banco OK → `git revert <hash>` (2-5min)
2. **Restaurar backup**: Migration quebrou → `./scripts/restore-supabase.sh` (10-15min)
3. **Feature flag**: Desabilitar sem redeploy → toggle config (30seg)
4. **Redeploy anterior**: Bugs críticos prod → `./scripts/vps-rollback.sh` (5-10min)

**Red Flags**:
- ❌ Apenas 1 opção rollback (ponto único falha)
- ❌ Rollback > 30min (downtime inaceitável)

---

## 3️⃣ EXEMPLOS CANÔNICOS (Pattern Reference)

### Example 1: Payment Integration (Critical Risk)
```markdown
**Risco 🔴: Duplicação de pagamentos (SQL race condition)**
- **Evidência**: Stripe docs (idempotency keys obrigatórias) - 2024
- **Probabilidade**: Média (10-20 requests/seg pico)
- **Impacto**: Alto (usuário cobrado 2x → chargebacks)
- **Severidade**: 🔴 CRÍTICO

**Mitigação**: Idempotency keys (Stripe SDK)
- Evidência 1: Stripe docs (idempotency-keys) - 2024
- Evidência 2: Codebase (patterns/PaymentService.ts linha 78)
- Validação: ✅ Oficial + Interno, ✅ Recente, ✅ Usado projeto

**Rollback**: Feature flag (disable payments) + refund manual
```

---

### Example 2: Schema Migration (Medium Risk)
```markdown
**Risco 🟡: Breaking change em API (column rename)**
- **Evidência**: ADR-034 (60% bugs migration prefixes) - 2025
- **Probabilidade**: Baixa (RLS policies validados)
- **Impacto**: Alto (frontend quebra SE coluna renomeada)
- **Severidade**: 🟡 ALTO

**Mitigação**: Backward-compatible migration (add new → deprecate old)
- Evidência 1: Supabase docs (migration strategies) - 2024
- Evidência 2: debugging-cases/2025-11-schema-rename.md
- Validação: ✅ Oficial + Caso passado, ✅ Recente

**Rollback**: Git revert migration + regenerate types
```

---

### Example 3: Performance (Low Risk)
```markdown
**Risco 🟢: Bundle size +100KB (lazy loading)**
- **Evidência**: Vite bundle analyzer (current 450KB gzipped) - 2025
- **Probabilidade**: Média (nova lib React Query)
- **Impacto**: Baixo (450KB → 550KB, Google Vitals OK < 1MB)
- **Severidade**: 🟢 MÉDIO

**Mitigação**: Code splitting (React.lazy)
- Evidência 1: Vite docs (code splitting) - 2024
- Evidência 2: Google Web Vitals (< 500KB ideal, < 1MB aceitável) - 2023
- Validação: ✅ Oficial, ✅ Recente, ✅ Aceitável

**Rollback**: N/A (não bloqueia deploy)
```

---

## 4️⃣ VALIDATION GATES

### GATE 0: Load Context
**Quando**: SEMPRE (início workflow)

```bash
./scripts/context-load-all.sh feat-nome-feature
```

---

### GATE 2b-Validation: 5 Agents Executed
**Quando**: ANTES Fase 5 (Risk Analysis)

```bash
./scripts/validate-5-agents-executed.sh
```

**SE FALHOU**: ⛔ PARAR → Voltar Workflow 2b → Executar agents faltantes

---

### GATE 6.1: Evidence Validation
**Quando**: APÓS propor mitigações

**Checklist por Mitigação**:
- [ ] Fonte primária? (docs oficiais/papers/codebase)
- [ ] Atualidade? (< 2 anos tech OU < 5 anos teoria)
- [ ] 2+ fontes? (SE risco crítico 🔴)
- [ ] Contexto aplicável? (mesmo stack/domínio)

**SE FALHOU**: ⛔ PARAR → Buscar evidências OU rejeitar mitigação

---

### GATE 2: User Approval
**Quando**: APÓS análise riscos completa

**Opções**:
1. **Aprovar** plano de riscos
2. **Ajustar** mitigações (explicar)
3. **Rejeitar** solução (voltar Workflow 2a)

**Aguardando decisão...** 🚦

---

## 5️⃣ CONTEXT UPDATE (.context/ - OBRIGATÓRIO)

### Update workflow-progress.md
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 3: Risk Analysis ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Análise riscos (técnicos, segurança, negócio)
  - Mitigações baseadas em evidências (GATE 6.1 ✅)
  - Rollback plan (4 opções)
  - GATE 2 (User approval) ✅
- **Outputs**: Riscos críticos: [N] | Mitigações: [N]
- **Next**: Workflow 4 (Planning)
EOF
```

---

### Update decisions.md
```bash
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 3 - Risk Analysis
- **Riscos Críticos (🔴)**: [Listar]
- **Mitigações**: [Resumo]
- **Rollback Plan**: [Opção principal]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

---

### Log attempts.log
```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 3 (Risk Analysis) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] RISKS: [N] críticos, [N] altos, [N] médios" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## ⏭️ PRÓXIMO WORKFLOW

**Workflow 4 - Planning**: Detalhar cronograma de implementação, milestones, e dependencies

---

**Criado**: 2025-10-27 | **Otimizado**: 2025-12-10 (5W1H Meta-Framework)
**Parte**: 3/11 | **Próximo**: Workflow 4
