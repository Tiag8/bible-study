#!/bin/bash

# ============================================================================
# Life Tracker - Deploy VPS Script (Simplified)
# ============================================================================
# Descrição: Script simplificado de deploy para VPS
# Uso: ./deploy-vps-simple.sh
# ============================================================================

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
VPS_HOST="root@31.97.22.151"
VPS_PATH="/root/life-tracker"
STACK_NAME="lifetracker"
DOMAIN="life-tracker.stackia.com.br"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Life Tracker - Deploy VPS (Simple)        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Pull código atualizado no VPS
echo -e "${YELLOW}→ Atualizando código no VPS...${NC}"
ssh "$VPS_HOST" "cd $VPS_PATH && git pull origin main" || {
    echo -e "${RED}✗ Falha ao executar git pull${NC}"
    exit 1
}
echo -e "${GREEN}✓ Código atualizado${NC}"

# 2. Build da imagem Docker no VPS
echo -e "${YELLOW}→ Building Docker image...${NC}"
ssh "$VPS_HOST" "cd $VPS_PATH && docker build -t life-tracker:latest -f Dockerfile ." || {
    echo -e "${RED}✗ Falha no Docker build${NC}"
    exit 1
}
echo -e "${GREEN}✓ Build concluído${NC}"

# 3. Deploy via Docker Stack
echo -e "${YELLOW}→ Deploying stack...${NC}"
ssh "$VPS_HOST" "cd $VPS_PATH && docker stack deploy -c docker-compose.yml $STACK_NAME" || {
    echo -e "${RED}✗ Falha no stack deploy${NC}"
    exit 1
}
echo -e "${GREEN}✓ Stack deployed${NC}"

# 4. Aguardar inicialização
echo -e "${YELLOW}→ Aguardando containers iniciarem (30s)...${NC}"
sleep 30
echo -e "${GREEN}✓ Período de inicialização concluído${NC}"

# 5. Verificar status
echo -e "${YELLOW}→ Status dos serviços:${NC}"
ssh "$VPS_HOST" "docker service ls --filter name=$STACK_NAME"

# 6. Verificar logs
echo -e "${YELLOW}→ Logs recentes:${NC}"
ssh "$VPS_HOST" "docker service logs --tail 20 ${STACK_NAME}_app 2>&1 || echo 'Aguardando logs...'"

# Resumo
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Deploy concluído com sucesso!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ URL: https://$DOMAIN${NC}"
echo -e "${GREEN}✓ Stack: $STACK_NAME${NC}"
echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo "  1. Aguarde 60s para SSL provisionar (se primeiro deploy)"
echo "  2. Teste: curl -I https://$DOMAIN"
echo "  3. Monitore: ssh $VPS_HOST 'docker service logs -f ${STACK_NAME}_app'"
echo ""
