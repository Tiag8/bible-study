#!/bin/bash

# ============================================================================
# AIOS Installation Validation Script
# ============================================================================
# Versão: 1.0.0
# Data: 2026-01-26
# Descrição: Valida instalação do AIOS no Bible Study
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="/Users/tiago/Projects/bible-study"

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_header "Validando Instalação AIOS - Bible Study"

cd "$PROJECT_ROOT" || exit 1

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# ============================================================================
# CHECK 1: .aios-core/ existe
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d ".aios-core" ]; then
    check_pass ".aios-core/ instalado"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_fail ".aios-core/ NÃO encontrado"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# ============================================================================
# CHECK 2: package.json AIOS
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f ".aios-core/package.json" ]; then
    AIOS_VERSION=$(grep '"version"' .aios-core/package.json | head -1 | cut -d'"' -f4)
    check_pass "AIOS package.json válido (v$AIOS_VERSION)"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_fail "AIOS package.json NÃO encontrado"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# ============================================================================
# CHECK 3: CLI executável
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -x ".aios-core/bin/aios-core.js" ]; then
    check_pass "AIOS CLI executável"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_warn "AIOS CLI não encontrado ou sem permissão"
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
fi

# ============================================================================
# CHECK 4: Core components
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d ".aios-core/core" ]; then
    CORE_MODULES=$(ls -1 .aios-core/core | wc -l)
    check_pass "Core modules instalados ($CORE_MODULES módulos)"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_fail "Core modules NÃO encontrados"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# ============================================================================
# CHECK 5: Development tools
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d ".aios-core/development" ]; then
    TASKS_COUNT=$(find .aios-core/development/tasks -name "*.md" 2>/dev/null | wc -l)
    check_pass "Development tools instalados ($TASKS_COUNT tasks)"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_warn "Development tools não encontrados"
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
fi

# ============================================================================
# CHECK 6: Comandos AIOS
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d ".claude/commands/AIOS" ]; then
    COMMANDS_COUNT=$(find .claude/commands/AIOS -name "*.md" | wc -l)
    check_pass "Comandos AIOS instalados ($COMMANDS_COUNT commands)"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_warn "Comandos AIOS não instalados"
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
fi

# ============================================================================
# CHECK 7: Agentes
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d ".claude/agents" ]; then
    AGENTS_COUNT=$(find .claude/agents -name "*.md" -not -name "README.md" | wc -l)
    check_pass "Agentes instalados ($AGENTS_COUNT agents)"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_fail "Agentes NÃO encontrados"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# ============================================================================
# CHECK 8: Workflows
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d ".windsurf/workflows" ]; then
    WORKFLOWS_COUNT=$(find .windsurf/workflows -name "*.md" -not -name "README.md" | wc -l)
    check_pass "Workflows instalados ($WORKFLOWS_COUNT workflows)"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_fail "Workflows NÃO encontrados"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# ============================================================================
# CHECK 9: Project Manifest
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f ".claude/project-manifest.json" ]; then
    check_pass "project-manifest.json configurado"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_warn "project-manifest.json não encontrado"
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
fi

# ============================================================================
# CHECK 10: AIOS Core index (sistema local)
# ============================================================================
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f ".aios-core/index.js" ]; then
    check_pass "AIOS Core index.js disponível"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    check_warn "AIOS Core index.js não encontrado"
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
fi

# ============================================================================
# RESUMO
# ============================================================================

echo ""
print_header "Resumo da Validação"

PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "Total de verificações: $TOTAL_CHECKS"
echo -e "${GREEN}Passou: $PASSED_CHECKS${NC}"
echo -e "${YELLOW}Avisos: $WARNING_CHECKS${NC}"
echo -e "${RED}Falhou: $FAILED_CHECKS${NC}"
echo ""
echo "Taxa de sucesso: ${PASS_RATE}%"
echo ""

if [ $PASS_RATE -ge 90 ]; then
    echo -e "${GREEN}✅ INSTALAÇÃO VÁLIDA${NC}"
    echo "AIOS está instalado e pronto para uso!"
elif [ $PASS_RATE -ge 70 ]; then
    echo -e "${YELLOW}⚠️ INSTALAÇÃO PARCIAL${NC}"
    echo "AIOS está parcialmente instalado. Revise os avisos acima."
else
    echo -e "${RED}❌ INSTALAÇÃO INCOMPLETA${NC}"
    echo "AIOS não está instalado corretamente. Execute install-aios.sh novamente."
    exit 1
fi

# ============================================================================
# Verificar funcionalidade CLI
# ============================================================================

if [ -x ".aios-core/bin/aios-core.js" ]; then
    echo ""
    print_header "Testando AIOS CLI"

    if node .aios-core/bin/aios-core.js --version &>/dev/null; then
        CLI_VERSION=$(node .aios-core/bin/aios-core.js --version 2>/dev/null)
        check_pass "AIOS CLI funcionando: $CLI_VERSION"
    else
        check_warn "AIOS CLI não respondeu (pode não ter --version implementado)"
    fi
fi

echo ""
print_header "Próximos Passos"

echo "1. Testar agentes:"
echo "   ls .claude/agents/"
echo ""
echo "2. Testar comandos:"
echo "   ls .claude/commands/AIOS/"
echo ""
echo "3. Ver workflows disponíveis:"
echo "   cat .windsurf/workflows/README.md"
echo ""
echo "4. Ler user guide:"
echo "   cat .aios-core/user-guide.md"
echo ""
echo "5. Ver project manifest:"
echo "   cat .claude/project-manifest.json"
echo ""

exit 0
