#!/bin/bash

# ============================================
# Update Docs Helper
# ============================================
# Checklist interativo para lembrar quais
# documentos precisam ser atualizados após
# implementar uma feature
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Feature name (opcional)
FEATURE_NAME="${1:-nova-feature}"

clear
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}${BOLD}📚 Checklist de Documentação${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Feature:${NC} ${FEATURE_NAME}"
echo ""
echo -e "${CYAN}Esta é uma checklist manual. Marque o que você já atualizou:${NC}"
echo ""

# ============================================
# Função para perguntar sim/não
# ============================================
ask_yes_no() {
    local prompt="$1"
    local response

    while true; do
        echo -ne "${prompt} ${CYAN}[s/n]${NC} "
        read -r response
        case "$response" in
            [sS]|[yY]) return 0 ;;
            [nN]) return 1 ;;
            *) echo -e "${RED}Por favor, responda 's' ou 'n'${NC}" ;;
        esac
    done
}

# ============================================
# 1. Mapa de Feature
# ============================================
echo -e "${BOLD}1️⃣  Mapa de Feature${NC}"
echo ""

if ask_yes_no "   Você adicionou/modificou componentes ou hooks?"; then
    echo ""
    echo -e "   ${YELLOW}📝 Atualizar:${NC}"

    # Verificar qual feature
    if [[ "$FEATURE_NAME" == *"stats"* ]] || [[ "$FEATURE_NAME" == *"performance"* ]]; then
        echo -e "      ${CYAN}→ docs/features/stats.md${NC}"
    elif [[ "$FEATURE_NAME" == *"makeup"* ]] || [[ "$FEATURE_NAME" == *"financ"* ]]; then
        echo -e "      ${CYAN}→ docs/features/makeup.md${NC}"
    else
        echo -e "      ${CYAN}→ docs/features/<nome-da-feature>.md${NC}"
    fi

    echo ""
    echo -e "   ${YELLOW}O que documentar:${NC}"
    echo -e "      - Componentes novos (path, props)"
    echo -e "      - Hooks novos (assinatura, query)"
    echo -e "      - Mudanças no DB (tabelas, colunas)"
    echo ""
else
    echo -e "   ${GREEN}✓ Nada a fazer${NC}"
    echo ""
fi

# ============================================
# 2. ADR (Architecture Decision Record)
# ============================================
echo -e "${BOLD}2️⃣  ADR - Decisão Arquitetural${NC}"
echo ""

if ask_yes_no "   Tomou alguma decisão técnica importante?"; then
    echo ""
    echo -e "   ${YELLOW}📝 Criar:${NC}"

    # Contar quantos ADRs existem
    ADR_COUNT=$(ls -1 docs/adr/*.md 2>/dev/null | wc -l | xargs)
    NEXT_NUMBER=$(printf "%03d" $((ADR_COUNT + 1)))

    echo -e "      ${CYAN}→ docs/adr/${NEXT_NUMBER}-titulo-da-decisao.md${NC}"
    echo ""
    echo -e "   ${YELLOW}Template:${NC}"
    echo -e "      # ADR ${NEXT_NUMBER}: Título"
    echo -e "      ## Status: Aceito"
    echo -e "      ## Contexto: [Por que?]"
    echo -e "      ## Decisão: [O que decidimos?]"
    echo -e "      ## Consequências: [Prós e contras]"
    echo ""
else
    echo -e "   ${GREEN}✓ Nada a fazer${NC}"
    echo ""
fi

# ============================================
# 3. README.md
# ============================================
echo -e "${BOLD}3️⃣  README.md${NC}"
echo ""

UPDATE_README=false

echo -e "   Precisa atualizar o README?"
echo ""

if ask_yes_no "      - Feature totalmente nova?"; then
    UPDATE_README=true
    echo -e "        ${YELLOW}→ Adicionar em 'Funcionalidades Principais'${NC}"
fi

if ask_yes_no "      - Nova dependência importante?"; then
    UPDATE_README=true
    echo -e "        ${YELLOW}→ Adicionar em 'Stack Tecnológica'${NC}"
fi

if ask_yes_no "      - Novo script criado?"; then
    UPDATE_README=true
    echo -e "        ${YELLOW}→ Adicionar em 'Scripts Disponíveis'${NC}"
fi

if ask_yes_no "      - Nova otimização implementada?"; then
    UPDATE_README=true
    echo -e "        ${YELLOW}→ Adicionar em 'Otimizações e Performance'${NC}"
fi

if [ "$UPDATE_README" = false ]; then
    echo -e "   ${GREEN}✓ Nada a fazer${NC}"
fi
echo ""

# ============================================
# 4. Regras de Negócio
# ============================================
echo -e "${BOLD}4️⃣  Regras de Negócio${NC}"
echo ""

if ask_yes_no "   Mudou fórmulas, pesos ou lógica de cálculo?"; then
    echo ""
    echo -e "   ${YELLOW}📝 Atualizar:${NC}"
    echo -e "      ${CYAN}→ docs/regras-de-negocio/calculo-de-performance.md${NC}"
    echo ""
else
    echo -e "   ${GREEN}✓ Nada a fazer${NC}"
    echo ""
fi

# ============================================
# 5. Migrations (se aplicável)
# ============================================
echo -e "${BOLD}5️⃣  Database Migrations${NC}"
echo ""

if ask_yes_no "   Criou/modificou migration SQL?"; then
    echo ""
    echo -e "   ${YELLOW}✅ Verificar:${NC}"
    echo -e "      - Migration aplicada localmente?"
    echo -e "      - Migration testada com dados reais?"
    echo -e "      - Documentada no mapa de feature?"
    echo ""

    # Listar últimas migrations
    echo -e "   ${CYAN}Últimas migrations:${NC}"
    ls -1t supabase/migrations/*.sql 2>/dev/null | head -3 | sed 's/^/      /' || echo "      Nenhuma migration encontrada"
    echo ""
else
    echo -e "   ${GREEN}✓ Nada a fazer${NC}"
    echo ""
fi

# ============================================
# Resumo Final
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}✅ Checklist Concluída!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📁 Arquivos de documentação:${NC}"
echo -e "   docs/"
echo -e "   ├── features/        # Mapas de features"
echo -e "   ├── adr/             # Decisões arquiteturais"
echo -e "   ├── regras-de-negocio/  # Lógica de negócio"
echo -e "   └── architecture/    # Arquitetura geral"
echo ""
echo -e "${CYAN}💡 Dica:${NC} Mantenha a documentação sincronizada com o código!"
echo ""
