#!/bin/bash

# ============================================================================
# Life Tracker - VPS Rollback Script
# ============================================================================
# Descrição: Script de rollback rápido para reverter deploy com problemas
# Uso: ./vps-rollback.sh [production|staging]
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
    echo "Uso: ./vps-rollback.sh [production|staging]"
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
elif [ "$ENVIRONMENT" == "staging" ]; then
    VPS_HOST="root@31.97.22.151"
    VPS_PATH="/root/life-tracker-staging"
    DOMAIN="staging.life-tracker.stackia.com.br"
    STACK_NAME="lifetracker-staging"
fi

# ----------------------------------------------------------------------------
# Banner
# ----------------------------------------------------------------------------
echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║           Life Tracker - VPS Rollback                      ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_warning "ATENÇÃO: Esta operação irá reverter para o commit anterior!"
echo ""
log_info "Ambiente: $ENVIRONMENT"
log_info "VPS Host: $VPS_HOST"
log_info "Stack: $STACK_NAME"
echo ""

# ----------------------------------------------------------------------------
# Rollback Approval Checkpoint
# ----------------------------------------------------------------------------
echo ""
echo "========================================="
echo "🔴 VPS ROLLBACK - APPROVAL REQUIRED"
echo "========================================="
echo ""
echo "⚠️ Esta operação irá:"
echo "  - Reverter deploy anterior"
echo "  - Restaurar versão anterior"
echo "  - Reiniciar services"
echo ""
echo "CRITICAL: Confirme que rollback é necessário!"
echo ""
read -p "🚫 APROVAR rollback? (yes/no): " APPROVAL_ROLLBACK

if [ "$APPROVAL_ROLLBACK" != "yes" ]; then
    echo ""
    echo "❌ Rollback cancelado"
    exit 1
fi

echo ""
echo "✅ Rollback aprovado - Iniciando..."
echo ""

# ----------------------------------------------------------------------------
# Validar acesso SSH
# ----------------------------------------------------------------------------
log_info "Validando acesso SSH..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes "$VPS_HOST" "exit" 2>/dev/null; then
    log_success "Acesso SSH validado"
else
    log_error "Falha ao conectar via SSH"
    exit 1
fi

# ----------------------------------------------------------------------------
# Mostrar commit atual e anterior
# ----------------------------------------------------------------------------
log_info "Verificando commits..."
echo ""

CURRENT_COMMIT=$(ssh "$VPS_HOST" "cd $VPS_PATH && git log -1 --oneline" 2>/dev/null || echo "Erro ao obter commit atual")
PREVIOUS_COMMIT=$(ssh "$VPS_HOST" "cd $VPS_PATH && git log -2 --oneline | tail -n 1" 2>/dev/null || echo "Erro ao obter commit anterior")

echo -e "${YELLOW}Commit atual:${NC}"
echo "  $CURRENT_COMMIT"
echo ""
echo -e "${YELLOW}Commit anterior (rollback target):${NC}"
echo "  $PREVIOUS_COMMIT"
echo ""

# ----------------------------------------------------------------------------
# Confirmação do usuário
# ----------------------------------------------------------------------------
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                    CONFIRMAÇÃO NECESSÁRIA                  ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_warning "Esta operação irá:"
echo "  1. Reverter o código para o commit anterior (HEAD~1)"
echo "  2. Rebuildar a imagem Docker"
echo "  3. Redeployar o stack $STACK_NAME"
echo ""
log_error "Esta ação não pode ser desfeita automaticamente!"
echo ""

read -p "Tem certeza que deseja continuar? (yes/no): " CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
    log_warning "Rollback cancelado pelo usuário"
    exit 1
fi

echo ""
log_info "Iniciando rollback..."
echo ""

# ----------------------------------------------------------------------------
# 1. Git checkout HEAD~1
# ----------------------------------------------------------------------------
log_info "Revertendo código para commit anterior..."

# Salvar branch atual
CURRENT_BRANCH=$(ssh "$VPS_HOST" "cd $VPS_PATH && git rev-parse --abbrev-ref HEAD" 2>/dev/null || echo "main")
log_info "Branch atual: $CURRENT_BRANCH"

# Git operation approval checkpoint
echo ""
read -p "⏸️ APROVAR git reset --hard HEAD~1? (yes/no): " APPROVAL_GIT
if [ "$APPROVAL_GIT" != "yes" ]; then
    echo "❌ Git operation cancelada"
    exit 1
