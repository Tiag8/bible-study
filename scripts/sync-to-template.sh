#!/bin/bash

# ============================================
# Sincronizar Mudanças para Template Base
# Versão: 2.0
# ============================================
# Compara arquivos do projeto com template
# e sincroniza melhorias para o template base
#
# Novas features v2.0:
# - Backup automático pré-operação
# - Cleanup duplicatas workflows
# - Auditoria multi-categoria
# - Validação estrutural final
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Caminho para o template base
TEMPLATE_PATH="/Users/tiago/Projects/project-template"
PROJECT_PATH="/Users/tiago/Projects/life_tracker"

# Timestamp para backups
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Contadores globais
FILES_CHANGED=0
FILES_SYNCED=0
FILES_BACKED_UP=0
DUPLICATES_DELETED=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 Sincronizar com Template Base v2.0${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar se template existe
if [ ! -d "$TEMPLATE_PATH" ]; then
    echo -e "${RED}❌ Erro: Template não encontrado em $TEMPLATE_PATH${NC}"
    exit 1
fi

# ============================================
# FUNÇÃO: Criar Backup
# ============================================
create_backup() {
    local category=$1
    local backup_dir="$TEMPLATE_PATH/$category/.backup-$TIMESTAMP"

    echo -e "${CYAN}📦 Criando backup de $category...${NC}"

    # Criar diretório de backup
    mkdir -p "$backup_dir"

    # Copiar todos os arquivos atuais
    local count=0
    if [ -d "$TEMPLATE_PATH/$category" ]; then
        for file in "$TEMPLATE_PATH/$category"/*; do
            if [ -f "$file" ]; then
                cp "$file" "$backup_dir/"
                ((count++))
            fi
        done
    fi

    if [ $count -gt 0 ]; then
        echo -e "${GREEN}   ✅ $count arquivo(s) backupeado(s)${NC}"
        FILES_BACKED_UP=$((FILES_BACKED_UP + count))
    else
        echo -e "${YELLOW}   ⚠️  Categoria vazia, nenhum backup necessário${NC}"
        rmdir "$backup_dir"
    fi
}

# ============================================
# FUNÇÃO: Cleanup Duplicatas Workflows
# ============================================
cleanup_workflow_duplicates() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}🧹 Cleanup de Duplicatas Workflows${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    local workflows_dir="$TEMPLATE_PATH/.windsurf/workflows"

    if [ ! -d "$workflows_dir" ]; then
        echo -e "${YELLOW}⚠️  Diretório workflows não existe ainda${NC}"
        return
    fi

    # Padrões de duplicatas a deletar (versões número inteiro)
    local duplicates=(
        "add-feature-2-solutions.md"
        "add-feature-5-implement.md"
        "add-feature-6-test.md"
        "add-feature-7-polish-and-deploy.md"
        "add-feature-8-retrospective.md"
        "add-feature-9-learning-capture.md"
        "add-feature-11-pr-preparation-and-merge.md"
        "add-feature-13-validation-loop.md"
    )

    for duplicate in "${duplicates[@]}"; do
        local file_path="$workflows_dir/$duplicate"
        if [ -f "$file_path" ]; then
            echo -e "${RED}❌ Deletando duplicata: $duplicate${NC}"
            rm "$file_path"
            ((DUPLICATES_DELETED++))
        fi
    done

    if [ $DUPLICATES_DELETED -eq 0 ]; then
        echo -e "${GREEN}✅ Nenhuma duplicata encontrada${NC}"
    else
        echo -e "${GREEN}✅ $DUPLICATES_DELETED duplicata(s) removida(s)${NC}"
    fi
}

# ============================================
# FUNÇÃO: Auditoria Multi-Categoria
# ============================================
audit_category() {
    local category=$1
    local filter=$2  # Optional: filter pattern to exclude

    echo ""
    echo -e "${CYAN}🔍 Auditando: $category${NC}"

    local project_dir="$PROJECT_PATH/$category"
    local template_dir="$TEMPLATE_PATH/$category"

    if [ ! -d "$project_dir" ]; then
        echo -e "${YELLOW}   ⚠️  Categoria não existe no projeto${NC}"
        return
    fi

    # Criar diretório no template se não existir
    mkdir -p "$template_dir"

    local count=0
    declare -a files_in_category=()

    for file in "$project_dir"/*; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")

            # Aplicar filtro se fornecido
            if [ -n "$filter" ]; then
                if echo "$filename" | grep -qE "$filter"; then
                    # echo -e "${YELLOW}   ⏭️  Ignorado (específico projeto): $filename${NC}"
                    continue
                fi
            fi

            # Comparar com template
            if [ -f "$template_dir/$filename" ]; then
                if ! diff -q "$file" "$template_dir/$filename" > /dev/null 2>&1; then
                    files_in_category+=("$category/$filename")
                    ((count++))
                fi
            else
                files_in_category+=("$category/$filename")
                ((count++))
            fi
        fi
    done

    if [ $count -gt 0 ]; then
        echo -e "${YELLOW}   📊 $count arquivo(s) genérico(s) modificado(s)${NC}"
        for f in "${files_in_category[@]}"; do
            CHANGES+=("$f")
            ((FILES_CHANGED++))
        done
    else
        echo -e "${GREEN}   ✅ Sincronizado${NC}"
    fi
}

# ============================================
# FUNÇÃO: Validação Estrutural Final
# ============================================
validate_structure() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}🔍 Validação Estrutural Final${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Validar workflows
    echo -e "${CYAN}📂 Validando: .windsurf/workflows${NC}"

    local project_list=$(mktemp)
    local template_list=$(mktemp)

    # Listar workflows do projeto
    if [ -d "$PROJECT_PATH/.windsurf/workflows" ]; then
        ls -1 "$PROJECT_PATH/.windsurf/workflows" | sort > "$project_list"
    fi

    # Listar workflows do template
    if [ -d "$TEMPLATE_PATH/.windsurf/workflows" ]; then
        ls -1 "$TEMPLATE_PATH/.windsurf/workflows" | grep -v "^\.backup-" | sort > "$template_list"
    fi

    # Comparar estruturas
    if diff -q "$project_list" "$template_list" > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Estrutura IDÊNTICA${NC}"
    else
        echo -e "${RED}   ❌ Drift detectado:${NC}"
        echo ""
        diff --side-by-side "$project_list" "$template_list" || true
        echo ""
    fi

    # Cleanup
    rm "$project_list" "$template_list"

    # Validar scripts genéricos
    echo ""
    echo -e "${CYAN}📂 Validando: scripts (genéricos)${NC}"
    local generic_scripts=0
    if [ -d "$PROJECT_PATH/scripts" ]; then
        for script in "$PROJECT_PATH/scripts"/validate-*.sh "$PROJECT_PATH/scripts"/context-*.sh "$PROJECT_PATH/scripts"/deploy-*.sh; do
            if [ -f "$script" ]; then
                ((generic_scripts++))
            fi
        done
    fi
    echo -e "${GREEN}   ✅ $generic_scripts script(s) genérico(s) detectado(s)${NC}"

    # Validar agentes
    echo ""
    echo -e "${CYAN}📂 Validando: .claude/agents${NC}"
    local agent_count=0
    if [ -d "$TEMPLATE_PATH/.claude/agents" ]; then
        agent_count=$(ls -1 "$TEMPLATE_PATH/.claude/agents" | wc -l)
    fi
    echo -e "${GREEN}   ✅ $agent_count agente(s) no template${NC}"
}

# ============================================
# MAIN: Iniciar Processo
# ============================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📦 FASE 1: Backup Automático${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Criar backups de todas as categorias
create_backup ".windsurf/workflows"
create_backup "scripts"
create_backup ".claude/agents"
create_backup ".claude/commands"

echo ""
echo -e "${GREEN}✅ Total backupeado: $FILES_BACKED_UP arquivo(s)${NC}"
echo -e "${CYAN}💾 Backups em: $TEMPLATE_PATH/{categoria}/.backup-$TIMESTAMP${NC}"

# ============================================
# FASE 2: Cleanup Duplicatas
# ============================================

cleanup_workflow_duplicates

# ============================================
# FASE 3: Auditoria Multi-Categoria
# ============================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📋 FASE 3: Auditoria Multi-Categoria${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Array de mudanças detectadas
declare -a CHANGES=()

# Auditar workflows
audit_category ".windsurf/workflows" ""

# Auditar scripts genéricos
audit_category "scripts" "(backup-|lifetracker-|assessment-|chat-)"

# Auditar agentes genéricos
audit_category ".claude/agents" ""

# Auditar commands genéricos
audit_category ".claude/commands" ""

# Arquivos individuais
echo ""
echo -e "${CYAN}🔍 Auditando: Arquivos individuais${NC}"

# CLAUDE.md
if [ -f "$PROJECT_PATH/.claude/CLAUDE.md" ]; then
    if [ -f "$TEMPLATE_PATH/.claude/CLAUDE.md" ]; then
        if ! diff -q "$PROJECT_PATH/.claude/CLAUDE.md" "$TEMPLATE_PATH/.claude/CLAUDE.md" > /dev/null 2>&1; then
            CHANGES+=(".claude/CLAUDE.md")
            ((FILES_CHANGED++))
        fi
    else
        CHANGES+=(".claude/CLAUDE.md")
        ((FILES_CHANGED++))
    fi
fi

# AGENTS.md
if [ -f "$PROJECT_PATH/AGENTS.md" ]; then
    if [ -f "$TEMPLATE_PATH/AGENTS.md" ]; then
        if ! diff -q "$PROJECT_PATH/AGENTS.md" "$TEMPLATE_PATH/AGENTS.md" > /dev/null 2>&1; then
            CHANGES+=("AGENTS.md")
            ((FILES_CHANGED++))
        fi
    else
        CHANGES+=("AGENTS.md")
        ((FILES_CHANGED++))
    fi
fi

# Auditar docs genéricos (ADRs/guides sem lifetracker)
if [ -d "$PROJECT_PATH/docs" ]; then
    echo ""
    echo -e "${CYAN}🔍 Auditando: docs (genéricos)${NC}"

    local doc_count=0
    for doc_type in "adr" "guides"; do
        if [ -d "$PROJECT_PATH/docs/$doc_type" ]; then
            for doc in "$PROJECT_PATH/docs/$doc_type"/*.md; do
                if [ -f "$doc" ]; then
                    local docname=$(basename "$doc")

                    # Filtrar docs específicos do projeto
                    if echo "$docname" | grep -qE "(lifetracker|habits|coach|assessment|whatsapp)"; then
                        continue
                    fi

                    # Comparar com template
                    if [ -f "$TEMPLATE_PATH/docs/$doc_type/$docname" ]; then
                        if ! diff -q "$doc" "$TEMPLATE_PATH/docs/$doc_type/$docname" > /dev/null 2>&1; then
                            CHANGES+=("docs/$doc_type/$docname")
                            ((FILES_CHANGED++))
                            ((doc_count++))
                        fi
                    else
                        CHANGES+=("docs/$doc_type/$docname")
                        ((FILES_CHANGED++))
                        ((doc_count++))
                    fi
                fi
            done
        fi
    done

    if [ $doc_count -gt 0 ]; then
        echo -e "${YELLOW}   📊 $doc_count doc(s) genérico(s) modificado(s)${NC}"
    else
        echo -e "${GREEN}   ✅ Sincronizado${NC}"
    fi
fi

# ============================================
# FASE 4: Seleção e Sincronização
# ============================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📊 Resumo da Auditoria${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📦 Arquivos backupeados: ${GREEN}$FILES_BACKED_UP${NC}"
echo -e "❌ Duplicatas removidas: ${GREEN}$DUPLICATES_DELETED${NC}"
echo -e "📋 Arquivos modificados: ${YELLOW}$FILES_CHANGED${NC}"
echo ""

# Mostrar mudanças detectadas
if [ $FILES_CHANGED -eq 0 ]; then
    echo -e "${GREEN}✅ Nenhuma mudança detectada${NC}"
    echo ""
    echo -e "${CYAN}Template está sincronizado com o projeto atual!${NC}"

    # Executar validação estrutural mesmo sem mudanças
    validate_structure

    exit 0
fi

echo -e "${YELLOW}📋 Arquivos modificados detectados:${NC}"
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
    cp "$PROJECT_PATH/$file" "$TEMPLATE_PATH/$file"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ Copiado para template${NC}"
        ((FILES_SYNCED++))
    else
        echo -e "${RED}   ❌ Erro ao copiar${NC}"
    fi
done

# ============================================
# FASE 5: Validação Estrutural Final
# ============================================

validate_structure

# ============================================
# FASE 6: Commit (Opcional)
# ============================================

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
        COMMIT_MSG="meta: sincronizar melhorias do projeto

- Arquivos: ${FILES_SYNCED}
- Backups: ${FILES_BACKED_UP}
- Duplicatas removidas: ${DUPLICATES_DELETED}
- Data: $(date +"%Y-%m-%d %H:%M:%S")"

        echo -e "${YELLOW}Mensagem de commit:${NC}"
        echo "$COMMIT_MSG"
        echo ""

        read -p "Usar esta mensagem? (y/N ou digite nova): " -r
        echo ""

        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            read -p "Digite nova mensagem: " CUSTOM_MSG
            COMMIT_MSG="$CUSTOM_MSG"
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
echo -e "${MAGENTA}🔍 Resumo Final:${NC}"
echo -e "   📦 Backups criados: $FILES_BACKED_UP arquivo(s)"
echo -e "   ❌ Duplicatas removidas: $DUPLICATES_DELETED"
echo -e "   📋 Arquivos detectados: $FILES_CHANGED"
echo -e "   ✅ Arquivos sincronizados: $FILES_SYNCED"
echo ""
