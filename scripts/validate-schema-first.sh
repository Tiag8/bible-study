#!/bin/bash

# Script: validate-schema-first.sh
# Propósito: Validar que código está sincronizado com schema DB real
# Causa Raiz: Código antes DB (ML-2, previne 60% bugs)
# Exit code: 1 = mismatches detectados, 0 = validação aprovada

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔍 SCHEMA-FIRST VALIDATION${NC}"
echo -e "${BLUE}========================================${NC}"

# Verificar se types.ts existe
TYPES_FILE="src/integrations/supabase/types.ts"
if [ ! -f "$TYPES_FILE" ]; then
  echo -e "${RED}✗ ERRO: $TYPES_FILE não encontrado${NC}"
  echo -e "${YELLOW}Execute: ./scripts/regenerate-supabase-types.sh${NC}"
  exit 1
fi

# === ETAPA 1: Regenerar types.ts ===
echo -e "\n${CYAN}ETAPA 1: Regenerando types.ts do schema real...${NC}"

if ./scripts/regenerate-supabase-types.sh > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Types regenerados com sucesso${NC}"
else
  echo -e "${RED}✗ ERRO: Falha ao regenerar types${NC}"
  echo -e "${YELLOW}Execute manualmente: ./scripts/regenerate-supabase-types.sh${NC}"
  exit 1
fi

# === ETAPA 2: Extrair tabelas do types.ts ===
echo -e "\n${CYAN}ETAPA 2: Extraindo tabelas disponíveis no schema real...${NC}"

# Extrair nomes de tabelas do types.ts (format: lifetracker_table_name)
DB_TABLES=$(grep -E '^\s+lifetracker_[a-z_]+:' "$TYPES_FILE" | sed 's/://g' | awk '{print $1}' | sort -u || true)

if [ -z "$DB_TABLES" ]; then
  echo -e "${RED}✗ ERRO: Nenhuma tabela lifetracker_* encontrada no schema${NC}"
  echo -e "${YELLOW}Verifique se as migrations foram aplicadas no Supabase${NC}"
  exit 1
fi

TOTAL_TABLES=$(echo "$DB_TABLES" | wc -l | xargs)
echo -e "${GREEN}✓ Encontradas $TOTAL_TABLES tabelas lifetracker_* no schema${NC}"

# === ETAPA 3: Analisar queries no código ===
echo -e "\n${CYAN}ETAPA 3: Analisando queries Supabase no código...${NC}"

# Diretórios para buscar
SEARCH_DIRS="src/"

# Extrair .from('tabela') e .table('tabela') de queries
CODE_TABLES=$(grep -r "\.from\(['\"]" $SEARCH_DIRS 2>/dev/null | \
  grep -o "\.from(['\"][a-z_]*['\"])" | \
  sed "s/\.from(['\"]//g" | sed "s/['\"])//g" | \
  grep "^lifetracker_" | sort -u || true)

# Também buscar por .table() (Supabase old API)
CODE_TABLES_ALT=$(grep -r "\.table\(['\"]" $SEARCH_DIRS 2>/dev/null | \
  grep -o "\.table(['\"][a-z_]*['\"])" | \
  sed "s/\.table(['\"]//g" | sed "s/['\"])//g" | \
  grep "^lifetracker_" | sort -u || true)

# Combinar ambas
CODE_TABLES=$(echo -e "$CODE_TABLES\n$CODE_TABLES_ALT" | sort -u | grep -v '^$' || true)

if [ -z "$CODE_TABLES" ]; then
  echo -e "${GREEN}✓ Nenhuma query Supabase encontrada no código${NC}"
  echo -e "${GREEN}✓ Validação aprovada (sem queries para validar)${NC}"
  exit 0
fi

TOTAL_QUERIES=$(echo "$CODE_TABLES" | wc -l | xargs)
echo -e "${GREEN}✓ Encontradas $TOTAL_QUERIES tabelas referenciadas no código${NC}"

# === ETAPA 4: Validar mismatches (tabelas) ===
echo -e "\n${CYAN}ETAPA 4: Validando tabelas (código vs schema)...${NC}"

declare -a MISMATCHES=()
MISMATCH_COUNT=0

while IFS= read -r TABLE; do
  # Verificar se tabela existe no schema
  if ! echo "$DB_TABLES" | grep -q "^${TABLE}$"; then
    MISMATCHES+=("TABLE|$TABLE|Tabela NÃO EXISTE no schema DB")
    MISMATCH_COUNT=$((MISMATCH_COUNT + 1))
  fi
done <<< "$CODE_TABLES"

# === ETAPA 5: Validar colunas (opcional - heurística) ===
echo -e "\n${CYAN}ETAPA 5: Validando colunas comuns (heurística)...${NC}"

# Buscar padrões .select('coluna') ou .eq('coluna', value)
COLUMN_PATTERNS=$(grep -rh "\\.select\\|.eq\\|.neq\\|.gt\\|.gte\\|.lt\\|.lte\\|.like\\|.ilike\\|.is\\|.in\\|.contains" $SEARCH_DIRS 2>/dev/null | \
  grep -o "['\"][a-z_][a-z0-9_]*['\"]" | \
  sed "s/['\"]//g" | \
  grep -v "^lifetracker_" | \
  sort -u | head -50 || true)

