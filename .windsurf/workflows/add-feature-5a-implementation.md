# WORKFLOW 5a: IMPLEMENTATION (Meta-Framework)

**Versão**: 2.0.0 | **Paradigm**: Princípios > Checklists | **Coverage**: 85-90%

---

## 📋 FASE 0: LOAD CONTEXT

```bash
./scripts/context-read-all.sh  # INDEX, workflow-progress, decisions, temp-memory
```

## 📋 FASE 0.5: MEMORY RE-CHECK (2-3 min)

1. Revisar Memory Audit do Workflow 2b
2. Re-ler seções críticas (SE necessário)
3. Validar: `./scripts/validate-memory-consulted.sh --phase=5a`

## 📋 FASE 0.6: IMPACT MAPPING (Efeito Dominó) ⭐ OBRIGATÓRIO

**Objetivo**: Identificar dependências ANTES de modificar código para prevenir efeito dominó.

**Quando Executar**: SEMPRE antes de modificar componente, Edge Function, schema DB, feature multi-camadas, ou Tool Gemini.

**Processo (5-10 min)**:

```bash
# 1. Código + integrações (4 camadas) - ⭐ Recomendado Serena (40% menos false positives)
./scripts/impact-mapper-serena.sh <target>
# OU (fallback se Serena indisponível)
./scripts/impact-mapper.sh <target>

# 2. Database específico (SE modificar schema)
./scripts/db-dependency-checker.sh <tabela>

# 3. Tools Gemini (SE modificar tools)
npx ts-node scripts/validate-tool-schemas.ts <target>
```

**Benefício Serena**:
- 40% menos false positives (LSP-based semantic analysis)
- 2-3 min mais rápido vs grep manual
- Detecção precisa de importers, call sites, pattern matching

**Classificação de Risco**:
| Dependências | Risco | Ação |
|--------------|-------|------|
| 0 | LOW | Prosseguir |
| 1-4 | MEDIUM | Revisar output do script |
| 5-14 | HIGH | Documentar mitigações em `.context/{branch}_decisions.md` |
| 15+ | CRITICAL | Feature flag + canary deploy |

**Output**: SE risco >= MEDIUM, criar `.context/{branch}_impact-analysis.md`

**⛔ Bloqueios**: NUNCA modificar código sem executar scripts, NUNCA ignorar risco HIGH/CRITICAL

**ROI**: 5-10min análise vs 30-120min debug efeito dominó

### FASE 0.6.1: List INSERT/UPSERT Points (SE schema change) 🆕

**Objetivo**: Identificar TODOS os pontos de código que fazem INSERT/UPSERT na tabela que será modificada, para garantir consistência após schema change.

**Quando Executar**: SEMPRE quando modificar schema de tabela existente (ALTER TABLE, ADD COLUMN, DROP COLUMN).

**Processo (3-5 min)**:

```bash
# 1. Buscar INSERT diretos
grep -r "\.from('TABLE_NAME')\.insert\|\.from(\"TABLE_NAME\")\.insert" supabase/functions/

# 2. Buscar UPSERT diretos
grep -r "\.from('TABLE_NAME')\.upsert\|\.from(\"TABLE_NAME\")\.upsert" supabase/functions/

# 3. Buscar RPCs que fazem INSERT (via db-dependency-checker.sh output)
./scripts/db-dependency-checker.sh TABLE_NAME | grep -A5 "RPCs/FUNCTIONS"

# 4. Documentar em .context/{branch}_decisions.md
```

**Checklist Obrigatória**:
- [ ] Listei TODOS INSERT/UPSERT points? (grep + db-dependency-checker.sh)
- [ ] Para CADA point: verifico se schema change afeta?
- [ ] SE ADD COLUMN: default value definido OU code atualizado para incluir?
- [ ] SE DROP COLUMN: code atualizado para remover referencias?
- [ ] SE RENAME COLUMN: code atualizado com novo nome?
- [ ] Pattern consistente? (ex: SE user_id adicionado, TODOS INSERT/UPSERT incluem?)

