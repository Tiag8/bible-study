#!/bin/bash
# validate-feature-compliance.sh
# Workflow 14 - Padrão #12 (Workflow Compliance 100%)
# Valida se feature executou todos workflows obrigatórios
# ROI: Garante processo consistente 100% features

set -e

BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
WORKFLOW_PROGRESS=".context/${BRANCH}_workflow-progress.md"

echo "🔍 Validando Feature Compliance - Branch: $BRANCH"
echo ""

# ============================================
# 1. VERIFICAR ARQUIVO WORKFLOW-PROGRESS EXISTE
# ============================================
if [ ! -f "$WORKFLOW_PROGRESS" ]; then
  echo "❌ FALHOU: Arquivo $WORKFLOW_PROGRESS não encontrado"
  echo ""
  echo "Ação: Executar Workflow 1 primeiro (context-init.sh)"
  exit 1
fi

echo "✅ Arquivo workflow-progress encontrado"
echo ""

# ============================================
# 2. WORKFLOWS OBRIGATÓRIOS (Matriz de Compliance)
# ============================================
MANDATORY_WORKFLOWS=(
  "Workflow 1"   # Planning + GATE 1 Reframing (CSF)
  "Workflow 2b"  # Technical Design + External Validation + Memory Audit
  "Workflow 4.5" # Pre-Implementation Gates
  "Workflow 5a"  # Implementation
  "Workflow 6a"  # Testing + Validation
  "Workflow 7a"  # Quality Gates
  "Workflow 9a"  # Finalization
)

# ============================================
# 3. VALIDAR CADA WORKFLOW OBRIGATÓRIO
# ============================================
echo "📋 Validando workflows obrigatórios..."
echo ""

MISSING_WORKFLOWS=()
COMPLETED_COUNT=0

for workflow in "${MANDATORY_WORKFLOWS[@]}"; do
  # Buscar workflow no arquivo (formato: "### Workflow X:")
  if grep -q "### $workflow.*✅ COMPLETO" "$WORKFLOW_PROGRESS"; then
    echo "✅ $workflow: COMPLETO"
    COMPLETED_COUNT=$((COMPLETED_COUNT + 1))
  elif grep -q "### $workflow" "$WORKFLOW_PROGRESS"; then
    echo "⚠️ $workflow: INICIADO (mas não completo)"
    MISSING_WORKFLOWS+=("$workflow (iniciado mas não finalizado)")
  else
    echo "❌ $workflow: NÃO ENCONTRADO"
    MISSING_WORKFLOWS+=("$workflow (não executado)")
  fi
done

echo ""

# ============================================
# 4. CHECKS ESPECÍFICOS CRÍTICOS
# ============================================
echo "🔍 Validando checks críticos..."
echo ""

# Check 1: GATE 1 Reframing (CSF)
if grep -q "GATE 1.*Reframing" "$WORKFLOW_PROGRESS"; then
  echo "✅ GATE 1 Reframing: EXECUTADO"
else
  echo "❌ GATE 1 Reframing: NÃO ENCONTRADO (CSF VIOLADO)"
  MISSING_WORKFLOWS+=("GATE 1 Reframing (CSF crítico)")
fi

# Check 2: Memory Audit (Workflow 2b Fase 0.2)
if grep -q "Memory Audit\|Memory Files Consulted" "$WORKFLOW_PROGRESS"; then
  echo "✅ Memory Audit: EXECUTADO"
else
  echo "⚠️ Memory Audit: NÃO ENCONTRADO (recomendado)"
fi

# Check 3: Pre-Implementation Gates (Workflow 4.5)
GATES_FOUND=$(grep -c "GATE [0-9]" "$WORKFLOW_PROGRESS" || echo "0")
if [ "$GATES_FOUND" -ge 6 ]; then
  echo "✅ Pre-Implementation Gates: $GATES_FOUND gates executados"
else
  echo "⚠️ Pre-Implementation Gates: Apenas $GATES_FOUND gates (esperado 6+)"
fi

# Check 4: Quality Gates (Workflow 7a)
QUALITY_GATES=$(grep -c "GATE 7\." "$WORKFLOW_PROGRESS" || echo "0")
if [ "$QUALITY_GATES" -ge 7 ]; then
  echo "✅ Quality Gates: $QUALITY_GATES gates executados"
else
  echo "⚠️ Quality Gates: Apenas $QUALITY_GATES gates (esperado 7)"
fi

echo ""

# ============================================
# 5. RESULTADO FINAL
# ============================================
TOTAL_MANDATORY=${#MANDATORY_WORKFLOWS[@]}
COMPLIANCE_PCT=$(( COMPLETED_COUNT * 100 / TOTAL_MANDATORY ))

echo "📊 RESULTADO FEATURE COMPLIANCE"
echo ""
echo "Workflows Obrigatórios:"
echo "  - Total: $TOTAL_MANDATORY"
echo "  - Completados: $COMPLETED_COUNT"
echo "  - Compliance: $COMPLIANCE_PCT%"
echo ""

if [ ${#MISSING_WORKFLOWS[@]} -eq 0 ]; then
  echo "🎯 COMPLIANCE: 100% ✅"
  echo ""
  echo "Todos workflows obrigatórios executados."
  echo "Feature pronta para merge (compliance validado)."
  echo ""
  exit 0
else
  echo "⚠️ COMPLIANCE: $COMPLIANCE_PCT% (< 100%)"
  echo ""
  echo "Workflows faltantes ou incompletos:"
  for missing in "${MISSING_WORKFLOWS[@]}"; do
    echo "  - $missing"
  done
  echo ""

  if [ $COMPLIANCE_PCT -lt 80 ]; then
    echo "❌ BLOQUEIO: Compliance < 80% (critical threshold)"
    echo ""
    echo "Ação obrigatória: Executar workflows faltantes ANTES de merge"
    exit 1
  else
    echo "⚠️ WARNING: Compliance >= 80% mas < 100%"
    echo ""
    echo "Recomendação: Completar workflows faltantes (best practice)"
    exit 0
  fi
fi
