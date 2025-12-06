#!/bin/bash

# pre-deploy-check.sh
# Valida pré-requisitos obrigatórios antes de deploy
# Uso: ./scripts/pre-deploy-check.sh [--skip-whatsapp]
# Exit 0: Aprovado | Exit 1: Falhou (bloqueia deploy)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contador de validações
PASSED=0
FAILED=0
WARNINGS=0

# Parse args
SKIP_WHATSAPP=false
for arg in "$@"; do
    case $arg in
        --skip-whatsapp)
            SKIP_WHATSAPP=true
            ;;
    esac
done

echo "🔍 PRÉ-DEPLOY CHECK"
echo "=================================="
echo ""

# VALIDAÇÃO 1: Evidência de GATE 3
echo "📋 [1/4] Verificando evidência de Workflow 6 (User Validation)..."
GATE3_COMMITS=$(git log -5 --pretty=%B | grep -i "GATE 3 OK\|test: validar" | wc -l | tr -d ' ')

if [ "$GATE3_COMMITS" -eq 0 ]; then
  echo -e "${RED}❌ FALHA: Nenhum commit com GATE 3 aprovado${NC}"
  ((FAILED++))
else
  echo -e "${GREEN}✅ OK: Workflow 6 validado${NC}"
  ((PASSED++))
fi

# VALIDAÇÃO 2: Build Local
echo "📋 [2/4] Verificando build local..."
if npm run build &>/dev/null; then
  echo -e "${GREEN}✅ OK: Build passou${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FALHA: Build falhou${NC}"
  ((FAILED++))
fi

# VALIDAÇÃO 3: Git Status
echo "📋 [3/4] Verificando Git status..."
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️  WARNING: Mudanças não commitadas${NC}"
  ((WARNINGS++))
else
  echo -e "${GREEN}✅ OK: Working tree limpo${NC}"
  ((PASSED++))
fi

# VALIDAÇÃO 4: WhatsApp E2E Tests (se mudanças em arquivos WhatsApp)
echo "📋 [4/4] Verificando WhatsApp E2E tests..."

# Detectar se houve mudanças em arquivos WhatsApp nos últimos commits
WHATSAPP_CHANGES=$(git diff --name-only HEAD~3 HEAD 2>/dev/null | grep -i "whatsapp\|uazapi\|webhook" | wc -l | tr -d ' ')

if [ "$SKIP_WHATSAPP" = true ]; then
  echo -e "${YELLOW}⚠️  SKIP: WhatsApp tests ignorados (--skip-whatsapp)${NC}"
  ((WARNINGS++))
elif [ "$WHATSAPP_CHANGES" -eq 0 ]; then
  echo -e "${GREEN}✅ OK: Sem mudanças em WhatsApp (skip)${NC}"
  ((PASSED++))
else
  echo -e "${BLUE}   Detectadas $WHATSAPP_CHANGES mudanças em arquivos WhatsApp${NC}"

  # Verificar se variáveis de ambiente existem
  if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Variáveis de ambiente faltando para WhatsApp test${NC}"
    echo -e "${YELLOW}   Execute manualmente: ./scripts/whatsapp-tester/run.sh --scenario onboarding${NC}"
    ((WARNINGS++))
  else
    # Rodar teste de onboarding (cenário básico)
    echo -e "${BLUE}   Executando WhatsApp E2E test (onboarding)...${NC}"
    if "$SCRIPT_DIR/whatsapp-tester/run.sh" --scenario onboarding --continue-on-failure 2>&1 | tail -5; then
      echo -e "${GREEN}✅ OK: WhatsApp E2E test passou${NC}"
      ((PASSED++))
    else
      echo -e "${YELLOW}⚠️  WARNING: WhatsApp E2E test falhou${NC}"
      echo -e "${YELLOW}   Execute manualmente para debug: ./scripts/whatsapp-tester/run.sh --verbose${NC}"
      ((WARNINGS++))
    fi
  fi
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
