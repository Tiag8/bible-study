#!/bin/bash

# ============================================
# Backup Supabase Database (Dump Lógico)
# ============================================
# Cria um backup completo do banco de dados
# usando Supabase CLI (pg_dump)
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup-${TIMESTAMP}.sql"

echo -e "${YELLOW}🔄 Iniciando backup do Supabase...${NC}"

# Criar diretório de backups se não existir
mkdir -p "${BACKUP_DIR}"

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Erro: Supabase CLI não está instalado${NC}"
    echo "Instale com: brew install supabase/tap/supabase"
    exit 1
fi

# Verificar se está logado no Supabase
if ! supabase projects list &> /dev/null; then
    echo -e "${RED}❌ Erro: Não está autenticado no Supabase${NC}"
    echo "Faça login com: supabase login"
    exit 1
fi

# Fazer dump do banco de dados
echo -e "${YELLOW}📦 Criando dump do banco de dados...${NC}"

# Opção 1: Dump via CLI (requer link do projeto)
if supabase db dump -f "${BACKUP_FILE}" 2>/dev/null; then
    echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"
else
    # Opção 2: Dump via pg_dump direto (se CLI falhar)
    echo -e "${YELLOW}⚠️  Tentando método alternativo...${NC}"
    
    # Ler credenciais do .env
    if [ -f .env ]; then
        source .env
        
        # Extrair host e porta da URL
        DB_HOST=$(echo $VITE_SUPABASE_URL | sed 's|https://||' | sed 's|http://||' | cut -d'/' -f1)
        
        # Fazer dump usando pg_dump
        PGPASSWORD="${SUPABASE_DB_PASSWORD}" pg_dump \
            -h "${DB_HOST}" \
            -U postgres \
            -d postgres \
            --clean \
            --if-exists \
            --no-owner \
            --no-privileges \
            > "${BACKUP_FILE}"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Backup criado com sucesso (método alternativo)!${NC}"
        else
            echo -e "${RED}❌ Erro ao criar backup${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Erro: Arquivo .env não encontrado${NC}"
        exit 1
    fi
fi

# Verificar tamanho do backup
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Backup concluído com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📁 Arquivo: ${BACKUP_FILE}"
echo -e "📊 Tamanho: ${BACKUP_SIZE}"
echo -e "🕐 Data/Hora: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo ""
echo -e "${YELLOW}💡 Para restaurar este backup:${NC}"
echo -e "   ./scripts/restore-supabase.sh ${BACKUP_FILE}"
echo ""

# Limpar backups antigos (manter últimos 10)
echo -e "${YELLOW}🧹 Limpando backups antigos...${NC}"
ls -t "${BACKUP_DIR}"/backup-*.sql | tail -n +11 | xargs -r rm
REMAINING=$(ls -1 "${BACKUP_DIR}"/backup-*.sql 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Mantidos ${REMAINING} backups mais recentes${NC}"

echo ""
echo -e "${GREEN}🎉 Processo concluído!${NC}"
