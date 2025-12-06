#!/bin/bash

# impact-mapper.sh - Mapeia dependências e impactos de mudanças no código
# Uso: ./scripts/impact-mapper.sh "ComponentName.tsx" "descrição da mudança"

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de ajuda
show_help() {
  cat << EOF
📍 Impact Mapper - Análise em Teia Proativa

Mapeia TODAS dependências e impactos ANTES de escrever código.
Previne efeito dominó onde "mexe uma coisa e estraga outra".

USO:
  ./scripts/impact-mapper.sh [TARGET] [DESCRIPTION]

EXEMPLOS:
  # Frontend component
  ./scripts/impact-mapper.sh "AdminDashboard.tsx" "adicionar botão export"

  # Edge Function
  ./scripts/impact-mapper.sh "admin-export" "criar função de exportação"

  # Database table
  ./scripts/impact-mapper.sh "lifetracker_habits" "adicionar coluna streak_bonus"

OUTPUT:
  - Markdown formatado com 4 camadas (Frontend, Backend, DB, Cross-Cutting)
  - Salvo em .context/\${BRANCH_PREFIX}_impact-map.md
  - Também impresso no terminal

CAMADAS MAPEADAS:
  1. Frontend: Componentes que importam, hooks, estado
  2. Backend: Edge Functions, Gemini tools, dependências
  3. Database: Triggers, views, foreign keys
  4. Cross-Cutting: Permissions, rate limits, logs, webhooks
EOF
}

# Validar argumentos
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  show_help
  exit 0
fi

if [ -z "$1" ] || [ -z "$2" ]; then
  echo -e "${RED}❌ Erro: Argumentos insuficientes${NC}"
  echo ""
  show_help
  exit 1
fi

TARGET="$1"
DESCRIPTION="$2"
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
OUTPUT_FILE=".context/${BRANCH_PREFIX}_impact-map.md"
TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')

# Criar diretório .context se não existir
mkdir -p .context

echo -e "${BLUE}🔍 Mapeando impactos de: ${TARGET}${NC}"
echo -e "${BLUE}📝 Descrição: ${DESCRIPTION}${NC}"
echo ""

# Detectar tipo de target
TARGET_TYPE="unknown"
if [[ "$TARGET" == *.tsx ]] || [[ "$TARGET" == *.ts ]] || [[ "$TARGET" == *.jsx ]] || [[ "$TARGET" == *.js ]]; then
  TARGET_TYPE="frontend"
  TARGET_NAME=$(basename "$TARGET" .tsx | sed 's/\.ts$//' | sed 's/\.jsx$//' | sed 's/\.js$//')
elif [[ "$TARGET" == lifetracker_* ]]; then
  TARGET_TYPE="database"
  TARGET_NAME="$TARGET"
elif [ -d "supabase/functions/$TARGET" ]; then
  TARGET_TYPE="edge-function"
  TARGET_NAME="$TARGET"
else
  # Tentar detectar baseado em conteúdo
  if grep -q "$TARGET" src/**/*.tsx 2>/dev/null || grep -q "$TARGET" src/**/*.ts 2>/dev/null; then
    TARGET_TYPE="frontend"
    TARGET_NAME="$TARGET"
  elif grep -q "$TARGET" supabase/functions/**/*.ts 2>/dev/null; then
    TARGET_TYPE="edge-function"
    TARGET_NAME="$TARGET"
  fi
fi

echo -e "${GREEN}✅ Tipo detectado: ${TARGET_TYPE}${NC}"
echo ""

# Iniciar arquivo de output
cat > "$OUTPUT_FILE" << EOF
# Impact Map - ${TARGET}

**Data**: ${TIMESTAMP}
**Descrição**: ${DESCRIPTION}
**Tipo**: ${TARGET_TYPE}

---

EOF

# ==============================================================================
# CAMADA 1: FRONTEND
# ==============================================================================

echo -e "${YELLOW}📱 CAMADA 1: FRONTEND${NC}"

