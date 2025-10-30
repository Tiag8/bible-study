#!/bin/bash

# ============================================
# Script: Inicializar Novo Projeto
# ============================================
# Cria novo projeto a partir do template base
#
# Uso: ./scripts/init-new-project.sh
# ============================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Caminho do template (este próprio projeto)
TEMPLATE_DIR="/Users/tiago/Projects/project-template"
PROJECTS_DIR="/Users/tiago/Projects"

# ============================================
# Banner
# ============================================
clear
echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════╗"
echo "║   🚀 Inicialização de Novo Projeto   ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ============================================
# Coleta de Informações
# ============================================

# 1. Nome do projeto
echo -e "${BLUE}📝 Informações do Projeto${NC}"
echo ""
echo -e "${CYAN}Nome do projeto (ex: meu-projeto):${NC}"
read -p "> " PROJECT_NAME

if [ -z "$PROJECT_NAME" ]; then
    echo -e "${RED}❌ Nome do projeto não pode ser vazio!${NC}"
    exit 1
fi

# Validar nome do projeto (apenas letras, números, hífens)
if [[ ! "$PROJECT_NAME" =~ ^[a-zA-Z0-9-]+$ ]]; then
    echo -e "${RED}❌ Nome do projeto deve conter apenas letras, números e hífens!${NC}"
    exit 1
fi

# Caminho do novo projeto
NEW_PROJECT_DIR="$PROJECTS_DIR/$PROJECT_NAME"

# Verificar se já existe
if [ -d "$NEW_PROJECT_DIR" ]; then
    echo -e "${RED}❌ Projeto '$PROJECT_NAME' já existe em $NEW_PROJECT_DIR${NC}"
    exit 1
fi

# 2. Descrição do projeto
echo ""
echo -e "${CYAN}Descrição breve do projeto:${NC}"
read -p "> " PROJECT_DESCRIPTION

if [ -z "$PROJECT_DESCRIPTION" ]; then
    PROJECT_DESCRIPTION="Projeto criado a partir do template base"
fi

# 3. Stack principal
echo ""
echo -e "${CYAN}Stack principal (ex: React + Supabase):${NC}"
read -p "> " PROJECT_STACK

if [ -z "$PROJECT_STACK" ]; then
    PROJECT_STACK="React + TypeScript"
fi

# ============================================
# Confirmação
# ============================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}Confirme as informações:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Nome:${NC} $PROJECT_NAME"
echo -e "${CYAN}Descrição:${NC} $PROJECT_DESCRIPTION"
echo -e "${CYAN}Stack:${NC} $PROJECT_STACK"
echo -e "${CYAN}Local:${NC} $NEW_PROJECT_DIR"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Criar projeto? (y/n):${NC}"
read -p "> " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Operação cancelada${NC}"
    exit 0
fi

# ============================================
# Criação do Projeto
# ============================================
echo ""
echo -e "${BLUE}🏗️  Criando projeto...${NC}"
echo ""

# 1. Copiar template
echo -e "${CYAN}1️⃣  Copiando estrutura do template...${NC}"
cp -r "$TEMPLATE_DIR" "$NEW_PROJECT_DIR"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao copiar template!${NC}"
    exit 1
fi

echo -e "${GREEN}   ✅ Estrutura copiada${NC}"

# 2. Remover .git do template (se existir)
echo -e "${CYAN}2️⃣  Limpando arquivos do template...${NC}"
if [ -d "$NEW_PROJECT_DIR/.git" ]; then
    rm -rf "$NEW_PROJECT_DIR/.git"
fi

# Remover node_modules se existir
if [ -d "$NEW_PROJECT_DIR/node_modules" ]; then
    rm -rf "$NEW_PROJECT_DIR/node_modules"
fi

echo -e "${GREEN}   ✅ Limpeza concluída${NC}"

# 3. Atualizar README.md
echo -e "${CYAN}3️⃣  Atualizando README.md...${NC}"
cat > "$NEW_PROJECT_DIR/README.md" << EOF
# $PROJECT_NAME

> $PROJECT_DESCRIPTION

---

## 📋 Stack Tecnológico

$PROJECT_STACK

---

## 🚀 Quick Start

