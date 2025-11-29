#!/bin/bash

# =====================================================
# dev-clean.sh
#
# Executa npm run dev com ambiente limpo
# Ignora variáveis VITE_* do sistema
# Baseado em ADR-025
# =====================================================

echo "🚀 Iniciando desenvolvimento com ambiente limpo..."
echo ""

# Preservar apenas PATH e HOME
# Isso garante que NENHUMA variável VITE_* do sistema interfira
env -i PATH=$PATH HOME=$HOME npm run dev