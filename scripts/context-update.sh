#!/bin/bash
# context-update.sh - Quick helper to update .context/ files
# Based on .context/INDEX.md checklist
# Usage: ./scripts/context-update.sh [file] [action]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config
CONTEXT_DIR=".context"
TIMEZONE="America/Sao_Paulo"

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Check if .context/ exists
if [ ! -d "$CONTEXT_DIR" ]; then
  echo -e "${RED}❌ .context/ não existe. Execute ./scripts/context-init.sh primeiro.${NC}"
  exit 1
fi

# Show usage
usage() {
  cat <<EOF
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${GREEN}context-update.sh${NC} - Quick helper para atualizar .context/
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${YELLOW}Usage:${NC}
  ./scripts/context-update.sh [file] [action] [message]

${YELLOW}Files:${NC}
  workflow     - workflow-progress.md
  temp         - temp-memory.md
  decisions    - decisions.md
  validation   - validation-loop.md
  attempts     - attempts.log

${YELLOW}Actions:${NC}
  ${GREEN}workflow${NC}:
    start <N>     - Marcar Workflow N como START
    complete <N>  - Marcar Workflow N como COMPLETO

  ${GREEN}temp${NC}:
    state <msg>   - Atualizar "Estado Atual"
    next <msg>    - Atualizar "Próximos Passos"
    block <msg>   - Adicionar bloqueio

  ${GREEN}decisions${NC}:
    add <msg>     - Adicionar decisão

  ${GREEN}validation${NC}:
    iter <N> <SUCESSO|FALHA> <msg> - Adicionar iteração

  ${GREEN}attempts${NC}:
    log <msg>     - Adicionar log entry
    success <msg> - Log sucesso
    fail <msg>    - Log falha

${YELLOW}Examples:${NC}
  ./scripts/context-update.sh workflow start 5a
  ./scripts/context-update.sh temp state "Implementando validação de campos"
  ./scripts/context-update.sh decisions add "Usar Gemini native parsing (não criar parser custom)"
  ./scripts/context-update.sh validation iter 3 SUCESSO "Parsing funcionou após ajuste prompt"
  ./scripts/context-update.sh attempts success "Migration aplicada com sucesso"

${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
EOF
  exit 1
}

# Get timestamp
timestamp() {
  TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M'
}

# Update workflow-progress.md
update_workflow() {
  local file="${CONTEXT_DIR}/${BRANCH}_workflow-progress.md"
  local action="$1"
  local workflow="$2"
  local msg="${3:-}"

  case "$action" in
    start)
      cat >> "$file" <<EOF

### Workflow $workflow: [Nome] 🔄 EM ANDAMENTO
- **Data**: $(timestamp) -03
- **Status**: START
EOF
      echo -e "${GREEN}✅ Workflow $workflow marcado como START${NC}"
      ;;

    complete)
      # Find workflow section and update
      sed -i.bak "s/### Workflow $workflow:.*🔄 EM ANDAMENTO/### Workflow $workflow: [Nome] ✅ COMPLETO/" "$file"
      rm "${file}.bak"

      # Add completion timestamp
      cat >> "$file" <<EOF
- **Completed**: $(timestamp) -03
- **Next**: $msg
EOF
      echo -e "${GREEN}✅ Workflow $workflow marcado como COMPLETO${NC}"
      ;;

    *)
      echo -e "${RED}❌ Ação inválida: $action${NC}"
      usage
      ;;
  esac
}

# Update temp-memory.md
update_temp() {
  local file="${CONTEXT_DIR}/${BRANCH}_temp-memory.md"
  local action="$1"
  local msg="$2"

  case "$action" in
    state)
      # Find "Estado Atual" section and append
      cat >> "$file" <<EOF

**[$(timestamp) -03]**: $msg
EOF
      echo -e "${GREEN}✅ Estado Atual atualizado${NC}"
      ;;

    next)
      # Find "Próximos Passos" section and append
      cat >> "$file" <<EOF

- [ ] $msg
EOF
      echo -e "${GREEN}✅ Próximos Passos atualizado${NC}"
      ;;

    block)
      # Find "Bloqueios" section and append
      cat >> "$file" <<EOF

- **[$(timestamp) -03]**: $msg
EOF
      echo -e "${GREEN}✅ Bloqueio adicionado${NC}"
      ;;

    *)
      echo -e "${RED}❌ Ação inválida: $action${NC}"
      usage
      ;;
  esac
}

# Update decisions.md
update_decisions() {
  local file="${CONTEXT_DIR}/${BRANCH}_decisions.md"
  local msg="$1"

  cat >> "$file" <<EOF

## Decisão [$(timestamp) -03]

**Decisão**: $msg

**Por quê**: [preencher]

**Trade-off**: [preencher]

**Alternativas consideradas**: [preencher]

EOF
  echo -e "${GREEN}✅ Decisão adicionada (preencha detalhes!)${NC}"
}

# Update validation-loop.md
update_validation() {
  local file="${CONTEXT_DIR}/${BRANCH}_validation-loop.md"
  local iter="$1"
  local status="$2"
  local msg="$3"

  local emoji=""
  if [ "$status" = "SUCESSO" ]; then
    emoji="✅"
  else
    emoji="❌"
  fi

  cat >> "$file" <<EOF

### Iteração $iter ($emoji $status)
- **Data**: $(timestamp) -03
- **Tentativa**: $msg
- **Resultado**: [preencher]
$([ "$status" = "FALHA" ] && echo "- **Erro**: [preencher]" || echo "")
$([ "$status" = "FALHA" ] && echo "- **Causa Root**: [preencher]" || echo "")
$([ "$status" = "FALHA" ] && echo "- **Próxima tentativa**: [preencher]" || echo "")

EOF
  echo -e "${GREEN}✅ Iteração $iter adicionada (preencha detalhes!)${NC}"
}

# Update attempts.log
update_attempts() {
  local file="${CONTEXT_DIR}/${BRANCH}_attempts.log"
  local action="$1"
  local msg="$2"

  case "$action" in
    log)
      echo "[$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M')] LOG: $msg" >> "$file"
      echo -e "${GREEN}✅ Log adicionado${NC}"
      ;;

    success)
      echo "[$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M')] ✅ SUCESSO: $msg" >> "$file"
      echo -e "${GREEN}✅ Sucesso logado${NC}"
      ;;

    fail)
      echo "[$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M')] ❌ FALHOU: $msg" >> "$file"
      echo -e "${YELLOW}⚠️  Falha logada${NC}"
      ;;

    *)
      echo -e "${RED}❌ Ação inválida: $action${NC}"
      usage
      ;;
  esac
}

# Main logic
if [ $# -lt 2 ]; then
  usage
fi

FILE_TYPE="$1"
ACTION="$2"
MSG="${3:-}"

echo -e "${BLUE}🔄 Atualizando .context/ (branch: $BRANCH)${NC}"

case "$FILE_TYPE" in
  workflow)
    update_workflow "$ACTION" "$MSG" "${4:-}"
    ;;
  temp)
    update_temp "$ACTION" "$MSG"
    ;;
  decisions)
    update_decisions "$MSG"
    ;;
  validation)
    update_validation "$ACTION" "$MSG" "${4:-}"
    ;;
  attempts)
    update_attempts "$ACTION" "$MSG"
    ;;
  *)
    echo -e "${RED}❌ Tipo de arquivo inválido: $FILE_TYPE${NC}"
    usage
    ;;
esac

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Dica: Sempre documente decisões e iterações em tempo real!${NC}"
echo -e "${YELLOW}💡 Ver .context/INDEX.md para checklist completo${NC}"
