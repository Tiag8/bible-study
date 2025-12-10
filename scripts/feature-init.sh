#!/bin/bash
# scripts/feature-init.sh
# Inicializar nova feature com .context/ files
# Versão: 4.0.0 - Suporte a Worktrees (backward compatible)

set -euo pipefail

# ============================================================================
# PARSE ARGUMENTS
# ============================================================================

WORKTREE_MODE=false
FEATURE_NAME=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --worktree)
      WORKTREE_MODE=true
      shift
      ;;
    --help|-h)
      cat << EOF
USAGE:
  ./scripts/feature-init.sh <nome-da-feature> [--worktree]

ARGUMENTS:
  <nome-da-feature>  Nome da feature (ex: payment, auth)

OPTIONS:
  --worktree         Criar feature como worktree isolado (recomendado para desenvolvimento paralelo)

EXAMPLES:
  # Branch simples (comportamento tradicional)
  ./scripts/feature-init.sh payment

  # Worktree isolado (desenvolvimento paralelo)
  ./scripts/feature-init.sh payment --worktree

NOTES:
  - Worktrees permitem múltiplas features simultaneamente
  - Cada worktree tem .context/ e node_modules isolados
  - Use worktrees para bugfix urgente durante feature
  - Use worktrees para comparar código lado a lado

EOF
      exit 0
      ;;
    *)
      FEATURE_NAME=$1
      shift
      ;;
  esac
done

# Validar argumentos
if [ -z "$FEATURE_NAME" ]; then
  echo "❌ Uso: ./scripts/feature-init.sh <nome-da-feature> [--worktree]"
  echo "   Exemplo: ./scripts/feature-init.sh payment"
  echo "   Exemplo: ./scripts/feature-init.sh payment --worktree"
  echo ""
  echo "   Use --help para mais informações"
  exit 1
fi

# ============================================================================
# WORKTREE MODE
# ============================================================================

if [ "$WORKTREE_MODE" = true ]; then
  echo ""
  echo "🔄 Modo Worktree Detectado"
  echo "   Delegando para worktree-manager.sh..."
  echo ""

  # Delegar para worktree-manager
  exec "$(dirname "$0")/worktree-manager.sh" create "$FEATURE_NAME"
  exit 0
fi

# ============================================================================
# TRADITIONAL BRANCH MODE (BACKWARD COMPATIBLE)
# ============================================================================

FEATURE_PREFIX="feat-${FEATURE_NAME}"
BRANCH_NAME="feat/${FEATURE_NAME}"

# Colors sourced from lib/colors.sh (DRY principle)
source "$(dirname "$0")/lib/colors.sh"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Feature Initialization (Branch Mode)            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Sugerir worktree se apropriado
echo -e "${CYAN}💡 Dica:${NC} Use ${YELLOW}--worktree${NC} para desenvolvimento paralelo"
echo -e "   (múltiplas features simultaneamente, bugfix sem interromper feature)"
echo ""

# 1. Verificar se feature já existe
if [ -f ".context/${FEATURE_PREFIX}_workflow-progress.md" ]; then
  echo -e "${YELLOW}⚠️  Feature já existe: $FEATURE_PREFIX${NC}"
  echo -e "${YELLOW}   Arquivos .context/ já criados${NC}"
  echo ""
  echo -e "${YELLOW}   Deseja continuar? (irá sobrescrever)${NC}"
  read -p "   (yes/NO): " confirm
  if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Cancelado${NC}"
    exit 1
  fi
fi

# 2. Criar branch Git
echo -e "${BLUE}📍 Step 1/3: Criando Git branch${NC}"
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo -e "${YELLOW}   Branch já existe: $BRANCH_NAME${NC}"
  git checkout "$BRANCH_NAME"
else
  git checkout -b "$BRANCH_NAME"
  echo -e "${GREEN}   ✅ Branch criada: $BRANCH_NAME${NC}"
fi
echo ""

# 3. Criar .context/ files
echo -e "${BLUE}📍 Step 2/3: Criando .context/ files${NC}"

# Timestamp ISO 8601 (timezone America/Sao_Paulo)
NOW=$(TZ='America/Sao_Paulo' date -Iseconds)

# workflow-progress.md
cat > ".context/${FEATURE_PREFIX}_workflow-progress.md" <<EOF
# Workflow Progress: $FEATURE_PREFIX

**Iniciado**: $NOW
**Status**: Active
**Mode**: Branch (traditional)

## Workflows Completados

(nenhum ainda)

## Workflow Atual

Use skill **workflow-navigator** para recomendação.

---

## Histórico
- $NOW: Feature iniciada (branch mode)
EOF

# temp-memory.md
cat > ".context/${FEATURE_PREFIX}_temp-memory.md" <<EOF
# Temp Memory: $FEATURE_PREFIX

(Memória temporária da sessão)
EOF

# decisions.md
cat > ".context/${FEATURE_PREFIX}_decisions.md" <<EOF
# Decisions: $FEATURE_PREFIX

## Decisões Arquiteturais
(nenhuma ainda)
EOF

# attempts.log
echo "[$NOW] Feature iniciada via feature-init.sh v4.0.0 (branch mode)" > ".context/${FEATURE_PREFIX}_attempts.log"

# validation-loop.md
cat > ".context/${FEATURE_PREFIX}_validation-loop.md" <<EOF
# Validation Loop: $FEATURE_PREFIX

(Ciclos de validação)
EOF

echo -e "${GREEN}   ✅ .context/ files criados (5 arquivos)${NC}"
echo ""

# 4. Resumo
echo -e "${BLUE}📍 Step 3/3: Resumo${NC}"
echo -e "${GREEN}✅ Feature inicializada com sucesso!${NC}"
echo ""

echo -e "${BLUE}📦 Arquivos criados:${NC}"
echo -e "   - .context/${FEATURE_PREFIX}_workflow-progress.md"
echo -e "   - .context/${FEATURE_PREFIX}_temp-memory.md"
echo -e "   - .context/${FEATURE_PREFIX}_decisions.md"
echo -e "   - .context/${FEATURE_PREFIX}_attempts.log"
echo -e "   - .context/${FEATURE_PREFIX}_validation-loop.md"
echo ""

echo -e "${CYAN}💡 Próximos passos:${NC}"
echo -e "   1. Use skill ${YELLOW}workflow-navigator${NC} para saber qual workflow começar"
echo -e "   2. Use skill ${YELLOW}party-mode${NC} para decisões arquiteturais complexas"
echo ""

echo -e "${BLUE}🎯 Feature: $FEATURE_PREFIX${NC}"
echo -e "${BLUE}📍 Branch: $BRANCH_NAME${NC}"
echo -e "${BLUE}📍 Mode: Branch (traditional)${NC}"
echo ""

echo -e "${CYAN}💡 Quer desenvolvimento paralelo?${NC}"
echo -e "   Use: ${YELLOW}./scripts/worktree-manager.sh create $FEATURE_NAME${NC}"
echo ""
