---
description: Workflow Add-Feature (0/9) - Setup Unificado (Context + Backup + Branch)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler: `docs/PLAN.md`, `docs/TASK.md`, README.md, `.windsurf/workflows`, `docs/`, `scripts/`

---

# Workflow 0: Setup Unificado (Context + Backup + Branch)

**Consolidação**: Este workflow unifica Workflow 0 (Context Init) + Workflow 4 (Setup) em um único fluxo.

**O que acontece**:
- Fase 1: Inicializar .context/ (Working Memory)
- Fase 2: Checkpoint (Backup via MCP)
- Fase 3: Sincronizar com Main
- Fase 4: Criar Branch Git

**Por que unificado**: Elimina duplicação, reduz 2 workflows → 1, mantém atomicidade do setup.

---

## 🤖 REGRA: 3 Agentes em Paralelo

**Após Fase 1**, executar em paralelo:
- Agent 1: Criar backup (Fase 2)
- Agent 2: Sincronizar com main (Fase 3)
- Agent 3: Criar branch git (Fase 4)

---

## 📂 Fase 1: Inicializar .context/ (Working Memory)

**OBRIGATÓRIO**: Executar ANTES de qualquer outro passo.

```bash
./scripts/context-init.sh <feature-name>
```

**Output**: 6 arquivos .context/ criados:
- INDEX.md (guia de leitura LLM)
- {prefix}_workflow-progress.md
- {prefix}_temp-memory.md
- {prefix}_decisions.md
- {prefix}_attempts.log
- {prefix}_validation-loop.md

**Validação**:
```bash
ls -la .context/
# Deve ter 6+ arquivos
```

---

## 💾 Fase 2: Checkpoint (Backup via MCP)

### 2.1 Backup via MCP Supabase (OBRIGATÓRIO)

**Tabelas Críticas**:
- `lifetracker_profiles` (sempre)
- Outras tabelas modificadas pela feature

**Comandos MCP**:
```typescript
// 1. Backup tabela principal
mcp__supabase_lifetracker__execute_sql({
  query: `SELECT * FROM lifetracker_profiles ORDER BY created_at DESC;`
});

// 2. Estatísticas pré-migration
mcp__supabase_lifetracker__execute_sql({
  query: `
    SELECT
      COUNT(*) as total,
      COUNT(phone_number) as with_phone
    FROM lifetracker_profiles;
  `
});
```

**Salvar em**: `backups/backup-[tabela]-pre-migration-YYYYMMDD.json`

### 2.2 Fallback: Script Shell

```bash
./scripts/backup-supabase.sh  # Requer .env configurado
```

---

## 🔄 Fase 3: Sincronizar com Main

### 3.1 Atualizar Main
```bash
git checkout main
git pull origin main
```

### 3.2 Verificar Conteúdo
```bash
git log --oneline -3
```

**Checkpoint**: Main tem docs/, scripts/, .env.example

---

## 🌿 Fase 4: Criar Branch Git

### REGRA: SEMPRE usar script automatizado

```bash
./scripts/create-feature-branch.sh "<feature-name>"
```

**❌ NUNCA `git checkout -b` manual** - risco de perder código!

### Script Inteligente: 3 Cenários

1. **Branch SEM commits não mergeados** → Cria de main
2. **Branch COM commits não mergeados** → Oferece opções (criar de atual ou main)
3. **Cancelar** → Fazer merge/push primeiro

---

## 🔀 Fase 4.5: Worktree Mode (OPCIONAL)

**QUANDO usar worktree mode**:

| Cenário | Use Worktree | Por quê |
|---------|--------------|---------|
| 🔄 **Múltiplas features simultâneas** | ✅ SIM | Context switch < 10s (vs 2-5min branch) |
| 🚨 **Bugfix urgente durante feature** | ✅ SIM | Pausa feature sem stash/commit |
| 👁️ **Comparar implementações lado a lado** | ✅ SIM | Ver ambos códigos simultaneamente |
| 🔁 **Context switching frequente** | ✅ SIM | Alternar 3+ vezes/dia entre features |
| 🏗️ **Build/test paralelo** | ✅ SIM | Rodar testes feat-A enquanto codifica feat-B |
| 📝 **Feature única** | ❌ NÃO | Branch mode mais simples |
| 🆕 **Primeiro worktree** | ⚠️ AVALIAR | Consultar skill `worktree-navigator` primeiro |
| 💾 **Disk space < 2GB** | ❌ NÃO | Worktree ≈ +500MB por feature |

### 4.5.1 Criar Worktree (Alternativa à Fase 4)

