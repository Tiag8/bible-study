#!/bin/bash

# Script: validate-workflow-size.sh
# Descrição: Valida que todos workflows em .windsurf/workflows/ não excedem 12.000 caracteres
# Uso: ./scripts/validate-workflow-size.sh
# Exit: 0 (sucesso) | 1 (um ou mais workflows excedem limite)

set -e

# Cores ANSI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
LIMIT=12000
WORKFLOWS_DIR=".windsurf/workflows"
errors=0
warnings=0

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Validação de Tamanho de Workflows                        ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar se diretório existe
if [ ! -d "$WORKFLOWS_DIR" ]; then
    echo -e "${RED}❌ ERRO: Diretório $WORKFLOWS_DIR não encontrado${NC}"
    exit 1
fi

# Contar workflows
total_workflows=$(find "$WORKFLOWS_DIR" -name "*.md" | wc -l | tr -d ' ')
echo -e "${BLUE}📋 Total de workflows encontrados: $total_workflows${NC}"
echo -e "${BLUE}📏 Limite máximo: $LIMIT caracteres${NC}"
echo ""

# Validar cada workflow
echo -e "${CYAN}Validando workflows...${NC}"
echo ""

for file in "$WORKFLOWS_DIR"/*.md; do
    # Obter nome do arquivo
    filename=$(basename "$file")

    # Contar caracteres (não bytes)
    chars=$(wc -m < "$file" | tr -d ' ')

    # Calcular porcentagem do limite
    percentage=$((chars * 100 / LIMIT))

    # Verificar se excede limite
    if [ "$chars" -gt "$LIMIT" ]; then
        excess=$((chars - LIMIT))
        echo -e "${RED}❌ $filename${NC}"
        echo -e "   ${RED}Tamanho: $chars caracteres (${percentage}% do limite)${NC}"
        echo -e "   ${RED}EXCEDE em: $excess caracteres${NC}"
        echo ""
        errors=$((errors + 1))
    elif [ "$chars" -gt $((LIMIT * 90 / 100)) ]; then
        # Warning se >= 90% do limite
        remaining=$((LIMIT - chars))
        echo -e "${YELLOW}⚠️  $filename${NC}"
        echo -e "   ${YELLOW}Tamanho: $chars caracteres (${percentage}% do limite)${NC}"
        echo -e "   ${YELLOW}Restam apenas: $remaining caracteres${NC}"
        echo ""
        warnings=$((warnings + 1))
    else
        echo -e "${GREEN}✅ $filename${NC}"
        echo -e "   ${GREEN}Tamanho: $chars caracteres (${percentage}% do limite)${NC}"
        echo ""
    fi
done

# Detectar splits desnecessários (consolidações possíveis)
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Análise de Consolidações Possíveis                       ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

consolidations_found=0
processed_pairs_file=$(mktemp)

# Criar arquivo temporário com lista de workflows e seus tamanhos
workflow_list_file=$(mktemp)
for file in "$WORKFLOWS_DIR"/*.md; do
    filename=$(basename "$file")
    chars=$(wc -m < "$file" | tr -d ' ')
    echo "$filename:$chars" >> "$workflow_list_file"
done

# Função para encontrar tamanho de um workflow
get_workflow_size() {
    local wf_name="$1"
    grep "^${wf_name}:" "$workflow_list_file" | cut -d: -f2
}

# Detectar splits que podem ser consolidados
while IFS= read -r line; do
    filename=$(echo "$line" | cut -d: -f1)
    chars=$(echo "$line" | cut -d: -f2)

    # Verificar se é um workflow split (termina com a, b, c1, c2, etc)
    if echo "$filename" | grep -qE "add-feature-[0-9]+(a|b|c[0-9])-"; then
        # Extrair número base e sufixo
        base_num=$(echo "$filename" | sed -E 's/add-feature-([0-9]+)[abc].*/\1/')
        current_suffix=$(echo "$filename" | sed -E 's/add-feature-[0-9]+([abc]).*/\1/')
        current_num=$(echo "$filename" | sed -E 's/add-feature-[0-9]+c([0-9]).*/\1/')

        # Construir nome do próximo workflow esperado
        next_filename=""

        if [ "$current_suffix" = "a" ]; then
            next_filename="add-feature-${base_num}b"
        elif [ "$current_suffix" = "b" ]; then
            next_filename="add-feature-${base_num}c1"
        elif [ "$current_suffix" = "c" ] && [ -n "$current_num" ] && [ "$current_num" = "1" ]; then
            next_filename="add-feature-${base_num}c2"
        fi

        # Procurar o próximo workflow
        if [ -n "$next_filename" ]; then
            next_filename_pattern="${next_filename}-"
            candidate=$(grep "^${next_filename_pattern}" "$workflow_list_file" | cut -d: -f1 | head -1)

            if [ -n "$candidate" ]; then
                next_chars=$(get_workflow_size "$candidate")
                if [ -n "$next_chars" ]; then
                    combined=$((chars + next_chars))

                    # Evitar duplicatas verificando arquivo de processados
                    pair_key=$(echo "$filename:$candidate" | sort)
                    if ! grep -q "^${pair_key}\$" "$processed_pairs_file" 2>/dev/null && \
                       ! grep -q "^${candidate}:${filename}\$" "$processed_pairs_file" 2>/dev/null; then
                        echo "$pair_key" >> "$processed_pairs_file"

                        # Se soma < 12.000, sugerir consolidação
                        if [ "$combined" -lt "$LIMIT" ]; then
                            consolidations_found=$((consolidations_found + 1))

                            if [ $consolidations_found -eq 1 ]; then
                                echo -e "${CYAN}💡 CONSOLIDAÇÕES POSSÍVEIS:${NC}"
                                echo ""
                            fi

                            echo -e "   ${YELLOW}${filename}${NC} + ${YELLOW}${candidate}${NC}"
                            echo -e "   ${BLUE}Soma: ${combined} caracteres (consolidável)${NC}"
                            echo ""
                        fi
                    fi
                fi
            fi
        fi
    fi
