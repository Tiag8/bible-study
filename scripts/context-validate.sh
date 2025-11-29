#!/bin/bash
# context-validate.sh - Validate .context/ integrity and completeness
# Based on .context/INDEX.md rules
# Checks for missing files, incomplete sections, and violations

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config
CONTEXT_DIR=".context"
REQUIRED_FILES=("INDEX.md" "_workflow-progress.md" "_temp-memory.md" "_decisions.md" "_attempts.log")
OPTIONAL_FILES=("_validation-loop.md" "_metrics.md")

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Counters
ERRORS=0
WARNINGS=0
INFO=0

# Check if .context/ exists
if [ ! -d "$CONTEXT_DIR" ]; then
  echo -e "${RED}❌ .context/ não existe. Execute ./scripts/context-init.sh primeiro.${NC}"
  exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}.context/ Validation Report${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Branch: $BRANCH${NC}"
echo -e "${BLUE}Timestamp: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S -03')${NC}"
echo ""

# Validation 1: Required files exist
echo -e "${YELLOW}[1/8]${NC} Validando existência de arquivos obrigatórios..."
for file in "${REQUIRED_FILES[@]}"; do
  # Replace placeholder with actual branch name
  actual_file="${file/_/${BRANCH}_}"

  # INDEX.md doesn't have branch prefix
  if [ "$file" = "INDEX.md" ]; then
    actual_file="INDEX.md"
  fi

  if [ -f "${CONTEXT_DIR}/${actual_file}" ]; then
    echo -e "  ${GREEN}✅${NC} $actual_file"
  else
    echo -e "  ${RED}❌${NC} $actual_file ${RED}NÃO ENCONTRADO${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done
echo ""

# Validation 2: Optional files (just info)
echo -e "${YELLOW}[2/8]${NC} Verificando arquivos opcionais..."
for file in "${OPTIONAL_FILES[@]}"; do
  actual_file="${file/_/${BRANCH}_}"

  if [ -f "${CONTEXT_DIR}/${actual_file}" ]; then
    echo -e "  ${GREEN}✅${NC} $actual_file (encontrado)"
    INFO=$((INFO + 1))
  else
    echo -e "  ${BLUE}ℹ️${NC}  $actual_file (não encontrado - normal se não em Workflow 6)"
  fi
done
echo ""

# Validation 3: File sizes (warn if > thresholds)
echo -e "${YELLOW}[3/8]${NC} Verificando tamanhos dos arquivos..."
check_file_size() {
  local file="$1"
  local max_size="$2"
  local warn_threshold=$((max_size * 80 / 100))  # 80% of max

  if [ ! -f "$file" ]; then
    return
  fi

  local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
  local filename=$(basename "$file")

  if [ "$size" -gt "$max_size" ]; then
    echo -e "  ${RED}❌${NC} $filename: $size bytes ${RED}> $max_size (execute context-cleanup.sh)${NC}"
    ERRORS=$((ERRORS + 1))
  elif [ "$size" -gt "$warn_threshold" ]; then
    echo -e "  ${YELLOW}⚠️${NC}  $filename: $size bytes > $warn_threshold (próximo do limite)"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✅${NC} $filename: $size bytes OK"
  fi
}

check_file_size "${CONTEXT_DIR}/${BRANCH}_attempts.log" 50000
check_file_size "${CONTEXT_DIR}/${BRANCH}_temp-memory.md" 10000
check_file_size "${CONTEXT_DIR}/${BRANCH}_workflow-progress.md" 20000
check_file_size "${CONTEXT_DIR}/${BRANCH}_decisions.md" 15000
echo ""

# Validation 4: INDEX.md structure
echo -e "${YELLOW}[4/8]${NC} Validando estrutura de INDEX.md..."
INDEX_FILE="${CONTEXT_DIR}/INDEX.md"
if [ -f "$INDEX_FILE" ]; then
  # Check required sections
  sections=("Ordem de Leitura" "Descrição dos Arquivos" "REGRA CRÍTICA" "Checklist pré-interação" "Checklist pós-interação")

  for section in "${sections[@]}"; do
    if grep -q "$section" "$INDEX_FILE"; then
      echo -e "  ${GREEN}✅${NC} Seção '$section' presente"
    else
      echo -e "  ${RED}❌${NC} Seção '$section' ${RED}AUSENTE${NC}"
      ERRORS=$((ERRORS + 1))
    fi
  done
else
  echo -e "  ${RED}❌${NC} INDEX.md não encontrado"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Validation 5: workflow-progress.md - at least 1 workflow logged
echo -e "${YELLOW}[5/8]${NC} Validando workflow-progress.md..."
WORKFLOW_FILE="${CONTEXT_DIR}/${BRANCH}_workflow-progress.md"
if [ -f "$WORKFLOW_FILE" ]; then
  workflow_count=$(grep -c "^### Workflow" "$WORKFLOW_FILE" 2>/dev/null || echo 0)

  if [ "$workflow_count" -eq 0 ]; then
    echo -e "  ${YELLOW}⚠️${NC}  Nenhum workflow registrado ainda"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✅${NC} $workflow_count workflow(s) registrado(s)"
  fi

  # Check for workflows in progress (should have at least 1)
  in_progress=$(grep -c "🔄 EM ANDAMENTO" "$WORKFLOW_FILE" 2>/dev/null || echo 0)
  completed=$(grep -c "✅ COMPLETO" "$WORKFLOW_FILE" 2>/dev/null || echo 0)

  echo -e "  ${BLUE}ℹ️${NC}  Em andamento: $in_progress | Completos: $completed"

  if [ "$in_progress" -eq 0 ] && [ "$completed" -gt 0 ]; then
    echo -e "  ${YELLOW}⚠️${NC}  Todos workflows completos - branch pronta para merge?"
    INFO=$((INFO + 1))
  fi
else
  echo -e "  ${RED}❌${NC} workflow-progress.md não encontrado"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Validation 6: temp-memory.md - has recent updates
echo -e "${YELLOW}[6/8]${NC} Validando temp-memory.md..."
TEMP_FILE="${CONTEXT_DIR}/${BRANCH}_temp-memory.md"
if [ -f "$TEMP_FILE" ]; then
  # Check if file has content beyond header
  line_count=$(wc -l < "$TEMP_FILE" | xargs)

  if [ "$line_count" -lt 20 ]; then
    echo -e "  ${YELLOW}⚠️${NC}  Arquivo muito vazio ($line_count linhas) - atualize estado atual!"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✅${NC} Conteúdo presente ($line_count linhas)"
  fi

  # Check for required sections
  sections=("Estado Atual" "Próximos Passos" "Decisões Pendentes" "Bloqueios")
  for section in "${sections[@]}"; do
    if grep -q "## $section" "$TEMP_FILE"; then
      echo -e "  ${GREEN}✅${NC} Seção '$section' presente"
    else
      echo -e "  ${YELLOW}⚠️${NC}  Seção '$section' ausente (adicione se relevante)"
      WARNINGS=$((WARNINGS + 1))
    fi
  done
else
  echo -e "  ${RED}❌${NC} temp-memory.md não encontrado"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Validation 7: attempts.log - has entries with timestamps
echo -e "${YELLOW}[7/8]${NC} Validando attempts.log..."
ATTEMPTS_FILE="${CONTEXT_DIR}/${BRANCH}_attempts.log"
if [ -f "$ATTEMPTS_FILE" ]; then
  entry_count=$(grep -c "^\[" "$ATTEMPTS_FILE" 2>/dev/null || echo 0)

  if [ "$entry_count" -eq 0 ]; then
    echo -e "  ${YELLOW}⚠️${NC}  Nenhuma entrada logada ainda"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✅${NC} $entry_count entrada(s) logada(s)"
  fi

  # Check for recent entries (last 24h)
  yesterday=$(TZ='America/Sao_Paulo' date -v-1d '+%Y-%m-%d' 2>/dev/null || date -d '1 day ago' '+%Y-%m-%d' 2>/dev/null || echo "1970-01-01")
  recent_count=$(grep -c "$yesterday\|$(TZ='America/Sao_Paulo' date '+%Y-%m-%d')" "$ATTEMPTS_FILE" 2>/dev/null || echo 0)

  if [ "$recent_count" -eq 0 ]; then
    echo -e "  ${YELLOW}⚠️${NC}  Nenhuma entrada nas últimas 24h - arquivo desatualizado?"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✅${NC} $recent_count entrada(s) recente(s) (últimas 24h)"
  fi
else
  echo -e "  ${RED}❌${NC} attempts.log não encontrado"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Validation 8: decisions.md - check if decisions are complete
echo -e "${YELLOW}[8/8]${NC} Validando decisions.md..."
DECISIONS_FILE="${CONTEXT_DIR}/${BRANCH}_decisions.md"
if [ -f "$DECISIONS_FILE" ]; then
  decision_count=$(grep -c "^## " "$DECISIONS_FILE" 2>/dev/null || echo 0)

  if [ "$decision_count" -eq 0 ]; then
    echo -e "  ${BLUE}ℹ️${NC}  Nenhuma decisão registrada ainda (normal no início)"
    INFO=$((INFO + 1))
  else
    echo -e "  ${GREEN}✅${NC} $decision_count decisão(ões) registrada(s)"
  fi

  # Check for incomplete decisions (sections with "[preencher]")
  incomplete=$(grep -c "\[preencher\]" "$DECISIONS_FILE" 2>/dev/null || echo 0)

  if [ "$incomplete" -gt 0 ]; then
    echo -e "  ${YELLOW}⚠️${NC}  $incomplete seção(ões) com '[preencher]' - complete as decisões!"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✅${NC} Todas decisões completas (sem '[preencher]')"
  fi
else
  echo -e "  ${RED}❌${NC} decisions.md não encontrado"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Resumo da Validação:${NC}"
echo -e "  ${RED}Erros:${NC} $ERRORS"
echo -e "  ${YELLOW}Avisos:${NC} $WARNINGS"
echo -e "  ${BLUE}Info:${NC} $INFO"
echo ""

if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}❌ Validação FALHOU - Corrija os erros acima${NC}"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Validação passou COM AVISOS - Revise os warnings${NC}"
  exit 0
else
  echo -e "${GREEN}✅ Validação PASSOU - .context/ está íntegro e completo${NC}"
  exit 0
fi
