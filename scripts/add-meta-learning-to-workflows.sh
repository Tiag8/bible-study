#!/bin/bash

# Add Meta-Learning Section to ALL Workflows
# Inserts meta-learning section before "CONTINUAÇÃO AUTOMÁTICA" or "Próximo Workflow"

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WORKFLOW_DIR=".windsurf/workflows"
TEMPLATE=".windsurf/templates/meta-learning-section.md"

# Check if template exists
if [ ! -f "$TEMPLATE" ]; then
  echo -e "${RED}❌ Template não encontrado: $TEMPLATE${NC}"
  exit 1
fi

# Read template content
TEMPLATE_CONTENT=$(cat "$TEMPLATE")

echo "🔍 Buscando workflows sem meta-learning em $WORKFLOW_DIR..."
echo ""

# Counters
total_files=0
skipped_files=0
updated_files=0
failed_files=0

# Process each workflow
while IFS= read -r -d '' file; do
  ((total_files++))
  
  filename=$(basename "$file")
  
  # Skip if already has meta-learning
  if grep -q "## 🧠 Meta-Learning: Captura de Aprendizados" "$file"; then
    echo -e "${YELLOW}⏭️  SKIP: $filename (já tem meta-learning)${NC}"
    ((skipped_files++))
    continue
  fi
  
  # Check if has "CONTINUAÇÃO AUTOMÁTICA" or "Próximo Workflow"
  if ! grep -q "## ⏭️ CONTINUAÇÃO AUTOMÁTICA\|## 🔄 Próximo Workflow" "$file"; then
    echo -e "${YELLOW}⏭️  SKIP: $filename (sem seção de continuação)${NC}"
    ((skipped_files++))
    continue
  fi
  
  # Create backup
  cp "$file" "$file.bak"
  
  # Insert meta-learning section before "CONTINUAÇÃO AUTOMÁTICA" or "Próximo Workflow"
  # Using awk for precise insertion
  awk -v template="$TEMPLATE_CONTENT" '
    /^## ⏭️ CONTINUAÇÃO AUTOMÁTICA|^## 🔄 Próximo Workflow/ {
      if (!inserted) {
        print "---"
        print ""
        print template
        print ""
        inserted = 1
      }
    }
    { print }
  ' "$file.bak" > "$file"
  
  # Check if file size increased (meta-learning was added)
  original_size=$(wc -c < "$file.bak")
  new_size=$(wc -c < "$file")
  
  if [ "$new_size" -gt "$original_size" ]; then
    size_diff=$((new_size - original_size))
    echo -e "${GREEN}✅ UPDATED: $filename (+$size_diff chars, total: $new_size chars)${NC}"
    ((updated_files++))
    # Remove backup
    rm "$file.bak"
  else
    echo -e "${RED}❌ FAILED: $filename (tamanho não aumentou)${NC}"
    # Restore backup
    mv "$file.bak" "$file"
    ((failed_files++))
  fi
  
done < <(find "$WORKFLOW_DIR" -name "*.md" -type f -print0)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO:"
echo "  Total analisados: $total_files"
echo -e "  ${YELLOW}Já tinham: $skipped_files${NC}"
echo -e "  ${GREEN}Atualizados: $updated_files${NC}"
echo -e "  ${RED}Falharam: $failed_files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$updated_files" -gt 0 ]; then
  echo -e "${GREEN}✅ Meta-learning adicionado a $updated_files workflows!${NC}"
  echo ""
  echo "📝 Próximo passo: Validar tamanhos"
  echo "   ./scripts/validate-workflow-size.sh"
  echo ""
fi

exit 0
