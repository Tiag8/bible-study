#!/bin/bash
# scripts/detect-pii-leaks.sh
# Detecta vazamentos de PII (Personally Identifiable Information) em logs

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel)"

echo "🔍 Scanning for PII leaks in console logs..."
echo ""

# Phone sem masking
echo "📱 Phone leaks (without maskPhone):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PHONE_LEAKS=$(grep -rn "console\.log.*phone\|console\.log.*Phone" "$PROJECT_ROOT/src/" "$PROJECT_ROOT/supabase/functions/" --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -v "maskPhone" | \
  grep -v ".test.ts" | \
  grep -v ".example.ts" || echo "")

if [ -z "$PHONE_LEAKS" ]; then
  echo "✅ No phone leaks detected"
else
  echo "$PHONE_LEAKS"
  PHONE_COUNT=$(echo "$PHONE_LEAKS" | wc -l)
  echo ""
  echo "⚠️  Found $PHONE_COUNT potential phone leak(s)"
fi

echo ""

# Email sem masking
echo "📧 Email leaks (without maskEmail):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
EMAIL_LEAKS=$(grep -rn "console\.log.*email\|console\.log.*Email" "$PROJECT_ROOT/src/" "$PROJECT_ROOT/supabase/functions/" --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -v "maskEmail" | \
  grep -v ".test.ts" | \
  grep -v ".example.ts" || echo "")

if [ -z "$EMAIL_LEAKS" ]; then
  echo "✅ No email leaks detected"
else
  echo "$EMAIL_LEAKS"
  EMAIL_COUNT=$(echo "$EMAIL_LEAKS" | wc -l)
  echo ""
  echo "⚠️  Found $EMAIL_COUNT potential email leak(s)"
fi

echo ""

# Secret/token
echo "🔑 Secret/token leaks:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SECRET_LEAKS=$(grep -rn "console\.log.*secret\|console\.log.*token\|console\.log.*password\|console\.log.*apikey\|console\.log.*Secret\|console\.log.*Token\|console\.log.*Password\|console\.log.*ApiKey" "$PROJECT_ROOT/src/" "$PROJECT_ROOT/supabase/functions/" --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -v ".test.ts" | \
  grep -v ".example.ts" | \
  grep -v "// " | \
  grep -v "Webhook secret configured.*YES.*NO" || echo "")

if [ -z "$SECRET_LEAKS" ]; then
  echo "✅ No secret/token leaks detected"
else
  echo "$SECRET_LEAKS"
  SECRET_COUNT=$(echo "$SECRET_LEAKS" | wc -l)
  echo ""
  echo "🔴 CRITICAL: Found $SECRET_COUNT potential secret leak(s)"
fi

echo ""

# AI request/response
echo "🤖 AI request/response leaks:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
AI_LEAKS=$(grep -rn "console\.log.*JSON\.stringify.*gemini\|console\.log.*\[DEBUG\].*Gemini\|console\.log.*JSON\.stringify.*openai\|console\.log.*\[DEBUG\].*OpenAI" "$PROJECT_ROOT/supabase/functions/" --include="*.ts" 2>/dev/null | \
  grep -v ".test.ts" | \
  grep -v "ENVIRONMENT.*development" || echo "")

if [ -z "$AI_LEAKS" ]; then
  echo "✅ No AI request/response leaks detected"
else
  echo "$AI_LEAKS"
  AI_COUNT=$(echo "$AI_LEAKS" | wc -l)
  echo ""
  echo "🔴 CRITICAL: Found $AI_COUNT AI data leak(s)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Scan complete!"

# Exit with error if critical leaks found
if [ -n "$SECRET_LEAKS" ] || [ -n "$AI_LEAKS" ]; then
  echo ""
  echo "❌ CRITICAL LEAKS DETECTED - FIX BEFORE MERGE"
  exit 1
fi

if [ -n "$PHONE_LEAKS" ] || [ -n "$EMAIL_LEAKS" ]; then
  echo ""
  echo "⚠️  PII LEAKS DETECTED - RECOMMEND FIX BEFORE MERGE"
  exit 0
fi

echo ""
echo "✅ No PII leaks detected"
exit 0