**Exemplo Real** (ADR-050 Phase 5):

```bash
# Schema change: ADD user_id to ${PROJECT_PREFIX}entity_keywords
# Found 2 INSERT/UPSERT points:

# Point 1: keyword-matcher.ts:207 (UPSERT) ✅ UPDATED
user_id: userId  # Added

# Point 2: gemini-chat-handler-v2.ts:2702 (RPC auto_learn_keyword) ❌ NOT UPDATED
# Root Cause: RPC não aceita user_id parameter
# Fix: Replace RPC with direct UPSERT (gemini-chat-handler-v2.ts:2704-2718)
```

**Red Flags**:
- 🚩 Schema change sem listar INSERT/UPSERT points (70% code desalinhamento)
- 🚩 ADD COLUMN sem verificar se code precisa update (silent failures)
- 🚩 Assumir "apenas 1 lugar insere nessa tabela" (wrong 80% do tempo)
- 🚩 Usar pattern diferente em diferentes files (inconsistência)

**ROI**: 3-5min checklist vs 60-120min debug code desalinhamento

**Prevenção**: 70% code desalinhamento (save_habit vs keyword-matcher inconsistency)

**Evidência**: ADR-050 Phase 5 - save_habit usava RPC sem user_id, keyword-matcher usava UPSERT com user_id

---

## 📋 FASE 0.7: FEATURE TYPE DETECTION (1-2 min)

**Objetivo**: Classificar tipo de feature para adaptar E2E testing.

**Classificação**:
- [ ] **Backend-only**: Edge Functions, RPCs, migrations
  - Arquivos: `supabase/functions/`, `supabase/migrations/`
  - E2E: curl/postman, RPC validation, schema checks

- [ ] **Full-stack**: Backend + Frontend
  - Arquivos: `src/` + `supabase/functions/`
  - E2E: Playwright flows end-to-end

- [ ] **UI-only**: Components, hooks, pages
  - Arquivos: `src/components/`, `src/pages/`
  - E2E: Playwright visual tests, interactions

**Output**: Documentar tipo em `.context/{branch}_decisions.md`

**ROI**: 1min classificação vs 15-60min debug E2E incompleto

**Fonte**: Learning #23 (FASE 2.5 Follow-Up v3)

---

## 📋 FASE 0.8: LOAD tasks.md (REGRA #46) 🆕

**Objetivo**: Usar tasks.md como guia de implementação, seguindo ordem de dependências.

**Arquivo Inline** (v2.0 - criado por `context-init.sh`):

```bash
# Localizar tasks.md inline
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
TASKS_FILE=".context/${BRANCH_PREFIX}_tasks.md"

if [ -f "$TASKS_FILE" ]; then
  echo "✅ Tasks file encontrado: $TASKS_FILE"
  cat "$TASKS_FILE"
fi
```

### Uso de tasks.md na Implementação

**Ordem de Execução**:
1. Ler tasks.md para entender dependency graph
2. Implementar tasks na ordem de dependências (não alfabética)
3. Marcar tasks como concluídas conforme implementa

**Tracking**:
```markdown
# Em tasks.md, atualizar status:

- [x] T-1.1: [Tarefa concluída] ← Marcar [x] quando done
- [~] T-1.2: [Tarefa em progresso] ← Usar [~] para in_progress
- [ ] T-1.3: [Tarefa pendente] ← Manter [ ] para pending
```

**Mapeamento tasks.md ↔ Commits**:
```bash
# Commit message deve referenciar task ID
git commit -m "feat(scope): T-1.1 - description

- Implements T-1.1 from tasks.md
- Dependencies: none"
```

### Validação Final

**Ao completar todas tasks**:
- [ ] Todas tasks marcadas [x] em tasks.md?
- [ ] Dependency graph respeitado? (tarefas pai antes de filhas)
- [ ] Commits referenciam task IDs?

**SE tasks.md não existe**:
- [ ] Voltar Workflow 3.5 (TASKS) para criar tasks.md
- [ ] OU usar docs/TASK.md legacy como alternativa

