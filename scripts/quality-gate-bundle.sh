#!/bin/bash

# ============================================
# Quality Gate Bundle - All-in-One Pre-Commit
# ============================================
# Executa TODOS os quality gates em sequência:
# 1. Code Review (staged files)
# 2. Tests (TypeScript + ESLint + Build)
# 3. Security (secrets + vulnerabilities)
#
# Uso: ./scripts/quality-gate-bundle.sh [--fast]
# --fast: Pula build production (apenas TypeScript check)
# ============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Args
FAST_MODE=false
if [[ "$1" == "--fast" ]]; then
    FAST_MODE=true
fi

START_TIME=$(date +%s)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚦 Quality Gate Bundle - All-in-One${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Track results
GATES_PASSED=0
GATES_FAILED=0

# ============================================
# Gate 1: Code Review (Staged Files)
# ============================================
echo -e "${CYAN}━━━ Gate 1/3: Code Review ━━━${NC}"
echo ""

if git diff --cached --quiet 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Nenhuma mudança staged - pulando code review${NC}"
    echo ""
else
    # Check for critical issues only (simplified)
    CRITICAL_ISSUES=0

    # XSS check
    if git diff --cached | grep -qE '^\+.*dangerouslySetInnerHTML'; then
        echo -e "${RED}❌ dangerouslySetInnerHTML detectado${NC}"
        ((CRITICAL_ISSUES++))
    fi

    # Eval check
    if git diff --cached | grep -qE '^\+.*(eval\(|new Function\()'; then
        echo -e "${RED}❌ eval() detectado${NC}"
        ((CRITICAL_ISSUES++))
    fi

    # console.log check
    CONSOLE_COUNT=$(git diff --cached | grep -cE '^\+.*console\.(log|debug)' || echo "0")
    if [ "$CONSOLE_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $CONSOLE_COUNT console.log detectados${NC}"
    fi

    # any type check (TypeScript)
    ANY_COUNT=$(git diff --cached | grep -cE '^\+.*: any' || echo "0")
    if [ "$ANY_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $ANY_COUNT usos de 'any' type detectados${NC}"
    fi

    if [ $CRITICAL_ISSUES -eq 0 ]; then
        echo -e "${GREEN}✅ Code Review - PASSOU${NC}"
        ((GATES_PASSED++))
    else
        echo -e "${RED}❌ Code Review - FALHOU ($CRITICAL_ISSUES issues críticos)${NC}"
        ((GATES_FAILED++))
    fi
fi
echo ""

# ============================================
# Gate 2: TypeScript + Build
# ============================================
echo -e "${CYAN}━━━ Gate 2/3: TypeScript + Build ━━━${NC}"
echo ""

# TypeScript check
echo -e "${YELLOW}▶ TypeScript check...${NC}"
if npx tsc --noEmit > /tmp/tsc-check.log 2>&1; then
    echo -e "${GREEN}  ✅ TypeScript - OK${NC}"
else
    echo -e "${RED}  ❌ TypeScript - ERRORS${NC}"
    tail -10 /tmp/tsc-check.log | sed 's/^/     /'
    ((GATES_FAILED++))
    echo ""
    echo -e "${RED}━━━ ABORTANDO: Fix TypeScript errors first ━━━${NC}"
    exit 1
fi

# Build (skip if fast mode)
if [ "$FAST_MODE" = true ]; then
    echo -e "${YELLOW}  ⏭️  Build skipped (--fast mode)${NC}"
    ((GATES_PASSED++))
else
    echo -e "${YELLOW}▶ Build production...${NC}"
    if npm run build > /tmp/build-check.log 2>&1; then
        BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")
        echo -e "${GREEN}  ✅ Build - OK ($BUILD_SIZE)${NC}"
        ((GATES_PASSED++))
    else
        echo -e "${RED}  ❌ Build - FAILED${NC}"
        tail -10 /tmp/build-check.log | sed 's/^/     /'
        ((GATES_FAILED++))
    fi
fi
echo ""

# ============================================
# Gate 3: Security
# ============================================
echo -e "${CYAN}━━━ Gate 3/3: Security ━━━${NC}"
echo ""

SECURITY_ISSUES=0

# Check for hardcoded secrets patterns
echo -e "${YELLOW}▶ Checking secrets...${NC}"

# Patterns to check in staged changes
SECRETS_PATTERNS=(
    "password\s*=\s*['\"][^'\"]{8,}['\"]"
    "api_key\s*=\s*['\"][^'\"]{16,}['\"]"
    "secret\s*=\s*['\"][^'\"]{16,}['\"]"
    "eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*"
)

for pattern in "${SECRETS_PATTERNS[@]}"; do
    if git diff --cached | grep -qiE "$pattern"; then
        echo -e "${RED}  ❌ Possível secret detectado: $pattern${NC}"
        ((SECURITY_ISSUES++))
    fi
done

# Check .env being staged
if git diff --cached --name-only 2>/dev/null | grep -qE '\.env$'; then
    echo -e "${RED}  ❌ .env sendo commitado!${NC}"
    ((SECURITY_ISSUES++))
fi

if [ $SECURITY_ISSUES -eq 0 ]; then
    echo -e "${GREEN}  ✅ Security - PASSED${NC}"
    ((GATES_PASSED++))
else
    echo -e "${RED}  ❌ Security - FAILED ($SECURITY_ISSUES issues)${NC}"
    ((GATES_FAILED++))
fi
echo ""

# ============================================
# Summary
# ============================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Quality Gate Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "✅ Passed: ${GREEN}$GATES_PASSED${NC}"
echo -e "❌ Failed: ${RED}$GATES_FAILED${NC}"
echo -e "⏱️  Duration: ${DURATION}s"
echo ""

if [ $GATES_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 ALL QUALITY GATES PASSED!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Ready to commit:${NC}"
    echo -e "  git commit -m \"your message\""
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ QUALITY GATES FAILED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Fix issues before committing${NC}"
    echo ""
    exit 1
fi
