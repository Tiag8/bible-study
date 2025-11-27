# Feature Cleanup Guide

Script para deletar ou arquivar features em desenvolvimento com segurança e rastreabilidade.

---

## Localização

```bash
./scripts/feature-cleanup.sh
```

---

## Uso Básico

### Deletar Feature Completamente

```bash
./scripts/feature-cleanup.sh <nome-feature>
```

**O que deleta**:
- ✅ Todos `.context/<nome>_*.json` (state, decisions, etc.)
- ✅ Todos `.context/<nome>_*.md` (workflow-progress, temp-memory, etc.)
- ✅ Todos `.context/<nome>_*.log` (attempts, validation)
- ✅ Git branch local `feat/<nome>` (se existir)

**Não deleta**:
- ❌ Código commitado (git history preservado)
- ❌ Arquivos em .context/archive/

---

### Arquivar Feature com Backup

```bash
./scripts/feature-cleanup.sh <nome-feature> --archive
```

**O que faz**:
- ✅ Move state files para `.context/archive/`
- ✅ Cria backup comprimido: `.context/archive/<nome>_YYYYMMDD-HHMMSS.tar.gz`
- ✅ Preserva estrutura completa
- ❌ Não deleta git branch (local)

**Ideal para**:
- Features pausadas por longo tempo
- Investigação posterior necessária
- Compliance/auditoria

---

## Exemplos Prático

### Cenário 1: Feature Completada (Deletar)

```bash
# Feature finalizada e mergeada
./scripts/feature-cleanup.sh payment

# Output
╔════════════════════════════════════════════════════════════╗
║           Feature Cleanup                                 ║
╚════════════════════════════════════════════════════════════╝

📍 Feature Details:
   Name: feat-payment
   Status: completed
   Workflow: 6a (Fase 0)
   Started: 2025-11-21T10:30:15-03:00

🗑️  Modo: DELETAR

⚠️  ATENÇÃO: Isto irá deletar PERMANENTEMENTE:
   - .context/feat-payment_*.json
   - .context/feat-payment_*.md
   - .context/feat-payment_*.log
   (Git branch feat/payment será apenas local - não afetado)

Confirmar cleanup? (yes/NO): yes

📍 Step 1/2: Deletando state files
   ✅ feat-payment_orchestrator-state.json
   ✅ feat-payment_workflow-progress.md
   ✅ feat-payment_temp-memory.md
   ✅ feat-payment_decisions.md
   ✅ feat-payment_attempts.log
   ✅ feat-payment_validation-loop.md
   ✅ Total: 6 files deletados

📍 Step 2/2: Deletando Git branch (local)
   ✅ Branch deletada: feat/payment

✅ Feature deletada com sucesso!

📦 Resumo Delete:
   Files: 6 deletados
   Branch: feat/payment deletada (se existia)

💡 Próximos passos:
   - Ver dashboard: ./scripts/feature-dashboard.sh
   - Criar nova feature: ./scripts/feature-init.sh <nome>
```

---

### Cenário 2: Feature Pausada Indefinidamente (Arquivar)

