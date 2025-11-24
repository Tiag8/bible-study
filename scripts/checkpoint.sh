#!/bin/bash

################################################################################
# Checkpoint Script - REGRA #13: Uma Ação Por Vez
#
# Automatiza validação obrigatória após cada ação atômica.
# Integra com .context/ (REGRA #12) para documentar histórico.
#
# Uso:
#   ./scripts/checkpoint.sh "descrição da ação"
#
# Exemplo:
#   ./scripts/checkpoint.sh "Adicionar coluna phone_verified na tabela users"
#
# Checklist Executado:
#   1. Validar que apenas 1 ação foi executada
#   2. Capturar evidência (git diff, logs, screenshots)
#   3. Documentar em .context/attempts.log
#   4. Atualizar .context/workflow-progress.md
#   5. Solicitar aprovação do usuário
#
# Versão: 1.0.0
# Data: 2025-11-11
################################################################################

set -e  # Exit on error
# set -x  # Debug mode (uncomment for verbose output)

# ==================== CONFIGURAÇÃO ====================

TIMEZONE="America/Sao_Paulo"
TIMESTAMP=$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M:%S %Z')
CONTEXT_DIR=".context"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
ATTEMPTS_LOG="$CONTEXT_DIR/${BRANCH}_attempts.log"
WORKFLOW_PROGRESS="$CONTEXT_DIR/${BRANCH}_workflow-progress.md"
TEMP_MEMORY="$CONTEXT_DIR/${BRANCH}_temp-memory.md"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ==================== FUNÇÕES ====================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${CYAN}════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════${NC}\n"
}

# Inicializar .context/ se não existir
init_context() {
    if [ ! -d "$CONTEXT_DIR" ]; then
        log_warning ".context/ não existe. Inicializando..."
        ./scripts/context-init.sh "${BRANCH#feat/}" || {
            log_error "Falha ao inicializar .context/. Execute manualmente: ./scripts/context-init.sh"
            exit 1
        }
    fi
}

# Validar que git está limpo ou tem exatamente 1 arquivo modificado
validate_single_action() {
    local changed_files=$(git status --short | wc -l | tr -d ' ')

    if [ "$changed_files" -eq 0 ]; then
        log_warning "Nenhuma mudança detectada no Git."
        log_info "Se você fez mudanças manuais (testes, UI), documente abaixo."
        return 0
    elif [ "$changed_files" -gt 5 ]; then
        log_error "Muitos arquivos modificados ($changed_files). REGRA #13 violada!"
        log_error "Ação atômica deve modificar no máximo 5 arquivos."
        log_info "Considere dividir em ações menores."
        return 1
    else
        log_success "Validação OK: $changed_files arquivo(s) modificado(s)"
        return 0
    fi
}

# Capturar evidências
capture_evidence() {
    log_header "📸 CAPTURANDO EVIDÊNCIAS"

    # Git diff (últimas mudanças)
    echo -e "${CYAN}Git Status:${NC}"
    git status --short
    echo ""

    # Git diff summary
    if [ "$(git status --short | wc -l | tr -d ' ')" -gt 0 ]; then
        echo -e "${CYAN}Git Diff (resumo):${NC}"
        git diff --stat
        echo ""

        # Salvar diff completo em arquivo temporário
        local diff_file="/tmp/checkpoint-diff-$(date +%s).txt"
        git diff > "$diff_file"
        log_info "Diff completo salvo em: $diff_file"
    fi

    # Últimos commits
    echo -e "${CYAN}Últimos 3 commits:${NC}"
    git log --oneline -3
    echo ""
}

# Documentar em .context/attempts.log
log_to_context() {
    local action_description="$1"
    local status="${2:-IN_PROGRESS}"  # IN_PROGRESS, SUCCESS, FAILED

    echo "[$TIMESTAMP] CHECKPOINT: $action_description - Status: $status" >> "$ATTEMPTS_LOG"
    log_success "Documentado em: $ATTEMPTS_LOG"
}

# Atualizar .context/workflow-progress.md
update_workflow_progress() {
    local action_description="$1"

    if [ ! -f "$WORKFLOW_PROGRESS" ]; then
        log_warning "$WORKFLOW_PROGRESS não existe. Pulando atualização."
        return 0
    fi

    cat >> "$WORKFLOW_PROGRESS" <<EOF

---

### Checkpoint: $(date '+%Y-%m-%d %H:%M')

**Ação**: $action_description

**Status**: ⏸️ AGUARDANDO APROVAÇÃO

**Evidências**: Ver git diff acima

EOF

    log_success "Workflow progress atualizado: $WORKFLOW_PROGRESS"
}