cat >> "$OUTPUT_FILE" << 'EOF'
## 📱 Frontend

EOF

if [ "$TARGET_TYPE" = "frontend" ]; then
  # Buscar imports do componente
  IMPORT_COUNT=$(grep -r "import.*${TARGET_NAME}" src/ 2>/dev/null | wc -l | xargs)

  echo -e "   ${GREEN}Imports encontrados: ${IMPORT_COUNT}${NC}"

  cat >> "$OUTPUT_FILE" << EOF
**Componentes que importam** (${IMPORT_COUNT} arquivos):
\`\`\`
EOF

  grep -r "import.*${TARGET_NAME}" src/ 2>/dev/null | sed 's/:/ →/' >> "$OUTPUT_FILE" || echo "(nenhum import encontrado)" >> "$OUTPUT_FILE"

  cat >> "$OUTPUT_FILE" << 'EOF'
```

EOF

  # Buscar hooks usados (se arquivo existe)
  if [ -f "src/${TARGET}" ] || [ -f "src/components/${TARGET}" ] || [ -f "src/hooks/${TARGET}" ]; then
    TARGET_PATH=$(find src/ -name "$TARGET" 2>/dev/null | head -1)
    if [ -n "$TARGET_PATH" ]; then
      HOOKS=$(grep -o "use[A-Z][a-zA-Z]*" "$TARGET_PATH" 2>/dev/null | sort -u)

      if [ -n "$HOOKS" ]; then
        echo -e "   ${GREEN}Hooks usados:${NC}"
        cat >> "$OUTPUT_FILE" << 'EOF'
**Hooks usados**:
```
EOF
        echo "$HOOKS" >> "$OUTPUT_FILE"
        cat >> "$OUTPUT_FILE" << 'EOF'
```

EOF
      fi
    fi
  fi

else
  cat >> "$OUTPUT_FILE" << 'EOF'
*Target não é frontend component - análise pulada*

EOF
fi

# ==============================================================================
# CAMADA 2: BACKEND
# ==============================================================================

echo -e "${YELLOW}⚡ CAMADA 2: BACKEND${NC}"

cat >> "$OUTPUT_FILE" << 'EOF'
## ⚡ Backend

EOF

# Buscar Edge Functions que referenciam o target
EDGE_REFS=$(grep -r "$TARGET_NAME" supabase/functions/ 2>/dev/null | wc -l | xargs)

echo -e "   ${GREEN}Edge Functions que referenciam: ${EDGE_REFS}${NC}"

cat >> "$OUTPUT_FILE" << EOF
**Edge Functions que referenciam** (${EDGE_REFS} ocorrências):
\`\`\`
EOF

grep -r "$TARGET_NAME" supabase/functions/ 2>/dev/null | sed 's/:/ →/' >> "$OUTPUT_FILE" || echo "(nenhuma referência encontrada)" >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" << 'EOF'
```

EOF

# Buscar Gemini tools que referenciam
TOOL_REFS=$(grep -r "$TARGET_NAME" supabase/functions/_shared/gemini-tools-*.ts 2>/dev/null | wc -l | xargs)

if [ "$TOOL_REFS" -gt 0 ]; then
  echo -e "   ${GREEN}Gemini tools que referenciam: ${TOOL_REFS}${NC}"

  cat >> "$OUTPUT_FILE" << EOF
**Gemini Tools que referenciam** (${TOOL_REFS} ocorrências):
\`\`\`
EOF

  grep -r "$TARGET_NAME" supabase/functions/_shared/gemini-tools-*.ts 2>/dev/null | sed 's/:/ →/' >> "$OUTPUT_FILE"

  cat >> "$OUTPUT_FILE" << 'EOF'
```

EOF
fi

# ==============================================================================
# CAMADA 3: DATABASE
# ==============================================================================

echo -e "${YELLOW}🗄️  CAMADA 3: DATABASE${NC}"

cat >> "$OUTPUT_FILE" << 'EOF'
## 🗄️ Database

