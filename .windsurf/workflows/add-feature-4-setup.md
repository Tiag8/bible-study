---
description: Workflow Add-Feature (4/9) - Setup (Preparação do Ambiente)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler: `docs/PLAN.md`, `docs/TASK.md`, README.md, AGENTS.md, `.windsurf/workflows`, `docs/`, `scripts/`

---

## 🤖 REGRA CRÍTICA: Uso Máximo de Agentes em Paralelo

**OBRIGATÓRIO**: SEMPRE usar máximo de agentes possível em paralelo.

**Fases independentes deste workflow** (rodar em paralelo):
- Agent 1: Criar backup (Fase 7)
- Agent 2: Sincronizar com main (Fase 8)
- Agent 3: Criar branch git (Fase 9)

**Benefícios**: Redução drástica de tempo, melhor uso de recursos

---

# Workflow 4/11: Setup (Preparação do Ambiente)

**O que acontece**:
- Fase 7: Checkpoint (Backup)
- Fase 8: Sincronizar com Main
- Fase 9: Criar Branch Git

**Por que**: Backup permite rollback, sync garante código atualizado, branch isola mudanças

---

## 💾 Fase 7: Checkpoint (Backup)

// turbo

### Opção A: Dump Lógico (padrão)
```bash
./scripts/backup-supabase.sh
```

**Quando**: Migration simples, rollback rápido, baixo risco

**Output esperado**:
```
✅ Backup criado: backups/backup-YYYYMMDD-HHMMSS.sql
🔄 Restaurar: ./scripts/restore-supabase.sh <arquivo>
```

### Opção B: Preview Branch (mudanças grandes)
```bash
supabase branches create feature-backup
```

**Quando**: Migration complexa, teste isolado necessário

---

## 🔄 Fase 8: Sincronizar com Main (CRÍTICO!)

**⚠️ IMPORTANTE**: Sempre partir da `main` atualizada para garantir documentação/scripts mais recentes.

**📌 NOTA**: Script `create-feature-branch.sh` detecta automaticamente commits não mergeados e oferece alternativas seguras (ver Fase 9).

### 8.1 Atualizar Main
```bash
git checkout main
git pull origin main
```

### 8.2 Verificar Conteúdo
```bash
ls -la docs/ scripts/
git log --oneline -5
```

**✅ Checkpoint**: Confirme que main tem:
- [ ] `docs/` completa (adr, arquitetura, regras-de-negocio)
- [ ] `scripts/` com shell scripts
- [ ] `.env.example` atualizado

---

## 🌿 Fase 9: Criar Branch Git

// turbo

### 🚨 REGRA: SEMPRE usar script automatizado
```bash
./scripts/create-feature-branch.sh "add-profit-cards-makeup"
```

**❌ NUNCA `git checkout -b` manual** - pode perder código não mergeado!

---

### 🔍 Script Inteligente: 3 Cenários

#### Cenário 1: Branch SEM commits não mergeados
```bash
./scripts/create-feature-branch.sh "add-profit-cards-makeup"

# Output:
✅ Branch atual sincronizada com main
✅ Criando 'feat/add-profit-cards-makeup' a partir de 'main'
```

#### Cenário 2: Branch COM commits não mergeados
```bash
./scripts/create-feature-branch.sh "add-profit-cards-makeup"

# Output:
🚨 Branch atual tem 6 commit(s) NÃO MERGEADOS!

Opções:
  1) Criar a partir de 'feat/current-work' (RECOMENDADO)
  2) Criar a partir de 'main' (PERDERÁ 6 commits)
  3) Cancelar e fazer merge/push primeiro
```

**Opção 1** (RECOMENDADO): Nova feature depende do trabalho atual. Zero risco de perda.

**Opção 2** (RISCO): Feature completamente independente. Pode perder 117 arquivos.

**Opção 3** (MAIS SEGURO): Trabalho atual pronto para merge. Workflow completo:
```bash
# 1. Commit e push
git add . && git commit -m "feat: finalizar current work"
git push -u origin feat/current-work

# 2. Abrir PR e merge via GitHub

# 3. Atualizar main
git checkout main && git pull origin main

# 4. Criar nova branch
./scripts/create-feature-branch.sh "add-profit-cards-makeup"
```

