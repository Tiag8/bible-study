#!/bin/bash
# scripts/enforce-macro-steps.sh
# MASTER ENFORCEMENT SCRIPT - Valida que TODAS as etapas macro foram executadas
# Sistema "à prova de balas" para garantir execução ordenada
# Versão: 1.0.0 | Data: 2026-01-01

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detectar branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
BRANCH_PREFIX=$(echo "$BRANCH" | sed 's/\//-/g')

echo "═══════════════════════════════════════════════════════════════════"
echo "🛡️  ENFORCEMENT DE ETAPAS MACRO - Sistema À Prova de Balas"
echo "═══════════════════════════════════════════════════════════════════"
echo "Branch: $BRANCH"
echo "Timestamp: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Contadores
TOTAL_GATES=9
PASSED_GATES=0
FAILED_GATES=0
BLOCKED=false

# ═══════════════════════════════════════════════════════════════════════════
# GATE E1: IDENTIFICAR - Context existe e foi lido
# ═══════════════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GATE E1: IDENTIFICAR (Context)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d ".context" ]; then
  CONTEXT_FILES=$(ls -1 .context/${BRANCH_PREFIX}_*.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "$CONTEXT_FILES" -gt 0 ]; then
    echo -e "${GREEN}✅ PASSED${NC}: .context/ existe com $CONTEXT_FILES arquivos"
    ((PASSED_GATES++))
  else
    echo -e "${RED}❌ BLOCKED${NC}: .context/ existe mas VAZIO para branch $BRANCH_PREFIX"
    echo "   AÇÃO: Executar ./scripts/context-init.sh"
    ((FAILED_GATES++))
    BLOCKED=true
  fi
else
  echo -e "${RED}❌ BLOCKED${NC}: .context/ NÃO existe"
  echo "   AÇÃO: Executar ./scripts/context-init.sh"
  ((FAILED_GATES++))
  BLOCKED=true
fi

# ═══════════════════════════════════════════════════════════════════════════
# GATE E2: PLANEJAR - Spec, Plan, Tasks existem
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GATE E2: PLANEJAR (Spec/Plan/Tasks)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SPEC_FILE=".context/${BRANCH_PREFIX}_spec.md"
PLAN_FILE=".context/${BRANCH_PREFIX}_plan.md"
TASKS_FILE=".context/${BRANCH_PREFIX}_tasks.md"

PLANNING_OK=true

if [ -f "$SPEC_FILE" ]; then
  echo -e "  ${GREEN}✓${NC} spec.md existe"
else
  echo -e "  ${RED}✗${NC} spec.md NÃO existe"
  PLANNING_OK=false
fi

if [ -f "$PLAN_FILE" ]; then
  echo -e "  ${GREEN}✓${NC} plan.md existe"
else
  echo -e "  ${RED}✗${NC} plan.md NÃO existe"
  PLANNING_OK=false
fi

if [ -f "$TASKS_FILE" ]; then
  echo -e "  ${GREEN}✓${NC} tasks.md existe"
else
  echo -e "  ${RED}✗${NC} tasks.md NÃO existe"
  PLANNING_OK=false
fi

if [ "$PLANNING_OK" = true ]; then
  echo -e "${GREEN}✅ PASSED${NC}: Planejamento completo"
  ((PASSED_GATES++))
else
  echo -e "${RED}❌ BLOCKED${NC}: Planejamento INCOMPLETO"
  echo "   AÇÃO: Executar Workflow 1 (Planning) primeiro"
  ((FAILED_GATES++))
  BLOCKED=true
fi

# ═══════════════════════════════════════════════════════════════════════════
# GATE E3: MITIGAR - Riscos mapeados (Workflow 3 executado)
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GATE E3: MITIGAR (Risk Analysis)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ATTEMPTS_LOG=".context/${BRANCH_PREFIX}_attempts.log"
if [ -f "$ATTEMPTS_LOG" ]; then
  if grep -q "Workflow.*3.*Risk" "$ATTEMPTS_LOG" 2>/dev/null || grep -q "WORKFLOW: 3" "$ATTEMPTS_LOG" 2>/dev/null; then
    echo -e "${GREEN}✅ PASSED${NC}: Workflow 3 (Risk Analysis) executado"
    ((PASSED_GATES++))
  else
    echo -e "${YELLOW}⚠️ WARNING${NC}: Workflow 3 (Risk Analysis) não encontrado em attempts.log"
    echo "   AÇÃO: Considerar executar Workflow 3 antes de prosseguir"
    ((PASSED_GATES++))  # Warning, não bloqueia
  fi
