#!/bin/bash

# ============================================
# Backup Supabase Database (Método Simples)
# ============================================
# Usa connection string diretamente via pg_dump
# Não depende de Supabase CLI ou Docker
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

echo -e "${YELLOW}🔄 Iniciando backup do Supabase (método simples)...${NC}"

# Criar diretório de backups se não existir
mkdir -p "${BACKUP_DIR}"

# Verificar se pg_dump está instalado
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ Erro: pg_dump não está instalado${NC}"
    echo "Instale com: brew install postgresql"
    exit 1
fi

# Ler connection string do .env ou solicitar
if [ -f .env ] && grep -q "DATABASE_URL=" .env; then
    source .env
    DB_URL="${DATABASE_URL}"
    echo -e "${GREEN}✅ Connection string encontrada no .env${NC}"
else
    echo -e "${YELLOW}⚠️  DATABASE_URL não encontrada no .env${NC}"
    echo ""
    echo "Por favor, adicione ao .env:"
    echo "DATABASE_URL=postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
    echo ""
    echo "Obtenha em: https://supabase.com/dashboard/project/fjddlffnlbrhgogkyplq/settings/database"
    echo ""
    exit 1
fi

echo -e "${YELLOW}📦 Criando dump do banco de dados...${NC}"

# Fazer dump usando pg_dump diretamente
pg_dump "${DB_URL}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --verbose \
    > "${BACKUP_FILE}" 2>&1

# Verificar se arquivo foi criado e não está vazio
if [ ! -s "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Erro: Arquivo de backup está vazio!${NC}"
    echo "Verifique se DATABASE_URL está correta no .env"
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
echo -e "${YELLOW}💡 Para restaurar este backup:${NC}"
echo -e "   psql \"\${DATABASE_URL}\" < ${BACKUP_FILE}"
echo ""

# Limpar backups antigos vazios (0 bytes)
echo -e "${YELLOW}🧹 Removendo backups vazios (falhas anteriores)...${NC}"
REMOVED_COUNT=0
for file in "${BACKUP_DIR}"/backup-*.sql; do
    if [ -f "$file" ] && [ ! -s "$file" ]; then
        rm "$file"
        REMOVED_COUNT=$((REMOVED_COUNT + 1))
    fi
done
if [ $REMOVED_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Removidos ${REMOVED_COUNT} backups vazios${NC}"
else
    echo -e "${GREEN}✅ Nenhum backup vazio encontrado${NC}"
fi

# Limpar backups antigos válidos (manter últimos 10)
echo -e "${YELLOW}🧹 Limpando backups antigos (mantendo últimos 10)...${NC}"
BACKUPS_VALID=$(find "${BACKUP_DIR}" -name "backup-*.sql" -size +0 | wc -l | tr -d ' ')
if [ "$BACKUPS_VALID" -gt 10 ]; then
    find "${BACKUP_DIR}" -name "backup-*.sql" -size +0 | sort -r | tail -n +11 | xargs rm
    echo -e "${GREEN}✅ Mantidos 10 backups mais recentes${NC}"
else
    echo -e "${GREEN}✅ Mantidos ${BACKUPS_VALID} backups válidos${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Processo concluído!${NC}"
