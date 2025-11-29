#!/bin/bash
# ============================================================================
# validate-days-of-week-format.sh
# ============================================================================
# Valida conversão JS→DB days_of_week (JS: 0=dom | DB ISO: 7=dom)
# Uso: ./scripts/validate-days-of-week-format.sh
# ============================================================================

SEARCH_DIRS="supabase/functions src"
FAILED=0

echo "=== Validando Conversão days_of_week (JS→DB) ==="
echo ""

FILES=$(grep -rl "days_of_week" $SEARCH_DIRS 2>/dev/null | grep -E "\.(ts|tsx|js)$")

if [ -z "$FILES" ]; then
  echo "[INFO] Nenhum arquivo com days_of_week encontrado"
  exit 0
fi

echo "Arquivos analisados:"
for file in $FILES; do
  echo "  - $file"
  HAS_FORMAT=$(grep -E "ISO|1-7|0-6|domingo|Sunday" "$file" 2>/dev/null | wc -l | tr -d ' ')

  if [ "$HAS_FORMAT" -gt 0 ]; then
    echo "    [OK] Documentacao de formato"
  elif echo "$file" | grep -qE "migration|handler|reminder"; then
    echo "    [WARN] Arquivo critico SEM documentacao"
    ((FAILED++))
  fi
done

echo ""
echo "=== Resultado ==="

if [ "$FAILED" -gt 0 ]; then
  echo "[WARN] $FAILED arquivo(s) sem documentacao de formato"
  echo "RECOMENDACAO: // days_of_week: 1=seg...7=dom (ISO 8601)"
  exit 1
fi

echo "[PASS] Todos os arquivos OK"
exit 0
