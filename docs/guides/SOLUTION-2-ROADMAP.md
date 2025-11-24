# Solução 2 - Event-Sourced Orchestrator (Roadmap)

**Quando implementar**: Após 2 semanas usando Solução 1 com ROI positivo (context loss < 20%)

---

## 📋 O QUE ADICIONA (vs Solução 1)

| Feature | Solução 1 | Solução 2 |
|---------|-----------|-----------|
| **State tracking** | ✅ Manual | ✅ Automático |
| **Dashboard** | ✅ CLI | ✅ CLI |
| **IA executa workflows** | ❌ Manual | ✅ 70% automático |
| **Batch approvals** | ❌ Não | ✅ 3-5 gates de uma vez |
| **Rollback automático** | ❌ Não | ✅ Se falha 3x |
| **Event sourcing** | ❌ Não | ✅ Audit trail completo |
| **Orchestrator agent** | ❌ Não | ✅ .claude/agents/ |

---

## 🏗️ ARQUITETURA

```
.claude/agents/workflow-orchestrator.md
    ↓
Estado (.context/ + Event Store)
    ↓
Round-Robin Scheduler (3-5 features)
    ↓
Workflow Executor (1 → 12 automaticamente)
    ↓
Human Gates (AskUserQuestion)
    ↓
Dashboard + Rollback
```

---

## 📦 DELIVERABLES (Fase 2)

### 1. Orchestrator Agent (200 linhas)

**Arquivo**: `.claude/agents/workflow-orchestrator.md`

**Funções**:
- Gerencia 3-5 features automaticamente (round-robin)
- Executa workflows 1-12 sequencialmente por feature
- Detecta gates (keywords: GATE 1, screenshot, staging)
- Pausa em gates → notifica você → resume após aprovação
- Rollback automático se validation falha 3x

**Prompt structure**:
```markdown
# Workflow Orchestrator

## MISSION
Gerenciar múltiplas features paralelas, executando workflows automaticamente, pausando em human gates.

## STATE SCHEMA
(usa o mesmo JSON da Solução 1 - backward compatible)

## DECISION LOGIC
1. Load all features (.context/*_orchestrator-state.json)
2. Filter active features
3. Round-robin: Execute 1 workflow phase per feature
4. IF gate detected → pause → notify user
5. IF approved → continue next phase
6. IF failed 3x → rollback
```

---

### 2. Event Store (Opcional - SQLite)

**Arquivo**: `.context/orchestrator-events.db`

**Tabela**:
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  feature TEXT,
  event_type TEXT,  -- workflow_started, gate_reached, rollback_executed
  workflow TEXT,
  phase TEXT,
  payload JSON,
  timestamp TEXT
);
```

**Benefícios**:
- Audit trail completo (quem fez o quê, quando)
- Replay events (reconstruir state a qualquer momento)
- Debugging (ver histórico de decisões)

---

### 3. Rollback Scripts

**Arquivo**: `scripts/orchestrator-rollback.sh` (40 linhas)

```bash
#!/bin/bash
feature=$1

# Get last checkpoint
commit=$(jq -r '.rollback_points[-1].commit' .context/feat-${feature}_orchestrator-state.json)

# Git rollback
git reset --hard $commit

# .context/ restore
tar -xzf .context/feat-${feature}_backup.tar.gz

# Update state
jq '.status = "failed"' .context/feat-${feature}_orchestrator-state.json > tmp && mv tmp .context/feat-${feature}_orchestrator-state.json

echo "✅ Rollback: $feature → $commit"
```

---

### 4. Batch Approval System

**Como funciona**:
1. IA executa 3 features em paralelo
2. 3 features atingem gates (screenshots) simultaneamente
3. IA notifica: "3 features aguardando screenshot validation"
4. Você valida 3 screenshots de uma vez (15min)
5. Você aprova batch: "APPROVE ALL"
6. IA resume 3 features automaticamente

**Benefício**: 1 interrupção (15min) vs 3 interrupções (5min×3 = 15min + context switching 20min)

---

## 🛠️ IMPLEMENTAÇÃO (Estimativa: 2-3h)

### Fase 2.1: Core Orchestrator (1h)

```bash
# 1. Criar agent
touch .claude/agents/workflow-orchestrator.md

