#!/bin/bash

###############################################################################
# Script: validate-workflow-compliance.sh
# Purpose: Validate Windsurf workflows against compliance standards
# Standards:
#   1. Tamanho: ≤ 12KB (hard limit)
#   2. Fase 0: Load context (.context/ integration)
#   3. Fase Final: Update context (.context/ persistence)
###############################################################################

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKFLOW_DIR=".windsurf/workflows"
THRESHOLD_HARD=12000        # 12KB hard limit
THRESHOLD_WARN=11000        # 11KB warning threshold

# Counters
PASS=0
WARN=0
FAIL=0

# Functions
print_header() {
    echo -e "${BLUE}=== Workflow Compliance Report ===${NC}"
    echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Workflow directory: $WORKFLOW_DIR"
    echo ""
}

validate_size() {
    local file=$1
    local basename=$(basename "$file")
    local size=$(wc -c < "$file")

    if [ $size -gt $THRESHOLD_HARD ]; then
        echo -e "${RED}❌ FAIL${NC}: $basename ($size bytes > $THRESHOLD_HARD)"
        ((FAIL++))
        return 1
    elif [ $size -gt $THRESHOLD_WARN ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $basename ($size bytes > $THRESHOLD_WARN)"
        ((WARN++))
        return 2
    else
        echo -e "${GREEN}✅ PASS${NC}: $basename ($size bytes)"
        ((PASS++))
        return 0
    fi
}

validate_fase_0() {
    local file=$1
    if ! grep -q "## 🧠 FASE 0\|## FASE 0" "$file"; then
        echo -e "  ${RED}❌ Missing FASE 0${NC}"
        return 1
    else
        echo -e "  ${GREEN}✅ FASE 0 found${NC}"
        return 0
    fi
}

validate_fase_final() {
    local file=$1
    if ! grep -q "## 🧠 FASE FINAL\|## FASE FINAL" "$file"; then
        echo -e "  ${RED}❌ Missing FASE FINAL${NC}"
        return 1
    else
        echo -e "  ${GREEN}✅ FASE FINAL found${NC}"
        return 0
    fi
}

# Main script
main() {
    print_header

    if [ ! -d "$WORKFLOW_DIR" ]; then
        echo -e "${RED}ERROR: Directory not found: $WORKFLOW_DIR${NC}"
        exit 1
    fi

    for file in "$WORKFLOW_DIR"/add-feature-*.md; do
        if [ ! -f "$file" ]; then
            continue
        fi

        echo -n "📋 $(basename "$file"): "
        validate_size "$file"
        validate_fase_0 "$file"
        validate_fase_final "$file"
        echo ""
    done

    echo -e "${BLUE}=== Summary ===${NC}"
    echo -e "${GREEN}✅ PASS${NC}: $PASS | ${YELLOW}⚠️  WARN${NC}: $WARN | ${RED}❌ FAIL${NC}: $FAIL"

    if [ $FAIL -eq 0 ]; then
        echo -e "${GREEN}✅ Compliant!${NC}"
        return 0
    else
        echo -e "${RED}❌ $FAIL workflow(s) need fixes${NC}"
        return 1
    fi
}

main
exit $?
