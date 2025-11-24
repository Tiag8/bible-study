# EXEMPLO PRÁTICO - Desenvolvendo 3 Features Paralelas

**Cenário Real**: Você vai implementar 3 features (Payment, Landing Page, Magic Link) usando o orchestrator.

---

## 📅 DIA 1 - MANHÃ (30min)

### 1. Inicializar 3 features

```bash
cd /Users/tiago/Projects/life_tracker

# Feature 1
./scripts/feature-init.sh payment
# ✅ Criou: feat/payment branch + .context/feat-payment_orchestrator-state.json

# Feature 2
git checkout main
./scripts/feature-init.sh landing-page
# ✅ Criou: feat/landing-page branch + .context/feat-landing-page_orchestrator-state.json

# Feature 3
git checkout main
./scripts/feature-init.sh magic-link
# ✅ Criou: feat/magic-link branch + .context/feat-magic-link_orchestrator-state.json
```

### 2. Ver dashboard

```bash
./scripts/feature-dashboard.sh
```

**Output**:
```
╔══════════════════════════════════════════════════════════════════════════╗
║                   FEATURE ORCHESTRATOR DASHBOARD                         ║
╠══════════════════════════════════════════════════════════════════════════╣
║ Feature              Status     Workflow   Phase        Updated          ║
╠══════════════════════════════════════════════════════════════════════════╣
║ feat-payment         active     1          0            2min ago         ║
║ feat-landing-page    active     1          0            1min ago         ║
║ feat-magic-link      active     1          0            30s ago          ║
╚══════════════════════════════════════════════════════════════════════════╝

📊 Summary: 3 features (Active: 3)
```

---

## 📅 DIA 1 - TARDE (2h)

### 3. Trabalhar em feat-payment

```bash
git checkout feat/payment

# Você pede para IA:
"Claude, executa Workflow 1 (Reframing) para feat-payment"

# IA executa:
# - Fase 1.5: Reframing (3 perspectivas)
# - GATE 1: Aguarda sua aprovação
```

**Você aprova**: "Perspectiva 2 (Subjacente)"

### 4. Atualizar state (manualmente ou IA faz)

```bash
# Workflow 1 completado
./scripts/feature-update-state.sh payment complete-workflow 1

# Avançar para Workflow 2b
./scripts/feature-update-state.sh payment workflow 2b
./scripts/feature-update-state.sh payment phase 0
```

### 5. Dashboard agora mostra progresso

```bash
./scripts/feature-dashboard.sh
```

**Output**:
```
║ feat-payment         active     2b         0            5min ago         ║
║ feat-landing-page    active     1          0            1h ago           ║
║ feat-magic-link      active     1          0            1h ago           ║
```

---

## 📅 DIA 2 - MANHÃ (1h)

### 6. Continuar feat-payment (Workflow 2b → 4.5)

```bash
git checkout feat/payment

# Você: "Claude, executa Workflow 2b (Source of Truth)"
# IA: Valida schemas, env vars → Success

./scripts/feature-update-state.sh payment complete-workflow 2b
./scripts/feature-update-state.sh payment workflow 4.5
```

### 7. Pausar feat-payment (GATE 4.5)

```bash
# Workflow 4.5 tem 8 gates - 1 falhou (FK missing)
./scripts/feature-update-state.sh payment status paused

# Adicionar gate manualmente
jq '.gate = {"type": "validation", "trigger": "FK missing", "reached_at": "'$(TZ='America/Sao_Paulo' date -Iseconds)'"}' \
  .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json
```

### 8. Trabalhar em feat-landing-page (enquanto payment bloqueada)

```bash
git checkout feat/landing-page

# Você: "Claude, executa Workflow 1"
# IA: Reframing → GATE 1 → Você aprova

./scripts/feature-update-state.sh landing-page complete-workflow 1
./scripts/feature-update-state.sh landing-page workflow 2b
```

### 9. Dashboard mostra 2 features progredindo

```bash
./scripts/feature-dashboard.sh
```

**Output**:
```
║ feat-payment         paused     4.5        GATE 1       30min ago        ║
║     🚦 Gate: FK missing                                                  ║
║ feat-landing-page    active     2b         0            5min ago         ║
║ feat-magic-link      active     1          0            1d ago           ║
```

