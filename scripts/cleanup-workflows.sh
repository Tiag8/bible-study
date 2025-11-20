#!/bin/bash

################################################################################
#
# CLEANUP WORKFLOWS - Limpeza Segura de Workflows Duplicados
#
# Descrição:
#   Script seguro para mover workflows obsoletos para backup e deletar
#   arquivos vazios/incompletos.
#
#   - Cria backup ANTES de deletar
#   - Valida cada ação
#   - Preserva histórico em .backup/
#   - Log detalhado de operações
#
# Uso:
#   ./scripts/cleanup-workflows.sh [--dry-run] [--force]
#
# Opções:
#   --dry-run  : Simular ações sem executar (validação segura)
#   --force    : Executar sem confirmação
#
# Exemplo:
#   ./scripts/cleanup-workflows.sh --dry-run       # Testar
#   ./scripts/cleanup-workflows.sh --force         # Executar
#   ./scripts/cleanup-workflows.sh                 # Interativo
#
# Autor: Claude Code
# Data: 2025-11-18
# Version: 1.0
#
################################################################################

set -e

# Configuração
WORKFLOWS_DIR=".windsurf/workflows"
BACKUP_DIR="$WORKFLOWS_DIR/.backup"
DRY_RUN=false
FORCE=false
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="cleanup-workflows_${TIMESTAMP}.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
BACKUP_COUNT=0
DELETE_COUNT=0
SKIP_COUNT=0

################################################################################
# FUNÇÕES UTILITÁRIAS
################################################################################

log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

print_header() {
  echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
  log "SUCCESS" "$1"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
  log "WARNING" "$1"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
  log "ERROR" "$1"
}

confirm() {
  if [ "$FORCE" = true ]; then
    return 0
  fi

  local prompt="$1"
  local response

  echo -n -e "${YELLOW}$prompt (y/n): ${NC}"
  read -r response

  if [[ "$response" =~ ^[Yy]$ ]]; then
    return 0
  else
    return 1
  fi
}

file_exists() {
  [ -f "$1" ]
}

get_file_size() {
  local size=$(wc -l < "$1" 2>/dev/null || echo 0)
  echo "$size"
}

################################################################################
# VALIDAÇÕES PRÉ-LIMPEZA
################################################################################

validate_environment() {
  print_header "VALIDAÇÃO DO AMBIENTE"

  # Verificar diretório workflows
  if [ ! -d "$WORKFLOWS_DIR" ]; then
    print_error "Diretório '$WORKFLOWS_DIR' não encontrado!"
    exit 1
  fi
  print_success "Diretório workflows encontrado"

  # Verificar se é um repo git
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Não é um repositório git!"
    exit 1
  fi
  print_success "Repositório git válido"

  # Criar backup dir se não existir
  if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    print_success "Pasta backup criada: $BACKUP_DIR"
  else
    print_success "Pasta backup existe: $BACKUP_DIR"
  fi

  # Verificar status git
  if ! git diff --quiet; then
    print_warning "Você tem mudanças não commitadas no git"
    if ! confirm "Continuar mesmo assim?"; then
      print_error "Operação cancelada"
      exit 1
    fi
  fi
}

################################################################################
# LIMPEZA DE WORKFLOWS
################################################################################

move_to_backup() {
  local file=$1
  local reason=$2
  local full_path="$WORKFLOWS_DIR/$file"

  if ! file_exists "$full_path"; then
    print_warning "Arquivo não encontrado: $file"
    ((SKIP_COUNT++))
    return 1
  fi

  local size=$(get_file_size "$full_path")

  if [ "$DRY_RUN" = true ]; then
    echo "   [DRY-RUN] Mover: $file ($size linhas) -> .backup/"
    echo "   Razão: $reason"
    log "DRY_RUN_MOVE" "$file ($size linhas) - Razão: $reason"
  else
    mv "$full_path" "$BACKUP_DIR/"
    print_success "Movido para backup: $file ($size linhas)"
    log "MOVE_BACKUP" "$file ($size linhas) - Razão: $reason"
    ((BACKUP_COUNT++))
  fi
}

delete_empty_file() {
  local file=$1
  local reason=$2
  local full_path="$WORKFLOWS_DIR/$file"

  if ! file_exists "$full_path"; then
    print_warning "Arquivo não encontrado: $file"
    ((SKIP_COUNT++))
    return 1
  fi

  local size=$(get_file_size "$full_path")

  if [ "$DRY_RUN" = true ]; then
    echo "   [DRY-RUN] Deletar: $file ($size linhas)"
    echo "   Razão: $reason"
    log "DRY_RUN_DELETE" "$file ($size linhas) - Razão: $reason"
  else
    # Backup antes de deletar
    cp "$full_path" "$BACKUP_DIR/${file}.deleted_${TIMESTAMP}"
    rm "$full_path"
    print_success "Deletado: $file ($size linhas) [Cópia em .backup/]"
    log "DELETE_FILE" "$file ($size linhas) - Razão: $reason"
    ((DELETE_COUNT++))
  fi
}

