#!/usr/bin/env python3

import os
import re

WORKFLOW_DIR = "/Users/tiago/Projects/life_tracker/.windsurf/workflows"

# Lista de workflows a atualizar
WORKFLOWS = [
    "add-feature-2-solutions.md",
    "add-feature-3-risk-analysis.md",
    "add-feature-4-setup.md",
    "add-feature-5-implementation.md",
    "add-feature-6-user-validation.md",
    "add-feature-7-quality.md",
    "add-feature-8-meta-learning.md",
    "add-feature-9-finalization.md",
    "add-feature-10-template-sync.md",
    "add-feature-11-vps-deployment.md",
    "ultra-think.md"
]

# Texto do pré-requisito
PREREQUISITE_TEXT = """
## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---"""

# Texto da atualização
UPDATE_TEXT = """
## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural

---"""

def add_prerequisite_section(content):
    """Adiciona a seção de pré-requisito após o primeiro ---"""
    lines = content.split('\n')

    # Verifica se já tem a seção
    if "Pré-requisito: Consultar Documentação Base" in content:
        return content

    # Encontra o segundo --- (após o front matter)
    dash_count = 0
    insert_index = -1

    for i, line in enumerate(lines):
        if line.strip() == '---':
            dash_count += 1
            if dash_count == 2:
                insert_index = i + 1
                break

    if insert_index > 0:
        lines.insert(insert_index, PREREQUISITE_TEXT)
        return '\n'.join(lines)

    return content

def add_update_section(content):
    """Adiciona a seção de atualização antes do final"""
    lines = content.split('\n')

    # Verifica se já tem a seção
    if "Atualização de Documentação" in content:
        return content

    # Encontra onde adicionar (antes da última atualização ou no final)
    insert_index = -1

    # Procura por "Última atualização" ou padrões similares
    for i in range(len(lines) - 1, -1, -1):
        if "Última atualização" in lines[i] or "**Última atualização**" in lines[i]:
            # Volta para encontrar o --- anterior
            for j in range(i - 1, -1, -1):
                if lines[j].strip() == '---':
                    insert_index = j
                    break
            break

    if insert_index > 0:
        lines.insert(insert_index, UPDATE_TEXT)
    else:
        # Adiciona no final se não encontrou padrão
        lines.append(UPDATE_TEXT)

    # Atualiza data de última atualização
    for i, line in enumerate(lines):
        if "Última atualização" in line:
            lines[i] = re.sub(r'\d{4}-\d{2}-\d{2}', '2025-11-01', line)

    return '\n'.join(lines)

def process_workflow(filename):
    """Processa um workflow"""
    filepath = os.path.join(WORKFLOW_DIR, filename)

    if not os.path.exists(filepath):
        print(f"⚠️  {filename} não encontrado")
        return False

    # Lê o arquivo
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Adiciona as seções
    content = add_prerequisite_section(content)
    content = add_update_section(content)

    # Salva o arquivo
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ {filename} atualizado")
    return True

# Processa todos os workflows
print("🔄 Atualizando workflows...")
print("")

success_count = 0
for workflow in WORKFLOWS:
    if process_workflow(workflow):
        success_count += 1

print("")
print(f"✅ {success_count}/{len(WORKFLOWS)} workflows atualizados com sucesso!")
print("")
print("📝 As seguintes seções foram adicionadas:")
print("   - Pré-requisito: Consultar PLAN.md, TASK.md e pesquisa-de-mercado")
print("   - Atualização: Instruções para atualizar docs após completar workflow")