#!/bin/bash
# scripts/validate-workflow-3.5-executed.sh
# Valida que Workflow 3.5 (Tasks) foi executado ANTES de prosseguir para 4.5
#
# Uso:
#   ./scripts/validate-workflow-3.5-executed.sh
#
# Exit codes:
#   0 = APROVADO (WF3.5 executado)
#   1 = BLOQUEADO (WF3.5 não executado)

set -e

echo "🚨 Validação Workflow 3.5 - Tasks Breakdown"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detectar branch atual
BRANCH=$(git branch --show-current | sed 's/\//-/g')
ATTEMPTS_LOG=".context/${BRANCH}_attempts.log"
TASKS_MD=".context/${BRANCH}_tasks.md"
WORKFLOW_PROGRESS=".context/${BRANCH}_workflow-progress.md"

# Validar attempts.log existe
if [ ! -f "$ATTEMPTS_LOG" ]; then
  echo "❌ ERRO: $ATTEMPTS_LOG não encontrado"
  echo ""
  echo "⚠️ .context/ não inicializado?"
  echo "   Executar: ./scripts/context-init.sh"
  exit 1
fi

echo "📂 Branch: $BRANCH"
echo "📂 Attempts: $ATTEMPTS_LOG"
echo ""

# Check 1: tasks.md existe e tem conteúdo?
TASKS_EXISTS=false
TASKS_HAS_CONTENT=false
if [ -f "$TASKS_MD" ]; then
  TASKS_EXISTS=true
  echo "✅ Arquivo tasks.md existe"

  # Verificar se tem tasks definidas
  if grep -qE "T-[0-9]+\.[0-9]+:|^\- \[ \].*T-|Task Breakdown|US-[0-9]+" "$TASKS_MD"; then
    TASKS_HAS_CONTENT=true
    TASK_COUNT=$(grep -cE "T-[0-9]+\.[0-9]+:|^\- \[ \].*T-" "$TASKS_MD" 2>/dev/null || echo "0")
    echo "✅ Tasks definidas: ~$TASK_COUNT encontradas"
  else
    echo "⚠️ tasks.md existe mas parece vazio ou sem tasks"
  fi
else
  echo "❌ Arquivo tasks.md NÃO existe"
  echo "   Esperado: .context/${BRANCH}_tasks.md"
fi

# Check 2: Workflow 3.5 registrado em attempts.log?
WF35_EXECUTED=false
if grep -qE "WORKFLOW.*3\.5.*Tasks|Tasks.*COMPLETO|WORKFLOW: 3\.5|ARTIFACT.*tasks\.md" "$ATTEMPTS_LOG"; then
  WF35_LINE=$(grep -E "WORKFLOW.*3\.5.*Tasks|Tasks.*COMPLETO|WORKFLOW: 3\.5|ARTIFACT.*tasks\.md" "$ATTEMPTS_LOG" | tail -1)
  echo "✅ Workflow 3.5 (Tasks) registrado em attempts.log"
  echo "   Evidência: $WF35_LINE"
  WF35_EXECUTED=true
else
  echo "⚠️ Workflow 3.5 NÃO registrado em attempts.log"
fi

# Check 3: Workflow progress atualizado?
WF35_PROGRESS=false
if [ -f "$WORKFLOW_PROGRESS" ]; then
  if grep -qE "Workflow 3\.5.*Tasks|Tasks Breakdown.*✅" "$WORKFLOW_PROGRESS"; then
    echo "✅ Workflow 3.5 marcado em workflow-progress.md"
    WF35_PROGRESS=true
  else
    echo "⚠️ Workflow 3.5 NÃO marcado em workflow-progress.md"
  fi
else
  echo "⚠️ $WORKFLOW_PROGRESS não encontrado"
fi

# Check 4: Dependency graph presente?
HAS_DEPS=false
if [ "$TASKS_EXISTS" = true ]; then
  if grep -qE "dep:|Dependency Graph|→" "$TASKS_MD"; then
    echo "✅ Dependency graph definido em tasks.md"
    HAS_DEPS=true
  else
    echo "⚠️ Dependency graph NÃO definido em tasks.md"
  fi
fi

echo ""

# Decisão final - precisa de tasks.md COM conteúdo
if [ "$TASKS_HAS_CONTENT" = true ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ WORKFLOW 3.5 (Tasks) APROVADO"
  echo ""
  echo "📋 Evidências encontradas:"
  [ "$TASKS_EXISTS" = true ] && echo "   ✅ tasks.md existe"
  [ "$TASKS_HAS_CONTENT" = true ] && echo "   ✅ Tasks definidas"
  [ "$WF35_EXECUTED" = true ] && echo "   ✅ Registro em attempts.log"
  [ "$WF35_PROGRESS" = true ] && echo "   ✅ Marcação em workflow-progress.md"
  [ "$HAS_DEPS" = true ] && echo "   ✅ Dependency graph"
  echo ""
  echo "🎯 Pode prosseguir para Workflow 4.5 (Pre-Implementation Gates)"
  exit 0
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ WORKFLOW 3.5 (Tasks) NÃO EXECUTADO ou INCOMPLETO"
  echo ""
  echo "🚨 Workflow 3.5 é OBRIGATÓRIO antes de Pre-Implementation Gates"
  echo ""
  echo "📋 Workflow 3.5 requer:"
  echo "   1. Criar .context/${BRANCH}_tasks.md"
  echo "   2. Quebrar User Stories em tasks atômicas (< 2h)"
  echo "   3. Definir dependências explícitas (dep: T-X.Y)"
  echo "   4. Marcar tasks paralelas com [P]"
  echo "   5. Criar dependency graph"
  echo "   6. Sincronizar com TodoWrite"
  echo ""
  echo "🎯 AÇÃO: Executar Workflow 3.5 (Tasks)"
  echo "   Arquivo: .windsurf/workflows/add-feature-3.5-tasks.md"
  echo ""
  echo "⛔ BLOQUEIO: Workflow 4.5 NÃO pode prosseguir sem Tasks definidas"
  exit 1
fi
