#!/bin/bash
# scripts/lib/colors.sh
# Definições centralizadas de cores ANSI para scripts
# Uso: source "$(dirname "$0")/lib/colors.sh"
# Exportadas como variáveis globais para uso em todo projeto

# Cores básicas
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export PURPLE='\033[0;35m'
export CYAN='\033[0;36m'

# Reset (No Color)
export NC='\033[0m'

# Padrão DRY: Todas cores definidas 1x, reusadas em múltiplos scripts
# Benefício: Alterações globais sem duplicação (15 linhas → 3 referencias)
