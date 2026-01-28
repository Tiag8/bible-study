#!/bin/bash

# Auto-fix script para Tiptap + Next.js 15 cache issues
# Monitora logs em tempo real e limpa cache automaticamente ao detectar
# "Adding different instances of a keyed plugin" error
#
# Uso:
#   ./scripts/auto-fix-cache.sh
#
# Isso vai:
# 1. Iniciar servidor em background
# 2. Monitorar /tmp/nextjs-dev.log continuamente
# 3. Ao detectar o erro, parar servidor + limpar cache + reiniciar

LOG_FILE="/tmp/nextjs-dev.log"
ERROR_PATTERN="Adding different instances of a keyed plugin"
MAX_ATTEMPTS=3
ATTEMPT=0

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 Auto-Fix Cache Monitor${NC}"
echo "   Error Pattern: $ERROR_PATTERN"
echo "   Log File: $LOG_FILE"
echo "   Max Attempts: $MAX_ATTEMPTS"
echo ""

# 1. Iniciar servidor
echo -e "${YELLOW}1️⃣  Iniciando servidor...${NC}"
npm run dev > $LOG_FILE 2>&1 &
DEV_PID=$!
sleep 3

# 2. Monitorar logs
echo -e "${YELLOW}2️⃣  Monitorando logs...${NC}"
echo -e "   PID: $DEV_PID"
echo ""

# Tail logs com grep para monitorar erro
tail -f $LOG_FILE | while read line; do
  echo "$line"

  # Detectar erro de cache
  if echo "$line" | grep -q "$ERROR_PATTERN"; then
    ATTEMPT=$((ATTEMPT + 1))

    if [ $ATTEMPT -le $MAX_ATTEMPTS ]; then
      echo ""
      echo -e "${RED}❌ Erro detectado! (Tentativa $ATTEMPT/$MAX_ATTEMPTS)${NC}"
      echo -e "   ${RED}Error: $ERROR_PATTERN${NC}"
      echo ""

      # Auto-fix: parar + limpar + reiniciar
      echo -e "${YELLOW}🔧 Aplicando auto-fix...${NC}"
      kill $DEV_PID 2>/dev/null
      sleep 2
      rm -rf .next
      echo -e "   ${GREEN}✅ Cache limpo${NC}"

      # Reiniciar
      echo -e "   ${YELLOW}Reiniciando servidor...${NC}"
      npm run dev > $LOG_FILE 2>&1 &
      DEV_PID=$!
      sleep 3
      echo -e "   ${GREEN}✅ Servidor reiniciado${NC}"
      echo ""
    else
      echo ""
      echo -e "${RED}❌ Máximo de tentativas atingido ($MAX_ATTEMPTS)${NC}"
      echo -e "   ${YELLOW}⚠️  Solução manual necessária:${NC}"
      echo "   1. npm run restart:full"
      echo "   2. Verifique configurações do Tiptap"
      kill $DEV_PID 2>/dev/null
      exit 1
    fi
  fi
done
