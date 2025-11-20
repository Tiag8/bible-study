#!/bin/bash
# Script: validate-context-updates.sh
# Propósito: Valida se .context/ foi atualizado adequadamente conforme .context/INDEX.md
# Uso: ./scripts/validate-context-updates.sh [--help]
# Exit: 0 se todos checks passam, 1 se algum falha

set -e
trap cleanup EXIT

# --- Configuration ---
SCRIPT_NAME=$(basename "$0")
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
CONTEXT_DIR="$PROJECT_ROOT/.context"
# --- End Configuration ---

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
# --- End Colors ---

# --- Global Variables ---
ERRORS_FOUND=0
WARNINGS_FOUND=0
declare -a CHECK_RESULTS # Array para armazenar resultados
CURRENT_BRANCH=""
BRANCH_SLUG=""
# --- End Global Variables ---

# --- Logging Functions ---
log_info() { echo -e "${BLUE}🔍${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠️${NC} $1"; WARNINGS_FOUND=$((WARNINGS_FOUND + 1)); }
log_error() { echo -e "${RED}❌${NC} $1"; ERRORS_FOUND=$((ERRORS_FOUND + 1)); }
log_success() { echo -e "${GREEN}✅${NC} $1"; }
# --- End Logging Functions ---

# --- Utility Functions ---
cleanup() {
  : # No cleanup needed
}

