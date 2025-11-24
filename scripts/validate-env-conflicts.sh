#!/bin/bash

# Script: validate-env-conflicts.sh
# Propósito: Detectar conflitos entre variáveis do sistema e .env
# Causa Raiz: System env vars sobrescrevem .env (ML-1, 3h debugging)
# Exit code: 1 = conflitos detectados, 0 = sem conflitos

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}VALIDAÇÃO: ENV CONFLICTS${NC}"
echo -e "${BLUE}========================================${NC}"

# Verificar se .env existe
if [ ! -f .env ]; then
  echo -e "${RED}✗ ERRO: Arquivo .env não encontrado${NC}"
  echo -e "${YELLOW}Crie .env com: cp .env.example .env${NC}"
  exit 1
fi

echo -e "\n${CYAN}Analisando variáveis VITE_* no .env...${NC}"

# Extrair variáveis VITE_* do .env (remover comentários, linhas vazias, espaços)
ENV_VARS=$(grep '^VITE_' .env | grep -v '^#' | sed 's/\s*=.*//' || true)

if [ -z "$ENV_VARS" ]; then
  echo -e "${GREEN}✓ Nenhuma variável VITE_* encontrada no .env${NC}"
  echo -e "${GREEN}✓ Validação concluída - sem conflitos${NC}"
  exit 0
fi

# Contadores
TOTAL=0
CONFLICTS=0
declare -a CONFLICT_LIST=()

# Verificar cada variável VITE_* do .env
while IFS= read -r VAR_NAME; do
  TOTAL=$((TOTAL + 1))

  # Ler valor do .env (remover aspas se houver)
  ENV_VALUE=$(grep "^${VAR_NAME}=" .env | sed 's/^[^=]*=//' | sed 's/"//g' | sed "s/'//g" || echo "")

  # Verificar se existe no environment do sistema
  SYSTEM_VALUE=$(printenv "$VAR_NAME" 2>/dev/null || echo "")

  if [ -n "$SYSTEM_VALUE" ]; then
    # Comparar valores (ignorar trailing whitespace)
    ENV_VALUE_CLEAN=$(echo "$ENV_VALUE" | xargs)
    SYSTEM_VALUE_CLEAN=$(echo "$SYSTEM_VALUE" | xargs)

    if [ "$ENV_VALUE_CLEAN" != "$SYSTEM_VALUE_CLEAN" ]; then
      CONFLICTS=$((CONFLICTS + 1))
      CONFLICT_LIST+=("$VAR_NAME|$SYSTEM_VALUE_CLEAN|$ENV_VALUE_CLEAN")
    fi
  fi
done <<< "$ENV_VARS"

# Exibir resultados
echo -e "\n${CYAN}Resumo:${NC}"
echo -e "  Variáveis VITE_* no .env: ${YELLOW}$TOTAL${NC}"

if [ $CONFLICTS -eq 0 ]; then
  echo -e "  Conflitos detectados: ${GREEN}$CONFLICTS${NC}"
  echo ""
  echo -e "${GREEN}✅ VALIDAÇÃO APROVADA${NC}"
  echo -e "${GREEN}Nenhum conflito entre system env e .env${NC}"
  echo ""
  exit 0
fi

# Exibir conflitos
echo -e "  Conflitos detectados: ${RED}$CONFLICTS${NC}"
echo ""
echo -e "${RED}❌ CONFLITO DETECTADO: Variáveis de sistema sobrescrevendo .env${NC}"
echo ""

# Tabela de conflitos
echo -e "${YELLOW}┌─────────────────────────────────────────────────────────────────────────────┐${NC}"
printf "${YELLOW}│${NC} %-30s ${YELLOW}│${NC} %-20s ${YELLOW}│${NC} %-20s ${YELLOW}│${NC}\n" "Variável" "Sistema (override)" ".env (ignorado)"
echo -e "${YELLOW}├─────────────────────────────────────────────────────────────────────────────┤${NC}"

for CONFLICT in "${CONFLICT_LIST[@]}"; do
  IFS='|' read -r VAR_NAME SYSTEM_VAL ENV_VAL <<< "$CONFLICT"

  # Truncar valores longos
  SYSTEM_DISPLAY="${SYSTEM_VAL:0:18}"
  ENV_DISPLAY="${ENV_VAL:0:18}"

  [ "${#SYSTEM_VAL}" -gt 18 ] && SYSTEM_DISPLAY="${SYSTEM_DISPLAY}..."
  [ "${#ENV_VAL}" -gt 18 ] && ENV_DISPLAY="${ENV_VAL}..."

  printf "${YELLOW}│${NC} %-30s ${YELLOW}│${NC} %-20s ${YELLOW}│${NC} %-20s ${YELLOW}│${NC}\n" \
    "$VAR_NAME" "$SYSTEM_DISPLAY" "$ENV_DISPLAY"
done

echo -e "${YELLOW}└─────────────────────────────────────────────────────────────────────────────┘${NC}"

# Instruções de correção
echo ""
echo -e "${CYAN}🔧 CORREÇÃO:${NC}"
echo ""
echo -e "${YELLOW}Execute os seguintes comandos para remover variáveis do sistema:${NC}"
echo ""

for CONFLICT in "${CONFLICT_LIST[@]}"; do
  IFS='|' read -r VAR_NAME _ _ <<< "$CONFLICT"
  echo -e "  unset $VAR_NAME"
done

echo ""
echo -e "${YELLOW}Adicione ao seu ~/.bashrc ou ~/.zshrc (permanente):${NC}"
echo ""

for CONFLICT in "${CONFLICT_LIST[@]}"; do
  IFS='|' read -r VAR_NAME _ _ <<< "$CONFLICT"
  echo -e "  # unset $VAR_NAME  # Removido - usar .env local"
done

echo ""
echo -e "${RED}❌ BUILD BLOQUEADO ATÉ RESOLVER CONFLITOS${NC}"
echo ""

exit 1
