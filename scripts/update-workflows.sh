#!/bin/bash

# Script para atualizar workflows com leitura/atualização de PLAN.md e TASK.md

WORKFLOW_DIR="/Users/tiago/Projects/life_tracker/.windsurf/workflows"

# Lista de workflows a atualizar (excluindo add-feature.md que já foi atualizado)
WORKFLOWS=(
    "add-feature-1-planning.md"
    "add-feature-2-solutions.md"
    "add-feature-3-risk-analysis.md"
    "add-feature-4-setup.md"
    "add-feature-5-implementation.md"
    "add-feature-6-user-validation.md"
    "add-feature-7-quality.md"
    "add-feature-8-meta-learning.md"
    "add-feature-9-finalization.md"
    "add-feature-10-template-sync.md"
    "add-feature-11-vps-deployment.md"
    "ultra-think.md"
)

# Texto a adicionar no início (após o título principal)
PRE_REQUISITE_TEXT="
## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- \`docs/PLAN.md\` - Visão estratégica atual
- \`docs/TASK.md\` - Status das tarefas em andamento
- \`docs/pesquisa-de-mercado/\` - Fundamentos científicos

---
"

# Texto a adicionar no final (antes da última atualização)
UPDATE_TEXT="
## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar \`docs/TASK.md\` com status das tarefas completadas
- [ ] Atualizar \`docs/PLAN.md\` se houve mudança estratégica
- [ ] Criar ADR em \`docs/adr/\` se houve decisão arquitetural

---
"

# Processar cada workflow
for workflow in "${WORKFLOWS[@]}"; do
    FILE="$WORKFLOW_DIR/$workflow"

    if [ -f "$FILE" ]; then
        echo "Atualizando $workflow..."

        # Criar backup
        cp "$FILE" "$FILE.bak"

        # Verificar se já tem a seção de pré-requisito
        if ! grep -q "Pré-requisito: Consultar Documentação Base" "$FILE"; then
            # Adicionar seção de pré-requisito após o primeiro "---" depois do cabeçalho
            # Usando awk para inserir após a primeira ocorrência de "---" que não seja do front-matter
            awk '
                BEGIN { frontmatter=0; inserted=0 }
                /^---$/ {
                    frontmatter++
                    print
                    if (frontmatter == 2 && inserted == 0) {
                        print "'"$PRE_REQUISITE_TEXT"'"
                        inserted = 1
                    }
                    next
                }
                { print }
            ' "$FILE.bak" > "$FILE.tmp"
            mv "$FILE.tmp" "$FILE"
        fi

        # Verificar se já tem a seção de atualização
        if ! grep -q "Atualização de Documentação" "$FILE"; then
            # Adicionar seção de atualização antes da última linha "---"
            # Se o arquivo termina com metadata (Última atualização), adicionar antes
            if grep -q "Última atualização" "$FILE"; then
                # Inserir antes da última seção de metadata
                awk '
                    /^---$/ { if (getline) {
                        if (/Última atualização/) {
                            print "'"$UPDATE_TEXT"'"
                            print "---"
                            print
                        } else {
                            print "---"
                            print
                        }
                    } else {
                        print "---"
                    }
                    next
                    }
                    { print }
                ' "$FILE.bak" > "$FILE.tmp"

                # Se não funcionou, adicionar no final
                if ! grep -q "Atualização de Documentação" "$FILE.tmp"; then
                    cat "$FILE.bak" > "$FILE.tmp"
                    echo "$UPDATE_TEXT" >> "$FILE.tmp"
                fi

                mv "$FILE.tmp" "$FILE"
            else
                # Se não tem metadata, adicionar no final
                echo "$UPDATE_TEXT" >> "$FILE"
            fi
        fi

        # Atualizar data de última atualização se existir
        sed -i '' 's/Última atualização\*\*: .*/Última atualização\*\*: 2025-11-01/' "$FILE" 2>/dev/null

        # Remover backup se tudo correu bem
        rm "$FILE.bak"

        echo "✅ $workflow atualizado"
    else
        echo "⚠️ $workflow não encontrado"
    fi
done

echo ""
echo "✅ Todos os workflows foram atualizados com sucesso!"
echo "📝 As seguintes seções foram adicionadas:"
echo "   - Pré-requisito: Consultar PLAN.md, TASK.md e pesquisa-de-mercado"
echo "   - Atualização: Instruções para atualizar docs após completar workflow"