get_current_branch() {
  local branch=$(cd "$PROJECT_ROOT" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  if [ -z "$branch" ]; then
    log_error "Não foi possível detectar branch Git atual"
    exit 1
  fi
  echo "$branch"
}

get_branch_slug() {
  local branch="$1"
  # Converter "/" em "-" para criar slug
  echo "$branch" | sed 's/\//-/g'
}

print_header() {
  echo ""
  echo -e "${BLUE}===========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===========================================${NC}"
  echo ""
}

print_help() {
  cat << EOF
$SCRIPT_NAME - Valida se .context/ foi atualizado adequadamente

Uso: $SCRIPT_NAME [--help]

Opções:
  --help              Exibe esta mensagem de ajuda

Descrição:
  Este script verifica se os arquivos em .context/ foram atualizados
  conforme exigido pelas convenções do projeto:

  - INDEX.md (obrigatório, sempre)
  - {branch}_workflow-progress.md (obrigatório, < 10min)
  - {branch}_temp-memory.md (obrigatório, > 100 bytes)
  - {branch}_decisions.md (obrigatório, contém "**Decisão:**")
  - {branch}_attempts.log (obrigatório, < 10min)
  - {branch}_validation-loop.md (obrigatório, > 0 bytes)

Exit Codes:
  0 = Todos os checks passaram
  1 = Um ou mais checks falharam

Exemplos:
  # Validar branch atual
  ./scripts/validate-context-updates.sh

  # Ver ajuda
  ./scripts/validate-context-updates.sh --help

EOF
}

file_exists_and_not_empty() {
  local file_path="$1"
  [ -f "$file_path" ] && [ -s "$file_path" ]
  return $?
}

file_exists() {
  local file_path="$1"
  [ -f "$file_path" ]
  return $?
}

get_file_age_minutes() {
  local file_path="$1"
  if [ ! -f "$file_path" ]; then
    echo "-1"
    return 1
  fi

  local current_time=$(date +%s)
  local file_mod_time=$(stat -f "%m" "$file_path" 2>/dev/null || stat -c "%Y" "$file_path" 2>/dev/null)

  if [ -z "$file_mod_time" ]; then
    echo "-1"
    return 1
  fi

  local age_seconds=$((current_time - file_mod_time))
  echo $((age_seconds / 60))
}

file_contains_pattern() {
  local file_path="$1"
  local pattern="$2"

  if [ ! -f "$file_path" ]; then
    return 1
  fi

  grep -q "$pattern" "$file_path"
  return $?
}

get_file_size_bytes() {
  local file_path="$1"
  if [ ! -f "$file_path" ]; then
    echo "0"
    return 1
  fi
  stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0"
}

# --- End Utility Functions ---

# --- Validation Functions ---

check_1_index_exists() {
  local check_name="CHECK 1: INDEX.md existe"
  local index_file="$CONTEXT_DIR/INDEX.md"

  if file_exists "$index_file"; then
    if grep -q "^#" "$index_file" 2>/dev/null; then
      CHECK_RESULTS+=("PASS|$check_name: Arquivo encontrado com seções válidas")
      log_success "$check_name"
      return 0
    else
      CHECK_RESULTS+=("FAIL|$check_name: Arquivo existe mas sem seções markdown")
      log_error "$check_name - arquivo vazio ou sem seções"
      return 1
    fi
  else
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo não encontrado")
    log_error "$check_name"
    return 1
  fi
}

check_2_workflow_progress() {
  local check_name="CHECK 2: workflow-progress.md existe + timestamp < 10min"
  local workflow_file="$CONTEXT_DIR/${BRANCH_SLUG}_workflow-progress.md"

  if ! file_exists "$workflow_file"; then
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo não encontrado")
    log_error "$check_name"
    return 1
  fi

  local age_minutes=$(get_file_age_minutes "$workflow_file")

  if [ "$age_minutes" -lt 10 ]; then
    CHECK_RESULTS+=("PASS|$check_name: Timestamp recente ($age_minutes min)")
    log_success "$check_name (${age_minutes}min)"
    return 0
  elif [ "$age_minutes" -lt 60 ]; then
    CHECK_RESULTS+=("WARN|$check_name: Arquivo desatualizado ($age_minutes min)")
    log_warn "$check_name - arquivo com $age_minutes minutos"
    return 1
  else
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo muito antigo ($age_minutes min)")
    log_error "$check_name - arquivo com $age_minutes minutos (> 1h)"
    return 1
  fi
}

check_3_temp_memory() {
  local check_name="CHECK 3: temp-memory.md existe + tamanho > 100 bytes"
  local temp_memory_file="$CONTEXT_DIR/${BRANCH_SLUG}_temp-memory.md"

  if ! file_exists "$temp_memory_file"; then
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo não encontrado")
    log_error "$check_name"
    return 1
  fi

  local file_size=$(get_file_size_bytes "$temp_memory_file")

  if [ "$file_size" -gt 100 ]; then
    CHECK_RESULTS+=("PASS|$check_name: Arquivo com conteúdo ($file_size bytes)")
    log_success "$check_name (${file_size}B)"
    return 0
  elif [ "$file_size" -gt 0 ]; then
    CHECK_RESULTS+=("WARN|$check_name: Arquivo muito pequeno ($file_size bytes)")
    log_warn "$check_name - apenas $file_size bytes"
    return 1
  else
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo vazio")
    log_error "$check_name"
    return 1
  fi
}

check_4_decisions() {
  local check_name="CHECK 4: decisions.md existe + contém '**Decisão:**'"
  local decisions_file="$CONTEXT_DIR/${BRANCH_SLUG}_decisions.md"

  if ! file_exists "$decisions_file"; then
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo não encontrado")
    log_error "$check_name"
    return 1
  fi

  if file_contains_pattern "$decisions_file" "\*\*Decisão:\*\*"; then
    CHECK_RESULTS+=("PASS|$check_name: Padrão encontrado")
    log_success "$check_name"
    return 0
  else
    CHECK_RESULTS+=("FAIL|$check_name: Padrão '**Decisão:**' não encontrado")
    log_error "$check_name"
    return 1
  fi
}

check_5_attempts_log() {
  local check_name="CHECK 5: attempts.log existe + timestamp < 10min"
  local attempts_file="$CONTEXT_DIR/${BRANCH_SLUG}_attempts.log"

  if ! file_exists "$attempts_file"; then
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo não encontrado")
    log_error "$check_name"
    return 1
  fi

  local age_minutes=$(get_file_age_minutes "$attempts_file")

  if [ "$age_minutes" -lt 10 ]; then
    CHECK_RESULTS+=("PASS|$check_name: Timestamp recente ($age_minutes min)")
    log_success "$check_name (${age_minutes}min)"
    return 0
  elif [ "$age_minutes" -lt 60 ]; then
    CHECK_RESULTS+=("WARN|$check_name: Arquivo desatualizado ($age_minutes min)")
    log_warn "$check_name - arquivo com $age_minutes minutos"
    return 1
  else
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo muito antigo ($age_minutes min)")
    log_error "$check_name - arquivo com $age_minutes minutos (> 1h)"
    return 1
  fi
}

check_6_validation_loop() {
  local check_name="CHECK 6: validation-loop.md existe + NOT empty"
  local validation_file="$CONTEXT_DIR/${BRANCH_SLUG}_validation-loop.md"

  if ! file_exists "$validation_file"; then
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo não encontrado")
    log_error "$check_name"
    return 1
  fi

  local file_size=$(get_file_size_bytes "$validation_file")

  if [ "$file_size" -gt 0 ]; then
    CHECK_RESULTS+=("PASS|$check_name: Arquivo com conteúdo ($file_size bytes)")
    log_success "$check_name (${file_size}B)"
    return 0
  else
    CHECK_RESULTS+=("FAIL|$check_name: Arquivo vazio")
    log_error "$check_name"
    return 1
  fi
}

check_7_meta_learning() {
  local check_name="CHECK 7: meta-learning.md existe + NOT empty"
  local meta_learning_file="$CONTEXT_DIR/${BRANCH_SLUG}_meta-learning.md"

  if ! file_exists "$meta_learning_file"; then
    CHECK_RESULTS+=("WARN|$check_name: Arquivo não encontrado (opcional)")
    log_warn "$check_name - arquivo opcional"
    return 0
  fi

  local file_size=$(get_file_size_bytes "$meta_learning_file")

  if [ "$file_size" -gt 0 ]; then
    CHECK_RESULTS+=("PASS|$check_name: Arquivo com conteúdo ($file_size bytes)")
    log_success "$check_name (${file_size}B)"
    return 0
  else
    CHECK_RESULTS+=("WARN|$check_name: Arquivo vazio (opcional)")
    log_warn "$check_name - arquivo vazio"
    return 0
  fi
}

# --- End Validation Functions ---

print_summary() {
  print_header "Relatório Final"

  local total_checks=${#CHECK_RESULTS[@]}
  local passed=0
  local warned=0

  echo -e "${CYAN}📋 Resumo dos Validações:${NC}"
  echo ""

  for result in "${CHECK_RESULTS[@]}"; do
    IFS='|' read -r status message <<< "$result"
    case "$status" in
      "PASS")
        log_success "$message"
        ((passed++))
        ;;
      "WARN")
        log_warn "$message"
        ((warned++))
        ;;
      "FAIL")
        log_error "$message"
        ;;
    esac
  done

  echo ""
  echo -e "${CYAN}📊 Estatísticas:${NC}"
  echo -e "  ${GREEN}✅ Passed:${NC}  $passed/$total_checks"
  echo -e "  ${YELLOW}⚠️ Warned:${NC}  $warned"
  echo -e "  ${RED}❌ Failed:${NC}  $ERRORS_FOUND"
  echo ""

  echo -e "${CYAN}🌿 Branch Atual:${NC} $CURRENT_BRANCH"
  echo -e "${CYAN}📂 Context Dir:${NC} $CONTEXT_DIR"
  echo ""
}

