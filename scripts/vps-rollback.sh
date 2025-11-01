#!/bin/bash

# ============================================================================
# Generic VPS Rollback Script (Template)
# ============================================================================
# CUSTOMIZE: Configure VPS settings in .env.production or directly in this file
# Description: Quick rollback script to revert problematic deployments
# Usage: ./vps-rollback.sh [production|staging]
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
VPS_PATH="${VPS_PATH:-/root/myapp}"
DOMAIN="${DOMAIN:-myapp.example.com}"
STACK_NAME="${STACK_NAME:-myapp}"
IMAGE_NAME="${IMAGE_NAME:-$STACK_NAME}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

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

# ----------------------------------------------------------------------------
# Parameter validation
# ----------------------------------------------------------------------------
if [ -z "$1" ]; then
    log_error "Environment not specified!"
    echo "Usage: ./vps-rollback.sh [production|staging]"
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
    VPS_PATH="${VPS_PATH}-staging"
fi

# ----------------------------------------------------------------------------
# Banner
# ----------------------------------------------------------------------------
echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║           Generic VPS Rollback Script                      ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_warning "WARNING: This operation will revert to the previous commit!"
echo ""
log_info "Environment: $ENVIRONMENT"
log_info "VPS Host: $VPS_USER@$VPS_HOST"
log_info "Stack: $STACK_NAME"
echo ""

# ----------------------------------------------------------------------------
# Validation: Check required variables
# ----------------------------------------------------------------------------
if [ "$VPS_HOST" == "192.168.1.100" ]; then
    log_error "VPS_HOST is still the default value!"
    log_warning "Please configure VPS settings in .env.production or this script"
    exit 1
fi

# ----------------------------------------------------------------------------
# Validate SSH access
# ----------------------------------------------------------------------------
log_info "Validating SSH access..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "exit" 2>/dev/null; then
    log_success "SSH access validated"
else
    log_error "Failed to connect via SSH"
    exit 1
fi

# ----------------------------------------------------------------------------
# Show current and previous commits
# ----------------------------------------------------------------------------
log_info "Checking commits..."
echo ""

CURRENT_COMMIT=$(ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git log -1 --oneline" 2>/dev/null || echo "Unable to get current commit")
PREVIOUS_COMMIT=$(ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git log -2 --oneline | tail -n 1" 2>/dev/null || echo "Unable to get previous commit")

echo -e "${YELLOW}Current commit:${NC}"
echo "  $CURRENT_COMMIT"
echo ""
echo -e "${YELLOW}Previous commit (rollback target):${NC}"
echo "  $PREVIOUS_COMMIT"
echo ""

# ----------------------------------------------------------------------------
# User confirmation
# ----------------------------------------------------------------------------
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                    CONFIRMATION REQUIRED                    ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_warning "This operation will:"
echo "  1. Revert code to previous commit (HEAD~1)"
echo "  2. Rebuild Docker image"
echo "  3. Redeploy stack $STACK_NAME"
echo ""
log_error "This action cannot be undone automatically!"
echo ""

read -p "Are you sure you want to continue? (type 'YES' to confirm): " CONFIRMATION

if [ "$CONFIRMATION" != "YES" ]; then
    log_warning "Rollback cancelled by user"
    exit 0
fi

echo ""
log_info "Starting rollback..."
echo ""

# ----------------------------------------------------------------------------
# 1. Git checkout HEAD~1
# ----------------------------------------------------------------------------
log_info "Reverting code to previous commit..."

# Save current branch
CURRENT_BRANCH=$(ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git rev-parse --abbrev-ref HEAD" 2>/dev/null || echo "main")
log_info "Current branch: $CURRENT_BRANCH"

# Checkout previous commit
ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git reset --hard HEAD~1" || {
    log_error "Failed to execute git reset"
    log_warning "Trying alternative rollback with git checkout..."
    ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git checkout HEAD~1" || {
        log_error "Code rollback FAILED"
        exit 1
    }
}

log_success "Code reverted to previous commit"

# Verify current commit after rollback
NEW_CURRENT_COMMIT=$(ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git log -1 --oneline")
log_info "New current commit: $NEW_CURRENT_COMMIT"
echo ""

# ----------------------------------------------------------------------------
# 2. Rebuild Docker image
# ----------------------------------------------------------------------------
log_info "Rebuilding Docker image..."
echo -e "${YELLOW}This may take several minutes...${NC}"

# Check if Dockerfile exists
DOCKERFILE_CMD="if [ -f '$VPS_PATH/Dockerfile.react' ]; then echo 'Dockerfile.react'; elif [ -f '$VPS_PATH/Dockerfile' ]; then echo 'Dockerfile'; else echo ''; fi"
DOCKERFILE=$(ssh "$VPS_USER@$VPS_HOST" "$DOCKERFILE_CMD")

if [ -z "$DOCKERFILE" ]; then
    log_error "No Dockerfile found on VPS"
    log_warning "Trying to revert git to previous state..."
    ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git reset --hard HEAD@{1}" || true
    exit 1
fi

ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -f $DOCKERFILE ." || {
    log_error "Failed to execute Docker build"
    log_warning "Trying to revert git to previous state..."
    ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git reset --hard HEAD@{1}" || true
    exit 1
}

log_success "Docker build completed"

# ----------------------------------------------------------------------------
# 3. Redeploy stack
# ----------------------------------------------------------------------------
log_info "Redeploying stack..."

# Find compose file
COMPOSE_CMD="if [ -f '$VPS_PATH/docker-compose.swarm.yml' ]; then echo 'docker-compose.swarm.yml'; elif [ -f '$VPS_PATH/docker-compose.yml' ]; then echo 'docker-compose.yml'; else echo ''; fi"
COMPOSE_FILE=$(ssh "$VPS_USER@$VPS_HOST" "$COMPOSE_CMD")

if [ -z "$COMPOSE_FILE" ]; then
    log_error "No docker-compose file found on VPS"
    exit 1
fi

ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && docker stack deploy -c $COMPOSE_FILE $STACK_NAME" || {
    log_error "Failed to execute Docker stack deploy"
    exit 1
}