done < "$workflow_list_file"

# Limpar arquivos temporários
rm -f "$workflow_list_file" "$processed_pairs_file"

if [ $consolidations_found -eq 0 ]; then
    echo -e "${GREEN}✅ Nenhuma consolidação recomendada${NC}"
    echo -e "   Todos os splits necessários têm tamanho > 12k ou estão bem distribuídos"
else
    echo -e "${YELLOW}⚠️  ATENÇÃO: Verifique se workflows são SUBSEQUENTES DIRETOS${NC}"
    echo -e "   Considere consolidar apenas se fizerem sentido logicamente"
fi

echo ""

# Relatório final
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Relatório Final                                          ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Total de workflows validados: $total_workflows${NC}"
echo -e "${GREEN}✅ Workflows OK: $((total_workflows - errors - warnings))${NC}"

if [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Workflows próximos do limite (>90%): $warnings${NC}"
fi

if [ $errors -gt 0 ]; then
    echo -e "${RED}❌ Workflows que excedem limite: $errors${NC}"
    echo ""
    echo -e "${YELLOW}📋 Próximos passos para workflows que excedem:${NC}"
    echo -e "   1. Identificar seções redundantes"
    echo -e "   2. Propor split lógico em 2-3 partes"
    echo -e "   3. Criar arquivos: workflow-Xa.md, workflow-Xb.md"
    echo -e "   4. Adicionar links de navegação (anterior/próximo)"
    echo -e "   5. Remover workflow original após split"
    echo ""
fi

echo ""

# Exit code
if [ $errors -gt 0 ]; then
    echo -e "${RED}❌ FALHA: Um ou mais workflows excedem o limite de $LIMIT caracteres${NC}"
    exit 1
else
    echo -e "${GREEN}✅ SUCESSO: Todos workflows estão dentro do limite${NC}"
    exit 0
fi
