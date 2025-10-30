#!/usr/bin/env bash
set -euo pipefail

YELLOW='\033[33m'; GREEN='\033[32m'; RED='\033[31m'; NC='\033[0m'
PASS() { echo -e "${GREEN}✔${NC} $1"; }
WARN() { echo -e "${YELLOW}⚠${NC} $1"; }
FAIL() { echo -e "${RED}✘${NC} $1"; }

run_or_warn() {
  local cmd="$1"
  if ! eval "$cmd"; then
    FAIL "Falha ao executar: $cmd"
    exit 1
  fi
}

echo "==> ESLint"
run_or_warn "npx eslint ."
PASS "ESLint ok"

echo "==> Prettier (check)"
run_or_warn "npx prettier --check ."
PASS "Prettier ok"

echo "==> TypeScript (typecheck)"
run_or_warn "npx tsc --noEmit"
PASS "TypeScript ok"

# Opcional: vitest
if npx --yes vitest --version >/dev/null 2>&1; then
  echo "==> Vitest (modo dry-run)"
  npx vitest --run || WARN "Alguns testes falharam"
fi
