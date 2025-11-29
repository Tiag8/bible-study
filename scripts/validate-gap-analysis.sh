#!/bin/bash
# validate-gap-analysis.sh - Valida se Gap Analysis foi executado (Workflow 2b)
#
# Uso: ./scripts/validate-gap-analysis.sh
# Quando: ANTES de Workflow 5a (Implementation)
# Benefício: Previne over-engineering (95% reuso target)
# ROI: -60% tempo implementação, -80% código custom desnecessário
#
# Evidências: feat-landing-page-mvp (95% reuso), feat-super-admin-dashboard (95% backend existe)

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
CONTEXT_DIR=".context"

echo "=== VALIDAÇÃO GAP ANALYSIS (Workflow 2b) ==="
echo ""

# Check 1: .context/ existe
if [ ! -d "$CONTEXT_DIR" ]; then
    echo -e "${RED}❌ FALHOU: .context/ não existe${NC}"
    echo "Execute: ./scripts/context-init.sh"
    exit 1
fi
echo -e "${GREEN}✅ .context/ existe${NC}"

# Check 2: decisions.md tem Gap Analysis
DECISIONS_FILE="${CONTEXT_DIR}/${BRANCH_PREFIX}_decisions.md"
if [ ! -f "$DECISIONS_FILE" ]; then
    echo -e "${YELLOW}⚠️ AVISO: ${DECISIONS_FILE} não existe${NC}"
    echo "Gap Analysis pode não ter sido documentado"
    GAP_FOUND=0
else
    GAP_FOUND=$(grep -ci "gap analysis\|reuso\|reutiliz\|exists\|backend existe\|frontend existe" "$DECISIONS_FILE" 2>/dev/null || echo "0")
fi

if [ "$GAP_FOUND" -eq 0 ]; then
    echo -e "${RED}❌ FALHOU: Gap Analysis não documentado em decisions.md${NC}"
    echo ""
    echo "Para resolver:"
    echo "1. Execute Workflow 2b Fase 0.5"
    echo "2. Documente: 'Quanto % do código/backend já existe?'"
    echo "3. Target: 90%+ reuso = APROVADO"
    echo ""
    echo "Exemplo decisions.md:"
    echo "  ## Workflow 2b: Gap Analysis"
    echo "  - **Reuso**: 95% do backend já existe"
    echo "  - **Código novo**: ~50 linhas"
    echo "  - **Deps novas**: ZERO"
    exit 1
fi

echo -e "${GREEN}✅ Gap Analysis documentado (${GAP_FOUND} referências)${NC}"

# Check 3: Verificar % reuso mencionado
REUSO_PERCENT=$(grep -oE "[0-9]{2,3}%.*reuso\|[0-9]{2,3}%.*existe\|reuso.*[0-9]{2,3}%" "$DECISIONS_FILE" 2>/dev/null | head -1)
if [ -n "$REUSO_PERCENT" ]; then
    echo -e "${GREEN}✅ Reuso identificado: ${REUSO_PERCENT}${NC}"
else
    echo -e "${YELLOW}⚠️ AVISO: % de reuso não explícito${NC}"
    echo "Recomendado: Documentar 'XX% reuso' ou 'XX% já existe'"
fi

# Check 4: workflow-progress.md tem Workflow 2b
PROGRESS_FILE="${CONTEXT_DIR}/${BRANCH_PREFIX}_workflow-progress.md"
if [ -f "$PROGRESS_FILE" ]; then
    WF2B_FOUND=$(grep -ci "workflow 2b\|technical design" "$PROGRESS_FILE" 2>/dev/null || echo "0")
    if [ "$WF2B_FOUND" -gt 0 ]; then
        echo -e "${GREEN}✅ Workflow 2b registrado em workflow-progress.md${NC}"
    else
        echo -e "${YELLOW}⚠️ AVISO: Workflow 2b não registrado${NC}"
    fi
fi

echo ""
echo "=== RESULTADO ==="
echo -e "${GREEN}✅ Gap Analysis VALIDADO - Pode prosseguir para Workflow 5a${NC}"
echo ""
echo "Lembre-se:"
echo "- Target: 90%+ reuso"
echo "- ZERO deps novas SE possível"
echo "- YAGNI: Só implementar o necessário"
exit 0