### 📝 Histórico de Branches
```bash
cat .git/branch-history.log

# Output:
# 2025-11-01 21:30:45 | feat/add-profit-cards-makeup | de: feat/current-work
```

**Útil para**: Rastrear origem, debug, auditoria

### ✅ Convenção de Nomes (automática)
Script adiciona prefixo: `feat/`, `fix/`, `refactor/`, `docs/`, `test/`

### 📚 Documentação Completa
Ver `docs/WORKFLOW_BRANCHES.md`: Histórico do problema (perda 117 arquivos), solução, workflows, lições

---

**✅ Branch criada com segurança!**
- ✅ Código base + documentação + scripts
- ✅ Nenhum código perdido

---

## ✅ Checkpoint: Ambiente Preparado!

**Resumo**:
- ✅ Backup criado
- ✅ Main sincronizada
- ✅ Branch criada

**Status**: Branch `feat/add-profit-cards-makeup`, Base `main`, Backup disponível

**Próximo**: Implementar código (TDD + commits pequenos)

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua.

**Objetivo**: Identificar melhorias sistêmicas (não pontuais).

### Questões de Reflexão (TODAS)

**1. Eficiência (Nota 1-10)**:
- [ ] Nota: __/10 (Se < 8: qual fase ineficiente? como melhorar?)
- [ ] Fase lenta? Por quê?

**2. Iterações**:
- [ ] Número: __ (Se > 3: o que causou? como tornar autônomo?)

**3. Gaps**:
- [ ] Validação faltou? (onde inserir checklist?)
- [ ] Gate falhou? (qual melhorar?)
- [ ] Comando repetido 3+ vezes? (automatizar?)

**4. RCA - Se problema identificado**:
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados? (causa raiz sistêmica, não sintoma)
- [ ] Afeta múltiplas features? (SE NÃO: descartar - não sistêmico)
- [ ] Meta-learning previne recorrência?

### Ações de Melhoria

**Documentação**:
- [ ] Workflow precisa melhorias? → Alterações
- [ ] CLAUDE.md precisa novo padrão? → Especificar
- [ ] Novo script útil? → Nome + função
- [ ] ADR necessário? → Decisão a documentar

**ROI Esperado**: [ex: "20min economizadas/feature" ou "Previne 2h debugging"]

### ⚠️ IMPORTANTE
- **Só learnings SISTÊMICOS** (não específicos desta feature)
- **RCA obrigatório** para validar se é sistêmico
- **Consolidação final** em Workflow 8a

### Validação Tamanho
```bash
wc -c .windsurf/workflows/add-feature-4-setup.md
# ✅ < 12000 chars | ❌ > 12000: comprimir ou dividir
```

**Checklist otimização** (se > 11k):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows (se > 12k)

---

---

## 🚨 REGRA CRÍTICA: ANTI-ROI

**NUNCA calcule ou mencione**:
- ❌ ROI (Return on Investment)
- ❌ Tempo de execução/produção
- ❌ "Horas economizadas"
- ❌ Estimativas temporais (Xmin vs Ymin)

**Por quê**:
- Projeto desenvolvido por IA (não humanos)
- IA executa tarefas em paralelo (não linear)
- Cálculos consomem tokens sem valor
- Polui documentação com dados irrelevantes

**Permitido**:
- ✅ Evidências concretas (código, logs, testes)
- ✅ Comparações qualitativas ("mais rápido", "mais eficiente")
- ✅ Métricas técnicas (latência, throughput, memory usage)

**Regra**: NEVER guess time/ROI. Use dados concretos ou não mencione.

---

## 🔄 Próximo Workflow
```
Acionar: .windsurf/workflows/add-feature-5-implementation.md
```
Ou: `/add-feature-5-implementation`

---

**Workflow criado**: 2025-10-27 | **Parte**: 4 de 9 | **Próximo**: Implementation (Código + TDD)

## 📝 Atualização de Documentação
- [ ] Atualizar `docs/TASK.md` com status
- [ ] Atualizar `docs/PLAN.md` se mudança estratégica
- [ ] Criar ADR em `docs/adr/` se decisão arquitetural

---
