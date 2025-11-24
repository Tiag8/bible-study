#!/bin/bash
# scripts/feature-cleanup.sh
# Deletar ou arquivar feature (state files + branch local)

set -euo pipefail

# Validar argumentos
if [ $# -lt 1 ]; then
  echo "❌ Uso: ./scripts/feature-cleanup.sh <nome-da-feature> [--archive]"
  echo ""
  echo "   Exemplos:"
  echo "     ./scripts/feature-cleanup.sh payment              # Deletar completamente"
  echo "     ./scripts/feature-cleanup.sh payment --archive    # Arquivar com backup"
  echo ""
  echo "   Comportamento:"
  echo "     - Sem --archive: Deleta state files + branch local"
  echo "     - Com --archive: Move para .context/archive/ + cria tar.gz backup"
  echo ""
  exit 1
fi

FEATURE_NAME=$1
ARCHIVE_FLAG=${2:-}
FEATURE_PREFIX="feat-${FEATURE_NAME}"
BRANCH_NAME="feat/${FEATURE_NAME}"
STATE_FILE=".context/${FEATURE_PREFIX}_orchestrator-state.json"
ARCHIVE_DIR=".context/archive"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Cabeçalho
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Feature Cleanup                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Verificar se feature existe
if [ ! -f "$STATE_FILE" ]; then
  echo -e "${RED}❌ Erro: Feature não encontrada: $FEATURE_PREFIX${NC}"
  echo -e "${YELLOW}   State file não existe: $STATE_FILE${NC}"
  exit 1
fi

# 2. Carregar state e validar
if ! command -v jq &> /dev/null; then
  echo -e "${RED}❌ Erro: jq não instalado. Execute: brew install jq${NC}"
  exit 1
fi

STATUS=$(jq -r '.status' "$STATE_FILE")
WORKFLOW=$(jq -r '.current_workflow' "$STATE_FILE")
PHASE=$(jq -r '.current_phase' "$STATE_FILE")
STARTED_AT=$(jq -r '.started_at' "$STATE_FILE")

echo -e "${BLUE}📍 Feature Details:${NC}"
echo -e "   Name: ${CYAN}${FEATURE_PREFIX}${NC}"
echo -e "   Status: $([ "$STATUS" = "active" ] && echo -e "${GREEN}${STATUS}${NC}" || echo -e "${YELLOW}${STATUS}${NC}")"
echo -e "   Workflow: ${WORKFLOW} (Fase ${PHASE})"
echo -e "   Started: ${STARTED_AT}"
echo ""

# 3. Avisar se feature está ativa ou pausada
if [ "$STATUS" = "active" ] || [ "$STATUS" = "paused" ]; then
  echo -e "${YELLOW}⚠️  Aviso: Feature está em ${STATUS} (não finalizada)${NC}"
  echo ""
fi

# 4. Determinar modo (delete vs archive)
if [ "$ARCHIVE_FLAG" = "--archive" ]; then
  MODE="archive"
else
  MODE="delete"
fi

echo -e "${BLUE}🗑️  Modo: $([ "$MODE" = "archive" ] && echo "ARQUIVAR" || echo "DELETAR")${NC}"
echo ""

# 5. Confirmação do usuário
if [ "$MODE" = "delete" ]; then
  echo -e "${RED}⚠️  ATENÇÃO: Isto irá deletar PERMANENTEMENTE:${NC}"
  echo -e "   - .context/${FEATURE_PREFIX}_*.json"
  echo -e "   - .context/${FEATURE_PREFIX}_*.md"
  echo -e "   - .context/${FEATURE_PREFIX}_*.log"
  echo -e "   (Git branch ${CYAN}${BRANCH_NAME}${NC} será apenas local - não afetado)"
  echo ""
else
  echo -e "${CYAN}ℹ️  Isto irá ARQUIVAR:${NC}"
  echo -e "   - Mover state files para ${ARCHIVE_DIR}/"
  echo -e "   - Criar backup: ${ARCHIVE_DIR}/${FEATURE_PREFIX}_$(date +%s).tar.gz"
  echo -e "   (Git branch não será deletada)"
  echo ""
fi

read -p "Confirmar cleanup? (yes/NO): " confirm
if [ "$confirm" != "yes" ]; then
  echo -e "${RED}❌ Cancelado${NC}"
  exit 0
fi

echo ""

# 6. Executar cleanup
if [ "$MODE" = "archive" ]; then
  # MODO ARCHIVE
  echo -e "${BLUE}📍 Step 1/3: Criando diretório archive${NC}"

  if [ ! -d "$ARCHIVE_DIR" ]; then
    mkdir -p "$ARCHIVE_DIR"
    echo -e "${GREEN}   ✅ Diretório criado: $ARCHIVE_DIR${NC}"
  else
    echo -e "${GREEN}   ✅ Diretório existe: $ARCHIVE_DIR${NC}"
  fi
  echo ""

  echo -e "${BLUE}📍 Step 2/3: Movendo files para archive${NC}"

  # Encontrar todos files da feature
  file_count=0
  for file in .context/${FEATURE_PREFIX}_*; do
    if [ -f "$file" ]; then
      mv "$file" "$ARCHIVE_DIR/" 2>/dev/null && {
        echo -e "   ${GREEN}✅${NC} $(basename "$file")"
        file_count=$((file_count + 1))
      }
    fi
  done

  if [ $file_count -eq 0 ]; then
    echo -e "${YELLOW}   ⚠️  Nenhum file encontrado para mover${NC}"
  else
    echo -e "${GREEN}   ✅ Total: $file_count files movidos${NC}"
  fi
  echo ""

  echo -e "${BLUE}📍 Step 3/3: Criando tar.gz backup${NC}"

  # Timestamp
  TIMESTAMP=$(TZ='America/Sao_Paulo' date +%Y%m%d-%H%M%S)
  BACKUP_FILE="${ARCHIVE_DIR}/${FEATURE_PREFIX}_${TIMESTAMP}.tar.gz"

  # Listar files no archive
  archived_files=()
  while IFS= read -r -d '' file; do
    archived_files+=("$(basename "$file")")
  done < <(find "$ARCHIVE_DIR" -maxdepth 1 -name "${FEATURE_PREFIX}_*" -type f -print0)

  if [ ${#archived_files[@]} -gt 0 ]; then
    # Criar tar.gz
    cd "$ARCHIVE_DIR"
    tar -czf "$(basename "$BACKUP_FILE")" "${archived_files[@]}" 2>/dev/null || true
    cd - > /dev/null

    if [ -f "$BACKUP_FILE" ]; then
      size=$(du -h "$BACKUP_FILE" | cut -f1)
      echo -e "   ${GREEN}✅${NC} Backup criado: $(basename "$BACKUP_FILE") (${size})"
    fi
  fi
  echo ""

  echo -e "${GREEN}✅ Feature arquivada com sucesso!${NC}"
  echo ""

  echo -e "${BLUE}📦 Resumo Archive:${NC}"
  echo -e "   Files: ${#archived_files[@]} movidos"
  echo -e "   Location: ${ARCHIVE_DIR}/"
  echo -e "   Backup: ${BACKUP_FILE}"
  echo ""

  echo -e "${CYAN}💡 Próximos passos:${NC}"
  echo -e "   - Git branch ainda existe: ${YELLOW}git branch -d $BRANCH_NAME${NC}"
  echo -e "   - Ver dashboard: ${YELLOW}./scripts/feature-dashboard.sh${NC}"
  echo -e "   - Restaurar arquivos: ${YELLOW}cd .context/archive && tar -xzf ...${NC}"
  echo ""

else
  # MODO DELETE
  echo -e "${BLUE}📍 Step 1/2: Deletando state files${NC}"

  file_count=0
  for file in .context/${FEATURE_PREFIX}_*; do
    if [ -f "$file" ]; then
      rm "$file" 2>/dev/null && {
        echo -e "   ${GREEN}✅${NC} $(basename "$file")"
        file_count=$((file_count + 1))
      }
    fi
  done

  if [ $file_count -eq 0 ]; then
    echo -e "${YELLOW}   ⚠️  Nenhum file encontrado${NC}"
  else
    echo -e "${GREEN}   ✅ Total: $file_count files deletados${NC}"
  fi
  echo ""

  echo -e "${BLUE}📍 Step 2/2: Deletando Git branch (local)${NC}"

  # Verificar se branch existe
  if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    # Fazer checkout em main antes de deletar
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" = "$BRANCH_NAME" ]; then
      echo -e "   ${YELLOW}ℹ️  Você está na branch $BRANCH_NAME - fazendo checkout em main${NC}"
      git checkout main > /dev/null 2>&1 || git checkout master > /dev/null 2>&1
    fi

    git branch -d "$BRANCH_NAME" 2>/dev/null && {
      echo -e "   ${GREEN}✅${NC} Branch deletada: ${BRANCH_NAME}"
    } || {
      echo -e "   ${YELLOW}⚠️  Aviso: Branch não foi deletada (talvez tenha commits não mergeados)${NC}"
      echo -e "      Use ${YELLOW}git branch -D $BRANCH_NAME${NC} para forçar delete"
    }
  else
    echo -e "   ${YELLOW}ℹ️  Branch não existe localmente: ${BRANCH_NAME}${NC}"
  fi
  echo ""

  echo -e "${GREEN}✅ Feature deletada com sucesso!${NC}"
  echo ""

  echo -e "${BLUE}📦 Resumo Delete:${NC}"
  echo -e "   Files: ${file_count} deletados"
  echo -e "   Branch: ${BRANCH_NAME} deletada (se existia)"
  echo ""

  echo -e "${CYAN}💡 Próximos passos:${NC}"
  echo -e "   - Ver dashboard: ${YELLOW}./scripts/feature-dashboard.sh${NC}"
  echo -e "   - Criar nova feature: ${YELLOW}./scripts/feature-init.sh <nome>${NC}"
  echo ""
fi

# 7. Final checks
echo -e "${BLUE}📊 Verificação Final:${NC}"
remaining_files=$(find .context -maxdepth 1 -name "${FEATURE_PREFIX}_*" -type f 2>/dev/null | wc -l)
echo -e "   Files restantes: ${remaining_files}"

if [ $remaining_files -eq 0 ]; then
  echo -e "   ${GREEN}✅ Cleanup completo${NC}"
else
  echo -e "   ${YELLOW}⚠️  Ainda há $remaining_files files${NC}"
fi
echo ""

echo -e "${BLUE}✅ Operação concluída!${NC}"
echo ""