**Por quê**: Implementar sem ordem = retrabalho quando dependências falham.

**ROI**: 2min load + track vs 20-60min refazer ordem errada

---

## 1️⃣ 5W1H FRAMEWORK

**WHO**: Developer (código) + AI (assist) + Reviewer (gates)
**WHAT**: Funcionalidade + Tests (80%+) + Integration
**WHERE**: `src/components/{feature}/`, `supabase/functions/`, `supabase/migrations/`
**WHEN**: Pre-gates → Código (TDD) → Post-gates
**WHY**: Business value + Quality (70% bugs prevenidos) + Manutenibilidade
**HOW**: Feature-first + TDD + Commits atômicos < 300 linhas

---

## 📝 TODO TAGGING CONVENTION

**Convenção**: TODOs críticos (bloqueiam feature) DEVEM ter tag `@PHASE-X`

**Exemplo**:
```typescript
// TODO @PHASE-2.6: Implement retry logic for failed messages
```

**Correspondência em TASK.md**:
```markdown
- [ ] FASE 2.6.1: Implementar retry logic para mensagens falhadas
```

**Validação Pre-Commit**: `./scripts/sync-code-todos-to-taskmd.sh` (bloqueia se TODOs não rastreados)

**Fonte**: Learning #25 (FASE 2.5 Follow-Up v3)

---

## 2️⃣ PRINCÍPIOS (P1-P6)

### P1: Code Organization
**Feature-first** (não layer-first)
- Estrutura: `src/components/{feature}/Component.tsx + useComponent.ts + types.ts`
- Shared: APENAS se 3+ usos (Rule of Three)
- ❌ Red Flags: Pasta genérica antes 3 usos, espalhar por tipo

### P2: Testing Strategy
**Test behavior** (não implementation)
- Unit: Lógica negócio | Integration: Fluxos críticos | E2E: Happy path
- Coverage: 80% (não 100% - YAGNI)
- TDD: Red → Green → Refactor (quando lógica complexa)
- ❌ Red Flags: Mock internals, coverage 100%, test implementation

### P3: Integration Pattern
**Loose coupling** (primitives props, hooks encapsulam)
- Props: Primitives (não objetos complexos)
- Hooks: Estado + lógica centralizado
- API: React Query cache 5min, parallel queries
- ❌ Red Flags: Props drilling > 3 níveis, useState espalhado

### P4: Validation Gates
**Fail fast** (pré-code + durante + pós)
- Pre: GATE 6.5 (Schema), GATE 6.6 (Impact Mapping)
- Durante: TypeScript strict, ESLint, Prettier
- Post: Screenshot, smoke tests
- ❌ Red Flags: Pular gates, TypeScript any, commit sem screenshot

### P5: Error Handling
**Validate boundaries** (trust internally)
- External: User input, API, uploads (Zod validation)
- Internal: Trust TypeScript, framework
- Logs: Contexto debug (user_id, timestamp)
- ❌ Red Flags: Try-catch excessivo, double-validation, stack trace exposto

### P6: Async Operations (Snapshot + Fallback)
**Context temporal** (scheduled, queued, retries)
- Save: Snapshot completo no momento da decisão (`context_snapshot`)
- Process: Tentar fresh context primeiro
- Fallback: Usar snapshot SE fresh falhar
- Log: Qual context usado (fresh vs snapshot)
- ❌ Red Flags: Sem snapshot, sem fallback, assumir context sempre disponível

**Quando Aplicar**: Cron jobs, approval queues, delayed tasks, multi-step workflows
**Padrão**: `docs/patterns/CONTEXT-SNAPSHOT-FALLBACK.md`
**Fonte**: Learning #24 (FASE 2.5 Follow-Up v3)

---

## 3️⃣ EXEMPLOS CANÔNICOS

