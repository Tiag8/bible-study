#!/bin/bash

# ============================================
# Commit e Push Automático
# ============================================
# Faz commit de todas as mudanças e push
# para o repositório remoto
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se foi passada a mensagem de commit
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Mensagem de commit não fornecida${NC}"
    echo "Uso: $0 <mensagem-do-commit>"
    echo "Exemplo: $0 'feat: adicionar cards PROFIT no MakeUp'"
    exit 1
fi

COMMIT_MESSAGE="$1"
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}💾 Commit e Push${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar se está em um repositório Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Não está em um repositório Git${NC}"
    exit 1
fi

# Verificar se há mudanças para commitar
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Nenhuma mudança para commitar${NC}"
    exit 0
fi

# Mostrar status
echo -e "${YELLOW}📋 Mudanças detectadas:${NC}"
git status --short | sed 's/^/   /'
echo ""

# ============================================
# Validações de Segurança PRÉ-COMMIT
# ============================================
echo -e "${YELLOW}🛡️  Executando validações de segurança...${NC}"

SECURITY_PASSED=true

# 1. Verificar secrets hardcoded
echo -e "${YELLOW}   Verificando secrets hardcoded...${NC}"
SECRETS_FOUND=false

SECRETS_PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "api_key\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
)

for pattern in "${SECRETS_PATTERNS[@]}"; do
    if git diff --cached | grep -iE "$pattern" > /dev/null 2>&1; then
        SECRETS_FOUND=true
        echo -e "${RED}   ❌ Secret detectado no código staged!${NC}"
        git diff --cached | grep -iE "$pattern" | head -3 | sed 's/^/      /'
        SECURITY_PASSED=false
        break
    fi
done

if [ "$SECRETS_FOUND" = false ]; then
    echo -e "${GREEN}   ✅ Nenhum secret hardcoded detectado${NC}"
fi

# 2. Verificar se .env será commitado
echo -e "${YELLOW}   Verificando arquivos .env...${NC}"
if git diff --cached --name-only | grep -E '\.env$' > /dev/null 2>&1; then
    echo -e "${RED}   ❌ ERRO: Arquivo .env será commitado!${NC}"
    echo -e "${YELLOW}      Execute: git reset HEAD .env${NC}"
    SECURITY_PASSED=false
else
    echo -e "${GREEN}   ✅ .env não será commitado${NC}"
fi

# 3. Verificar tamanho de arquivos (evitar commit de arquivos muito grandes)
echo -e "${YELLOW}   Verificando tamanho de arquivos...${NC}"
LARGE_FILES=$(git diff --cached --name-only | xargs -I {} du -k "{}" 2>/dev/null | awk '$1 > 1024' || true)

if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}   ⚠️  Arquivos grandes detectados (>1MB):${NC}"
    echo "$LARGE_FILES" | sed 's/^/      /'
    echo -e "${YELLOW}      Considere usar Git LFS ou .gitignore${NC}"
    # Não bloquear, apenas avisar
fi

echo ""

# Se falhar em validações críticas, não permitir commit
if [ "$SECURITY_PASSED" = false ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Validações de segurança falharam!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  COMMIT BLOQUEADO por motivos de segurança!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Ações necessárias:${NC}"
    echo -e "   1. Remova secrets hardcoded do código"
    echo -e "   2. Use variáveis de ambiente (import.meta.env.VITE_*)"
    echo -e "   3. Execute: git reset HEAD .env (se aplicável)"
    echo -e "   4. Tente novamente após correções"
    echo ""
    echo -e "${YELLOW}💡 Para scan completo de segurança:${NC}"
    echo -e "   ./scripts/run-security-tests.sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Validações de segurança passaram!${NC}"
echo ""

# Adicionar todos os arquivos
echo -e "${YELLOW}➕ Adicionando arquivos...${NC}"
git add .

# Fazer commit
echo -e "${YELLOW}💾 Criando commit...${NC}"
git commit -m "${COMMIT_MESSAGE}"

COMMIT_HASH=$(git rev-parse --short HEAD)
echo -e "${GREEN}✅ Commit criado: ${COMMIT_HASH}${NC}"
echo ""

# Push para remote
echo -e "${YELLOW}📤 Fazendo push para origin/${CURRENT_BRANCH}...${NC}"

# Verificar se branch existe no remote
if git ls-remote --exit-code --heads origin "${CURRENT_BRANCH}" > /dev/null 2>&1; then
    # Branch já existe, fazer push normal
    git push origin "${CURRENT_BRANCH}"
else
    # Primeira vez, fazer push com -u
    git push -u origin "${CURRENT_BRANCH}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Commit e Push realizados com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🌿 Branch: ${CURRENT_BRANCH}"
echo -e "📝 Commit: ${COMMIT_HASH}"
echo -e "💬 Mensagem: ${COMMIT_MESSAGE}"
echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo -e "   1. Validar no GitHub"
echo -e "   2. Criar PR (se necessário): gh pr create"
echo -e "   3. Ou continuar desenvolvendo"
echo ""