# Validar se colunas existem no types.ts (simplificado)
# Nota: Validação completa requer parsing TypeScript, esta é heurística básica
if [ -n "$COLUMN_PATTERNS" ]; then
  COLUMNS_CHECKED=0
  while IFS= read -r COLUMN; do
    # Verificar se coluna aparece no types.ts (heurística)
    if ! grep -q "\b${COLUMN}\b" "$TYPES_FILE" 2>/dev/null; then
      # Ignorar colunas comuns que podem ser variáveis (id, name, etc)
      if [[ ! "$COLUMN" =~ ^(id|name|user|data|value|type)$ ]]; then
        # Buscar arquivo onde coluna foi usada
        FILE_CONTEXT=$(grep -r "\b${COLUMN}\b" $SEARCH_DIRS 2>/dev/null | head -1 | cut -d: -f1 || echo "unknown")
        MISMATCHES+=("COLUMN|$COLUMN|Coluna possivelmente NÃO EXISTE (verificar $FILE_CONTEXT)")
        MISMATCH_COUNT=$((MISMATCH_COUNT + 1))
      fi
    fi
    COLUMNS_CHECKED=$((COLUMNS_CHECKED + 1))
  done <<< "$COLUMN_PATTERNS"

  echo -e "${GREEN}✓ Validadas $COLUMNS_CHECKED colunas (heurística)${NC}"
else
  echo -e "${CYAN}ℹ Nenhuma coluna para validar (heurística)${NC}"
fi

# === RESULTADO FINAL ===
echo -e "\n${CYAN}Resumo:${NC}"
echo -e "  Tabelas no schema: ${YELLOW}$TOTAL_TABLES${NC}"
echo -e "  Tabelas no código: ${YELLOW}$TOTAL_QUERIES${NC}"

if [ $MISMATCH_COUNT -eq 0 ]; then
  echo -e "  Mismatches: ${GREEN}0${NC}"
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ VALIDAÇÃO APROVADA${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${GREEN}✓ Código sincronizado com schema DB real${NC}"
  echo -e "${GREEN}✓ Source of Truth: Database${NC}"
  echo ""
  exit 0
fi

# Exibir mismatches
echo -e "  Mismatches: ${RED}$MISMATCH_COUNT${NC}"
echo ""
echo -e "${RED}❌ MISMATCH DETECTADO: Código não sincronizado com schema${NC}"
echo ""

# Tabela de mismatches
echo -e "${YELLOW}┌──────────────────────────────────────────────────────────────────────────────────┐${NC}"
printf "${YELLOW}│${NC} %-10s ${YELLOW}│${NC} %-30s ${YELLOW}│${NC} %-35s ${YELLOW}│${NC}\n" "Tipo" "Nome" "Problema"
echo -e "${YELLOW}├──────────────────────────────────────────────────────────────────────────────────┤${NC}"

for MISMATCH in "${MISMATCHES[@]}"; do
  IFS='|' read -r TYPE NAME PROBLEM <<< "$MISMATCH"

  # Truncar nomes longos
  NAME_DISPLAY="${NAME:0:28}"
  PROBLEM_DISPLAY="${PROBLEM:0:33}"

  [ "${#NAME}" -gt 28 ] && NAME_DISPLAY="${NAME_DISPLAY}..."
  [ "${#PROBLEM}" -gt 33 ] && PROBLEM_DISPLAY="${PROBLEM_DISPLAY}..."

  printf "${YELLOW}│${NC} %-10s ${YELLOW}│${NC} %-30s ${YELLOW}│${NC} %-35s ${YELLOW}│${NC}\n" \
    "$TYPE" "$NAME_DISPLAY" "$PROBLEM_DISPLAY"
done

echo -e "${YELLOW}└──────────────────────────────────────────────────────────────────────────────────┘${NC}"

# Instruções de correção
echo ""
echo -e "${CYAN}🔧 CORREÇÃO:${NC}"
echo ""
echo -e "${YELLOW}1. Consulte o schema real:${NC}"
echo -e "   cat $TYPES_FILE"
echo ""
echo -e "${YELLOW}2. Opções:${NC}"
echo -e "   a) Se tabela/coluna DEVE existir → Criar migration"
echo -e "   b) Se tabela/coluna NÃO existe → Corrigir código (usar nome correto)"
echo ""
echo -e "${YELLOW}3. Criar migration (se necessário):${NC}"
echo -e "   supabase migration new add_missing_table_or_column"
echo -e "   supabase db push"
echo -e "   ./scripts/regenerate-supabase-types.sh"
echo ""
echo -e "${YELLOW}4. Corrigir código (se tabela/coluna tem nome diferente):${NC}"
echo -e "   - Buscar referências: grep -r \"NOME_ERRADO\" src/"
echo -e "   - Substituir por nome correto do schema"
echo ""
echo -e "${RED}❌ BUILD BLOQUEADO ATÉ RESOLVER MISMATCHES${NC}"
echo ""
echo -e "${CYAN}💡 REGRA: Database é Source of Truth${NC}"
echo ""

exit 1
