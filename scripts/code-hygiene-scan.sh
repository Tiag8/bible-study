#!/bin/bash
# Code Hygiene Scanner
# Detecta sujeira, bloat, arquivos temporários
# Baseado em best practices NPR/Byldd/DEV.to/Medium (2025)

set -e

echo "🧹 CODE HYGIENE SCAN - $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')"
echo ""

REPORT="hygiene-report.txt"
> "$REPORT"

CRITICAL_COUNT=0

# ============================================================
# 1. ARQUIVOS TEMPORÁRIOS
# ============================================================
echo "1️⃣ Scanning temporary files..."
TEMP_FILES=$(find . -type f \( \
  -name "*.tmp" -o \
  -name "*.bak" -o \
  -name ".DS_Store" -o \
  -name "test-*.js" -o \
  -name "test-*.ts" \
\) 2>/dev/null | grep -v node_modules | grep -v .git || true)

if [ -n "$TEMP_FILES" ]; then
  echo "⚠️ TEMP FILES FOUND:" | tee -a "$REPORT"
  echo "$TEMP_FILES" | tee -a "$REPORT"
  CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
else
  echo "✅ No temp files" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

# ============================================================
# 2. CÓDIGO NÃO USADO (TypeScript)
# ============================================================
echo "2️⃣ Scanning unused code (ts-prune)..."
if command -v npx &> /dev/null; then
  UNUSED=$(npx ts-prune 2>/dev/null | grep -v "used in module" | head -20 || true)
  if [ -n "$UNUSED" ]; then
    echo "⚠️ UNUSED CODE (top 20):" | tee -a "$REPORT"
    echo "$UNUSED" | tee -a "$REPORT"
    CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
  else
    echo "✅ No unused code detected" | tee -a "$REPORT"
  fi
else
  echo "⚠️ npx not available, skipping ts-prune" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

# ============================================================
# 3. DUPLICAÇÃO DE CÓDIGO
# ============================================================
echo "3️⃣ Scanning code duplication (jscpd)..."
if command -v npx &> /dev/null; then
  # Executar jscpd e capturar saída
  JSCPD_OUTPUT=$(npx jscpd src/ --threshold 5 --reporters "console" 2>&1 || true)

  # Verificar se encontrou duplicação acima do threshold
  if echo "$JSCPD_OUTPUT" | grep -q "duplicated"; then
    DUPLICATION_PCT=$(echo "$JSCPD_OUTPUT" | grep -oP '\d+\.\d+%' | head -1 || echo "0%")
    echo "⚠️ CODE DUPLICATION: $DUPLICATION_PCT" | tee -a "$REPORT"
    echo "$JSCPD_OUTPUT" | head -10 | tee -a "$REPORT"
    CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
  else
    echo "✅ Duplication < 5% (acceptable)" | tee -a "$REPORT"
  fi
else
  echo "⚠️ npx not available, skipping jscpd" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

# ============================================================
# 4. TODOs ANTIGOS (> 7 dias)
# ============================================================
echo "4️⃣ Scanning TODOs/FIXMEs..."
TODOS=$(grep -r "TODO\|FIXME" src/ 2>/dev/null | wc -l || echo 0)
TODOS=$(echo "$TODOS" | xargs) # trim whitespace

if [ "$TODOS" -gt 20 ]; then
  echo "⚠️ $TODOS TODOs found (threshold: 20)" | tee -a "$REPORT"
  echo "Top 10 TODOs:" | tee -a "$REPORT"
  grep -rn "TODO\|FIXME" src/ 2>/dev/null | head -10 | tee -a "$REPORT"
  CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
else
  echo "✅ $TODOS TODOs (acceptable)" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

# ============================================================
# 5. CONSOLE.LOGS EM PRODUÇÃO
# ============================================================
echo "5️⃣ Scanning console.logs in src/..."
CONSOLE_LOGS=$(grep -r "console\.\(log\|debug\|warn\)" src/ --exclude-dir=node_modules 2>/dev/null | wc -l || echo 0)
CONSOLE_LOGS=$(echo "$CONSOLE_LOGS" | xargs) # trim

if [ "$CONSOLE_LOGS" -gt 5 ]; then
  echo "⚠️ $CONSOLE_LOGS console.logs found (threshold: 5)" | tee -a "$REPORT"
  echo "Top 10 console.logs:" | tee -a "$REPORT"
  grep -rn "console\.\(log\|debug\|warn\)" src/ --exclude-dir=node_modules 2>/dev/null | head -10 | tee -a "$REPORT"
  CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
else
  echo "✅ $CONSOLE_LOGS console.logs (acceptable)" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

# ============================================================
# 6. FORMATAÇÃO (Prettier)
# ============================================================
echo "6️⃣ Checking Prettier formatting..."
if command -v npx &> /dev/null; then
  UNFORMATTED=$(npx prettier --check "src/**/*.{ts,tsx}" 2>&1 | grep -c "Code style issues" || echo 0)

  if [ "$UNFORMATTED" -gt 0 ]; then
    echo "⚠️ Code not formatted. Run: npx prettier --write 'src/**/*.{ts,tsx}'" | tee -a "$REPORT"
    CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
  else
    echo "✅ Code properly formatted" | tee -a "$REPORT"
  fi
else
  echo "⚠️ npx not available, skipping Prettier" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

# ============================================================
# 7. ARQUIVOS README TEMPORÁRIOS
# ============================================================
echo "7️⃣ Scanning temporary README files..."
README_TEMPS=$(find . -type f -name "README-test-*.md" 2>/dev/null | grep -v node_modules || true)

if [ -n "$README_TEMPS" ]; then
  echo "⚠️ TEMPORARY READMEs FOUND:" | tee -a "$REPORT"
  echo "$README_TEMPS" | tee -a "$REPORT"
  CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
else
  echo "✅ No temporary READMEs" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

# ============================================================
# RELATÓRIO FINAL
# ============================================================
echo "========================================" | tee -a "$REPORT"
echo "📊 HYGIENE REPORT SUMMARY" | tee -a "$REPORT"
echo "========================================" | tee -a "$REPORT"
echo "Critical Issues: $CRITICAL_COUNT" | tee -a "$REPORT"
echo "Threshold: 3" | tee -a "$REPORT"
echo "Report saved: $REPORT" | tee -a "$REPORT"
echo "========================================" | tee -a "$REPORT"

# Exit code baseado em thresholds
if [ "$CRITICAL_COUNT" -gt 3 ]; then
  echo ""
  echo "❌ HYGIENE FAILURE: $CRITICAL_COUNT critical issues found (threshold: 3)"
  echo ""
  echo "🔧 RECOMMENDED ACTIONS:"
  echo "1. Review $REPORT for details"
  echo "2. Run: npx prettier --write 'src/**/*.{ts,tsx}'"
  echo "3. Remove temporary files"
  echo "4. Resolve or document TODOs"
  echo "5. Remove console.logs from production code"
  echo ""
  exit 1
else
  echo ""
  echo "✅ HYGIENE PASS: $CRITICAL_COUNT issues (threshold: 3)"
  echo ""
  exit 0
fi
