#!/bin/bash

# ============================================
# Script de Teste dos 3 Novos Security Checks
# ============================================
# Demonstra os checks 7, 8 e 9 do Workflow 8
#
# Uso:
#   ./scripts/test-security-checks.sh
# ============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 Teste dos 3 Novos Security Checks (Workflow 8)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================
# CHECK 7: Webhook HMAC Validation
# ============================================
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${CYAN}CHECK 7: Webhook HMAC Validation${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}▸ Procurando por webhooks que usam serve()...${NC}"
WEBHOOK_FUNCTIONS=$(find supabase/functions -path "*/_shared" -prune -o -name "*.ts" -type f ! -name "*.example.*" ! -name "*.test.*" -exec grep -l "serve(async" {} \; 2>/dev/null | grep -v "_shared")

if [ ! -z "$WEBHOOK_FUNCTIONS" ]; then
    echo -e "${GREEN}✓ Encontradas funções com serve():${NC}"
    echo "$WEBHOOK_FUNCTIONS" | sed 's/^/  - /'
    echo ""

    echo -e "${YELLOW}▸ Verificando validação HMAC...${NC}"
    WEBHOOK_WITH_VALIDATION=0
    WEBHOOK_WITHOUT_VALIDATION=0

    while IFS= read -r file; do
        if [[ "$file" == *".example."* ]] || [[ "$file" == *".test."* ]] || [[ "$file" == *"_shared"* ]]; then
            continue
        fi

        if grep -q "validateWebhook\|validateUAZAPISignature" "$file" 2>/dev/null; then
            echo -e "${GREEN}  ✓ $(basename $(dirname $file)): tem validateWebhook${NC}"
            ((WEBHOOK_WITH_VALIDATION++))
        else
            if grep -q "webhook\|WEBHOOK" "$file" 2>/dev/null; then
                echo -e "${RED}  ✗ $(basename $(dirname $file)): SEM validação${NC}"
                ((WEBHOOK_WITHOUT_VALIDATION++))
            fi
        fi
    done <<< "$WEBHOOK_FUNCTIONS"

    echo ""
    echo -e "${YELLOW}Resultado:${NC}"
    echo -e "  ${GREEN}Com HMAC validation: $WEBHOOK_WITH_VALIDATION${NC}"
    echo -e "  ${RED}Sem HMAC validation: $WEBHOOK_WITHOUT_VALIDATION${NC}"

    if [ $WEBHOOK_WITHOUT_VALIDATION -eq 0 ]; then
        echo -e "${GREEN}✅ CHECK 7 PASSOU${NC}"
    else
        echo -e "${RED}❌ CHECK 7 FALHOU${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nenhuma função com serve() encontrada${NC}"
fi

echo ""
echo ""

# ============================================
# CHECK 8: AI Call Rate Limiting
# ============================================
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${CYAN}CHECK 8: AI Call Rate Limiting${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}▸ Procurando por funções AI (coach-chat, generate, etc.)...${NC}"
AI_FUNCTIONS=$(find supabase/functions -path "*/_shared" -prune -o -name "*.ts" -type f ! -name "*.example.*" ! -name "*.test.*" -exec grep -l "coach\|gemini\|generate.*AI" {} \; 2>/dev/null | grep -v "_shared")

if [ ! -z "$AI_FUNCTIONS" ]; then
    echo -e "${GREEN}✓ Encontradas funções AI:${NC}"
    echo "$AI_FUNCTIONS" | sed 's/^/  - /'
    echo ""

    echo -e "${YELLOW}▸ Verificando rate limiting...${NC}"
    AI_WITH_RATE_LIMIT=0
    AI_WITHOUT_RATE_LIMIT=0

    while IFS= read -r file; do
        if [[ "$file" == *".example."* ]] || [[ "$file" == *".test."* ]] || [[ "$file" == *"_shared"* ]]; then
            continue
        fi

        FUNC_NAME=$(basename $(dirname $file))

        if grep -q "checkRateLimit\|RATE_LIMIT" "$file" 2>/dev/null; then
            echo -e "${GREEN}  ✓ $FUNC_NAME: tem rate limiting${NC}"
            ((AI_WITH_RATE_LIMIT++))
        else
            echo -e "${YELLOW}  ℹ️  $FUNC_NAME: rate limiting não detectado (pode estar no caller)${NC}"
            ((AI_WITHOUT_RATE_LIMIT++))
        fi
    done <<< "$AI_FUNCTIONS"

    echo ""
    echo -e "${YELLOW}Resultado:${NC}"
    echo -e "  ${GREEN}Com rate limiting: $AI_WITH_RATE_LIMIT${NC}"
    echo -e "  ${YELLOW}Sem rate limiting (pode estar em caller): $AI_WITHOUT_RATE_LIMIT${NC}"
    echo ""

    echo -e "${YELLOW}▸ Verificando RATE_LIMIT_MSGS_PER_HOUR...${NC}"
    if grep -r "RATE_LIMIT_MSGS_PER_HOUR" supabase/functions --include="*.ts" 2>/dev/null | head -1; then
        RATE_LIMIT_VALUE=$(grep -r "RATE_LIMIT_MSGS_PER_HOUR\s*=" supabase/functions --include="*.ts" 2>/dev/null | head -1 | grep -oE "[0-9]+")
        echo -e "${GREEN}✓ Taxa de limit configurada: $RATE_LIMIT_VALUE msgs/hora${NC}"
        echo -e "${GREEN}✅ CHECK 8 PASSOU${NC}"
    else
        echo -e "${YELLOW}⚠️  RATE_LIMIT_MSGS_PER_HOUR não encontrado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nenhuma função AI encontrada${NC}"
