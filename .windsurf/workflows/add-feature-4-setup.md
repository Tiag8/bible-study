---
description: Workflow Add-Feature (4/9) - Setup (Preparação do Ambiente)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler: `docs/PLAN.md`, `docs/TASK.md`, README.md, AGENTS.md, `.windsurf/workflows`, `docs/`, `scripts/`

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler INDEX.md (Guia de Leitura)

```bash
cat .context/INDEX.md
```

**Entender**:
- Ordem de leitura dos arquivos
- O que cada arquivo faz
- Checklists obrigatórios

### 0.2. Ler Context Files (Ordem Definida em INDEX.md)

```bash
# Prefixo da branch (ex: feat-members)
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

# 1. Onde estou agora?
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 2. Estado atual resumido
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 3. Decisões já tomadas
cat .context/${BRANCH_PREFIX}_decisions.md

# 4. Histórico completo (últimas 30 linhas)
tail -30 .context/${BRANCH_PREFIX}_attempts.log
```

### 0.3. Validação Context Loaded

**Checklist**:
- [ ] Li INDEX.md?
- [ ] Li workflow-progress.md (onde estou)?
- [ ] Li temp-memory.md (estado atual)?
- [ ] Li decisions.md (decisões já tomadas)?
- [ ] Li últimas 30 linhas de attempts.log?

**Se NÃO leu**: ⛔ PARAR e ler AGORA.

### 0.4. Log Início Workflow

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 4 (Setup) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

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

### 🚨 MÉTODO OBRIGATÓRIO: MCP Supabase

**Por quê MCP**:
- ✅ Não requer `.env` configurado
- ✅ Usa autenticação MCP (já configurada)
- ✅ Backup JSON estruturado (fácil restaurar)
- ✅ Snapshot completo de tabelas críticas
- ❌ Script `backup-supabase.sh` falha sem `.env`

---

### 7.1. Backup via MCP (OBRIGATÓRIO)

**Tabelas Críticas a Backupear**:
- `lifetracker_profiles` (sempre)
- Outras tabelas modificadas pela feature (se aplicável)

**Comando MCP**:
```typescript
// 1. Listar colunas da tabela
mcp5_execute_sql({
  query: `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'lifetracker_profiles'
    ORDER BY ordinal_position;
  `
});

// 2. Backup completo da tabela
mcp5_execute_sql({
  query: `
    SELECT *
    FROM lifetracker_profiles
    ORDER BY created_at DESC;
  `
});

// 3. Estatísticas pré-migration
mcp5_execute_sql({
  query: `
    SELECT 
      COUNT(*) as total_profiles,
      COUNT(phone_number) as profiles_with_phone,
      COUNT(CASE WHEN whatsapp_verified = true THEN 1 END) as whatsapp_verified_count
    FROM lifetracker_profiles;
  `
});
```

**Salvar Backup**:
```bash
# Criar arquivo JSON com dados
# Arquivo: backups/backup-[tabela]-pre-migration-YYYYMMDD.json
```

**Template Backup JSON**:
```json
{
  "backup_metadata": {
    "date": "YYYY-MM-DDTHH:mm:ss-03:00",
    "feature": "Nome da Feature",
    "workflow": "4 (Setup)",
    "purpose": "Backup PRÉ-MIGRATION",
    "total_records": 12,
    "method": "MCP Supabase (mcp5_execute_sql)"
  },
  "schema_before": {
    "columns": ["col1", "col2", ...],
    "total_columns": 15
  },
  "records": [
    { "id": "...", "field": "..." }
  ],
  "restore_instructions": {
    "rollback_migration": "Aplicar migration reversa",
    "manual_restore": "UPDATE ... WHERE ..."
  }
}
```

**Documentação**:
```bash
# Criar README do backup
# Arquivo: backups/BACKUP_README.md
```

---

### 7.2. Fallback: Script Shell (SE MCP falhar)

**Apenas se MCP Supabase não disponível**:
```bash
./scripts/backup-supabase.sh
```

**Requer**: Arquivo `.env` configurado com `SUPABASE_DB_PASSWORD`

---

### 7.3. Opção Avançada: Preview Branch

**Quando**: Migration complexa, teste isolado necessário
```bash
supabase branches create feature-backup
```

**Requer**: Supabase Pro plan

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

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 4: Setup ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Checkpoint criado (backup Supabase)
  - Main branch sincronizada
  - Branch git criada com sistema inteligente
  - WIP/uncommitted changes preservados
- **Outputs**:
  - Backup disponível em backups/
  - Main atualizada (docs/, scripts/, .env.example)
  - Branch isolada criada (feat/...)
  - Histórico registrado em .branch-history.log
- **Next**: Workflow 5a (Implementation)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 4 (Setup) concluído com sucesso.

**Ambiente preparado**:
- Backup criado: [arquivo backup]
- Main sincronizada: [último commit]
- Branch criada: [nome da branch]

**Próximo passo**: Executar Workflow 5a (Implementation) para implementar código com TDD.

---

## Próximos Passos

- [ ] Executar Workflow 5a (Implementation)
- [ ] Implementar em pequenos diffs (8+ commits)
- [ ] Aplicar TDD quando apropriado
- [ ] Validar testes automatizados

---

## Decisões Pendentes

- [ ] Nenhuma (Setup concluído)

EOF

# Substituir seção no arquivo original (preservar "Última Atualização")
sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se escolhemos criar branch a partir de outra (não main)
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 4 - Setup
- **Decisão**: Branch criada a partir de [main / outra branch]
- **Por quê**: [Commits uncommitted / feature dependente / independente]
- **Trade-off**: [Zero risco perda vs isolamento total]
- **Alternativas consideradas**: [Opção rejeitada]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 4 (Setup) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] DECISION: Branch [nome] criada - backup disponível" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + decisões)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

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
