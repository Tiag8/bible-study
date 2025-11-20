#!/bin/bash
# scripts/context-load-all.sh
# Carrega TODOS arquivos .context/ de uma vez (não mais Fase 0 repetitiva)

set -e

# Validações
if [ -z "$1" ]; then
  echo "❌ ERRO: Branch prefix obrigatório"
  echo "Uso: ./scripts/context-load-all.sh feat-nome-feature"
  exit 1
fi

BRANCH_PREFIX="$1"
CONTEXT_DIR=".context"

echo "🔄 Carregando contexto completo: $BRANCH_PREFIX"
echo ""

# Validar .context/ existe
if [ ! -d "$CONTEXT_DIR" ]; then
  echo "❌ ERRO: $CONTEXT_DIR não existe"
  echo "Executar: ./scripts/context-init.sh"
  exit 1
fi

# Arquivos esperados (6)
FILES=(
  "INDEX.md"
  "${BRANCH_PREFIX}_workflow-progress.md"
  "${BRANCH_PREFIX}_temp-memory.md"
  "${BRANCH_PREFIX}_decisions.md"
  "${BRANCH_PREFIX}_attempts.log"
  "${BRANCH_PREFIX}_validation-loop.md"
)

# Validar todos existem
MISSING=0
for file in "${FILES[@]}"; do
  if [ ! -f "$CONTEXT_DIR/$file" ]; then
    echo "⚠️ AVISO: $file NÃO EXISTE"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo ""
  echo "❌ ERRO: $MISSING arquivos faltando"
  echo "Executar: ./scripts/context-init.sh"
  exit 1
fi

# Exibir resumo de cada arquivo
echo "📂 INDEX.md"
echo "  - Última atualização: $(grep "Última Atualização" $CONTEXT_DIR/INDEX.md | head -1)"
echo "  - Workflows implementados: $(grep -c "add-feature-" $CONTEXT_DIR/INDEX.md || echo "0")"
echo ""

echo "📊 workflow-progress.md"
echo "  - Workflow ativo: $(grep "Workflow Ativo" $CONTEXT_DIR/${BRANCH_PREFIX}_workflow-progress.md | head -1 | cut -d':' -f2 | xargs)"
echo "  - Última atualização: $(grep "Última Atualização" $CONTEXT_DIR/${BRANCH_PREFIX}_workflow-progress.md | head -1 | cut -d':' -f2 | xargs)"
echo "  - Workflows completos: $(grep -c "✅ COMPLETO" $CONTEXT_DIR/${BRANCH_PREFIX}_workflow-progress.md || echo "0")"
echo ""

echo "🧠 temp-memory.md"
echo "  - Estado atual: $(grep "## Estado Atual" -A 2 $CONTEXT_DIR/${BRANCH_PREFIX}_temp-memory.md | tail -1)"
echo "  - Próximos passos: $(grep -c "^\- \[ \]" $CONTEXT_DIR/${BRANCH_PREFIX}_temp-memory.md || echo "0") pendentes"
echo ""

echo "🎯 decisions.md"
echo "  - Decisões documentadas: $(grep -c "^### Decisão" $CONTEXT_DIR/${BRANCH_PREFIX}_decisions.md || echo "0")"
echo "  - Última decisão: $(grep "^### Decisão" $CONTEXT_DIR/${BRANCH_PREFIX}_decisions.md | tail -1 | cut -d':' -f2 | xargs)"
echo ""

echo "📝 attempts.log"
echo "  - Tentativas registradas: $(wc -l < $CONTEXT_DIR/${BRANCH_PREFIX}_attempts.log)"
echo "  - Última entrada: $(tail -1 $CONTEXT_DIR/${BRANCH_PREFIX}_attempts.log | cut -d']' -f1)]"
echo ""

echo "🔄 validation-loop.md"
echo "  - Validações: $(grep -c "^### Validação" $CONTEXT_DIR/${BRANCH_PREFIX}_validation-loop.md || echo "0")"
echo "  - Status: $(grep "Status" $CONTEXT_DIR/${BRANCH_PREFIX}_validation-loop.md | head -1 | cut -d':' -f2 | xargs)"
echo ""

echo "✅ Contexto carregado com sucesso!"
echo ""
echo "📌 RESUMO:"
echo "  - Branch: $BRANCH_PREFIX"
echo "  - Arquivos: 6/6 ✅"
echo "  - Workflows completos: $(grep -c "✅ COMPLETO" $CONTEXT_DIR/${BRANCH_PREFIX}_workflow-progress.md || echo "0")"
echo "  - Decisões: $(grep -c "^### Decisão" $CONTEXT_DIR/${BRANCH_PREFIX}_decisions.md || echo "0")"
echo "  - Tentativas: $(wc -l < $CONTEXT_DIR/${BRANCH_PREFIX}_attempts.log)"
echo ""
echo "🎯 Próximo: $(grep "Workflow Ativo" $CONTEXT_DIR/${BRANCH_PREFIX}_workflow-progress.md | head -1 | cut -d':' -f2 | xargs)"
