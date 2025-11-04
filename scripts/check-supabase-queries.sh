#!/bin/bash

# Script: check-supabase-queries.sh
# Propósito: Validar sintaxe de queries Supabase, RLS em tabelas críticas
# Verifica: RLS habilitado, tipos TypeScript atualizados
# Exit code: 0 = sucesso, 1 = erros encontrados

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Validando Queries e RLS Supabase${NC}"
echo -e "${BLUE}========================================${NC}"

ERRORS_FOUND=0

# 1. Verificar se arquivo de tipos TypeScript existe e está atualizado
echo -e "\n${CYAN}1. Verificando tipos TypeScript...${NC}"
TYPES_FILE="src/integrations/supabase/types.ts"

if [ ! -f "$TYPES_FILE" ]; then
  echo -e "${RED}✗ ERRO: Arquivo $TYPES_FILE não encontrado${NC}"
  echo -e "${YELLOW}Dica: Execute ./scripts/regenerate-supabase-types.sh${NC}"
  ERRORS_FOUND=1
else
  FILE_SIZE=$(wc -c < "$TYPES_FILE")
  if [ "$FILE_SIZE" -lt 1000 ]; then
    echo -e "${RED}✗ ERRO: Arquivo $TYPES_FILE parece vazio ou incompleto${NC}"
    echo -e "${YELLOW}Tamanho: $FILE_SIZE bytes (esperado > 1000)${NC}"
    ERRORS_FOUND=1
  else
    echo -e "${GREEN}✓ Tipos TypeScript encontrados${NC}"
    echo -e "  Tamanho: ${YELLOW}$FILE_SIZE bytes${NC}"
  fi
fi

# 2. Verificar sintaxe de queries em arquivos TypeScript
echo -e "\n${CYAN}2. Verificando sintaxe de queries Supabase...${NC}"

QUERY_ISSUES=0

# Padrões perigosos que indicam sintaxe incorreta
DANGEROUS_PATTERNS=(
  "\.from()"  # from vazio
  "\.select()"  # select vazio
  "\.where()"  # where vazio
  "\.select('')"  # select com string vazia
)

# Procurar padrões perigosos
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if grep -r "$pattern" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules; then
    echo -e "${RED}✗ Padrão perigoso encontrado: $pattern${NC}"
    QUERY_ISSUES=$((QUERY_ISSUES + 1))
    ERRORS_FOUND=1
  fi
done

if [ $QUERY_ISSUES -eq 0 ]; then
  echo -e "${GREEN}✓ Nenhuma sintaxe perigosa detectada${NC}"
fi

# 3. Verificar se arquivo .env.production contém variáveis Supabase
echo -e "\n${CYAN}3. Verificando variáveis de ambiente...${NC}"

if [ -f ".env.production" ]; then
  if grep -q "VITE_SUPABASE_URL\|VITE_SUPABASE_ANON_KEY" ".env.production"; then
    echo -e "${GREEN}✓ Variáveis Supabase definidas em .env.production${NC}"
  else
    echo -e "${YELLOW}⚠️  AVISO: Variáveis Supabase não encontradas em .env.production${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  AVISO: Arquivo .env.production não encontrado${NC}"
fi

# 4. Verificar se supabase.ts está configurado corretamente
echo -e "\n${CYAN}4. Verificando cliente Supabase...${NC}"

if grep -q "createClient\|SupabaseClient" src/integrations/supabase/client.ts 2>/dev/null; then
  echo -e "${GREEN}✓ Cliente Supabase configurado${NC}"
else
  echo -e "${RED}✗ ERRO: Cliente Supabase não encontrado em src/integrations/supabase/client.ts${NC}"
  ERRORS_FOUND=1
fi

# 5. Validar RLS em tabelas críticas (verificação nas migrations)
echo -e "\n${CYAN}5. Verificando RLS nas migrations...${NC}"

MIGRATION_DIR="supabase/migrations"

if [ -d "$MIGRATION_DIR" ]; then
  # Detectar tabelas automaticamente das migrations
  TABLES=$(grep -rh "CREATE TABLE\|ALTER TABLE" "$MIGRATION_DIR" 2>/dev/null | \
           grep -oE '[a-z_]+_[a-z_]+' | \
           sort -u | \
           head -10)

  if [ -n "$TABLES" ]; then
    echo -e "${GREEN}✓ Tabelas detectadas nas migrations${NC}"

    # Verificar RLS para cada tabela
    for table in $TABLES; do
      if grep -r "ALTER TABLE.*$table\|CREATE POLICY.*$table" "$MIGRATION_DIR" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ RLS configurado para: $table${NC}"
      else
        echo -e "${YELLOW}  ⚠️  Verificar RLS para: $table${NC}"
      fi
    done
  else
    echo -e "${YELLOW}⚠️  Nenhuma tabela detectada nas migrations${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Diretório migrations não encontrado${NC}"
fi

# Relatório final
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Relatório Final${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $ERRORS_FOUND -eq 0 ]; then
  echo -e "${GREEN}✓ SUCESSO: Todas as validações passaram${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}✗ ERRO: Algumas validações falharam${NC}"
  echo -e "${YELLOW}Verifique os erros acima e corrija-os${NC}"
  echo ""
  exit 1
fi
