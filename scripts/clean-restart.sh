#!/bin/bash

# Script para limpar cache e reiniciar servidor Next.js
# Previne erros "Adding different instances of a keyed plugin" do Tiptap + Next.js 15
#
# Diferenças por modo:
# - DEV (default): Apenas limpa cache .next, reinicia servidor sem rebuild
# - PROD (--prod): Limpa tudo + rebuild + verificações de produção
# - FULL (--full): Remove node_modules + rebuild + full clean

MODE="dev"
if [ "$1" = "--prod" ]; then
  MODE="prod"
elif [ "$1" = "--full" ]; then
  MODE="full"
fi

echo "🧹 Restart Script - Mode: $MODE"
echo ""

# 1. Parar servidor na porta 3000
echo "1️⃣ Parando servidor na porta 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "   ✅ Servidor parado" || echo "   ℹ️  Nenhum servidor rodando"
sleep 1

# 2. Limpar cache do Next.js (SEMPRE necessário)
echo "2️⃣ Removendo cache .next..."
rm -rf .next
echo "   ✅ Cache removido"

# 3. Limpar cache de node_modules (opcional em FULL mode)
if [ "$MODE" = "full" ]; then
  echo "3️⃣ Removendo node_modules e reinstalando..."
  rm -rf node_modules package-lock.json
  npm install > /dev/null 2>&1
  echo "   ✅ Dependências reinstaladas"
fi

# 4. Mode-specific actions
if [ "$MODE" = "dev" ]; then
  echo "3️⃣ Dev Mode: Iniciando servidor sem rebuild..."
  npm run dev > /tmp/nextjs-dev.log 2>&1 &

elif [ "$MODE" = "prod" ]; then
  echo "3️⃣ Prod Mode: Building para produção..."
  npm run build > /dev/null 2>&1 && echo "   ✅ Build concluído" || echo "   ⚠️  Build com warnings"
  echo "4️⃣ Iniciando servidor de produção..."
  npm run start > /tmp/nextjs-prod.log 2>&1 &

elif [ "$MODE" = "full" ]; then
  echo "3️⃣ Full Mode: Building..."
  npm run build > /dev/null 2>&1 && echo "   ✅ Build concluído" || echo "   ⚠️  Build com warnings"
  echo "4️⃣ Iniciando servidor..."
  npm run dev > /tmp/nextjs-dev.log 2>&1 &
fi

sleep 3

# 5. Verificar status
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
  echo ""
  echo "✅ Servidor rodando em http://localhost:3000"
  echo "   HTTP Status: $HTTP_CODE"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "✅ Servidor reiniciado com sucesso!"
  echo "═══════════════════════════════════════════════════════════"
  [ "$MODE" = "prod" ] && echo "📄 Logs: tail -f /tmp/nextjs-prod.log" || echo "📄 Logs: tail -f /tmp/nextjs-dev.log"
else
  echo ""
  echo "❌ Erro ao conectar ao servidor"
  echo "   HTTP Status: $HTTP_CODE"
  echo "   📄 Logs: tail -f /tmp/nextjs-dev.log"
  echo ""
  echo "⚠️  Possíveis causas:"
  echo "   • Servidor ainda está iniciando (aguarde 10s)"
  echo "   • Cache corrompido (tente: npm run clean && npm run dev)"
  echo "   • Porta 3000 ocupada (use: lsof -i :3000)"
fi