# --- Main Logic ---
main() {
  if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    print_help
    exit 0
  fi

  print_header "Validando Atualizações de .context/"

  # Detectar branch atual
  CURRENT_BRANCH=$(get_current_branch)
  BRANCH_SLUG=$(get_branch_slug "$CURRENT_BRANCH")

  log_info "Branch atual: $CURRENT_BRANCH"
  log_info "Branch slug: $BRANCH_SLUG"
  log_info "Context dir: $CONTEXT_DIR"
  echo ""

  # Executar todas as validações
  check_1_index_exists
  check_2_workflow_progress
  check_3_temp_memory
  check_4_decisions
  check_5_attempts_log
  check_6_validation_loop
  check_7_meta_learning

  # Imprimir resumo
  print_summary

  # Determinar exit code
  if [ "$ERRORS_FOUND" -gt 0 ]; then
    echo -e "${RED}❌ VALIDAÇÃO FALHOU com $ERRORS_FOUND erros${NC}"
    exit 1
  elif [ "$WARNINGS_FOUND" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  VALIDAÇÃO CONCLUÍDA com $WARNINGS_FOUND avisos${NC}"
    exit 0  # Avisos não bloqueiam
  else
    echo -e "${GREEN}✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO${NC}"
    exit 0
  fi
}

# Executar função main
main "$@"
