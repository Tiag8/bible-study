#!/bin/bash

# =====================================================
# fix-env-conflicts.sh
#
# Solução para GATE 0 - Environment Conflicts
# Baseado em ADR-025 e validate-env-conflicts.sh
# =====================================================

echo "🔧 Resolvendo conflitos de ambiente VITE_*..."
echo ""

# 1. Listar variáveis conflitantes
echo "📋 Variáveis VITE_* detectadas no sistema:"
env | grep "^VITE_" || echo "  Nenhuma encontrada"
echo ""

# 2. Limpar variáveis conflitantes
echo "🧹 Limpando variáveis conflitantes..."
unset VITE_SUPABASE_URL
unset VITE_SUPABASE_ANON_KEY
unset VITE_SUPABASE_PUBLISHABLE_KEY
unset VITE_SUPABASE_PROJECT_ID
unset VITE_GEMINI_API_KEY
echo "  ✅ Variáveis removidas da sessão atual"
echo ""

# 3. Validar se limpeza funcionou
echo "🔍 Validando limpeza..."
REMAINING=$(env | grep "^VITE_" | wc -l)
if [ "$REMAINING" -eq 0 ]; then
    echo "  ✅ Todas variáveis VITE_* foram removidas"
    echo ""

    # 4. Re-executar validação original
    echo "📊 Executando validação completa..."
    ./scripts/validate-env-conflicts.sh
    VALIDATION_RESULT=$?

    if [ "$VALIDATION_RESULT" -eq 0 ]; then
        echo ""
        echo "✅ GATE 0: Environment Validation - APROVADO"
        echo ""
        echo "🎯 Próximos passos:"
        echo "  1. Para tornar permanente, adicione ao seu ~/.zshrc ou ~/.bashrc:"
        echo ""
        echo "     # Remover variáveis VITE_* conflitantes"
        echo "     unset VITE_SUPABASE_URL"
        echo "     unset VITE_SUPABASE_ANON_KEY"
        echo "     unset VITE_SUPABASE_PUBLISHABLE_KEY"
        echo "     unset VITE_SUPABASE_PROJECT_ID"
        echo "     unset VITE_GEMINI_API_KEY"
        echo ""
        echo "  2. Ou execute npm run dev com ambiente limpo:"
        echo "     env -i PATH=\$PATH HOME=\$HOME npm run dev"
        echo ""
        exit 0
    else
        echo "⚠️ Ainda há conflitos. Verifique manualmente."
        exit 1
    fi
else
    echo "  ❌ Ainda existem $REMAINING variáveis VITE_*"
    echo "  Execute manualmente:"
    echo "    env | grep '^VITE_'"
    echo "  E depois:"
    echo "    unset <VARIABLE_NAME>"
    exit 1
fi