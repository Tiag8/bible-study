# Feature Orchestrator - Quick Start Guide

**Versão**: 1.0.0 (Solução 1: Lightweight State Tracker)
**Data**: 2025-11-20

---

## 📋 O QUE É

**Sistema de tracking de múltiplas features em desenvolvimento paralelo**, permitindo visualizar status, workflows, gates e contexto de cada feature através de um dashboard CLI simples.

**Benefícios**:
- ✅ **Zero context loss**: State persistido em `.context/`
- ✅ **Visibilidade**: Dashboard mostra todas features (status, workflow, gates)
- ✅ **Organização**: Múltiplas features sem confusão
- ✅ **Simplicidade**: 100 linhas código, zero dependências externas

---

## 🚀 SETUP (5 MINUTOS)

### Pré-requisitos

```bash
# 1. jq (JSON parser)
brew install jq

# 2. Git configurado
git --version
```

### Arquivos criados

- ✅ `.context/ORCHESTRATOR-STATE-SCHEMA.json` (Schema de validação)
- ✅ `scripts/feature-dashboard.sh` (Dashboard CLI)
- ✅ `scripts/feature-init.sh` (Inicializar feature)
- ✅ `scripts/feature-update-state.sh` (Atualizar state)

---

## 📖 GUIA DE USO

### 1️⃣ Criar Nova Feature

```bash
# Sintaxe
./scripts/feature-init.sh <nome>

# Exemplo
./scripts/feature-init.sh payment
```

**O que faz**:
1. Cria branch Git `feat/payment`
2. Cria state file `.context/feat-payment_orchestrator-state.json`
3. Cria 6 arquivos `.context/` padrão (workflow-progress, temp-memory, etc)
4. Inicializa status `active`, workflow `1`, fase `0`

**Output**:
```
✅ Feature inicializada com sucesso!

📦 Arquivos criados:
   - .context/feat-payment_orchestrator-state.json
   - .context/feat-payment_workflow-progress.md
   - ... (mais 4 arquivos)

🎯 Feature: feat-payment
📍 Branch: feat/payment
📊 Status: active (Workflow 1 Fase 0)
```

---

### 2️⃣ Ver Dashboard (Todas Features)

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
║ feat-payment         active     4.5        GATE 1       2h 30min ago     ║
║ feat-landing         paused     3          0            5h ago           ║
║     🚦 Gate: screenshot validation                                       ║
║ feat-magic-link      blocked    1          GATE 1       1d ago           ║
╚══════════════════════════════════════════════════════════════════════════╝

📊 Summary:
   Total: 3 features
   Active: 1 | Paused: 1 | Blocked: 1 | Completed: 0 | Failed: 0

⏸️  Action Required:
   - feat-landing: screenshot validation (waiting 5h)
   - feat-magic-link: GATE 1 (waiting 1d)
```

**Cores**:
- 🟢 **Verde** (active): Feature sendo trabalhada atualmente
- 🟡 **Amarelo** (paused): Aguardando aprovação de gate
- 🔴 **Vermelho** (blocked): Problema técnico (conflict, validation failed)
- 🔵 **Ciano** (completed): Feature finalizada
- 🟣 **Roxo** (failed): Feature cancelada/falhou

---

### 3️⃣ Atualizar State de Feature

```bash
# Sintaxe
./scripts/feature-update-state.sh <nome> <campo> <valor>

# Exemplos
./scripts/feature-update-state.sh payment workflow 2b
./scripts/feature-update-state.sh payment phase "GATE 1"
./scripts/feature-update-state.sh payment status paused
./scripts/feature-update-state.sh payment complete-workflow 1
```

**Campos disponíveis**:

| Campo | Descrição | Valores | Exemplo |
|-------|-----------|---------|---------|
| `workflow` | Workflow atual | 1, 2a, 2b, 4.5, 6a, etc | `workflow 4.5` |
| `phase` | Fase do workflow | 0, 1.5, GATE 1, etc | `phase "GATE 1"` |
| `status` | Status da feature | active, paused, blocked, completed, failed | `status paused` |
| `complete-workflow` | Marcar workflow completo | Número do workflow | `complete-workflow 1` |

**Output**:
```
✅ Workflow atualizado: 4.5