---

## 📅 DIA 2 - TARDE (2h)

### 10. Resolver bloqueio feat-payment

```bash
# Criar migration (manualmente)
supabase migration new create_payment_table
# ... editar SQL

supabase db push

# Reativar feature
./scripts/feature-update-state.sh payment status active
jq '.gate = null' .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json
```

### 11. Continuar feat-payment (Workflow 4.5 → 5a)

```bash
git checkout feat/payment

# Você: "Claude, re-executa Workflow 4.5 GATE 3"
# IA: FK validation → Success agora

./scripts/feature-update-state.sh payment complete-workflow 4.5
./scripts/feature-update-state.sh payment workflow 5a
```

### 12. Implementação (Workflow 5a)

```bash
# Você: "Claude, implementa feat-payment (Workflow 5a)"
# IA: Implementa backend + frontend + testes (2-3h)

# Atualizar state
./scripts/feature-update-state.sh payment complete-workflow 5a
./scripts/feature-update-state.sh payment workflow 6a
./scripts/feature-update-state.sh payment phase 12
```

---

## 📅 DIA 3 - MANHÃ (1h)

### 13. Screenshot validation (GATE CRÍTICO)

```bash
git checkout feat/payment

# Você: "Claude, tira screenshot ANTES e DEPOIS"
# IA: Gera 2 screenshots

# Pausar para você validar
./scripts/feature-update-state.sh payment status paused
jq '.gate = {"type": "human", "trigger": "screenshot validation", "reached_at": "'$(date -Iseconds)'"}' \
  .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json
```

**Você valida**: Screenshots OK ✅

```bash
# Aprovar gate
./scripts/feature-update-state.sh payment status active
jq '.gate = null' .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json

# Continuar
./scripts/feature-update-state.sh payment complete-workflow 6a
./scripts/feature-update-state.sh payment workflow 9a
```

### 14. Dashboard - 3 features em estágios diferentes

```bash
./scripts/feature-dashboard.sh
```

**Output**:
```
║ feat-payment         active     9a         0            5min ago         ║
║ feat-landing-page    active     5a         3            2d ago           ║
║ feat-magic-link      active     2b         0            2d ago           ║
```

---

## 📅 DIA 4 - FINALIZAÇÃO

### 15. Completar feat-payment

```bash
git checkout feat/payment

# Workflows 9a → 10 → 12 (finalization)
# ... IA executa

./scripts/feature-update-state.sh payment status completed
```

### 16. Dashboard final

```bash
./scripts/feature-dashboard.sh
```

**Output**:
```
║ feat-payment         completed  12         done         1h ago           ║
║ feat-landing-page    active     6a         12           30min ago        ║
║     🚦 Gate: screenshot validation                                       ║
║ feat-magic-link      active     4.5        GATE 3       1d ago           ║
```

---

## 📊 RESUMO 4 DIAS

- ✅ **3 features iniciadas** simultaneamente
- ✅ **1 feature completada** (feat-payment)
- ✅ **2 features em progresso** (landing-page, magic-link)
- ✅ **Zero context loss** (state sempre atualizado)
- ✅ **Dashboard sempre mostra** onde você parou

---

## 🎯 KEY TAKEAWAYS

1. **Inicializar**: `./scripts/feature-init.sh <nome>`
2. **Ver status**: `./scripts/feature-dashboard.sh` (use SEMPRE)
3. **Atualizar state**: `./scripts/feature-update-state.sh <nome> <campo> <valor>`
4. **Pausar em gate**: `status paused` + adicionar `.gate`
5. **Continuar após gate**: `status active` + remover `.gate`

---

## 💡 DICA FINAL

**Use o dashboard SEMPRE**:
- Antes de começar o dia → ver onde parou
- Após completar workflow → ver progresso
- Quando trocar de feature → saber status de todas
- Antes de pausar trabalho → confirmar state atualizado

**Comando rápido**:
```bash
alias fd='./scripts/feature-dashboard.sh'
fd  # Ver dashboard
```