### Ex1: CRUD Component (Feature-first + Hook)
```typescript
// src/components/habits/HabitCard.tsx
export function HabitCard({ habitId }: Props) {
  const { habit, isLoading, update } = useHabitCard(habitId);
  return <Card>...</Card>;
}

// src/components/habits/useHabitCard.ts
export function useHabitCard(habitId: string) {
  const { data } = useQuery(['habit', habitId], fetchHabit);
  const mutation = useMutation(updateHabit);
  return { habit: data, update: mutation.mutate };
}
```
**Aplica**: P1 (feature-first), P3 (primitives props), P4 (no any)

### Ex2: Edge Function (Validation Boundary)
```typescript
const schema = z.object({ from: z.string(), message: z.string() });

export async function POST(req: Request) {
  const validation = schema.safeParse(await req.json());
  if (!validation.success) {
    return new Response(JSON.stringify({
      error: 'Invalid', details: validation.error.issues
    }), { status: 400 });
  }

  const result = await process(validation.data);  // Trust internally
  return new Response(JSON.stringify(result), { status: 200 });
}
```
**Aplica**: P5 (validate boundary, trust internal, context logs)

### Ex3: Integration Test (Behavior)
```typescript
it('should create habit and show in list', async () => {
  renderWithProviders(<HabitList />);
  await user.click(screen.getByText('Add'));
  await user.type(screen.getByLabelText('Name'), 'Exercise');
  await user.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(screen.getByText('Exercise')).toBeInTheDocument();
  });
});
```
**Aplica**: P2 (test behavior não implementation)

---

## 4️⃣ VALIDATION GATES

### ⭐ GATE 6.5: Schema Validation (SE SQL)
**Quando**: CREATE FUNCTION, migrations, queries `${PROJECT_PREFIX}*`

**Processo** (3-5 min):
1. Listar tabelas referenciadas
2. Consultar MCP: `SELECT column_name FROM information_schema.columns WHERE table_name = 'X'`
3. Documentar em `.context/{branch}_decisions.md`
4. Confirmar colunas EXISTEM

**❌ Bloqueios**: SQL sem schema, assumir nomes, copiar código antigo

**ROI**: 3-5min vs 15-60min debug

### ⭐ GATE 6.5.5: Database Dependency Mapping (ANTES Migration) 🆕
**Quando**: ALTER TABLE, DROP COLUMN, schema changes em tabelas existentes

**Processo** (5-8 min):
1. **Executar script**: `./scripts/db-dependency-checker.sh <table_name>`
2. **Documentar dependências** em `.context/{branch}_decisions.md`:
   - RPCs/Functions que referenciam a tabela
   - Triggers on table
   - Views que selecionam da tabela
   - Foreign Keys (incoming + outgoing)
   - Indexes
   - RLS Policies
3. **Planejar atualizações**: Para CADA dependência, anotar se precisa update
4. **Ordem de execução**: Migration → RPC updates → Code changes → Deploy

**Checklist Obrigatória**:
- [ ] Script `db-dependency-checker.sh` executado?
- [ ] Dependências listadas (RPCs, triggers, views, FKs, indexes, RLS)?
- [ ] Para cada dependência: plano de update documentado?
- [ ] Ordem de execução definida (migration first, RPC updates, code)?
- [ ] SE 5+ dependências: create `.context/{branch}_migration-dependencies.md`

**❌ Bloqueios**:
- ALTER TABLE sem executar script
- Migration commitada sem atualizar RPCs dependentes
- Dependências não documentadas
- Assumir "não tem dependências" sem verificar

**ROI**: 5-8min análise vs 90min debug migrations incompletas

**Evidência**: ADR-050 Phase 5 - RPC `auto_learn_keyword` não atualizado após schema change

**Prevenção**: 90% migrations incompletas (3/3 bugs identificados teriam sido prevenidos)

### ⭐ GATE 6.6: Impact Mapping (SE modifica existente)
**Quando**: Modificar componente, Edge Function, schema, multi-camadas

**Processo** (5-10 min):
1. Mapear 4 Camadas: Frontend (importers), Backend (functions), Database (triggers/views/FKs), Cross-Cutting (RLS/logs)
2. Tools: `grep -r "X" src/`, `./scripts/db-dependency-checker.sh`, MCP
3. Documentar impactos
4. Validar cada após mudança

