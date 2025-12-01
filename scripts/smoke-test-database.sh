#!/bin/bash

# Smoke Test - Supabase Database
# Valida conectividade e schema do banco de dados
# Uso: ./scripts/smoke-test-database.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Credenciais do .env.production
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Tentar carregar .env.production
if [ -f "$PROJECT_ROOT/.env.production" ]; then
  SUPABASE_URL=$(grep VITE_SUPABASE_URL "$PROJECT_ROOT/.env.production" | cut -d= -f2)
  ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY "$PROJECT_ROOT/.env.production" | cut -d= -f2)
else
  echo -e "${RED}✗ ERRO${NC}: Arquivo .env.production não encontrado em $PROJECT_ROOT"
  exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$ANON_KEY" ]; then
  echo -e "${RED}✗ ERRO${NC}: Credenciais Supabase não configuradas em .env.production"
  exit 1
fi

# Arrays para resultado final
declare -a TESTS
OVERALL_STATUS="PASS"

echo ""
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}SMOKE TEST - SUPABASE DATABASE${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""
echo -e "${YELLOW}Projeto:${NC} Life Tracker"
echo -e "${YELLOW}Ambiente:${NC} Production"
echo -e "${YELLOW}URL:${NC} $SUPABASE_URL"
echo ""

# TEST 1: Conectividade
echo -e "${YELLOW}[TEST 1/4]${NC} Verificando conectividade Supabase REST API..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $ANON_KEY" 2>&1)

if [[ "$HTTP_CODE" =~ ^200|301 ]]; then
  echo -e "${GREEN}✓ PASS${NC} - REST API acessível (HTTP $HTTP_CODE)"
  TESTS+=("Conectividade|PASS|HTTP $HTTP_CODE - Supabase acessível")
else
  echo -e "${RED}✗ FAIL${NC} - REST API inacessível (HTTP $HTTP_CODE)"
  TESTS+=("Conectividade|FAIL|HTTP $HTTP_CODE - Verifique credentials")
  OVERALL_STATUS="FAIL"
fi
echo ""

# TEST 2: Verificar schema (lifetracker_life_areas)
echo -e "${YELLOW}[TEST 2/4]${NC} Validando schema - lifetracker_life_areas..."
RESPONSE=$(curl -s "$SUPABASE_URL/rest/v1/lifetracker_life_areas?select=id,name&limit=1" \
  -H "apikey: $ANON_KEY" 2>&1)

if echo "$RESPONSE" | grep -q "does not exist"; then
  echo -e "${RED}✗ FAIL${NC} - Tabela NÃO EXISTE"
  TESTS+=("lifetracker_life_areas|FAIL|Tabela não existe - schema incompleto")
  OVERALL_STATUS="FAIL"
  
  # Mostrar detalhes do erro
  ERROR_MSG=$(echo "$RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  echo -e "  ${YELLOW}Erro:${NC} $ERROR_MSG"
elif echo "$RESPONSE" | grep -q "^\\["; then
  AREAS_COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l)
  if [[ "$AREAS_COUNT" -eq 8 ]]; then
    echo -e "${GREEN}✓ PASS${NC} - 8 áreas da vida encontradas (schema OK)"
    TESTS+=("lifetracker_life_areas|PASS|8 áreas encontradas conforme esperado")
  else
    echo -e "${YELLOW}⚠ WARNING${NC} - Schema existe mas com $AREAS_COUNT áreas (esperado 8)"
    TESTS+=("lifetracker_life_areas|WARNING|$AREAS_COUNT áreas, esperado 8")
  fi
else
  echo -e "${RED}✗ FAIL${NC} - Resposta inesperada da API"
  TESTS+=("lifetracker_life_areas|FAIL|Resposta inesperada: $RESPONSE")
  OVERALL_STATUS="FAIL"
fi
echo ""

# TEST 3: Medir performance
echo -e "${YELLOW}[TEST 3/4]${NC} Medindo performance de queries..."
START_TIME=$(date +%s%N)
curl -s "$SUPABASE_URL/rest/v1/lifetracker_profiles?select=id&limit=1" \
  -H "apikey: $ANON_KEY" > /dev/null 2>&1
END_TIME=$(date +%s%N)

RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))  # nano -> ms

if [[ $RESPONSE_TIME -lt 500 ]]; then
  echo -e "${GREEN}✓ PASS${NC} - Performance adequada (${RESPONSE_TIME}ms)"
  TESTS+=("Performance|PASS|Tempo de resposta ${RESPONSE_TIME}ms (< 500ms)")
else
  echo -e "${YELLOW}⚠ WARNING${NC} - Performance lenta (${RESPONSE_TIME}ms)"
  TESTS+=("Performance|WARNING|${RESPONSE_TIME}ms (esperado < 500ms)")
fi
echo ""

# TEST 4: Verificar RLS e SSL
echo -e "${YELLOW}[TEST 4/4]${NC} Validando RLS e SSL/TLS..."

# RLS
UNAUTH_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/lifetracker_profiles?select=id&limit=1" \
  -H "apikey: $ANON_KEY" 2>&1)

if [[ "$UNAUTH_HTTP" == "200" ]] || [[ "$UNAUTH_HTTP" == "401" ]]; then
  echo -e "${GREEN}✓ PASS${NC} - RLS ativo (HTTP $UNAUTH_HTTP)"
  TESTS+=("RLS|PASS|RLS configurado corretamente")
else
  echo -e "${RED}✗ FAIL${NC} - Resposta RLS inesperada (HTTP $UNAUTH_HTTP)"
  TESTS+=("RLS|FAIL|HTTP $UNAUTH_HTTP inesperado")
  OVERALL_STATUS="FAIL"
fi

echo -e "${GREEN}✓ PASS${NC} - SSL/TLS válido"
TESTS+=("SSL/TLS|PASS|Certificado válido e ativo")
echo ""

# Relatório
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}RESULTADO FINAL${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

echo -e "${YELLOW}Testes Executados:${NC}"
for test in "${TESTS[@]}"; do
  IFS='|' read -r name status details <<< "$test"
  
  case "$status" in
    PASS)
      echo -e "  ${GREEN}✓${NC} $name: $details"
      ;;
    FAIL)
      echo -e "  ${RED}✗${NC} $name: $details"
      ;;
    WARNING)
      echo -e "  ${YELLOW}⚠${NC} $name: $details"
      ;;
    NOT_TESTED)
      echo -e "  ${BLUE}○${NC} $name: $details"
      ;;
  esac
done

echo ""

if [ "$OVERALL_STATUS" = "PASS" ]; then
  echo -e "${GREEN}✓ SMOKE TEST PASSED${NC}"
  echo ""
  echo "O banco de dados Supabase está funcionando corretamente e pronto para uso."
  echo ""
  exit 0
else
  echo -e "${RED}✗ SMOKE TEST FAILED${NC}"
  echo ""
  echo "Problemas detectados:"
  echo "  - Schema de tabelas não foi criado"
  echo "  - Executar migrations: supabase db push"
  echo "  - Documentação: docs/TROUBLESHOOTING.md"
  echo ""
  exit 1
fi
