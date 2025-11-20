#!/bin/bash
# scripts/validate-gate-1-executed.sh
# Valida que GATE 1 Reframing foi executado (CSF non-negotiable ADR-031)

set -e

echo "🚨 Validação GATE 1 Reframing (CSF)"
echo ""

# Detectar branch atual
BRANCH=$(git branch --show-current | sed 's/\//-/g')
ATTEMPTS_LOG=".context/${BRANCH}_attempts.log"

# Validar attempts.log existe
if [ ! -f "$ATTEMPTS_LOG" ]; then
  echo "❌ ERRO: $ATTEMPTS_LOG não encontrado"
  echo ""
  echo "⚠️ .context/ não inicializado?"
  echo "Executar: ./scripts/context-init.sh"
  exit 1
fi

echo "📂 Arquivo: $ATTEMPTS_LOG"
echo ""

# Check 1: GATE 1 executado?
if grep -q "GATE 1.*Reframing" "$ATTEMPTS_LOG"; then
  GATE1_LINE=$(grep "GATE 1.*Reframing" "$ATTEMPTS_LOG" | head -1)
  echo "✅ GATE 1 Reframing EXECUTADO"
  echo "   Evidência: $GATE1_LINE"
else
  echo "❌ ERRO: GATE 1 Reframing NÃO EXECUTADO"
  echo ""
  echo "🚨 GATE 1 é Critical Success Factor (ADR-031)"
  echo ""
  echo "📋 Workflow 1 Fase 1.5 é OBRIGATÓRIO:"
  echo "  1. Questionar pedido (5 Whys)"
  echo "  2. Propor 3 perspectivas (Literal, Subjacente, Sistêmico)"
  echo "  3. Validar com usuário (GATE 1 checklist)"
  echo ""
  echo "🎯 AÇÃO: Retornar Workflow 1 → Executar Fase 1.5 → Validar GATE 1"
  echo ""
  echo "⛔ BLOQUEIO: Workflow 2b NÃO pode prosseguir sem GATE 1"
  exit 1
fi

echo ""

# Check 2: Usuário validou perspectiva?
if grep -q "Perspectiva.*validada\|usuário validou\|GATE 1.*aprovado" "$ATTEMPTS_LOG"; then
  echo "✅ Usuário validou perspectiva"
else
  echo "⚠️ AVISO: Validação usuário não registrada"
  echo "   Confirmar manualmente em decisions.md"
fi

echo ""

# Check 3: Perspectiva registrada em decisions.md?
DECISIONS_MD=".context/${BRANCH}_decisions.md"
if [ -f "$DECISIONS_MD" ]; then
  if grep -q "Reframing\|Perspectiva escolhida" "$DECISIONS_MD"; then
    echo "✅ Perspectiva documentada em decisions.md"
  else
    echo "⚠️ AVISO: Perspectiva NÃO documentada em decisions.md"
    echo "   Recomendado: Adicionar Decisão 0 (Reframing)"
  fi
else
  echo "⚠️ AVISO: $DECISIONS_MD não encontrado"
fi

echo ""
echo "✅ GATE 1 APROVADO: CSF validado (ADR-031)"
echo ""
echo "🎯 Workflow 2b pode prosseguir"
