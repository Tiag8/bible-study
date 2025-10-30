#!/bin/bash

# ============================================
# Restaurar Backup do Supabase
# ============================================
# Restaura um backup SQL no banco de dados
# ⚠️  CUIDADO: Isso vai sobrescrever dados!
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se foi passado o arquivo de backup
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Arquivo de backup não fornecido${NC}"
    echo "Uso: $0 <arquivo-backup.sql>"
    echo ""
    echo "Backups disponíveis:"
    ls -lh backups/*.sql 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se arquivo existe
if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Erro: Arquivo '${BACKUP_FILE}' não encontrado${NC}"
    exit 1
fi

echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}⚠️  ATENÇÃO: OPERAÇÃO DESTRUTIVA!${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Você está prestes a restaurar o backup:${NC}"
echo -e "  📁 ${BACKUP_FILE}"
echo -e "  📊 $(du -h "${BACKUP_FILE}" | cut -f1)"
echo ""
echo -e "${RED}Isso vai SOBRESCREVER todos os dados atuais!${NC}"
echo ""
read -p "Tem certeza? Digite 'CONFIRMAR' para continuar: " confirmation

if [ "$confirmation" != "CONFIRMAR" ]; then
    echo -e "${YELLOW}❌ Operação cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🔄 Iniciando restauração...${NC}"

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Erro: Supabase CLI não está instalado${NC}"
    echo "Instale com: brew install supabase/tap/supabase"
    exit 1
fi

# Método 1: Via Supabase CLI
echo -e "${YELLOW}📥 Restaurando via Supabase CLI...${NC}"

if supabase db push --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < "${BACKUP_FILE}" 2>/dev/null; then
    echo -e "${GREEN}✅ Restauração concluída via CLI${NC}"
else
    # Método 2: Via psql direto
    echo -e "${YELLOW}⚠️  Tentando método alternativo...${NC}"
    
    if [ -f .env ]; then
        source .env
        
        DB_HOST=$(echo $VITE_SUPABASE_URL | sed 's|https://||' | sed 's|http://||' | cut -d'/' -f1)
        
        PGPASSWORD="${SUPABASE_DB_PASSWORD}" psql \
            -h "${DB_HOST}" \
            -U postgres \
            -d postgres \
            -f "${BACKUP_FILE}"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Restauração concluída (método alternativo)${NC}"
        else
            echo -e "${RED}❌ Erro ao restaurar backup${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Erro: Arquivo .env não encontrado${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Backup restaurado com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📁 Backup: ${BACKUP_FILE}"
echo -e "🕐 Restaurado em: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo -e "   1. Validar dados no Supabase Dashboard"
echo -e "   2. Testar aplicação: npm run dev"
echo -e "   3. Verificar se tudo está funcionando"
echo ""