📊 State atual:
{
  "feature": "feat-payment",
  "status": "active",
  "current_workflow": "4.5",
  "workflows_completed": ["1", "2b", "3"],
  "updated_at": "2025-11-20T21:45:00-03:00"
}
```

---

### 4️⃣ Ver State Detalhado

```bash
# Ver JSON completo
cat .context/feat-payment_orchestrator-state.json | jq

# Ver apenas workflows completados
jq '.workflows_completed' .context/feat-payment_orchestrator-state.json

# Ver gate pendente
jq '.gate' .context/feat-payment_orchestrator-state.json
```

---

## 🔄 WORKFLOW TÍPICO (Dia-a-Dia)

### Cenário: Desenvolver 3 features em paralelo

```bash
# 1. INICIALIZAR features (manhã)
./scripts/feature-init.sh payment
./scripts/feature-init.sh landing
./scripts/feature-init.sh magic-link

# 2. DASHBOARD (ver status)
./scripts/feature-dashboard.sh
# Output: 3 features "active", workflow 1

# 3. TRABALHAR em feat-payment
git checkout feat/payment
# Você: "Claude, executa Workflow 1 (Reframing)"
# IA: Executa reframing, chega em GATE 1
# Você: Aprova reframing

# 4. ATUALIZAR state (IA pode fazer isso automaticamente)
./scripts/feature-update-state.sh payment complete-workflow 1
./scripts/feature-update-state.sh payment workflow 2b
./scripts/feature-update-state.sh payment phase 0

# 5. DASHBOARD (ver progresso)
./scripts/feature-dashboard.sh
# Output: feat-payment workflow 2b, outras workflow 1

# 6. PAUSAR feat-payment (aguardando screenshot)
./scripts/feature-update-state.sh payment status paused
jq '.gate = {"type": "human", "trigger": "screenshot", "reached_at": "'$(date -Iseconds)'"}' \
  .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json

# 7. TRABALHAR em feat-landing (enquanto payment pausada)
git checkout feat/landing
# Você: "Claude, executa Workflow 1"

# 8. DASHBOARD (verificar action items)
./scripts/feature-dashboard.sh
# Output: feat-payment paused (gate: screenshot), feat-landing active

# 9. APROVAR gate (feat-payment)
./scripts/feature-update-state.sh payment status active
jq '.gate = null' .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json

# 10. CONTINUAR feat-payment
git checkout feat/payment
# Você: "Claude, continua Workflow 2b"
```

---

## 📐 STATE SCHEMA

### Estrutura JSON

```json
{
  "feature": "feat-payment",
  "branch": "feat/payment",
  "status": "active",
  "current_workflow": "4.5",
  "current_phase": "GATE 1",
  "gate": {
    "type": "human",
    "trigger": "screenshot validation",
    "reached_at": "2025-11-20T10:30:00-03:00",
    "approved_at": null,
    "approved_by": null
  },
  "workflows_completed": ["1", "2b", "3"],
  "attempts": {"4.5": 2, "5a": 1},
  "started_at": "2025-11-20T08:00:00-03:00",
  "updated_at": "2025-11-20T10:30:00-03:00",
  "paused_until": null,
  "notes": [
    {
      "timestamp": "2025-11-20T08:00:00-03:00",
      "note": "Feature iniciada"
    }
  ]
}
```

### Campos Detalhados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `feature` | string | Nome da feature (feat-payment) |
| `branch` | string | Branch Git (feat/payment) |
| `status` | enum | active, paused, blocked, completed, failed |
| `current_workflow` | string | Workflow atual (1, 2b, 4.5) |
| `current_phase` | string | Fase do workflow (0, 1.5, GATE 1) |
| `gate` | object \| null | Gate pendente (se existir) |
| `workflows_completed` | array | Workflows finalizados ["1", "2b"] |
| `attempts` | object | Tentativas por workflow (retry tracking) |
| `started_at` | ISO 8601 | Timestamp início feature |
| `updated_at` | ISO 8601 | Timestamp última atualização |
| `paused_until` | ISO 8601 \| null | Timestamp limite pausa (ex: staging 24h) |
| `notes` | array | Notas contextuais |

---

## 🎯 GATES (Human-in-the-Loop)

### O que são Gates?

**Pontos de pausa obrigatória** onde IA aguarda aprovação humana antes de prosseguir.

### Gates Principais (Life Track Growth)

| Gate | Workflow | Trigger | Ação Humana |
|------|----------|---------|-------------|
| **GATE 1** | 1 (Planning) | Reframing | Escolher perspectiva (1-3) |
| **Screenshot** | 6a (Validation) | Screenshot DEPOIS | Validar 6 cenários UI |
| **Staging** | 11a (Deploy Prep) | Staging review | Testar 24h + aprovar |
| **Production** | 11b (Deploy Exec) | Prod deploy | Aprovar deploy prod |

### Workflow com Gate

```bash
# 1. Feature atinge gate
# IA: "GATE 1 atingido - 3 perspectivas prontas"