################################################################################
# PLANO DE LIMPEZA
################################################################################

show_cleanup_plan() {
  print_header "PLANO DE LIMPEZA"

  cat << 'EOF'
GRUPOS DE WORKFLOWS DUPLICADOS:

[GRUPO 6] User Validation
  ├─ 6 (v1 - 262 linhas) → MOVER PARA BACKUP (substituído por 6a)
  ├─ 6a (v2 - 856 linhas) → MANTER (versão final)
  └─ 6b (RCA - 637 linhas) → MANTER (extensão)

[GRUPO 7] Quality Gates
  ├─ 7 (v1 - 296 linhas) → MOVER PARA BACKUP (substituído por 7a)
  ├─ 7a (v2 - 648 linhas) → MANTER (versão final)
  └─ 7b (RCA - 580 linhas) → MANTER (extensão)

[GRUPO 8] Meta-Learning
  ├─ 8 (v1 - 304 linhas) → MOVER PARA BACKUP (substituído por 8a)
  ├─ 8a (v2 - 443 linhas) → MANTER (versão final)
  └─ 8b (Análise - 358 linhas) → MANTER (extensão)

[GRUPO 9] Finalization
  ├─ 9 (v1 - 234 linhas) → MOVER PARA BACKUP (substituído por 9a)
  ├─ 9a (v2 - 678 linhas) → MANTER (versão final)
  └─ 9b (Retrospectiva - 460 linhas) → MANTER (extensão)

[GRUPO 11c] VPS Monitoring
  ├─ 11c1 (v1 - 240 linhas) → MOVER PARA BACKUP (substituído por 11c1a)
  ├─ 11c1a (v2 - 438 linhas) → MANTER (versão final)
  ├─ 11c1b (RCA - 409 linhas) → MANTER (extensão)
  └─ 11c2 (Docs - 434 linhas) → MANTER (related)

[GRUPO 13] Post-Deploy
  ├─ 13 (v1 - 410 linhas) → MOVER PARA BACKUP (substituído por 13a)
  ├─ 13a (v2 - 401 linhas) → MANTER (com Playwright)
  └─ 13b (Métricas - 592 linhas) → MANTER (extensão)

[ARQUIVOS VAZIOS]
  └─ 11a2 (24 linhas) → DELETAR (incompleto)

RESULTADO:
  • 6 workflows movidos para .backup/
  • 1 arquivo deletado
  • 27 workflows mantidos (estrutura linear clara)
  • Histórico preservado em .backup/

EOF
}

execute_cleanup() {
  print_header "EXECUTANDO LIMPEZA"

  # Grupo 6: User Validation
  echo -e "\n${BLUE}[GRUPO 6] User Validation${NC}"
  move_to_backup "add-feature-6-user-validation.md" "Substituído por versão 6a (856 linhas vs 262)"

  # Grupo 7: Quality Gates
  echo -e "\n${BLUE}[GRUPO 7] Quality Gates${NC}"
  move_to_backup "add-feature-7-quality.md" "Substituído por versão 7a (648 linhas vs 296)"

  # Grupo 8: Meta-Learning
  echo -e "\n${BLUE}[GRUPO 8] Meta-Learning${NC}"
  move_to_backup "add-feature-8-meta-learning.md" "Substituído por versão 8a (443 linhas vs 304)"

  # Grupo 9: Finalization
  echo -e "\n${BLUE}[GRUPO 9] Finalization${NC}"
  move_to_backup "add-feature-9-finalization.md" "Substituído por versão 9a (678 linhas vs 234)"

  # Grupo 11c: VPS Monitoring
  echo -e "\n${BLUE}[GRUPO 11c] VPS Monitoring${NC}"
  move_to_backup "add-feature-11c1-vps-monitoring.md" "Substituído por versão 11c1a (438 linhas vs 240)"

  # Grupo 13: Post-Deploy
  echo -e "\n${BLUE}[GRUPO 13] Post-Deploy${NC}"
  move_to_backup "add-feature-13-post-deploy.md" "Substituído por versão 13a com Playwright (401 linhas)"

  # Arquivos vazios
  echo -e "\n${BLUE}[ARQUIVOS VAZIOS]${NC}"
  delete_empty_file "add-feature-11a2-vps-deployment-prep-part2.md" "Incompleto (24 linhas)"
}

################################################################################
# VALIDAÇÃO PÓS-LIMPEZA
################################################################################

