---
description: Workflow 4.5 - Pre-Implementation Quality Gates (12 Gates)
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

## PRE-REQUISITO: GATE WF3 + WF3.5 (OBRIGATÓRIO) 🆕

**CRÍTICO**: Workflows 3 (Risk Analysis) e 3.5 (Tasks) DEVEM ter sido executados antes de entrar no 4.5.

```bash
# Validar Workflow 3 (Risk Analysis) executado
./scripts/validate-workflow-3-executed.sh

# Validar Workflow 3.5 (Tasks) executado
./scripts/validate-workflow-3.5-executed.sh
```

**SE ALGUM FALHAR (exit 1)**:
- ⛔ PARAR → Voltar para o workflow faltante
- WF3 não executado → Voltar para `.windsurf/workflows/add-feature-3-risk-analysis.md`
- WF3.5 não executado → Voltar para `.windsurf/workflows/add-feature-3.5-tasks.md`

**Por quê obrigatório**:
- **WF3 (Risk Analysis)**: Identificar riscos ANTES de implementar evita 30-40% bugs
- **WF3.5 (Tasks)**: Tasks atômicas garantem implementação organizada e rastreável

---

## 12 GATES OBRIGATÓRIOS (10 + 2 novos)

### GATE -2: Workflow 3 (Risk Analysis) ⭐ NOVO

```bash
./scripts/validate-workflow-3-executed.sh
```

- [ ] Script passou (exit 0)?
- [ ] Riscos documentados em decisions.md?
- [ ] Mitigações definidas?
- [ ] Rollback plan presente?

**SE exit 1**: ⛔ Voltar para Workflow 3

---

### GATE -1: Workflow 3.5 (Tasks) ⭐ NOVO

```bash
./scripts/validate-workflow-3.5-executed.sh
```

- [ ] Script passou (exit 0)?
- [ ] tasks.md existe com conteúdo?
- [ ] Tasks têm dependências explícitas (dep:)?
- [ ] Dependency graph presente?

**SE exit 1**: ⛔ Voltar para Workflow 3.5

---

### GATE 0: Environment Validation ⭐ SEMPRE PRIMEIRO

```bash
./scripts/validate-env-conflicts.sh
./scripts/validate-schema-first.sh
```

- [ ] Scripts passaram (exit 0)?
- [ ] SE exit 1: Corrigir ANTES prosseguir

---

### GATE 0.5: Spec Validation (REGRA #46) 🆕

**CRÍTICO**: Validar consistência entre spec.md, plan.md e tasks.md ANTES de implementar.

**Arquivos Inline** (v2.0 - criados por `context-init.sh`):

```bash
# Detectar se spec-driven está ativo
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

# Verificar artefatos inline existem
SPEC_FILE=".context/${BRANCH_PREFIX}_spec.md"
PLAN_FILE=".context/${BRANCH_PREFIX}_plan.md"
TASKS_FILE=".context/${BRANCH_PREFIX}_tasks.md"

if [ -f "$SPEC_FILE" ]; then
  echo "✅ Spec-Driven ativo"
  echo "   spec.md:  $SPEC_FILE"
  echo "   plan.md:  $PLAN_FILE"
  echo "   tasks.md: $TASKS_FILE"
fi
```

**Usar skill spec-validator** (4 Checks):
```
/spec-validator
```

**Checklist Manual (se skill indisponível)**:

1. **Coverage Spec → Plan** (100% requirements)
   - [ ] TODO requirement em spec.md tem componente correspondente em plan.md?
   - [ ] Nenhum requirement sem implementação planejada?

2. **Consistency Plan → Spec** (0% over-engineering)
   - [ ] TODO componente em plan.md deriva de requirement em spec.md?
   - [ ] Nenhum componente "extra" sem justificativa?

3. **Coverage Plan → Tasks** (100% implementável)
   - [ ] TODO componente em plan.md tem tasks em tasks.md?
   - [ ] Nenhum gap de execução?

4. **Dependency Validation** (alinhamento)
   - [ ] Dependências em spec.md == dependências em plan.md?

**SE arquivos spec não existem**:
- [ ] Voltar Workflow 1 Fase 1.6 (SPECIFY) para criar spec.md
- [ ] OU executar `./scripts/context-init.sh <feature-name>` para criar templates

**Por quê**: Implementar código que não corresponde a requirements = retrabalho 100%.