```bash
# Feature pausada há 3 semanas - arquivar para referência futura
./scripts/feature-cleanup.sh landing --archive

# Output
╔════════════════════════════════════════════════════════════╗
║           Feature Cleanup                                 ║
╚════════════════════════════════════════════════════════════╝

📍 Feature Details:
   Name: feat-landing
   Status: paused
   Workflow: 2b (Fase 1.5)
   Started: 2025-11-03T14:22:45-03:00

⚠️  Aviso: Feature está em paused (não finalizada)

🗑️  Modo: ARQUIVAR

ℹ️  Isto irá ARQUIVAR:
   - Mover state files para .context/archive/
   - Criar backup: .context/archive/feat-landing_1732193645.tar.gz
   (Git branch não será deletada)

Confirmar cleanup? (yes/NO): yes

📍 Step 1/3: Criando diretório archive
   ✅ Diretório existe: .context/archive

📍 Step 2/3: Movendo files para archive
   ✅ feat-landing_orchestrator-state.json
   ✅ feat-landing_workflow-progress.md
   ✅ feat-landing_temp-memory.md
   ✅ feat-landing_decisions.md
   ✅ feat-landing_attempts.log
   ✅ feat-landing_validation-loop.md
   ✅ Total: 6 files movidos

📍 Step 3/3: Criando tar.gz backup
   ✅ Backup criado: feat-landing_20251121-143025.tar.gz (1.2K)

✅ Feature arquivada com sucesso!

📦 Resumo Archive:
   Files: 6 movidos
   Location: .context/archive/
   Backup: .context/archive/feat-landing_20251121-143025.tar.gz

💡 Próximos passos:
   - Git branch ainda existe: git branch -d feat/landing
   - Ver dashboard: ./scripts/feature-dashboard.sh
   - Restaurar arquivos: cd .context/archive && tar -xzf ...
```

---

### Cenário 3: Feature em Desenvolvimento (Precisa Deletar)

```bash
# Feature ainda ativa mas decidiu cancelar
./scripts/feature-cleanup.sh assessment

# Output
⚠️  Aviso: Feature está em active (não finalizada)

Confirmar cleanup? (yes/NO): yes
```

**Avisos alertam** mas permitem delete:
- ⚠️ Status ativo/pausado
- Requer confirmação explícita `yes`
- Segurança: Branch não é deletada (apenas state files)

---

## Validações de Segurança

### 1. Feature Deve Existir

```bash
./scripts/feature-cleanup.sh unknown

❌ Erro: Feature não encontrada: feat-unknown
   State file não existe: .context/feat-unknown_orchestrator-state.json
```

### 2. Confirmação Obrigatória

```bash
# Se responder com "no" ou Enter (padrão)
Confirmar cleanup? (yes/NO): no
❌ Cancelado
```

Apenas `yes` (exato) processa.

### 3. Verificação Checkout (Branch Ativa)

Se você está na branch que será deletada:

```bash
📍 Step 2/2: Deletando Git branch (local)
   ℹ️  Você está na branch feat/payment - fazendo checkout em main
   ✅ Branch deletada: feat/payment
```

Script faz `git checkout main` automaticamente.

### 4. Force Delete (Branch com Commits Não-Mergeados)

Se branch tem commits não mergeados:

```bash
⚠️  Aviso: Branch não foi deletada (talvez tenha commits não mergeados)
   Use git branch -D feat/payment para forçar delete
```

Manual: `git branch -D feat/payment`

---

## Estrutura de Arquivos Deletados

Sem `--archive`:

```
.context/
├── feat-payment_orchestrator-state.json    ❌ DELETADO
├── feat-payment_workflow-progress.md       ❌ DELETADO
├── feat-payment_temp-memory.md             ❌ DELETADO
├── feat-payment_decisions.md               ❌ DELETADO
├── feat-payment_attempts.log               ❌ DELETADO
└── feat-payment_validation-loop.md         ❌ DELETADO
```

Com `--archive`:

```
.context/
├── archive/
│   ├── feat-payment_orchestrator-state.json    ✅ MOVIDO
│   ├── feat-payment_workflow-progress.md       ✅ MOVIDO
│   ├── feat-payment_temp-memory.md             ✅ MOVIDO
│   ├── feat-payment_decisions.md               ✅ MOVIDO
│   ├── feat-payment_attempts.log               ✅ MOVIDO
│   ├── feat-payment_validation-loop.md         ✅ MOVIDO
│   └── feat-payment_20251121-143025.tar.gz     ✅ BACKUP
└── other-feature_*                             ✅ PRESERVADO
```

---

## Restaurar Feature Arquivada

### Descompactar Backup

