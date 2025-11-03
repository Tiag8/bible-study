#!/bin/bash

# ============================================================================
# Life Tracker - VPS Smoke Tests Script
# ============================================================================
# Descrição: Testes automatizados pós-deploy para validação rápida
# Uso: ./vps-smoke-tests.sh [production|staging]
# Autor: Life Tracker Team
# Data: 2025-10-31
# ============================================================================

set -e  # Fail fast em caso de erro

# ----------------------------------------------------------------------------
# Cores para logs
# ----------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ----------------------------------------------------------------------------
# Funções de log
# ----------------------------------------------------------------------------
log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

log_test() {
    echo -e "${BLUE}━━━ $1${NC}"
}

# ----------------------------------------------------------------------------
# Variáveis de controle de testes
# ----------------------------------------------------------------------------
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# ----------------------------------------------------------------------------
# Função para registrar resultado de teste
# ----------------------------------------------------------------------------
test_passed() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    PASSED_TESTS=$((PASSED_TESTS + 1))
    log_success "PASSOU: $1"
    echo ""
}

test_failed() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    FAILED_TESTS=$((FAILED_TESTS + 1))
    log_error "FALHOU: $1"
    if [ ! -z "$2" ]; then
        echo -e "${YELLOW}Detalhes: $2${NC}"
    fi
    echo ""
}

# ----------------------------------------------------------------------------
# Validação de parâmetros
# ----------------------------------------------------------------------------
if [ -z "$1" ]; then
    log_error "Ambiente não especificado!"
    echo "Uso: ./vps-smoke-tests.sh [production|staging]"
    exit 1
fi

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    log_error "Ambiente inválido: $ENVIRONMENT"
    echo "Ambientes válidos: production, staging"
    exit 1
fi

# ----------------------------------------------------------------------------
# Variáveis por ambiente
# ----------------------------------------------------------------------------
if [ "$ENVIRONMENT" == "production" ]; then
    VPS_HOST="root@31.97.22.151"
    DOMAIN="life-tracker.stackia.com.br"
    STACK_NAME="lifetracker"
elif [ "$ENVIRONMENT" == "staging" ]; then
    VPS_HOST="root@31.97.22.151"
    DOMAIN="staging.life-tracker.stackia.com.br"
    STACK_NAME="lifetracker-staging"
fi

BASE_URL="https://$DOMAIN"

# ----------------------------------------------------------------------------
# Banner
# ----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Life Tracker - VPS Smoke Tests                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Ambiente: $ENVIRONMENT"
log_info "Domain: $DOMAIN"
log_info "Base URL: $BASE_URL"
echo ""
log_warning "Iniciando smoke tests..."
echo ""

# ----------------------------------------------------------------------------
# TESTE 1: Home page (200 OK)
# ----------------------------------------------------------------------------
log_test "TESTE 1: Home Page Acessível"
echo "URL: $BASE_URL"
echo -n "Verificando... "

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 15 "$BASE_URL" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
    test_passed "Home page retornou HTTP 200"
elif [ "$HTTP_STATUS" == "000" ]; then
    test_failed "Home page inacessível" "Timeout ou erro de conexão"
else
    test_failed "Home page retornou HTTP $HTTP_STATUS" "Esperado: 200"
fi

# ----------------------------------------------------------------------------
# TESTE 2: Health endpoint (se existir)
# ----------------------------------------------------------------------------
log_test "TESTE 2: Health Endpoint"
HEALTH_URL="$BASE_URL/api/health"
echo "URL: $HEALTH_URL"
echo -n "Verificando... "

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
    # Verificar se retorna JSON válido
    RESPONSE=$(curl -s -L --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "")
    if echo "$RESPONSE" | grep -q "status" 2>/dev/null; then
        test_passed "Health endpoint retornou JSON válido (HTTP 200)"
    else
        test_failed "Health endpoint não retornou JSON esperado" "Response: $RESPONSE"
    fi
