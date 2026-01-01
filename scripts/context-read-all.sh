#!/bin/bash
set -e

# ============================================================================
# Script: context-read-all.sh
# Purpose: Ler TODOS arquivos .context/ de uma branch (zero perda knowledge)
# Usage: ./scripts/context-read-all.sh [branch-prefix] [--strict]
#        --strict: Bloqueia (exit 1) se não houver arquivos
# ============================================================================

# Parse arguments
STRICT_MODE=false
BRANCH_PREFIX=""

for arg in "$@"; do
  case $arg in
    --strict)
      STRICT_MODE=true
      ;;
    *)
      if [ -z "$BRANCH_PREFIX" ]; then
        BRANCH_PREFIX="$arg"
      fi
      ;;
  esac
done

# Default branch prefix
if [ -z "$BRANCH_PREFIX" ]; then
  BRANCH_PREFIX=$(git branch --show-current 2>/dev/null | sed 's/\//-/g' || echo "unknown")
fi

echo "==================================================================="
echo "LENDO TODOS ARQUIVOS .context/ - Branch: $BRANCH_PREFIX"
if [ "$STRICT_MODE" = true ]; then
  echo "MODO: STRICT (bloqueia se vazio)"
fi
echo "==================================================================="
echo ""

# Contar total de arquivos
TOTAL_FILES=$(ls -1 .context/${BRANCH_PREFIX}_*.md 2>/dev/null | wc -l | tr -d ' ')

if [ "$TOTAL_FILES" -eq 0 ]; then
  echo "⚠️ Nenhum arquivo .context/ encontrado para branch: $BRANCH_PREFIX"
  if [ "$STRICT_MODE" = true ]; then
    echo ""
    echo "❌ BLOQUEADO (--strict mode): Contexto DEVE existir antes de prosseguir"
    echo ""
    echo "AÇÃO: Executar ./scripts/context-init.sh primeiro"
    exit 1
  fi
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
