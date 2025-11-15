#!/bin/bash
# scripts/console-log-stats.sh
# Contabiliza console.log por arquivo e gera estatísticas

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
FRONTEND_DIR="${FRONTEND_DIR:-$PROJECT_ROOT/src}"
BACKEND_DIR="${BACKEND_DIR:-$PROJECT_ROOT/supabase/functions}"
TEST_DIR="${TEST_DIR:-$PROJECT_ROOT/test}"

echo "📊 Console.log Statistics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Frontend
echo "🎨 FRONTEND ($FRONTEND_DIR)"
echo "────────────────────────────────────────────────────────"
FRONTEND_STATS=$(find "$FRONTEND_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | \
  grep -v "node_modules" | \
  while read file; do
    log_count=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")
    error_count=$(grep -c "console\.error" "$file" 2>/dev/null || echo "0")
    warn_count=$(grep -c "console\.warn" "$file" 2>/dev/null || echo "0")
    total=$((log_count + error_count + warn_count))

    if [ "$total" -gt 0 ]; then
      rel_path="${file#$PROJECT_ROOT/}"
      echo "$total|$log_count|$error_count|$warn_count|$rel_path"
    fi
  done | sort -t'|' -k1 -rn)

if [ -z "$FRONTEND_STATS" ]; then
  echo "✅ No console logs in frontend"
else
  echo "Total | .log | .error | .warn | File"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$FRONTEND_STATS" | while IFS='|' read total log_c error_c warn_c file; do
    printf "%5s | %4s | %6s | %5s | %s\n" "$total" "$log_c" "$error_c" "$warn_c" "$file"
  done

  FRONTEND_TOTAL=$(echo "$FRONTEND_STATS" | awk -F'|' '{sum+=$1} END {print sum}')
  FRONTEND_FILES=$(echo "$FRONTEND_STATS" | wc -l | tr -d ' ')
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Total: $FRONTEND_TOTAL console.* in $FRONTEND_FILES files"
fi

echo ""
echo ""

# Backend (sem test/example)
echo "⚙️  BACKEND ($BACKEND_DIR) - PRODUCTION ONLY"
echo "────────────────────────────────────────────────────────"
BACKEND_STATS=$(find "$BACKEND_DIR" -type f -name "*.ts" 2>/dev/null | \
  grep -v ".test.ts" | \
  grep -v ".example.ts" | \
  grep -v "node_modules" | \
  while read file; do
    log_count=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")
    error_count=$(grep -c "console\.error" "$file" 2>/dev/null || echo "0")
    warn_count=$(grep -c "console\.warn" "$file" 2>/dev/null || echo "0")
    debug_count=$(grep -c "console\.debug" "$file" 2>/dev/null || echo "0")
    total=$((log_count + error_count + warn_count + debug_count))

    if [ "$total" -gt 0 ]; then
      rel_path="${file#$PROJECT_ROOT/}"
      echo "$total|$log_count|$error_count|$warn_count|$debug_count|$rel_path"
    fi
  done | sort -t'|' -k1 -rn)

if [ -z "$BACKEND_STATS" ]; then
  echo "✅ No console logs in backend"
else
  echo "Total | .log | .error | .warn | .debug | File"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$BACKEND_STATS" | head -30 | while IFS='|' read total log_c error_c warn_c debug_c file; do
    printf "%5s | %4s | %6s | %5s | %6s | %s\n" "$total" "$log_c" "$error_c" "$warn_c" "$debug_c" "$file"
  done

  BACKEND_FILE_COUNT=$(echo "$BACKEND_STATS" | wc -l | tr -d ' ')
  if [ "$BACKEND_FILE_COUNT" -gt 30 ]; then
    echo "... (showing top 30 of $BACKEND_FILE_COUNT files)"
  fi

  BACKEND_TOTAL=$(echo "$BACKEND_STATS" | awk -F'|' '{sum+=$1} END {print sum}')
  BACKEND_FILES=$(echo "$BACKEND_STATS" | wc -l | tr -d ' ')
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Total: $BACKEND_TOTAL console.* in $BACKEND_FILES files"
fi

echo ""
echo ""

# Test/Example files
echo "🧪 TEST/EXAMPLE FILES (ignored in production)"
echo "────────────────────────────────────────────────────────"
TEST_STATS=$(find "$BACKEND_DIR" "$TEST_DIR" -type f \( -name "*.test.ts" -o -name "*.example.ts" \) 2>/dev/null | \
  while read file; do
    log_count=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")
    error_count=$(grep -c "console\.error" "$file" 2>/dev/null || echo "0")
    warn_count=$(grep -c "console\.warn" "$file" 2>/dev/null || echo "0")
    total=$((log_count + error_count + warn_count))

    if [ "$total" -gt 0 ]; then
      rel_path="${file#$PROJECT_ROOT/}"
      echo "$total|$log_count|$error_count|$warn_count|$rel_path"
    fi
  done | sort -t'|' -k1 -rn)

if [ -z "$TEST_STATS" ]; then
  echo "✅ No console logs in test/example files"
else
  echo "Total | .log | .error | .warn | File"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$TEST_STATS" | while IFS='|' read total log_c error_c warn_c file; do
    printf "%5s | %4s | %6s | %5s | %s\n" "$total" "$log_c" "$error_c" "$warn_c" "$file"
  done

  TEST_TOTAL=$(echo "$TEST_STATS" | awk -F'|' '{sum+=$1} END {print sum}')
  TEST_FILES=$(echo "$TEST_STATS" | wc -l | tr -d ' ')
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Total: $TEST_TOTAL console.* in $TEST_FILES files (OK for tests)"
fi

echo ""
echo ""

# Summary
echo "📈 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FRONTEND_TOTAL=${FRONTEND_TOTAL:-0}
BACKEND_TOTAL=${BACKEND_TOTAL:-0}
TEST_TOTAL=${TEST_TOTAL:-0}
GRAND_TOTAL=$((FRONTEND_TOTAL + BACKEND_TOTAL + TEST_TOTAL))

echo "Frontend:      $FRONTEND_TOTAL console.*"
echo "Backend:       $BACKEND_TOTAL console.*"
echo "Test/Example:  $TEST_TOTAL console.*"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TOTAL:         $GRAND_TOTAL console.*"
echo ""

# Recommendations
PRODUCTION_TOTAL=$((FRONTEND_TOTAL + BACKEND_TOTAL))

if [ "$PRODUCTION_TOTAL" -gt 500 ]; then
  echo "🔴 HIGH: $PRODUCTION_TOTAL console.* in production code"
  echo "   Recommend: FASE 2 cleanup (target: < 100)"
elif [ "$PRODUCTION_TOTAL" -gt 100 ]; then
  echo "🟡 MEDIUM: $PRODUCTION_TOTAL console.* in production code"
  echo "   Recommend: Review and reduce (target: < 100)"
elif [ "$PRODUCTION_TOTAL" -gt 50 ]; then
  echo "🟢 LOW: $PRODUCTION_TOTAL console.* in production code"
  echo "   Acceptable, but monitor growth"
else
  echo "✅ GOOD: $PRODUCTION_TOTAL console.* in production code"
fi

echo ""
