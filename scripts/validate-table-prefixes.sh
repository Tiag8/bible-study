#!/bin/bash

# Script: validate-table-prefixes.sh
# Propósito: Validar que TODAS queries Supabase usam prefixo lifetracker_
# Verifica padrões: .from('tabela'), .from("tabela"), table: 'tabela'
# Exit code: 0 = sucesso, 1 = erros encontrados

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Validando prefixos de tabelas Supabase${NC}"
echo -e "${BLUE}========================================${NC}"

# Diretórios a validar
DIRS=(
  "src"
  "supabase"
)

# Padrões que indicam uso de tabelas (sem prefixo)
# Irá procurar por: .from('tabela'), .from("tabela"), table: 'tabela'
PATTERN_FROM="\.from\(['\"]([a-z_]+)['\"]\)"
PATTERN_TABLE="table:\s*['\"]([a-z_]+)['\"]"

ERRORS_FOUND=0
TOTAL_FILES=0
TOTAL_ISSUES=0

echo -e "\n${YELLOW}Procurando queries sem prefixo lifetracker_...${NC}\n"

for dir in "${DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo -e "${YELLOW}⚠️  Diretório não encontrado: $dir${NC}"
    continue
  fi

  # Encontrar todos arquivos TypeScript/JavaScript
  while IFS= read -r file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))

    # Verificar padrão .from('tabela')
    if grep -n "\.from(['\"]" "$file" | grep -v "lifetracker_" > /tmp/issues.tmp 2>/dev/null; then
      while IFS= read -r line; do
        # Extrair apenas linhas que não têm lifetracker_
        if ! echo "$line" | grep -q "lifetracker_"; then
          echo -e "${RED}✗ $file${NC}"
          echo -e "  ${RED}Linha: $line${NC}"
          TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
          ERRORS_FOUND=1
        fi
      done < /tmp/issues.tmp
    fi

    # Verificar padrão table: 'tabela'
    if grep -n "table:\s*['\"]" "$file" | grep -v "lifetracker_" > /tmp/issues.tmp 2>/dev/null; then
      while IFS= read -r line; do
        if ! echo "$line" | grep -q "lifetracker_"; then
          echo -e "${RED}✗ $file${NC}"
          echo -e "  ${RED}Linha: $line${NC}"
          TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
          ERRORS_FOUND=1
        fi
      done < /tmp/issues.tmp
    fi
  done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null || true)
done

# Limpeza
rm -f /tmp/issues.tmp

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Relatório de Validação${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total de arquivos verificados: ${YELLOW}$TOTAL_FILES${NC}"
echo -e "Total de issues encontradas: ${YELLOW}$TOTAL_ISSUES${NC}"

if [ $ERRORS_FOUND -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ SUCESSO: Todas as queries usam prefixo lifetracker_${NC}"
  echo ""
  exit 0
else
  echo ""
  echo -e "${RED}✗ ERRO: Encontradas queries sem prefixo lifetracker_${NC}"
  echo -e "${RED}Atualize as queries acima para usar o prefixo correto${NC}"
  echo ""
  exit 1
fi
