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

# Detectar branch atual e trabalho não mergeado
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}📍 Branch atual: ${CURRENT_BRANCH}${NC}"

# Verificar se há commits não mergeados na branch atual
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    # Fetch para ter informações atualizadas
    git fetch origin main 2>/dev/null || git fetch origin master 2>/dev/null

    COMMITS_AHEAD=$(git rev-list --count main..$CURRENT_BRANCH 2>/dev/null || echo "0")

    if [ "$COMMITS_AHEAD" -gt 0 ]; then
        echo ""
        echo -e "${RED}🚨 ATENÇÃO: Branch atual tem $COMMITS_AHEAD commit(s) NÃO MERGEADOS na main!${NC}"
        echo ""
        echo "Se criar nova branch a partir da main, você PERDERÁ este trabalho:"
        git log main..HEAD --oneline --max-count=5
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}Escolha uma opção:${NC}"
        echo -e "${GREEN}  1) Criar branch a partir de '${CURRENT_BRANCH}' (RECOMENDADO)${NC}"
        echo -e "     → Nova branch terá TODO o trabalho atual"
        echo ""
        echo -e "  2) Criar branch a partir de 'main'"
        echo -e "     → ${RED}PERDERÁ os $COMMITS_AHEAD commits da branch atual${NC}"
        echo ""
        echo -e "  3) Cancelar e fazer merge/push primeiro"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        read -p "Opção (1-3): " -n 1 -r
        echo

        case $REPLY in
            1)
                BASE_BRANCH="$CURRENT_BRANCH"
                echo -e "${GREEN}✅ Criando a partir de: ${BASE_BRANCH}${NC}"
                ;;
            2)
                BASE_BRANCH="main"
                echo -e "${RED}⚠️  ATENÇÃO: Criando a partir da main - commits atuais NÃO estarão na nova branch!${NC}"
                read -p "Tem certeza? (digite 'sim' para confirmar): " CONFIRM
                if [ "$CONFIRM" != "sim" ]; then
                    echo -e "${RED}❌ Operação cancelada${NC}"
                    exit 1
                fi
                ;;
            3)
                echo -e "${YELLOW}💡 Sugestão:${NC}"
                echo -e "   1. Faça commit do trabalho atual"
                echo -e "   2. Push: git push -u origin ${CURRENT_BRANCH}"
                echo -e "   3. Abra PR e faça merge na main"
                echo -e "   4. Depois crie a nova branch"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Opção inválida${NC}"
                exit 1
                ;;
        esac
    else
        BASE_BRANCH="main"
        echo -e "${GREEN}✅ Branch atual sincronizada com main${NC}"
    fi
else
    BASE_BRANCH="main"
fi

# Atualizar branch base
echo -e "${YELLOW}📥 Atualizando branch base: ${BASE_BRANCH}...${NC}"
if [ "$BASE_BRANCH" = "main" ] || [ "$BASE_BRANCH" = "master" ]; then
    git checkout main 2>/dev/null || git checkout master 2>/dev/null
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null
fi

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
git checkout -b "${BRANCH_NAME}" "${BASE_BRANCH}"

# Registrar criação em histórico
BRANCH_HISTORY_FILE=".git/branch-history.log"
echo "$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S %Z') | ${BRANCH_NAME} | criada a partir de: ${BASE_BRANCH} (estava em: ${CURRENT_BRANCH})" >> "$BRANCH_HISTORY_FILE"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Branch criada com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🌿 Branch: ${BRANCH_NAME}"
echo -e "📍 Base: ${BASE_BRANCH} ($(git rev-parse --short HEAD))"
[ "$BASE_BRANCH" != "$CURRENT_BRANCH" ] && echo -e "⚠️  Branch anterior: ${CURRENT_BRANCH}"
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
