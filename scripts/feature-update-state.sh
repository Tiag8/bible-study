#!/bin/bash
# scripts/feature-update-state.sh
# Atualizar state de uma feature (workflow, fase, status)

set -euo pipefail

# Validar argumentos
if [ $# -lt 2 ]; then
  echo "❌ Uso: ./scripts/feature-update-state.sh <nome> <campo> <valor>"
  echo ""
  echo "   Exemplos:"
  echo "     ./scripts/feature-update-state.sh payment workflow 2b"
  echo "     ./scripts/feature-update-state.sh payment phase 1.5"
  echo "     ./scripts/feature-update-state.sh payment status paused"
  echo "     ./scripts/feature-update-state.sh payment complete-workflow 1"
  echo ""
  echo "   Campos disponíveis:"
  echo "     - workflow: Alterar workflow atual (ex: 1, 2b, 4.5)"
  echo "     - phase: Alterar fase atual (ex: 0, 1.5, GATE 1)"
  echo "     - status: Alterar status (active, paused, blocked, completed, failed)"
  echo "     - complete-workflow: Marcar workflow como completado (adiciona à lista)"
  exit 1
fi

FEATURE_NAME=$1
FIELD=$2
VALUE=${3:-}

FEATURE_PREFIX="feat-${FEATURE_NAME}"
STATE_FILE=".context/${FEATURE_PREFIX}_orchestrator-state.json"

# Colors sourced from lib/colors.sh (DRY principle)
source "$(dirname "$0")/lib/colors.sh"

# Verificar se state existe
if [ ! -f "$STATE_FILE" ]; then
  echo -e "${RED}❌ Erro: Feature não encontrada: $FEATURE_PREFIX${NC}"
  echo -e "${YELLOW}   Inicialize primeiro: ./scripts/feature-init.sh $FEATURE_NAME${NC}"
  exit 1
fi

# Verificar jq
if ! command -v jq &> /dev/null; then
  echo -e "${RED}❌ Erro: jq não instalado. Execute: brew install jq${NC}"
  exit 1
fi

# Timestamp
NOW=$(TZ='America/Sao_Paulo' date -Iseconds)

# Backup state (segurança)
cp "$STATE_FILE" "${STATE_FILE}.bak"

# Atualizar state baseado no campo
case "$FIELD" in
  workflow)
    jq --arg workflow "$VALUE" --arg now "$NOW" \
      '.current_workflow = $workflow | .updated_at = $now' \
      "$STATE_FILE" > tmp && mv tmp "$STATE_FILE"
    echo -e "${GREEN}✅ Workflow atualizado: $VALUE${NC}"
    ;;

  phase)
    jq --arg phase "$VALUE" --arg now "$NOW" \
      '.current_phase = $phase | .updated_at = $now' \
      "$STATE_FILE" > tmp && mv tmp "$STATE_FILE"
    echo -e "${GREEN}✅ Fase atualizada: $VALUE${NC}"
    ;;

  status)
    # Validar status
    if [[ ! "$VALUE" =~ ^(active|paused|blocked|completed|failed)$ ]]; then
      echo -e "${RED}❌ Erro: Status inválido: $VALUE${NC}"
      echo -e "${YELLOW}   Válidos: active, paused, blocked, completed, failed${NC}"
      exit 1
    fi

    jq --arg status "$VALUE" --arg now "$NOW" \
      '.status = $status | .updated_at = $now' \
      "$STATE_FILE" > tmp && mv tmp "$STATE_FILE"
    echo -e "${GREEN}✅ Status atualizado: $VALUE${NC}"
    ;;

  complete-workflow)
    # Adicionar workflow à lista de completados
    jq --arg workflow "$VALUE" --arg now "$NOW" \
      '.workflows_completed += [$workflow] | .updated_at = $now' \
      "$STATE_FILE" > tmp && mv tmp "$STATE_FILE"
    echo -e "${GREEN}✅ Workflow $VALUE marcado como completado${NC}"
    ;;

  *)
    echo -e "${RED}❌ Erro: Campo desconhecido: $FIELD${NC}"
    echo -e "${YELLOW}   Válidos: workflow, phase, status, complete-workflow${NC}"
    exit 1
    ;;
esac

# Mostrar state atualizado
echo ""
echo -e "${BLUE}📊 State atual:${NC}"
jq '.' "$STATE_FILE"
echo ""

echo -e "${CYAN}💡 Ver dashboard: ./scripts/feature-dashboard.sh${NC}"
