#!/bin/bash

# ============================================================================
# Generic VPS Smoke Tests Script (Template)
# ============================================================================
# CUSTOMIZE: Configure VPS settings in .env.production or directly in this file
# Description: Automated post-deploy tests for quick validation
# Usage: ./vps-smoke-tests.sh [production|staging]
# Author: Your Team
# Date: 2025-10-31
# ============================================================================

set -e  # Fail fast on error

# ----------------------------------------------------------------------------
# CONFIGURATION SECTION - CUSTOMIZE FOR YOUR PROJECT!
# ----------------------------------------------------------------------------
# Option 1: Load from .env.production (recommended)
if [ -f .env.production ]; then
    source .env.production
fi

# Option 2: Set directly here (or override .env.production values)
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-192.168.1.100}"
DOMAIN="${DOMAIN:-myapp.example.com}"
STACK_NAME="${STACK_NAME:-myapp}"

# ----------------------------------------------------------------------------
# Colors for output
# ----------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ----------------------------------------------------------------------------
# Logging functions
# ----------------------------------------------------------------------------
log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

log_test() {
    echo -e "${BLUE}━━━ $1${NC}"
}

# ----------------------------------------------------------------------------
# Test tracking variables
# ----------------------------------------------------------------------------
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# ----------------------------------------------------------------------------
# Function to register test result
# ----------------------------------------------------------------------------
test_passed() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    PASSED_TESTS=$((PASSED_TESTS + 1))
    log_success "PASSED: $1"
    echo ""
}

test_failed() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    FAILED_TESTS=$((FAILED_TESTS + 1))
    log_error "FAILED: $1"
    if [ ! -z "$2" ]; then
        echo -e "${YELLOW}Details: $2${NC}"
    fi
    echo ""
}

# ----------------------------------------------------------------------------
# Parameter validation
# ----------------------------------------------------------------------------
if [ -z "$1" ]; then
    log_error "Environment not specified!"
    echo "Usage: ./vps-smoke-tests.sh [production|staging]"
    exit 1
fi

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    log_error "Invalid environment: $ENVIRONMENT"
    echo "Valid environments: production, staging"
    exit 1
fi

# ----------------------------------------------------------------------------
# Environment-specific overrides (optional)
# ----------------------------------------------------------------------------
if [ "$ENVIRONMENT" == "staging" ]; then
    DOMAIN="${STAGING_DOMAIN:-staging.$DOMAIN}"
    STACK_NAME="${STACK_NAME}-staging"
fi

BASE_URL="https://$DOMAIN"

# ----------------------------------------------------------------------------
# Validation: Check required variables
# ----------------------------------------------------------------------------
if [ "$VPS_HOST" == "192.168.1.100" ]; then
    log_error "VPS_HOST is still the default value!"
    log_warning "Please configure VPS settings in .env.production or this script"
    exit 1
fi

if [ "$DOMAIN" == "myapp.example.com" ]; then
    log_error "DOMAIN is still the default value!"
    log_warning "Please configure DOMAIN in .env.production or this script"
    exit 1
fi

# ----------------------------------------------------------------------------
# Banner
# ----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Generic VPS Smoke Tests                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Environment: $ENVIRONMENT"
log_info "Domain: $DOMAIN"
log_info "Base URL: $BASE_URL"
echo ""
log_warning "Starting smoke tests..."
echo ""

# ----------------------------------------------------------------------------
# TEST 1: Home page (200 OK)
# ----------------------------------------------------------------------------
log_test "TEST 1: Home Page Accessible"
echo "URL: $BASE_URL"
echo -n "Checking... "

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 15 "$BASE_URL" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
    test_passed "Home page returned HTTP 200"
elif [ "$HTTP_STATUS" == "000" ]; then
    test_failed "Home page inaccessible" "Timeout or connection error"
else
    test_failed "Home page returned HTTP $HTTP_STATUS" "Expected: 200"
fi

