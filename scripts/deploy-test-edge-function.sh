#!/bin/bash

# ============================================================================
# Life Tracker - Deploy & Test Edge Function
# ============================================================================
# Descrição: Deploy + configurar secrets + testar Edge Function em um comando
# Uso: ./scripts/deploy-test-edge-function.sh function-name --test-payload file.json
# Autor: Life Tracker Team
# Data: 2025-11-02
# ============================================================================

set -e  # Fail fast em caso de erro

# ----------------------------------------------------------------------------
# Cores para logs
# ----------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
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

log_step() {
    echo -e "${CYAN}➜ $1${NC}"
}

log_header() {
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}  $1${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ----------------------------------------------------------------------------
# Validação de pré-requisitos
# ----------------------------------------------------------------------------
validate_prerequisites() {
    log_step "Validando pré-requisitos..."

    # Verificar se Supabase CLI está instalado
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI não encontrado!"
        echo "Instale com: brew install supabase/tap/supabase"
        exit 1
    fi

    # Verificar se está autenticado
    if ! supabase projects list &> /dev/null; then
        log_error "Supabase CLI não autenticado!"
        echo "Execute: supabase login"
        exit 1
    fi

    # Verificar se jq está instalado (para processar JSON)
    if ! command -v jq &> /dev/null; then
        log_warning "jq não encontrado - saída JSON não será formatada"
        echo "Instale com: brew install jq"
    fi

    log_success "Pré-requisitos validados"
}

# ----------------------------------------------------------------------------
# Validar se função existe
# ----------------------------------------------------------------------------
validate_function() {
    local function_name="$1"

    log_step "Validando função '$function_name'..."

    if [ ! -d "supabase/functions/$function_name" ]; then
        log_error "Função '$function_name' não encontrada!"
        echo ""
        echo "Funções disponíveis:"
        ls -1 supabase/functions/ | grep -v "^_" || true
        exit 1
    fi

    if [ ! -f "supabase/functions/$function_name/index.ts" ]; then
        log_error "Arquivo index.ts não encontrado em supabase/functions/$function_name/"
        exit 1
    fi

    log_success "Função '$function_name' encontrada"
}

# ----------------------------------------------------------------------------
# Verificar secrets necessários
# ----------------------------------------------------------------------------
check_secrets() {
    local function_name="$1"
    local function_file="supabase/functions/$function_name/index.ts"

    log_step "Verificando secrets necessários..."

    # Extrair todos os Deno.env.get do código
    local secrets=$(grep -oE "Deno\.env\.get\(['\"]([^'\"]+)" "$function_file" | sed "s/Deno.env.get(['\"]//g" | sort -u)

    if [ -z "$secrets" ]; then
        log_info "Função não usa secrets do ambiente"
        return 0
    fi

    echo ""
    echo "Secrets detectados na função:"

    local missing_secrets=()

    while IFS= read -r secret; do
        echo -n "  - $secret: "

        if supabase secrets list 2>&1 | grep -q "^$secret"; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗ (faltando)${NC}"
            missing_secrets+=("$secret")
        fi
    done <<< "$secrets"

    echo ""

    if [ ${#missing_secrets[@]} -gt 0 ]; then
        log_warning "Alguns secrets estão faltando!"
        echo ""
        echo "Adicione os secrets faltantes com:"
        for secret in "${missing_secrets[@]}"; do
            echo "  ./scripts/supabase-secrets.sh add $secret"
        done
        echo ""
        echo -n "Continuar mesmo assim? (s/N): "
        read -r confirm

        if [[ ! "$confirm" =~ ^[sS]$ ]]; then
            log_info "Deploy cancelado pelo usuário"
            exit 0
        fi
    else
        log_success "Todos os secrets estão configurados"
    fi
}

# ----------------------------------------------------------------------------
# Deploy da função
# ----------------------------------------------------------------------------
deploy_function() {
    local function_name="$1"

    log_header "DEPLOY DA FUNÇÃO"
    log_step "Fazendo deploy de '$function_name'..."

    if supabase functions deploy "$function_name" --no-verify-jwt 2>&1 | tee /tmp/deploy-output.log; then
        log_success "Deploy realizado com sucesso!"

        # Extrair URL da função do output
        local function_url=$(grep -oE "https://[^ ]+" /tmp/deploy-output.log | head -1)

        if [ -n "$function_url" ]; then
            echo ""
            log_info "URL da função: $function_url"
            echo "$function_url" > /tmp/function-url.txt
        fi
    else
        log_error "Falha no deploy da função"
        cat /tmp/deploy-output.log
        exit 1
    fi
}

# ----------------------------------------------------------------------------
# Testar função
# ----------------------------------------------------------------------------
test_function() {
    local function_name="$1"
    local test_payload="$2"

    log_header "TESTE DA FUNÇÃO"

    # Verificar se payload foi especificado
    if [ -z "$test_payload" ]; then
        log_warning "Nenhum payload de teste especificado"
        echo ""
        echo "Para testar a função, adicione: --test-payload payload.json"
        return 0
    fi

    # Verificar se arquivo de payload existe
    if [ ! -f "$test_payload" ]; then
        log_error "Arquivo de payload não encontrado: $test_payload"
        exit 1
    fi

    log_step "Testando função com payload: $test_payload"
    echo ""

    # Ler URL da função
    local function_url
    if [ -f /tmp/function-url.txt ]; then
        function_url=$(cat /tmp/function-url.txt)
    else
        log_error "URL da função não encontrada"
        exit 1
    fi

    # Fazer requisição de teste
    log_info "Enviando requisição para: $function_url"
    echo ""

    local response_file="/tmp/function-response.json"
    local http_code

    http_code=$(curl -s -w "%{http_code}" -o "$response_file" \
        -X POST "$function_url" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${SUPABASE_ANON_KEY:-}" \
        -d "@$test_payload")

    echo "Status HTTP: $http_code"
    echo ""

    if [ "$http_code" -eq 200 ]; then
        log_success "Teste passou! (HTTP 200)"
        echo ""
        echo "Resposta:"

        if command -v jq &> /dev/null; then
            jq '.' "$response_file"
        else
            cat "$response_file"
        fi
    else
        log_error "Teste falhou! (HTTP $http_code)"
        echo ""
        echo "Resposta:"
        cat "$response_file"
        echo ""
        exit 1
    fi
}

# ----------------------------------------------------------------------------
# Exibir ajuda
# ----------------------------------------------------------------------------
show_help() {
    echo "Deploy & Test Edge Function - Life Tracker"
    echo ""
    echo "Uso:"
    echo "  ./scripts/deploy-test-edge-function.sh <function-name> [opções]"
    echo ""
    echo "Opções:"
    echo "  --test-payload FILE    Arquivo JSON com payload de teste"
    echo "  --skip-secrets         Pular verificação de secrets"
    echo "  --help                 Exibir esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  # Deploy simples"
    echo "  ./scripts/deploy-test-edge-function.sh coach-chat"
    echo ""
    echo "  # Deploy + teste com payload"
    echo "  ./scripts/deploy-test-edge-function.sh coach-chat --test-payload test-payload.json"
    echo ""
    echo "  # Deploy sem verificar secrets"
    echo "  ./scripts/deploy-test-edge-function.sh coach-chat --skip-secrets"
    echo ""
    echo "O que o script faz:"
    echo "  1. Valida pré-requisitos (Supabase CLI, jq)"
    echo "  2. Verifica se função existe"
    echo "  3. Detecta e valida secrets necessários"
    echo "  4. Faz deploy da função"
    echo "  5. Testa função (se --test-payload especificado)"
    echo ""
    echo "Exemplo de payload (test-payload.json):"
    echo '  {'
    echo '    "message": "Hello, function!",'
    echo '    "userId": "123"'
    echo '  }'
    echo ""
}

# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
main() {
    local function_name=""
    local test_payload=""
    local skip_secrets=false

    # Parse argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --test-payload)
                test_payload="$2"
                shift 2
                ;;
            --skip-secrets)
                skip_secrets=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                if [ -z "$function_name" ]; then
                    function_name="$1"
                else
                    log_error "Argumento desconhecido: $1"
                    echo ""
                    show_help
                    exit 1
                fi
                shift
                ;;
        esac
    done

    # Validar função especificada
    if [ -z "$function_name" ]; then
        log_error "Nome da função não especificado!"
        echo ""
        show_help
        exit 1
    fi

    # Exibir cabeçalho
    log_header "DEPLOY & TEST: $function_name"

    # Executar pipeline
    validate_prerequisites
    validate_function "$function_name"

    if [ "$skip_secrets" = false ]; then
        check_secrets "$function_name"
    else
        log_warning "Verificação de secrets pulada (--skip-secrets)"
    fi

    deploy_function "$function_name"

    if [ -n "$test_payload" ]; then
        test_function "$function_name" "$test_payload"
    fi

    # Resumo final
    log_header "RESUMO"
    log_success "Deploy da função '$function_name' concluído!"

    if [ -n "$test_payload" ]; then
        log_success "Teste executado com sucesso"
    fi

    echo ""
    log_info "Próximos passos:"
    echo "  - Verificar logs: supabase functions logs $function_name"
    echo "  - Testar produção: curl -X POST <function-url>"
    echo "  - Adicionar secrets: ./scripts/supabase-secrets.sh add SECRET_NAME"
    echo ""
}

main "$@"
