#!/bin/bash
# scripts/validate-agent-files.sh
# Validação automática de arquivos de subagents (.claude/agents/)
#
# Verifica:
# 1. Campos válidos no frontmatter YAML (apenas name, description, tools, model)
# 2. Tamanho dos arquivos (recomendado < 20kb)
# 3. Frontmatter bem formatado (inicia e termina com ---)
#
# Uso:
#   ./scripts/validate-agent-files.sh

set -e

echo "=== Validação de Arquivos de Agentes ==="
echo ""

ERRORS=0
WARNINGS=0

# Cores para output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

for file in .claude/agents/*.md; do
  if [ ! -f "$file" ]; then
    continue
  fi

  filename=$(basename "$file")
  echo "📋 Validando: $filename"

  # Check 1: Frontmatter existe e está bem formatado
  if ! head -1 "$file" | grep -q "^---$"; then
    echo -e "  ${RED}❌ ERRO: Frontmatter não inicia com '---'${NC}"
    ((ERRORS++))
    continue
  fi

  # Extrair frontmatter (entre primeiro e segundo ---)
  # Note: No macOS, precisamos usar uma abordagem diferente
  frontmatter=$(awk 'BEGIN{p=0} /^---$/{p++; next} p==1{print}' "$file")

  # Check 2: Campos obrigatórios presentes
  if ! echo "$frontmatter" | grep -q "^name:"; then
    echo -e "  ${RED}❌ ERRO: Campo 'name:' ausente${NC}"
    ((ERRORS++))
  fi

  if ! echo "$frontmatter" | grep -q "^description:"; then
    echo -e "  ${RED}❌ ERRO: Campo 'description:' ausente${NC}"
    ((ERRORS++))
  fi

  # Check 3: Campos inválidos no frontmatter
  invalid_fields=$(echo "$frontmatter" | grep -vE '^(name|description|tools|model):' | grep ':' || true)
  if [ -n "$invalid_fields" ]; then
    echo -e "  ${RED}❌ ERRO: Campos inválidos encontrados:${NC}"
    echo "$invalid_fields" | while read -r line; do
      echo -e "    ${RED}  - $line${NC}"
    done
    ((ERRORS++))
  fi

  # Check 4: Tamanho do arquivo
  size=$(wc -c < "$file")
  size_kb=$((size / 1024))

  if [ $size -gt 20000 ]; then
    size_percent=$((size * 100 / 20000))
    echo -e "  ${YELLOW}⚠️  AVISO: Tamanho ${size}b (${size_kb}kb) - ${size_percent}% do limite recomendado (20kb)${NC}"
    ((WARNINGS++))
  else
    echo -e "  ${GREEN}✅ Tamanho: ${size}b (${size_kb}kb) - dentro do limite${NC}"
  fi

  # Check 5: Validar que name é lowercase com hyphens
  agent_name=$(echo "$frontmatter" | grep "^name:" | sed 's/name: *//')
  if echo "$agent_name" | grep -qE '[^a-z0-9-]'; then
    echo -e "  ${RED}❌ ERRO: Nome '$agent_name' deve conter apenas lowercase e hyphens${NC}"
    ((ERRORS++))
  fi

  # Check 6: Validar que model (se presente) é válido
  if echo "$frontmatter" | grep -q "^model:"; then
    model=$(echo "$frontmatter" | grep "^model:" | sed 's/model: *//')
    if ! echo "$model" | grep -qE '^(sonnet|opus|haiku|inherit)$'; then
      echo -e "  ${YELLOW}⚠️  AVISO: Modelo '$model' não é sonnet/opus/haiku/inherit${NC}"
      ((WARNINGS++))
    fi
  fi

  echo ""
done

# Summary
echo "=== Resumo da Validação ==="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ SUCESSO: Todos os agentes válidos${NC}"
  echo ""
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  AVISOS: $WARNINGS encontrados (não bloqueantes)${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ FALHA: $ERRORS erros encontrados${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Também: $WARNINGS avisos${NC}"
  fi
  echo ""
  echo "AÇÕES NECESSÁRIAS:"
  echo "1. Corrigir erros acima (frontmatter inválido)"
  echo "2. Consultar: docs/debugging-cases/003-agent-invocation-failure-color-field.md"
  echo "3. Documentação oficial: https://code.claude.com/docs/en/sub-agents"
  echo ""
  exit 1
fi
