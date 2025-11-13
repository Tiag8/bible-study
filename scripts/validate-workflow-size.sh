#!/bin/bash

# Validate Workflow Size Script
# Ensures all workflow files are under 12k character limit
# Exit code: 0 (all OK), 1 (at least one exceeds limit)

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WORKFLOW_DIR=".windsurf/workflows"
MAX_SIZE=12000
WARNING_SIZE=11000

# Check if workflow directory exists
if [ ! -d "$WORKFLOW_DIR" ]; then
  echo -e "${RED}❌ Diretório $WORKFLOW_DIR não encontrado!${NC}"
  exit 1
fi

echo "🔍 Validando tamanho dos workflows em $WORKFLOW_DIR..."
echo "📏 Limite: $MAX_SIZE chars | Aviso: $WARNING_SIZE chars"
echo ""

# Initialize counters
total_files=0
exceeded_files=0
warning_files=0
ok_files=0

# Arrays to store results
declare -a EXCEEDED=()
declare -a WARNING=()
declare -a OK=()

# Check each workflow file
while IFS= read -r -d '' file; do
  ((total_files++))

  filename=$(basename "$file")
  size=$(wc -c < "$file")

  if [ "$size" -gt "$MAX_SIZE" ]; then
    ((exceeded_files++))
    EXCEEDED+=("$filename:$size")
  elif [ "$size" -gt "$WARNING_SIZE" ]; then
    ((warning_files++))
    WARNING+=("$filename:$size")
  else
    ((ok_files++))
    OK+=("$filename:$size")
  fi
done < <(find "$WORKFLOW_DIR" -name "*.md" -type f ! -path "*/.backup/*" -print0)

# Print results
echo "📊 RESUMO DA VALIDAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total de workflows: $total_files"
echo -e "${GREEN}✅ OK (< ${WARNING_SIZE}): $ok_files${NC}"
echo -e "${YELLOW}⚠️  Aviso (${WARNING_SIZE}-${MAX_SIZE}): $warning_files${NC}"
echo -e "${RED}❌ Excederam limite (> ${MAX_SIZE}): $exceeded_files${NC}"
echo ""

# Print exceeded files (CRITICAL)
if [ "$exceeded_files" -gt 0 ]; then
  echo -e "${RED}🚨 ARQUIVOS QUE EXCEDEM O LIMITE (${MAX_SIZE} chars):${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for item in "${EXCEEDED[@]}"; do
    filename="${item%:*}"
    size="${item#*:}"
    percentage=$((size * 100 / MAX_SIZE))
    echo -e "${RED}  ❌ $filename: $size chars (${percentage}% do limite)${NC}"
  done
  echo ""
fi

# Print warning files
if [ "$warning_files" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  ARQUIVOS PRÓXIMOS AO LIMITE (${WARNING_SIZE}-${MAX_SIZE} chars):${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for item in "${WARNING[@]}"; do
    filename="${item%:*}"
    size="${item#*:}"
    percentage=$((size * 100 / MAX_SIZE))
    echo -e "${YELLOW}  ⚠️  $filename: $size chars (${percentage}% do limite)${NC}"
  done
  echo ""
fi

# Print OK files (if verbose mode or small list)
if [ "$ok_files" -le 10 ]; then
  echo -e "${GREEN}✅ ARQUIVOS OK (< ${WARNING_SIZE} chars):${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for item in "${OK[@]}"; do
    filename="${item%:*}"
    size="${item#*:}"
    percentage=$((size * 100 / MAX_SIZE))
    echo -e "${GREEN}  ✅ $filename: $size chars (${percentage}% do limite)${NC}"
  done
  echo ""
fi

# Print recommendations
if [ "$exceeded_files" -gt 0 ] || [ "$warning_files" -gt 0 ]; then
  echo "💡 RECOMENDAÇÕES:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [ "$exceeded_files" -gt 0 ]; then
    echo "  🔴 URGENTE - Arquivos que excedem limite:"
    echo "     1. Dividir workflow em múltiplas partes (ex: 11a → 11a + 11a2)"
    echo "     2. Ou comprimir: remover exemplos redundantes, consolidar checklists"
  fi

  if [ "$warning_files" -gt 0 ]; then
    echo "  🟡 PREVENTIVO - Arquivos próximos ao limite:"
    echo "     1. Revisar e otimizar antes de adicionar novo conteúdo"
    echo "     2. Considerar extrair detalhes para docs/"
  fi

  echo ""
fi

# Statistics
echo "📈 ESTATÍSTICAS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Calculate total size
total_size=0
for item in "${EXCEEDED[@]+"${EXCEEDED[@]}"}" "${WARNING[@]+"${WARNING[@]}"}" "${OK[@]+"${OK[@]}"}"; do
  if [ -n "$item" ]; then
    size="${item#*:}"
    total_size=$((total_size + size))
  fi
done

avg_size=$((total_size / total_files))
echo "  Total: $total_size chars"
echo "  Média: $avg_size chars/workflow"
echo "  Utilização média: $((avg_size * 100 / MAX_SIZE))% do limite"
echo ""

# Exit with error if any file exceeded limit
if [ "$exceeded_files" -gt 0 ]; then
  echo -e "${RED}❌ VALIDAÇÃO FALHOU: $exceeded_files arquivo(s) excederam o limite de $MAX_SIZE chars${NC}"
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ VALIDAÇÃO OK: Todos os workflows estão dentro do limite!${NC}"
  echo ""
  exit 0
fi