**❌ Bloqueios**: Modificar sem mapear, alterar schema sem triggers, mudar function sem tools

**ROI**: 5-10min vs 30-120min debug efeito dominó

### ⭐ GATE 6.9: FLOW MAPPING (SE Código Complexo) 🆕
**Quando**: Modificar código >100 linhas OU com 3+ checkpoints (if/switch/loop)

**Processo** (5-10 min):
1. Mapear fluxo completo (INPUT → processamento → OUTPUT)
2. Identificar TODOS breaks/fallbacks/early returns
3. Simular mudança no papel (desenhar fluxo)
4. Confirmar: sei EXATAMENTE onde/como modificar?

**Checklist Mínima**:
- [ ] VERSION TAG adicionado? (ver GATE 6.7)
- [ ] Logs por layer adicionados?
- [ ] Fluxo completo mapeado (checkpoints identificados)?
- [ ] Breaks/fallbacks identificados?
- [ ] Simulei mudança antes de implementar?

**❌ Bloqueios**: Modificar código complexo sem flow mapping, modificar sem entender todos os checkpoints

**ROI**: 10min mapeamento vs 6h+ debugging iterativo

**Detalhes**: Ver `~/.claude/memory/debugging.md` Caso 17 (RCA-057 Series - Magic Link)

**Evidência**: RCA-057 - 7 deploys para 1 bug devido a falta de flow understanding (user: "arruma uma coisa e estraga outra")

### Post-Code Gates

**Screenshot**: ANTES (Workflow 2b) vs DEPOIS (side-by-side)

**Build & Lint**: `npm run build && npx tsc --noEmit && npm run lint`

**E2E Testing** (adaptado ao Feature Type - Fase 0.7):

**SE Backend-only**:
- [ ] curl/postman test Edge Function endpoint
- [ ] Validar RPC return type e behavior (schema correto)
- [ ] Verificar schema changes aplicadas (migration pushed)
- [ ] Testar error handling e edge cases

**SE Full-stack**:
- [ ] Playwright flow completo: UI → Backend → DB → UI
- [ ] Validar integração frontend-backend
- [ ] Verificar estado final consistente (DB + UI)

**SE UI-only**:
- [ ] Playwright visual tests (screenshot comparison)
- [ ] Testar interações usuário (clicks, inputs, navigation)
- [ ] Validar responsividade (mobile, tablet, desktop)

**TODO Validation**:
- [ ] Executar `./scripts/sync-code-todos-to-taskmd.sh`
- [ ] SE exit 1: Adicionar TODOs faltantes a TASK.md OU remover tag `@PHASE-X`

### ⭐ GATE 6.7: OBSERVABILITY GATE (ANTES Deploy) 🆕
**Quando**: Criar/alterar Edge Function, Tool Gemini, Handler crítico

**Checklist Obrigatória**:
- [ ] VERSION TAG adicionado? (`const MODULE_VERSION = "YYYY-MM-DD-NNN"`)
- [ ] Log de entrada? (parâmetros recebidos)
- [ ] Log de saída? (resultado retornado)
- [ ] Erros retornam mensagem DESCRITIVA? (não genérica)
- [ ] Erros 4xx são LOGADOS? (não silenciosos)
- [ ] Validações runtime para tipos críticos? (triggers, assinaturas, IDs)

**Pattern VERSION TAG**:
```typescript
const MODULE_VERSION = "2025-12-30-001";
console.log(`[module-name] 🚀 VERSION: ${MODULE_VERSION}`);
```

**Pattern Logging Estruturado**:
```typescript
console.log(`[tool_name v${VERSION}] ENTRY: userId=${userId}, args=${JSON.stringify(toolArgs)}`);
// ... lógica ...
console.log(`[tool_name v${VERSION}] SUCCESS: result=${JSON.stringify(result)}`);
```

**❌ Bloqueios**:
- Deploy sem VERSION TAG
- `catch (e) { /* ignore */ }` - NUNCA ignorar erros
- `return "Erro genérico"` - SEMPRE mensagem descritiva
- Trigger hardcoded não validado contra VALID_TRIGGERS

