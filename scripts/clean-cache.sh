#!/bin/bash

# Script: clean-cache.sh
# Propósito: Limpar caches de build, Vite e node_modules
# Remove: Vite cache, build cache, processos Vite duplicados
# Exit code: 0 = sucesso, 1 = erro

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Limpando Caches e Build${NC}"
echo -e "${BLUE}========================================${NC}"

TOTAL_CLEANED=0
ERRORS=0

# 1. Limpar cache Vite
echo -e "\n${CYAN}1. Limpando cache Vite...${NC}"
if [ -d "node_modules/.vite" ]; then
  echo -e "  Removendo: ${YELLOW}node_modules/.vite${NC}"
  rm -rf node_modules/.vite 2>/dev/null || true
  TOTAL_CLEANED=$((TOTAL_CLEANED + 1))
  echo -e "  ${GREEN}✓ Cache Vite removido${NC}"
else
  echo -e "  ${YELLOW}⚠️  node_modules/.vite não encontrado${NC}"
fi

# 2. Limpar dist (build output)
echo -e "\n${CYAN}2. Limpando build output...${NC}"
if [ -d "dist" ]; then
  echo -e "  Removendo: ${YELLOW}dist${NC}"
  rm -rf dist 2>/dev/null || true
  TOTAL_CLEANED=$((TOTAL_CLEANED + 1))
  echo -e "  ${GREEN}✓ Diretório dist removido${NC}"
else
  echo -e "  ${YELLOW}⚠️  Diretório dist não encontrado${NC}"
fi

# 3. Limpar .parcel-cache (se usar Parcel)
echo -e "\n${CYAN}3. Limpando caches de bundler...${NC}"
if [ -d ".parcel-cache" ]; then
  echo -e "  Removendo: ${YELLOW}.parcel-cache${NC}"
  rm -rf .parcel-cache 2>/dev/null || true
  TOTAL_CLEANED=$((TOTAL_CLEANED + 1))
  echo -e "  ${GREEN}✓ Parcel cache removido${NC}"
fi

# 4. Limpar turbo cache (se usar Turborepo)
if [ -d ".turbo" ]; then
  echo -e "  Removendo: ${YELLOW}.turbo${NC}"
  rm -rf .turbo 2>/dev/null || true
  TOTAL_CLEANED=$((TOTAL_CLEANED + 1))
  echo -e "  ${GREEN}✓ Turbo cache removido${NC}"
fi

# 5. Limpar node_modules/.cache
echo -e "\n${CYAN}4. Limpando node_modules cache...${NC}"
if [ -d "node_modules/.cache" ]; then
  echo -e "  Removendo: ${YELLOW}node_modules/.cache${NC}"
  rm -rf node_modules/.cache 2>/dev/null || true
  TOTAL_CLEANED=$((TOTAL_CLEANED + 1))
  echo -e "  ${GREEN}✓ node_modules cache removido${NC}"
else
  echo -e "  ${YELLOW}⚠️  node_modules/.cache não encontrado${NC}"
fi

# 6. Matar processos Vite duplicados
echo -e "\n${CYAN}5. Matando processos Vite duplicados...${NC}"

# Contar processos Vite
VITE_PROCESSES=$(ps aux 2>/dev/null | grep -i "vite\|vue-tsc" | grep -v grep | wc -l)

if [ "$VITE_PROCESSES" -gt 0 ]; then
  echo -e "  Encontrados: ${YELLOW}$VITE_PROCESSES processos Vite/Vue${NC}"

  # Matar todos os processos Vite
  pkill -f "vite" 2>/dev/null || true
  pkill -f "vue-tsc" 2>/dev/null || true

  # Aguardar um pouco para os processos serem finalizados
  sleep 1

  # Verificar se foram finalizados
  REMAINING=$(ps aux 2>/dev/null | grep -i "vite\|vue-tsc" | grep -v grep | wc -l)
  if [ "$REMAINING" -eq 0 ]; then
    echo -e "  ${GREEN}✓ Todos os processos Vite foram finalizados${NC}"
  else
    echo -e "  ${YELLOW}⚠️  Ainda existem $REMAINING processos Vite${NC}"
    echo -e "  ${YELLOW}Matando com força...${NC}"
    pkill -9 -f "vite" 2>/dev/null || true
    pkill -9 -f "vue-tsc" 2>/dev/null || true
    sleep 1
    echo -e "  ${GREEN}✓ Processos finalizados com força${NC}"
  fi
else
  echo -e "  ${GREEN}✓ Nenhum processo Vite em execução${NC}"
fi

# 7. Limpar cache de navegador (instrução para usuário)
echo -e "\n${CYAN}6. Cache do navegador...${NC}"
echo -e "  ${YELLOW}Para limpar o cache do navegador manualmente:${NC}"
echo -e "    • Chrome/Edge: ${YELLOW}Ctrl+Shift+Del${NC} (Windows/Linux) ou ${YELLOW}Cmd+Shift+Del${NC} (Mac)"
echo -e "    • Firefox: ${YELLOW}Ctrl+Shift+Del${NC} (Windows/Linux) ou ${YELLOW}Cmd+Shift+Del${NC} (Mac)"
echo -e "    • Safari: ${YELLOW}Develop > Empty Web Cache${NC}}"
echo ""
echo -e "  Ou use DevTools (F12) e marque ${YELLOW}'Disable cache'${NC}"

# 8. Verificar espaço em disco liberado
echo -e "\n${CYAN}7. Resumo da limpeza...${NC}"
echo -e "  ${YELLOW}Diretórios/Caches removidos: $TOTAL_CLEANED${NC}"

# Relatório final
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Relatório Final${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ SUCESSO: Cache limpo com sucesso${NC}"
  echo ""
  echo -e "${YELLOW}Próximos passos:${NC}"
  echo -e "  1. Limpar cache do navegador (ver instruções acima)"
  echo -e "  2. Executar: ${CYAN}npm run dev${NC}"
  echo -e "  3. Hard refresh: ${CYAN}Ctrl+Shift+R${NC} (Windows/Linux) ou ${CYAN}Cmd+Shift+R${NC} (Mac)"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Alguns caches não puderam ser removidos${NC}"
  echo ""
  exit 1
fi