**ROI**: 5-10 min validação vs 30-120 min refazer código desalinhado

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
grep -r "\.from\(['\"](?!${PROJECT_PREFIX})" src/hooks/
grep -r "CREATE TABLE" supabase/migrations/*.sql | grep -v "${PROJECT_PREFIX}"
```

- [ ] FK aponta para PK/UNIQUE?
- [ ] Prefixo `${PROJECT_PREFIX}` em todas tabelas?
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
   grep -oE "${PROJECT_PREFIX}[a-z_]+" .context/{branch}_temp-memory.md | sort -u
   ```

2. **Auto-fetch schema via MCP** (CADA tabela):
   ```sql
   -- Via MCP execute_sql (automático)
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = '${PROJECT_PREFIX}habits'
   ORDER BY ordinal_position;
   ```

3. **Salvar snapshot** (gitignored):
   ```bash
   # .context/{branch}_schema-snapshot.json (gerado automaticamente)
   {
     "${PROJECT_PREFIX}habits": [
       {"name": "id", "type": "uuid", "nullable": "NO"},
       {"name": "user_id", "type": "uuid", "nullable": "NO"},
       {"name": "name", "type": "text", "nullable": "NO"},
       ...
     ],
     "${PROJECT_PREFIX}profiles": [...]
   }
   ```

4. **Workflow 5a**: Validar SQL contra snapshot (NÃO schema live)

**ROI**: Consulta manual 3-5min → automática 30s (ROI 6-10x)

**Implementação**: Script `./scripts/auto-fetch-schema-snapshot.sh` (pendente)

---

### GATE 6.6: SQL Behavior Validation ⭐ CRÍTICO

**CRÍTICO**: GATE 6 valida schema (colunas, tipos) mas NÃO valida comportamento SQL (UNION, DISTINCT, GROUP BY).

**Problema**: Operações SQL têm comportamento não-intuitivo que pode causar duplicatas/missing rows silenciosamente.

**SE migration tem UNION/DISTINCT/GROUP BY/JOIN com multi-entity relationships**:

```bash
./scripts/validate-sql-behavior.sh <migration_file>
```

**Checklist**:
- [ ] Migration detectou UNION/DISTINCT/GROUP BY?
- [ ] Script gerou checklist de edge case tests?
- [ ] Testei com usuário multi-entity (5+ entities)?
- [ ] Resultado: 1 row por user_id (ou entity esperada)?
- [ ] Query testada em psql/MCP com dados reais?

**Edge Cases Obrigatórios**:
- **UNION**: Usuário com N entities (habits, goals) retorna N rows?
- **DISTINCT**: Ordem não-determinística sem ORDER BY?
- **GROUP BY**: Multi-entity gera N rows por user?
- **JOIN**: LEFT JOIN sem filtering gera NULL duplicates?

**Por quê**: UNION deduplica comparando TODA row (não apenas user_id). Se campos differ (habit_id, habit_name), UNION vê como unique → duplicatas.

**Solução**: DISTINCT ON (user_id) + ORDER BY para escolher 1 row por user.

**Evidência**: Bug #5 - Felipe 9 habits → 9 rows na VIEW (UNION não deduplicou).

**Ver**: ADR-052 (SQL Behavior Validation), AGENTS.md Section 2 (DISTINCT ON Pattern)

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

### GATE 6.9: Schema Type Change Impact

**SE migration muda TIPO de coluna** (TEXT → JSONB, INTEGER → BIGINT, etc):

**Validação Obrigatória**:
```bash
# Executar ANTES de aplicar migration
./scripts/validate-schema-type-change.sh <field_name>

# Exemplo: Migration muda reasoning de TEXT → JSONB
./scripts/validate-schema-type-change.sh reasoning
```

**Checklist**:
- [ ] Executei script validation para CADA campo com type change?
- [ ] Script listou TODOS usos do campo (frontend + backend + Edge)?
- [ ] Atualizei CADA arquivo listado ANTES de aplicar migration?
- [ ] TypeScript types regenerados APÓS migration? (`./scripts/regenerate-supabase-types.sh`)
- [ ] Testes manuais confirmam zero erros?
- [ ] Se JSONB field: Consultei `docs/AGENTS.md` JSONB Field Access Pattern?

**Red Flags**:
- ❌ Migration aplicada ANTES de atualizar código
- ❌ Script validation NÃO executado
- ❌ Arquivo listado no script mas NÃO atualizado
- ❌ Render direto de campo JSONB (ex: `<p>{field}</p>`)
- ❌ Método de string em campo JSONB (ex: `field.slice()`)

**Por quê**: Schema type changes são BREAKING - código que funcionava com tipo antigo QUEBRA com novo tipo.

**Evidência**: 2 bugs JSONB (FASE 2.5 - AdminAIDecisions.tsx + DecisionDetailModal.tsx) causados por migration TEXT → JSONB sem atualizar frontend.

**ROI**: Script 3min vs Debug 15-60min (ROI 5-20x)

**Referências**:
- ADR-051: Schema Type Change Validation Process
- `docs/AGENTS.md`: JSONB Field Access Pattern

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
| 12/12 | ✅ Prosseguir Workflow 5a |
| 11/12 | ⚠️ Corrigir 1 gate |
| < 11/12 | ⛔ PARAR, corrigir todos |
| GATE -2 ou -1 falhou | ⛔ BLOQUEIO ABSOLUTO - Voltar WF3/3.5 |

**NOTA**: Gates -2 (WF3) e -1 (WF3.5) são pré-requisitos absolutos. Se falharem, não continuar independente dos outros gates.

---

## FASE FINAL: UPDATE CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')

# Atualizar workflow-progress.md
cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 4.5: Pre-Implementation Gates ✅
- **Data**: $TIMESTAMP
- **Gates Passed**: [X]/10
- **Bloqueios**: [Nenhum ou listar]
- **Next**: Workflow 5a (Implementação)
EOF

# Log em attempts.log
echo "[$TIMESTAMP] WORKFLOW: 4.5 - Gates validados" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$TIMESTAMP] GATES: [X]/10 passed" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## Checklist Final

- [ ] **GATE -2**: Workflow 3 (Risk Analysis) executado? 🆕
- [ ] **GATE -1**: Workflow 3.5 (Tasks) executado? tasks.md preenchido? 🆕
- [ ] **GATE 0**: Environment OK?
- [ ] **GATE 0.5**: Spec Validation OK? (REGRA #46)
- [ ] **GATE 1-2**: Tool/Runtime (se aplicável)?
- [ ] **GATE 3**: FK + Prefix (se migration)?
- [ ] **GATE 4-5**: Size + YAGNI?
- [ ] **GATE 6-8**: Schema + Perf + Deploy?
- [ ] **12/12** gates? .context/ atualizado?

---

## REGRA ANTI-ROI

**NUNCA**: ROI, tempo, "horas economizadas"
**PERMITIDO**: "X gates passed", evidências concretas

---

**Versão**: 2.3 (WF3/WF3.5 Gates)

**Changelog v2.3**: Adicionados GATE -2 (Workflow 3 Risk Analysis) e GATE -1 (Workflow 3.5 Tasks) como pré-requisitos obrigatórios. Agora são 12 gates (10 + 2 novos).

**Changelog v2.2**: GATE 0.5 atualizado para usar formato inline `.context/{prefix}_spec.md` (v2.0 Spec-Driven)

**Changelog v2.1**: Adicionado GATE 0.5 (Spec Validation) para validar consistência spec.md↔plan.md↔tasks.md antes de implementar (REGRA #46)

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 5a] - Implementation**: Todos 12 gates aprovados → implementar código com TDD.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| GATE -2 (WF3) falhou | 3 (Risk Analysis) | Executar análise de riscos 🆕 |
| GATE -1 (WF3.5) falhou | 3.5 (Tasks) | Criar tasks atômicas 🆕 |
| Gate 1 (Tool Validation) falhou | 2b (Technical Design) | Redesenhar schema/tools |
| Gate 3 (FK Reference) falhou | 2b (Technical Design) | Corrigir modelo de dados |
| Gate 6 (Schema-First) falhou | 3 (Risk Analysis) | Reavaliar riscos de DB |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| GATE -2 ou -1 falhou | 3 ou 3.5 | Pré-requisitos absolutos 🆕 |
| 3+ gates falharam | 2b (Technical Design) | Design precisa revisão |
| Gate 0 (Environment) falhou | 0 (Setup) | Reconfigurar ambiente |
| Gate 5 (Anti-Over-Engineering) falhou | 2a (Solutions) | Simplificar solução |

### Regras de Ouro
- ⛔ **NUNCA pular**: GATE -2/-1 (WF3/WF3.5) + Gate 0 (Environment) + Gate 6 (Schema-First)
- ⚠️ **Gate falhou 2+ vezes**: Voltar para design - não forçar
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto

