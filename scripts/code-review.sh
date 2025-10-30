#!/bin/bash

# ============================================
# Code Review Automatizado
# ============================================
# Analisa código modificado e fornece
# feedback sobre:
# - Qualidade do código
# - Padrões e convenções
# - Possíveis bugs
# - Performance
# - Segurança
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Code Review Automatizado${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar se há mudanças staged
if git diff --cached --quiet 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Nenhuma mudança staged para revisar${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dica: Faça 'git add <arquivos>' primeiro${NC}"
    exit 0
fi

# Listar arquivos modificados
echo -e "${CYAN}📋 Arquivos a serem revisados:${NC}"
MODIFIED_FILES=$(git diff --cached --name-only)
echo "$MODIFIED_FILES" | sed 's/^/   /'
echo ""

# Contador de issues
ISSUES_CRITICAL=0
ISSUES_WARNING=0
SUGGESTIONS=0

# ============================================
# 1. Verificação de Qualidade de Código
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1️⃣ Qualidade de Código${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1.1 Nomes de variáveis/funções muito curtos
echo -e "${CYAN}   Verificando nomes de variáveis...${NC}"
SHORT_NAMES=$(git diff --cached | grep -E '^\+.*\s(let|const|var|function)\s+[a-z]{1,2}\s*=' || true)

if [ -n "$SHORT_NAMES" ]; then
    echo -e "${YELLOW}   ⚠️  Nomes de variáveis muito curtos detectados:${NC}"
    echo "$SHORT_NAMES" | sed 's/^/      /'
    echo -e "${YELLOW}      Dica: Use nomes descritivos (min 3 caracteres)${NC}"
    ((ISSUES_WARNING++))
else
    echo -e "${GREEN}   ✅ Nomes de variáveis OK${NC}"
fi
echo ""

# 1.2 Console.log esquecidos
echo -e "${CYAN}   Verificando console.log...${NC}"
CONSOLE_LOGS=$(git diff --cached | grep -E '^\+.*console\.(log|debug|info)' || true)

if [ -n "$CONSOLE_LOGS" ]; then
    echo -e "${YELLOW}   ⚠️  console.log detectado no código:${NC}"
    echo "$CONSOLE_LOGS" | sed 's/^/      /'
    echo -e "${YELLOW}      Dica: Remova antes de commit (use debugger ou logger apropriado)${NC}"
    ((ISSUES_WARNING++))
else
    echo -e "${GREEN}   ✅ Sem console.log${NC}"
fi
echo ""

# 1.3 Comentários TODO/FIXME
echo -e "${CYAN}   Verificando TODOs/FIXMEs...${NC}"
TODOS=$(git diff --cached | grep -iE '^\+.*(TODO|FIXME|HACK|XXX)' || true)

if [ -n "$TODOS" ]; then
    echo -e "${CYAN}   📝 TODOs/FIXMEs encontrados:${NC}"
    echo "$TODOS" | sed 's/^/      /'
    echo -e "${CYAN}      Dica: Considere criar issues para rastrear${NC}"
    ((SUGGESTIONS++))
else
    echo -e "${GREEN}   ✅ Sem TODOs pendentes${NC}"
fi
echo ""

# ============================================
# 2. Verificação de Padrões
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2️⃣ Padrões e Convenções${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 2.1 Funções muito longas (>50 linhas)
echo -e "${CYAN}   Verificando tamanho de funções...${NC}"
# Esta é uma verificação simplificada
# Em produção, use ferramenta como complexity-report

echo -e "${GREEN}   ℹ️  Verificação manual recomendada${NC}"
echo -e "${CYAN}      Dica: Funções devem ter <50 linhas idealmente${NC}"
echo ""

# 2.2 Imports não organizados
echo -e "${CYAN}   Verificando organização de imports...${NC}"
echo -e "${GREEN}   ℹ️  ESLint/Prettier devem garantir isso${NC}"
echo ""

# 2.3 Código duplicado
echo -e "${CYAN}   Verificando duplicação...${NC}"
echo -e "${CYAN}      Dica: Extraia código repetido para funções reutilizáveis${NC}"
echo ""

# ============================================
# 3. Verificação de Performance
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3️⃣ Performance${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 3.1 Loops desnecessários
echo -e "${CYAN}   Verificando loops...${NC}"
NESTED_LOOPS=$(git diff --cached | grep -E '^\+.*for.*\{' | wc -l)

if [ "$NESTED_LOOPS" -gt 5 ]; then
    echo -e "${YELLOW}   ⚠️  Múltiplos loops detectados ($NESTED_LOOPS)${NC}"
    echo -e "${YELLOW}      Dica: Verifique se há N+1 queries ou loops aninhados${NC}"
    ((ISSUES_WARNING++))
else
    echo -e "${GREEN}   ✅ Loops parecem OK${NC}"
fi
echo ""

# 3.2 Importações pesadas sem lazy loading
echo -e "${CYAN}   Verificando lazy loading...${NC}"
HEAVY_IMPORTS=$(git diff --cached | grep -E '^\+.*import.*(jspdf|html2canvas|chart|pdf)' || true)

if [ -n "$HEAVY_IMPORTS" ]; then
    echo -e "${YELLOW}   ⚠️  Bibliotecas pesadas detectadas:${NC}"
    echo "$HEAVY_IMPORTS" | sed 's/^/      /'
    echo -e "${YELLOW}      Dica: Considere usar importação dinâmica (await import())${NC}"
    ((SUGGESTIONS++))
else
    echo -e "${GREEN}   ✅ Imports OK${NC}"
fi
echo ""

# ============================================
# 4. Verificação de Segurança
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4️⃣ Segurança${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 4.1 dangerouslySetInnerHTML
echo -e "${CYAN}   Verificando XSS...${NC}"
DANGEROUS_HTML=$(git diff --cached | grep -E '^\+.*dangerouslySetInnerHTML' || true)

if [ -n "$DANGEROUS_HTML" ]; then
    echo -e "${RED}   ❌ dangerouslySetInnerHTML detectado!${NC}"
    echo "$DANGEROUS_HTML" | sed 's/^/      /'
    echo -e "${RED}      CRÍTICO: Garanta que o HTML está sanitizado!${NC}"
    ((ISSUES_CRITICAL++))
else
    echo -e "${GREEN}   ✅ Sem uso de dangerouslySetInnerHTML${NC}"
fi
echo ""

# 4.2 Eval ou Function constructor
echo -e "${CYAN}   Verificando eval/Function...${NC}"
EVAL_USAGE=$(git diff --cached | grep -E '^\+.*(eval\(|new Function\()' || true)

if [ -n "$EVAL_USAGE" ]; then
    echo -e "${RED}   ❌ eval() ou Function() detectado!${NC}"
    echo "$EVAL_USAGE" | sed 's/^/      /'
    echo -e "${RED}      CRÍTICO: Evite uso de eval() (risco de segurança)${NC}"
    ((ISSUES_CRITICAL++))
else
    echo -e "${GREEN}   ✅ Sem uso de eval()${NC}"
fi
echo ""

# 4.3 Secrets hardcoded
echo -e "${CYAN}   Verificando secrets...${NC}"
# Já verificado pelo script de segurança
echo -e "${GREEN}   ℹ️  Execute ./scripts/run-security-tests.sh para scan completo${NC}"
echo ""

# ============================================
# 5. Verificação de Testes
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5️⃣ Testes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar se adicionou testes para código novo
echo -e "${CYAN}   Verificando cobertura de testes...${NC}"

NEW_FILES_SRC=$(git diff --cached --name-only --diff-filter=A | grep -E '^src/.*(\.ts|\.tsx)$' | grep -v '\.test\.' || true)
NEW_FILES_TEST=$(git diff --cached --name-only --diff-filter=A | grep -E '^src/.*\.test\.(ts|tsx)$' || true)

if [ -n "$NEW_FILES_SRC" ] && [ -z "$NEW_FILES_TEST" ]; then
    echo -e "${YELLOW}   ⚠️  Arquivos novos sem testes:${NC}"
    echo "$NEW_FILES_SRC" | sed 's/^/      /'
    echo -e "${YELLOW}      Dica: Considere adicionar testes para lógica crítica${NC}"
    ((SUGGESTIONS++))
else
    echo -e "${GREEN}   ✅ Testes adicionados ou não aplicável${NC}"
fi
echo ""

# ============================================
# Resumo Final
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Resumo do Code Review${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "❌ Issues Críticos: ${RED}${ISSUES_CRITICAL}${NC}"
echo -e "⚠️  Warnings: ${YELLOW}${ISSUES_WARNING}${NC}"
echo -e "💡 Sugestões: ${CYAN}${SUGGESTIONS}${NC}"
echo ""

# Decisão final
if [ $ISSUES_CRITICAL -gt 0 ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ REPROVADO - Issues críticos encontrados!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Corrija os issues críticos antes de commit!${NC}"
    echo ""
    exit 1
elif [ $ISSUES_WARNING -gt 3 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  REQUER AJUSTES - Muitos warnings${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}💡 Recomendado: Corrija os warnings antes de commit${NC}"
    echo ""
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Commit cancelado pelo usuário${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ APROVADO - Code review passou!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if [ $SUGGESTIONS -gt 0 ]; then
        echo -e "${CYAN}💡 $SUGGESTIONS sugestão(ões) para considerar${NC}"
        echo ""
    fi

    echo -e "${YELLOW}💡 Próximos passos:${NC}"
    echo -e "   1. Revisar sugestões (se houver)"
    echo -e "   2. Executar testes: ./scripts/run-tests.sh"
    echo -e "   3. Executar security scan: ./scripts/run-security-tests.sh"
    echo -e "   4. Commit: ./scripts/commit-and-push.sh \"mensagem\""
    echo ""
fi

# Sugestão de mensagem de commit
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}💬 Sugestão de Mensagem de Commit${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Baseado nos arquivos modificados, considere:"
echo ""

# Detectar tipo de mudança
if echo "$MODIFIED_FILES" | grep -qE '\.test\.(ts|tsx)$'; then
    echo -e "${CYAN}   test: <descrição dos testes adicionados>${NC}"
fi

if echo "$MODIFIED_FILES" | grep -qE 'src/components/.*\.(tsx|ts)$'; then
    echo -e "${CYAN}   feat: <nova funcionalidade no componente X>${NC}"
    echo -e "${CYAN}   fix: <correção de bug no componente X>${NC}"
    echo -e "${CYAN}   refactor: <refatoração do componente X>${NC}"
fi

if echo "$MODIFIED_FILES" | grep -qE 'src/hooks/.*\.ts$'; then
    echo -e "${CYAN}   feat: <novo hook ou melhoria em hook>${NC}"
fi

if echo "$MODIFIED_FILES" | grep -qE '\.css$|\.scss$|tailwind'; then
    echo -e "${CYAN}   style: <ajustes de estilo>${NC}"
fi

if echo "$MODIFIED_FILES" | grep -qE 'supabase/migrations/'; then
    echo -e "${CYAN}   migration: <descrição da mudança no schema>${NC}"
fi

if echo "$MODIFIED_FILES" | grep -qE 'docs/|README\.md'; then
    echo -e "${CYAN}   docs: <atualização da documentação>${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Code Review Completo!${NC}"
echo ""
