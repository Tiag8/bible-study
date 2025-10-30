#!/bin/bash

# ============================================
# Executar Testes do Projeto
# ============================================
# Roda todos os testes e validações:
# - TypeScript compilation
# - ESLint
# - Unit tests (quando implementados)
# - Build production
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 Executando Testes e Validações${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Contador de testes
TESTS_PASSED=0
TESTS_FAILED=0

# Função para executar teste
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}▶ ${test_name}...${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ ${test_name} - PASSOU${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}  ❌ ${test_name} - FALHOU${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# 1. TypeScript Compilation
echo -e "${BLUE}1️⃣ TypeScript Compilation${NC}"
if npm run build > /tmp/ts-build.log 2>&1; then
    echo -e "${GREEN}  ✅ TypeScript - PASSOU${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}  ❌ TypeScript - FALHOU${NC}"
    echo -e "${YELLOW}  📋 Erros:${NC}"
    tail -20 /tmp/ts-build.log | sed 's/^/     /'
    ((TESTS_FAILED++))
fi
echo ""

# 2. ESLint
echo -e "${BLUE}2️⃣ ESLint (Code Quality)${NC}"
if npm run lint > /tmp/eslint.log 2>&1; then
    echo -e "${GREEN}  ✅ ESLint - PASSOU${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}  ❌ ESLint - FALHOU${NC}"
    echo -e "${YELLOW}  📋 Warnings/Erros:${NC}"
    tail -20 /tmp/eslint.log | sed 's/^/     /'
    ((TESTS_FAILED++))
fi
echo ""

# 3. Unit Tests (se existirem)
echo -e "${BLUE}3️⃣ Unit Tests${NC}"
if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
    if npm run test > /tmp/vitest.log 2>&1; then
        echo -e "${GREEN}  ✅ Unit Tests - PASSOU${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}  ❌ Unit Tests - FALHOU${NC}"
        echo -e "${YELLOW}  📋 Falhas:${NC}"
        tail -20 /tmp/vitest.log | sed 's/^/     /'
        ((TESTS_FAILED++))
    fi
else
    echo -e "${YELLOW}  ⚠️  Unit Tests - NÃO CONFIGURADO${NC}"
    echo -e "${YELLOW}     (Vitest não encontrado)${NC}"
fi
echo ""

# 4. Verificação de Secrets
echo -e "${BLUE}4️⃣ Verificação de Secrets${NC}"

SECRETS_FOUND=false

# Padrões comuns de secrets
SECRETS_PATTERNS=(
    "password\s*=\s*['\"][^'\"]*['\"]"
    "api_key\s*=\s*['\"][^'\"]*['\"]"
    "secret\s*=\s*['\"][^'\"]*['\"]"
    "token\s*=\s*['\"][^'\"]*['\"]"
)

for pattern in "${SECRETS_PATTERNS[@]}"; do
    if grep -riE "$pattern" src/ --exclude-dir=node_modules --exclude-dir=dist --exclude="*.test.*" > /dev/null 2>&1; then
        SECRETS_FOUND=true
        break
    fi
done

# Verificar .env não será commitado
if git diff --cached --name-only 2>/dev/null | grep '\.env$' > /dev/null 2>&1; then
    SECRETS_FOUND=true
fi

if [ "$SECRETS_FOUND" = false ]; then
    echo -e "${GREEN}  ✅ Secrets - PASSOU${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}  ❌ Secrets - FALHOU${NC}"
    echo -e "${YELLOW}     ⚠️  Secrets hardcoded detectados ou .env será commitado!${NC}"
    echo -e "${YELLOW}     Execute: ./scripts/run-security-tests.sh para detalhes${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# 5. Build Production
echo -e "${BLUE}5️⃣ Build Production${NC}"
if npm run build:dev > /tmp/build.log 2>&1; then
    echo -e "${GREEN}  ✅ Build - PASSOU${NC}"
    ((TESTS_PASSED++))

    # Verificar tamanho do build
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        echo -e "${GREEN}     📦 Tamanho: ${BUILD_SIZE}${NC}"
    fi
else
    echo -e "${RED}  ❌ Build - FALHOU${NC}"
    echo -e "${YELLOW}  📋 Erros:${NC}"
    tail -20 /tmp/build.log | sed 's/^/     /'
    ((TESTS_FAILED++))
fi
echo ""

# Resumo Final
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Resumo dos Testes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "✅ Testes Passados: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "❌ Testes Falhados: ${RED}${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}💡 Próximos passos:${NC}"
    echo -e "   1. Validar manualmente: npm run dev"
    echo -e "   2. Commitar: git add . && git commit"
    echo -e "   3. Push: git push"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Alguns testes falharam!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}📋 Logs detalhados em:${NC}"
    echo -e "   - TypeScript: /tmp/ts-build.log"
    echo -e "   - ESLint: /tmp/eslint.log"
    echo -e "   - Unit Tests: /tmp/vitest.log"
    echo -e "   - Build: /tmp/build.log"
    echo ""
    echo -e "${YELLOW}💡 Corrija os erros e rode novamente:${NC}"
    echo -e "   ./scripts/run-tests.sh"
    echo ""
    exit 1
fi
