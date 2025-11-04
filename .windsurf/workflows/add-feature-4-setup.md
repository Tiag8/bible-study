---
description: Workflow Add-Feature (4/9) - Setup (Preparação do Ambiente)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `README.md` - Descrição do projeto
- `AGENTS.md` - Comportamento dos agents
- `.windsurf/workflows` - Todos workflows em etapas (arquivos diferentes)
- `docs/` - Todos documentos importantes
- `scripts/` - Todos scrips importantes

---

## 🤖 ⚡ REGRA CRÍTICA: Uso Máximo de Agentes em Paralelo

> **🚨 OBRIGATÓRIO: SEMPRE usar o máximo de agentes possível** em paralelo para otimizar performance.

### Quando Usar Múltiplos Agentes
- **SEMPRE** que houver tarefas independentes que possam ser executadas simultaneamente
- Backup + Sincronização com main + Verificação de documentação
- Atualização de múltiplos arquivos em paralelo
- Análise de dependências + verificação de configurações simultânea
- Testes em diferentes módulos/componentes

### Como Usar Agentes em Paralelo

Este workflow tem **3 fases independentes** que podem rodar em paralelo:

```markdown
# Exemplo: Lançar 3 agentes simultaneamente
- Agent 1: Criar backup (Fase 7)
- Agent 2: Sincronizar com main (Fase 8)
- Agent 3: Criar branch git (Fase 9)
```

**Benefícios**:
- ⚡ Redução drástica do tempo de execução (3 fases em paralelo)
- 🎯 Melhor uso de recursos
- 🚀 Maior throughput de tarefas
- 💡 Execução simultânea de operações independentes

---

# Workflow 4/11: Setup (Preparação do Ambiente)

Este é o **quarto workflow** de 11 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 7: Checkpoint (Backup do banco de dados)
- Fase 8: Sincronizar com Main (garantir código atualizado)
- Fase 9: Criar Branch Git (isolar mudanças)

**Por que essas etapas são importantes?**
- ✅ Backup permite rollback seguro se algo der errado
- ✅ Sync garante que você tem código/docs/scripts mais recentes
- ✅ Branch isola mudanças e facilita merge depois

---

## 💾 Fase 7: Checkpoint (Backup)

// turbo

Antes de tocar no código, vou criar um backup de segurança conforme estratégia definida na análise de riscos.

### Opção A: Dump Lógico (padrão para mudanças pequenas)

```bash
./scripts/backup-supabase.sh
```

**Quando usar**:
- Não tem migration ou migration simples
- Rollback precisa ser rápido
- Mudança de baixo risco

**Output esperado**:
```
✅ Backup criado com sucesso!
📁 Localização: backups/backup-20251027-143022.sql
🔄 Pode restaurar com: ./scripts/restore-supabase.sh backups/backup-20251027-143022.sql
```

---

### Opção B: Preview Branch (para mudanças grandes com migrations)

```bash
# Criar Preview Branch no Supabase Dashboard
# Ou via CLI (se configurado):
supabase branches create feature-backup
```

**Quando usar**:
- Migration complexa (mudar schema, adicionar tabelas)
- Quer testar antes em ambiente isolado
- Precisa garantir que migration funciona

**Output esperado**:
```
✅ Preview Branch criada com sucesso!
🌿 Branch ID: feature-backup
🔗 Connection string: [fornecido pelo Supabase]
```

---

**✅ Backup criado com sucesso!**

- **Localização**: `backups/backup-YYYYMMDD-HHMMSS.sql`
- **Pode restaurar com**: `./scripts/restore-supabase.sh <arquivo>`

---

## 🔄 Fase 8: Sincronizar com Main (CRÍTICO!)

**⚠️ IMPORTANTE**: Sempre certifique-se de que sua branch parte da `main` atualizada para garantir que tenha toda documentação e arquivos mais recentes.

**📌 NOTA**: O script de criação de branches (`create-feature-branch.sh`) é inteligente e detecta automaticamente se sua branch atual tem commits não mergeados. Dependendo da situação, ele oferecerá alternativas seguras (ver Fase 9).

### 8.1 Atualizar Main

```bash
# Ir para main
git checkout main

# Puxar últimas mudanças
git pull origin main
```