validate_after_cleanup() {
  print_header "VALIDAÇÃO PÓS-LIMPEZA"

  local active_count=$(find "$WORKFLOWS_DIR" -maxdepth 1 -name "add-feature-*.md" -type f | wc -l)
  local backup_count=$(find "$BACKUP_DIR" -maxdepth 1 -name "add-feature-*.md" -type f | wc -l)

  echo -e "Workflows ATIVOS: ${GREEN}$active_count${NC}"
  echo -e "Workflows em BACKUP: ${GREEN}$backup_count${NC}"

  # Verificar estrutura esperada
  local expected_active=(
    "add-feature-1-planning.md"
    "add-feature-2a-solutions.md"
    "add-feature-2b-technical-design.md"
    "add-feature-3-risk-analysis.md"
    "add-feature-4-setup.md"
    "add-feature-4.5-pre-implementation-gates.md"
    "add-feature-5a-implementation.md"
    "add-feature-5b-refactoring-rca.md"
    "add-feature-6a-user-validation.md"
    "add-feature-6b-rca-edge-cases.md"
    "add-feature-7a-quality-gates.md"
    "add-feature-7b-rca-security.md"
    "add-feature-8a-meta-learning.md"
    "add-feature-8b-pareto-analysis.md"
    "add-feature-9a-finalization.md"
    "add-feature-9b-retrospective.md"
    "add-feature-10-template-sync.md"
    "add-feature-11a-vps-deployment-prep.md"
    "add-feature-11b-vps-deployment-exec.md"
    "add-feature-11c1a-vps-monitoring.md"
    "add-feature-11c1b-rca-rollback.md"
    "add-feature-11c2-vps-rollback-docs.md"
    "add-feature-13a-post-deploy.md"
    "add-feature-13b-rca-metrics.md"
    "add-feature-14-meta-learning-consolidation.md"
    "add-feature-fast-track-critical-bug.md"
    "add-feature.md"
  )

  echo -e "\n${BLUE}Verificando estrutura esperada:${NC}"
  local missing=0
  for file in "${expected_active[@]}"; do
    if [ -f "$WORKFLOWS_DIR/$file" ]; then
      print_success "Encontrado: $file"
    else
      print_warning "FALTANDO: $file"
      ((missing++))
    fi
  done

  if [ $missing -eq 0 ]; then
    print_success "Estrutura de workflows validada!"
  else
    print_warning "$missing arquivos faltando na estrutura"
  fi
}

show_summary() {
  print_header "RESUMO DA OPERAÇÃO"

  echo -e "Operação: ${BLUE}$([ "$DRY_RUN" = true ] && echo "DRY-RUN" || echo "EXECUTADA")${NC}"
  echo -e "Timestamp: ${BLUE}$TIMESTAMP${NC}"
  echo -e "Log: ${BLUE}$LOG_FILE${NC}"
  echo ""
  echo -e "Arquivos MOVIDOS para backup: ${GREEN}$BACKUP_COUNT${NC}"
  echo -e "Arquivos DELETADOS: ${GREEN}$DELETE_COUNT${NC}"
  echo -e "Arquivos PULADOS: ${YELLOW}$SKIP_COUNT${NC}"
  echo ""

  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Este foi um DRY-RUN. Nenhuma ação foi executada.${NC}"
    echo -e "Execute novamente SEM --dry-run para aplicar as mudanças."
  else
    echo -e "${GREEN}Limpeza completada com sucesso!${NC}"
    echo -e "Revise os arquivos movidos em: ${BLUE}$BACKUP_DIR${NC}"
  fi
}

################################################################################
# MAIN
################################################################################

main() {
  # Parse argumentos
  while [[ $# -gt 0 ]]; do
    case $1 in
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --force)
        FORCE=true
        shift
        ;;
      --help)
        echo "Uso: ./scripts/cleanup-workflows.sh [--dry-run] [--force] [--help]"
        exit 0
        ;;
      *)
        echo "Argumento desconhecido: $1"
        echo "Use --help para ajuda"
        exit 1
        ;;
    esac
  done

  # Header
  clear
  echo -e "${BLUE}"
  cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                   CLEANUP WORKFLOWS - Limpeza Segura                     ║
║                                                                           ║
║  Remove workflows obsoletos e reorganiza estrutura de forma segura        ║
║  Todos os arquivos são backed-up antes de serem deletados                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
EOF
  echo -e "${NC}\n"

  # Executar etapas
  validate_environment
  show_cleanup_plan

  if [ "$DRY_RUN" = true ]; then
    print_header "MODO DRY-RUN (Simulação)"
  fi

  if ! confirm "Continuar com limpeza?"; then
    print_error "Operação cancelada pelo usuário"
    exit 0
  fi

  execute_cleanup
  validate_after_cleanup
  show_summary

  exit 0
}

# Executar
main "$@"
