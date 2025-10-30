---
description: Workflow Add-Feature (4/9) - Setup (Preparação do Ambiente)
---

# Workflow 4/9: Setup (Preparação do Ambiente)

Este é o **quarto workflow** de 9 etapas modulares para adicionar uma nova funcionalidade.

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

### Opção A: Via Script (Recomendado)

```bash
./scripts/create-feature-branch.sh "add-profit-cards-makeup"
```

**O que o script faz**:
1. Verifica se está na main
2. Puxa últimas mudanças
3. Cria branch com nome padronizado (`feat/add-profit-cards-makeup`)
4. Faz checkout para a nova branch

---

### Opção B: Manual

```bash
# Certifique-se de estar na main
git checkout main

# Criar e ir para nova branch
git checkout -b feat/add-profit-cards-makeup
```

**Convenção de nomes**:
- `feat/nome-da-feature` - Nova funcionalidade
- `fix/nome-do-bug` - Correção de bug
- `refactor/nome-da-refatoracao` - Refatoração
- `docs/nome-da-doc` - Atualização de documentação
- `test/nome-do-teste` - Adicionar testes

---

**✅ Branch criada:** `feat/add-profit-cards-makeup`

**⚠️ IMPORTANTE**: A nova branch foi criada **a partir da main atualizada**, então já tem:
- ✅ Toda documentação (`docs/`)
- ✅ Scripts de automação (`scripts/`)
- ✅ Configurações (`.env.example`)
- ✅ Histórico completo de commits
- ✅ Todas as features já implementadas

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
