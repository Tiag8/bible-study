# Workflow 0: Setup - Preparação para Nova Feature

**Quando usar**: ANTES de iniciar qualquer mudança no projeto (nova feature, bug fix, refactoring)

**Objetivo**: Preparar ambiente com backup DB, branch isolada e working memory (.context/) inicializada

**Duração**: 5-10min

**Pré-requisitos**: Git repository limpo, acesso a banco de dados

---

## 📋 CHECKLIST PRÉ-WORKFLOW

- [ ] Código local está commitado (git status limpo)
- [ ] Está na branch `main` ou equivalente
- [ ] Definiu nome da feature (ex: "members", "notifications", etc)
- [ ] Tem acesso ao banco de dados (para backup)

---

## 🎯 FASE 0.1: Validações Iniciais

### 0.1.1. Verificar Git Status

```bash
git status
```

**Validação**:
- ✅ **SE limpo**: Continuar
- ❌ **SE tem uncommitted changes**:
  - PARAR
  - Commitar ou stash mudanças
  - Voltar ao início

### 0.1.2. Verificar Branch Atual

```bash
git branch --show-current
```

**Validação**:
- ✅ **SE main/master/develop**: Continuar
- ⚠️ **SE outra branch**: Considerar se quer criar feature branch a partir dela

---

## 💾 FASE 0.2: Backup Database

### 0.2.1. Executar Backup Script

```bash
./scripts/backup-supabase.sh
```

**Output esperado**:
```
✅ Backup criado: backups/lifetracker_YYYYMMDD_HHMMSS.sql
```

### 0.2.2. Validar Backup Criado

```bash
ls -lh backups/*.sql | tail -1
```

**Validação**:
- ✅ **SE arquivo existe e > 100KB**: Backup válido
- ❌ **SE não existe ou muito pequeno**:
  - PARAR
  - Investigar erro
  - Não continuar sem backup

**Regra CRÍTICA**: NUNCA iniciar feature sem backup DB válido.

---

## 🌿 FASE 0.3: Criar Feature Branch

### 0.3.1. Definir Nome da Feature

**Convenção**:
- Formato: `feat/nome-descritivo`
- Exemplos:
  - `feat/members` (adicionar sistema de membros)
  - `feat/notifications` (adicionar notificações)
  - `fix/auth-bug` (corrigir bug de autenticação)
  - `refactor/habits-ui` (refatorar UI de hábitos)

**⚠️ IMPORTANTE**: Nome deve ser:
- Curto (1-2 palavras)
- Descritivo
- Sem espaços (usar hífen `-`)

### 0.3.2. Criar Branch

```bash
FEATURE_NAME="members"  # Ajustar conforme sua feature
git checkout -b feat/${FEATURE_NAME}
```

**Validação**:
```bash
git branch --show-current
```

**Output esperado**: `feat/members` (ou nome escolhido)

---

## 🧠 FASE 0.4: Inicializar .context/ (Working Memory)

### 0.4.1. Executar Script de Inicialização

```bash
FEATURE_NAME="members"  # Mesmo nome usado na branch
./scripts/context-init.sh ${FEATURE_NAME}
```

**Output esperado**:
```
🚀 Inicializando .context/ para branch feat/members
📂 Prefixo dos arquivos: feat-members_

✅ .context/ inicializado com sucesso!

📂 Arquivos criados:
   - INDEX.md (guia de leitura)
   - feat-members_workflow-progress.md
   - feat-members_temp-memory.md
   - feat-members_decisions.md
   - feat-members_attempts.log
   - feat-members_validation-loop.md

📖 LLM deve ler INDEX.md PRIMEIRO antes de qualquer ação!
```

### 0.4.2. Validar Estrutura .context/

```bash
ls -1 .context/
```

**Output esperado**:
```
INDEX.md
feat-members_attempts.log
feat-members_decisions.md
feat-members_temp-memory.md
feat-members_validation-loop.md
feat-members_workflow-progress.md
```

**Validação**:
- ✅ **SE 6 arquivos**: Setup correto
- ❌ **SE arquivos faltando**:
  - PARAR
  - Re-executar `context-init.sh`

---

