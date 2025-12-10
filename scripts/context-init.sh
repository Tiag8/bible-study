#!/bin/bash
# Inicializa .context/ para nova branch/feature
# Uso: ./scripts/context-init.sh <feature-name>

set -euo pipefail

# === VALIDAÇÕES ===
FEATURE_NAME="${1:-}"
if [ -z "$FEATURE_NAME" ]; then
  echo "❌ Uso: ./scripts/context-init.sh <feature-name>"
  echo "   Exemplo: ./scripts/context-init.sh members"
  exit 1
fi

# Validar que está em uma branch (não main)
BRANCH_NAME=$(git branch --show-current)
if [ "$BRANCH_NAME" = "main" ] || [ "$BRANCH_NAME" = "master" ]; then
  echo "❌ ERRO: Não pode inicializar .context/ na branch main/master"
  echo "   Crie uma feature branch primeiro: git checkout -b feat/${FEATURE_NAME}"
  exit 1
fi

# Gerar prefixo (ex: feat/members → feat-members)
PREFIX="${BRANCH_NAME/\//-}"

echo "🚀 Inicializando .context/ para branch ${BRANCH_NAME}"
echo "📂 Prefixo dos arquivos: ${PREFIX}_"

# === LIMPEZA (se .context/ já existe) ===
if [ -d .context/ ]; then
  echo "⚠️  .context/ já existe - fazendo backup..."
  BACKUP_DIR=".context/.backup-$(TZ='America/Sao_Paulo' date '+%Y%m%d-%H%M%S')"
  mkdir -p "$BACKUP_DIR"
  mv .context/*.md .context/*.log "$BACKUP_DIR/" 2>/dev/null || true
  echo "✅ Backup criado em $BACKUP_DIR"
fi

mkdir -p .context/

# === 1. INDEX.md (Guia para LLM) ===
cat > .context/INDEX.md <<EOF
# 📚 Context Index - ${BRANCH_NAME}

**Branch**: \`${BRANCH_NAME}\`
**Created**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M %Z')
**Feature**: ${FEATURE_NAME}

---

## 📖 Ordem de Leitura (Para LLM)

**⚠️ SEMPRE ler nesta ordem ANTES de qualquer ação**:

1. **${PREFIX}_workflow-progress.md** - Onde estou agora? (qual workflow ativo)
2. **${PREFIX}_temp-memory.md** - Estado atual resumido (o que foi feito, próximos passos)
3. **${PREFIX}_decisions.md** - Decisões já tomadas (por quê escolhemos X?)
4. **${PREFIX}_validation-loop.md** - Tentativas Workflow 6 (se existir - loop crítico)
5. **${PREFIX}_attempts.log** - Histórico completo (todas tentativas, sucesso + falhas)

---

## 📄 Descrição dos Arquivos

### ${PREFIX}_workflow-progress.md
**O que é**: Registro de CADA workflow executado (0-13)
**Quando atualizar**: Início (registrar start) e fim (registrar complete) de cada workflow
**Formato**:
\`\`\`markdown
### Workflow X: [Nome] ✅ COMPLETO
- **Data**: YYYY-MM-DD HH:MM
- **Actions**: [lista de ações executadas]
- **Outputs**: [outputs gerados]
- **Next**: Workflow Y ([Nome])
\`\`\`

### ${PREFIX}_temp-memory.md
**O que é**: Resumo do estado atual da branch
**Quando atualizar**: SEMPRE que estado mudar (código, decisão, bloqueio)
**Seções**:
- Estado Atual (onde estou, o que foi feito)
- Próximos Passos (TODOs)
- Decisões Pendentes (precisa escolher X?)
- Bloqueios/Questões (aguardando Y)

### ${PREFIX}_decisions.md
**O que é**: Log de decisões chave (arquitetura, stack, trade-offs)
**Quando atualizar**: Sempre que decisão importante for tomada
**Formato**:
\`\`\`markdown
## Workflow X - [Nome]
- **Decisão**: [O que decidimos]
- **Por quê**: [Justificativa]
- **Trade-off**: [O que sacrificamos]
- **Alternativas consideradas**: [X, Y, Z]
\`\`\`

### ${PREFIX}_validation-loop.md
**O que é**: Loop de tentativa/erro do Workflow 6 (User Validation)
**Quando atualizar**: Durante Workflow 6 (cada tentativa)
**Formato**:
\`\`\`markdown
### Iteração N ([SUCESSO/FALHA])
- **Tentativa**: [O que tentei]
- **Resultado**: [O que aconteceu]
- **Erro** (se falha): [Mensagem de erro]
- **Causa Root** (se falha): [Por quê falhou]
- **Próxima tentativa**: [O que vou tentar agora]
\`\`\`

### ${PREFIX}_attempts.log
**O que é**: Log append-only de TODAS tentativas (timestamp obrigatório)
**Quando atualizar**: TODA interação (workflow start/end, tentativa, decisão)
**Formato**:
\`\`\`
[YYYY-MM-DD HH:MM] WORKFLOW: X ([Nome]) - [START/COMPLETO]
[YYYY-MM-DD HH:MM] ATTEMPT: [O que tentei]
[YYYY-MM-DD HH:MM] ✅ SUCESSO: [O que funcionou]
[YYYY-MM-DD HH:MM] ❌ FALHOU: [O que falhou] (causa: [X])
[YYYY-MM-DD HH:MM] DECISION: [Decisão tomada]
\`\`\`

---

## ⚠️ REGRA CRÍTICA

**TODA interação DEVE atualizar pelo menos 1 arquivo acima.**

**Checklist pré-interação**:
- [ ] Li INDEX.md?
- [ ] Li workflow-progress.md (onde estou)?
- [ ] Li temp-memory.md (estado atual)?
- [ ] Li decisions.md (decisões já tomadas)?
- [ ] Se Workflow 6: Li validation-loop.md?
- [ ] Li últimas 30 linhas de attempts.log?

**Checklist pós-interação**:
- [ ] Atualizei workflow-progress.md (se workflow mudou)?
- [ ] Atualizei temp-memory.md (se estado mudou)?
- [ ] Logei em attempts.log?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Se Workflow 6: Atualizei validation-loop.md?

---

**Ver também**: \`.claude/CLAUDE.md\` Regra #12 (obrigatoriedade de atualização)
EOF

# === 2. workflow-progress.md ===
cat > .context/${PREFIX}_workflow-progress.md <<EOF
# Workflow Progress - ${BRANCH_NAME}

## Status Atual

**Workflow Ativo**: 0 (Setup)
**Última Atualização**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M %Z')

---

## Histórico de Workflows

### Workflow 0: Setup ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Backup DB criado (./scripts/backup-supabase.sh)
  - Branch \`${BRANCH_NAME}\` criada
  - .context/ inicializado com prefixo \`${PREFIX}_\`
- **Outputs**:
  - 6 arquivos .context/ criados
- **Next**: Workflow 1 (Planning)

---

**Próximos Workflows**:
- [ ] Workflow 1: Planning
- [ ] Workflow 2a: Solutions
- [ ] Workflow 2b: Technical Design
- [ ] Workflow 3: Risk Analysis
- [ ] Workflow 4: Setup (legacy - considerar deprecar)
- [ ] Workflow 5a: Implementation
- [ ] Workflow 5b: Refactoring & RCA
- [ ] Workflow 6a: User Validation
- [ ] Workflow 6b: RCA & Edge Cases
- [ ] Workflow 7a: Quality Gates
- [ ] Workflow 7b: RCA & Security
- [ ] Workflow 8a: Meta-Learning
- [ ] Workflow 8b: Pareto Analysis
- [ ] Workflow 9a: Finalization
- [ ] Workflow 9b: Retrospective
EOF

# === 3. temp-memory.md ===
cat > .context/${PREFIX}_temp-memory.md <<EOF
# Temporary Memory - ${BRANCH_NAME}

**Última Atualização**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M %Z')

---

## Estado Atual

Workflow 0 (Setup) concluído com sucesso.

**Próximo passo**: Executar Workflow 1 (Planning) para definir:
- Problema a resolver
- Objetivos da feature
- Restrições e pré-requisitos

---

## Próximos Passos

- [ ] Executar Workflow 1 (Planning)
- [ ] Definir problema REAL (Reframing + RCA)
- [ ] Propor soluções (Workflow 2a)

---

## Decisões Pendentes

[Nenhuma - Workflow 1 vai popular]

---

## Bloqueios/Questões

[Nenhum no momento]

---

**Nota**: Este arquivo é atualizado CONSTANTEMENTE. Sempre verificar "Última Atualização" antes de ler.
EOF

# === 4. decisions.md ===
cat > .context/${PREFIX}_decisions.md <<EOF
# Decisions Log - ${BRANCH_NAME}

**Feature**: ${FEATURE_NAME}

---

## Decisões Chave

[Nenhuma ainda - Workflows 1-13 vão popular conforme decisões forem tomadas]

---

**Template de Decisão**:
\`\`\`markdown
## Workflow X - [Nome]
- **Decisão**: [O que decidimos]
- **Por quê**: [Justificativa com evidências]
- **Trade-off**: [O que sacrificamos]
- **Alternativas consideradas**: [X, Y, Z]
- **Aprovado por**: [Usuário/Equipe]
- **Data**: YYYY-MM-DD HH:MM
\`\`\`
EOF

# === 5. attempts.log ===
cat > .context/${PREFIX}_attempts.log <<EOF
[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] INIT: Branch ${BRANCH_NAME} criada
[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 0 (Setup) - START
[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ACTION: Backup DB executado
[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ACTION: .context/ inicializado (6 arquivos)
[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 0 (Setup) - COMPLETO
EOF

# === 6. validation-loop.md (vazio inicialmente) ===
cat > .context/${PREFIX}_validation-loop.md <<EOF
# Validation Loop - ${BRANCH_NAME}

**Workflow 6 Iterations**

[Vazio - Será populado durante Workflow 6 (User Validation)]

---

**Template de Iteração**:
\`\`\`markdown
### Iteração N ([✅ SUCESSO / ❌ FALHA])
- **Data**: YYYY-MM-DD HH:MM
- **Tentativa**: [O que tentei implementar]
- **Resultado**: [O que aconteceu]
- **Erro** (se falha): [Mensagem de erro completa]
- **Causa Root** (se falha): [Análise RCA - por quê falhou]
- **Fix Aplicado** (se falha): [O que mudei para próxima tentativa]
- **Screenshot** (se sucesso): [Link para screenshot validado]
\`\`\`

---

**Nota**: Este arquivo é CRÍTICO durante Workflow 6. LLM DEVE ler ANTES de cada nova tentativa.
EOF

# === 7. COPIAR TEMPLATES (Workflow 14 - Proposta #2 + #6) ===
echo "📋 Copiando templates para .context/..."

# Template GATE 1 Reframing (Workflow 14 Proposta #2)
if [ -f "docs/templates/reframing-gate-1-template.md" ]; then
  sed "s|{FEATURE_NAME}|${FEATURE_NAME}|g; s|{BRANCH}|${BRANCH_NAME}|g; s|{DATE}|$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M %Z')|g" \
    docs/templates/reframing-gate-1-template.md > .context/${PREFIX}_reframing-gate-1.md
  echo "   ✅ ${PREFIX}_reframing-gate-1.md (GATE 1 template)"
else
  echo "   ⚠️  Template GATE 1 não encontrado (criado manualmente via Workflow 1)"
fi

# Template External Validation (Workflow 14 Proposta #6)
if [ -f "docs/templates/external-validation-template.md" ]; then
  sed "s|{FEATURE_NAME}|${FEATURE_NAME}|g; s|{BRANCH}|${BRANCH_NAME}|g; s|{DATE}|$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M %Z')|g" \
    docs/templates/external-validation-template.md > .context/${PREFIX}_external-validation.md
  echo "   ✅ ${PREFIX}_external-validation.md (External Validation template)"
else
  echo "   ⚠️  Template External Validation não encontrado (criado manualmente via Workflow 2b)"
fi

# === FINALIZAÇÃO ===
echo ""
echo "✅ .context/ inicializado com sucesso!"
echo ""
echo "📂 Arquivos criados:"
echo "   - INDEX.md (guia de leitura)"
echo "   - ${PREFIX}_workflow-progress.md"
echo "   - ${PREFIX}_temp-memory.md"
echo "   - ${PREFIX}_decisions.md"
echo "   - ${PREFIX}_attempts.log"
echo "   - ${PREFIX}_validation-loop.md"
echo "   - ${PREFIX}_reframing-gate-1.md (NEW - Workflow 14)"
echo "   - ${PREFIX}_external-validation.md (NEW - Workflow 14)"
echo ""
echo "📖 LLM deve ler INDEX.md PRIMEIRO antes de qualquer ação!"
echo ""
echo "⚠️  Lembre-se: TODA interação deve atualizar pelo menos 1 arquivo .context/"
echo ""
echo "🎯 Próximo passo: Executar Workflow 1 (Planning + GATE 1 Reframing)"
