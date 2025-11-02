#!/bin/bash

# ============================================================================
# Life Tracker - Supabase Secrets Manager
# ============================================================================
# Descrição: Gerenciamento simplificado de secrets do Supabase Edge Functions
# Uso:
#   ./scripts/supabase-secrets.sh list
#   ./scripts/supabase-secrets.sh add SECRET_NAME
#   ./scripts/supabase-secrets.sh verify SECRET_NAME function-name
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

    log_success "Pré-requisitos validados"
}

# ----------------------------------------------------------------------------
# Listar secrets
# ----------------------------------------------------------------------------
list_secrets() {
    log_step "Listando secrets do Supabase..."
    echo ""

    if supabase secrets list 2>&1 | grep -q "No secrets found"; then
        log_warning "Nenhum secret encontrado"
        echo ""
        echo "Adicione secrets com: ./scripts/supabase-secrets.sh add SECRET_NAME"
    else
        supabase secrets list
        echo ""
        log_success "Lista de secrets exibida"
    fi
}

# ----------------------------------------------------------------------------
# Adicionar secret interativo
# ----------------------------------------------------------------------------
add_secret() {
    local secret_name="$1"

    # Validar nome do secret
    if [ -z "$secret_name" ]; then
        log_error "Nome do secret não especificado!"
        echo "Uso: ./scripts/supabase-secrets.sh add SECRET_NAME"
        exit 1
    fi

    # Validar formato do nome (apenas letras maiúsculas, números e underscore)
    if ! [[ "$secret_name" =~ ^[A-Z0-9_]+$ ]]; then
        log_error "Nome de secret inválido!"
        echo "Use apenas letras maiúsculas, números e underscore (ex: GEMINI_API_KEY)"
        exit 1
    fi

    log_step "Adicionando secret: $secret_name"
    echo ""

    # Solicitar valor do secret
    echo -n "Digite o valor do secret (não será exibido): "
    read -s secret_value
    echo ""

    # Validar que valor não está vazio
    if [ -z "$secret_value" ]; then
        log_error "Valor do secret não pode ser vazio!"
        exit 1
    fi

    # Confirmar antes de adicionar
    echo ""
    echo -n "Confirmar adição do secret '$secret_name'? (s/N): "
    read -r confirm

    if [[ ! "$confirm" =~ ^[sS]$ ]]; then
        log_warning "Operação cancelada pelo usuário"
        exit 0
    fi

    # Adicionar secret via Supabase CLI
    log_step "Enviando secret para Supabase..."
    if echo "$secret_value" | supabase secrets set "$secret_name" --env-file /dev/stdin; then
        log_success "Secret '$secret_name' adicionado com sucesso!"
        echo ""
        log_info "Lembre-se de fazer redeploy das Edge Functions para usar o novo secret:"
        echo "  supabase functions deploy function-name"
    else
        log_error "Falha ao adicionar secret"
        exit 1
    fi
}

# ----------------------------------------------------------------------------
# Verificar secret em uma Edge Function
# ----------------------------------------------------------------------------
verify_secret() {
    local secret_name="$1"
    local function_name="$2"

    # Validar parâmetros
    if [ -z "$secret_name" ] || [ -z "$function_name" ]; then
        log_error "Parâmetros insuficientes!"
        echo "Uso: ./scripts/supabase-secrets.sh verify SECRET_NAME function-name"
        exit 1
    fi

    log_step "Verificando secret '$secret_name' na função '$function_name'..."
    echo ""

    # Verificar se função existe
    if [ ! -d "supabase/functions/$function_name" ]; then
        log_error "Função '$function_name' não encontrada!"
        echo "Funções disponíveis:"
        ls -1 supabase/functions/ | grep -v "^_" || true
        exit 1
    fi

    # Verificar se secret existe
    log_info "Verificando se secret existe no Supabase..."
    if ! supabase secrets list 2>&1 | grep -q "$secret_name"; then
        log_error "Secret '$secret_name' não encontrado!"
        echo ""
        echo "Adicione o secret com: ./scripts/supabase-secrets.sh add $secret_name"
        exit 1
    fi

    log_success "Secret '$secret_name' existe no Supabase"

    # Verificar se função usa o secret
    log_info "Verificando se função usa o secret..."
    local function_file="supabase/functions/$function_name/index.ts"

    if grep -q "Deno.env.get.*$secret_name" "$function_file"; then
        log_success "Função '$function_name' usa o secret '$secret_name'"
        echo ""
        echo "Referências encontradas:"
        grep --color=always -n "Deno.env.get.*$secret_name" "$function_file"
    else
        log_warning "Função '$function_name' NÃO parece usar o secret '$secret_name'"
        echo ""
        echo "Verifique se a função está configurada corretamente para usar:"
        echo "  const value = Deno.env.get('$secret_name');"
    fi

    echo ""
    log_info "Para aplicar o secret, faça redeploy da função:"
    echo "  supabase functions deploy $function_name"
}

# ----------------------------------------------------------------------------
# Exibir ajuda
# ----------------------------------------------------------------------------
show_help() {
    echo "Supabase Secrets Manager - Life Tracker"
    echo ""
    echo "Uso:"
    echo "  ./scripts/supabase-secrets.sh list"
    echo "  ./scripts/supabase-secrets.sh add SECRET_NAME"
    echo "  ./scripts/supabase-secrets.sh verify SECRET_NAME function-name"
    echo ""
    echo "Comandos:"
    echo "  list                    Lista todos os secrets configurados"
    echo "  add SECRET_NAME         Adiciona um novo secret (interativo)"
    echo "  verify SECRET_NAME fn   Verifica se secret existe e é usado pela função"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/supabase-secrets.sh list"
    echo "  ./scripts/supabase-secrets.sh add GEMINI_API_KEY"
    echo "  ./scripts/supabase-secrets.sh verify GEMINI_API_KEY coach-chat"
    echo ""
}

# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
main() {
    local command="$1"

    case "$command" in
        list)
            validate_prerequisites
            list_secrets
            ;;
        add)
            validate_prerequisites
            add_secret "$2"
            ;;
        verify)
            validate_prerequisites
            verify_secret "$2" "$3"
            ;;
        help|--help|-h|"")
            show_help
            ;;
        *)
            log_error "Comando inválido: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