\`\`\`bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm test
\`\`\`

---

## 📂 Estrutura do Projeto

\`\`\`
$PROJECT_NAME/
├── .claude/                 # Claude Code configs
├── .windsurf/               # Windsurf workflows
├── docs/                    # Documentação
│   ├── adr/                 # Architecture Decision Records
│   ├── features/            # Feature Maps
│   ├── architecture/        # Documentação de arquitetura
│   ├── regras-de-negocio/   # Regras de negócio
│   └── ops/                 # Operações e deploy
├── scripts/                 # Scripts de automação
└── src/                     # Código fonte
\`\`\`

---

## 📚 Documentação

- **Workflows**: Veja \`.windsurf/workflows/\`
- **ADRs**: Veja \`docs/adr/\`
- **Features**: Veja \`docs/features/\`
- **Arquitetura**: Veja \`docs/architecture/\`

---

## 🛠️ Scripts Disponíveis

\`\`\`bash
# Executar testes
./scripts/run-tests.sh

# Code review automatizado
./scripts/code-review.sh

# Security scan
./scripts/run-security-tests.sh

# Commit e push
./scripts/commit-and-push.sh

# Sincronizar melhorias para template
./scripts/sync-to-template.sh
\`\`\`

---

## 🔐 Segurança

- ✅ Secrets scanning automatizado
- ✅ Security tests obrigatórios
- ✅ Code review automatizado
- ✅ Validação pré-commit

---

## 🧪 Testes

\`\`\`bash
# Executar todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Security tests
./scripts/run-security-tests.sh
\`\`\`

---

## 📖 Workflow de Desenvolvimento

Siga o workflow estruturado em \`.windsurf/workflows/add-feature.md\` para:
1. Análise de documentação existente
2. Planejamento profundo (Ultra Think)
3. Implementação TDD
4. Code review obrigatório
5. Security tests obrigatórios
6. Meta-aprendizado e melhoria contínua

---

## 🤝 Contribuindo

Leia \`AGENTS.md\` para instruções detalhadas sobre:
- Setup
- Convenções de código
- Processo de commit
- Security guidelines
- Testes

---

## 📝 Licença

[Inserir licença]

---

**Criado em**: $(date '+%Y-%m-%d')
**Template version**: 1.0

EOF

echo -e "${GREEN}   ✅ README.md atualizado${NC}"

# 4. Atualizar .claude/CLAUDE.md
echo -e "${CYAN}4️⃣  Atualizando .claude/CLAUDE.md...${NC}"

# Atualizar seções principais do CLAUDE.md
sed -i '' "s/# Projeto Template/# $PROJECT_NAME/" "$NEW_PROJECT_DIR/.claude/CLAUDE.md"
sed -i '' "s/Template base para novos projetos/$PROJECT_DESCRIPTION/" "$NEW_PROJECT_DIR/.claude/CLAUDE.md"

echo -e "${GREEN}   ✅ CLAUDE.md atualizado${NC}"

# 5. Inicializar Git
echo -e "${CYAN}5️⃣  Inicializando repositório Git...${NC}"
cd "$NEW_PROJECT_DIR"
git init > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao inicializar Git!${NC}"
    exit 1
fi

echo -e "${GREEN}   ✅ Git inicializado${NC}"

# 6. Criar primeiro commit
echo -e "${CYAN}6️⃣  Criando commit inicial...${NC}"
git add .
git commit -m "init: projeto a partir do template base

$PROJECT_DESCRIPTION

Stack: $PROJECT_STACK

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao criar commit inicial!${NC}"
    exit 1
fi

echo -e "${GREEN}   ✅ Commit inicial criado${NC}"

# ============================================
# Resumo Final
# ============================================
echo ""
echo -e "${GREEN}${BOLD}✨ Projeto criado com sucesso!${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}📊 Resumo${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Projeto:${NC} $PROJECT_NAME"
echo -e "${CYAN}Local:${NC} $NEW_PROJECT_DIR"
echo -e "${CYAN}Git:${NC} Inicializado com commit inicial"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================
# Próximos Passos
# ============================================
echo -e "${BLUE}${BOLD}🎯 Próximos Passos${NC}"
echo ""
echo -e "${CYAN}1.${NC} Acessar o projeto:"
echo -e "   ${BOLD}cd $NEW_PROJECT_DIR${NC}"
echo ""
echo -e "${CYAN}2.${NC} Instalar dependências (se aplicável):"
echo -e "   ${BOLD}npm install${NC}"
echo ""
echo -e "${CYAN}3.${NC} Configurar variáveis de ambiente:"
echo -e "   ${BOLD}cp .env.example .env${NC}"
echo -e "   ${BOLD}# Editar .env com valores reais${NC}"
echo ""
echo -e "${CYAN}4.${NC} Customizar .claude/CLAUDE.md:"
echo -e "   - Adicionar contexto específico do projeto"
echo -e "   - Atualizar informações de banco de dados"
echo -e "   - Documentar APIs e integrações"
echo ""
echo -e "${CYAN}5.${NC} Criar repositório remoto (GitHub/GitLab):"
echo -e "   ${BOLD}git remote add origin <url>${NC}"
echo -e "   ${BOLD}git push -u origin main${NC}"
echo ""
echo -e "${CYAN}6.${NC} Começar desenvolvimento:"
echo -e "   - Seguir workflow: ${BOLD}.windsurf/workflows/add-feature.md${NC}"
echo -e "   - Ler: ${BOLD}AGENTS.md${NC} para convenções"
echo -e "   - Documentar decisões em: ${BOLD}docs/adr/${NC}"
echo ""

# ============================================
# Dicas Importantes
# ============================================
echo -e "${YELLOW}${BOLD}💡 Dicas Importantes${NC}"
echo ""
echo -e "${CYAN}•${NC} Use workflows estruturados em ${BOLD}.windsurf/workflows/${NC}"
echo -e "${CYAN}•${NC} Execute ${BOLD}./scripts/run-tests.sh${NC} antes de commits"
echo -e "${CYAN}•${NC} Security scan é obrigatório: ${BOLD}./scripts/run-security-tests.sh${NC}"
echo -e "${CYAN}•${NC} Após cada feature, execute Fase 14 (Meta-Aprendizado)"
echo -e "${CYAN}•${NC} Sincronize melhorias: ${BOLD}./scripts/sync-to-template.sh${NC}"
echo -e "${CYAN}•${NC} Documente ADRs em ${BOLD}docs/adr/${NC}"
echo -e "${CYAN}•${NC} Documente features em ${BOLD}docs/features/${NC}"
echo ""

# ============================================
# Recursos
# ============================================
echo -e "${BLUE}${BOLD}📚 Recursos Úteis${NC}"
echo ""
echo -e "${CYAN}Documentação:${NC}"
echo -e "   • ${BOLD}docs/README.md${NC} - Central de documentação"
echo -e "   • ${BOLD}docs/TEMPLATE_SYSTEM.md${NC} - Sistema de templates"
echo -e "   • ${BOLD}AGENTS.md${NC} - Guia para AI agents"
echo ""
echo -e "${CYAN}Templates:${NC}"
echo -e "   • ${BOLD}docs/adr/TEMPLATE.md${NC} - Template de ADR"
echo -e "   • ${BOLD}docs/features/TEMPLATE.md${NC} - Template de Feature Map"
echo ""
echo -e "${CYAN}Workflows:${NC}"
echo -e "   • ${BOLD}.windsurf/workflows/add-feature.md${NC} - Adicionar feature"
echo -e "   • ${BOLD}.windsurf/workflows/ultra-think.md${NC} - Análise profunda"
echo ""

echo -e "${GREEN}${BOLD}🎉 Bom desenvolvimento!${NC}"
echo ""

# Perguntar se quer abrir o projeto
echo -e "${CYAN}Abrir projeto no VS Code / Windsurf agora? (y/n):${NC}"
read -p "> " OPEN_EDITOR

if [[ "$OPEN_EDITOR" =~ ^[Yy]$ ]]; then
    # Tentar abrir no Windsurf primeiro, depois VS Code
    if command -v windsurf &> /dev/null; then
        echo -e "${BLUE}🚀 Abrindo no Windsurf...${NC}"
        windsurf "$NEW_PROJECT_DIR"
    elif command -v code &> /dev/null; then
        echo -e "${BLUE}🚀 Abrindo no VS Code...${NC}"
        code "$NEW_PROJECT_DIR"
    else
        echo -e "${YELLOW}⚠️  Editor não encontrado. Abra manualmente:${NC}"
        echo -e "   ${BOLD}cd $NEW_PROJECT_DIR${NC}"
    fi
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Script concluído com sucesso!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit 0