```bash
cd .context/archive
tar -xzf feat-payment_20251121-143025.tar.gz
cd ../../

# Files restaurados em .context/
ls -la .context/feat-payment_*
```

### Reativar State

```bash
./scripts/feature-update-state.sh payment status active
./scripts/feature-update-state.sh payment workflow 2b
./scripts/feature-dashboard.sh
```

---

## Limpeza Completa com Git

### Delete Feature + Branch Remote (Todos)

```bash
# 1. Cleanup local (via script)
./scripts/feature-cleanup.sh payment

# 2. Delete branch remota (se enviada)
git push origin --delete feat/payment

# 3. Verificar
git branch -a
git branch -r | grep payment  # Deve estar vazio
```

---

## Casos de Uso

### ✅ Use DELETE

- Feature completada e mergeada → main
- Feature cancelada, branch deletada
- Teste local não vai mais voltar

### ✅ Use ARCHIVE

- Feature pausada, pode voltar em futuro
- Investigação futura necessária
- Compliance/auditoria exigem backup
- Documentação histórica desejada

---

## Troubleshooting

### Erro: jq não instalado

```bash
❌ Erro: jq não instalado. Execute: brew install jq
```

**Solução**:

```bash
brew install jq
```

---

### State File Corrupto

```bash
❌ Erro: Feature não encontrada: feat-X
   State file não existe: .context/feat-X_orchestrator-state.json
```

**Solução**:

1. Verificar se existe em `archive/`:
   ```bash
   ls -la .context/archive/feat-X_*
   ```

2. Se em archive, restaurar:
   ```bash
   cd .context/archive && tar -xzf feat-X_*.tar.gz && cd ../../
   ```

3. Se realmente perdido, recriar:
   ```bash
   ./scripts/feature-init.sh X
   ```

---

### Branch Não Deleta

```bash
⚠️  Aviso: Branch não foi deletada (talvez tenha commits não mergeados)
   Use git branch -D feat/payment para forçar delete
```

**Solução**:

```bash
# Forçar delete (perdendo commits não-mergeados)
git branch -D feat/payment

# OU mesclar primeiro
git checkout main
git merge feat/payment
git branch -d feat/payment
```

---

## Integração com Feature Orchestrator

### Dashboard

Ver todas features (inclusive arquivadas):

```bash
./scripts/feature-dashboard.sh
```

### Criar Nova Feature

```bash
./scripts/feature-init.sh <nome>
```

### Atualizar Estado

```bash
./scripts/feature-update-state.sh <nome> status completed
./scripts/feature-cleanup.sh <nome>
```

---

## Alias Útil

Adicionar ao `~/.zshrc` ou `~/.bashrc`:

```bash
alias fc='./scripts/feature-cleanup.sh'
alias fca='./scripts/feature-cleanup.sh $1 --archive'
```

Uso:

```bash
fc payment              # Delete
fca landing             # Archive
```

---

## Compliance & Segurança

✅ **Segurança**:
- Confirmação explícita obrigatória
- Aviso para features ativas/pausadas
- Backup automático com `--archive`
- Timestamp preservado em archive

✅ **Auditoria**:
- Archive com data/hora
- Tar.gz preserva metadados
- Logs não deletados antes de considerar

✅ **Recovery**:
- `--archive` modo não-destrutivo
- Backup comprimido recuperável
- Git branch intacta para referência

---

## Referência Rápida

```bash
# Ver features ativas
./scripts/feature-dashboard.sh

# Deletar completamente
./scripts/feature-cleanup.sh <nome>

# Arquivar com backup
./scripts/feature-cleanup.sh <nome> --archive

# Restaurar arquivo
cd .context/archive && tar -xzf <arquivo>.tar.gz

# Listar arquivos
ls .context/archive/

# Help
./scripts/feature-cleanup.sh
```

---

**Versão**: 1.0.0
**Atualizado**: 2025-11-21
**Compliance**: REGRA #11 (Simplicidade), REGRA #28 (Feature Orchestrator)
