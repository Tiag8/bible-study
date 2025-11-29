#!/bin/bash
# ============================================================================
# validate-response-validator-order.sh
# ============================================================================
# Valida que response-validator tem checkpoint de sequência
# Verifica se existe validação de ordem de mensagens
# Uso: ./scripts/validate-response-validator-order.sh
# ============================================================================

VALIDATOR_FILE="supabase/functions/_shared/response-validator.ts"

echo "=== Validando Checkpoint de Sequência em Response Validator ==="
echo ""

if [ ! -f "$VALIDATOR_FILE" ]; then
  echo "[FAIL] Arquivo nao encontrado: $VALIDATOR_FILE"
  exit 1
fi

# Verifica patterns de sequência/ordem
SEQUENCE_PATTERNS=(
  "messageCount"
  "sequence"
  "order"
  "step"
  "phase"
)

FOUND=0
for pattern in "${SEQUENCE_PATTERNS[@]}"; do
  if grep -q "$pattern" "$VALIDATOR_FILE" 2>/dev/null; then
    echo "[FOUND] Pattern '$pattern' presente"
    ((FOUND++))
  fi
done

echo ""
echo "=== Resultado ==="

if [ "$FOUND" -ge 1 ]; then
  echo "[PASS] Response validator tem $FOUND pattern(s) de sequência"
  exit 0
else
  echo "[WARN] Nenhum pattern de sequência encontrado"
  echo ""
  echo "RECOMENDACAO: Adicionar validação de ordem de mensagens"
  echo "Exemplo: Verificar messageCount para ajustar tom/conteúdo"
  exit 1
fi
