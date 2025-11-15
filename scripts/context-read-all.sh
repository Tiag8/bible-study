#!/bin/bash
set -e

# ============================================================================
# Script: context-read-all.sh
# Purpose: Ler TODOS arquivos .context/ de uma branch (zero perda knowledge)
# Usage: ./scripts/context-read-all.sh [branch-prefix]
# ============================================================================

BRANCH_PREFIX="${1:-$(git branch --show-current | sed 's/\//-/g')}"

echo "==================================================================="
echo "LENDO TODOS ARQUIVOS .context/ - Branch: $BRANCH_PREFIX"
echo "==================================================================="
echo ""

# Contar total de arquivos
TOTAL_FILES=$(ls -1 .context/${BRANCH_PREFIX}_*.md 2>/dev/null | wc -l | tr -d ' ')

if [ "$TOTAL_FILES" -eq 0 ]; then
  echo "⚠️ Nenhum arquivo .context/ encontrado para branch: $BRANCH_PREFIX"
  exit 0
fi

echo "📋 Total arquivos: $TOTAL_FILES"
echo ""

# Ler cada arquivo com header
COUNTER=0
ls -1 .context/${BRANCH_PREFIX}_*.md 2>/dev/null | while read file; do
  COUNTER=$((COUNTER + 1))
  echo "[$COUNTER/$TOTAL_FILES] ==================================================================="
  echo "FILE: $(basename $file)"
  echo "LINES: $(wc -l < "$file")"
  echo "==================================================================="
  echo ""
  cat "$file"
  echo ""
  echo ""
done

echo "==================================================================="
echo "✅ LEITURA COMPLETA: $TOTAL_FILES arquivos .context/"
echo "==================================================================="
