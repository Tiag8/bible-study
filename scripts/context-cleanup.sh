#!/bin/bash
# context-cleanup.sh - Automatic cleanup of .context/ files
# Based on Anthropic best practices for context management
# Implements "Context Editing" pattern from https://anthropic.com/research/context-engineering

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
CONTEXT_DIR=".context"
MAX_ATTEMPTS_LOG_SIZE=50000  # 50KB (~500 lines)
MAX_TEMP_MEMORY_SIZE=10000   # 10KB (~100 lines)
MAX_VALIDATION_ITERATIONS=20  # Keep only last 20 iterations
BACKUP_DIR=".context/.backups"

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Check if .context/ exists
if [ ! -d "$CONTEXT_DIR" ]; then
  echo -e "${YELLOW}⚠️  .context/ não existe. Execute ./scripts/context-init.sh primeiro.${NC}"
  exit 1
fi

echo -e "${BLUE}🧹 Iniciando limpeza automática de .context/${NC}"
echo -e "${BLUE}Branch atual: $BRANCH${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
BACKUP_TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y%m%d_%H%M%S')

# Function: Compress attempts.log (keep only last N KB)
compress_attempts_log() {
  local file="${CONTEXT_DIR}/${BRANCH}_attempts.log"

  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️  $file não encontrado. Pulando...${NC}"
    return
  fi

  local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)

  if [ "$size" -gt "$MAX_ATTEMPTS_LOG_SIZE" ]; then
    echo -e "${YELLOW}📋 attempts.log ($size bytes) > limite ($MAX_ATTEMPTS_LOG_SIZE bytes)${NC}"

    # Backup original
    cp "$file" "${BACKUP_DIR}/${BRANCH}_attempts_${BACKUP_TIMESTAMP}.log.bak"
    echo -e "${GREEN}✅ Backup criado: ${BACKUP_DIR}/${BRANCH}_attempts_${BACKUP_TIMESTAMP}.log.bak${NC}"

    # Keep only last 50KB (approx last 500 lines)
    local lines_to_keep=$(tail -n 500 "$file" | wc -l | xargs)
    tail -n "$lines_to_keep" "$file" > "${file}.tmp"

    # Add header
    cat > "$file" <<EOF
# Compressed at $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S -03')
# Original size: $size bytes
# Backup: ${BACKUP_DIR}/${BRANCH}_attempts_${BACKUP_TIMESTAMP}.log.bak
# Kept last $lines_to_keep lines

EOF
    cat "${file}.tmp" >> "$file"
    rm "${file}.tmp"

    local new_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    local reduction=$((100 - (new_size * 100 / size)))
    echo -e "${GREEN}✅ Comprimido: $size → $new_size bytes (-${reduction}%)${NC}"
  else
    echo -e "${GREEN}✅ attempts.log ($size bytes) OK (< $MAX_ATTEMPTS_LOG_SIZE)${NC}"
  fi
}

# Function: Compress temp-memory.md (summarize if > 10KB)
compress_temp_memory() {
  local file="${CONTEXT_DIR}/${BRANCH}_temp-memory.md"

  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️  $file não encontrado. Pulando...${NC}"
    return
  fi

  local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)

  if [ "$size" -gt "$MAX_TEMP_MEMORY_SIZE" ]; then
    echo -e "${YELLOW}📝 temp-memory.md ($size bytes) > limite ($MAX_TEMP_MEMORY_SIZE bytes)${NC}"

    # Backup original
    cp "$file" "${BACKUP_DIR}/${BRANCH}_temp-memory_${BACKUP_TIMESTAMP}.md.bak"
    echo -e "${GREEN}✅ Backup criado: ${BACKUP_DIR}/${BRANCH}_temp-memory_${BACKUP_TIMESTAMP}.md.bak${NC}"

    # Extract only "Estado Atual" and "Próximos Passos" (most recent info)
    cat > "${file}.tmp" <<EOF
# temp-memory.md - Resumo Atual

**Comprimido em**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S -03')
**Original**: $size bytes
**Backup**: ${BACKUP_DIR}/${BRANCH}_temp-memory_${BACKUP_TIMESTAMP}.md.bak

---

$(sed -n '/## Estado Atual/,/## Próximos Passos/p' "$file" | head -n 50)

$(sed -n '/## Próximos Passos/,/## Decisões Pendentes/p' "$file" | head -n 30)

---

**Seções antigas** (Decisões Pendentes, Bloqueios): Ver backup acima.
EOF

    mv "${file}.tmp" "$file"

    local new_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    local reduction=$((100 - (new_size * 100 / size)))
    echo -e "${GREEN}✅ Comprimido: $size → $new_size bytes (-${reduction}%)${NC}"
  else
    echo -e "${GREEN}✅ temp-memory.md ($size bytes) OK (< $MAX_TEMP_MEMORY_SIZE)${NC}"
  fi
}

