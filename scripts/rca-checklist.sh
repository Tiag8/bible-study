#!/bin/bash

# RCA Automated Checklist
# Executa greps automatizados para encontrar code patterns perigosos
# Baseado em .claude/commands/rca.md v2.0
# Data: 2025-11-07

set -e

# Cores para output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretórios a verificar
CODE_DIRS="src supabase/functions"
SCHEMA_DIRS="supabase/migrations"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  RCA AUTOMATED CHECKLIST v2.0  ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# =====================================================
# FASE 1: Code Patterns Perigosos
# =====================================================

echo -e "${YELLOW}📋 FASE 1: Code Patterns Perigosos${NC}"
echo ""

# A. Operações DB/API sem error handling
echo -e "${BLUE}A. Operações Críticas Sem Validação${NC}"

echo -n "  - .insert() sem validar error: "
INSERT_COUNT=$(grep -r "\.insert(" $CODE_DIRS 2>/dev/null | grep -v "error" | grep -v "insertError" | wc -l | tr -d ' ')
if [ "$INSERT_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ $INSERT_COUNT ocorrências${NC}"
  grep -rn "\.insert(" $CODE_DIRS 2>/dev/null | grep -v "error" | grep -v "insertError" | head -3
else
  echo -e "${GREEN}✅ OK${NC}"
fi

echo -n "  - .update() sem validar error: "
UPDATE_COUNT=$(grep -r "\.update(" $CODE_DIRS 2>/dev/null | grep -v "error" | grep -v "updateError" | wc -l | tr -d ' ')
if [ "$UPDATE_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ $UPDATE_COUNT ocorrências${NC}"
  grep -rn "\.update(" $CODE_DIRS 2>/dev/null | grep -v "error" | grep -v "updateError" | head -3
else
  echo -e "${GREEN}✅ OK${NC}"
fi

echo -n "  - .delete() sem validar error: "
DELETE_COUNT=$(grep -r "\.delete(" $CODE_DIRS 2>/dev/null | grep -v "error" | grep -v "deleteError" | wc -l | tr -d ' ')
if [ "$DELETE_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ $DELETE_COUNT ocorrências${NC}"
  grep -rn "\.delete(" $CODE_DIRS 2>/dev/null | grep -v "error" | grep -v "deleteError" | head -3
else
  echo -e "${GREEN}✅ OK${NC}"
fi

echo -n "  - await fetch() sem try-catch: "
FETCH_COUNT=$(grep -r "await fetch(" $CODE_DIRS 2>/dev/null | grep -v "try\|catch" | wc -l | tr -d ' ')
if [ "$FETCH_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ $FETCH_COUNT ocorrências${NC}"
  grep -rn "await fetch(" $CODE_DIRS 2>/dev/null | grep -v "try\|catch" | head -3
else
  echo -e "${GREEN}✅ OK${NC}"
fi

echo ""

# B. Spread operator perigoso
echo -e "${BLUE}B. Spread Operator Sobrescrevendo Dados${NC}"

echo -n "  - Spreads em data/fields/state: "
SPREAD_COUNT=$(grep -r "\.\.\." $CODE_DIRS 2>/dev/null | grep -E "data|fields|state|props" | wc -l | tr -d ' ')
if [ "$SPREAD_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $SPREAD_COUNT ocorrências (revisar)${NC}"
  echo "    (Verificar se usa merge explícito)"
else
  echo -e "${GREEN}✅ OK${NC}"
fi

echo ""

# C. Fallbacks perigosos
echo -e "${BLUE}C. Fallbacks Perigosos (|| {}, || [])${NC}"

echo -n "  - Fallback || {}: "
EMPTY_OBJ_COUNT=$(grep -r "|| {}" $CODE_DIRS 2>/dev/null | wc -l | tr -d ' ')
if [ "$EMPTY_OBJ_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $EMPTY_OBJ_COUNT ocorrências (revisar)${NC}"
  grep -rn "|| {}" $CODE_DIRS 2>/dev/null | head -3
else
  echo -e "${GREEN}✅ OK${NC}"
fi

echo -n "  - Fallback || []: "
EMPTY_ARR_COUNT=$(grep -r "|| \[\]" $CODE_DIRS 2>/dev/null | wc -l | tr -d ' ')
if [ "$EMPTY_ARR_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $EMPTY_ARR_COUNT ocorrências (revisar)${NC}"
  grep -rn "|| \[\]" $CODE_DIRS 2>/dev/null | head -3
else
  echo -e "${GREEN}✅ OK${NC}"
fi

echo ""

# D. Queries sem proteção
echo -e "${BLUE}D. Queries Database Sem Proteção${NC}"

echo -n "  - .single() sem .limit(): "
SINGLE_COUNT=$(grep -r "\.single()" $CODE_DIRS 2>/dev/null | wc -l | tr -d ' ')
if [ "$SINGLE_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $SINGLE_COUNT ocorrências (verificar se tem limit/order)${NC}"
  grep -rn "\.single()" $CODE_DIRS 2>/dev/null | head -3
else
  echo -e "${GREEN}✅ OK${NC}"
fi

echo ""

# =====================================================
# FASE 2: Database Integrity
# =====================================================

echo -e "${YELLOW}📋 FASE 2: Database Integrity${NC}"
echo ""

# A. NOT NULL constraints
echo -e "${BLUE}A. NOT NULL Constraints${NC}"

echo -n "  - Colunas NOT NULL no schema: "
if [ -d "$SCHEMA_DIRS" ]; then
  NOT_NULL_COUNT=$(grep -r "NOT NULL" $SCHEMA_DIRS 2>/dev/null | wc -l | tr -d ' ')
  echo -e "${BLUE}$NOT_NULL_COUNT encontradas${NC}"
  echo "    (Verificar se código valida ANTES de INSERT)"
else
  echo -e "${YELLOW}⚠️  Schema dir não encontrado${NC}"
fi

echo ""

# B. Foreign Keys
echo -e "${BLUE}B. Foreign Keys${NC}"

echo -n "  - Foreign keys no schema: "
if [ -d "$SCHEMA_DIRS" ]; then
  FK_COUNT=$(grep -rE "FOREIGN KEY|REFERENCES" $SCHEMA_DIRS 2>/dev/null | wc -l | tr -d ' ')
  echo -e "${BLUE}$FK_COUNT encontradas${NC}"
  echo "    (Verificar se código valida ANTES de INSERT)"
else
  echo -e "${YELLOW}⚠️  Schema dir não encontrado${NC}"
fi

echo ""

# C. ENUMs
echo -e "${BLUE}C. ENUMs e Constraints${NC}"

echo -n "  - ENUMs no schema: "
if [ -d "$SCHEMA_DIRS" ]; then
  ENUM_COUNT=$(grep -rE "CREATE TYPE.*AS ENUM|CHECK.*IN" $SCHEMA_DIRS 2>/dev/null | wc -l | tr -d ' ')
  echo -e "${BLUE}$ENUM_COUNT encontrados${NC}"
  echo "    (Verificar se código valida valores ANTES de INSERT)"
else
  echo -e "${YELLOW}⚠️  Schema dir não encontrado${NC}"
fi

echo ""

# D. Tabelas órfãs (básico - apenas detecta se existem)
echo -e "${BLUE}D. Tabelas Órfãs (Detecção Básica)${NC}"

if [ -d "$SCHEMA_DIRS" ]; then
  echo "  - Executar manualmente:"
  echo "    for table in \$(grep -o 'CREATE TABLE [a-z_]*' $SCHEMA_DIRS/*.sql | awk '{print \$3}'); do"
  echo "      grep -r \"from('\$table')\" $CODE_DIRS || echo \"❌ \$table NÃO USADA\""
  echo "    done"
else
  echo -e "${YELLOW}⚠️  Schema dir não encontrado${NC}"
fi

echo ""

# =====================================================
# FASE 3: Concurrency & Race Conditions
# =====================================================

echo -e "${YELLOW}📋 FASE 3: Concurrency & Race Conditions${NC}"
echo ""

# A. Concurrent updates
echo -e "${BLUE}A. Concurrent Updates (Verificar Optimistic Locking)${NC}"

echo -n "  - .update() total: "
UPDATE_TOTAL=$(grep -r "\.update(" $CODE_DIRS 2>/dev/null | wc -l | tr -d ' ')
echo -e "${BLUE}$UPDATE_TOTAL encontrados${NC}"

echo -n "  - .update() com updated_at check (optimistic lock): "
OPTIMISTIC_COUNT=$(grep -r "\.update(" $CODE_DIRS 2>/dev/null | grep "updated_at" | wc -l | tr -d ' ')
if [ "$OPTIMISTIC_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ $OPTIMISTIC_COUNT com lock${NC}"
else
  echo -e "${RED}❌ Nenhum com optimistic locking${NC}"
fi

echo ""

# B. Duplicate detection
echo -e "${BLUE}B. Duplicate Detection (Verificar UNIQUE Constraints)${NC}"

echo -n "  - UNIQUE constraints no schema: "
if [ -d "$SCHEMA_DIRS" ]; then
  UNIQUE_COUNT=$(grep -rE "UNIQUE|PRIMARY KEY" $SCHEMA_DIRS 2>/dev/null | wc -l | tr -d ' ')
  echo -e "${BLUE}$UNIQUE_COUNT encontrados${NC}"
  echo "    (Verificar se previnem duplicatas em INSERTs simultâneos)"
else
  echo -e "${YELLOW}⚠️  Schema dir não encontrado${NC}"
fi

echo ""

# =====================================================
# FASE 4: State Machines & Flow Logic
# =====================================================

echo -e "${YELLOW}📋 FASE 4: State Machines & Flow Logic${NC}"
echo ""

echo -n "  - Gerenciamento de estado (state=, setState, status=): "
STATE_COUNT=$(grep -rE "state.*=|setState|status.*=" $CODE_DIRS 2>/dev/null | wc -l | tr -d ' ')
if [ "$STATE_COUNT" -gt 0 ]; then
  echo -e "${BLUE}$STATE_COUNT ocorrências${NC}"
  echo "    (Verificar se transitions são válidas e edge cases cobertos)"
else
  echo -e "${GREEN}✅ Nenhum gerenciamento de estado encontrado${NC}"
fi

echo ""

# =====================================================
# RESUMO
# =====================================================

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  RESUMO CHECKLIST${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

TOTAL_ISSUES=0

if [ "$INSERT_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ $INSERT_COUNT .insert() sem validar error${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + INSERT_COUNT))
fi

if [ "$UPDATE_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ $UPDATE_COUNT .update() sem validar error${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + UPDATE_COUNT))
fi

if [ "$DELETE_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ $DELETE_COUNT .delete() sem validar error${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + DELETE_COUNT))
fi

if [ "$FETCH_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ $FETCH_COUNT await fetch() sem try-catch${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + FETCH_COUNT))
fi

if [ "$EMPTY_OBJ_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $EMPTY_OBJ_COUNT fallbacks perigosos (|| {})${NC}"
fi

if [ "$SINGLE_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $SINGLE_COUNT .single() sem proteção${NC}"
fi

echo ""

if [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo -e "${GREEN}✅ Nenhum problema crítico encontrado!${NC}"
else
  echo -e "${RED}⚠️  $TOTAL_ISSUES problemas CRÍTICOS encontrados${NC}"
  echo -e "${YELLOW}    Revisar manualmente os itens acima${NC}"
fi

echo ""
echo -e "${BLUE}💡 Para análise completa, consulte: .claude/commands/rca.md${NC}"
echo ""