else
  echo -e "${YELLOW}⚠️ WARNING${NC}: attempts.log não encontrado"
  ((PASSED_GATES++))  # Warning, não bloqueia
fi

# ═══════════════════════════════════════════════════════════════════════════
# GATE E4: VALIDAR PLANO - GATE 1 (Reframing) executado
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GATE E4: VALIDAR PLANO (GATE 1 Reframing)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$ATTEMPTS_LOG" ]; then
  if grep -q "GATE 1.*Reframing" "$ATTEMPTS_LOG" 2>/dev/null; then
    GATE1_LINE=$(grep "GATE 1.*Reframing" "$ATTEMPTS_LOG" | tail -1)
    echo -e "${GREEN}✅ PASSED${NC}: GATE 1 (Reframing) executado"
    echo "   Evidência: $GATE1_LINE"
    ((PASSED_GATES++))
  else
    echo -e "${RED}❌ BLOCKED${NC}: GATE 1 (Reframing) NÃO executado"
    echo "   AÇÃO: Executar Workflow 1 Fase 1.5 (Reframing)"
    echo "   Regra: GATE 1 é Critical Success Factor (CSF) - ADR-031"
    ((FAILED_GATES++))
    BLOCKED=true
  fi
else
  echo -e "${RED}❌ BLOCKED${NC}: attempts.log não existe"
  ((FAILED_GATES++))
  BLOCKED=true
fi

# ═══════════════════════════════════════════════════════════════════════════
# GATE E5: ANTI-OVERWRITE - Proteger planos existentes
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GATE E5: ANTI-OVERWRITE (Proteção de Planos)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DECISIONS_FILE=".context/${BRANCH_PREFIX}_decisions.md"
if [ -f "$PLAN_FILE" ]; then
  PLAN_LINES=$(wc -l < "$PLAN_FILE" | tr -d ' ')
  if [ "$PLAN_LINES" -gt 10 ]; then
    echo -e "${GREEN}✅ PASSED${NC}: Plan existe com $PLAN_LINES linhas"
    echo "   ⚠️ AVISO: NÃO sobrescrever sem aprovação explícita"
    ((PASSED_GATES++))
  else
    echo -e "${GREEN}✅ PASSED${NC}: Plan existe (template inicial)"
    ((PASSED_GATES++))
  fi
else
  echo -e "${GREEN}✅ PASSED${NC}: Nenhum plan para proteger"
  ((PASSED_GATES++))
fi

# ═══════════════════════════════════════════════════════════════════════════
# GATE E6: ANTI-LOOP - Detectar erros repetidos
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GATE E6: ANTI-LOOP (Detecção de Erros Repetidos)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$ATTEMPTS_LOG" ]; then
  # Detectar erros repetidos (mesmo erro 3+ vezes)
  LOOP_COUNT=$(grep -c "LOOP: 5a↔5b" "$ATTEMPTS_LOG" 2>/dev/null || echo "0")
  ERROR_PATTERNS=$(grep -oE "❌.*|ERROR.*|FAILED.*" "$ATTEMPTS_LOG" 2>/dev/null | sort | uniq -c | sort -rn | head -3)

  if [ "$LOOP_COUNT" -ge 5 ]; then
    echo -e "${RED}❌ BLOCKED${NC}: Loop 5a↔5b detectado $LOOP_COUNT vezes"
    echo "   AÇÃO: Regredir para Workflow anterior (ver árvore de decisão)"
    ((FAILED_GATES++))
    BLOCKED=true
  elif [ "$LOOP_COUNT" -ge 3 ]; then
    echo -e "${YELLOW}⚠️ WARNING${NC}: Loop 5a↔5b detectado $LOOP_COUNT vezes"
    echo "   AÇÃO: Documentar padrão de falha em decisions.md"
    ((PASSED_GATES++))
  else
    echo -e "${GREEN}✅ PASSED${NC}: Nenhum loop detectado"
    ((PASSED_GATES++))
  fi
