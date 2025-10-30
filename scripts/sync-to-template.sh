#!/bin/bash

# ============================================
# Sincronizar Mudanças para Template Base
# ============================================
# Compara arquivos do projeto com template
# e sincroniza melhorias para o template base
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Caminho para o template base
TEMPLATE_PATH="/Users/tiago/Projects/project-template"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 Sincronizar com Template Base${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar se template existe
if [ ! -d "$TEMPLATE_PATH" ]; then
    echo -e "${RED}❌ Erro: Template não encontrado em $TEMPLATE_PATH${NC}"
    exit 1
fi

# Diretórios e arquivos para sincronizar
SYNC_PATHS=(
    ".windsurf/workflows"
    ".claude/commands"
    ".claude/CLAUDE.md"
    "scripts"
    "AGENTS.md"
)

# Contadores
FILES_CHANGED=0
FILES_SYNCED=0

echo -e "${CYAN}📂 Analisando mudanças...${NC}"
echo ""

# Criar array de mudanças detectadas
declare -a CHANGES=()

# Comparar cada caminho
for path in "${SYNC_PATHS[@]}"; do
    if [ -e "$path" ]; then
        # Verificar se é arquivo ou diretório
        if [ -f "$path" ]; then
            # É um arquivo
            if [ -f "$TEMPLATE_PATH/$path" ]; then
                # Comparar arquivos
                if ! diff -q "$path" "$TEMPLATE_PATH/$path" > /dev/null 2>&1; then
                    CHANGES+=("$path")
                    ((FILES_CHANGED++))
                fi
            else
                # Arquivo não existe no template
                CHANGES+=("$path")
                ((FILES_CHANGED++))
            fi
        elif [ -d "$path" ]; then
            # É um diretório - comparar arquivos dentro
            for file in "$path"/*; do
                if [ -f "$file" ]; then
                    filename=$(basename "$file")
                    if [ -f "$TEMPLATE_PATH/$path/$filename" ]; then
                        if ! diff -q "$file" "$TEMPLATE_PATH/$path/$filename" > /dev/null 2>&1; then
                            CHANGES+=("$file")
                            ((FILES_CHANGED++))
                        fi
                    else
                        CHANGES+=("$file")
                        ((FILES_CHANGED++))
                    fi
                fi
            done
        fi
    fi
done

# Mostrar mudanças detectadas
if [ $FILES_CHANGED -eq 0 ]; then
    echo -e "${GREEN}✅ Nenhuma mudança detectada${NC}"
    echo ""
    echo -e "${CYAN}Template está sincronizado com o projeto atual!${NC}"
    exit 0
fi

echo -e "${YELLOW}📋 ${FILES_CHANGED} arquivo(s) modificado(s) detectado(s):${NC}"
echo ""

for file in "${CHANGES[@]}"; do
    echo -e "   📄 $file"
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}❓ Selecione arquivos para sincronizar${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Array de arquivos selecionados
declare -a SELECTED=()

# Opções
echo -e "${CYAN}Opções:${NC}"
echo -e "  ${GREEN}a${NC} - Sincronizar TODOS os arquivos"
echo -e "  ${GREEN}n${NC} - NÃO sincronizar nenhum arquivo (cancelar)"
echo -e "  ${GREEN}s${NC} - Selecionar individualmente"
echo ""

read -p "Escolha (a/n/s): " -n 1 -r CHOICE
echo ""
echo ""

case $CHOICE in
    [Aa]* )
        # Sincronizar todos
        SELECTED=("${CHANGES[@]}")
        echo -e "${GREEN}✅ Selecionado: TODOS os arquivos${NC}"
        ;;
    [Nn]* )
        # Cancelar
        echo -e "${YELLOW}❌ Sincronização cancelada${NC}"
        exit 0
        ;;
    [Ss]* )
        # Selecionar individualmente
        echo -e "${CYAN}📝 Selecionar arquivos individualmente:${NC}"
        echo ""
        for file in "${CHANGES[@]}"; do
            echo -e "${YELLOW}Sincronizar: $file ?${NC}"
            read -p "(y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                SELECTED+=("$file")
                echo -e "${GREEN}  ✅ Selecionado${NC}"
            else
                echo -e "${RED}  ⏭️  Ignorado${NC}"
            fi
            echo ""
        done
        ;;
    * )
        echo -e "${RED}Opção inválida. Cancelando...${NC}"
        exit 1
        ;;
esac

# Verificar se algum arquivo foi selecionado
if [ ${#SELECTED[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nenhum arquivo selecionado${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Sincronizando ${#SELECTED[@]} arquivo(s)...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Sincronizar arquivos selecionados
for file in "${SELECTED[@]}"; do
    echo -e "${CYAN}📄 Sincronizando: $file${NC}"

    # Criar diretório de destino se não existir
    dest_dir=$(dirname "$TEMPLATE_PATH/$file")
    mkdir -p "$dest_dir"

    # Copiar arquivo
    cp "$file" "$TEMPLATE_PATH/$file"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ Copiado para template${NC}"
        ((FILES_SYNCED++))
    else
        echo -e "${RED}   ❌ Erro ao copiar${NC}"
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Sincronização Completa!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📊 Arquivos sincronizados: ${GREEN}${FILES_SYNCED}${NC}"
echo -e "📂 Template atualizado em: ${CYAN}${TEMPLATE_PATH}${NC}"
echo ""

# Perguntar se quer commitar mudanças no template
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}❓ Commitar mudanças no template?${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Fazer commit das mudanças no template? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}💾 Commitando mudanças no template...${NC}"
    echo ""

    # Ir para o diretório do template
    cd "$TEMPLATE_PATH"

    # Verificar se é um repositório Git
    if [ -d ".git" ]; then
        # Add arquivos sincronizados
        for file in "${SELECTED[@]}"; do
            git add "$file"
        done

        # Commit
        COMMIT_MSG="meta: sincronizar melhorias do projeto"
        echo -e "${YELLOW}Mensagem de commit:${NC}"
        echo -e "  $COMMIT_MSG"
        echo ""

        read -p "Usar esta mensagem? (y/N ou digite nova): " -r
        echo ""

        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            read -p "Digite nova mensagem: " COMMIT_MSG
        fi

        git commit -m "$COMMIT_MSG"

        echo ""
        echo -e "${GREEN}✅ Commit realizado no template!${NC}"
        echo ""
        echo -e "${YELLOW}💡 Para enviar para remote (se houver):${NC}"
        echo -e "   cd $TEMPLATE_PATH"
        echo -e "   git push origin main"
    else
        echo -e "${YELLOW}⚠️  Template não é um repositório Git${NC}"
        echo -e "${YELLOW}   Considere inicializar: cd $TEMPLATE_PATH && git init${NC}"
    fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Template atualizado com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📝 Próximos passos:${NC}"
echo -e "   1. Documentar melhorias em docs/TEMPLATE_EVOLUTION.md"
echo -e "   2. Próximos projetos herdarão automaticamente as melhorias"
echo -e "   3. Continuar desenvolvendo sabendo que o template evolui com você"
echo ""
