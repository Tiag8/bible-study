#!/bin/bash
# validate-memory-audit-mandatory.sh
# Workflow 14 - Proposta #1
# BLOQUEIO PRÉ-WORKFLOW 2b: Garante Memory Audit foi executado
# Previne: Erros conhecidos (documentados em ~/.claude/memory/) repetindo
# ROI: 30-60min debug evitado por feature

set -e

BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
DECISIONS_FILE=".context/${BRANCH}_decisions.md"

echo "🧠 GATE 0.0: Memory Audit Mandatory"
echo ""

# ============================================
# 1. VERIFICAR ARQUIVO DECISIONS EXISTE
# ============================================
if [ ! -f "$DECISIONS_FILE" ]; then
  echo "❌ FALHOU: Arquivo $DECISIONS_FILE não encontrado"
  echo ""
  echo "Ação: Executar Workflow 1 primeiro (context-init.sh)"
  exit 1
fi

# ============================================
# 2. DETECTAR DOMÍNIOS DA FEATURE
# ============================================
echo "📋 Detectando domínios da feature..."

TEMP_MEMORY_FILE=".context/${BRANCH}_temp-memory.md"
DOMAINS=()

# Ler temp-memory.md para detectar keywords
if [ -f "$TEMP_MEMORY_FILE" ]; then
  CONTENT=$(cat "$TEMP_MEMORY_FILE" | tr '[:upper:]' '[:lower:]')

  # Mapear keywords → domínios (alinhado com REGRA #21)
  if echo "$CONTENT" | grep -qE "gemini|ai|tool calling|ptcf|few-shot"; then
    DOMAINS+=("gemini")
  fi
  if echo "$CONTENT" | grep -qE "supabase|rls|migration|schema|postgres"; then
    DOMAINS+=("supabase")
  fi
  if echo "$CONTENT" | grep -qE "deploy|docker|traefik|vps|swarm"; then
    DOMAINS+=("deployment")
  fi
  if echo "$CONTENT" | grep -qE "whatsapp|webhook|uazapi|wzap"; then
    DOMAINS+=("uazapi")
  fi
  if echo "$CONTENT" | grep -qE "git|commit|push|merge|rebase"; then
    DOMAINS+=("git")
  fi
  if echo "$CONTENT" | grep -qE "security|rls bypass|auth|password|xss|sql injection"; then
    DOMAINS+=("security")
  fi
  if echo "$CONTENT" | grep -qE "edge function|deno|runtime|serverless"; then
    DOMAINS+=("edge-functions")
  fi
  if echo "$CONTENT" | grep -qE "react|frontend|vite|build|bundle"; then
    DOMAINS+=("frontend")
  fi
  if echo "$CONTENT" | grep -qE "workflow|gate|validation|pre-implementation"; then
    DOMAINS+=("workflow")
  fi
  if echo "$CONTENT" | grep -qE "prompt|system prompt|examples"; then
    DOMAINS+=("prompt")
  fi
  if echo "$CONTENT" | grep -qE "debug|bug|rca|5 whys|troubleshoot"; then
    DOMAINS+=("debugging")
  fi
fi

# Se nenhum domínio detectado, assumir "geral"
if [ ${#DOMAINS[@]} -eq 0 ]; then
  DOMAINS+=("geral")
fi

echo "Domínios detectados: ${DOMAINS[*]}"
echo ""

# ============================================
# 3. VERIFICAR SEÇÃO "Memory Files Consulted"
# ============================================
echo "🔍 Verificando seção 'Memory Files Consulted' em $DECISIONS_FILE..."

if ! grep -q "Memory Files Consulted" "$DECISIONS_FILE"; then
  echo "❌ FALHOU: Seção 'Memory Files Consulted' ausente em $DECISIONS_FILE"
  echo ""
  echo "Ação obrigatória:"
  echo "1. Executar Workflow 2b Fase 0.2 (Memory Audit)"
  echo "2. Adicionar seção ao arquivo:"
  echo ""
  echo "## Memory Files Consulted"
  echo ""
  echo "**Domínios detectados**: ${DOMAINS[*]}"
  echo ""
  echo "**Arquivos lidos** (mínimo 2):"
  echo "- ~/.claude/memory/gemini.md (se domínio=gemini)"
  echo "- ~/.claude/memory/supabase.md (se domínio=supabase)"
  echo "- ~/.claude/memory/deployment.md (se domínio=deploy)"
  echo "- ..."
  echo ""
  echo "**Learnings Aplicáveis**:"
  echo "- [Listar 3+ learnings relevantes dos arquivos consultados]"
  echo ""
  exit 1
fi

# ============================================
# 4. VALIDAR MÍNIMO 2 ARQUIVOS CONSULTADOS
# ============================================
echo "✅ Seção 'Memory Files Consulted' encontrada"
echo ""
echo "📊 Validando mínimo 2 arquivos memory consultados..."

# Extrair seção Memory Files Consulted
MEMORY_SECTION=$(awk '/Memory Files Consulted/,/^##/' "$DECISIONS_FILE")

# Contar arquivos listados (linhas com ~/.claude/memory/)
FILE_COUNT=$(echo "$MEMORY_SECTION" | grep -c "~/.claude/memory/" || true)

if [ "$FILE_COUNT" -lt 2 ]; then
  echo "⚠️ ATENÇÃO: Apenas $FILE_COUNT arquivo(s) memory consultado(s)"
  echo ""
  echo "Domínios detectados: ${DOMAINS[*]}"
  echo "Arquivos esperados (mínimo 2):"
  for domain in "${DOMAINS[@]}"; do
    echo "  - ~/.claude/memory/${domain}.md"
  done
  echo ""
  echo "Ação: Consultar pelo menos 2 arquivos memory ANTES de prosseguir"
  echo ""
  exit 1
fi

echo "✅ $FILE_COUNT arquivo(s) memory consultados (mínimo 2 OK)"
echo ""

# ============================================
# 5. VALIDAR LEARNINGS APLICÁVEIS
# ============================================
echo "📚 Validando learnings aplicáveis documentados..."

LEARNINGS_COUNT=$(echo "$MEMORY_SECTION" | grep -cE "^\s*-\s+" || true)

if [ "$LEARNINGS_COUNT" -lt 3 ]; then
  echo "⚠️ ATENÇÃO: Apenas $LEARNINGS_COUNT learning(s) documentado(s)"
  echo ""
  echo "Ação: Listar pelo menos 3 learnings aplicáveis da consulta memory"
  echo "Exemplo:"
  echo "  - Gemini 9000 token limit (gemini.md seção 1)"
  echo "  - Schema-First SQL validation (supabase.md seção 5)"
  echo "  - Rsync-First deploy strategy (deployment.md seção 11)"
  echo ""
  exit 1
fi

echo "✅ $LEARNINGS_COUNT learning(s) documentados (mínimo 3 OK)"
echo ""

# ============================================
# 6. SUCESSO
# ============================================
echo "🎯 GATE 0.0: Memory Audit Mandatory - APROVADO ✅"
echo ""
echo "📊 Resumo:"
echo "  - Domínios detectados: ${DOMAINS[*]}"
echo "  - Arquivos memory consultados: $FILE_COUNT"
echo "  - Learnings aplicáveis: $LEARNINGS_COUNT"
echo ""
echo "Próximo passo: Workflow 2b Fase 1 (Technical Design)"
exit 0
