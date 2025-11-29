#!/bin/bash

# Script: load-context.sh
# Propósito: Automatizar FASE 0 (Load Context) dos workflows
# Causa Raiz: FASE 0 repetida manualmente 376× (Workflow 8b Score 7.5)
# Exit code: 0 = sucesso, 1 = erro

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧠 FASE 0: LOAD CONTEXT (.context/)${NC}"
echo -e "${BLUE}========================================${NC}"

# Detectar branch atual
BRANCH_NAME=$(git branch --show-current)
if [ -z "$BRANCH_NAME" ]; then
  echo -e "${RED}✗ ERRO: Não foi possível detectar branch atual${NC}"
  echo -e "${YELLOW}Certifique-se de estar em um repositório Git válido${NC}"
  exit 1
fi

# Gerar prefixo (ex: feat/members → feat-members)
PREFIX="${BRANCH_NAME/\//-}"

echo -e "\n${CYAN}Branch atual:${NC} ${YELLOW}$BRANCH_NAME${NC}"
echo -e "${CYAN}Prefixo arquivos:${NC} ${YELLOW}${PREFIX}_${NC}"

# Verificar se .context/ existe
if [ ! -d .context/ ]; then
  echo -e "\n${RED}✗ ERRO: Diretório .context/ não encontrado${NC}"
  echo -e "${YELLOW}Inicialize com: ./scripts/context-init.sh <feature-name>${NC}"
  exit 1
fi

echo -e "\n${CYAN}Carregando arquivos .context/...${NC}\n"

# === 1. INDEX.md ===
if [ -f .context/INDEX.md ]; then
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ INDEX.md${NC} ${CYAN}(guia de leitura)${NC}"
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  cat .context/INDEX.md
  echo ""
else
  echo -e "${YELLOW}⚠ AVISO: INDEX.md não encontrado${NC}"
fi

# === 2. workflow-progress.md ===
WORKFLOW_FILE=".context/${PREFIX}_workflow-progress.md"
if [ -f "$WORKFLOW_FILE" ]; then
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ workflow-progress.md${NC} ${CYAN}(onde estou)${NC}"
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  cat "$WORKFLOW_FILE"
  echo ""
else
  echo -e "${RED}✗ ERRO: $WORKFLOW_FILE não encontrado${NC}"
  echo -e "${YELLOW}Execute: ./scripts/context-init.sh <feature-name>${NC}"
  exit 1
fi

# === 3. temp-memory.md ===
TEMP_FILE=".context/${PREFIX}_temp-memory.md"
if [ -f "$TEMP_FILE" ]; then
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ temp-memory.md${NC} ${CYAN}(estado atual)${NC}"
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  cat "$TEMP_FILE"
  echo ""
else
  echo -e "${YELLOW}⚠ AVISO: $TEMP_FILE não encontrado${NC}"
fi

# === 4. decisions.md ===
DECISIONS_FILE=".context/${PREFIX}_decisions.md"
if [ -f "$DECISIONS_FILE" ]; then
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ decisions.md${NC} ${CYAN}(decisões tomadas)${NC}"
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  cat "$DECISIONS_FILE"
  echo ""
else
  echo -e "${YELLOW}⚠ AVISO: $DECISIONS_FILE não encontrado${NC}"
fi

# === 5. validation-loop.md (se existir) ===
VALIDATION_FILE=".context/${PREFIX}_validation-loop.md"
if [ -f "$VALIDATION_FILE" ]; then
  # Verificar se arquivo não está vazio (ignorar template)
  if grep -q "### Iteração" "$VALIDATION_FILE" 2>/dev/null; then
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ validation-loop.md${NC} ${CYAN}(loop Workflow 6)${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    cat "$VALIDATION_FILE"
    echo ""
  else
    echo -e "${CYAN}ℹ validation-loop.md vazio (sem iterações ainda)${NC}"
  fi
fi

# === 6. attempts.log (últimas 30 linhas) ===
ATTEMPTS_FILE=".context/${PREFIX}_attempts.log"
if [ -f "$ATTEMPTS_FILE" ]; then
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ attempts.log${NC} ${CYAN}(últimas 30 linhas)${NC}"
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  tail -30 "$ATTEMPTS_FILE"
  echo ""
else
  echo -e "${YELLOW}⚠ AVISO: $ATTEMPTS_FILE não encontrado${NC}"
fi

# === CHECKLIST VALIDAÇÃO ===
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📋 CHECKLIST FASE 0${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✅${NC} Li INDEX.md?"
echo -e "${GREEN}✅${NC} Li workflow-progress.md (onde estou)?"
echo -e "${GREEN}✅${NC} Li temp-memory.md (estado atual)?"
echo -e "${GREEN}✅${NC} Li decisions.md (decisões já tomadas)?"

if grep -q "### Iteração" "$VALIDATION_FILE" 2>/dev/null; then
  echo -e "${GREEN}✅${NC} Li validation-loop.md (loop Workflow 6)?"
else
  echo -e "${CYAN}ℹ${NC}  validation-loop.md não aplicável (sem iterações)"
fi

echo -e "${GREEN}✅${NC} Li últimas 30 linhas de attempts.log?"
echo ""

# === LOG NO attempts.log ===
TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
echo "[$TIMESTAMP] LOAD_CONTEXT: Fase 0 executada via load-context.sh" >> "$ATTEMPTS_FILE"

# === FINALIZAÇÃO ===
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ CONTEXT LOADED!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}🎯 Pronto para executar workflows!${NC}"
echo ""
echo -e "${YELLOW}⚠️ REGRA: TODA interação deve atualizar pelo menos 1 arquivo .context/${NC}"
echo ""

exit 0
