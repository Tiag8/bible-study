#!/bin/bash

# Script: regenerate-supabase-types.sh
# Propósito: Regenerar types TypeScript do Supabase automaticamente
# Atualiza: src/integrations/supabase/types.ts com schema atual
# Exit code: 0 = sucesso, 1 = erro

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Regenerando Types Supabase${NC}"
echo -e "${BLUE}========================================${NC}"

# Verificar variáveis de ambiente
PROJECT_ID="${SUPABASE_PROJECT_ID:-fjddlffnlbrhgogkyplq}"
OUTPUT_FILE="src/integrations/supabase/types.ts"

echo -e "\n${CYAN}Configuração:${NC}"
echo -e "  Project ID: ${YELLOW}$PROJECT_ID${NC}"
echo -e "  Output: ${YELLOW}$OUTPUT_FILE${NC}"

# Verificar se Supabase CLI está instalado
echo -e "\n${CYAN}Verificando Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
  echo -e "${RED}✗ ERRO: Supabase CLI não está instalado${NC}"
  echo -e "${YELLOW}Instale com: npm install -g supabase${NC}"
  echo -e "${YELLOW}Ou use: npx supabase gen types typescript --project-id $PROJECT_ID${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Supabase CLI encontrado${NC}"

# Gerar types
echo -e "\n${CYAN}Regenerando types...${NC}"
if supabase gen types typescript --project-id "$PROJECT_ID" > "$OUTPUT_FILE" 2>/dev/null; then
  FILE_SIZE=$(wc -c < "$OUTPUT_FILE")
  echo -e "${GREEN}✓ Types regenerados com sucesso${NC}"
  echo -e "  Tamanho: ${YELLOW}$FILE_SIZE bytes${NC}"

  # Validar se arquivo foi criado corretamente
  if grep -q "export type\|export interface" "$OUTPUT_FILE"; then
    echo -e "${GREEN}✓ Arquivo contém tipos válidos${NC}"

    # Verificar se contém tabelas lifetracker
    if grep -q "lifetracker_" "$OUTPUT_FILE"; then
      echo -e "${GREEN}✓ Tabelas lifetracker_ encontradas no arquivo${NC}"
    else
      echo -e "${YELLOW}⚠️  AVISO: Nenhuma tabela lifetracker_ encontrada${NC}"
      echo -e "${YELLOW}Verifique se as migrations foram aplicadas no Supabase${NC}"
    fi

    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Relatório Final${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}✓ SUCESSO: Types Supabase regenerados${NC}"
    echo -e "  Arquivo: ${YELLOW}$OUTPUT_FILE${NC}"
    echo ""
    exit 0
  else
    echo -e "${RED}✗ ERRO: Arquivo gerado está vazio ou inválido${NC}"
    exit 1
  fi
else
  echo -e "${RED}✗ ERRO: Falha ao regenerar types${NC}"
  echo -e "${YELLOW}Tente usar: npx supabase gen types typescript --project-id $PROJECT_ID${NC}"
  exit 1
fi