# 2. Atualizar state (pausar)
./scripts/feature-update-state.sh payment status paused
jq '.gate = {"type": "human", "trigger": "GATE 1", "reached_at": "'$(date -Iseconds)'"}' \
  .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json

# 3. Dashboard mostra gate
./scripts/feature-dashboard.sh
# Output: feat-payment paused (Gate: GATE 1)

# 4. Usuário valida
# Você: Analisa 3 perspectivas, escolhe "Perspectiva 2"

# 5. Aprovar gate
./scripts/feature-update-state.sh payment status active
jq '.gate.approved_at = "'$(date -Iseconds)'" | .gate.approved_by = "user"' \
  .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json

# 6. Continuar workflow
# Você: "Claude, continua com Perspectiva 2"
```

---

## 🔧 TROUBLESHOOTING

### Problema: Dashboard não mostra features

**Causa**: Nenhum arquivo `*_orchestrator-state.json` em `.context/`

**Solução**:
```bash
ls .context/*_orchestrator-state.json
# Se vazio: Criar feature primeiro
./scripts/feature-init.sh test
```

---

### Problema: `jq: command not found`

**Causa**: jq não instalado

**Solução**:
```bash
brew install jq
```

---

### Problema: State JSON corrompido

**Causa**: Edição manual com erro de sintaxe

**Solução**:
```bash
# Validar JSON
jq '.' .context/feat-payment_orchestrator-state.json

# Se erro: Restaurar backup
cp .context/feat-payment_orchestrator-state.json.bak \
   .context/feat-payment_orchestrator-state.json
```

---

### Problema: Feature não aparece no dashboard

**Causa 1**: Arquivo state não tem sufixo `_orchestrator-state.json`

**Solução**: Renomear arquivo
```bash
mv .context/feat-payment_state.json \
   .context/feat-payment_orchestrator-state.json
```

**Causa 2**: JSON inválido

**Solução**: Validar com jq (acima)

---

## 📊 MÉTRICAS & ROI

### Trackear Uso (2 semanas)

```bash
# Quantas features criadas?
ls .context/*_orchestrator-state.json | wc -l

# Quantas features completadas?
for f in .context/*_orchestrator-state.json; do
  jq -r 'select(.status == "completed") | .feature' "$f"
done | wc -l

# Tempo médio por feature
for f in .context/*_orchestrator-state.json; do
  started=$(jq -r '.started_at' "$f")
  updated=$(jq -r '.updated_at' "$f")
  echo "$f: $started → $updated"
done
```

### ROI Esperado

**ANTES** (sem orchestrator):
- Context loss: 50% (re-ler .context/ após dias/semanas)
- Features paralelas: 1-2 (mental overhead)
- Throughput: 2-3 features/semana

**DEPOIS** (com orchestrator):
- Context loss: 10% (state persistido)
- Features paralelas: 3-5 (dashboard organiza)
- Throughput: 4-6 features/semana

**Break-even**: 3 features com context loss economizado (3 × 30min = 90min) vs 5min setup

---

## 🚀 PRÓXIMOS PASSOS (Evolução)

### Após 2 Semanas de Uso

**SE ROI positivo** (context loss < 20%, throughput +50%):
→ Implementar **Solução 2 (Event-Sourced Orchestrator)**
  - Automação 70% (IA executa workflows)
  - Batch approvals (validar 3 gates de uma vez)
  - Rollback automático

**SE ROI negativo** (overhead > benefício):
→ Simplificar ainda mais ou voltar para manual

---

## 📚 REFERÊNCIAS

- `.context/ORCHESTRATOR-STATE-SCHEMA.json` (Schema JSON completo)
- `docs/research/AI-WORKFLOW-ORCHESTRATOR-PATTERNS.md` (Arquiteturas avançadas)
- `.windsurf/workflows/` (31 workflows do projeto)
- `CLAUDE.md` REGRA #13 (Sistema .context/)

---

**Versão**: 1.0.0
**Data**: 2025-11-20
**Autor**: Claude Code (Anthropic)
