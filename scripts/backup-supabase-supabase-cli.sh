#!/bin/bash

# ============================================
# Backup Supabase Database (via Supabase CLI)
# ============================================
# Usa supabase db dump com --db-url
# Não depende de versão local do pg_dump
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

echo -e "${YELLOW}🔄 Iniciando backup do Supabase (via Supabase CLI)...${NC}"

# Criar diretório de backups se não existir
mkdir -p "${BACKUP_DIR}"

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Erro: Supabase CLI não está instalado${NC}"
    echo "Instale com: brew install supabase/tap/supabase"
    exit 1
fi

# Ler connection string do .env
if [ -f .env ] && grep -q "DATABASE_URL=" .env; then
    source .env
    DB_URL="${DATABASE_URL}"
    echo -e "${GREEN}✅ Connection string encontrada no .env${NC}"
else
    echo -e "${YELLOW}⚠️  DATABASE_URL não encontrada no .env${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Criando dump do banco de dados via Supabase CLI...${NC}"

# Fazer dump usando Supabase CLI (não depende de versão local do pg_dump)
supabase db dump --db-url "${DB_URL}" -f "${BACKUP_FILE}"

# Verificar se arquivo foi criado e não está vazio
if [ ! -s "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Erro: Arquivo de backup está vazio!${NC}"
    exit 1
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

# Limpar backups antigos vazios
echo -e "${YELLOW}🧹 Removendo backups vazios (falhas anteriores)...${NC}"
REMOVED_COUNT=0
for file in "${BACKUP_DIR}"/backup-*.sql; do
    if [ -f "$file" ] && [ ! -s "$file" ]; then
        rm "$file"
        REMOVED_COUNT=$((REMOVED_COUNT + 1))
    fi
done
echo -e "${GREEN}✅ Removidos ${REMOVED_COUNT} backups vazios${NC}"

# Limpar backups antigos válidos (manter últimos 10)
echo -e "${YELLOW}🧹 Limpando backups antigos (mantendo últimos 10)...${NC}"
BACKUPS_VALID=$(find "${BACKUP_DIR}" -name "backup-*.sql" -size +1k | wc -l | tr -d ' ')
if [ "$BACKUPS_VALID" -gt 10 ]; then
    find "${BACKUP_DIR}" -name "backup-*.sql" -size +1k | sort -r | tail -n +11 | xargs rm
    echo -e "${GREEN}✅ Mantidos 10 backups mais recentes${NC}"
else
    echo -e "${GREEN}✅ Mantidos ${BACKUPS_VALID} backups válidos${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Processo concluído!${NC}"
