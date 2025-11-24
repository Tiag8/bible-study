#!/bin/bash
# Context Load All Features - Workflow 14
# Carrega .context/ de features atuais + backups

set -e

echo "=== Context Load All Features ==="
echo ""

# 1. Listar features current (.context/)
echo "📂 Current Features (.context/):"
CURRENT_FEATURES=$(ls -1 .context/ | grep "^feat-.*_workflow-progress.md$" | sed 's/_workflow-progress.md$//' | sort -u)
for feature in $CURRENT_FEATURES; do
  echo "  ✅ $feature (current)"
done
echo ""

# 2. Listar features em backups (.context/.backup-*)
echo "📦 Backup Features (.context/.backup-*):"
BACKUP_FEATURES=""
for backup_dir in $(ls -td .context/.backup-* 2>/dev/null); do
  backup_name=$(basename "$backup_dir")
  features_in_backup=$(ls -1 "$backup_dir" | grep "^feat-.*_workflow-progress.md$" | sed 's/_workflow-progress.md$//' | sort -u)

  for feature in $features_in_backup; do
    # Verificar se feature JÁ está em current (evitar duplicatas)
    if echo "$CURRENT_FEATURES" | grep -q "^$feature$"; then
      echo "  ⏭️  $feature (skip - já em current)"
    else
      echo "  ✅ $feature (backup: $backup_name)"
      BACKUP_FEATURES="$BACKUP_FEATURES $feature:$backup_dir"
    fi
  done
done
echo ""

# 3. Total features disponíveis
TOTAL_CURRENT=$(echo "$CURRENT_FEATURES" | wc -w | tr -d ' ')
TOTAL_BACKUP=$(echo "$BACKUP_FEATURES" | wc -w | tr -d ' ')
TOTAL=$((TOTAL_CURRENT + TOTAL_BACKUP))

echo "📊 Total: $TOTAL features ($TOTAL_CURRENT current + $TOTAL_BACKUP backup)"
echo ""

# 4. Validação Workflow 14 (mínimo 3 features)
if [ "$TOTAL" -lt 3 ]; then
  echo "❌ BLOQUEIO: Workflow 14 requer mínimo 3 features (disponível: $TOTAL)"
  exit 1
fi

echo "✅ Workflow 14 OK: $TOTAL features >= 3"
echo ""

# 5. Função para carregar arquivos de uma feature
load_feature_context() {
  local feature_prefix=$1
  local source_dir=$2
  local source_label=$3

  echo "=== Feature: $feature_prefix ($source_label) ==="
  echo ""

  # Lista de arquivos padrão .context/
  local files=(
    "workflow-progress.md"
    "temp-memory.md"
    "decisions.md"
    "attempts.log"
    "validation-loop.md"
    "meta-learning.md"
    "pre-implementation-gates.md"
  )

  for file_suffix in "${files[@]}"; do
    file_path="$source_dir/${feature_prefix}_${file_suffix}"

    if [ -f "$file_path" ]; then
      echo "📄 $file_suffix:"
      cat "$file_path"
      echo ""
      echo "---"
      echo ""
    fi
  done

  # Arquivos adicionais (risk-analysis, technical-design agents)
  echo "📄 Additional files:"
  for file in "$source_dir"/${feature_prefix}_*.md "$source_dir"/${feature_prefix}_*.log; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      # Pular arquivos já processados
      if ! echo "$filename" | grep -qE "(workflow-progress|temp-memory|decisions|validation-loop|meta-learning|pre-implementation-gates|attempts\.log)"; then
        echo "  📋 $(basename "$file")"
        cat "$file"
        echo ""
        echo "---"
        echo ""
      fi
    fi
  done
}

# 6. Carregar features CURRENT
echo "════════════════════════════════════════════════════════════"
echo "CURRENT FEATURES (.context/)"
echo "════════════════════════════════════════════════════════════"
echo ""

for feature in $CURRENT_FEATURES; do
  load_feature_context "$feature" ".context" "current"
done

# 7. Carregar features BACKUP
echo "════════════════════════════════════════════════════════════"
echo "BACKUP FEATURES (.context/.backup-*)"
echo "════════════════════════════════════════════════════════════"
echo ""

for feature_backup in $BACKUP_FEATURES; do
  feature=$(echo "$feature_backup" | cut -d: -f1)
  backup_dir=$(echo "$feature_backup" | cut -d: -f2)
  backup_name=$(basename "$backup_dir")

  load_feature_context "$feature" "$backup_dir" "backup: $backup_name"
done

echo "════════════════════════════════════════════════════════════"
echo "✅ Context Load Complete: $TOTAL features"
echo "════════════════════════════════════════════════════════════"
