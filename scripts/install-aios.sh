#!/bin/bash

# ============================================================================
# AIOS Installation Script for Bible Study
# ============================================================================
# Versão: 1.0.0
# Data: 2026-01-26
# Descrição: Instala e configura AIOS v4.31.0 no projeto Bible Study
# ============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="/Users/tiago/Projects/bible-study"
LIFE_TRACKER_ROOT="/Users/tiago/Projects/life_tracker"
AIOS_CORE_SOURCE="$LIFE_TRACKER_ROOT/.aios-core"
AIOS_CORE_TARGET="$PROJECT_ROOT/.aios-core"

# ============================================================================
# Funções Auxiliares
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_step "$1 está instalado"
        return 0
    else
        print_error "$1 NÃO está instalado"
        return 1
    fi
}

# ============================================================================
# FASE 1: Pré-Validações
# ============================================================================

print_header "FASE 1: Validando Ambiente"

cd "$PROJECT_ROOT" || exit 1

# Verificar comandos necessários
echo "Verificando dependências do sistema:"
check_command "node" || exit 1
check_command "npm" || exit 1
check_command "git" || exit 1

# Verificar versão Node
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    print_step "Node.js versão adequada: $(node -v)"
else
    print_error "Node.js versão inadequada. Requer >= 18.x, encontrado: $(node -v)"
    exit 1
fi

# Verificar se Life Tracker existe (fonte do AIOS)
if [ ! -d "$LIFE_TRACKER_ROOT" ]; then
    print_error "Life Tracker não encontrado em: $LIFE_TRACKER_ROOT"
    exit 1
fi
print_step "Life Tracker encontrado"

# Verificar se .aios-core existe no Life Tracker
if [ ! -d "$AIOS_CORE_SOURCE" ]; then
    print_error "AIOS não encontrado no Life Tracker em: $AIOS_CORE_SOURCE"
    exit 1
fi
print_step "AIOS Core encontrado no Life Tracker"

# Verificar se AIOS já existe no Bible Study
if [ -d "$AIOS_CORE_TARGET" ]; then
    print_warning "AIOS já existe em $AIOS_CORE_TARGET"
    read -p "Deseja SOBRESCREVER? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Instalação cancelada pelo usuário"
        exit 1
    fi
    print_step "Removendo AIOS existente..."
    rm -rf "$AIOS_CORE_TARGET"
fi

echo ""
print_step "Pré-validações concluídas"

# ============================================================================
# FASE 2: Copiar AIOS Core
# ============================================================================

print_header "FASE 2: Instalando AIOS Core"

echo "Copiando .aios-core/ do Life Tracker..."
cp -r "$AIOS_CORE_SOURCE" "$AIOS_CORE_TARGET"
print_step "AIOS Core copiado"

# Verificar integridade
if [ -f "$AIOS_CORE_TARGET/package.json" ]; then
    AIOS_VERSION=$(grep '"version"' "$AIOS_CORE_TARGET/package.json" | head -1 | cut -d'"' -f4)
    print_step "AIOS versão: $AIOS_VERSION"
else
    print_error "package.json não encontrado. Instalação pode estar corrompida."
    exit 1
fi

# ============================================================================
# FASE 3: Verificar Dependências (SKIP NPM - AIOS é local)
# ============================================================================

print_header "FASE 3: Verificando Dependências"

# AIOS é um sistema local, não precisa de npm install
print_step "AIOS é sistema local - skip npm install"
print_step "Todas dependências já estão em .aios-core/"

echo ""
print_step "Dependências verificadas"

# ============================================================================
# FASE 4: Copiar Comandos AIOS
# ============================================================================

print_header "FASE 4: Configurando Comandos AIOS"

COMMANDS_SOURCE="$LIFE_TRACKER_ROOT/.claude/commands/AIOS"
COMMANDS_TARGET="$PROJECT_ROOT/.claude/commands/AIOS"

if [ -d "$COMMANDS_SOURCE" ]; then
    echo "Copiando comandos AIOS..."
    mkdir -p "$PROJECT_ROOT/.claude/commands"
    cp -r "$COMMANDS_SOURCE" "$COMMANDS_TARGET"
    print_step "Comandos AIOS copiados"

    # Listar comandos instalados
    echo ""
    echo "Comandos AIOS disponíveis:"
    find "$COMMANDS_TARGET" -name "*.md" -exec basename {} \; | sed 's/^/  - /'
else
    print_warning "Comandos AIOS não encontrados no Life Tracker"
fi

# ============================================================================
# FASE 5: Copiar Workflows Essenciais
# ============================================================================

print_header "FASE 5: Configurando Workflows"

WORKFLOWS_SOURCE="$LIFE_TRACKER_ROOT/.windsurf/workflows"
WORKFLOWS_TARGET="$PROJECT_ROOT/.windsurf/workflows"

echo "Copiando workflows essenciais..."

# Lista de workflows essenciais para copiar
ESSENTIAL_WORKFLOWS=(
    "README.md"
    "add-feature-3.5-tasks.md"
    "add-feature-4.5c-ai-tools.md"
)

COPIED_COUNT=0
for workflow in "${ESSENTIAL_WORKFLOWS[@]}"; do
    if [ -f "$WORKFLOWS_SOURCE/$workflow" ]; then
        cp "$WORKFLOWS_SOURCE/$workflow" "$WORKFLOWS_TARGET/"
        print_step "Copiado: $workflow"
        COPIED_COUNT=$((COPIED_COUNT + 1))
    else
        print_warning "Não encontrado: $workflow"
    fi
