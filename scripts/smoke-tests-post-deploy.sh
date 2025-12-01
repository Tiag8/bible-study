#!/bin/bash
# FASE 27: Smoke Tests Pós-Deploy
# Workflow: 11b (VPS Deployment Execution)
# Domain: https://life-tracker.stackia.com.br

set -e

DOMAIN="life-tracker.stackia.com.br"
MAX_WAIT=180  # 3min
ELAPSED=0

echo "=========================================="
echo "FASE 27: SMOKE TESTS PÓS-DEPLOY"
echo "Domain: $DOMAIN"
echo "=========================================="
echo ""

# ============================================
# 1. AGUARDAR SERVICE RUNNING
# ============================================
echo "🔍 STEP 1: Aguardando service estar Running..."
while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS=$(ssh root@31.97.22.151 "docker service ps life-tracker_app --filter 'desired-state=running' --format '{{.CurrentState}}' 2>/dev/null" | head -1)

  if echo "$STATUS" | grep -q "Running"; then
    echo "✅ Service Running após ${ELAPSED}s"
    break
  else
    echo "⏳ Aguardando service start... (${ELAPSED}s/${MAX_WAIT}s)"
    echo "   Current status: $STATUS"
    sleep 10
    ELAPSED=$((ELAPSED + 10))
  fi
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "❌ BLOQUEIO: Service não iniciou em 3min"
  echo ""
  echo "Service PS:"
  ssh root@31.97.22.151 "docker service ps life-tracker_app --no-trunc"
  exit 1
fi

echo ""

# ============================================
# 2. AGUARDAR TRAEFIK SSL PROVISIONING
# ============================================
echo "🔍 STEP 2: Aguardando Traefik SSL provisioning..."
echo "⏳ Aguardando 30s para Let's Encrypt..."
sleep 30
echo "✅ SSL provisioning window complete"
echo ""

# ============================================
# 3. SMOKE TESTS
# ============================================
echo "=========================================="
echo "EXECUTANDO SMOKE TESTS"
echo "=========================================="
echo ""

# Inicializar contadores
TESTS_PASSED=0
TESTS_WARNINGS=0
TESTS_FAILED=0

