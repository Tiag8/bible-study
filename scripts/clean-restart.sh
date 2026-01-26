#!/bin/bash

# Script para limpar cache e reiniciar servidor Next.js
# Previne erros 404 de recursos estáticos

echo "🧹 Limpando cache e reiniciando servidor..."
echo ""

# 1. Parar servidor na porta 3000
echo "1️⃣ Parando servidor na porta 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "   ✅ Servidor parado" || echo "   ℹ️  Nenhum servidor rodando"

# 2. Limpar cache do Next.js
echo "2️⃣ Removendo cache .next..."
rm -rf .next
echo "   ✅ Cache removido"

# 3. Limpar cache do node_modules (opcional)
if [ "$1" = "--full" ]; then
  echo "3️⃣ Removendo node_modules e reinstalando..."
  rm -rf node_modules package-lock.json
  npm install
  echo "   ✅ Dependências reinstaladas"
fi

# 4. Rebuild
echo "4️⃣ Fazendo rebuild..."
npm run build > /dev/null 2>&1 && echo "   ✅ Build concluído" || echo "   ⚠️  Build com warnings (verifique logs)"

# 5. Iniciar servidor
echo "5️⃣ Iniciando servidor..."
npm run dev > /tmp/nextjs-dev.log 2>&1 &
sleep 3

# 6. Verificar status
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
  echo "   ✅ Servidor rodando em http://localhost:3000"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "✅ Servidor reiniciado com sucesso!"
  echo "═══════════════════════════════════════════════════════════"
else
  echo "   ❌ Erro ao iniciar servidor"
  echo "   📄 Logs: tail -f /tmp/nextjs-dev.log"
fi
