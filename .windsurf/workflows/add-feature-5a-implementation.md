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
# 1. Código + integrações (4 camadas)
./scripts/impact-mapper.sh <target>

# 2. Database específico (SE modificar schema)
./scripts/db-dependency-checker.sh <tabela>

# 3. Tools Gemini (SE modificar tools)
npx ts-node scripts/validate-tool-schemas.ts <target>
```

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
**Quando**: CREATE FUNCTION, migrations, queries `lifetracker_*`

**Processo** (3-5 min):
1. Listar tabelas referenciadas
2. Consultar MCP: `SELECT column_name FROM information_schema.columns WHERE table_name = 'X'`
3. Documentar em `.context/{branch}_decisions.md`
4. Confirmar colunas EXISTEM

**❌ Bloqueios**: SQL sem schema, assumir nomes, copiar código antigo

**ROI**: 3-5min vs 15-60min debug

### ⭐ GATE 6.6: Impact Mapping (SE modifica existente)
**Quando**: Modificar componente, Edge Function, schema, multi-camadas

**Processo** (5-10 min):
1. Mapear 4 Camadas: Frontend (importers), Backend (functions), Database (triggers/views/FKs), Cross-Cutting (RLS/logs)
2. Tools: `grep -r "X" src/`, `./scripts/db-dependency-checker.sh`, MCP
3. Documentar impactos
4. Validar cada após mudança

**❌ Bloqueios**: Modificar sem mapear, alterar schema sem triggers, mudar function sem tools

**ROI**: 5-10min vs 30-120min debug efeito dominó

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

**Regras**: #5 (Teia), #11 (YAGNI), #14 (Atômico), #17 (No any), #28 (Gates), #31 (Schema-First)
**ADRs**: ADR-021 (Gates), ADR-023 (Gemini 9k), ADR-030 (Tailwind), ADR-035 (Schema)
**Scripts**: `context-read-all.sh`, `validate-memory-consulted.sh`, `db-dependency-checker.sh`, `impact-mapper.sh`, `sync-code-todos-to-taskmd.sh`
**Learnings**: workflow.md #23 (Feature Type), #24 (Context Snapshot), #25 (TODO Sync)
**Patterns**: `docs/patterns/CONTEXT-SNAPSHOT-FALLBACK.md`

---

**Versão**: 2.1.0 | **Chars**: 5,823 | **Evolution**: +950 chars (4 melhorias FASE 2.5) | **Reduction**: 85.2% vs v1 (39,415)

<!-- PROPAGATE -->
