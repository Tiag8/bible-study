#!/usr/bin/env bash
set -euo pipefail

YELLOW='\033[33m'; GREEN='\033[32m'; RED='\033[31m'; NC='\033[0m'
PASS() { echo -e "${GREEN}✔${NC} $1"; }
WARN() { echo -e "${YELLOW}⚠${NC} $1"; }
FAIL() { echo -e "${RED}✘${NC} $1"; }

if ! command -v npm >/dev/null 2>&1; then
  FAIL "npm não encontrado. Instale Node.js/NPM."
  exit 1
fi

echo "==> Auditando vulnerabilidades (npm audit --audit-level=high --production)"
if npm audit --audit-level=high --production; then
  PASS "Sem vulnerabilidades de alto risco em produção"
else
  WARN "Vulnerabilidades detectadas. Avalie correções com npm audit fix (com cautela)."
fi

echo "==> Verificando dependências desatualizadas (npm outdated --long)"
if npm outdated --long || true; then
  PASS "Listagem de pacotes desatualizados concluída"
fi