# ----------------------------------------------------------------------------
# TEST 2: Health endpoint (if exists)
# ----------------------------------------------------------------------------
log_test "TEST 2: Health Endpoint"
HEALTH_URL="$BASE_URL/api/health"
echo "URL: $HEALTH_URL"
echo -n "Checking... "

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
    # Check if returns valid JSON
    RESPONSE=$(curl -s -L --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "")
    if echo "$RESPONSE" | grep -q "status" 2>/dev/null; then
        test_passed "Health endpoint returned valid JSON (HTTP 200)"
    else
        test_failed "Health endpoint did not return expected JSON" "Response: $RESPONSE"
    fi
elif [ "$HTTP_STATUS" == "404" ]; then
    log_warning "Health endpoint not implemented (HTTP 404) - skipping test"
    echo ""
elif [ "$HTTP_STATUS" == "000" ]; then
    test_failed "Health endpoint inaccessible" "Timeout or connection error"
else
    test_failed "Health endpoint returned HTTP $HTTP_STATUS" "Expected: 200 or 404"
fi

# ----------------------------------------------------------------------------
# TEST 3: Static resources (CSS/JS)
# ----------------------------------------------------------------------------
log_test "TEST 3: Static Resources"
echo "Checking if assets are loaded..."

# Download HTML and check for asset references
HTML_CONTENT=$(curl -s -L --max-time 15 "$BASE_URL" 2>/dev/null || echo "")