EOF

if [ "$TARGET_TYPE" = "database" ]; then
  # Buscar triggers
  echo -e "   ${BLUE}Buscando triggers...${NC}"

  cat >> "$OUTPUT_FILE" << EOF
**Triggers que usam esta tabela**:
\`\`\`sql
EOF

  grep -r "$TARGET_NAME" supabase/migrations/*.sql 2>/dev/null | grep -i "trigger" >> "$OUTPUT_FILE" || echo "-- Nenhum trigger encontrado" >> "$OUTPUT_FILE"

  cat >> "$OUTPUT_FILE" << 'EOF'
```

EOF

  # Buscar views
  echo -e "   ${BLUE}Buscando views...${NC}"

  cat >> "$OUTPUT_FILE" << EOF
**Views que referenciam esta tabela**:
\`\`\`sql
EOF

  grep -r "$TARGET_NAME" supabase/migrations/*.sql 2>/dev/null | grep -i "view" >> "$OUTPUT_FILE" || echo "-- Nenhuma view encontrada" >> "$OUTPUT_FILE"

  cat >> "$OUTPUT_FILE" << 'EOF'
```

EOF

  # Buscar foreign keys
  echo -e "   ${BLUE}Buscando foreign keys...${NC}"

  cat >> "$OUTPUT_FILE" << EOF
**Foreign Keys que apontam para esta tabela**:
\`\`\`sql
EOF

  grep -r "$TARGET_NAME" supabase/migrations/*.sql 2>/dev/null | grep -i "references\|foreign key" >> "$OUTPUT_FILE" || echo "-- Nenhuma FK encontrada" >> "$OUTPUT_FILE"

  cat >> "$OUTPUT_FILE" << 'EOF'
```

EOF

else
  # Buscar queries SQL que usam o target
  SQL_REFS=$(grep -r "$TARGET_NAME" supabase/ 2>/dev/null | grep -iE "select|insert|update|delete" | wc -l | xargs)

  if [ "$SQL_REFS" -gt 0 ]; then
    echo -e "   ${GREEN}Queries SQL encontradas: ${SQL_REFS}${NC}"

    cat >> "$OUTPUT_FILE" << EOF
**Queries SQL que referenciam** (${SQL_REFS} ocorrências):
\`\`\`
EOF

    grep -r "$TARGET_NAME" supabase/ 2>/dev/null | grep -iE "select|insert|update|delete" | sed 's/:/ →/' >> "$OUTPUT_FILE"

    cat >> "$OUTPUT_FILE" << 'EOF'
```

EOF
  else
    cat >> "$OUTPUT_FILE" << 'EOF'
*Nenhuma query SQL encontrada*

EOF
  fi
fi

# ==============================================================================
# CAMADA 4: CROSS-CUTTING
# ==============================================================================

echo -e "${YELLOW}🔐 CAMADA 4: CROSS-CUTTING${NC}"

cat >> "$OUTPUT_FILE" << 'EOF'
## 🔐 Cross-Cutting

**Checklist de Validação**:
- [ ] Esta mudança afeta permissions/RLS policies?
- [ ] Preciso atualizar rate limits?
- [ ] Audit logs precisam registrar esta ação?
- [ ] Webhooks externos escutam esta tabela/evento?
- [ ] Notificações (email/WhatsApp) são disparadas?

EOF

# Buscar menções de permissions
PERM_REFS=$(grep -r "$TARGET_NAME" supabase/ 2>/dev/null | grep -iE "permission|rls|policy|grant" | wc -l | xargs)

if [ "$PERM_REFS" -gt 0 ]; then
  echo -e "   ${GREEN}Referências de permissions: ${PERM_REFS}${NC}"

  cat >> "$OUTPUT_FILE" << EOF
**Permissions/RLS encontradas** (${PERM_REFS} ocorrências):
\`\`\`
EOF

  grep -r "$TARGET_NAME" supabase/ 2>/dev/null | grep -iE "permission|rls|policy|grant" | sed 's/:/ →/' >> "$OUTPUT_FILE"

  cat >> "$OUTPUT_FILE" << 'EOF'
```