**ROI**: 5min observability vs 2h+ debug blind loop

**Evidência**: Bug Onboarding João - 422 errors silenciosos, 6 RCAs sem resolver por falta de observability

**Cross-ref**: REGRA #44.1 (Observability Obrigatória)

### ⭐ GATE 6.8: CLEANUP GATE (APÓS Modificar Fluxo) 🆕
**Quando**: Remover feature, alterar fluxo, renomear função/trigger

**Processo (3 Etapas)**:

**Etapa 1: MAPEAR** - Executar script de validação:
```bash
./scripts/validate-cleanup.sh "codigo_a_remover"

# Exit codes:
# 0 = Cleanup completo (0 referências)
# 1 = Código morto encontrado (seguro remover)
# 2 = Código CONECTADO encontrado (requer análise)
```

**Etapa 2: CLASSIFICAR** - Para cada referência encontrada:

| Pergunta | Se SIM | Se NÃO |
|----------|--------|--------|
| Código é chamado por outro código? | ⚠️ CONECTADO - Analisar impacto | ✅ Código morto - Remover |
| Existe import deste código? | ⚠️ CONECTADO - Verificar quem importa | ✅ Código morto - Remover |
| É exportado para uso externo? | ⚠️ CONECTADO - Verificar consumers | ✅ Código morto - Remover |
| Trigger/RPC existe no DB? | ⚠️ CONECTADO - Verificar se usado | ✅ Código morto - Remover |

**Etapa 3: DECIDIR** - Baseado na classificação:

```
SE Exit Code = 0 (0 referências):
  → ✅ CLEANUP COMPLETO - Prosseguir

SE Exit Code = 1 (código morto):
  → Remover linhas identificadas
  → Executar script novamente
  → Repetir até Exit Code = 0

SE Exit Code = 2 (código CONECTADO):
  → ⛔ PARAR - Mudança afeta outras partes
  → Mapear impacto da conexão
  → Avaliar se mudança precisa propagar
  → SE SIM: Voltar Workflow 2b → 3 → 4.5 → 5a
  → SE NÃO: Documentar razão e adaptar código conectado
```

**Checklist Obrigatória**:
- [ ] Executei `./scripts/validate-cleanup.sh "codigo"`?
- [ ] SE Exit 2: Mapeei impacto das conexões?
- [ ] SE Exit 2 + propagar: Voltei Workflow 2b/3/4.5?
- [ ] Removi TODOS os pontos de código morto?
- [ ] Atualizei arrays/listas que incluíam o código removido?
- [ ] Removi fallbacks que dependem de fluxo antigo?
- [ ] Validei que triggers usados existem em TRANSITION_RULES?
- [ ] Validei assinatura das funções chamadas?
- [ ] Atualizei mensagens de retorno que referenciavam fluxo antigo?
- [ ] Executei script novamente e obtive Exit 0?

**Tipos de Código Morto a Buscar**:
| Tipo | Exemplo | Impacto |
|------|---------|---------|
| Tool definitions | `CONFIRM_PHONE_NUMBER_TOOL` | IA pode chamar tool inexistente |
| Tool handlers | `case "confirm_phone_number":` | Código nunca executado |
| Fallbacks | `isPhoneConfirmationQuestion` | Lógica para fluxo antigo |
| Arrays órfãos | `ONBOARDING_TOOLS.push()` | Validações quebradas |
| Mensagens retorno | `next_step: "Confirmar telefone..."` | IA recebe instrução errada |
| Triggers inválidos | `"whatsapp_name_collected"` | 422 silenciosos |

**❌ Bloqueios**:
- Remover feature sem executar `validate-cleanup.sh`
- Ignorar Exit Code 2 (código conectado)
- Alterar fluxo sem atualizar mensagens de retorno
- Renomear trigger sem atualizar TRANSITION_RULES
- Comentar código ao invés de DELETAR
- Deixar fallbacks para fluxos inexistentes
- Finalizar cleanup com Exit Code != 0

