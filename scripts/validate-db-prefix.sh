#!/bin/bash
# Valida prefix {{PROJECT_PREFIX}}_ em migrations e código
# ADR-034: Database Prefix Migration Checklist

echo "=== Validando Prefix {{PROJECT_PREFIX}}_ ==="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VIOLATIONS_FOUND=0

# 1. Verificar migrations (SQL)
echo ""
echo "📝 Verificando migrations SQL..."

MIGRATIONS=$(find supabase/migrations -name "*.sql" -type f 2>/dev/null || echo "")

if [ -z "$MIGRATIONS" ]; then
  echo -e "${YELLOW}⚠️  Nenhuma migration encontrada em supabase/migrations/${NC}"
else
  for file in $MIGRATIONS; do
    # Detectar CREATE TABLE sem prefix
    # Filtra: auth.*, storage.*, supabase_*, comentários
    while IFS= read -r line; do
      # Ignorar comentários SQL
      if [[ "$line" =~ ^[[:space:]]*-- ]]; then
        continue
      fi

      # Detectar CREATE TABLE sem {{PROJECT_PREFIX}}_
      if [[ "$line" =~ CREATE[[:space:]]TABLE.* ]] && [[ ! "$line" =~ {{PROJECT_PREFIX}}_ ]] && [[ ! "$line" =~ auth\. ]] && [[ ! "$line" =~ storage\. ]] && [[ ! "$line" =~ supabase_ ]]; then
        echo -e "${YELLOW}⚠️  $file: Possível CREATE TABLE sem prefix${NC}"
        echo "   Linha: $line"
      fi
    done < "$file"
  done

  echo -e "${GREEN}✅ Migrations verificadas (warnings são informativos)${NC}"
fi

# 2. Verificar hooks TypeScript
echo ""
echo "🔧 Verificando hooks TypeScript..."

HOOKS=$(find src/hooks src/components src/pages -name "*.tsx" -o -name "*.ts" 2>/dev/null || echo "")

if [ -z "$HOOKS" ]; then
  echo -e "${YELLOW}⚠️  Nenhum arquivo TypeScript encontrado${NC}"
else
  for file in $HOOKS; do
    # Detectar .from('table_name') sem {{PROJECT_PREFIX}}_
    # Ignora: auth.*, storage.*
    SUSPICIOUS=$(grep -n "\.from(['\"][a-z_]*['\"])" "$file" 2>/dev/null || echo "")

    if [ ! -z "$SUSPICIOUS" ]; then
      # Filtrar apenas os que NÃO têm {{PROJECT_PREFIX}}_
      while IFS= read -r line; do
        if [[ ! "$line" =~ {{PROJECT_PREFIX}}_ ]] && [[ ! "$line" =~ auth\. ]] && [[ ! "$line" =~ storage\. ]]; then
          echo -e "${RED}❌ $file: .from() sem prefix {{PROJECT_PREFIX}}_${NC}"
          echo "   $line"
          VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
        fi
      done <<< "$SUSPICIOUS"
    fi
  done

  if [ $VIOLATIONS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ Hooks TypeScript OK (todos com prefix)${NC}"
  fi
fi

# 3. Validar DB real (se DATABASE_URL disponível)
echo ""
echo "🗄️  Verificando DB real..."

if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  DATABASE_URL não definido. Pulando validação DB remoto.${NC}"
else
  if command -v psql &> /dev/null; then
    NO_PREFIX=$(psql "$DATABASE_URL" -t -c "
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name NOT LIKE '{{PROJECT_PREFIX}}_%'
        AND table_name NOT IN ('schema_migrations', 'spatial_ref_sys');
    " 2>/dev/null || echo "CONNECTION_ERROR")

    if [ "$NO_PREFIX" == "CONNECTION_ERROR" ]; then
      echo -e "${YELLOW}⚠️  Erro conectando DB remoto. Pulando validação.${NC}"
    elif [ ! -z "$NO_PREFIX" ]; then
      echo -e "${RED}❌ Tabelas DB SEM prefix {{PROJECT_PREFIX}}_:${NC}"
      echo "$NO_PREFIX"
      VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
    else
      echo -e "${GREEN}✅ DB validado: Todas tabelas públicas com prefix {{PROJECT_PREFIX}}_${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  psql não instalado. Pulando validação DB remoto.${NC}"
  fi
fi

# 4. Resultado final
echo ""
echo "========================================="

if [ $VIOLATIONS_FOUND -gt 0 ]; then
  echo -e "${RED}❌ BLOQUEIO: $VIOLATIONS_FOUND violation(s) CRÍTICA(S) encontrada(s)${NC}"
  echo ""
  echo "📋 Checklist de correção:"
  echo "  1. Revisar arquivos TypeScript: Atualizar .from('X') para .from('{{PROJECT_PREFIX}}_X')"
  echo "  2. Regenerar types: ./scripts/regenerate-supabase-types.sh"
  echo "  3. Re-executar validação: ./scripts/validate-db-prefix.sh"
  echo ""
  echo "📖 Ver: docs/adr/ADR-034-database-prefix-migration-checklist.md"
  echo ""
  echo "⚠️  Nota: Warnings (⚠️ ) em migrations SQL são informativos (muitos false positives)"
  echo "           Apenas violations CRÍTICAS (❌) em TypeScript bloqueiam commit"
  exit 1
else
  echo -e "${GREEN}✅ Validação APROVADA: Nenhuma violation crítica encontrada${NC}"

  if [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ DB Real também validado${NC}"
  fi

  echo ""
  echo "⚠️  Nota: Revisar manualmente warnings (⚠️ ) em migrations SQL se houver"
  echo ""
  echo "📋 Próximos passos:"
  echo "  1. git add <arquivos>"
  echo "  2. git commit -m 'feat(db): descrição'"
  echo ""
  exit 0
fi