# 3.1. HTTPS Connectivity
echo "🔍 TEST 1: HTTPS Connectivity"
HTTPS_STATUS=$(curl -s -o /dev/null -w '%{http_code}' https://$DOMAIN 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
  echo "✅ HTTPS OK (HTTP $HTTPS_STATUS)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  HTTPS_RESULT="✅"
elif [ "$HTTPS_STATUS" != "000" ]; then
  echo "⚠️ HTTPS responded but not 200 (HTTP $HTTPS_STATUS)"
  TESTS_WARNINGS=$((TESTS_WARNINGS + 1))
  HTTPS_RESULT="⚠️"

  # Tentar HTTP fallback
  HTTP_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://$DOMAIN 2>/dev/null || echo "000")
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ℹ️ HTTP OK (HTTP $HTTP_STATUS) - HTTPS cert issue?"
  fi
else
  echo "❌ HTTPS FAILED (no response)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  HTTPS_RESULT="❌"

  # Tentar HTTP fallback
  HTTP_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://$DOMAIN 2>/dev/null || echo "000")
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ⚠️ HTTP OK (HTTP $HTTP_STATUS) but HTTPS failed"
  else
    echo "   ❌ HTTP also failed (HTTP $HTTP_STATUS)"
  fi
fi
echo ""

# 3.2. HTML Validation
echo "🔍 TEST 2: HTML Validation"
HTML=$(curl -s https://$DOMAIN 2>/dev/null || echo "")
if echo "$HTML" | grep -q "<!DOCTYPE html>"; then
  echo "✅ HTML Valid (DOCTYPE found)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  HTML_RESULT="✅"
  HTML_SAMPLE=$(echo "$HTML" | head -c 200 | tr '\n' ' ')
  echo "   Sample: ${HTML_SAMPLE}..."
else
  echo "❌ HTML Invalid or Empty"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  HTML_RESULT="❌"
  echo "   Response (first 500 chars):"
  echo "$HTML" | head -c 500
fi
echo ""

# 3.3. Assets Check
echo "🔍 TEST 3: Assets Check"
if echo "$HTML" | grep -q "assets/"; then
  echo "✅ Assets Present (found 'assets/' in HTML)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  ASSETS_RESULT="✅"

  # Contar assets
  ASSET_COUNT=$(echo "$HTML" | grep -o "assets/" | wc -l)
  echo "   Found $ASSET_COUNT asset references"
else
  echo "⚠️ Assets Missing (Vite build issue?)"
  TESTS_WARNINGS=$((TESTS_WARNINGS + 1))
  ASSETS_RESULT="⚠️"
  echo "   HTML may be loading but without bundled assets"
fi
echo ""

# 3.4. SSL Certificate
echo "🔍 TEST 4: SSL Certificate"
SSL_INFO=$(curl -s https://$DOMAIN -v 2>&1 | grep -E "SSL certificate verify|subject:|issuer:" || echo "")
if echo "$SSL_INFO" | grep -q "SSL certificate verify ok"; then
  echo "✅ SSL Valid"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  SSL_RESULT="✅"

  # Extrair issuer
  ISSUER=$(echo "$SSL_INFO" | grep "issuer:" | head -1)
  echo "   $ISSUER"
else
  echo "⚠️ SSL Issue (may be self-signed or pending Let's Encrypt)"
  TESTS_WARNINGS=$((TESTS_WARNINGS + 1))
  SSL_RESULT="⚠️"

  if [ -n "$SSL_INFO" ]; then
    echo "   SSL Info:"
    echo "$SSL_INFO" | head -3
  else
    echo "   No SSL info retrieved"
  fi
fi
echo ""

# 3.5. Response Time
echo "🔍 TEST 5: Response Time"
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' https://$DOMAIN 2>/dev/null || echo "99.999")
echo "   Response time: ${RESPONSE_TIME}s"

# Usar bc se disponível, senão comparação string
if command -v bc &> /dev/null; then
  if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
    echo "✅ Performance OK (< 3s)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    PERF_RESULT="✅"
  else
    echo "⚠️ Slow response (> 3s)"
    TESTS_WARNINGS=$((TESTS_WARNINGS + 1))
    PERF_RESULT="⚠️"
  fi
else
  # Fallback: comparação string simples
  if [[ "$RESPONSE_TIME" < "3" ]]; then
    echo "✅ Performance OK (< 3s)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    PERF_RESULT="✅"
  else
    echo "⚠️ Slow response (> 3s)"
    TESTS_WARNINGS=$((TESTS_WARNINGS + 1))
    PERF_RESULT="⚠️"
  fi
fi
echo ""

# ============================================
# 4. SERVICE HEALTH CHECK
# ============================================
echo "🔍 TEST 6: Service Health Check"
SERVICE_STATE=$(ssh root@31.97.22.151 "docker service ps life-tracker_app --format 'State: {{.CurrentState}} | Error: {{.Error}}' --no-trunc" | head -1)
echo "$SERVICE_STATE"

if echo "$SERVICE_STATE" | grep -q "Running"; then
  echo "✅ Service Healthy"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  SERVICE_RESULT="✅"
else
  echo "❌ Service Not Healthy"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  SERVICE_RESULT="❌"

  # Mostrar últimas 3 tasks
  echo "   Last 3 tasks:"
  ssh root@31.97.22.151 "docker service ps life-tracker_app --format '{{.CurrentState}} | {{.Error}}' --no-trunc" | head -3
fi
echo ""

# ============================================
# 5. LOGS ERROR CHECK
# ============================================
echo "🔍 TEST 7: Logs Error Check"
LOGS=$(ssh root@31.97.22.151 "docker service logs --tail 50 life-tracker_app 2>&1" || echo "")
ERROR_COUNT=$(echo "$LOGS" | grep -i error | grep -v "0 errors" | wc -l | tr -d ' ')

echo "   Errors in logs: $ERROR_COUNT"
if [ "$ERROR_COUNT" -eq 0 ] || [ -z "$ERROR_COUNT" ]; then
  echo "✅ No errors in logs"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  LOGS_RESULT="✅"
  LOGS_ERRORS="none"
else
  echo "⚠️ Errors encontrados in logs:"
  TESTS_WARNINGS=$((TESTS_WARNINGS + 1))
  LOGS_RESULT="⚠️"

  LOGS_ERRORS=$(echo "$LOGS" | grep -i error | grep -v "0 errors" | head -10)
  echo "$LOGS_ERRORS"
fi
echo ""

# ============================================
# RESULTADO FINAL
# ============================================
echo "=========================================="
echo "RESULTADO SMOKE TESTS"
echo "=========================================="
echo ""
echo "✅ Passed: $TESTS_PASSED"
echo "⚠️ Warnings: $TESTS_WARNINGS"
echo "❌ Failed: $TESTS_FAILED"
echo ""

# Determinar status geral
if [ $TESTS_FAILED -gt 0 ]; then
  OVERALL_STATUS="❌ BLOQUEADO"
  DEPLOYMENT_HEALTHY="❌ NÃO"
  NEXT_ACTION="❌ Rollback necessário"
elif [ $TESTS_WARNINGS -gt 0 ]; then
  OVERALL_STATUS="⚠️ AVISO"
  DEPLOYMENT_HEALTHY="⚠️ PARCIAL"
  NEXT_ACTION="⚠️ Monitor por 10-15min"
else
  OVERALL_STATUS="✅ APROVADO"
  DEPLOYMENT_HEALTHY="✅ SIM"
  NEXT_ACTION="✅ Deploy Success - Monitorar por 10min"
fi

echo "Status Geral: $OVERALL_STATUS"
echo "Deployment Healthy: $DEPLOYMENT_HEALTHY"
echo "Next Action: $NEXT_ACTION"
echo ""

# ============================================
# JSON SUMMARY (para parsing)
# ============================================
cat << EOF

========================================
JSON SUMMARY
========================================
{
  "fase": "27",
  "status": "$OVERALL_STATUS",
  "smoke_tests": {
    "https_connectivity": "$HTTPS_RESULT",
    "html_valid": "$HTML_RESULT",
    "assets_present": "$ASSETS_RESULT",
    "ssl_valid": "$SSL_RESULT",
    "response_time_ok": "$PERF_RESULT",
    "service_healthy": "$SERVICE_RESULT",
    "logs_clean": "$LOGS_RESULT"
  },
  "metrics": {
    "service_start_time": "${ELAPSED}s",
    "response_time": "${RESPONSE_TIME}s",
    "error_count_logs": $ERROR_COUNT,
    "tests_passed": $TESTS_PASSED,
    "tests_warnings": $TESTS_WARNINGS,
    "tests_failed": $TESTS_FAILED
  },
  "evidence": {
    "https_response": "HTTP $HTTPS_STATUS",
    "html_sample": "${HTML_SAMPLE:-N/A}",
    "ssl_info": "${ISSUER:-N/A}",
    "service_state": "$(echo $SERVICE_STATE | cut -d'|' -f1 | xargs)",
    "logs_errors": "${LOGS_ERRORS:-none}"
  },
  "deployment_healthy": "$DEPLOYMENT_HEALTHY",
  "next_action": "$NEXT_ACTION"
}
========================================

EOF

# Exit code baseado no status
if [ $TESTS_FAILED -gt 0 ]; then
  exit 1
elif [ $TESTS_WARNINGS -gt 0 ]; then
  exit 2
else
  exit 0
fi
