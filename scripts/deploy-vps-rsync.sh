#!/bin/bash

# ============================================================================
# Life Tracker - Deploy VPS Rsync-First Script
# ============================================================================
# Descrição: Deploy usando rsync como estratégia primária (zero dependência git na VPS)
# Uso: ./deploy-vps-rsync.sh [production|staging]
# Autor: Life Tracker Team
# Data: 2025-11-20
# ADR: ADR-033 (Rsync-First Deploy Strategy)
# ============================================================================

set -e  # Fail fast

# ----------------------------------------------------------------------------
# Cores
# ----------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ----------------------------------------------------------------------------
# Funções de log
# ----------------------------------------------------------------------------
log_success() { echo -e "${GREEN}✓ $1${NC}"; }
log_error() { echo -e "${RED}✗ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ $1${NC}"; }

# ----------------------------------------------------------------------------
# Validação de parâmetros
# ----------------------------------------------------------------------------
if [ -z "$1" ]; then
    log_error "Ambiente não especificado!"
    echo "Uso: ./deploy-vps-rsync.sh [production|staging]"
    exit 1
fi

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    log_error "Ambiente inválido: $ENVIRONMENT"
    echo "Ambientes válidos: production, staging"
    exit 1
fi

# ----------------------------------------------------------------------------
# Variáveis por ambiente
# ----------------------------------------------------------------------------
if [ "$ENVIRONMENT" == "production" ]; then
    VPS_HOST="root@31.97.22.151"
    VPS_PATH="/root/life-tracker"
    DOMAIN="life-tracker.stackia.com.br"
    SERVICE_NAME="lifetracker_app"
    SSH_HELPER="$HOME/.ssh/vps-ssh.sh"
elif [ "$ENVIRONMENT" == "staging" ]; then
    VPS_HOST="root@31.97.22.151"
    VPS_PATH="/root/life-tracker-staging"
    DOMAIN="staging.life-tracker.stackia.com.br"
    SERVICE_NAME="lifetracker_staging_app"
    SSH_HELPER="$HOME/.ssh/vps-ssh.sh"
fi

# ----------------------------------------------------------------------------
# Banner
# ----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Life Tracker - Deploy VPS (Rsync-First)              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Ambiente: $ENVIRONMENT"
log_info "VPS Host: $VPS_HOST"
log_info "Domain: $DOMAIN"
log_info "Service: $SERVICE_NAME"
log_info "Strategy: Rsync-First (ADR-033)"
echo ""

# ----------------------------------------------------------------------------
# 1. VALIDAÇÕES PRÉ-DEPLOY
# ----------------------------------------------------------------------------
log_info "Validando integridade do código local..."

# 1.1 Branch main
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_error "VALIDAÇÃO FALHOU: Você NÃO está na branch main"
    log_warning "Branch atual: $CURRENT_BRANCH"
    echo ""
    echo "Execute: git checkout main"
    exit 1
fi
log_success "Branch: $CURRENT_BRANCH"

# 1.2 Working tree limpo
if ! git diff-index --quiet HEAD --; then
    log_error "VALIDAÇÃO FALHOU: Working tree com mudanças uncommitted"
    echo ""
    git status --short
    echo ""
    echo "Execute: git add . && git commit -m 'message'"
    exit 1
fi
log_success "Working tree: clean"

# 1.3 Sync com origin/main
log_info "Verificando sincronização com origin/main..."
git fetch origin --quiet

LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/main)

if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
    log_error "VALIDAÇÃO FALHOU: Branch main local DIFERENTE de origin/main"
    echo ""
    echo "Local:  $LOCAL_HASH"
    echo "Remote: $REMOTE_HASH"
    echo ""
    echo "Execute: git pull origin main  OU  git push origin main"
    exit 1
fi
log_success "Sync: local = origin/main ($LOCAL_HASH)"

echo ""

# ----------------------------------------------------------------------------
# 2. BUILD LOCAL
# ----------------------------------------------------------------------------
log_info "Building aplicação localmente..."

npm run build

BUILD_SIZE=$(du -sh dist/ | awk '{print $1}')
log_success "Build completo: $BUILD_SIZE"

echo ""

# ----------------------------------------------------------------------------
# 3. RSYNC PARA VPS (Estratégia Primária)
# ----------------------------------------------------------------------------
log_info "Sincronizando código para VPS via rsync..."

# 3.1 Criar diretório VPS (se não existe)
$SSH_HELPER "mkdir -p $VPS_PATH" 2>/dev/null || true

