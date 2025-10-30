#!/bin/bash

# ============================================
# Criar Branch Git para Nova Feature
# ============================================
# Cria uma branch seguindo convenção:
# feat/<slug-da-feature>
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se foi passado o nome da feature
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Nome da feature não fornecido${NC}"
    echo "Uso: $0 <nome-da-feature>"
    echo "Exemplo: $0 add-profit-cards-makeup"
    exit 1
fi

FEATURE_NAME="$1"
BRANCH_NAME="feat/${FEATURE_NAME}"

echo -e "${YELLOW}🌿 Criando branch para feature...${NC}"

# Verificar se está em um repositório Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Não está em um repositório Git${NC}"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${RED}❌ Erro: Há mudanças não commitadas${NC}"
    echo "Faça commit ou stash antes de criar nova branch"
    git status --short
    exit 1
fi

# Atualizar branch main
echo -e "${YELLOW}📥 Atualizando branch main...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
git checkout main 2>/dev/null || git checkout master 2>/dev/null
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null

# Verificar se main tem estrutura essencial
echo -e "${YELLOW}🔍 Verificando estrutura da main...${NC}"

MISSING_ITEMS=()

if [ ! -d "docs" ]; then
    MISSING_ITEMS+=("docs/")
fi

if [ ! -d "scripts" ]; then
    MISSING_ITEMS+=("scripts/")
fi

if [ ! -f ".env.example" ]; then
    MISSING_ITEMS+=(".env.example")
fi

if [ ${#MISSING_ITEMS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Aviso: Main não tem alguns itens esperados:${NC}"
    for item in "${MISSING_ITEMS[@]}"; do
        echo -e "   - ${item}"
    done
    echo ""
    echo -e "${YELLOW}💡 Sua nova branch pode não ter documentação/scripts atualizados${NC}"
    echo -e "${YELLOW}   Considere fazer merge da branch com docs antes de continuar${NC}"
    echo ""
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Operação cancelada${NC}"
        git checkout "$CURRENT_BRANCH"
        exit 1
    fi
fi

# Verificar se branch já existe
if git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
    echo -e "${RED}❌ Erro: Branch '${BRANCH_NAME}' já existe${NC}"
    echo "Use um nome diferente ou delete a branch existente:"
    echo "  git branch -D ${BRANCH_NAME}"
    exit 1
fi

# Criar e fazer checkout da nova branch
echo -e "${YELLOW}🔨 Criando branch '${BRANCH_NAME}'...${NC}"
git checkout -b "${BRANCH_NAME}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Branch criada com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🌿 Branch: ${BRANCH_NAME}"
echo -e "📍 Base: main ($(git rev-parse --short HEAD))"
echo ""

# Mostrar o que foi herdado da main
echo -e "${GREEN}✅ Sua branch já inclui (herdado da main):${NC}"
[ -d "docs" ] && echo -e "   📚 Documentação completa (docs/)"
[ -d "scripts" ] && echo -e "   🔧 Scripts de automação (scripts/)"
[ -f ".env.example" ] && echo -e "   ⚙️  Template de configuração (.env.example)"
[ -d "supabase/migrations" ] && echo -e "   🗄️  Migrations do banco (supabase/migrations/)"
echo ""

echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo -e "   1. Fazer suas alterações"
echo -e "   2. Commitar: git add . && git commit -m 'feat: ...'"
echo -e "   3. Push: git push -u origin ${BRANCH_NAME}"
echo ""
echo -e "${YELLOW}📋 Lembre-se:${NC}"
echo -e "   - Commitar pequenas mudanças incrementais"
echo -e "   - Rodar testes: npm run build ou ./scripts/run-tests.sh"
echo -e "   - Atualizar docs se necessário"
echo ""
echo -e "${GREEN}🎉 Pronto para começar!${NC}"