**ROI**: 10min cleanup vs 3h+ debug código morto

**Evidência**: Bug Onboarding João - 9 pontos código morto `confirm_phone_number`, 5 triggers inválidos

**Cross-ref**: REGRA #52 (Cleanup Obrigatório), `scripts/validate-cleanup.sh`

---

## 5️⃣ COVERAGE VALIDATION

**Meta-Checklist**:
- [ ] P1-P6 aplicados? (mental checklist code review)
- [ ] GATE 6.5/6.6 executados? (SE aplicável)
- [ ] Fase 0.7: Feature type classificado? (E2E adaptado)
- [ ] TODO Convention seguida? (tags `@PHASE-X` validadas)
- [ ] Exemplos alinhados? (canonical patterns)
- [ ] Red Flags evitados? (lista cada princípio)

**Coverage**: 6 princípios + 3 learnings FASE 2.5 → 90%+ dos 130 checklists originais

---

## 🎯 PRÓXIMOS PASSOS

1. **Update Progress**: `echo "- [x] Workflow 5a" >> .context/{branch}_workflow-progress.md`
2. **Commit**:
```bash
git commit -m "feat(scope): description

- P1-P6 principles applied
- GATE 6.5: Schema validated (SE SQL)
- GATE 6.6: Impact mapped (SE modificação)
- Fase 0.7: Feature type classified (E2E adapted)
- TODO Convention: @PHASE-X tags validated
- Coverage: 90%+"
```
3. **Prosseguir**: Workflow 6a (Validation) SE tests OK

---

## 📚 REFERÊNCIAS

**Regras**: #5 (Teia), #11 (YAGNI), #14 (Atômico), #17 (No any), #28 (Gates), #31 (Schema-First), #44 (Observability-First) 🆕, #44.1 (Observability) 🆕, #46 (Spec-Driven), #52 (Cleanup) 🆕
**ADRs**: ADR-021 (Gates), ADR-023 (Gemini 9k), ADR-030 (Tailwind), ADR-035 (Schema), ADR-050 (User-Scoped Keywords)
**Scripts**: `context-read-all.sh`, `validate-memory-consulted.sh`, `db-dependency-checker.sh`, `impact-mapper.sh`, `sync-code-todos-to-taskmd.sh`, `spec-init.sh` 🆕
**Learnings**: workflow.md #23 (Feature Type), #24 (Context Snapshot), #25 (TODO Sync)
**Patterns**: `docs/patterns/CONTEXT-SNAPSHOT-FALLBACK.md`, `docs/patterns/DIRECT-UPSERT-RPC-PATTERN.md`
**Cases**: debugging.md Caso 17 (RCA-057 - Flow Mapping) 🆕
**Pareto**: Meta-Learning #2 (GATE 6.5.5 - ROI 15x), #3 (Pattern Doc - ROI 18x), #4 (FASE 0.6.1 - ROI 12x)
**Specs**: `.context/{prefix}_spec.md`, `{prefix}_plan.md`, `{prefix}_tasks.md` (REGRA #46 - Inline v2.0)

---

**Versão**: 2.7.0 | **Chars**: ~12,400 | **Evolution**: +600 chars (GATE 6.9) | **Reduction**: 68.5% vs v1 (39,415)

**Changelog v2.7.0**: Adicionado GATE 6.9 (Flow Mapping) - Extraído do RCA-057 Series (debugging.md Caso 17, REGRA #44)

**Changelog v2.6.0**: Adicionado GATE 6.7 (Observability) e GATE 6.8 (Cleanup) - Extraídos do Bug Onboarding João (REGRA #44.1, #52)

**Changelog v2.5.0**: FASE 0.8 atualizada para usar formato inline `.context/{prefix}_tasks.md` (v2.0 Spec-Driven)

**Changelog v2.4.0**: Adicionada FASE 0.8 (LOAD tasks.md) para usar tasks.md como guia de implementação com tracking de progresso (REGRA #46 Spec-Driven)

<!-- PROPAGATE -->