else
  echo -e "${GREEN}✅ PASSED${NC}: Nenhum histórico para analisar"
  ((PASSED_GATES++))
fi

# ═══════════════════════════════════════════════════════════════════════════
# GATE E7: TASKS - Verificar tasks foram lidas
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GATE E7: EXECUTAR (Tasks Lidas)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$TASKS_FILE" ]; then
  TOTAL_TASKS=$(grep -c "^\- \[ \]" "$TASKS_FILE" 2>/dev/null || echo "0")
  DONE_TASKS=$(grep -c "^\- \[x\]" "$TASKS_FILE" 2>/dev/null || echo "0")

  echo -e "${GREEN}✅ PASSED${NC}: tasks.md existe"
  echo "   Tasks totais: $TOTAL_TASKS | Completas: $DONE_TASKS"
  ((PASSED_GATES++))
else
  echo -e "${YELLOW}⚠️ WARNING${NC}: tasks.md não existe"
  echo "   AÇÃO: Criar tasks.md antes de implementar"
  ((PASSED_GATES++))
fi

# ═══════════════════════════════════════════════════════════════════════════
# GATE E8: CODE-READ - Verificar se código foi lido
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GATE E8: VERIFICAR (Código Lido)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

WORKFLOW_PROGRESS=".context/${BRANCH_PREFIX}_workflow-progress.md"
if [ -f "$WORKFLOW_PROGRESS" ]; then
  if grep -qE "Impact.*Mapping|Código.*lido|Code.*Read|Fase 0\.6" "$WORKFLOW_PROGRESS" 2>/dev/null; then
    echo -e "${GREEN}✅ PASSED${NC}: Impact Mapping/Code Read documentado"
    ((PASSED_GATES++))
  else
    echo -e "${YELLOW}⚠️ WARNING${NC}: Impact Mapping não documentado"
    echo "   AÇÃO: Executar ./scripts/impact-mapper.sh ANTES de modificar código"
    ((PASSED_GATES++))
  fi
else
  echo -e "${YELLOW}⚠️ WARNING${NC}: workflow-progress.md não existe"
  ((PASSED_GATES++))
fi

# ═══════════════════════════════════════════════════════════════════════════
# GATE E9: DOCUMENTAR - Verificar docs atualizados
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GATE E9: DOCUMENTAR (Docs Check)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se docs relevantes existem
DOCS_OK=true
if [ ! -f "docs/INDEX-MASTER.md" ]; then
  echo -e "  ${YELLOW}⚠️${NC} INDEX-MASTER.md não existe"
fi

echo -e "${GREEN}✅ PASSED${NC}: Gate de documentação (verificação básica)"
((PASSED_GATES++))

# ═══════════════════════════════════════════════════════════════════════════
# RESULTADO FINAL
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "📊 RESULTADO FINAL"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Gates Passados: $PASSED_GATES/$TOTAL_GATES"
echo "Gates Falhados: $FAILED_GATES/$TOTAL_GATES"
echo ""

if [ "$BLOCKED" = true ]; then
  echo -e "${RED}⛔ BLOQUEADO${NC}: $FAILED_GATES gate(s) crítico(s) falharam"
  echo ""
  echo "PRÓXIMOS PASSOS:"
  echo "1. Resolver TODOS os gates marcados com ❌ BLOCKED"
  echo "2. Re-executar este script: ./scripts/enforce-macro-steps.sh"
  echo "3. Só então prosseguir com implementação"
  echo ""

  # Log no attempts.log
  if [ -f "$ATTEMPTS_LOG" ]; then
    echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ENFORCEMENT: BLOQUEADO - $FAILED_GATES gates falharam" >> "$ATTEMPTS_LOG"
  fi

  exit 1
else
  echo -e "${GREEN}✅ APROVADO${NC}: Todos os gates críticos passaram"
  echo ""
  echo "Você pode prosseguir com a implementação."

  # Log no attempts.log
  if [ -f "$ATTEMPTS_LOG" ]; then
    echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ENFORCEMENT: APROVADO - $PASSED_GATES/$TOTAL_GATES gates" >> "$ATTEMPTS_LOG"
  fi

  exit 0
fi