EOF
fi

# ==============================================================================
# RISCOS E RECOMENDAÇÕES
# ==============================================================================

cat >> "$OUTPUT_FILE" << 'EOF'
---

## ⚠️ Riscos Identificados

**Alto**:
- [ ] (preencher manualmente - ex: export de dados sensíveis)

**Médio**:
- [ ] (preencher manualmente - ex: timeout em operação pesada)

**Baixo**:
- [ ] (preencher manualmente - ex: inconsistência de formato)

---

## ✅ Próximos Passos

1. **Revisar impactos mapeados acima**
2. **Preencher seção de Riscos manualmente**
3. **Documentar mitigações para cada risco**
4. **Validar com equipe/usuário se necessário**
5. **Prosseguir com implementação APENAS após validação completa**

---

## 📋 Validação Final

- [ ] Todos impactos mapeados?
- [ ] Riscos identificados e documentados?
- [ ] Mitigações definidas?
- [ ] Impactos > 5 arquivos/tabelas? (considerar refatorar ou dividir em PRs)
- [ ] Registrado em `.context/${BRANCH_PREFIX}_decisions.md`?

---

*Gerado por: impact-mapper.sh v1.0*
*Data: ${TIMESTAMP}*
EOF

# ==============================================================================
# FINALIZAÇÃO
# ==============================================================================

echo ""
echo -e "${GREEN}✅ Impact Map gerado com sucesso!${NC}"
echo -e "${BLUE}📄 Salvo em: ${OUTPUT_FILE}${NC}"
echo ""
echo -e "${YELLOW}📊 RESUMO:${NC}"

# Contar totais
FRONTEND_TOTAL=$IMPORT_COUNT
BACKEND_TOTAL=$((EDGE_REFS + TOOL_REFS))
DATABASE_TOTAL=$SQL_REFS
CROSSCUT_TOTAL=$PERM_REFS

echo -e "   Frontend: ${FRONTEND_TOTAL} impactos"
echo -e "   Backend: ${BACKEND_TOTAL} impactos"
echo -e "   Database: ${DATABASE_TOTAL} impactos"
echo -e "   Cross-Cutting: ${CROSSCUT_TOTAL} impactos"
echo ""

TOTAL_IMPACTS=$((FRONTEND_TOTAL + BACKEND_TOTAL + DATABASE_TOTAL + CROSSCUT_TOTAL))

if [ "$TOTAL_IMPACTS" -gt 10 ]; then
  echo -e "${RED}⚠️  ALERTA: ${TOTAL_IMPACTS} impactos detectados (> 10)${NC}"
  echo -e "${YELLOW}   Considere:${NC}"
  echo -e "${YELLOW}   - Refatorar ANTES de adicionar feature${NC}"
  echo -e "${YELLOW}   - Dividir em múltiplas PRs menores${NC}"
elif [ "$TOTAL_IMPACTS" -gt 5 ]; then
  echo -e "${YELLOW}⚠️  ATENÇÃO: ${TOTAL_IMPACTS} impactos detectados (> 5)${NC}"
  echo -e "${YELLOW}   Revisar cuidadosamente antes de prosseguir${NC}"
else
  echo -e "${GREEN}✅ Impactos dentro do esperado (${TOTAL_IMPACTS})${NC}"
fi

echo ""
echo -e "${BLUE}💡 Próximos passos:${NC}"
echo -e "   1. Revisar ${OUTPUT_FILE}"
echo -e "   2. Preencher seção de Riscos manualmente"
echo -e "   3. Validar todos impactos mapeados"
echo -e "   4. Registrar em .context/\${BRANCH_PREFIX}_decisions.md"
echo ""

# Exibir conteúdo no terminal também
echo -e "${BLUE}📄 Conteúdo gerado:${NC}"
echo ""
cat "$OUTPUT_FILE"