**Se optar por worktree mode**, SUBSTITUIR Fase 4 por:

```bash
# OPÇÃO 1: Feature-init com flag --worktree
./scripts/feature-init.sh <feature-name> --worktree

# OPÇÃO 2: Worktree-manager direto
./scripts/worktree-manager.sh create <feature-name>
```

**Output**:
- Worktree criado em: `/Users/tiago/Projects/life_tracker-<feature>`
- Branch: `feat/<feature-name>` (ou existente)
- .context/ inicializado automaticamente
- npm dependencies instaladas

**Comandos úteis**:
```bash
# Listar worktrees ativos
./scripts/worktree-manager.sh list

# Status detalhado (commits, changes)
./scripts/worktree-manager.sh status

# Remover worktree (após merge)
./scripts/worktree-manager.sh remove <feature-name>
```

### 4.5.2 Trade-offs Worktree Mode

**✅ Benefícios**:
- Context switch instantâneo (< 10s vs 2-5min)
- Zero code loss risk (cada feature isolada)
- Desenvolvimento paralelo real (2+ features)
- Pausa feature sem cleanup (stash/commit)

**⚠️ Custos**:
- Disk space: +500MB por worktree (node_modules duplicado)
- Complexidade: Gerenciar múltiplos diretórios
- Learning curve: Conceito worktree novo

**🎯 Decisão**: Consultar skill `worktree-navigator` para análise contextual completa.

### 4.5.3 Exemplo: Bugfix Urgente Durante Feature

**Cenário**: Você está implementando feat-payment (Workflow 5a) e aparece bug crítico em produção.

**Sem Worktree** (branch mode):
```bash
git stash                    # Salvar work-in-progress
git checkout main
git checkout -b fix/critical
# ... fix, commit, push ...
git checkout feat-payment
git stash pop               # Risco de conflitos
```
**Tempo**: 5-10 min + risco conflitos

**Com Worktree** (worktree mode):
```bash
./scripts/worktree-manager.sh create fix-critical
cd ../life_tracker-fix-critical
# ... fix, commit, push ...
./scripts/worktree-manager.sh remove fix-critical
cd /Users/tiago/Projects/life_tracker-payment
# Continuar feat-payment onde parou (zero interrupção)
```
**Tempo**: 2-3 min + zero conflitos

---

## 🧭 Workflow Navigator: Escolha de Mode

**Perguntas para Decisão**:
1. Você vai trabalhar em 2+ features simultaneamente? → **Worktree**
2. Existe risco de bugfix urgente interromper? → **Worktree**
3. Você precisa comparar implementações lado a lado? → **Worktree**
4. É feature única sem interrupções previstas? → **Branch**
5. Você tem < 2GB disk space livre? → **Branch**
6. É primeiro worktree (nunca usou antes)? → **Consultar `worktree-navigator`**

**Skill Inteligente**:
```
"Vou trabalhar em payment e auth ao mesmo tempo"
→ Claude ativa skill `worktree-navigator`
→ Analisa contexto
→ Recomenda worktree mode + comandos
```

---

## ✅ Checkpoint: Setup Completo!

**Resumo**:
- ✅ .context/ inicializado (6 arquivos)
- ✅ Backup criado (MCP)
- ✅ Main sincronizada
- ✅ Branch feature criada

**Próximo**: Workflow 1 (Planning) - `/add-feature-1-planning`

---

## 🧠 FASE FINAL: UPDATE CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

# Log no attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 0 (Setup Unificado) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ACTION: .context/ + backup + branch criados" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 1] - Planning**: Setup completo → iniciar planejamento com GATE 1 Reframing.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| Bug crítico em produção | fast-track-critical-bug | Correção urgente, pular setup completo |
| Feature já planejada anteriormente | 2b (Technical Design) | Já tem GATE 1 aprovado, ir direto para design |
| Apenas hotfix simples (< 20 linhas) | 5a (Implementation) | Setup mínimo suficiente |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| .context/ corrompido ou faltando | 0 Fase 1 | Re-inicializar working memory |
| Branch errada ou conflitos | 0 Fase 4 | Recriar branch corretamente |
| Backup não existe | 0 Fase 2 | Criar backup antes de continuar |

### Regras de Ouro
- ⛔ **NUNCA pular**: Fase 1 (.context/) - working memory essencial para context
- ⚠️ **Workflow 4 DEPRECADO**: Este workflow substitui completamente o antigo Workflow 4
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto

---

**Workflow criado**: 2025-12-01 | **Parte**: 0 de 9
**Nota**: Workflow 4 (add-feature-4-setup.md) DEPRECADO - usar este workflow unificado
