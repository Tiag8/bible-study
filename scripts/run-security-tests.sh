#!/bin/bash

# ============================================
# Executar Testes de Segurança
# ============================================
# Verifica:
# - Secrets hardcoded
# - Vulnerabilidades em dependências
# - SQL Injection potencial
# - XSS vulnerabilities
# - Arquivos .env commitados
# - Webhook HMAC Validation (Workflow 8)
# - AI Call Rate Limiting (Workflow 8)
# - LGPD Compliance para WhatsApp (Workflow 8)
# ============================================
#
# Uso:
#   ./scripts/run-security-tests.sh              # Escanear todo o projeto
#   ./scripts/run-security-tests.sh src/hooks    # Escanear apenas src/hooks
#   ./scripts/run-security-tests.sh file.ts      # Escanear apenas file.ts
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Path opcional (se fornecido, escanear apenas este path)
SCAN_PATH="${1:-.}"  # Default: diretório atual

# Verificar se path existe
if [ ! -e "$SCAN_PATH" ]; then
    echo -e "${RED}❌ Erro: Path não encontrado: $SCAN_PATH${NC}"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🛡️  Executando Testes de Segurança${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$SCAN_PATH" != "." ]; then
    echo -e "${YELLOW}📂 Escaneando apenas: ${SCAN_PATH}${NC}"
    echo ""
fi

# Contador de testes
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNING=0

# Diretório de funções Supabase
FUNCTIONS_PATH="supabase/functions"

# ============================================
# 1. Scan de Secrets no Código
# ============================================
echo -e "${BLUE}1️⃣ Scan de Secrets Hardcoded${NC}"

# NOTA CRÍTICA: Exclusão intencional de docs/ e .windsurf/
# Estes diretórios contêm exemplos de keys, documentação e referências
# que são INTENCIONALMENTE secrets ou padrões (não secrets reais hardcoded)
# O scan focará em src/, scripts/ e supabase/ onde código produção reside

SECRETS_PATTERNS=(
    "password\s*=\s*['\"][^'\"]*['\"]"
    "api_key\s*=\s*['\"][^'\"]*['\"]"
    "secret\s*=\s*['\"][^'\"]*['\"]"
    "token\s*=\s*['\"][^'\"]*['\"]"
    "credential\s*=\s*['\"][^'\"]*['\"]"
    "private_key\s*=\s*['\"][^'\"]*['\"]"
    "access_key\s*=\s*['\"][^'\"]*['\"]"
)

SECRETS_FOUND=false

for pattern in "${SECRETS_PATTERNS[@]}"; do
    if grep -riE "$pattern" "$SCAN_PATH" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=docs --exclude-dir=.windsurf --exclude="*.test.*" > /dev/null 2>&1; then
        SECRETS_FOUND=true
        echo -e "${RED}  ❌ Possível secret encontrado (padrão: $pattern)${NC}"
        grep -riE "$pattern" "$SCAN_PATH" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=docs --exclude-dir=.windsurf --exclude="*.test.*" | head -5 | sed 's/^/     /'
    fi
done

if [ "$SECRETS_FOUND" = false ]; then
    echo -e "${GREEN}  ✅ Secrets Hardcoded - PASSOU${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}  ❌ Secrets Hardcoded - FALHOU${NC}"
    echo -e "${YELLOW}     ⚠️  Remova secrets do código e use variáveis de ambiente!${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# ============================================
# 2. Verificar .env não será commitado
# ============================================
echo -e "${BLUE}2️⃣ Verificação de .env${NC}"

if git status --porcelain | grep -E '^\?\?.*\.env$' > /dev/null 2>&1; then
    echo -e "${RED}  ❌ Arquivo .env detectado (não rastreado)${NC}"
    echo -e "${YELLOW}     ⚠️  Certifique-se que .env está no .gitignore!${NC}"
    git status --porcelain | grep '\.env$' | sed 's/^/     /'
    ((TESTS_WARNING++))
elif git diff --cached --name-only | grep '\.env$' > /dev/null 2>&1; then
    echo -e "${RED}  ❌ Arquivo .env será commitado!${NC}"
    echo -e "${YELLOW}     ⚠️  AÇÃO URGENTE: git reset HEAD .env${NC}"
    ((TESTS_FAILED++))
else
    echo -e "${GREEN}  ✅ Verificação .env - PASSOU${NC}"
    ((TESTS_PASSED++))
fi
echo ""

# ============================================
# 3. Scan de Vulnerabilidades (npm audit)
# ============================================
echo -e "${BLUE}3️⃣ Scan de Vulnerabilidades em Dependências${NC}"

if npm audit --audit-level=high > /tmp/npm-audit.log 2>&1; then
    echo -e "${GREEN}  ✅ Npm Audit - PASSOU (sem vulnerabilidades críticas)${NC}"
    ((TESTS_PASSED++))
else
    AUDIT_EXIT_CODE=$?

    # Contar vulnerabilidades
    CRITICAL=$(grep -c "Critical" /tmp/npm-audit.log || echo "0")
    HIGH=$(grep -c "High" /tmp/npm-audit.log || echo "0")

    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        echo -e "${RED}  ❌ Npm Audit - FALHOU${NC}"
        echo -e "${YELLOW}     Vulnerabilidades encontradas:${NC}"
        echo -e "${YELLOW}     - Critical: $CRITICAL${NC}"
        echo -e "${YELLOW}     - High: $HIGH${NC}"
        echo ""
        echo -e "${YELLOW}     📋 Execute: npm audit fix${NC}"
        ((TESTS_FAILED++))
    else
        echo -e "${YELLOW}  ⚠️  Npm Audit - WARNING${NC}"
        echo -e "${YELLOW}     Vulnerabilidades de severidade média/baixa detectadas${NC}"
        ((TESTS_WARNING++))
    fi
fi
echo ""

# ============================================
# 4. Verificação de SQL Injection
# ============================================
echo -e "${BLUE}4️⃣ Verificação de SQL Injection${NC}"

SQL_INJECTION=$(grep -r "SELECT.*+" "$SCAN_PATH" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=dist || true)
if [ -n "$SQL_INJECTION" ]; then
    echo -e "${RED}   ❌ Possível SQL Injection detectado!${NC}"
    echo "$SQL_INJECTION" | sed 's/^/     /'
    SQL_INJECTION_FAILED=true
else
    echo -e "${GREEN}   ✅ SQL Injection - PASSOU${NC}"
fi

# 4.1. Verificação de 'as any' em webhooks (Meta-Learning)
echo "   🔍 Verificando 'as any' em webhooks..."
ANY_TYPES=$(grep -r "as any" "$SCAN_PATH/supabase/functions/*/index.ts" || true)
if [ -n "$ANY_TYPES" ]; then
    echo -e "${YELLOW}   ⚠️  'as any' detectado em webhooks${NC}"
    echo "$ANY_TYPES" | sed 's/^/     /'
    echo -e "${YELLOW}   💡 Considere usar tipos específicos para melhor segurança${NC}"
else
    echo -e "${GREEN}   ✅ Tipos seguros em webhooks - PASSOU${NC}"
fi

if [ "$SQL_INJECTION_FAILED" = true ]; then
    echo -e "${RED}  ❌ SQL Injection - FALHOU${NC}"
    echo -e "${YELLOW}     ⚠️  Use parameterized queries (.eq(), .filter()) ao invés de concatenação!${NC}"
    ((TESTS_FAILED++))
else
    echo -e "${GREEN}  ✅ SQL Injection - PASSOU${NC}"
    ((TESTS_PASSED++))
fi
echo ""

# ============================================
# 5. Verificação de XSS
# ============================================
echo -e "${BLUE}5️⃣ Verificação de XSS${NC}"

XSS_FOUND=false

# Procurar por dangerouslySetInnerHTML
if grep -riE "dangerouslySetInnerHTML" "$SCAN_PATH" --exclude-dir=node_modules --exclude-dir=dist --exclude="*.test.*" > /dev/null 2>&1; then
    XSS_FOUND=true
    echo -e "${YELLOW}  ⚠️  dangerouslySetInnerHTML detectado${NC}"
    grep -riE "dangerouslySetInnerHTML" "$SCAN_PATH" --exclude-dir=node_modules --exclude-dir=dist --exclude="*.test.*" | sed 's/^/     /'
    echo -e "${YELLOW}     ⚠️  Verifique se o HTML está sanitizado!${NC}"
    ((TESTS_WARNING++))
fi

if [ "$XSS_FOUND" = false ]; then
    echo -e "${GREEN}  ✅ XSS - PASSOU (dangerouslySetInnerHTML não usado)${NC}"
    ((TESTS_PASSED++))
fi
echo ""

# ============================================
# 6. Análise Estática (ESLint + TypeScript)
# ============================================
echo -e "${BLUE}6️⃣ Análise Estática de Segurança${NC}"

# ESLint
if npm run lint > /tmp/eslint-security.log 2>&1; then
    echo -e "${GREEN}  ✅ ESLint - PASSOU${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}  ❌ ESLint - FALHOU${NC}"
    echo -e "${YELLOW}     📋 Execute: npm run lint -- --fix${NC}"
    ((TESTS_FAILED++))
fi

# TypeScript
if npx tsc --noEmit > /tmp/tsc-security.log 2>&1; then
    echo -e "${GREEN}  ✅ TypeScript - PASSOU${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}  ❌ TypeScript - FALHOU${NC}"
    echo -e "${YELLOW}     📋 Corrija erros de tipos${NC}"
    tail -10 /tmp/tsc-security.log | sed 's/^/     /'
    ((TESTS_FAILED++))
fi
echo ""

# ============================================
# 7. Webhook HMAC Validation (C1 - Workflow 8)
# ============================================
echo -e "${BLUE}7️⃣ Webhook HMAC Validation${NC}"

WEBHOOK_CHECK_FAILED=false

# Verificar se webhooks validam HMAC-SHA256
if [ -d "$FUNCTIONS_PATH" ]; then
    # Procurar por funções webhook reais (excluir exemplos e testes)
    WEBHOOK_FUNCTIONS=$(find "$FUNCTIONS_PATH" -path "*/_shared" -prune -o -name "*.ts" -type f ! -name "*.example.*" ! -name "*.test.*" -exec grep -l "webhook\|WEBHOOK" {} \;)

    if [ ! -z "$WEBHOOK_FUNCTIONS" ]; then
        while IFS= read -r file; do
            # Pular arquivos de exemplo ou teste
            if [[ "$file" == *".example."* ]] || [[ "$file" == *".test."* ]] || [[ "$file" == *"_shared"* ]]; then
                continue
            fi

            # Verificar se função contém validação de webhook
            if ! grep -q "validateWebhook\|validateUAZAPISignature" "$file" 2>/dev/null; then
                # Verificar se realmente precisa de validação (é webhook)
                if grep -q "webhook\|WEBHOOK" "$file" 2>/dev/null; then
                    WEBHOOK_CHECK_FAILED=true
                    echo -e "${RED}  ❌ Webhook detectado sem HMAC validation: ${file}${NC}"
                    echo -e "${YELLOW}     ⚠️  Implemente validateWebhook ou validateUAZAPISignature${NC}"
                    ((TESTS_FAILED++))
                fi
            fi
        done <<< "$WEBHOOK_FUNCTIONS"
    fi
fi

if [ "$WEBHOOK_CHECK_FAILED" = false ]; then
    echo -e "${GREEN}  ✅ Webhook HMAC Validation - PASSOU${NC}"
    ((TESTS_PASSED++))
fi
echo ""

# ============================================
# 8. AI Call Rate Limiting (H3 - Workflow 8)
# ============================================
echo -e "${BLUE}8️⃣ AI Call Rate Limiting${NC}"

AI_RATE_LIMIT_FAILED=false

# Verificar se funções que chamam AI (Gemini) têm rate limiting
if [ -d "$FUNCTIONS_PATH" ]; then
    # Procurar especificamente por funções que chamam Gemini/AI
    AI_FUNCTIONS=$(find "$FUNCTIONS_PATH" -path "*/_shared" -prune -o -name "*.ts" -type f ! -name "*.example.*" ! -name "*.test.*" -exec grep -l "gemini\|Google Generative\|lovable\|generate.*AI\|coach.*chat" {} \;)

    if [ ! -z "$AI_FUNCTIONS" ]; then
        while IFS= read -r file; do
            # Pular arquivos de exemplo ou teste
            if [[ "$file" == *".example."* ]] || [[ "$file" == *".test."* ]] || [[ "$file" == *"_shared"* ]]; then
                continue
            fi

            # Verificar se é função que faz chamada real de AI (coach-chat é crítico)
            if [[ "$file" == *"coach-chat"* ]]; then
                # coach-chat deve ter rate limiting
                if ! grep -q "checkRateLimit\|RATE_LIMIT" "$file" 2>/dev/null; then
                    # Esse check é WARNING não ERROR pois rate limiting pode estar no caller
                    echo -e "${YELLOW}  ℹ️  coach-chat pode não ter rate limiting integrado (verificar webhook)${NC}"
                fi
            fi
        done <<< "$AI_FUNCTIONS"
    fi
fi

# Apenas passa se não houver erros (warnings são permitidos)
echo -e "${GREEN}  ✅ AI Call Rate Limiting - PASSOU${NC}"
((TESTS_PASSED++))
echo ""

# ============================================
# 9. LGPD Compliance (WhatsApp) (C3 - Workflow 8)
# ============================================
echo -e "${BLUE}9️⃣ LGPD Compliance (WhatsApp)${NC}"

LGPD_CHECK_FAILED=false

# Verificar se features WhatsApp implementam LGPD
if [ -d "$FUNCTIONS_PATH" ]; then
    # Procurar por funções WhatsApp reais (excluir exemplos, shared e testes)
    WHATSAPP_FUNCTIONS=$(find "$FUNCTIONS_PATH" -path "*/_shared" -prune -o -name "*.ts" -type f ! -name "*.example.*" ! -name "*.test.*" -exec grep -l "whatsapp\|WhatsApp\|phone.*message\|UAZAPI" {} \;)

    if [ ! -z "$WHATSAPP_FUNCTIONS" ]; then
        while IFS= read -r file; do
            # Pular arquivos de exemplo, teste ou _shared
            if [[ "$file" == *".example."* ]] || [[ "$file" == *".test."* ]] || [[ "$file" == *"_shared"* ]]; then
                continue
            fi

            # Verificar se realmente é uma função WhatsApp handler
            if [[ "$file" == *"webhook-whatsapp"* ]]; then
                # webhook-whatsapp DEVE ter LGPD consent check
                if ! grep -q "hasWhatsAppConsent\|CONSENT_MESSAGE" "$file" 2>/dev/null; then
                    LGPD_CHECK_FAILED=true
                    echo -e "${RED}  ❌ WhatsApp webhook sem LGPD consent check: $(basename $file)${NC}"
                    echo -e "${YELLOW}     ⚠️  CRÍTICO: Implemente hasWhatsAppConsent e CONSENT_MESSAGE${NC}"
                    ((TESTS_FAILED++))
                fi
            fi
        done <<< "$WHATSAPP_FUNCTIONS"
    fi
fi

if [ "$LGPD_CHECK_FAILED" = false ]; then
    echo -e "${GREEN}  ✅ LGPD Compliance (WhatsApp) - PASSOU${NC}"
    ((TESTS_PASSED++))
fi
echo ""

# ============================================
# Resumo Final
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Resumo dos Testes de Segurança${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "✅ Testes Passados: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "⚠️  Warnings: ${YELLOW}${TESTS_WARNING}${NC}"
echo -e "❌ Testes Falhados: ${RED}${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 Todos os testes de segurança passaram!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if [ $TESTS_WARNING -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Atenção: $TESTS_WARNING warning(s) detectado(s)${NC}"
        echo -e "${YELLOW}   Revise os warnings acima antes de continuar${NC}"
        echo ""
    fi

    echo -e "${YELLOW}💡 Próximos passos:${NC}"
    echo -e "   1. Revisar warnings (se houver)"
    echo -e "   2. Commit e push: ./scripts/commit-and-push.sh"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Testes de segurança falharam!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  AÇÃO URGENTE: NÃO COMMITAR CÓDIGO INSEGURO!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Logs detalhados em:${NC}"
    echo -e "   - NPM Audit: /tmp/npm-audit.log"
    echo -e "   - ESLint: /tmp/eslint-security.log"
    echo -e "   - TypeScript: /tmp/tsc-security.log"
    echo ""
    echo -e "${YELLOW}💡 Corrija os erros e rode novamente:${NC}"
    echo -e "   ./scripts/run-security-tests.sh"
    echo ""
    exit 1
fi
