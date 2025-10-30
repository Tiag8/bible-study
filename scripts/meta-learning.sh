#!/bin/bash

# Meta-Learning Script - Captura métricas automáticas da feature
# Baseado em: Reflection Loop (4-phase) + W4S validation feedback

set -euo pipefail

FEATURE_BRANCH=$(git branch --show-current)
MAIN_BRANCH="main"
OUTPUT_FILE="/tmp/meta-learning-metrics.json"

echo "🧠 Meta-Learning: Capturando métricas de $FEATURE_BRANCH"

# Captura métricas objetivas
COMMITS_TOTAL=$(git rev-list --count HEAD ^"$MAIN_BRANCH" 2>/dev/null || echo "0")
FILES_MODIFIED=$(git diff --name-only "$MAIN_BRANCH"...HEAD 2>/dev/null | wc -l | tr -d ' ')
LINES_ADDED=$(git diff --stat "$MAIN_BRANCH"...HEAD 2>/dev/null | tail -1 | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo "0")
LINES_REMOVED=$(git diff --stat "$MAIN_BRANCH"...HEAD 2>/dev/null | tail -1 | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo "0")

# Conta commits de "fix:" (indicador de iterações/correções)
FIX_COMMITS=$(git log --oneline "$MAIN_BRANCH"..HEAD 2>/dev/null | grep -c "^[a-f0-9]* fix:" || echo "0")

# Gera JSON com métricas
cat > "$OUTPUT_FILE" <<EOF
{
  "feature_branch": "$FEATURE_BRANCH",
  "captured_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "metrics": {
    "commits_total": $COMMITS_TOTAL,
    "commits_fixes": $FIX_COMMITS,
    "files_modified": $FILES_MODIFIED,
    "lines_added": $LINES_ADDED,
    "lines_removed": $LINES_REMOVED,
    "fix_ratio": $(echo "scale=2; $FIX_COMMITS / $COMMITS_TOTAL" | bc -l 2>/dev/null || echo "0")
  }
}
EOF

echo ""
echo "✅ Métricas capturadas:"
cat "$OUTPUT_FILE" | python3 -m json.tool 2>/dev/null || cat "$OUTPUT_FILE"
echo ""
echo "📊 Arquivo salvo: $OUTPUT_FILE"
echo ""
echo "📋 Análise:"
if [ "$FIX_COMMITS" -ge 3 ]; then
  echo "  ⚠️  Alto número de fixes ($FIX_COMMITS) → Pode indicar gap no workflow/docs"
else
  echo "  ✅ Número normal de fixes ($FIX_COMMITS)"
fi

echo ""
echo "🔍 Próximo passo: Analise as métricas e identifique padrões"
echo "   - Fix ratio > 0.3 → Algo não estava claro (workflow/docs incompletos)"
echo "   - Commits > 20 → Feature muito complexa (quebrar em menores?)"
