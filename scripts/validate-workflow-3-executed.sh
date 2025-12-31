#!/bin/bash
# scripts/validate-workflow-3-executed.sh
# Valida que Workflow 3 (Risk Analysis) foi executado ANTES de prosseguir
#
# Uso:
#   ./scripts/validate-workflow-3-executed.sh
#
# Exit codes:
#   0 = APROVADO (WF3 executado)
#   1 = BLOQUEADO (WF3 não executado)

set -e

echo "🚨 Validação Workflow 3 - Risk Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detectar branch atual
BRANCH=$(git branch --show-current | sed 's/\//-/g')
ATTEMPTS_LOG=".context/${BRANCH}_attempts.log"
DECISIONS_MD=".context/${BRANCH}_decisions.md"
WORKFLOW_PROGRESS=".context/${BRANCH}_workflow-progress.md"

# Validar attempts.log existe
if [ ! -f "$ATTEMPTS_LOG" ]; then
  echo "❌ ERRO: $ATTEMPTS_LOG não encontrado"
  echo ""
  echo "⚠️ .context/ não inicializado?"
  echo "   Executar: ./scripts/context-init.sh"
  exit 1
fi

echo "📂 Branch: $BRANCH"
echo "📂 Attempts: $ATTEMPTS_LOG"
echo ""

# Check 1: Workflow 3 registrado em attempts.log?
WF3_EXECUTED=false
if grep -qE "WORKFLOW.*3.*Risk|Risk Analysis.*COMPLETO|WORKFLOW: 3" "$ATTEMPTS_LOG"; then
  WF3_LINE=$(grep -E "WORKFLOW.*3.*Risk|Risk Analysis.*COMPLETO|WORKFLOW: 3" "$ATTEMPTS_LOG" | tail -1)
  echo "✅ Workflow 3 (Risk Analysis) registrado em attempts.log"
  echo "   Evidência: $WF3_LINE"
  WF3_EXECUTED=true
fi

# Check 2: Seção Risk Analysis em decisions.md?
RISK_DOCUMENTED=false
if [ -f "$DECISIONS_MD" ]; then
  if grep -qE "Risk Analysis|Riscos Identificados|Mitigações|Rollback Plan" "$DECISIONS_MD"; then
    echo "✅ Riscos documentados em decisions.md"
    RISK_DOCUMENTED=true
  else
    echo "⚠️ Riscos NÃO documentados em decisions.md"
  fi
else
  echo "⚠️ $DECISIONS_MD não encontrado"
fi

# Check 3: Workflow progress atualizado?
WF3_PROGRESS=false
if [ -f "$WORKFLOW_PROGRESS" ]; then
  if grep -qE "Workflow 3.*Risk|Risk Analysis.*✅" "$WORKFLOW_PROGRESS"; then
    echo "✅ Workflow 3 marcado em workflow-progress.md"
    WF3_PROGRESS=true
  else
    echo "⚠️ Workflow 3 NÃO marcado em workflow-progress.md"
  fi
else
  echo "⚠️ $WORKFLOW_PROGRESS não encontrado"
fi

echo ""

# Decisão final
if [ "$WF3_EXECUTED" = true ] || [ "$RISK_DOCUMENTED" = true ] || [ "$WF3_PROGRESS" = true ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ WORKFLOW 3 (Risk Analysis) APROVADO"
  echo ""
  echo "📋 Evidências encontradas:"
  [ "$WF3_EXECUTED" = true ] && echo "   ✅ Registro em attempts.log"
  [ "$RISK_DOCUMENTED" = true ] && echo "   ✅ Riscos em decisions.md"
  [ "$WF3_PROGRESS" = true ] && echo "   ✅ Marcação em workflow-progress.md"
  echo ""
  echo "🎯 Pode prosseguir para Workflow 3.5 (Tasks)"
  exit 0
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ WORKFLOW 3 (Risk Analysis) NÃO EXECUTADO"
  echo ""
  echo "🚨 Workflow 3 é OBRIGATÓRIO antes de Tasks e Implementation"
  echo ""
  echo "📋 Workflow 3 inclui:"
  echo "   1. Análise de riscos (técnicos, segurança, negócio)"
  echo "   2. Mitigações baseadas em evidências"
  echo "   3. Rollback plan (4 opções)"
  echo "   4. GATE 2 (User approval)"
  echo ""
  echo "🎯 AÇÃO: Executar Workflow 3 (Risk Analysis)"
  echo "   Arquivo: .windsurf/workflows/add-feature-3-risk-analysis.md"
  echo ""
  echo "⛔ BLOQUEIO: Workflow 3.5/4.5 NÃO podem prosseguir sem Risk Analysis"
  exit 1
fi