**Output esperado**:
```
Switched to branch 'main'
Already up to date.
```
Ou:
```
Updating abc1234..def5678
Fast-forward
 docs/features/makeup.md | 45 ++++++++++++++++++++++++++++++++++++
 scripts/run-tests.sh    | 12 ++++++++--
 2 files changed, 55 insertions(+), 2 deletions(-)
```

---

### 8.2 Verificar o que tem na Main

```bash
# Ver estrutura de docs/
ls -la docs/

# Ver estrutura de scripts/
ls -la scripts/

# Verificar que tem tudo necessário
git log --oneline -5
```

**✅ Checkpoint**: Confirme que a main tem:
- [ ] Pasta `docs/` completa (adr, arquitetura, regras-de-negocio, supabase)
- [ ] Pasta `scripts/` com shell scripts
- [ ] `.env.example` atualizado
- [ ] README.md completo

**Por que isso importa?**
- Se criar branch de uma main desatualizada, vai faltar arquivos importantes!
- Vai faltar documentação recente de outras features
- Pode ter conflitos desnecessários depois
- Scripts podem estar bugados/desatualizados

---

## 🌿 Fase 9: Criar Branch Git

// turbo

### 🚨 REGRA DE OURO: SEMPRE usar o script automatizado

```bash
./scripts/create-feature-branch.sh "add-profit-cards-makeup"
```

**❌ NUNCA use `git checkout -b` manual** - você pode perder código não mergeado!

---

### 🔍 O Script Inteligente: 3 Cenários Possíveis

O script `create-feature-branch.sh` foi completamente reescrito com **detecção automática de código não mergeado**.

#### 📊 Cenário 1: Branch atual SEM commits não mergeados

```bash
# Você está em: feat/old-feature (já mergeada na main)
./scripts/create-feature-branch.sh "add-profit-cards-makeup"

# Output:
✅ Branch atual sincronizada com main
✅ Criando branch 'feat/add-profit-cards-makeup' a partir de 'main'
```

**O que acontece**:
- Script detecta automaticamente que não há risco de perda
- Cria branch normalmente a partir da `main`
- Você está seguro!

---

#### 🚨 Cenário 2: Branch atual COM commits não mergeados (ATENÇÃO!)

```bash
# Você está em: feat/current-work (6 commits não mergeados)
./scripts/create-feature-branch.sh "add-profit-cards-makeup"

# Output:
🚨 ATENÇÃO: Branch atual tem 6 commit(s) NÃO MERGEADOS na main!

Escolha uma opção:
  1) Criar branch a partir de 'feat/current-work' (RECOMENDADO)
     → Nova branch terá TODO o trabalho atual

  2) Criar branch a partir de 'main'
     → PERDERÁ os 6 commits da branch atual

  3) Cancelar e fazer merge/push primeiro
```

**Você TEM 3 opções seguras:**

##### 🎯 Opção 1: Criar a partir da branch atual (RECOMENDADO)

```bash
# Escolha: 1

# Resultado:
✅ Branch 'feat/add-profit-cards-makeup' criada a partir de 'feat/current-work'
📝 Nova branch inclui TODOS os 6 commits não mergeados
✅ Nenhum código foi perdido!
```

**Quando usar**:
- ✅ Nova feature depende do trabalho atual
- ✅ Quer construir sobre código não mergeado
- ✅ Vai mergear tudo junto depois

**Vantagens**:
- Mantém TODO o trabalho
- Zero risco de perda
- Workflow natural de desenvolvimento

---

##### ⚠️ Opção 2: Criar a partir da main (PERDA DE CÓDIGO!)

```bash
# Escolha: 2

# Confirmação obrigatória:
⚠️ AVISO: Isso criará uma branch SEM os 6 commits não mergeados!
Tem certeza? (digite 'sim'): sim

# Resultado:
✅ Branch 'feat/add-profit-cards-makeup' criada a partir de 'main'
⚠️ Os 6 commits da branch anterior NÃO estão incluídos
```

**Quando usar**:
- Nova feature é COMPLETAMENTE independente
- Trabalho atual está em branch separada (vai mergear depois)
- Você TEM CERTEZA que não precisa do código atual