log_success "Stack redeployed"

# ----------------------------------------------------------------------------
# 4. Wait for containers to restart
# ----------------------------------------------------------------------------
log_info "Waiting for containers to restart (30s)..."
for i in {30..1}; do
    echo -ne "${YELLOW}⏳ $i seconds remaining...\r${NC}"
    sleep 1
done
echo -e "\n"
log_success "Restart period completed"

# ----------------------------------------------------------------------------
# 5. Post-rollback validation
# ----------------------------------------------------------------------------
log_info "Running post-rollback validation..."

# Check service status
log_info "Service status:"
ssh "$VPS_USER@$VPS_HOST" "docker service ls --filter name=$STACK_NAME"
echo ""

# Health check
log_info "Running health check..."
HEALTH_CHECK_URL="https://$DOMAIN"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$HEALTH_CHECK_URL" || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
    log_success "Health check passed (HTTP $HTTP_STATUS)"
elif [ "$HTTP_STATUS" == "000" ]; then
    log_error "Health check failed (timeout or connection error)"
    log_warning "Application may have serious issues"
    echo ""
    log_warning "Check logs: ssh $VPS_USER@$VPS_HOST 'docker service logs ${STACK_NAME}_app'"
    exit 1
else
    log_warning "Health check returned HTTP $HTTP_STATUS"
    log_warning "Application may be starting"
fi

# ----------------------------------------------------------------------------
# 6. Show recent logs
# ----------------------------------------------------------------------------
log_info "Recent service logs:"
echo -e "${YELLOW}----------------------------------------${NC}"
ssh "$VPS_USER@$VPS_HOST" "docker service logs --tail 20 ${STACK_NAME}_app 2>&1 || echo 'Service does not have logs yet'"
echo -e "${YELLOW}----------------------------------------${NC}"

# ----------------------------------------------------------------------------
# Final summary
# ----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Rollback completed successfully!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_success "Environment: $ENVIRONMENT"
log_success "Previous commit restored: $NEW_CURRENT_COMMIT"
log_success "URL: $HEALTH_CHECK_URL"
echo ""
log_info "Next steps:"
echo "  1. Run smoke tests: ./scripts/vps-smoke-tests.sh $ENVIRONMENT"
echo "  2. Monitor logs: ssh $VPS_USER@$VPS_HOST 'docker service logs -f ${STACK_NAME}_app'"
echo "  3. Investigate the cause of the problem in the reverted commit"
echo ""
log_warning "IMPORTANT: Branch is now at HEAD~1 (detached HEAD state)"
log_warning "To return to normal state:"
echo "  - If rollback was successful: ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && git checkout $CURRENT_BRANCH'"
echo "  - If you need to keep rollback: create a branch or git push --force (be careful!)"
echo ""
