#!/bin/bash
# Script para validar que todas queries Supabase têm timeout handling
# Parte de: Learning Extraction - bible-study saveStudy fix

set -e

echo "🔍 Validando timeout em queries Supabase..."
echo ""

# Buscar queries Supabase sem Promise.race
QUERIES_WITHOUT_TIMEOUT=$(grep -rn "supabase\\.from(" src/ --include="*.ts" --include="*.tsx" | \
  while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    linenum=$(echo "$line" | cut -d: -f2)
    
    # Verificar se há Promise.race nas próximas 20 linhas
    if ! sed -n "${linenum},$((linenum + 20))p" "$file" | grep -q "Promise.race"; then
      echo "$line"
    fi
  done)

if [ -z "$QUERIES_WITHOUT_TIMEOUT" ]; then
  echo "✅ PASS: Todas queries Supabase têm timeout handling"
  exit 0
else
  echo "❌ FAIL: Queries sem timeout encontradas:"
  echo ""
  echo "$QUERIES_WITHOUT_TIMEOUT"
  echo ""
  echo "🔧 Fix: Adicionar Promise.race pattern:"
  echo ""
  cat << 'EXAMPLE'
const timeoutMs = 10000;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

try {
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Query timeout'));
    }, timeoutMs);
  });

  const queryPromise = supabase.from('table').select('*');
  
  const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
  // ...
} finally {
  if (timeoutId) clearTimeout(timeoutId);
}
EXAMPLE
  exit 1
fi
