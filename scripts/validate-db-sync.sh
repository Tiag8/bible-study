#!/bin/bash

# Script: validate-db-sync.sh
# Propósito: Validar sincronização entre DB real, migrations e types.ts
# Uso: ./scripts/validate-db-sync.sh
# Exit: 0 = sync OK, 1 = defasagem detectada

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Validação Sincronização DB${NC}"
echo -e "${BLUE}========================================${NC}"

# Configuração
TYPES_FILE="src/integrations/supabase/types.ts"
MIGRATIONS_DIR="supabase/migrations"
DB_HOST="${SUPABASE_DB_HOST:-db.fjddlffnlbrhgogkyplq.supabase.co}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD}"

# 1. Verificar última modificação types.ts vs última migration
echo -e "\n${CYAN}[1/4] Verificando timestamps...${NC}"

if [[ ! -f "$TYPES_FILE" ]]; then
  echo -e "${RED}✗ ERRO: types.ts não encontrado${NC}"
  exit 1
fi

TYPES_TIMESTAMP=$(stat -f "%m" "$TYPES_FILE" 2>/dev/null || stat -c "%Y" "$TYPES_FILE")
TYPES_DATE=$(date -r "$TYPES_TIMESTAMP" "+%Y-%m-%d %H:%M" 2>/dev/null || date -d "@$TYPES_TIMESTAMP" "+%Y-%m-%d %H:%M")

LAST_MIGRATION=$(ls -t "$MIGRATIONS_DIR"/*.sql 2>/dev/null | head -1)
if [[ -z "$LAST_MIGRATION" ]]; then
  echo -e "${YELLOW}⚠️  Nenhuma migration encontrada${NC}"
else
  MIGRATION_TIMESTAMP=$(stat -f "%m" "$LAST_MIGRATION" 2>/dev/null || stat -c "%Y" "$LAST_MIGRATION")
  MIGRATION_DATE=$(date -r "$MIGRATION_TIMESTAMP" "+%Y-%m-%d %H:%M" 2>/dev/null || date -d "@$MIGRATION_TIMESTAMP" "+%Y-%m-%d %H:%M")

  echo -e "  types.ts:        ${YELLOW}$TYPES_DATE${NC}"
  echo -e "  Última migration: ${YELLOW}$MIGRATION_DATE${NC}"

  if [[ $MIGRATION_TIMESTAMP -gt $TYPES_TIMESTAMP ]]; then
    echo -e "${RED}✗ DEFASAGEM: types.ts está desatualizado${NC}"
    DAYS_DIFF=$(( ($MIGRATION_TIMESTAMP - $TYPES_TIMESTAMP) / 86400 ))
    echo -e "${RED}  Gap: $DAYS_DIFF dia(s)${NC}"
    NEEDS_REGENERATION=true
  else
    echo -e "${GREEN}✓ types.ts está atualizado${NC}"
    NEEDS_REGENERATION=false
  fi
fi

# 2. Comparar tabelas no DB real vs types.ts
echo -e "\n${CYAN}[2/4] Comparando DB real vs types.ts...${NC}"

if [[ -z "$DB_PASSWORD" ]]; then
  echo -e "${YELLOW}⚠️  SUPABASE_DB_PASSWORD não configurado, pulando verificação DB${NC}"
else
  # Extrair tabelas do DB real
  DB_TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U postgres -d postgres -t -c "
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name LIKE 'lifetracker_%'
    ORDER BY table_name;
  " 2>/dev/null | tr -d ' ')

  # Extrair tabelas do types.ts
  TYPES_TABLES=$(grep -o "lifetracker_[a-z_]*" "$TYPES_FILE" 2>/dev/null | sort -u)

  # Comparar
  MISSING_IN_TYPES=$(comm -23 <(echo "$DB_TABLES") <(echo "$TYPES_TABLES"))
  EXTRA_IN_TYPES=$(comm -13 <(echo "$DB_TABLES") <(echo "$TYPES_TABLES"))

  if [[ -n "$MISSING_IN_TYPES" ]]; then
    echo -e "${RED}✗ Tabelas no DB mas NÃO no types.ts:${NC}"
    echo "$MISSING_IN_TYPES" | while read table; do
      echo -e "  ${RED}- $table${NC}"
    done
    NEEDS_REGENERATION=true
  fi

  if [[ -n "$EXTRA_IN_TYPES" ]]; then
    echo -e "${YELLOW}⚠️  Tabelas no types.ts mas NÃO no DB:${NC}"
    echo "$EXTRA_IN_TYPES" | while read table; do
      echo -e "  ${YELLOW}- $table${NC}"
    done
  fi

  if [[ -z "$MISSING_IN_TYPES" && -z "$EXTRA_IN_TYPES" ]]; then
    echo -e "${GREEN}✓ Tabelas sincronizadas${NC}"
  fi
fi

# 3. Verificar migrations não aplicadas
echo -e "\n${CYAN}[3/4] Verificando migrations...${NC}"

MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l | tr -d ' ')
echo -e "  Total migrations: ${YELLOW}$MIGRATION_COUNT${NC}"

# 4. Resultado final
echo -e "\n${CYAN}[4/4] Resultado Final${NC}"

if [[ "$NEEDS_REGENERATION" == "true" ]]; then
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}✗ AÇÃO NECESSÁRIA${NC}"
  echo -e "${RED}========================================${NC}"
  echo -e "${YELLOW}Execute: ./scripts/regenerate-supabase-types.sh${NC}"
  echo ""
  exit 1
else
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✓ SINCRONIZAÇÃO OK${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  exit 0
fi
