---
description: Workflow 4.5 - Pre-Implementation Quality Gates (9 Gates)
auto_execution_mode: 1
---

## Pré-requisito

Ler: `docs/PLAN.md`, `docs/TASK.md`, `.claude/CLAUDE.md`

**CRÍTICO**: Executar ANTES do Workflow 5a.

---

## FASE 0: LOAD CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
./scripts/context-load-all.sh $BRANCH_PREFIX
```

---

## 9 GATES OBRIGATÓRIOS

### GATE 0: Environment Validation ⭐ SEMPRE PRIMEIRO

```bash
./scripts/validate-env-conflicts.sh
./scripts/validate-schema-first.sh
```

- [ ] Scripts passaram (exit 0)?
- [ ] SE exit 1: Corrigir ANTES prosseguir

---

### GATE 1: Tool Validation (SE Gemini AI)

- [ ] Tool schema válido (FunctionDeclaration)?
- [ ] DB alignment (tabela/campos existem)?
- [ ] UUID explícito no retorno? (REGRA #15)
- [ ] Fuzzy match implementado? (REGRA #17)
- [ ] Token limit < 9000? (REGRA #18)

---

### GATE 2: Runtime Compatibility (SE Edge Function)

- [ ] Imports Deno-compatible (jsr:, npm:)?
- [ ] Async pattern correto (Deno.serve)?
- [ ] TypeScript OK (`deno check`)?
- [ ] Secrets via Deno.env?

---

### GATE 3: FK Reference + Prefix (SE Migration)

```bash
# Validar prefix consistency
grep -r "\.from\(['\"](?!lifetracker_)" src/hooks/
grep -r "CREATE TABLE" supabase/migrations/*.sql | grep -v "lifetracker_"
```

- [ ] FK aponta para PK/UNIQUE?
- [ ] Prefixo `lifetracker_` em todas tabelas?
- [ ] RLS policies existem?

---

### GATE 4: File Size

```bash
find src/ supabase/functions/ -name "*.ts" -exec wc -l {} \; | sort -rn | head -5
```

- [ ] Arquivos < 500 linhas?
- [ ] SE > 500: Considerar divisão

---

### GATE 5: Anti-Over-Engineering

```bash
./scripts/validate-yagni.sh "[Feature]" "[Solução]"
```

- [ ] Framework nativo resolve?
- [ ] Biblioteca instalada cobre?
- [ ] Gap real (não hipotético)?
- [ ] 3+ casos de uso (Rule of Three)?

**Red Flags**: Parser custom, cache custom, auth custom

---

### GATE 6: Schema-First ⭐ OBRIGATÓRIO

**PROPOSTA #5 (Workflow 14)**: Auto-fetch schema via MCP

```bash
./scripts/validate-db-sync.sh
./scripts/regenerate-supabase-types.sh
```

**Checklist Manual** (padrão atual):
- [ ] DB real é source of truth?
- [ ] Types atualizados?
- [ ] RLS habilitado?

**Checklist Automático** (NOVO - Workflow 14 Proposta #5):

1. **Detectar tabelas** em `.context/{branch}_temp-memory.md`:
   ```bash
   grep -oE "lifetracker_[a-z_]+" .context/{branch}_temp-memory.md | sort -u
   ```

2. **Auto-fetch schema via MCP** (CADA tabela):
   ```sql
   -- Via MCP execute_sql (automático)
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'lifetracker_habits'
   ORDER BY ordinal_position;
   ```

3. **Salvar snapshot** (gitignored):
   ```bash
   # .context/{branch}_schema-snapshot.json (gerado automaticamente)
   {
     "lifetracker_habits": [
       {"name": "id", "type": "uuid", "nullable": "NO"},
       {"name": "user_id", "type": "uuid", "nullable": "NO"},
       {"name": "name", "type": "text", "nullable": "NO"},
       ...
     ],
     "lifetracker_profiles": [...]
   }
   ```

4. **Workflow 5a**: Validar SQL contra snapshot (NÃO schema live)

**ROI**: Consulta manual 3-5min → automática 30s (ROI 6-10x)

**Implementação**: Script `./scripts/auto-fetch-schema-snapshot.sh` (pendente)

---

### GATE 6.7: Soft Delete Consistency

**SE entity tem soft delete** (`deleted_at` + `is_active`):

- [ ] Backend update AMBOS campos atomicamente?
- [ ] Frontend query filtra AMBOS flags?
- [ ] Index otimizado com `WHERE deleted_at IS NULL`?
- [ ] Tool description menciona ambos campos?

**Validação**:
```bash
# Detectar inconsistências (deleted_at != null AND is_active = true)
./scripts/validate-soft-delete-consistency.sh
```

**Por quê**: Soft delete com apenas 1 campo = data inconsistency bugs (ADR-043).

**Snippet VS Code**: `sqsd` (Supabase Query Soft Delete)

---

### GATE 6.8: Output Format Specification

**SE feature gera output para canal específico** (WhatsApp, Email, Telegram, Discord):

- [ ] Identificado canal de output?
- [ ] Canal tem formatação específica (não Markdown padrão)?
- [ ] System prompt inclui seção "FORMATAÇÃO [CANAL]"?
- [ ] Examples mostram formatação correta aplicada?
- [ ] Proibições explícitas listadas (ex: ❌ **texto** Markdown)?

**Template**:
```typescript
## FORMATAÇÃO [CANAL] (CRÍTICO)
**Formato [Canal] é DIFERENTE de Markdown:**
- Negrito: [sintaxe específica]
- Itálico: [sintaxe específica]

**PROIBIDO**:
- ❌ **texto** (Markdown)
- ❌ __texto__ (Markdown)

**Exemplo CORRETO**:
[exemplo visual com formatação aplicada]
```

**Por quê**: LLMs defaultam para Markdown quando contexto não é explícito = caracteres vazam no output (ADR-044).

---

### GATE 7: Performance ⭐ OBRIGATÓRIO

```bash
grep -r "console.log" src/ --exclude-dir=node_modules
npm run build && du -sh dist/
```

- [ ] 0 console.logs em src/?
- [ ] Bundle < 500KB?

---

### GATE 8: Pre-Deploy ⭐ OBRIGATÓRIO

```bash
npm run build
npx tsc --noEmit
npx eslint "src/**/*.{ts,tsx}"
```

- [ ] Build OK?
- [ ] 0 TypeScript errors?
- [ ] 0 lint errors?

---

## MATRIZ DE DECISÃO

| Gates Passed | Ação |
|--------------|------|
| 11/11 | ✅ Prosseguir Workflow 5a |
| 10/11 | ⚠️ Corrigir 1 gate |
| < 10/11 | ⛔ PARAR, corrigir todos |

---

## FASE FINAL: UPDATE CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')

# Atualizar workflow-progress.md
cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 4.5: Pre-Implementation Gates ✅
- **Data**: $TIMESTAMP
- **Gates Passed**: [X]/9
- **Bloqueios**: [Nenhum ou listar]
- **Next**: Workflow 5a (Implementação)
EOF

# Log em attempts.log
echo "[$TIMESTAMP] WORKFLOW: 4.5 - Gates validados" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$TIMESTAMP] GATES: [X]/9 passed" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## Checklist Final

- [ ] GATE 0: Environment OK?
- [ ] GATE 1-2: Tool/Runtime (se aplicável)?
- [ ] GATE 3: FK + Prefix (se migration)?
- [ ] GATE 4-5: Size + YAGNI?
- [ ] GATE 6-8: Schema + Perf + Deploy?
- [ ] 9/9 gates? .context/ atualizado?

---

## REGRA ANTI-ROI

**NUNCA**: ROI, tempo, "horas economizadas"
**PERMITIDO**: "X gates passed", evidências concretas

---

**Versão**: 2.0 (Otimizado)

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 5a] - Implementation**: Todos 9 gates aprovados → implementar código com TDD.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| Gate 1 (Tool Validation) falhou | 2b (Technical Design) | Redesenhar schema/tools |
| Gate 3 (FK Reference) falhou | 2b (Technical Design) | Corrigir modelo de dados |
| Gate 6 (Schema-First) falhou | 3 (Risk Analysis) | Reavaliar riscos de DB |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| 3+ gates falharam | 2b (Technical Design) | Design precisa revisão |
| Gate 0 (Environment) falhou | 0 (Setup) | Reconfigurar ambiente |
| Gate 8 (Anti-Over-Engineering) falhou | 2a (Solutions) | Simplificar solução |

### Regras de Ouro
- ⛔ **NUNCA pular**: Gate 0 (Environment) + Gate 6 (Schema-First) - críticos
- ⚠️ **Gate falhou 2+ vezes**: Voltar para design - não forçar
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto

