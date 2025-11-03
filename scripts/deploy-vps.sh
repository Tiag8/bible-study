#!/bin/bash

# ============================================================================
# Life Tracker - Deploy VPS Script
# ============================================================================
# Descrição: Script principal de deploy automático para ambientes VPS
# Uso: ./deploy-vps.sh [production|staging]
# Autor: Life Tracker Team
# Data: 2025-10-31
# ============================================================================

set -e  # Fail fast em caso de erro

# ----------------------------------------------------------------------------
# Cores para logs
# ----------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ----------------------------------------------------------------------------
# Funções de log
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
# Validação de parâmetros
# ----------------------------------------------------------------------------
if [ -z "$1" ]; then
    log_error "Ambiente não especificado!"
    echo "Uso: ./deploy-vps.sh [production|staging]"
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
    STACK_NAME="lifetracker"
    PORT="3000"
elif [ "$ENVIRONMENT" == "staging" ]; then
    VPS_HOST="root@31.97.22.151"
    VPS_PATH="/root/life-tracker-staging"
    DOMAIN="staging.life-tracker.stackia.com.br"
    STACK_NAME="lifetracker-staging"
    PORT="3001"
fi

# ----------------------------------------------------------------------------
# Banner
# ----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Life Tracker - Deploy VPS                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Ambiente: $ENVIRONMENT"
log_info "VPS Host: $VPS_HOST"
log_info "Domain: $DOMAIN"
log_info "Stack: $STACK_NAME"
echo ""

# ----------------------------------------------------------------------------
# 1. VALIDAÇÕES PRÉ-DEPLOY (Git/Branch/Merge)
# ----------------------------------------------------------------------------
log_info "Validando integridade do código local..."

# 1.1 Verificar se está na branch main
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_error "VALIDAÇÃO FALHOU: Você NÃO está na branch main"
    log_warning "Branch atual: $CURRENT_BRANCH"
    echo ""
    echo "Deploy deve ser feito SEMPRE da branch main!"
    echo "Execute: git checkout main"
    exit 1
fi
log_success "Branch: main"

# 1.2 Verificar se main está sincronizada com origin
log_info "Verificando sincronização com origin/main..."
git fetch origin main --quiet 2>/dev/null || {
    log_warning "Não foi possível fazer fetch de origin/main"
    log_warning "Continuando mesmo assim (offline?)"
}

LOCAL_HASH=$(git rev-parse main 2>/dev/null)
REMOTE_HASH=$(git rev-parse origin/main 2>/dev/null || echo "$LOCAL_HASH")

if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
    log_error "VALIDAÇÃO FALHOU: Branch main local está DESATUALIZADA"
    echo ""
    echo "Local:  $LOCAL_HASH"
    echo "Remote: $REMOTE_HASH"
    echo ""
    echo "Execute: git pull origin main"
    exit 1
fi
log_success "Main sincronizada com origin"

# 1.3 Verificar working tree limpo
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    log_error "VALIDAÇÃO FALHOU: Working tree com mudanças não commitadas"
    echo ""
    echo "Mudanças detectadas:"
    git status --short
    echo ""
    echo "Execute: git stash ou git commit antes do deploy"
    exit 1
fi
log_success "Working tree limpo"

# 1.4 Verificar que não há merge em progresso
if [ -f .git/MERGE_HEAD ]; then
    log_error "VALIDAÇÃO FALHOU: Merge em progresso detectado"
    echo ""
    echo "Complete ou aborte o merge antes do deploy:"
    echo "  git merge --abort      # Para abortar"
    echo "  git merge --continue   # Para continuar"
    exit 1
fi
log_success "Nenhum merge em progresso"

# 1.5 Verificar merge recente (evidência de feature integrada)
RECENT_MERGES=$(git log --oneline --merges -10 2>/dev/null | head -5)
if [ -z "$RECENT_MERGES" ]; then
    log_warning "ATENÇÃO: Nenhum merge detectado nos últimos 10 commits"
    echo ""
    echo "Últimos 5 commits a serem deployados:"
    git log --oneline -5 2>/dev/null || echo "(log indisponível)"
    echo ""
    log_warning "Você executou o Workflow 9 (Finalization/Merge)?"
    echo ""
    read -p "Confirmar deploy mesmo sem merge recente? (yes/NO): " CONFIRM_NO_MERGE
    if [ "$CONFIRM_NO_MERGE" != "yes" ]; then
        log_error "Deploy cancelado pelo usuário"
        echo "Execute o Workflow 9 primeiro para fazer merge da feature na main"
        exit 1
    fi
    log_warning "Deploy confirmado manualmente (sem merge recente)"
else
    log_success "Merge(s) recente(s) detectado(s)"
fi

# 1.6 Mostrar resumo dos commits a serem deployados
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
echo ""
if [ -n "$LAST_TAG" ]; then
    log_info "Commits desde último deploy ($LAST_TAG):"
    git log --oneline "$LAST_TAG..HEAD" 2>/dev/null | head -10 || echo "(nenhum commit novo)"
else
    log_info "Últimos 10 commits a serem deployados:"
    git log --oneline -10 2>/dev/null || echo "(log indisponível)"
fi
echo ""

log_success "Todas as validações pré-deploy passaram"
echo ""

# ----------------------------------------------------------------------------
# 2. Validar acesso SSH
# ----------------------------------------------------------------------------
log_info "Validando acesso SSH..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes "$VPS_HOST" "exit" 2>/dev/null; then
    log_success "Acesso SSH validado com sucesso"