fi
echo ""

# Fazer checkout do commit anterior
ssh "$VPS_HOST" "cd $VPS_PATH && git reset --hard HEAD~1" || {
    log_error "Falha ao executar git reset"
    log_warning "Tentando rollback alternativo com git checkout..."
    ssh "$VPS_HOST" "cd $VPS_PATH && git checkout HEAD~1" || {
        log_error "Falha no rollback do código"
        exit 1
    }
}

log_success "Código revertido para commit anterior"

# Verificar commit atual após rollback
NEW_CURRENT_COMMIT=$(ssh "$VPS_HOST" "cd $VPS_PATH && git log -1 --oneline")
log_info "Novo commit atual: $NEW_CURRENT_COMMIT"
echo ""

# ----------------------------------------------------------------------------
# 2. Rebuild imagem Docker
# ----------------------------------------------------------------------------
log_info "Rebuilding imagem Docker..."
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"

ssh "$VPS_HOST" "cd $VPS_PATH && docker build -t ${STACK_NAME}:latest -f Dockerfile.production ." || {
    log_error "Falha ao executar Docker build"
    log_warning "Tentando reverter git para estado anterior..."
    ssh "$VPS_HOST" "cd $VPS_PATH && git reset --hard HEAD@{1}" || true
    exit 1
}

log_success "Docker build concluído"

# ----------------------------------------------------------------------------
# 3. Redeploy stack
# ----------------------------------------------------------------------------
log_info "Redeployando stack..."

ssh "$VPS_HOST" "cd $VPS_PATH && docker stack deploy -c docker-compose.vps.yml $STACK_NAME" || {
    log_error "Falha ao executar Docker stack deploy"
    exit 1
}

log_success "Stack redeployed"

# ----------------------------------------------------------------------------
# 4. Aguardar containers reiniciarem
# ----------------------------------------------------------------------------
log_info "Aguardando containers reiniciarem (30s)..."
for i in {30..1}; do
    echo -ne "${YELLOW}⏳ $i segundos restantes...\r${NC}"
    sleep 1
done
echo -e "\n"
log_success "Período de reinicialização concluído"

# ----------------------------------------------------------------------------
# 5. Validação pós-rollback
# ----------------------------------------------------------------------------
log_info "Executando validação pós-rollback..."

# Verificar status dos serviços
log_info "Status dos serviços:"
ssh "$VPS_HOST" "docker service ls --filter name=$STACK_NAME"
echo ""

# Health check
log_info "Executando health check..."
HEALTH_CHECK_URL="https://$DOMAIN"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$HEALTH_CHECK_URL" || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
    log_success "Health check passou (HTTP $HTTP_STATUS)"
elif [ "$HTTP_STATUS" == "000" ]; then
    log_error "Health check falhou (timeout ou erro de conexão)"
    log_warning "Aplicação pode estar com problemas graves"
    echo ""
    log_warning "Verifique os logs: ssh $VPS_HOST 'docker service logs ${STACK_NAME}_app'"
    exit 1
else
    log_warning "Health check retornou HTTP $HTTP_STATUS"
    log_warning "Aplicação pode estar inicializando"
fi

# ----------------------------------------------------------------------------
# 6. Verificar logs recentes
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
echo -e "${GREEN}║              Rollback concluído com sucesso!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_success "Ambiente: $ENVIRONMENT"
log_success "Commit anterior restaurado: $NEW_CURRENT_COMMIT"
log_success "URL: $HEALTH_CHECK_URL"
echo ""
log_info "Próximos passos:"
echo "  1. Execute smoke tests: ./scripts/vps-smoke-tests.sh $ENVIRONMENT"
echo "  2. Monitore logs: ssh $VPS_HOST 'docker service logs -f ${STACK_NAME}_app'"
echo "  3. Investigue a causa do problema no commit revertido"
echo ""
log_warning "IMPORTANTE: O branch está agora em HEAD~1 (detached HEAD state)"
log_warning "Para voltar ao estado normal:"
echo "  - Se rollback foi bem-sucedido: ssh $VPS_HOST 'cd $VPS_PATH && git checkout $CURRENT_BRANCH'"
echo "  - Se precisa manter rollback: crie uma branch ou faça git push --force (com cuidado!)"
echo ""
