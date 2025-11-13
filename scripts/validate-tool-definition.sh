#!/bin/bash
# Valida tool definitions do Gemini antes de deploy
# Previne bugs de tool não reconhecido (ROI: 15-30min/tool)

set -e

echo "🔍 Validando Gemini Tool Definitions..."
echo ""

TOOLS_DIR="supabase/functions/_shared"
ERRORS=0

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Encontrar todos os arquivos de tools
TOOL_FILES=$(find "$TOOLS_DIR" -name "gemini-tools-*.ts" 2>/dev/null || echo "")

if [ -z "$TOOL_FILES" ]; then
  echo -e "${YELLOW}⚠️  Nenhum arquivo gemini-tools-*.ts encontrado${NC}"
  exit 0
fi

echo "📁 Arquivos encontrados:"
echo "$TOOL_FILES" | while read -r file; do
  echo "  - $file"
done
echo ""

# Validar cada arquivo
for file in $TOOL_FILES; do
  echo "🔍 Validando: $(basename "$file")"
  
  # Check 1: Import FunctionDeclaration
  if ! grep -q "import.*FunctionDeclaration.*@google/generative-ai" "$file"; then
    echo -e "${RED}❌ ERRO: Falta import FunctionDeclaration${NC}"
    echo "   Adicione: import type { FunctionDeclaration } from '@google/generative-ai';"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ Import FunctionDeclaration OK${NC}"
  fi
  
  # Check 2: FunctionDeclaration type usage
  if ! grep -q ": FunctionDeclaration = {" "$file"; then
    echo -e "${RED}❌ ERRO: Tool não usa FunctionDeclaration type${NC}"
    echo "   Use: export const MY_TOOL: FunctionDeclaration = { ... }"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ FunctionDeclaration type OK${NC}"
  fi
  
  # Check 3: Description com seções
  if ! grep -q "QUANDO CHAMAR:" "$file"; then
    echo -e "${YELLOW}⚠️  AVISO: Description sem seção 'QUANDO CHAMAR:'${NC}"
    echo "   Recomendado para clareza"
  else
    echo -e "${GREEN}✅ Description com 'QUANDO CHAMAR:' OK${NC}"
  fi
  
  if ! grep -q "RETORNA:" "$file"; then
    echo -e "${YELLOW}⚠️  AVISO: Description sem seção 'RETORNA:'${NC}"
    echo "   Recomendado para clareza"
  else
    echo -e "${GREEN}✅ Description com 'RETORNA:' OK${NC}"
  fi
  
  # Check 4: Parameters type uppercase
  if grep -q "type: 'object'" "$file"; then
    echo -e "${RED}❌ ERRO: Parameters type deve ser 'OBJECT' (uppercase)${NC}"
    echo "   Corrija: type: 'object' → type: 'OBJECT'"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ Parameters type OK${NC}"
  fi
  
  # Check 5: Tool exportado
  if ! grep -q "export const.*TOOLS.*=.*\[" "$file"; then
    echo -e "${YELLOW}⚠️  AVISO: Nenhum array TOOLS exportado${NC}"
    echo "   Verifique se tool está sendo exportado"
  else
    echo -e "${GREEN}✅ Array TOOLS exportado OK${NC}"
  fi
  
  echo ""
done

# Resultado final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Validação APROVADA - Todos tools OK!${NC}"
  echo ""
  echo "Pode prosseguir com deploy."
  exit 0
else
  echo -e "${RED}❌ Validação FALHOU - $ERRORS erro(s) encontrado(s)${NC}"
  echo ""
  echo "Corrija os erros antes de deploy."
  echo "Referência: docs/meta-learnings/ML-15-payment-gateway-learnings.md"
  exit 1
fi
