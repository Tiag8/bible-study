#!/bin/bash

# validate-5-agents-executed.sh
# Valida que Workflow 2b executou 5 agentes paralelos (Technical Design)
# Uso: ./scripts/validate-5-agents-executed.sh
#
# CRÍTICO: Enforcement de Workflow 2b (5 agentes obrigatórios)
# Parte de: Workflow 8b Pareto #6 (Score 6.0)
# Root Cause: LLM pode esquecer (10-20% risco)

set -e

echo "🤖 VALIDAÇÃO: 5 Agentes Paralelos (Workflow 2b)"
echo ""

# 1. Detectar branch atual
BRANCH=$(git branch --show-current | sed 's/\//-/g')

if [ -z "$BRANCH" ]; then
  echo "❌ ERRO: Não foi possível detectar branch atual."
  echo "Execute: git branch --show-current"
  exit 1
fi

echo "Branch: $BRANCH"
echo ""

# 2. Definir arquivos esperados (ordem específica do Workflow 2b)
AGENTS=(
  "agent-1-schema"
  "agent-2-trigger"
  "agent-3-backend"
  "agent-4-frontend"
  "agent-5-testing-rca"
)

AGENT_NAMES=(
  "Schema"
  "Trigger"
  "Backend"
  "Frontend"
  "Testing"
)

# 3. Validar cada agent
MISSING=0
MISSING_LIST=()

echo "| Agent | Arquivo | Status |"
echo "|-------|---------|--------|"

for i in "${!AGENTS[@]}"; do
  AGENT_NUM=$((i + 1))
  AGENT_NAME="${AGENT_NAMES[$i]}"
  FILE=".context/${BRANCH}_technical-design-${AGENTS[$i]}.md"

  if [ -f "$FILE" ]; then
    echo "| $AGENT_NUM ($AGENT_NAME) | ${FILE##*/} | ✅ EXISTE |"
  else
    echo "| $AGENT_NUM ($AGENT_NAME) | ${FILE##*/} | ❌ FALTANDO |"
    MISSING=$((MISSING + 1))
    MISSING_LIST+=("$AGENT_NUM ($AGENT_NAME)")
  fi
done

echo ""

# 4. Resultado final
if [ $MISSING -eq 0 ]; then
  echo "✅ SUCESSO: Todos 5 agentes executados!"
  echo ""
  echo "Workflow 2b completo com 5 agentes paralelos:"
  echo "  1. Agent 1: Schema Design"
  echo "  2. Agent 2: Trigger Events"
  echo "  3. Agent 3: Backend Logic"
  echo "  4. Agent 4: Frontend Integration"
  echo "  5. Agent 5: Testing + RCA"
  echo ""
  echo "✅ Pronto para Workflow 3 (Risk Analysis)."
  exit 0
else
  echo "❌ ERRO: Workflow 2b NÃO executou $MISSING agent(s)!"
  echo ""
  echo "Agentes faltando:"
  for agent in "${MISSING_LIST[@]}"; do
    echo "  - $agent"
  done
  echo ""
  echo "🔧 CORREÇÃO:"
  echo "1. Voltar para Workflow 2b (.windsurf/workflows/add-feature-2b-technical-design.md)"
  echo "2. Executar agent(s) faltante(s) em paralelo"
  echo "3. Validar novamente: ./scripts/validate-5-agents-executed.sh"
  echo ""
  echo "⚠️ MOTIVO: 5 agentes paralelos = -30-40min vs 2-3h (Workflow 8b Pareto #6)"
  echo ""
  echo "❌ Workflow 3 (Risk Analysis) bloqueado até resolver."
  exit 1
fi
