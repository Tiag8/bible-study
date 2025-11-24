#!/bin/bash

# pre-deploy-check.sh
# Valida pré-requisitos obrigatórios antes de deploy
# Uso: ./scripts/pre-deploy-check.sh
# Exit 0: Aprovado | Exit 1: Falhou (bloqueia deploy)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de validações
PASSED=0
FAILED=0
WARNINGS=0

echo "🔍 PRÉ-DEPLOY CHECK - Life Tracker"
echo "=================================="
echo ""

# VALIDAÇÃO 2: Evidência de GATE 3
echo "📋 [1/3] Verificando evidência de Workflow 6 (User Validation)..."
GATE3_COMMITS=$(git log -5 --pretty=%B | grep -i "GATE 3 OK\|test: validar" | wc -l | tr -d ' ')

if [ "$GATE3_COMMITS" -eq 0 ]; then
  echo -e "${RED}❌ FALHA: Nenhum commit com GATE 3 aprovado${NC}"
  ((FAILED++))
else
  echo -e "${GREEN}✅ OK: Workflow 6 validado${NC}"
  ((PASSED++))
fi

# VALIDAÇÃO 3: Build Local
echo "📋 [2/3] Verificando build local..."
if npm run build &>/dev/null; then
  echo -e "${GREEN}✅ OK: Build passou${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FALHA: Build falhou${NC}"
  ((FAILED++))
fi

# VALIDAÇÃO 8: Git Status
echo "📋 [3/3] Verificando Git status..."
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️  WARNING: Mudanças não commitadas${NC}"
  ((WARNINGS++))
else
  echo -e "${GREEN}✅ OK: Working tree limpo${NC}"
  ((PASSED++))
fi

echo ""
echo "=================================="
echo "📊 RESULTADO"
echo "=================================="
echo -e "${GREEN}✅ Passou: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Falhou: $FAILED${NC}"

if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}❌ PRÉ-DEPLOY CHECK FALHOU${NC}"
  exit 1
fi

echo -e "${GREEN}✅ PRÉ-DEPLOY CHECK PASSOU${NC}"
exit 0