if echo "$HTML_CONTENT" | grep -q -E "(\.css|\.js)" 2>/dev/null; then
    # Try to get first CSS file found
    FIRST_CSS=$(echo "$HTML_CONTENT" | grep -oP 'href="[^"]*\.css[^"]*"' | head -n 1 | sed 's/href="//;s/"$//' || echo "")

    if [ ! -z "$FIRST_CSS" ]; then
        # If relative path, add base URL
        if [[ "$FIRST_CSS" == /* ]]; then
            CSS_URL="$BASE_URL$FIRST_CSS"
        elif [[ "$FIRST_CSS" == http* ]]; then
            CSS_URL="$FIRST_CSS"
        else
            CSS_URL="$BASE_URL/$FIRST_CSS"
        fi

        CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$CSS_URL" 2>/dev/null || echo "000")

        if [ "$CSS_STATUS" == "200" ]; then
            test_passed "Static resources accessible (CSS HTTP 200)"
        else
            test_failed "CSS resource returned HTTP $CSS_STATUS" "URL: $CSS_URL"
        fi
    else
        test_passed "HTML loads (inline assets or not detected)"
    fi
else
    test_failed "HTML does not contain CSS/JS references" "Possible build problem"
fi

# ----------------------------------------------------------------------------
# TEST 4: Performance (< 2s load time)
# ----------------------------------------------------------------------------
log_test "TEST 4: Performance (Target: < 2s)"
echo "URL: $BASE_URL"
echo -n "Measuring response time... "

# Measure total response time
START_TIME=$(date +%s%3N)  # Milliseconds
curl -s -o /dev/null -L --max-time 15 "$BASE_URL" 2>/dev/null || echo ""
END_TIME=$(date +%s%3N)

RESPONSE_TIME=$((END_TIME - START_TIME))
RESPONSE_TIME_SECONDS=$(echo "scale=2; $RESPONSE_TIME / 1000" | bc 2>/dev/null || echo "N/A")

if [ "$RESPONSE_TIME_SECONDS" != "N/A" ]; then
    # Convert for comparison (remove decimal)
    RESPONSE_TIME_INT=$(echo "$RESPONSE_TIME_SECONDS * 1000" | bc 2>/dev/null | cut -d'.' -f1)

    if [ $RESPONSE_TIME_INT -lt 2000 ]; then
        test_passed "Response time: ${RESPONSE_TIME_SECONDS}s (< 2s)"
    elif [ $RESPONSE_TIME_INT -lt 5000 ]; then
        test_failed "Slow response time: ${RESPONSE_TIME_SECONDS}s" "Target: < 2s, Acceptable: < 5s"
    else
        test_failed "Very slow response time: ${RESPONSE_TIME_SECONDS}s" "Target: < 2s"
    fi
else
    log_warning "Could not measure response time"
    echo ""
fi

# ----------------------------------------------------------------------------
# TEST 5: Docker Services Status
# ----------------------------------------------------------------------------
log_test "TEST 5: Docker Services Health"
echo "Checking service status on VPS..."

# Check if services are running
SERVICES_STATUS=$(ssh "$VPS_USER@$VPS_HOST" "docker service ls --filter name=$STACK_NAME --format '{{.Replicas}}'" 2>/dev/null || echo "")

if [ ! -z "$SERVICES_STATUS" ]; then
    # Count services with all replicas running (format: 1/1, 2/2, etc)
    HEALTHY_SERVICES=$(echo "$SERVICES_STATUS" | grep -E "^([0-9]+)/\1$" | wc -l || echo "0")
    TOTAL_SERVICES=$(echo "$SERVICES_STATUS" | wc -l)

    if [ "$HEALTHY_SERVICES" -eq "$TOTAL_SERVICES" ] && [ "$TOTAL_SERVICES" -gt 0 ]; then
        test_passed "All Docker services are running ($HEALTHY_SERVICES/$TOTAL_SERVICES)"
    else
        test_failed "Some services are not fully running" "Healthy: $HEALTHY_SERVICES/$TOTAL_SERVICES"
    fi
else
    test_failed "Could not check Docker services status" "Check SSH access"
fi

# ----------------------------------------------------------------------------
# TEST 6: SSL Certificate (HTTPS)
# ----------------------------------------------------------------------------
log_test "TEST 6: SSL Certificate"
echo "Checking HTTPS certificate..."

SSL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL" 2>/dev/null || echo "000")

if [ "$SSL_STATUS" == "200" ]; then
    # Check certificate validity
    SSL_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d'=' -f2 || echo "")

    if [ ! -z "$SSL_EXPIRY" ]; then
        test_passed "Valid SSL certificate (Expires: $SSL_EXPIRY)"
    else
        test_passed "HTTPS working (could not verify expiration)"
    fi
else
    test_failed "SSL/HTTPS problem" "HTTP Status: $SSL_STATUS"
fi

# ----------------------------------------------------------------------------
# Final Report
# ----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    TEST SUMMARY                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
else
    SUCCESS_RATE=0
fi

echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "URL: ${YELLOW}$BASE_URL${NC}"
echo ""
echo -e "Total tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Tests passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests failed: ${RED}$FAILED_TESTS${NC}"
echo -e "Success rate: ${YELLOW}$SUCCESS_RATE%${NC}"
echo ""

# Determine overall status
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✓ ALL TESTS PASSED SUCCESSFULLY!                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    log_success "Deploy validated and working correctly!"
    EXIT_CODE=0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║        ⚠ SOME TESTS FAILED (>80% success)                 ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    log_warning "Deploy may be functional, but with minor issues"
    log_warning "Review the failed tests above"
    EXIT_CODE=0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           ✗ MANY TESTS FAILED (<80% success)               ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    log_error "Deploy may have serious issues!"
    log_error "Recommendations:"
    echo "  1. Check logs: ssh $VPS_USER@$VPS_HOST 'docker service logs ${STACK_NAME}_app'"
    echo "  2. Check services: ssh $VPS_USER@$VPS_HOST 'docker service ls'"
    echo "  3. Consider rollback: ./scripts/vps-rollback.sh $ENVIRONMENT"
    EXIT_CODE=1
fi

echo ""
log_info "Useful commands:"
echo "  - View logs: ssh $VPS_USER@$VPS_HOST 'docker service logs -f ${STACK_NAME}_app'"
echo "  - View services: ssh $VPS_USER@$VPS_HOST 'docker service ls'"
echo "  - Restart service: ssh $VPS_USER@$VPS_HOST 'docker service update --force ${STACK_NAME}_app'"
echo ""

exit $EXIT_CODE