# Function: Compress validation-loop.md (keep only last N iterations)
compress_validation_loop() {
  local file="${CONTEXT_DIR}/${BRANCH}_validation-loop.md"

  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️  $file não encontrado (normal se não em Workflow 6). Pulando...${NC}"
    return
  fi

  local iteration_count=$(grep -c "^### Iteração" "$file" 2>/dev/null || echo 0)

  if [ "$iteration_count" -gt "$MAX_VALIDATION_ITERATIONS" ]; then
    echo -e "${YELLOW}🔄 validation-loop.md ($iteration_count iterações) > limite ($MAX_VALIDATION_ITERATIONS)${NC}"

    # Backup original
    cp "$file" "${BACKUP_DIR}/${BRANCH}_validation-loop_${BACKUP_TIMESTAMP}.md.bak"
    echo -e "${GREEN}✅ Backup criado: ${BACKUP_DIR}/${BRANCH}_validation-loop_${BACKUP_TIMESTAMP}.md.bak${NC}"

    # Keep header + last N iterations
    local header_lines=$(grep -n "^### Iteração" "$file" | head -1 | cut -d: -f1)
    header_lines=$((header_lines - 1))

    head -n "$header_lines" "$file" > "${file}.tmp"
    echo "" >> "${file}.tmp"
    echo "**Comprimido em**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S -03')" >> "${file}.tmp"
    echo "**Total iterações**: $iteration_count (mantidas últimas $MAX_VALIDATION_ITERATIONS)" >> "${file}.tmp}"
    echo "**Backup completo**: ${BACKUP_DIR}/${BRANCH}_validation-loop_${BACKUP_TIMESTAMP}.md.bak" >> "${file}.tmp}"
    echo "" >> "${file}.tmp"

    # Extract last N iterations
    awk "/^### Iteração/{n++} n>=$((iteration_count - MAX_VALIDATION_ITERATIONS + 1))" "$file" >> "${file}.tmp"

    mv "${file}.tmp" "$file"

    local new_iteration_count=$(grep -c "^### Iteração" "$file" 2>/dev/null || echo 0)
    echo -e "${GREEN}✅ Comprimido: $iteration_count → $new_iteration_count iterações${NC}"
  else
    echo -e "${GREEN}✅ validation-loop.md ($iteration_count iterações) OK (< $MAX_VALIDATION_ITERATIONS)${NC}"
  fi
}

# Function: Archive completed workflows (workflow-progress.md)
archive_completed_workflows() {
  local file="${CONTEXT_DIR}/${BRANCH}_workflow-progress.md"

  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️  $file não encontrado. Pulando...${NC}"
    return
  fi

  local completed_count=$(grep -c "✅ COMPLETO" "$file" 2>/dev/null || echo 0)

  if [ "$completed_count" -gt 10 ]; then
    echo -e "${YELLOW}📊 workflow-progress.md ($completed_count workflows completos) > 10${NC}"

    # Backup original
    cp "$file" "${BACKUP_DIR}/${BRANCH}_workflow-progress_${BACKUP_TIMESTAMP}.md.bak"
    echo -e "${GREEN}✅ Backup criado: ${BACKUP_DIR}/${BRANCH}_workflow-progress_${BACKUP_TIMESTAMP}.md.bak${NC}"

    # Keep header + last 5 completed + all in-progress
    local header_lines=$(grep -n "^### Workflow" "$file" | head -1 | cut -d: -f1)
    header_lines=$((header_lines - 1))

    head -n "$header_lines" "$file" > "${file}.tmp"
    echo "" >> "${file}.tmp"
    echo "**Comprimido em**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S -03')" >> "${file}.tmp}"
    echo "**Workflows completos**: $completed_count (mantidos últimos 5)" >> "${file}.tmp}"
    echo "**Backup completo**: ${BACKUP_DIR}/${BRANCH}_workflow-progress_${BACKUP_TIMESTAMP}.md.bak" >> "${file}.tmp}"
    echo "" >> "${file}.tmp}"

    # Extract last 5 completed workflows
    awk '/✅ COMPLETO/{n++} n>='$((completed_count - 4))' || /### Workflow.*em andamento/' "$file" >> "${file}.tmp}"

    mv "${file}.tmp" "$file"

    local new_completed_count=$(grep -c "✅ COMPLETO" "$file" 2>/dev/null || echo 0)
    echo -e "${GREEN}✅ Comprimido: $completed_count → $new_completed_count workflows completos${NC}"
  else
    echo -e "${GREEN}✅ workflow-progress.md ($completed_count workflows) OK (< 10)${NC}"
  fi
}

# Function: Clean old backups (keep only last 10)
clean_old_backups() {
  if [ ! -d "$BACKUP_DIR" ]; then
    return
  fi

  local backup_count=$(ls -1 "$BACKUP_DIR" | wc -l | xargs)

  if [ "$backup_count" -gt 10 ]; then
    echo -e "${YELLOW}🗑️  $backup_count backups encontrados (> 10)${NC}"

    # Delete oldest backups (keep last 10)
    ls -t "$BACKUP_DIR" | tail -n +11 | while read file; do
      rm "$BACKUP_DIR/$file"
      echo -e "${GREEN}✅ Deletado backup antigo: $file${NC}"
    done

    local new_backup_count=$(ls -1 "$BACKUP_DIR" | wc -l | xargs)
    echo -e "${GREEN}✅ Backups limpos: $backup_count → $new_backup_count${NC}"
  else
    echo -e "${GREEN}✅ Backups ($backup_count) OK (< 10)${NC}"
  fi
}

# Execute cleanup
echo -e "${BLUE}---${NC}"
compress_attempts_log
echo ""
compress_temp_memory
echo ""
compress_validation_loop
echo ""
archive_completed_workflows
echo ""
clean_old_backups

echo ""
echo -e "${GREEN}✅ Limpeza concluída!${NC}"
echo -e "${BLUE}Backups em: $BACKUP_DIR${NC}"
echo ""
echo -e "${YELLOW}💡 Dica: Execute este script semanalmente ou quando .context/ > 100KB${NC}"
echo -e "${YELLOW}💡 Comando: du -sh .context/ (verificar tamanho)${NC}"
