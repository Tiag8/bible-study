#!/bin/bash

# ============================================================================
# Life Tracker - Deploy VPS Direct (sem git)
# ============================================================================

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

VPS_HOST="root@31.97.22.151"
VPS_PATH="/root/life-tracker"
LOCAL_PATH="/Users/tiago/Projects/life_tracker"
STACK_NAME="lifetracker"
DOMAIN="life-tracker.stackia.com.br"

echo -e "${YELLOW}→ Life Tracker - Deploy VPS (Direct Transfer)${NC}\n"

# 1. Criar/limpar diretório no VPS
echo -e "${YELLOW}→ Preparando diretório no VPS...${NC}"
ssh "$VPS_HOST" "mkdir -p $VPS_PATH && rm -rf $VPS_PATH/*"
echo -e "${GREEN}✓ Diretório preparado${NC}"

# 2. Copiar arquivos essenciais
echo -e "${YELLOW}→ Copiando arquivos para VPS...${NC}"
scp -r "$LOCAL_PATH/"{Dockerfile,docker-compose.yml,nginx.conf,.dockerignore,package.json,package-lock.json,tsconfig.json,tsconfig.app.json,tsconfig.node.json,vite.config.ts,tailwind.config.ts,postcss.config.js,index.html,components.json,.env} "$VPS_HOST:$VPS_PATH/" 2>/dev/null || echo "Alguns arquivos opcionais não foram copiados"

# Copiar diretórios
scp -r "$LOCAL_PATH/src" "$VPS_HOST:$VPS_PATH/"
scp -r "$LOCAL_PATH/public" "$VPS_HOST:$VPS_PATH/"

echo -e "${GREEN}✓ Arquivos copiados${NC}"

# 3. Build no VPS
echo -e "${YELLOW}→ Building Docker image no VPS...${NC}"
ssh "$VPS_HOST" "cd $VPS_PATH && docker build -t life-tracker:latest -f Dockerfile ." || {
    echo -e "${RED}✗ Build falhou${NC}"
    exit 1
}
echo -e "${GREEN}✓ Build concluído${NC}"

# 4. Deploy stack
echo -e "${YELLOW}→ Deploying stack...${NC}"
ssh "$VPS_HOST" "cd $VPS_PATH && docker stack deploy -c docker-compose.yml $STACK_NAME" || {
    echo -e "${RED}✗ Deploy falhou${NC}"
    exit 1
}
echo -e "${GREEN}✓ Stack deployed${NC}"

# 5. Aguardar
echo -e "${YELLOW}→ Aguardando inicialização (30s)...${NC}"
sleep 30

# 6. Status
echo -e "${YELLOW}→ Status:${NC}"
ssh "$VPS_HOST" "docker service ls --filter name=$STACK_NAME"

# 7. Logs
echo -e "${YELLOW}→ Logs:${NC}"
ssh "$VPS_HOST" "docker service logs --tail 20 ${STACK_NAME}_app 2>&1 || echo 'Aguardando logs...'"

echo -e "\n${GREEN}✓ Deploy concluído!${NC}"
echo -e "${GREEN}✓ URL: https://$DOMAIN${NC}\n"
