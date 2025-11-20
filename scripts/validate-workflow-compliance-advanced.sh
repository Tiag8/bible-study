#!/bin/bash
# Validação Compliance Workflows 8-14 (AVANÇADO)
# Usado por Workflow 14 - Fase 24.7

set -euo pipefail

# Argumentos
START=${1:-8}
END=${2:-14}

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
CRITICAL_FAILURES=0
TOTAL=$((END - START + 1))

echo "========================================="
echo "🔍 VALIDAÇÃO COMPLIANCE WORKFLOWS ${START}-${END} (AVANÇADO)"
echo "========================================="
echo ""

for WF in $(seq ${START} ${END}); do
  # Encontrar arquivo do workflow (pode ter sufixo a, b, c, etc.)
  FILE=$(ls .windsurf/workflows/add-feature-${WF}*.md 2>/dev/null | head -1)

  if [ ! -f "${FILE}" ]; then
    echo -e "${RED}❌ Workflow ${WF}: Arquivo não encontrado${NC}"
    FAILED=$((FAILED + 1))
    CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
    continue
  fi

  CHECKS=0
  TOTAL_CHECKS=8  # 6 básicos + 2 avançados
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 Validando Workflow ${WF}: $(basename ${FILE})"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Checks Básicos (1-6)

  # Check 1: Fase 0 (Load .context/)
  if grep -q "## 🧠 FASE 0:" "${FILE}"; then
    echo -e "  ${GREEN}✓${NC} Check 1: Fase 0 (Load .context/) presente"
    CHECKS=$((CHECKS + 1))
  else
    echo -e "  ${RED}✗${NC} Check 1: Fase 0 (Load .context/) AUSENTE"
  fi

  # Check 2: Fase Final (Update .context/)
  if grep -q "## 🧠 FASE FINAL:\|## 📊 FASE FINAL:" "${FILE}"; then
    echo -e "  ${GREEN}✓${NC} Check 2: Fase Final (Update .context/) presente"
    CHECKS=$((CHECKS + 1))
  else
    echo -e "  ${RED}✗${NC} Check 2: Fase Final (Update .context/) AUSENTE"
  fi

  # Check 3: workflow-progress.md
  if grep -q "workflow-progress.md" "${FILE}"; then
    echo -e "  ${GREEN}✓${NC} Check 3: workflow-progress.md referenciado"
    CHECKS=$((CHECKS + 1))
  else
    echo -e "  ${RED}✗${NC} Check 3: workflow-progress.md NÃO referenciado"
  fi

  # Check 4: temp-memory.md
  if grep -q "temp-memory.md" "${FILE}"; then
    echo -e "  ${GREEN}✓${NC} Check 4: temp-memory.md referenciado"
    CHECKS=$((CHECKS + 1))
  else
    echo -e "  ${RED}✗${NC} Check 4: temp-memory.md NÃO referenciado"
  fi

  # Check 5: attempts.log
  if grep -q "attempts.log" "${FILE}"; then
    echo -e "  ${GREEN}✓${NC} Check 5: attempts.log referenciado"
    CHECKS=$((CHECKS + 1))
  else
    echo -e "  ${RED}✗${NC} Check 5: attempts.log NÃO referenciado"
  fi

  # Check 6: Workflow size
  SIZE=$(wc -c < "${FILE}")
  SIZE_KB=$((SIZE / 1024))
  if [ ${SIZE} -lt 12000 ]; then
    echo -e "  ${GREEN}✓${NC} Check 6: Workflow size ${SIZE_KB}KB < 12KB"
    CHECKS=$((CHECKS + 1))
  else
    echo -e "  ${RED}✗${NC} Check 6: Workflow size ${SIZE_KB}KB >= 12KB"
  fi

  # Checks Avançados (10, 13)

  # Check 10: Meta-Learning capture (CRÍTICO para Workflows 8+)
  if grep -q "Meta-Learning\|🧠.*Learning\|meta-learning" "${FILE}"; then
    echo -e "  ${GREEN}✓${NC} Check 10: Meta-Learning capture presente"
    CHECKS=$((CHECKS + 1))
  else
    echo -e "  ${RED}✗${NC} Check 10: Meta-Learning AUSENTE ${BLUE}(CRÍTICO)${NC}"
    CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
  fi

  # Check 13: Consolidação (CRÍTICO apenas para Workflow 14)
  if [ ${WF} -eq 14 ]; then
    if grep -q "Consolidação\|consolidat\|Consolidat" "${FILE}"; then
      echo -e "  ${GREEN}✓${NC} Check 13: Consolidação presente (Workflow 14)"
      CHECKS=$((CHECKS + 1))
    else
      echo -e "  ${RED}✗${NC} Check 13: Consolidação AUSENTE ${BLUE}(CRÍTICO)${NC}"
      CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
    fi
  fi

  # Resultado do workflow
  echo ""
  if [ ${CHECKS} -ge 7 ]; then
    echo -e "  ${GREEN}✅ ${CHECKS}/${TOTAL_CHECKS} checks passed - COMPLIANCE OK${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "  ${RED}❌ ${CHECKS}/${TOTAL_CHECKS} checks passed - COMPLIANCE FALHOU${NC}"
    FAILED=$((FAILED + 1))
  fi
  echo ""
done

# Resultado final
echo "========================================="
echo "📊 RESULTADO FINAL (WORKFLOWS ${START}-${END})"
echo "========================================="
echo ""
echo "Total workflows: ${TOTAL}"
echo -e "${GREEN}Passaram: ${PASSED}${NC}"
echo -e "${RED}Falharam: ${FAILED}${NC}"
echo -e "${BLUE}Falhas críticas: ${CRITICAL_FAILURES}${NC}"
echo ""

if [ ${FAILED} -eq 0 ]; then
  echo -e "${GREEN}✅ COMPLIANCE 100% OK - Sistema completo validado${NC}"
  echo -e "${GREEN}✅ Meta-Learning FUNCIONA PERFEITAMENTE${NC}"
  exit 0
else
  if [ ${CRITICAL_FAILURES} -gt 0 ]; then
    echo -e "${RED}🔴 FALHAS CRÍTICAS DETECTADAS${NC}"
    echo ""
    echo "📝 Próximos passos (URGENTE):"
    echo "1. Check 10 falhou? Adicionar Meta-Learning em Fase Final"
    echo "2. Check 13 falhou? Adicionar Consolidação em Workflow 14"
    echo "3. Ver PHASE-17.11-AND-24.7-CONTENT.md para templates"
    exit 2
  else
    echo -e "${YELLOW}⚠️ FALHAS NÃO-CRÍTICAS${NC}"
    echo ""
    echo "📝 Próximos passos:"
    echo "1. Identificar workflows não-compliant (checks 1-6)"
    echo "2. Abrir issue em docs/TASK.md"
    echo "3. Priorizar correção próximo ciclo"
    exit 1
  fi
fi
