#!/bin/bash

# ============================================================================
# Generic VPS Deploy Script (Template)
# ============================================================================
# CUSTOMIZE: Configure VPS settings in .env.production or directly in this file
# Description: Main automated deploy script for VPS environments
# Usage: ./deploy-vps.sh [production|staging]
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
VPS_USER="${VPS_USER:-root}"                     # SSH user (ex: root, deploy, ubuntu)
VPS_HOST="${VPS_HOST:-192.168.1.100}"            # VPS IP or hostname
VPS_PATH="${VPS_PATH:-/root/myapp}"              # Deploy path on VPS
DOMAIN="${DOMAIN:-myapp.example.com}"            # Application domain
STACK_NAME="${STACK_NAME:-myapp}"                # Docker Swarm stack name
IMAGE_NAME="${IMAGE_NAME:-$STACK_NAME}"          # Docker image name
IMAGE_TAG="${IMAGE_TAG:-latest}"                 # Docker image tag

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
    echo "Usage: ./deploy-vps.sh [production|staging]"
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
    # Override for staging (example - adjust as needed)
    DOMAIN="${STAGING_DOMAIN:-staging.$DOMAIN}"
    STACK_NAME="${STACK_NAME}-staging"
    VPS_PATH="${VPS_PATH}-staging"
fi

# ----------------------------------------------------------------------------
# Banner
# ----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Generic VPS Deploy Script                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Environment: $ENVIRONMENT"
log_info "VPS Host: $VPS_USER@$VPS_HOST"
log_info "Domain: $DOMAIN"
log_info "Stack: $STACK_NAME"
log_info "VPS Path: $VPS_PATH"
echo ""

# ----------------------------------------------------------------------------
# Validation: Check required variables
# ----------------------------------------------------------------------------
if [ "$VPS_HOST" == "192.168.1.100" ]; then
    log_error "VPS_HOST is still the default value!"
    log_warning "Please configure VPS settings in .env.production or this script"
    log_warning "See CONFIGURATION SECTION at the top of this file"
    exit 1
fi

if [ "$DOMAIN" == "myapp.example.com" ]; then
    log_error "DOMAIN is still the default value!"
    log_warning "Please configure DOMAIN in .env.production or this script"
    exit 1
fi

# ----------------------------------------------------------------------------
# 1. Validate SSH access
# ----------------------------------------------------------------------------
log_info "Validating SSH access..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "exit" 2>/dev/null; then
    log_success "SSH access validated successfully"
else
    log_error "Failed to connect via SSH"
    log_warning "Check:"
    echo "  - SSH keys are configured"
    echo "  - Host is accessible"
    echo "  - Firewall is not blocking the connection"
    exit 1
fi

# ----------------------------------------------------------------------------
# 2. Validate directory exists on VPS
# ----------------------------------------------------------------------------
log_info "Validating directory on VPS..."
if ssh "$VPS_USER@$VPS_HOST" "[ -d '$VPS_PATH' ]"; then
    log_success "Directory found: $VPS_PATH"
else
    log_error "Directory not found: $VPS_PATH"
    log_warning "Creating directory..."
    ssh "$VPS_USER@$VPS_HOST" "mkdir -p $VPS_PATH"
    log_success "Directory created"
fi

# ----------------------------------------------------------------------------
# 3. Git pull on VPS (optional - only if using git on VPS)
# ----------------------------------------------------------------------------
log_info "Checking for git repository on VPS..."
if ssh "$VPS_USER@$VPS_HOST" "[ -d '$VPS_PATH/.git' ]"; then
    log_info "Git repository found. Updating code on VPS..."
    ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git pull origin main" || {
        log_error "Failed to execute git pull"
        exit 1
    }
    log_success "Code updated successfully"
else
    log_warning "No git repository on VPS. Skipping git pull."
    log_info "Will transfer Docker image instead"
fi

# ----------------------------------------------------------------------------
# 4. Check if Docker is running
# ----------------------------------------------------------------------------
log_info "Checking Docker on VPS..."
if ssh "$VPS_USER@$VPS_HOST" "docker info" >/dev/null 2>&1; then
    log_success "Docker is running"
else
    log_error "Docker is not running or not installed"
    exit 1
fi

# ----------------------------------------------------------------------------
# 5. Docker build locally
# ----------------------------------------------------------------------------
log_info "Building Docker image locally..."
echo -e "${YELLOW}This may take several minutes...${NC}"

# Check if Dockerfile exists (try multiple names)
DOCKERFILE=""
if [ -f "Dockerfile.react" ]; then
    DOCKERFILE="Dockerfile.react"
elif [ -f "Dockerfile" ]; then
    DOCKERFILE="Dockerfile"
else
    log_error "No Dockerfile found (tried: Dockerfile.react, Dockerfile)"
    exit 1
fi

docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -f $DOCKERFILE . || {
    log_error "Failed to execute Docker build"
    exit 1
}
log_success "Docker build completed"

# ----------------------------------------------------------------------------
# 6. Save Docker image as tar
# ----------------------------------------------------------------------------
log_info "Saving image to tar..."
docker save ${IMAGE_NAME}:${IMAGE_TAG} -o /tmp/${IMAGE_NAME}.tar || {
    log_error "Failed to save Docker image"
    exit 1
}
log_success "Image saved to /tmp/${IMAGE_NAME}.tar"

# ----------------------------------------------------------------------------
# 7. Transfer image to VPS
# ----------------------------------------------------------------------------
log_info "Transferring image to VPS..."
echo -e "${YELLOW}This may take several minutes depending on internet speed...${NC}"
scp /tmp/${IMAGE_NAME}.tar $VPS_USER@$VPS_HOST:/tmp/ || {
    log_error "SCP transfer FAILED"
    exit 1
}
log_success "Image transferred"

# ----------------------------------------------------------------------------
# 8. Load image on VPS
# ----------------------------------------------------------------------------
log_info "Loading image on VPS..."
ssh "$VPS_USER@$VPS_HOST" "docker load -i /tmp/${IMAGE_NAME}.tar && rm /tmp/${IMAGE_NAME}.tar" || {
    log_error "Docker load FAILED"
    exit 1
}
log_success "Image loaded on VPS"

# ----------------------------------------------------------------------------
# 9. Transfer docker-compose file to VPS
# ----------------------------------------------------------------------------
log_info "Transferring docker-compose file..."

# Check which compose file exists
COMPOSE_FILE=""
if [ -f "docker-compose.swarm.yml" ]; then
    COMPOSE_FILE="docker-compose.swarm.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
else
    log_error "No docker-compose file found (tried: docker-compose.swarm.yml, docker-compose.yml)"
    exit 1
fi

scp $COMPOSE_FILE $VPS_USER@$VPS_HOST:/tmp/docker-compose-$STACK_NAME.yml || {
    log_error "docker-compose transfer FAILED"
    exit 1
}
log_success "docker-compose transferred"

# ----------------------------------------------------------------------------
# 10. Deploy stack to Docker Swarm
# ----------------------------------------------------------------------------
log_info "Deploying stack to Docker Swarm..."
ssh "$VPS_USER@$VPS_HOST" "docker stack deploy -c /tmp/docker-compose-$STACK_NAME.yml $STACK_NAME" || {
    log_error "Stack deploy FAILED"
    exit 1
}
log_success "Stack $STACK_NAME deployed"

# Clean up local tar file
rm /tmp/${IMAGE_NAME}.tar

# ----------------------------------------------------------------------------
# 11. Wait for containers to start
# ----------------------------------------------------------------------------
log_info "Waiting for containers to start (30s)..."
for i in {30..1}; do
    echo -ne "${YELLOW}⏳ $i seconds remaining...\r${NC}"
    sleep 1
done
echo -e "\n"
log_success "Initialization period completed"

# ----------------------------------------------------------------------------
# 12. Check service status
# ----------------------------------------------------------------------------
log_info "Checking service status..."
ssh "$VPS_USER@$VPS_HOST" "docker service ls --filter name=$STACK_NAME"

# ----------------------------------------------------------------------------
# 13. Health check
# ----------------------------------------------------------------------------
log_info "Running health check..."

HEALTH_CHECK_URL="https://$DOMAIN"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$HEALTH_CHECK_URL" || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
    log_success "Health check passed (HTTP $HTTP_STATUS)"
elif [ "$HTTP_STATUS" == "000" ]; then
    log_error "Health check failed (timeout or connection error)"
    log_warning "Check:"
    echo "  - Domain is pointing to correct IP"
    echo "  - SSL certificate is valid"
    echo "  - Container is running: docker service ls"
    exit 1
else
    log_warning "Health check returned HTTP $HTTP_STATUS"
    log_warning "Application may be starting or has issues"
fi

# ----------------------------------------------------------------------------
# 14. Show recent logs (last 20 lines)
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
echo -e "${GREEN}║              Deploy completed successfully!                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_success "Environment: $ENVIRONMENT"
log_success "URL: $HEALTH_CHECK_URL"
log_success "Stack: $STACK_NAME"
echo ""
log_info "Next steps:"
echo "  1. Run smoke tests: ./scripts/vps-smoke-tests.sh $ENVIRONMENT"
echo "  2. Monitor logs: ssh $VPS_USER@$VPS_HOST 'docker service logs -f ${STACK_NAME}_app'"
echo "  3. Check metrics: $HEALTH_CHECK_URL/metrics (if available)"
echo ""
log_warning "In case of problems, run rollback: ./scripts/vps-rollback.sh $ENVIRONMENT"
echo ""
