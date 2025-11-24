#!/bin/bash
# scripts/feature-dashboard.sh
# Dashboard CLI para visualizar status de múltiplas features em desenvolvimento

set -euo pipefail

# Colors sourced from lib/colors.sh (DRY principle)
source "$(dirname "$0")/lib/colors.sh"

# Função para formatar timestamp relativo (ex: "2h 30min ago")
relative_time() {
  local timestamp="$1"
  local now=$(date +%s)
  local then=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${timestamp%Z*}" +%s 2>/dev/null || echo "$now")
  local diff=$((now - then))

  if [ $diff -lt 60 ]; then
    echo "${diff}s ago"
  elif [ $diff -lt 3600 ]; then
    echo "$((diff / 60))min ago"
  elif [ $diff -lt 86400 ]; then
    local hours=$((diff / 3600))
    local mins=$(((diff % 3600) / 60))
    echo "${hours}h ${mins}min ago"
  else
    local days=$((diff / 86400))
    echo "${days}d ago"
  fi
}

# Função para cor baseada em status
status_color() {
  case "$1" in
    active) echo -e "${GREEN}" ;;
    paused) echo -e "${YELLOW}" ;;
    blocked) echo -e "${RED}" ;;
    completed) echo -e "${CYAN}" ;;
    failed) echo -e "${PURPLE}" ;;
    *) echo -e "${NC}" ;;
  esac
}

# Cabeçalho
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   FEATURE ORCHESTRATOR DASHBOARD                         ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
printf "${BLUE}║${NC} %-20s %-10s %-10s %-12s %-18s ${BLUE}║${NC}\n" "Feature" "Status" "Workflow" "Phase" "Updated"
echo -e "${BLUE}╠══════════════════════════════════════════════════════════════════════════╣${NC}"

# Contadores
total=0
active=0
paused=0
blocked=0
completed=0
failed=0

# Listar todas features
for state_file in .context/*_orchestrator-state.json; do
  # Skip se não existir
  if [ ! -f "$state_file" ]; then
    continue
  fi

  total=$((total + 1))

  # Parse JSON (requer jq)
  if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Erro: jq não instalado. Execute: brew install jq${NC}"
    exit 1
  fi

  feature=$(jq -r '.feature' "$state_file")
  status=$(jq -r '.status' "$state_file")
  workflow=$(jq -r '.current_workflow' "$state_file")
  phase=$(jq -r '.current_phase // "N/A"' "$state_file")
  updated=$(jq -r '.updated_at' "$state_file")
  gate=$(jq -r '.gate.trigger // ""' "$state_file")

  # Truncar nomes longos
  feature_short="${feature:0:18}"
  phase_short="${phase:0:10}"

  # Incrementar contadores
  case "$status" in
    active) active=$((active + 1)) ;;
    paused) paused=$((paused + 1)) ;;
    blocked) blocked=$((blocked + 1)) ;;
    completed) completed=$((completed + 1)) ;;
    failed) failed=$((failed + 1)) ;;
  esac

  # Formatar tempo relativo
  relative=$(relative_time "$updated")

  # Imprimir linha
  color=$(status_color "$status")
  printf "${BLUE}║${NC} %-20s ${color}%-10s${NC} %-10s %-12s %-18s ${BLUE}║${NC}\n" \
    "$feature_short" "$status" "$workflow" "$phase_short" "$relative"

  # Mostrar gate se existir
  if [ -n "$gate" ]; then
    printf "${BLUE}║${NC} ${YELLOW}    🚦 Gate: %-60s${NC} ${BLUE}║${NC}\n" "$gate"
  fi
done

# Rodapé
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Resumo
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "   Total: $total features"
echo -e "   ${GREEN}Active: $active${NC} | ${YELLOW}Paused: $paused${NC} | ${RED}Blocked: $blocked${NC} | ${CYAN}Completed: $completed${NC} | ${PURPLE}Failed: $failed${NC}"
echo ""

# Action items (features bloqueadas ou pausadas)
if [ $paused -gt 0 ] || [ $blocked -gt 0 ]; then
  echo -e "${YELLOW}⏸️  Action Required:${NC}"

  for state_file in .context/*_orchestrator-state.json; do
    if [ ! -f "$state_file" ]; then continue; fi

    feature=$(jq -r '.feature' "$state_file")
    status=$(jq -r '.status' "$state_file")
    gate=$(jq -r '.gate.trigger // ""' "$state_file")
    reached=$(jq -r '.gate.reached_at // ""' "$state_file")

    if [ "$status" = "paused" ] || [ "$status" = "blocked" ]; then
      if [ -n "$reached" ]; then
        wait_time=$(relative_time "$reached")
      else
        wait_time="N/A"
      fi

      echo -e "   - ${YELLOW}$feature${NC}: $gate (waiting $wait_time)"
    fi
  done
  echo ""
fi

# Comando ajuda
echo -e "${CYAN}💡 Comandos úteis:${NC}"
echo -e "   ./scripts/feature-init.sh <nome>        # Criar nova feature"
echo -e "   ./scripts/feature-update-state.sh <nome> status active   # Retomar feature pausada"
echo -e "   cat .context/<nome>_orchestrator-state.json | jq   # Ver state detalhado"
echo ""
