#!/bin/bash

# db-dependency-checker.sh - Verifica dependências de tabelas no banco de dados
# Uso: ./scripts/db-dependency-checker.sh table_name

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Validar argumentos
if [ -z "$1" ]; then
  echo -e "${RED}❌ Erro: Nome da tabela não fornecido${NC}"
  echo ""
  echo "Uso: ./scripts/db-dependency-checker.sh table_name"
  echo ""
  echo "Exemplo:"
  echo "  ./scripts/db-dependency-checker.sh lifetracker_habits"
  exit 1
fi

TABLE_NAME="$1"

echo -e "${BLUE}🗄️  Database Dependency Checker${NC}"
echo -e "${BLUE}Tabela: ${TABLE_NAME}${NC}"
echo ""

# ==============================================================================
# 1. TRIGGERS
# ==============================================================================

echo -e "${YELLOW}🔧 TRIGGERS que usam esta tabela:${NC}"

# Buscar em migrations
TRIGGER_RESULTS=$(grep -r "$TABLE_NAME" supabase/migrations/*.sql 2>/dev/null | grep -iE "trigger|on ${TABLE_NAME}" || echo "")

if [ -n "$TRIGGER_RESULTS" ]; then
  echo "$TRIGGER_RESULTS" | head -10
  TRIGGER_COUNT=$(echo "$TRIGGER_RESULTS" | wc -l | xargs)
  echo -e "${GREEN}   Total: ${TRIGGER_COUNT} referências${NC}"
else
  echo -e "${GREEN}   ✅ Nenhum trigger encontrado${NC}"
fi

echo ""

# ==============================================================================
# 2. VIEWS
# ==============================================================================

echo -e "${YELLOW}👁️  VIEWS que referenciam esta tabela:${NC}"

# Buscar views em migrations
VIEW_RESULTS=$(grep -r "$TABLE_NAME" supabase/migrations/*.sql 2>/dev/null | grep -iE "view|from ${TABLE_NAME}|join ${TABLE_NAME}" || echo "")

if [ -n "$VIEW_RESULTS" ]; then
  echo "$VIEW_RESULTS" | head -10
  VIEW_COUNT=$(echo "$VIEW_RESULTS" | wc -l | xargs)
  echo -e "${GREEN}   Total: ${VIEW_COUNT} referências${NC}"
else
  echo -e "${GREEN}   ✅ Nenhuma view encontrada${NC}"
fi

echo ""

# ==============================================================================
# 3. FOREIGN KEYS
# ==============================================================================

echo -e "${YELLOW}🔗 FOREIGN KEYS que apontam para esta tabela:${NC}"

# Buscar FKs em migrations
FK_RESULTS=$(grep -r "$TABLE_NAME" supabase/migrations/*.sql 2>/dev/null | grep -iE "references ${TABLE_NAME}|foreign key.*${TABLE_NAME}" || echo "")

if [ -n "$FK_RESULTS" ]; then
  echo "$FK_RESULTS" | head -10
  FK_COUNT=$(echo "$FK_RESULTS" | wc -l | xargs)
  echo -e "${GREEN}   Total: ${FK_COUNT} foreign keys${NC}"
else
  echo -e "${GREEN}   ✅ Nenhuma foreign key encontrada${NC}"
fi

echo ""

# ==============================================================================
# 4. EDGE FUNCTIONS QUERIES
# ==============================================================================

echo -e "${YELLOW}⚡ EDGE FUNCTIONS que consultam esta tabela:${NC}"

# Buscar queries em Edge Functions
QUERY_RESULTS=$(grep -r "$TABLE_NAME" supabase/functions/ 2>/dev/null | grep -iE "select|insert|update|delete|from" || echo "")

if [ -n "$QUERY_RESULTS" ]; then
  echo "$QUERY_RESULTS" | head -10
  QUERY_COUNT=$(echo "$QUERY_RESULTS" | wc -l | xargs)
  echo -e "${GREEN}   Total: ${QUERY_COUNT} queries${NC}"
else
  echo -e "${GREEN}   ✅ Nenhuma query encontrada${NC}"
fi

echo ""

# ==============================================================================
# 5. RLS POLICIES
# ==============================================================================

echo -e "${YELLOW}🔒 RLS POLICIES:${NC}"

# Buscar policies em migrations
POLICY_RESULTS=$(grep -r "$TABLE_NAME" supabase/migrations/*.sql 2>/dev/null | grep -iE "policy|grant|rls" || echo "")

if [ -n "$POLICY_RESULTS" ]; then
  echo "$POLICY_RESULTS" | head -10
  POLICY_COUNT=$(echo "$POLICY_RESULTS" | wc -l | xargs)
  echo -e "${GREEN}   Total: ${POLICY_COUNT} políticas${NC}"
else
  echo -e "${YELLOW}   ⚠️  Nenhuma policy encontrada (RLS pode não estar habilitado)${NC}"
fi

echo ""

# ==============================================================================
# RESUMO
# ==============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESUMO DE DEPENDÊNCIAS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TOTAL_DEPS=0

if [ -n "$TRIGGER_RESULTS" ]; then
  TRIGGER_COUNT=$(echo "$TRIGGER_RESULTS" | wc -l | xargs)
  echo -e "${YELLOW}Triggers: ${TRIGGER_COUNT}${NC}"
  TOTAL_DEPS=$((TOTAL_DEPS + TRIGGER_COUNT))
fi

if [ -n "$VIEW_RESULTS" ]; then
  VIEW_COUNT=$(echo "$VIEW_RESULTS" | wc -l | xargs)
  echo -e "${YELLOW}Views: ${VIEW_COUNT}${NC}"
  TOTAL_DEPS=$((TOTAL_DEPS + VIEW_COUNT))
fi

if [ -n "$FK_RESULTS" ]; then
  FK_COUNT=$(echo "$FK_RESULTS" | wc -l | xargs)
  echo -e "${YELLOW}Foreign Keys: ${FK_COUNT}${NC}"
  TOTAL_DEPS=$((TOTAL_DEPS + FK_COUNT))
fi

if [ -n "$QUERY_RESULTS" ]; then
  QUERY_COUNT=$(echo "$QUERY_RESULTS" | wc -l | xargs)
  echo -e "${YELLOW}Edge Function Queries: ${QUERY_COUNT}${NC}"
  TOTAL_DEPS=$((TOTAL_DEPS + QUERY_COUNT))
fi

if [ -n "$POLICY_RESULTS" ]; then
  POLICY_COUNT=$(echo "$POLICY_RESULTS" | wc -l | xargs)
  echo -e "${YELLOW}RLS Policies: ${POLICY_COUNT}${NC}"
  TOTAL_DEPS=$((TOTAL_DEPS + POLICY_COUNT))
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Total de dependências: ${TOTAL_DEPS}${NC}"

if [ "$TOTAL_DEPS" -gt 10 ]; then
  echo -e "${RED}⚠️  ALERTA: Muitas dependências (${TOTAL_DEPS})${NC}"
  echo -e "${YELLOW}   Cuidado ao modificar esta tabela!${NC}"
elif [ "$TOTAL_DEPS" -gt 5 ]; then
  echo -e "${YELLOW}⚠️  ATENÇÃO: ${TOTAL_DEPS} dependências encontradas${NC}"
  echo -e "${YELLOW}   Revisar impactos antes de modificar${NC}"
else
  echo -e "${GREEN}✅ Dependências dentro do esperado${NC}"
fi

echo ""

# ==============================================================================
# RECOMENDAÇÕES
# ==============================================================================

echo -e "${BLUE}💡 Recomendações:${NC}"

if [ -n "$FK_RESULTS" ]; then
  echo -e "   ${YELLOW}- Antes de deletar colunas, validar FKs${NC}"
fi

if [ -n "$VIEW_RESULTS" ]; then
  echo -e "   ${YELLOW}- Antes de renomear colunas, atualizar views${NC}"
fi

if [ -n "$TRIGGER_RESULTS" ]; then
  echo -e "   ${YELLOW}- Antes de modificar schema, validar triggers${NC}"
fi

if [ -z "$POLICY_RESULTS" ]; then
  echo -e "   ${RED}- ⚠️  Considere habilitar RLS nesta tabela${NC}"
fi

if [ "$TOTAL_DEPS" -gt 5 ]; then
  echo -e "   ${YELLOW}- Executar impact-mapper.sh para análise completa${NC}"
  echo -e "     ${BLUE}./scripts/impact-mapper.sh \"${TABLE_NAME}\" \"descrição da mudança\"${NC}"
fi

echo ""