## 📖 FASE 0.5: Ler Context Inicial

### 0.5.1. Ler Guia INDEX.md

```bash
cat .context/INDEX.md
```

**Entender**:
- Ordem de leitura dos arquivos
- O que cada arquivo faz
- Checklists obrigatórios

### 0.5.2. Ler Workflow Progress

```bash
BRANCH_PREFIX="feat-members"  # Ajustar conforme sua branch
cat .context/${BRANCH_PREFIX}_workflow-progress.md
```

**Verificar**:
- Workflow 0 está marcado como COMPLETO?
- Next workflow é Workflow 1 (Planning)?

---

## 💾 FASE 0.6: Commit Inicial (Opcional mas Recomendado)

### 0.6.1. Adicionar .context/ ao Git

```bash
git add .context/
git status
```

**Validação**: Todos 6 arquivos .context/ devem aparecer como "new file"

### 0.6.2. Criar Commit Inicial

```bash
git commit -m "chore: init .context/ for feat/${FEATURE_NAME}

- Backup DB criado
- Branch feat/${FEATURE_NAME} criada
- Working memory (.context/) inicializado
- Workflow 0 (Setup) completo

📋 Próximo: Workflow 1 (Planning)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## ✅ FASE 0.7: Validação Final

### Checklist de Completude

- [ ] **Backup DB** criado e validado (arquivo > 100KB)
- [ ] **Branch** criada (formato `feat/nome`)
- [ ] **.context/** inicializado (6 arquivos)
- [ ] **INDEX.md** lido e compreendido
- [ ] **workflow-progress.md** mostra Workflow 0 completo
- [ ] **Commit inicial** criado (opcional)

### Próximo Workflow

**Se TODOS checks passaram**:
- ✅ Prosseguir para **Workflow 1 (Planning)**
- 📖 SEMPRE ler `.context/INDEX.md` antes de iniciar

**Se ALGUM check falhou**:
- ❌ NÃO prosseguir
- 🔍 Investigar e corrigir problema
- 🔄 Re-executar Workflow 0

---

## 🎓 META-LEARNING & MELHORIAS

### Questões de Reflexão

1. **Eficiência** (nota 1-10): Quanto tempo levou vs esperado (5-10min)?
2. **Bloqueios**: Algum passo falhou? Por quê?
3. **Gaps**: Faltou algum script/validação?
4. **RCA**: Se falhou, qual foi a causa raiz?

### Critério Sistêmico

**Documentar APENAS se**:
- Problema afeta múltiplas features (não pontual)
- Solução tem ROI 5x+ (economiza tempo significativo)
- Root cause é sistêmica (processo, não técnica)

### Template Meta-Learning

```markdown
## ML-XX: [Título do Aprendizado]

**Problema**: [Descrição concisa]
**Root Cause**: [Causa raiz via 5 Whys]
**Solução**: [O que implementamos]
**ROI Estimado**: [Xmin/feature ou Xh/ano]
**Aplicável a**: [Workflows/Features afetados]
**Scripts Criados**: [Lista de scripts novos]
**Docs Atualizados**: [PLAN.md, INDEX.md, etc]
```

**Adicionar em**:
- `docs/PLAN.md` (seção Meta-Learnings)
- `docs/INDEX.md` (seção Meta-Learnings Consolidados)

---

## 📚 REFERÊNCIAS

**Scripts**:
- `./scripts/backup-supabase.sh` - Backup database
- `./scripts/context-init.sh` - Inicializar .context/

**Workflows Relacionados**:
- **Next**: Workflow 1 (Planning)
- **Related**: Workflow 9a (Finalization) - Cleanup .context/

**Documentação**:
- `.claude/CLAUDE.md` - Regra #12 (obrigatoriedade .context/)
- `docs/INDEX.md` - Sistema .context/ completo
- `.context/INDEX.md` - Guia de uso (criado por este workflow)

**Evidências**:
- Paper GCC (Oxford 2025) - Working memory persistente
- Debugging Case 007 - Projeto sofreu perda de contexto

---

**Versão**: 1.0
**Criado**: 2025-11-11
**Autor**: Claude Code (Framework .context/)
**Status**: Ativo
