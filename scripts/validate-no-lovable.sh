#!/bin/bash

# validate-no-lovable.sh
# Valida que ZERO referências ao Lovable Gateway existem em código executável

set -e

echo "🔍 Validando remoção completa do Lovable Gateway..."

# Arquivos a ignorar (docs, backups, exemplos)
IGNORE_PATTERN="docs/|\.md$|\.backup|example|test-lovable"

# Buscar referências em código executável
LOVABLE_REFS=$(rg "ai\.gateway\.lovable" \
  --type-add 'code:*.{ts,tsx,js,jsx}' \
  --type code \
  --files-with-matches \
  | grep -vE "$IGNORE_PATTERN" || true)

if [ -n "$LOVABLE_REFS" ]; then
  echo "❌ FALHA: Referências ao Lovable encontradas em código executável:"
  echo "$LOVABLE_REFS"
  echo ""
  echo "Detalhes:"
  rg "ai\.gateway\.lovable" \
    --type-add 'code:*.{ts,tsx,js,jsx}' \
    --type code \
    -n \
    | grep -vE "$IGNORE_PATTERN"
  exit 1
fi

echo "✅ SUCESSO: Zero referências ao Lovable Gateway em código executável"
echo ""
echo "📋 Referências em docs/exemplos (OK - não executado):"
rg "ai\.gateway\.lovable" \
  --files-with-matches \
  | grep -E "$IGNORE_PATTERN" \
  | head -5
echo ""
echo "✅ Validação completa"