**Riscos**:
- ⚠️ Pode perder 117 arquivos (como aconteceu em 2025-11-01)
- ⚠️ Perde documentação, scripts, workflows
- ⚠️ Difícil recuperar depois

---

##### 🛡️ Opção 3: Cancelar e fazer merge primeiro (MAIS SEGURO)

```bash
# Escolha: 3

# Script sugere:
💡 Sugestão:
  1. Commit do trabalho atual
  2. Push da branch: git push -u origin feat/current-work
  3. Abrir PR e fazer merge na main
  4. Atualizar main local: git checkout main && git pull
  5. Rodar novamente: ./scripts/create-feature-branch.sh "add-profit-cards-makeup"

🚪 Operação cancelada
```

**Quando usar**:
- ✅ Trabalho atual está pronto para merge
- ✅ Quer manter branches limpas e organizadas
- ✅ Nova feature é independente

**Workflow completo**:
```bash
# 1. Commit e push da branch atual
git add .
git commit -m "feat: finalizar current work"
git push -u origin feat/current-work

# 2. Abrir PR no GitHub
gh pr create --title "Feat: current work" --body "..."

# 3. Fazer merge do PR (via GitHub UI ou CLI)

# 4. Atualizar main local
git checkout main
git pull origin main

# 5. AGORA criar nova branch (sem conflitos)
./scripts/create-feature-branch.sh "add-profit-cards-makeup"
```

---

### 📝 Histórico de Branches (Auditoria)

O script mantém log automático em `.git/branch-history.log`:

```bash
# Ver histórico de criação
cat .git/branch-history.log

# Output exemplo:
2025-11-01 21:30:45 -03 | feat/add-profit-cards-makeup | criada a partir de: feat/current-work (estava em: feat/current-work)
2025-11-01 18:15:22 -03 | feat/whatsapp-uazapi | criada a partir de: main (estava em: main)
```

**Por que isso é útil?**
- 🔍 Rastreia de onde cada branch foi criada
- 🐛 Facilita debug quando algo dá errado
- 📊 Auditoria de decisões de branching
- 🛡️ Evidência de que seguiu o processo correto

---

### ✅ Convenção de Nomes (automatizada pelo script)

O script adiciona automaticamente o prefixo correto:

```bash
# Você digita:
./scripts/create-feature-branch.sh "add-profit-cards-makeup"

# Script cria:
feat/add-profit-cards-makeup
```

**Prefixos disponíveis**:
- `feat/` - Nova funcionalidade (padrão)
- `fix/` - Correção de bug
- `refactor/` - Refatoração
- `docs/` - Atualização de documentação
- `test/` - Adicionar testes

---

### 📚 Documentação Completa

Para mais detalhes sobre o sistema de branches, consulte:
```
docs/WORKFLOW_BRANCHES.md
```

Inclui:
- 🚨 Histórico do problema (perda de 117 arquivos)
- ✅ Solução implementada
- 📋 Workflows completos de cada cenário
- 🎓 Lições aprendidas
- 🔄 Processo de recuperação (caso aconteça novamente)

---

**✅ Branch criada com segurança!**

Dependendo da opção escolhida, sua nova branch tem:
- ✅ Código base (main ou branch atual)
- ✅ Toda documentação (`docs/`)
- ✅ Scripts de automação (`scripts/`)
- ✅ Configurações (`.env.example`)
- ✅ Histórico de commits necessário
- ✅ Nenhum código perdido!

---

## ✅ Checkpoint: Ambiente Preparado!

**Resumo do que foi feito:**
- ✅ Backup criado (segurança garantida)
- ✅ Main sincronizada (código atualizado)
- ✅ Branch criada (isolamento de mudanças)

**Status atual**:
- Branch: `feat/add-profit-cards-makeup`
- Base: `main` (atualizada)
- Backup: `backups/backup-YYYYMMDD-HHMMSS.sql`

**Próxima etapa:** Implementar código com TDD, pequenos commits e testes automáticos!

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-5-implementation.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-5-implementation`

---

**Workflow criado em**: 2025-10-27
**Parte**: 4 de 9
**Próximo**: Implementation (Código + TDD + Testes)


## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural

---