fi

echo ""
echo ""

# ============================================
# CHECK 9: LGPD Compliance (WhatsApp)
# ============================================
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${CYAN}CHECK 9: LGPD Compliance (WhatsApp)${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}▸ Procurando por funções WhatsApp...${NC}"
WHATSAPP_FUNCTIONS=$(find supabase/functions -path "*/_shared" -prune -o -name "*webhook-whatsapp*" -type f ! -name "*.example.*" ! -name "*.test.*" 2>/dev/null | grep -v "_shared")

if [ ! -z "$WHATSAPP_FUNCTIONS" ]; then
    echo -e "${GREEN}✓ Encontradas funções WhatsApp:${NC}"
    echo "$WHATSAPP_FUNCTIONS" | sed 's/^/  - /'
    echo ""

    echo -e "${YELLOW}▸ Verificando LGPD consent check...${NC}"
    WHATSAPP_WITH_LGPD=0
    WHATSAPP_WITHOUT_LGPD=0

    while IFS= read -r file; do
        if [[ "$file" == *".example."* ]] || [[ "$file" == *".test."* ]] || [[ "$file" == *"_shared"* ]]; then
            continue
        fi

        FUNC_NAME=$(basename $(dirname $file))

        if grep -q "hasWhatsAppConsent\|CONSENT_MESSAGE" "$file" 2>/dev/null; then
            echo -e "${GREEN}  ✓ $FUNC_NAME: tem LGPD consent check${NC}"
            ((WHATSAPP_WITH_LGPD++))
        else
            echo -e "${RED}  ✗ $FUNC_NAME: SEM LGPD consent check${NC}"
            ((WHATSAPP_WITHOUT_LGPD++))
        fi
    done <<< "$WHATSAPP_FUNCTIONS"

    echo ""
    echo -e "${YELLOW}Resultado:${NC}"
    echo -e "  ${GREEN}Com LGPD compliance: $WHATSAPP_WITH_LGPD${NC}"
    echo -e "  ${RED}Sem LGPD compliance: $WHATSAPP_WITHOUT_LGPD${NC}"

    echo ""
    echo -e "${YELLOW}▸ Verificando CONSENT_MESSAGE...${NC}"
    if grep -r "CONSENT_MESSAGE\s*=" supabase/functions --include="*.ts" 2>/dev/null | head -1; then
        echo -e "${GREEN}✓ CONSENT_MESSAGE definida${NC}"
        echo ""
        echo -e "${YELLOW}Conteúdo da mensagem:${NC}"
        grep -r "const CONSENT_MESSAGE\|'🔒\|'Privacidade" supabase/functions/_shared/lgpd.ts 2>/dev/null | head -3 | sed 's/^/  /'
    fi

    echo ""
    if [ $WHATSAPP_WITHOUT_LGPD -eq 0 ]; then
        echo -e "${GREEN}✅ CHECK 9 PASSOU${NC}"
    else
        echo -e "${RED}❌ CHECK 9 FALHOU${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nenhuma função webhook-whatsapp encontrada${NC}"
fi

echo ""
echo ""

# ============================================
# Resumo Final
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Resumo dos Testes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "Para execução completa de security tests, use:"
echo -e "${CYAN}./scripts/run-security-tests.sh${NC}"
echo ""

echo -e "Para ver documentação detalhada:"
echo -e "${CYAN}cat docs/WORKFLOW_8_SECURITY_CHECKS.md${NC}"
echo -e "${CYAN}cat docs/WORKFLOW_8_TEST_EXAMPLES.md${NC}"
echo ""

echo -e "${GREEN}✅ Testes completos!${NC}"
echo ""