# Checklist interativo
run_checklist() {
    log_header "🔍 CHECKLIST PÓS-AÇÃO (REGRA #13)"

    local all_passed=true

    # Checklist obrigatório
    echo -e "${CYAN}1. Executei APENAS 1 ação atômica?${NC}"
    read -p "   [S/n] " answer
    if [[ ! "$answer" =~ ^[Ss]$ ]] && [[ ! -z "$answer" ]]; then
        log_error "Ação NÃO atômica. Divida em ações menores!"
        all_passed=false
    fi

    echo -e "\n${CYAN}2. Evidências capturadas? (diff, logs, screenshots)${NC}"
    read -p "   [S/n] " answer
    if [[ ! "$answer" =~ ^[Ss]$ ]] && [[ ! -z "$answer" ]]; then
        log_warning "Capture evidências antes de prosseguir!"
        all_passed=false
    fi

    echo -e "\n${CYAN}3. Sem erros/warnings?${NC}"
    read -p "   [S/n] " answer
    if [[ ! "$answer" =~ ^[Ss]$ ]] && [[ ! -z "$answer" ]]; then
        log_error "Corrija erros antes de próxima ação!"
        all_passed=false
    fi

    echo -e "\n${CYAN}4. Comportamento esperado confirmado?${NC}"
    read -p "   [S/n] " answer
    if [[ ! "$answer" =~ ^[Ss]$ ]] && [[ ! -z "$answer" ]]; then
        log_error "Valide comportamento antes de prosseguir!"
        all_passed=false
    fi

    echo ""

    if [ "$all_passed" = true ]; then
        log_success "✅ Checklist APROVADO!"
        return 0
    else
        log_error "❌ Checklist REPROVADO. Corrija antes de próxima ação!"
        return 1
    fi
}

# Solicitar aprovação do usuário
request_approval() {
    log_header "⏸️ AGUARDANDO APROVAÇÃO"

    echo -e "${YELLOW}Próxima ação planejada:${NC}"
    read -p "Digite a próxima ação (ou ENTER para finalizar): " next_action

    if [ -z "$next_action" ]; then
        log_info "Checkpoint finalizado. Nenhuma próxima ação planejada."
        echo "[$TIMESTAMP] CHECKPOINT: Finalizado - Nenhuma próxima ação" >> "$ATTEMPTS_LOG"
    else
        echo -e "\n${GREEN}🎯 Próxima ação registrada:${NC} $next_action"
        echo "[$TIMESTAMP] NEXT_ACTION: $next_action" >> "$ATTEMPTS_LOG"

        read -p "Executar próxima ação agora? [s/N] " execute
        if [[ "$execute" =~ ^[Ss]$ ]]; then
            log_info "Execute a próxima ação e rode checkpoint novamente."
        else
            log_info "Próxima ação registrada. Execute quando pronto."
        fi
    fi
}

# Gerar summary do checkpoint
generate_summary() {
    local action_description="$1"

    log_header "📋 CHECKPOINT SUMMARY"

    cat <<EOF
${GREEN}✅ AÇÃO COMPLETA:${NC} $action_description

${BLUE}📸 EVIDÊNCIA:${NC}
- Git diff: $(git status --short | wc -l | tr -d ' ') arquivo(s) modificado(s)
- Documentado em: $ATTEMPTS_LOG
- Workflow progress: $WORKFLOW_PROGRESS

${CYAN}🔍 VALIDAÇÃO:${NC}
- [x] Ação executada com sucesso
- [x] Evidências capturadas
- [x] Documentado em .context/

${YELLOW}⏸️ STATUS:${NC} AGUARDANDO APROVAÇÃO para próxima ação

EOF
}

# ==================== MAIN ====================

main() {
    # Validar argumentos
    if [ $# -eq 0 ]; then
        log_error "Uso: $0 \"descrição da ação\""
        log_info "Exemplo: $0 \"Adicionar coluna phone_verified na tabela users\""
        exit 1
    fi

    local action_description="$*"

    log_header "🚀 CHECKPOINT - REGRA #13"
    log_info "Branch: $BRANCH"
    log_info "Ação: $action_description"
    log_info "Timestamp: $TIMESTAMP"

    # 1. Inicializar .context/
    init_context

    # 2. Validar ação única
    validate_single_action || {
        log_error "Validação de ação única falhou. Aborting."
        exit 1
    }

    # 3. Capturar evidências
    capture_evidence

    # 4. Documentar em .context/
    log_to_context "$action_description" "SUCCESS"

    # 5. Atualizar workflow progress
    update_workflow_progress "$action_description"

    # 6. Executar checklist
    run_checklist || {
        log_warning "Checklist reprovado. Corrija antes de prosseguir."
        log_to_context "$action_description" "FAILED"
        exit 1
    }

    # 7. Solicitar aprovação
    request_approval

    # 8. Gerar summary
    generate_summary "$action_description"

    log_success "Checkpoint concluído com sucesso! 🎉"
}

# Executar main
main "$@"
