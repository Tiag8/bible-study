#!/bin/bash

# ============================================
# Fix ESLint TypeScript any Warnings
# ============================================
# Auxilia na identificação e refatoração de
# warnings de @typescript-eslint/no-explicit-any
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Fix ESLint TypeScript 'any' Warnings${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Função para contar warnings de 'any'
count_any_warnings() {
    npm run lint 2>&1 | grep -c "no-explicit-any" || echo "0"
}

# Contar warnings atuais
TOTAL_WARNINGS=$(count_any_warnings)

if [ "$TOTAL_WARNINGS" -eq "0" ]; then
    echo -e "${GREEN}✅ Parabéns! Zero warnings de 'any' encontrados!${NC}"
    echo ""
    exit 0
fi

echo -e "${YELLOW}⚠️  Total de warnings 'any': ${TOTAL_WARNINGS}${NC}"
echo ""

# Listar arquivos com warnings
echo -e "${BLUE}📋 Arquivos com warnings de 'any':${NC}"
echo ""

npm run lint 2>&1 | grep "no-explicit-any" | sed 's/^/  /' | head -20

if [ "$TOTAL_WARNINGS" -gt 20 ]; then
    echo -e "${YELLOW}  ... e mais $((TOTAL_WARNINGS - 20)) arquivos${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}💡 Sugestões de Refatoração${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}1. Substituir 'any' por tipos específicos:${NC}"
echo ""
echo -e "  ${GREEN}// ❌ EVITAR${NC}"
echo -e "  function handleClick(event: any) { ... }"
echo ""
echo -e "  ${GREEN}// ✅ CORRETO${NC}"
echo -e "  function handleClick(event: React.MouseEvent<HTMLButtonElement>) { ... }"
echo ""

echo -e "${YELLOW}2. Usar 'unknown' quando tipo é desconhecido:${NC}"
echo ""
echo -e "  ${GREEN}// ❌ EVITAR${NC}"
echo -e "  const data: any = JSON.parse(jsonString);"
echo ""
echo -e "  ${GREEN}// ✅ CORRETO${NC}"
echo -e "  const data: unknown = JSON.parse(jsonString);"
echo -e "  if (isPlayer(data)) { // type guard"
echo -e "    // TypeScript sabe que data é Player aqui"
echo -e "  }"
echo ""

echo -e "${YELLOW}3. Criar interfaces para dados complexos:${NC}"
echo ""
echo -e "  ${GREEN}// ❌ EVITAR${NC}"
echo -e "  const player: any = { id: 1, name: 'John' };"
echo ""
echo -e "  ${GREEN}// ✅ CORRETO${NC}"
echo -e "  interface Player {"
echo -e "    id: number;"
echo -e "    name: string;"
echo -e "  }"
echo -e "  const player: Player = { id: 1, name: 'John' };"
echo ""

echo -e "${YELLOW}4. Usar Generics para funções reutilizáveis:${NC}"
echo ""
echo -e "  ${GREEN}// ❌ EVITAR${NC}"
echo -e "  function map(arr: any[], fn: any) { ... }"
echo ""
echo -e "  ${GREEN}// ✅ CORRETO${NC}"
echo -e "  function map<T, U>(arr: T[], fn: (item: T) => U): U[] { ... }"
echo ""

echo -e "${YELLOW}5. Exceção: Desabilitar ESLint com justificativa:${NC}"
echo ""
echo -e "  ${GREEN}// ✅ OK (com justificativa)${NC}"
echo -e "  // eslint-disable-next-line @typescript-eslint/no-explicit-any"
echo -e "  const chart: any = externalLibWithoutTypes.create();"
echo -e "  // TODO: Criar types para externalLib ou encontrar @types"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎯 Plano de Ação${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}Estratégia Gradual:${NC}"
echo ""
echo -e "  ${GREEN}1. Bloquear novos 'any'${NC} (pre-commit hook)"
echo -e "  ${GREEN}2. Refatorar arquivos críticos${NC} (auth, database, payments)"
echo -e "  ${GREEN}3. Refatorar componentes principais${NC} (dashboard, stats)"
echo -e "  ${GREEN}4. Refatorar componentes simples${NC} (UI, cards)"
echo ""

echo -e "${YELLOW}Meta:${NC}"
echo -e "  ${BLUE}De ${TOTAL_WARNINGS} warnings → 0 warnings até 2025-12-31${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📚 Referências${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "  ${YELLOW}TypeScript Handbook:${NC} https://www.typescriptlang.org/docs/handbook/2/everyday-types.html"
echo -e "  ${YELLOW}ESLint Rule:${NC} https://typescript-eslint.io/rules/no-explicit-any/"
echo ""

echo -e "${GREEN}✅ Análise concluída!${NC}"
echo ""
