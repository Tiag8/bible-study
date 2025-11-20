#!/bin/bash
# validate-screenshot-gate.sh - Valida screenshots ANTES/DEPOIS em workflows
# Parte de: ADR-029 Screenshot-First Development
# Versão: 1.0.0
# Data: 2025-11-20

set -euo pipefail

# ===================================
# CONFIGURAÇÃO
# ===================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCREENSHOTS_DIR="${PROJECT_ROOT}/screenshots"
BEFORE_DIR="${SCREENSHOTS_DIR}/before"
AFTER_DIR="${SCREENSHOTS_DIR}/after"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===================================
# FUNÇÕES
# ===================================

log_error() {
  echo -e "${RED}❌ ERRO: $1${NC}" >&2
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# ===================================
# VALIDAÇÃO: Screenshot ANTES
# ===================================

validate_before_screenshots() {
  log_info "Validando screenshots ANTES (baseline)..."
  echo ""

  # Verificar se diretório existe
  if [[ ! -d "$BEFORE_DIR" ]]; then
    log_error "Diretório screenshots/before/ não existe"
    log_info "Criar com: mkdir -p screenshots/before"
    return 1
  fi

  # Contar screenshots (png, jpg, jpeg)
  local count
  count=$(find "$BEFORE_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) 2>/dev/null | wc -l | tr -d ' ')

  if [[ "$count" -eq 0 ]]; then
    log_error "Nenhum screenshot ANTES encontrado"
    echo ""
    log_info "AÇÃO REQUERIDA:"
    echo "   1. Tirar screenshot ANTES de mudanças (baseline)"
    echo "   2. Salvar em: screenshots/before/"
    echo "   3. Formato: ANTES-[feature]-[componente]-[timestamp].png"
    echo ""
    log_info "Exemplo:"
    echo "   screenshots/before/ANTES-landing-hero-20251120-143022.png"
    echo ""
    log_info "Referências:"
    echo "   - ADR-029: Screenshot-First Development"
    echo "   - Workflow 5a Fase 8: Screenshot Baseline"
    return 1
  fi

  log_success "Screenshots ANTES: $count encontrado(s)"
  echo ""
  log_info "Arquivos:"
  find "$BEFORE_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) 2>/dev/null | while IFS= read -r file; do
    local basename
    basename=$(basename "$file")
    local size
    size=$(ls -lh "$file" | awk '{print $5}')
    echo "   → $basename ($size)"
  done

  return 0
}

# ===================================
# VALIDAÇÃO: Screenshot DEPOIS
# ===================================

validate_after_screenshots() {
  log_info "Validando screenshots DEPOIS (resultado)..."
  echo ""

  # Verificar se diretório existe
  if [[ ! -d "$AFTER_DIR" ]]; then
    log_error "Diretório screenshots/after/ não existe"
    log_info "Criar com: mkdir -p screenshots/after"
    return 1
  fi

  # Contar screenshots
  local count
  count=$(find "$AFTER_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) 2>/dev/null | wc -l | tr -d ' ')

  if [[ "$count" -eq 0 ]]; then
    log_error "Nenhum screenshot DEPOIS encontrado"
    echo ""
    log_info "AÇÃO REQUERIDA:"
    echo "   1. Tirar screenshot DEPOIS de mudanças (resultado)"
    echo "   2. Salvar em: screenshots/after/"
    echo "   3. Formato: DEPOIS-[feature]-[componente]-[timestamp].png"
    echo ""
    log_info "Exemplo:"
    echo "   screenshots/after/DEPOIS-landing-hero-20251120-143522.png"
    echo ""
    log_info "Referências:"
    echo "   - ADR-029: Screenshot-First Development"
    echo "   - Workflow 6a Fase 10: Validação Visual"
    return 1
  fi

  log_success "Screenshots DEPOIS: $count encontrado(s)"
  echo ""
  log_info "Arquivos:"
  find "$AFTER_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) 2>/dev/null | while IFS= read -r file; do
    local basename
    basename=$(basename "$file")
    local size
    size=$(ls -lh "$file" | awk '{print $5}')
    echo "   → $basename ($size)"
  done

  return 0
}

# ===================================
# VALIDAÇÃO: Por Workflow
# ===================================

validate_workflow_5a() {
  echo "================================================"
  echo "📸 Screenshot Gate: Workflow 5a (Implementation)"
  echo "================================================"
  echo ""
  log_info "Validando: Screenshot ANTES (baseline)"
  echo ""

  if validate_before_screenshots; then
    echo ""
    echo "================================================"
    log_success "VALIDAÇÃO COMPLETA - Pode implementar (Fase 10)"
    echo "================================================"
    echo ""
    log_info "Próximo passo:"
    echo "   - Workflow 5a Fase 10: Implementação"
    echo "   - Após implementação: Tirar screenshot DEPOIS"
    return 0
  else
    echo ""
    echo "================================================"
    log_error "VALIDAÇÃO FALHOU - Tirar screenshot ANTES primeiro"
    echo "================================================"
    return 1
  fi
}

validate_workflow_6a() {
  echo "================================================"
  echo "📸 Screenshot Gate: Workflow 6a (Validation)"
  echo "================================================"
  echo ""
  log_info "Validando: Screenshots ANTES + DEPOIS (comparação)"
  echo ""

  local failed=0

  # 1. Validar ANTES
  if ! validate_before_screenshots; then
    failed=1
  fi

  echo ""

  # 2. Validar DEPOIS
  if ! validate_after_screenshots; then
    failed=1
  fi

  if [[ $failed -eq 0 ]]; then
    echo ""
    echo "================================================"
    log_success "VALIDAÇÃO COMPLETA - Pode prosseguir com Reframing Visual (Fase 12.5)"
    echo "================================================"
    echo ""
    log_info "Próximo passo:"
    echo "   - Comparar screenshots ANTES vs DEPOIS"
    echo "   - Identificar mudanças visuais"
    echo "   - Validar alinhamento com requisitos"
    return 0
  else
    echo ""
    echo "================================================"
    log_error "VALIDAÇÃO FALHOU - Screenshots incompletos"
    echo "================================================"
    return 1
  fi
}

validate_workflow_9a() {
  echo "================================================"
  echo "📸 Screenshot Gate: Workflow 9a (Pre-Merge)"
  echo "================================================"
  echo ""
  log_info "Validando: Evidências visuais (não bloqueante)"
  echo ""

  local warnings=0

  # Validar ANTES
  if ! validate_before_screenshots 2>/dev/null; then
    log_warning "Screenshots ANTES ausentes (recomendado para documentação)"
    warnings=$((warnings + 1))
  fi

  echo ""

  # Validar DEPOIS
  if ! validate_after_screenshots 2>/dev/null; then
    log_warning "Screenshots DEPOIS ausentes (recomendado para documentação)"
    warnings=$((warnings + 1))
  fi

  echo ""
  echo "================================================"

  if [[ $warnings -eq 0 ]]; then
    log_success "VALIDAÇÃO COMPLETA - Evidências visuais OK"
  else
    log_warning "VALIDAÇÃO COM AVISOS - $warnings aviso(s) não crítico(s)"
    echo ""
    log_info "Screenshots são RECOMENDADOS (não obrigatórios) para:"
    echo "   - Documentação visual da feature"
    echo "   - ADR illustrations"
    echo "   - CHANGELOG visual diffs"
    echo "   - Pull Request reviews"
  fi

  echo "================================================"
  return 0  # Não bloqueante
}

# ===================================
# EXECUÇÃO PRINCIPAL
# ===================================

usage() {
  echo "Uso: $0 <workflow>"
  echo ""
  echo "Workflows suportados:"
  echo "   5a    - Workflow 5a (Implementation) - Valida screenshots ANTES"
  echo "   6a    - Workflow 6a (Validation) - Valida screenshots ANTES + DEPOIS"
  echo "   9a    - Workflow 9a (Pre-Merge) - Valida evidências (não bloqueante)"
  echo ""
  echo "Exemplos:"
  echo "   $0 5a    # Validar antes de implementar"
  echo "   $0 6a    # Validar antes de Reframing Visual"
  echo "   $0 9a    # Validar evidências pré-merge"
  exit 1
}

main() {
  if [[ $# -eq 0 ]]; then
    usage
  fi

  local workflow="$1"

  case "$workflow" in
    5a)
      validate_workflow_5a
      ;;
    6a)
      validate_workflow_6a
      ;;
    9a)
      validate_workflow_9a
      ;;
    *)
      log_error "Workflow desconhecido: $workflow"
      echo ""
      usage
      ;;
  esac
}

# Executar
main "$@"
