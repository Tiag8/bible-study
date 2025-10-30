#!/usr/bin/env bash
set -euo pipefail

# Health Checks - Verificações de ambiente
# - Verifica .env e variáveis críticas
# - Verifica portas em uso
# - Exibe resumo final

YELLOW='\033[33m'; GREEN='\033[32m'; RED='\033[31m'; NC='\033[0m'
PASS() { echo -e "${GREEN}✔${NC} $1"; }
WARN() { echo -e "${YELLOW}⚠${NC} $1"; }
FAIL() { echo -e "${RED}✘${NC} $1"; }

# IMPORTANTE: Personalizar esta lista com variáveis do seu projeto
required_env_vars=(
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
  # Adicione outras variáveis críticas aqui
)

echo "==> Verificando arquivo .env"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    WARN ".env não encontrado. Baseie-se em .env.example para criar o arquivo."
  else
    FAIL ".env e .env.example não encontrados. Configure variáveis de ambiente."
    exit 1
  fi
else
  PASS ".env encontrado"
fi

# Carrega .env sem exportar para o ambiente de forma global
if [ -f .env ]; then
  set -o allexport
  # shellcheck disable=SC1091
  source .env || true
  set +o allexport
fi

echo "==> Verificando variáveis críticas (.env)"
missing=0
for var in "${required_env_vars[@]}"; do
  if [ -z "${!var-}" ]; then
    WARN "Variável ausente: ${var}"
    missing=$((missing+1))
  else
    PASS "${var} definida"
  fi
done

if [ "$missing" -gt 0 ]; then
  WARN "Preencha as variáveis ausentes no .env antes de rodar o app."
fi

# Portas comuns (Vite, Preview)
ports=(5173 4173)

echo "==> Verificando portas em uso"
for p in "${ports[@]}"; do
  if lsof -i :"$p" -sTCP:LISTEN >/dev/null 2>&1; then
    WARN "Porta ${p} em uso. Considere encerrar o processo antes de iniciar o servidor."
  else
    PASS "Porta ${p} livre"
  fi
done

# Resumo
if [ "$missing" -eq 0 ]; then
  PASS "Health checks concluídos sem pendências críticas."
else
  WARN "Health checks concluídos com pendências (variáveis ausentes: $missing)."
fi