# 3.2 Rsync código (exclui node_modules, .git, dist temporário)
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.production' \
  --exclude='.context' \
  --exclude='backups' \
  --exclude='*.log' \
  ./ $VPS_HOST:$VPS_PATH/

log_success "Código sincronizado (rsync)"

# 3.3 Rsync dist/ separadamente
rsync -avz --delete \
  dist/ $VPS_HOST:$VPS_PATH/dist/

log_success "Build artifacts sincronizados"

echo ""

# ----------------------------------------------------------------------------
# 4. DOCKER BUILD NO VPS
# ----------------------------------------------------------------------------
log_info "Building Docker image na VPS..."

$SSH_HELPER "cd $VPS_PATH && docker build -t life-tracker:latest ."

DOCKER_SIZE=$($SSH_HELPER "docker images life-tracker:latest --format '{{.Size}}'")
log_success "Docker image built: $DOCKER_SIZE"

echo ""

# ----------------------------------------------------------------------------
# 5. UPDATE SERVICE (ZERO DOWNTIME)
# ----------------------------------------------------------------------------
log_info "Atualizando serviço Docker Swarm..."

# 5.1 Verificar se serviço existe
if ! $SSH_HELPER "docker service ls | grep -q $SERVICE_NAME"; then
    log_error "Serviço $SERVICE_NAME NÃO EXISTE"
    echo ""
    echo "Crie o serviço primeiro:"
    echo "  docker service create --name $SERVICE_NAME ..."
    exit 1
fi

# 5.2 Update com rollback automático
$SSH_HELPER "docker service update \
  --image life-tracker:latest \
  --update-parallelism 1 \
  --update-delay 10s \
  --update-failure-action rollback \
  --rollback-parallelism 1 \
  --rollback-delay 5s \
  $SERVICE_NAME"

log_success "Service atualizado (zero downtime)"

echo ""

# ----------------------------------------------------------------------------
# 6. SMOKE TESTS PÓS-DEPLOY
# ----------------------------------------------------------------------------
log_info "Executando smoke tests..."

# 6.1 Service status
sleep 5  # Aguardar convergência

SERVICE_STATUS=$($SSH_HELPER "docker service ps $SERVICE_NAME --format '{{.CurrentState}}' | head -1")
if echo "$SERVICE_STATUS" | grep -q "Running"; then
    log_success "Service status: $SERVICE_STATUS"
else
    log_error "Service status: $SERVICE_STATUS"
    exit 1
fi

# 6.2 HTTP health check
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
if [ "$HTTP_CODE" == "200" ]; then
    log_success "HTTP health check: $HTTP_CODE"
else
    log_error "HTTP health check: $HTTP_CODE (esperado 200)"

    # Mostrar logs para debug
    log_warning "Últimos logs do serviço:"
    $SSH_HELPER "docker service logs $SERVICE_NAME --tail 20"

    exit 1
fi

# 6.3 Response time
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://$DOMAIN)
log_success "Response time: ${RESPONSE_TIME}s"

echo ""

# ----------------------------------------------------------------------------
# 7. ROLLBACK INFORMATION
# ----------------------------------------------------------------------------
log_info "Deploy completo! 🎉"
echo ""
echo -e "${GREEN}Production URL: https://$DOMAIN${NC}"
echo ""
log_info "Rollback (se necessário):"
echo "  docker service update --rollback $SERVICE_NAME"
echo ""
log_info "Logs:"
echo "  docker service logs $SERVICE_NAME --tail 50 --follow"
echo ""

# ----------------------------------------------------------------------------
# 8. DEPLOY LOG
# ----------------------------------------------------------------------------
DEPLOY_LOG="deploys/deploy-$(date +%Y%m%d-%H%M%S).log"
mkdir -p deploys

cat > "$DEPLOY_LOG" << EOF
# Deploy Log

**Date**: $(date '+%Y-%m-%d %H:%M:%S %Z')
**Environment**: $ENVIRONMENT
**Strategy**: Rsync-First (ADR-033)
**Commit**: $LOCAL_HASH
**Build Size**: $BUILD_SIZE
**Docker Image**: $DOCKER_SIZE
**Service**: $SERVICE_NAME
**Status**: ✅ SUCCESS

## Smoke Tests
- Service Status: $SERVICE_STATUS
- HTTP Code: $HTTP_CODE
- Response Time: ${RESPONSE_TIME}s

## URLs
- Production: https://$DOMAIN

## Rollback Command
\`\`\`bash
docker service update --rollback $SERVICE_NAME
\`\`\`
EOF

log_success "Deploy log: $DEPLOY_LOG"
echo ""