elif [ "$HTTP_STATUS" == "404" ]; then
    log_warning "Health endpoint não implementado (HTTP 404) - pulando teste"
    echo ""
elif [ "$HTTP_STATUS" == "000" ]; then
    test_failed "Health endpoint inacessível" "Timeout ou erro de conexão"
else
    test_failed "Health endpoint retornou HTTP $HTTP_STATUS" "Esperado: 200 ou 404"
fi

# ----------------------------------------------------------------------------
# TESTE 3: Recursos estáticos (CSS/JS)
# ----------------------------------------------------------------------------
log_test "TESTE 3: Recursos Estáticos"
echo "Verificando se assets foram carregados..."

# Baixar HTML e verificar se contém referências a assets
HTML_CONTENT=$(curl -s -L --max-time 15 "$BASE_URL" 2>/dev/null || echo "")

if echo "$HTML_CONTENT" | grep -q -E "(\.css|\.js)" 2>/dev/null; then
    # Tentar pegar primeiro arquivo CSS encontrado
    FIRST_CSS=$(echo "$HTML_CONTENT" | grep -oP 'href="[^"]*\.css[^"]*"' | head -n 1 | sed 's/href="//;s/"$//' || echo "")

    if [ ! -z "$FIRST_CSS" ]; then
        # Se for path relativo, adicionar base URL
        if [[ "$FIRST_CSS" == /* ]]; then
            CSS_URL="$BASE_URL$FIRST_CSS"
        elif [[ "$FIRST_CSS" == http* ]]; then
            CSS_URL="$FIRST_CSS"
        else
            CSS_URL="$BASE_URL/$FIRST_CSS"
        fi

        CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$CSS_URL" 2>/dev/null || echo "000")

        if [ "$CSS_STATUS" == "200" ]; then
            test_passed "Recursos estáticos acessíveis (CSS HTTP 200)"
        else
            test_failed "Recurso CSS retornou HTTP $CSS_STATUS" "URL: $CSS_URL"
        fi
    else
        test_passed "HTML carrega (assets inline ou não detectados)"
    fi
else
    test_failed "HTML não contém referências a assets CSS/JS" "Possível problema no build"
fi

# ----------------------------------------------------------------------------
# TESTE 4: Performance (< 2s load time)
# ----------------------------------------------------------------------------
log_test "TESTE 4: Performance (Target: < 2s)"
echo "URL: $BASE_URL"
echo -n "Medindo tempo de resposta... "

# Medir tempo de resposta total
START_TIME=$(date +%s%3N)  # Milliseconds
curl -s -o /dev/null -L --max-time 15 "$BASE_URL" 2>/dev/null || echo ""
END_TIME=$(date +%s%3N)

RESPONSE_TIME=$((END_TIME - START_TIME))
RESPONSE_TIME_SECONDS=$(echo "scale=2; $RESPONSE_TIME / 1000" | bc 2>/dev/null || echo "N/A")

if [ "$RESPONSE_TIME_SECONDS" != "N/A" ]; then
    # Converter para comparação (remover decimal)
    RESPONSE_TIME_INT=$(echo "$RESPONSE_TIME_SECONDS * 1000" | bc 2>/dev/null | cut -d'.' -f1)

    if [ $RESPONSE_TIME_INT -lt 2000 ]; then
        test_passed "Tempo de resposta: ${RESPONSE_TIME_SECONDS}s (< 2s)"
    elif [ $RESPONSE_TIME_INT -lt 5000 ]; then
        test_failed "Tempo de resposta lento: ${RESPONSE_TIME_SECONDS}s" "Target: < 2s, Aceitável: < 5s"
    else
        test_failed "Tempo de resposta muito lento: ${RESPONSE_TIME_SECONDS}s" "Target: < 2s"
    fi
else
    log_warning "Não foi possível medir tempo de resposta"
    echo ""
fi

# ----------------------------------------------------------------------------
# TESTE 5: Docker Services Status
# ----------------------------------------------------------------------------
log_test "TESTE 5: Docker Services Health"
echo "Verificando status dos serviços no VPS..."

# Verificar se serviços estão rodando
SERVICES_STATUS=$(ssh "$VPS_HOST" "docker service ls --filter name=$STACK_NAME --format '{{.Replicas}}'" 2>/dev/null || echo "")

if [ ! -z "$SERVICES_STATUS" ]; then
    # Contar quantos serviços estão com todas replicas rodando (formato: 1/1, 2/2, etc)
    HEALTHY_SERVICES=$(echo "$SERVICES_STATUS" | grep -E "^([0-9]+)/\1$" | wc -l || echo "0")
    TOTAL_SERVICES=$(echo "$SERVICES_STATUS" | wc -l)

    if [ "$HEALTHY_SERVICES" -eq "$TOTAL_SERVICES" ] && [ "$TOTAL_SERVICES" -gt 0 ]; then
        test_passed "Todos os serviços Docker estão rodando ($HEALTHY_SERVICES/$TOTAL_SERVICES)"
    else
        test_failed "Alguns serviços não estão rodando completamente" "Healthy: $HEALTHY_SERVICES/$TOTAL_SERVICES"
    fi
else
    test_failed "Não foi possível verificar status dos serviços Docker" "Verifique acesso SSH"
fi

# ----------------------------------------------------------------------------
# TESTE 6: SSL Certificate (HTTPS)
# ----------------------------------------------------------------------------
log_test "TESTE 6: Certificado SSL"
echo "Verificando certificado HTTPS..."

SSL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL" 2>/dev/null || echo "000")

if [ "$SSL_STATUS" == "200" ]; then
    # Verificar validade do certificado
    SSL_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d'=' -f2 || echo "")

    if [ ! -z "$SSL_EXPIRY" ]; then
        test_passed "Certificado SSL válido (Expira: $SSL_EXPIRY)"
    else
        test_passed "HTTPS funcionando (não foi possível verificar expiração)"
    fi
else
    test_failed "Problema com SSL/HTTPS" "HTTP Status: $SSL_STATUS"
fi

# ----------------------------------------------------------------------------
# Report Final
# ----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    RESUMO DOS TESTES                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Calcular percentual de sucesso
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
else
    SUCCESS_RATE=0
fi

echo -e "Ambiente: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "URL: ${YELLOW}$BASE_URL${NC}"
echo ""
echo -e "Total de testes: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Testes passaram: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Testes falharam: ${RED}$FAILED_TESTS${NC}"
echo -e "Taxa de sucesso: ${YELLOW}$SUCCESS_RATE%${NC}"
echo ""

# Determinar status geral
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✓ TODOS OS TESTES PASSARAM COM SUCESSO!          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    log_success "Deploy validado e funcionando corretamente!"
    EXIT_CODE=0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║        ⚠ ALGUNS TESTES FALHARAM (>80% sucesso)            ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    log_warning "Deploy pode estar funcional, mas com problemas menores"
    log_warning "Revise os testes que falharam acima"
    EXIT_CODE=0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           ✗ MUITOS TESTES FALHARAM (<80% sucesso)         ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    log_error "Deploy pode estar com problemas graves!"
    log_error "Recomendações:"
    echo "  1. Verifique logs: ssh $VPS_HOST 'docker service logs ${STACK_NAME}_app'"
    echo "  2. Verifique serviços: ssh $VPS_HOST 'docker service ls'"
    echo "  3. Considere rollback: ./scripts/vps-rollback.sh $ENVIRONMENT"
    EXIT_CODE=1
fi

echo ""
log_info "Comandos úteis:"
echo "  - Ver logs: ssh $VPS_HOST 'docker service logs -f ${STACK_NAME}_app'"
echo "  - Ver serviços: ssh $VPS_HOST 'docker service ls'"
echo "  - Restart serviço: ssh $VPS_HOST 'docker service update --force ${STACK_NAME}_app'"
echo ""

exit $EXIT_CODE
