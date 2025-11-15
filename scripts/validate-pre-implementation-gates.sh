#!/bin/bash
set -e

# ============================================================================
# Script: validate-pre-implementation-gates.sh
# Purpose: Enforcer automático - bloqueia Workflow 5a se Workflow 4.5 não executado
# Usage: ./scripts/validate-pre-implementation-gates.sh
# ============================================================================

BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
ATTEMPTS_LOG=".context/${BRANCH_PREFIX}_attempts.log"

echo "==================================================================="
echo "VALIDANDO PRE-IMPLEMENTATION QUALITY GATES"
echo "==================================================================="
echo ""

# Check 0: Bypass forçado?
if [ "$SKIP_GATES" = "1" ]; then
  echo "⚠️ BYPASS ATIVADO: Pulando gates (SKIP_GATES=1)"
  echo ""
  echo "ATENÇÃO: Você está DESABILITANDO gates preventivos."
  echo "Risco de bugs pós-código aumenta 10x."
  echo ""
  echo "==================================================================="
  echo "🚀 PROSSEGUIR PARA WORKFLOW 5a (Implementation) - BYPASS MODE"
  echo "==================================================================="
  exit 0
fi

# Check 1: Workflow 4.5 executado?
if [ ! -f "$ATTEMPTS_LOG" ]; then
  echo "❌ BLOQUEADO: Arquivo .context/ não encontrado"
  echo ""
  echo "Execute primeiro: ./scripts/context-init.sh"
  exit 1
fi

if ! grep -q "WORKFLOW: 4.5 (Pre-Implementation Gates) - COMPLETO" "$ATTEMPTS_LOG" 2>/dev/null; then
  echo "❌ BLOQUEADO: Workflow 4.5 NÃO executado"
  echo ""
  echo "📋 Workflow 4.5 (Pre-Implementation Quality Gates) é OBRIGATÓRIO antes de Workflow 5a."
  echo ""
  echo "Por quê?"
  echo "- Previne 70% bugs pós-código (baseado em ML-CONTEXT-03)"
  echo "- Evidência: feat-payment-gateway (5h) vs feat-sync-crud-mandamentos (52h)"
  echo "- Diferença: 10x (47h economizadas com gates preventivos)"
  echo ""
  echo "🚀 Execute agora:"
  echo "   .windsurf/workflows/add-feature-4.5-pre-implementation-gates.md"
  echo ""
  echo "Ou force bypass (NÃO RECOMENDADO):"
  echo "   export SKIP_GATES=1"
  echo ""
  exit 1
fi

# Check 2: TODOS 6 gates validados?
GATES_EXPECTED=6
GATES_APPROVED=$(grep -c "GATE.*✅ APROVADO" "$ATTEMPTS_LOG" 2>/dev/null || echo 0)

if [ "$GATES_APPROVED" -lt "$GATES_EXPECTED" ]; then
  echo "⚠️ AVISO: Workflow 4.5 executado mas apenas $GATES_APPROVED/$GATES_EXPECTED gates aprovados"
  echo ""
  echo "Gates faltantes podem indicar validações incompletas."
  echo ""
  echo "Continuar? (y/N)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Abortado pelo usuário"
    exit 1
  fi
fi

echo "✅ PRE-IMPLEMENTATION GATES VALIDADOS"
echo ""
echo "Workflow 4.5 executado: ✅"
echo "Gates aprovados: $GATES_APPROVED/$GATES_EXPECTED"
echo ""
echo "==================================================================="
echo "🚀 PROSSEGUIR PARA WORKFLOW 5a (Implementation)"
echo "==================================================================="
