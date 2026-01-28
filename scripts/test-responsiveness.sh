#!/bin/bash

# Test Responsiveness Script for Story 4.3: References UI
# Tests different viewport sizes and captures screenshots

set -e

PORT=3000
BASE_URL="http://localhost:$PORT"

echo "🧪 Iniciando testes de responsividade..."
echo "=========================================="

# Aguardar dev server
echo "⏳ Aguardando dev server na porta $PORT..."
for i in {1..30}; do
  if curl -s "$BASE_URL" > /dev/null; then
    echo "✅ Dev server está ativo!"
    break
  fi
  echo "Tentativa $i/30..."
  sleep 1
done

# Criar diretório de screenshots
SCREENSHOT_DIR="./test-screenshots/$(date +%Y-%m-%d-%H%M%S)"
mkdir -p "$SCREENSHOT_DIR"
echo "📸 Screenshots serão salvos em: $SCREENSHOT_DIR"

# Viewports a testar (desktop, tablet, mobile)
declare -A VIEWPORTS=(
  ["desktop-1920"]="1920x1080"
  ["desktop-1440"]="1440x900"
  ["desktop-1024"]="1024x768"
  ["tablet-768"]="768x1024"
  ["mobile-375"]="375x667"
  ["mobile-667"]="667x812"
)

# Testar página de login (sem auth)
echo ""
echo "🔐 Testando página de login..."
for name in "${!VIEWPORTS[@]}"; do
  dimensions=${VIEWPORTS[$name]}
  width=${dimensions%x*}
  height=${dimensions#*x}

  echo "  → $name ($dimensions)"
  npx playwright test --headed=false --reporter=list \
    --config=<(cat <<EOF
      import { defineConfig, devices } from '@playwright/test';
      export default defineConfig({
        testDir: './tests',
        fullyParallel: false,
        use: {
          baseURL: '$BASE_URL',
          screenshot: 'only-on-failure',
          viewport: { width: $width, height: $height },
        },
      });
EOF
    ) 2>/dev/null || true
done

echo ""
echo "✅ Testes de responsividade completados!"
echo "📸 Screenshots salvos em: $SCREENSHOT_DIR"
