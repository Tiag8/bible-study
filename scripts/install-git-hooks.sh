#!/bin/bash

# Script: Instalar Git Hooks automaticamente
# Propósito: Validar branch isolation e prevenir commits acidentais em main
# Uso: ./scripts/install-git-hooks.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "=================================================="
echo "🔧 Instalador de Git Hooks - Life Tracker"
echo "=================================================="
echo ""

# Verificar se está dentro de repositório git
if [ ! -d "$PROJECT_ROOT/.git" ]; then
  echo "❌ ERRO: Não está dentro de um repositório git!"
  echo "   Certifique-se de estar na raiz do projeto."
  exit 1
fi

# Criar diretório de hooks se não existir
mkdir -p "$HOOKS_DIR"

# Instalar pre-commit hook
echo "📝 Instalando hook: pre-commit (validação de branch)..."

cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

# Git Hook: Pre-Commit Branch Validation
# Propósito: Validar branch antes de cada commit
# Previne: Commits acidentais em main ou em branches sem padrão

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# REGRA 1: Bloquear commits diretos em main
if [[ "$CURRENT_BRANCH" == "main" ]]; then
  echo "❌ ERRO CRÍTICO: Não é permitido commitar diretamente em main!"
  echo ""
  echo "Solução:"
  echo "  1. Desfazer staging: git reset HEAD ."
  echo "  2. Criar feature branch: git checkout -b feat/sua-feature"
  echo "  3. Adicionar arquivos: git add ."
  echo "  4. Commitar: git commit -m 'feat: descrição'"
  echo ""
  exit 1
fi

# REGRA 2: Bloquear estado detached HEAD
if [[ "$CURRENT_BRANCH" == "HEAD" ]]; then
  echo "❌ ERRO: Estado detached HEAD detectado!"
  echo ""
  echo "Solução:"
  echo "  1. Salvar mudanças: git stash"
  echo "  2. Criar feature branch: git checkout -b feat/sua-feature"
  echo "  3. Recuperar mudanças: git stash pop"
  echo "  4. Commitar: git commit -m 'feat: descrição'"
  echo ""
  exit 1
fi

# REGRA 3: Validar formato de branch (soft warning)
if ! [[ "$CURRENT_BRANCH" =~ ^(feat|fix|refactor|docs|test|chore|hotfix)/ ]]; then
  echo "⚠️  WARNING: Branch não segue padrão recomendado"
  echo "   Branch atual: $CURRENT_BRANCH"
  echo ""
  echo "Padrões recomendados:"
  echo "  - feat/add-nova-feature"
  echo "  - fix/corrigir-bug"
  echo "  - refactor/melhorar-codigo"
  echo "  - docs/atualizar-documentacao"
  echo "  - test/adicionar-testes"
  echo ""
  read -p "Continuar mesmo assim? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "✅ Validação OK - Branch: $CURRENT_BRANCH"
exit 0
EOF

chmod +x "$HOOKS_DIR/pre-commit"
echo "✅ Hook 'pre-commit' instalado com sucesso!"
echo ""

# Resumo
echo "=================================================="
echo "✅ INSTALAÇÃO COMPLETA"
echo "=================================================="
echo ""
echo "Hooks instalados:"
echo "  ✓ pre-commit - Validação de branch (main/detached HEAD)"
echo ""
echo "Próximos passos:"
echo "  1. Testar o hook: git checkout -b feat/test && echo 'test' > test.txt && git add test.txt && git commit -m 'test'"
echo "  2. Se bloqueado em main: git commit --no-verify (APENAS emergências)"
echo "  3. Remover hook: rm .git/hooks/pre-commit"
echo ""
echo "Documentação completa:"
echo "  → .windsurf/workflows/add-feature-5-implementation.md (seção Git Hook)"
echo ""