# 2. Implementar decision logic (200 linhas)
# - Load features
# - Round-robin scheduler
# - Gate detection
# - Human approval flow

# 3. Testar com 2 features
# Você: "Claude, orquestra 2 features: payment, landing"
# IA: Executa workflows automaticamente até gates
```

---

### Fase 2.2: Rollback System (1h)

```bash
# 1. Criar rollback script
touch scripts/orchestrator-rollback.sh

# 2. Implementar checkpoint system
# - Backup .context/ antes de cada workflow
# - Git commit hash tracking
# - Restore on failure

# 3. Testar rollback
./scripts/orchestrator-rollback.sh payment
```

---

### Fase 2.3: Event Store (30min - OPCIONAL)

```bash
# 1. Criar SQLite database
sqlite3 .context/orchestrator-events.db < schema.sql

# 2. Log events
# - workflow_started
# - gate_reached
# - approval_granted
# - rollback_executed

# 3. Query audit trail
sqlite3 .context/orchestrator-events.db "SELECT * FROM events WHERE feature = 'feat-payment'"
```

---

## 📊 ROI ESPERADO (Solução 2 vs Solução 1)

| Métrica | Solução 1 | Solução 2 | Ganho |
|---------|-----------|-----------|-------|
| **Automação** | 0% (manual) | 70% (IA) | +70% |
| **Throughput** | 4-6 feat/sem | 8-10 feat/sem | +100% |
| **Context loss** | -30% | -50% | +20% |
| **Time in gates** | 30min/feat | 15min/batch | -50% |
| **Rollback time** | 15min manual | 2min script | -87% |

**Break-even**: 5 features (5 × 30min = 150min economizado vs 2-3h setup)

---

## 🚦 QUANDO IMPLEMENTAR

**✅ IMPLEMENTAR SE**:
- Usou Solução 1 por 2+ semanas
- Context loss < 20% (medido)
- Throughput +50% (2-3 → 4-6 features/semana)
- Você desenvolve 4+ features/semana consistentemente
- Rollback manual > 3x em 2 semanas

**❌ NÃO IMPLEMENTAR SE**:
- Overhead Solução 1 > benefício
- Você desenvolve < 3 features/semana
- Prefere controle manual (não confia IA 70%)
- ROI Solução 1 foi negativo

---

## 📚 ARQUIVOS DE REFERÊNCIA

**Pesquisa completa**:
- `docs/research/AI-WORKFLOW-ORCHESTRATOR-PATTERNS.md`
  - Pattern 1: Event-Sourced (recomendado)
  - Pattern 2: Multi-Agent (overkill)
  - Pattern 3: Lightweight (Solução 1 atual)

**Análise de workflows**:
- Agente já mapeou 31 workflows (dependências, gates, duration)
- 5 gates críticos identificados
- 70-80% automação possível

---

## 🎯 PRÓXIMOS PASSOS (Quando Decidir)

1. **Revisar ROI Solução 1** (após 2 semanas)
2. **Decidir**: Implementar Solução 2? (YES/NO/WAIT)
3. **SE YES**: Executar Fase 2.1 (orchestrator agent - 1h)
4. **Testar** 1 semana (2 features paralelas automatizadas)
5. **SE ROI positivo**: Fase 2.2 (rollback - 1h)
6. **Documentar learnings**: `~/.claude/memory/workflow.md`

---

**Localização deste arquivo**: `docs/guides/SOLUTION-2-ROADMAP.md`
**Pré-requisito**: Solução 1 rodando + ROI medido
**Tempo estimado**: 2-3h implementação