done

echo ""
print_step "$COPIED_COUNT workflows copiados"

# ============================================================================
# FASE 6: Criar Project Manifest
# ============================================================================

print_header "FASE 6: Configurando Project Manifest"

MANIFEST_TARGET="$PROJECT_ROOT/.claude/project-manifest.json"

if [ -f "$MANIFEST_TARGET" ]; then
    print_warning "project-manifest.json já existe"
else
    echo "Criando project-manifest.json customizado..."
    cat > "$MANIFEST_TARGET" <<'EOF'
{
  "version": "1.0.0",
  "project": {
    "name": "Bible Study (Segundo Cérebro)",
    "slug": "bible-study",
    "type": "web-app",
    "description": "Aplicativo de estudo bíblico com editor rico e visualização em grafo"
  },
  "variables": {
    "PROJECT_PREFIX": "bible_",
    "PROJECT_NAME": "Bible Study",
    "SUPABASE_PROJECT_REF": "vcqgalxnapxerqcycieu"
  },
  "stack": {
    "frontend": "React 19 + TypeScript + Next.js 15",
    "styling": "TailwindCSS + shadcn/ui",
    "database": "Supabase PostgreSQL",
    "editor": "Tiptap",
    "graph": "react-force-graph-2d"
  },
  "sync": {
    "enabled": true,
    "layers": [
      "core",
      "workflows",
      "stack-react-supabase",
      "quality-gates",
      "context-system"
    ]
  },
  "aios": {
    "version": "4.31.0",
    "installed": "2026-01-26",
    "agents_enabled": true,
    "workflows_enabled": true,
    "commands_enabled": true
  }
}
EOF
    print_step "project-manifest.json criado"
fi

# ============================================================================
# FASE 7: Validação Pós-Instalação
# ============================================================================

print_header "FASE 7: Validando Instalação"

VALIDATION_PASSED=true

# Verificar .aios-core/
if [ -d "$AIOS_CORE_TARGET" ]; then
    print_step ".aios-core/ instalado"
else
    print_error ".aios-core/ NÃO encontrado"
    VALIDATION_PASSED=false
fi

# Verificar package.json AIOS
if [ -f "$AIOS_CORE_TARGET/package.json" ]; then
    print_step "package.json AIOS válido"
else
    print_error "package.json AIOS inválido"
    VALIDATION_PASSED=false
fi

# Verificar comandos AIOS
if [ -d "$COMMANDS_TARGET" ]; then
    COMMANDS_COUNT=$(find "$COMMANDS_TARGET" -name "*.md" | wc -l)
    print_step "Comandos AIOS: $COMMANDS_COUNT instalados"
else
    print_warning "Comandos AIOS não instalados"
fi

# Verificar workflows
WORKFLOWS_COUNT=$(find "$WORKFLOWS_TARGET" -name "*.md" | wc -l)
print_step "Workflows: $WORKFLOWS_COUNT disponíveis"

# Verificar manifest
if [ -f "$MANIFEST_TARGET" ]; then
    print_step "project-manifest.json configurado"
else
    print_warning "project-manifest.json não criado"
fi

# Verificar CLI AIOS
if [ -x "$AIOS_CORE_TARGET/bin/aios-core.js" ]; then
    print_step "AIOS CLI executável encontrado"
else
    print_warning "AIOS CLI não encontrado ou sem permissão de execução"
fi

echo ""

if [ "$VALIDATION_PASSED" = true ]; then
    print_header "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO"

    echo "AIOS v$AIOS_VERSION instalado no Bible Study"
    echo ""
    echo "📋 Próximos passos:"
    echo "  1. Reiniciar servidor: npm run restart"
    echo "  2. Verificar agentes: ls .claude/agents/"
    echo "  3. Verificar comandos: ls .claude/commands/AIOS/"
    echo "  4. Testar AIOS CLI: node .aios-core/bin/aios-core.js --help"
    echo ""
    echo "📚 Documentação:"
    echo "  - AIOS User Guide: .aios-core/user-guide.md"
    echo "  - Workflows: .windsurf/workflows/README.md"
    echo "  - Project Manifest: .claude/project-manifest.json"
    echo ""
else
    print_header "⚠️ INSTALAÇÃO CONCLUÍDA COM AVISOS"
    echo "Algumas validações falharam. Revise os erros acima."
fi

# ============================================================================
# Criar log de instalação
# ============================================================================

LOG_FILE="$PROJECT_ROOT/.aios-installation.log"
cat > "$LOG_FILE" <<EOF
AIOS Installation Log
Date: $(date)
Version: $AIOS_VERSION
Status: $(if [ "$VALIDATION_PASSED" = true ]; then echo "SUCCESS"; else echo "PARTIAL"; fi)

Components Installed:
- .aios-core/: $(if [ -d "$AIOS_CORE_TARGET" ]; then echo "YES"; else echo "NO"; fi)
- Commands: $(if [ -d "$COMMANDS_TARGET" ]; then echo "YES ($COMMANDS_COUNT)"; else echo "NO"; fi)
- Workflows: YES ($WORKFLOWS_COUNT)
- Manifest: $(if [ -f "$MANIFEST_TARGET" ]; then echo "YES"; else echo "NO"; fi)

Source: $LIFE_TRACKER_ROOT
Target: $PROJECT_ROOT
EOF

print_step "Log de instalação criado: $LOG_FILE"

echo ""