else
    log_error "Falha ao conectar via SSH"
    log_warning "Verifique:"
    echo "  - Se a chave SSH está configurada"
    echo "  - Se o host está acessível"
    echo "  - Se o firewall está bloqueando a conexão"
    exit 1
fi

# ----------------------------------------------------------------------------
# 3. Validar se diretório existe na VPS
# ----------------------------------------------------------------------------
log_info "Validando diretório na VPS..."
if ssh "$VPS_HOST" "[ -d '$VPS_PATH' ]"; then
    log_success "Diretório encontrado: $VPS_PATH"
else
    log_error "Diretório não encontrado: $VPS_PATH"
    log_warning "Criando diretório..."
    ssh "$VPS_HOST" "mkdir -p $VPS_PATH"
    log_success "Diretório criado"
fi

# ----------------------------------------------------------------------------
# 4. Git pull na VPS
# ----------------------------------------------------------------------------
log_info "Atualizando código na VPS..."
ssh "$VPS_HOST" "cd $VPS_PATH && git pull origin main" || {
    log_error "Falha ao executar git pull"
    exit 1
}
log_success "Código atualizado com sucesso"

# ----------------------------------------------------------------------------
# 5. Verificar se Docker está rodando
# ----------------------------------------------------------------------------
log_info "Verificando Docker na VPS..."
if ssh "$VPS_HOST" "docker info" >/dev/null 2>&1; then
    log_success "Docker está rodando"
else
    log_error "Docker não está rodando ou não está instalado"
    exit 1
fi

# ----------------------------------------------------------------------------
# 6. Docker build na VPS
# ----------------------------------------------------------------------------
log_info "Executando Docker build..."
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"

ssh "$VPS_HOST" "cd $VPS_PATH && docker build -t ${STACK_NAME}:latest -f Dockerfile.production ." || {
    log_error "Falha ao executar Docker build"
    exit 1
}
log_success "Docker build concluído"

# ----------------------------------------------------------------------------
# 7. Docker stack deploy
# ----------------------------------------------------------------------------
log_info "Executando Docker stack deploy..."

# Verificar se docker-compose.vps.yml existe
if ! ssh "$VPS_HOST" "[ -f '$VPS_PATH/docker-compose.vps.yml' ]"; then
    log_error "Arquivo docker-compose.vps.yml não encontrado"
    exit 1
fi

# Deploy stack
ssh "$VPS_HOST" "cd $VPS_PATH && docker stack deploy -c docker-compose.vps.yml $STACK_NAME" || {
    log_error "Falha ao executar Docker stack deploy"
    exit 1
}
log_success "Stack $STACK_NAME deployed"

# ----------------------------------------------------------------------------
# 8. Aguardar containers iniciarem
# ----------------------------------------------------------------------------
log_info "Aguardando containers iniciarem (30s)..."
for i in {30..1}; do
    echo -ne "${YELLOW}⏳ $i segundos restantes...\r${NC}"
    sleep 1
done
echo -e "\n"
log_success "Período de inicialização concluído"

# ----------------------------------------------------------------------------
# 9. Verificar status dos serviços
# ----------------------------------------------------------------------------
log_info "Verificando status dos serviços..."
ssh "$VPS_HOST" "docker service ls --filter name=$STACK_NAME"

# ----------------------------------------------------------------------------
# 10. Health check
# ----------------------------------------------------------------------------
log_info "Executando health check..."

HEALTH_CHECK_URL="https://$DOMAIN"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$HEALTH_CHECK_URL" || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
    log_success "Health check passou (HTTP $HTTP_STATUS)"
elif [ "$HTTP_STATUS" == "000" ]; then
    log_error "Health check falhou (timeout ou erro de conexão)"
    log_warning "Verifique:"
    echo "  - Se o domínio está apontando para o IP correto"
    echo "  - Se o certificado SSL está válido"
    echo "  - Se o container está rodando: docker service ls"
    exit 1
else
    log_warning "Health check retornou HTTP $HTTP_STATUS"
    log_warning "Aplicação pode estar inicializando ou com problemas"
fi

# ----------------------------------------------------------------------------
# 11. Verificar logs recentes (últimas 20 linhas)
# ----------------------------------------------------------------------------
log_info "Logs recentes do serviço:"
echo -e "${YELLOW}----------------------------------------${NC}"
ssh "$VPS_HOST" "docker service logs --tail 20 ${STACK_NAME}_app 2>&1 || echo 'Serviço ainda não possui logs'"
echo -e "${YELLOW}----------------------------------------${NC}"

# ----------------------------------------------------------------------------
# Resumo final
# ----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Deploy concluído com sucesso!                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_success "Ambiente: $ENVIRONMENT"
log_success "URL: $HEALTH_CHECK_URL"
log_success "Stack: $STACK_NAME"
echo ""
log_info "Próximos passos:"
echo "  1. Execute smoke tests: ./scripts/vps-smoke-tests.sh $ENVIRONMENT"
echo "  2. Monitore logs: ssh $VPS_HOST 'docker service logs -f ${STACK_NAME}_app'"
echo "  3. Verifique métricas: https://$DOMAIN/metrics (se disponível)"
echo ""
log_warning "Em caso de problemas, execute rollback: ./scripts/vps-rollback.sh $ENVIRONMENT"
echo ""
