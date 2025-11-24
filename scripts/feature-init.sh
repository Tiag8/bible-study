#!/bin/bash
# scripts/feature-init.sh
# Inicializar nova feature com state tracking

set -euo pipefail

# Validar argumentos
if [ $# -lt 1 ]; then
  echo "❌ Uso: ./scripts/feature-init.sh <nome-da-feature>"
  echo "   Exemplo: ./scripts/feature-init.sh payment"
  exit 1
fi

FEATURE_NAME=$1
FEATURE_PREFIX="feat-${FEATURE_NAME}"
BRANCH_NAME="feat/${FEATURE_NAME}"
STATE_FILE=".context/${FEATURE_PREFIX}_orchestrator-state.json"

# Colors sourced from lib/colors.sh (DRY principle)
source "$(dirname "$0")/lib/colors.sh"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Feature Initialization                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Verificar se feature já existe
if [ -f "$STATE_FILE" ]; then
  echo -e "${YELLOW}⚠️  Feature já existe: $FEATURE_PREFIX${NC}"
  echo -e "${YELLOW}   State file: $STATE_FILE${NC}"
  echo ""
  echo -e "${YELLOW}   Deseja continuar? (irá sobrescrever state)${NC}"
  read -p "   (yes/NO): " confirm
  if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Cancelado${NC}"
    exit 1
  fi
fi

# 2. Criar branch Git
echo -e "${BLUE}📍 Step 1/4: Criando Git branch${NC}"
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo -e "${YELLOW}   Branch já existe: $BRANCH_NAME${NC}"
  git checkout "$BRANCH_NAME"
else
  git checkout -b "$BRANCH_NAME"
  echo -e "${GREEN}   ✅ Branch criada: $BRANCH_NAME${NC}"
fi
echo ""

# 3. Criar state file
echo -e "${BLUE}📍 Step 2/4: Criando orchestrator state${NC}"

# Timestamp ISO 8601 (timezone America/Sao_Paulo)
NOW=$(TZ='America/Sao_Paulo' date -Iseconds)

cat > "$STATE_FILE" <<EOF
{
  "feature": "${FEATURE_PREFIX}",
  "branch": "${BRANCH_NAME}",
  "status": "active",
  "current_workflow": "1",
  "current_phase": "0",
  "gate": null,
  "workflows_completed": [],
  "attempts": {},
  "started_at": "${NOW}",
  "updated_at": "${NOW}",
  "paused_until": null,
  "notes": [
    {
      "timestamp": "${NOW}",
      "note": "Feature iniciada via feature-init.sh"
    }
  ]
}
EOF

echo -e "${GREEN}   ✅ State criado: $STATE_FILE${NC}"
echo ""

# 4. Criar .context/ files (padrão existente)
echo -e "${BLUE}📍 Step 3/4: Criando .context/ files padrão${NC}"

# workflow-progress.md
touch ".context/${FEATURE_PREFIX}_workflow-progress.md"
cat > ".context/${FEATURE_PREFIX}_workflow-progress.md" <<EOF
# Workflow Progress: $FEATURE_PREFIX

**Iniciado**: $NOW
**Status**: Active

## Workflows Completados

(nenhum ainda)

## Workflow Atual: 1 (Planning)

**Fase atual**: 0

---

## Histórico
- $NOW: Feature iniciada
EOF

# temp-memory.md
touch ".context/${FEATURE_PREFIX}_temp-memory.md"
echo "# Temp Memory: $FEATURE_PREFIX" > ".context/${FEATURE_PREFIX}_temp-memory.md"
echo "" >> ".context/${FEATURE_PREFIX}_temp-memory.md"
echo "(Memória temporária da sessão)" >> ".context/${FEATURE_PREFIX}_temp-memory.md"

# decisions.md
touch ".context/${FEATURE_PREFIX}_decisions.md"
echo "# Decisions: $FEATURE_PREFIX" > ".context/${FEATURE_PREFIX}_decisions.md"
echo "" >> ".context/${FEATURE_PREFIX}_decisions.md"
echo "## Decisões Arquiteturais" >> ".context/${FEATURE_PREFIX}_decisions.md"
echo "(nenhuma ainda)" >> ".context/${FEATURE_PREFIX}_decisions.md"

# attempts.log
touch ".context/${FEATURE_PREFIX}_attempts.log"
echo "[$NOW] Feature iniciada via feature-init.sh" > ".context/${FEATURE_PREFIX}_attempts.log"

# validation-loop.md
touch ".context/${FEATURE_PREFIX}_validation-loop.md"
echo "# Validation Loop: $FEATURE_PREFIX" > ".context/${FEATURE_PREFIX}_validation-loop.md"
echo "" >> ".context/${FEATURE_PREFIX}_validation-loop.md"
echo "(Ciclos de validação)" >> ".context/${FEATURE_PREFIX}_validation-loop.md"

echo -e "${GREEN}   ✅ .context/ files criados (6 arquivos)${NC}"
echo ""

# 5. Resumo
echo -e "${BLUE}📍 Step 4/4: Resumo${NC}"
echo -e "${GREEN}✅ Feature inicializada com sucesso!${NC}"
echo ""
echo -e "${BLUE}📦 Arquivos criados:${NC}"
echo -e "   - $STATE_FILE"
echo -e "   - .context/${FEATURE_PREFIX}_workflow-progress.md"
echo -e "   - .context/${FEATURE_PREFIX}_temp-memory.md"
echo -e "   - .context/${FEATURE_PREFIX}_decisions.md"
echo -e "   - .context/${FEATURE_PREFIX}_attempts.log"
echo -e "   - .context/${FEATURE_PREFIX}_validation-loop.md"
echo ""

echo -e "${CYAN}💡 Próximos passos:${NC}"
echo -e "   1. Ver dashboard: ${YELLOW}./scripts/feature-dashboard.sh${NC}"
echo -e "   2. Começar Workflow 1: Pedir IA executar reframing"
echo -e "   3. Atualizar state: ${YELLOW}./scripts/feature-update-state.sh $FEATURE_NAME <workflow> <phase>${NC}"
echo ""

echo -e "${BLUE}🎯 Feature: $FEATURE_PREFIX${NC}"
echo -e "${BLUE}📍 Branch: $BRANCH_NAME${NC}"
echo -e "${BLUE}📊 Status: active (Workflow 1 Fase 0)${NC}"
echo ""
