#!/bin/bash
# =============================================================================
# validate-context-captured.sh - GATE 0 Validation for Workflow 1
# =============================================================================
# Validates that context was properly captured before proceeding to GATE 1
#
# Usage: ./scripts/validate-context-captured.sh [--branch <branch-name>]
#
# Exit codes:
#   0 - GATE 0 PASSED (context captured and validated)
#   1 - GATE 0 FAILED (missing or incomplete context)
#
# Integration:
#   - Workflow 1 (Planning) - GATE 0 prerequisite
#   - /clarify skill - generates the context file
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get branch name
if [[ "$1" == "--branch" && -n "$2" ]]; then
    BRANCH="$2"
else
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
fi

# Convert branch name to file prefix (replace / with -)
BRANCH_PREFIX=$(echo "$BRANCH" | sed 's/\//-/g')

# Context file path
CONTEXT_FILE=".context/${BRANCH_PREFIX}_context-captured.md"

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  GATE 0: Context Capture Validation  ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "Branch: ${YELLOW}${BRANCH}${NC}"
echo -e "Looking for: ${YELLOW}${CONTEXT_FILE}${NC}"
echo ""

# Check 1: File exists
echo -e "${BLUE}[1/5]${NC} Checking if context file exists..."
if [[ ! -f "$CONTEXT_FILE" ]]; then
    echo -e "${RED}  FAILED${NC} - Context file not found"
    echo ""
    echo -e "${YELLOW}Solucao:${NC} Execute /clarify para capturar contexto antes de prosseguir"
    echo ""
    exit 1
fi
echo -e "${GREEN}  PASSED${NC} - File exists"

# Check 2: File has minimum content (not empty template)
echo -e "${BLUE}[2/5]${NC} Checking if context has content..."
LINE_COUNT=$(wc -l < "$CONTEXT_FILE" | tr -d ' ')
if [[ "$LINE_COUNT" -lt 20 ]]; then
    echo -e "${RED}  FAILED${NC} - Context file appears to be empty or template only ($LINE_COUNT lines)"
    echo ""
    echo -e "${YELLOW}Solucao:${NC} Execute /clarify completamente (Fase 1 + Fase 2)"
    echo ""
    exit 1
fi
echo -e "${GREEN}  PASSED${NC} - File has $LINE_COUNT lines"

# Check 3: Has required sections
echo -e "${BLUE}[3/5]${NC} Checking required sections..."
MISSING_SECTIONS=()

if ! grep -q "## Contexto Tecnico\|## Contexto Técnico" "$CONTEXT_FILE"; then
    MISSING_SECTIONS+=("Contexto Técnico")
fi

if ! grep -q "### Objetivo" "$CONTEXT_FILE"; then
    MISSING_SECTIONS+=("Objetivo")
fi

if ! grep -q "### Escopo" "$CONTEXT_FILE"; then
    MISSING_SECTIONS+=("Escopo")
fi

if ! grep -q "## Validacao\|## Validação" "$CONTEXT_FILE"; then
    MISSING_SECTIONS+=("Validação")
fi

if [[ ${#MISSING_SECTIONS[@]} -gt 0 ]]; then
    echo -e "${RED}  FAILED${NC} - Missing sections: ${MISSING_SECTIONS[*]}"
    echo ""
    echo -e "${YELLOW}Solucao:${NC} Execute /clarify completamente para gerar todas as secoes"
    echo ""
    exit 1
fi
echo -e "${GREEN}  PASSED${NC} - All required sections present"

# Check 4: User validated (checkbox marked)
echo -e "${BLUE}[4/5]${NC} Checking user validation..."
if ! grep -q "\[x\] Usuario confirmou contexto suficiente\|\[x\] Usuário confirmou contexto suficiente" "$CONTEXT_FILE"; then
    echo -e "${RED}  FAILED${NC} - User has not confirmed context is sufficient"
    echo ""
    echo -e "${YELLOW}Solucao:${NC} Usuario deve responder 'sim' na validacao final do /clarify"
    echo ""
    exit 1
fi
echo -e "${GREEN}  PASSED${NC} - User confirmed context is sufficient"

# Check 5: Recent file (less than 24 hours old for same branch)
echo -e "${BLUE}[5/5]${NC} Checking file freshness..."
if [[ "$(uname)" == "Darwin" ]]; then
    # macOS
    FILE_AGE_HOURS=$(( ($(date +%s) - $(stat -f %m "$CONTEXT_FILE")) / 3600 ))
else
    # Linux
    FILE_AGE_HOURS=$(( ($(date +%s) - $(stat -c %Y "$CONTEXT_FILE")) / 3600 ))
fi

if [[ "$FILE_AGE_HOURS" -gt 24 ]]; then
    echo -e "${YELLOW}  WARNING${NC} - Context file is ${FILE_AGE_HOURS}h old (consider refreshing with /clarify)"
else
    echo -e "${GREEN}  PASSED${NC} - File is ${FILE_AGE_HOURS}h old (fresh)"
fi

# Summary
echo ""
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}  GATE 0: PASSED                       ${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo -e "Context captured and validated. Ready for GATE 1 (Reframing)."
echo ""

# Show context summary
echo -e "${BLUE}Context Summary:${NC}"
echo "----------------------------------------"
grep -A1 "### Objetivo" "$CONTEXT_FILE" | tail -1 | head -c 100
echo ""
grep -A2 "### Escopo" "$CONTEXT_FILE" | tail -2 | head -c 150
echo ""
echo "----------------------------------------"
echo ""

exit 0
