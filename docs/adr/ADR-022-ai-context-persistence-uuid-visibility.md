# ADR-022: AI Context Persistence - UUID Visibility Pattern

**Status**: ✅ Aprovado
**Data**: 2025-11-13
**Contexto**: Meta-Learning Consolidation (análise 3 bugs relacionados a UUID)
**Decisores**: Baseado em Root Cause Analysis de duplicação, UUID fake, reminder error

---

## 📋 CONTEXTO

### Problema Identificado

**3 Bugs Relacionados a Context Persistence**:

**Bug #1 (Duplicação "Treino HIIT")**:
- User: "criar hábito treino HIIT"
- Bot criou: [ID: uuid-1]
- User: "atualizar frequência"
- Bot criou NOVO hábito [ID: uuid-2] (não reutilizou uuid-1)
- **Root Cause**: Gemini não reutilizou UUID (não viu no contexto)

**Bug #2 (UUID Fake - "some_habit_id")**:
- Tool `update_habit` esperava UUID
- Gemini chamou: `update_habit(habit_id: "some_habit_id")`
- Backend: Erro "Invalid UUID format"
- **Root Cause**: Gemini inventou UUID placeholder (não tinha UUID real)

**Bug #5 (Reminder Error - habit_name vs habit_id)**:
- User: "criar lembrete para treino"
- Gemini chamou: `create_reminder(habit_name: "treino")`
- Tool esperava: `habit_id` (UUID)
- **Root Cause**: Gemini não persistiu habit_id após criação

### Root Cause Analysis (5 Whys)

**Por quê duplicatas/UUIDs fake?**

1. **Por quê duplicatas?** → Gemini não reutilizou UUID
2. **Por quê não reutilizou?** → Contexto não persiste IDs
3. **Por quê não persiste?** → LLMs mantém texto conversacional, não metadata estruturada
4. **Por quê não metadata?** → Design arquitetural LLMs (não bug Gemini)
5. **ROOT CAUSE**: Contexto conversacional ≠ Banco de dados estruturado

### Meta-Learning (ML-CONTEXT-01)

**Evidência**:
- 3 bugs (60% total) causados por context persistence
- Tempo debugging: 8-10h (bug #1 sozinho: 4h)
- Solução: 1 linha código (`message: "... [ID: ${uuid}]"`)

**Insight**: LLMs "vêem" apenas TEXTO, não JSON structure. UUID deve estar VISÍVEL na mensagem conversacional.

---

## 🎯 DECISÃO

### UUID Explícito no TEXTO (Não Apenas JSON)

**Padrão Obrigatório**:

```typescript
// ✅ CORRETO - UUID visível no contexto conversacional
export async function saveHabit(args: any) {
  const uuid = crypto.randomUUID();

  await supabase.from("lifetracker_habits").insert({
    habit_id: uuid,
    name: args.name,
    // ...
  });

  return JSON.stringify({
    success: true,
    habit_id: uuid,  // ← Structured data (backend)
    message: `Hábito "${args.name}" criado com sucesso! [ID: ${uuid}]`,  // ← VISÍVEL (LLM)
    next_step: `Para atualizar, use: habit_id="${uuid}"`  // ← EXPLÍCITO
  });
}
```

**Por quê funciona**:
- ✅ `message` é string VISÍVEL no chat context window
- ✅ Gemini "lê" e "lembra" `[ID: ${uuid}]` em próximas tool calls
- ✅ `next_step` reforça formato correto (autodocumentação)

### Anti-Pattern (NUNCA fazer)

```typescript
// ❌ ERRADO - UUID apenas no JSON (LLM não vê)
export async function saveHabit(args: any) {
  const uuid = crypto.randomUUID();

  await supabase.from("lifetracker_habits").insert({...});

  return JSON.stringify({
    success: true,
    habit_id: uuid  // Gemini não persiste isso entre tool calls
  });
}
```

**Por quê falha**:
- ❌ JSON structure não é texto conversacional
- ❌ LLM não "lembra" campos JSON após tool execution
- ❌ Próxima tool call: Gemini inventa `"some_habit_id"` placeholder

---

## 🔧 ALTERNATIVAS CONSIDERADAS

### Alternativa 1: Enviar UUID em System Prompt (REJEITADA)

**Proposta**: Atualizar system prompt após cada tool call com UUIDs criados

**Prós**:
- Metadata estruturada persistente

**Contras**:
- ❌ System prompt é estático (não dinâmico por tool)
- ❌ Overhead: Reconstruir prompt após cada tool call
- ❌ Limit: System prompt tem tamanho máximo (token limit)

**Decisão**: ❌ REJEITADA - Arquitetura não suporta

### Alternativa 2: Context Window Tracking Manual (REJEITADA)

**Proposta**: Manter dict `{habit_name: uuid}` manualmente e injetar em responses

**Prós**:
- Controle total sobre context

**Contras**:
- ❌ Over-engineering (parser custom, state management)
- ❌ Gemini já faz tracking (se UUID visível)
- ❌ Viola REGRA #10 Anti-Over-Engineering

**Decisão**: ❌ REJEITADA - Solução simples existe (UUID no texto)

### Alternativa 3: UUID Explícito no TEXTO (APROVADA) ✅

**Proposta**: Incluir `[ID: ${uuid}]` na message string

**Prós**:
- ✅ Simples: 1 linha código
- ✅ Zero overhead (string concat)
- ✅ Gemini nativo (usa context window já existente)
- ✅ Autodocumentação (`next_step`)

**Contras**:
- ⚠️ UUID visível ao usuário (mas OK - transparência)

**Decisão**: ✅ APROVADA - Máximo benefício, mínimo custo

---

## 📊 CONSEQUÊNCIAS

### Positivas

1. **Eliminação Duplicatas**
   - Bug #1 resolvido (100% fix rate)
   - Gemini reutiliza UUID corretamente

2. **Eliminação UUID Fake**
   - Bug #2 resolvido (zero "some_habit_id")
   - Tool calls têm UUID válido

3. **Consistência Cross-Tool**
   - Bug #5 resolvido (reminder usa habit_id correto)
   - Chaining tools funciona (create → update → delete)

4. **Autodocumentação**
   - `next_step` ensina Gemini formato correto
   - Reduz erros futuros (self-learning)

5. **Zero Overhead**
   - 1 linha código (`message: ...`)
   - Performance idêntica

### Negativas

1. **UUID Visível ao Usuário**
   - User vê `[ID: abc-123...]` no chat
   - **Mitigação**: Transparência é feature (user pode copiar UUID para debug)

2. **Message Mais Longa**
   - +40 chars (`[ID: uuid-v4]`)
   - **Mitigação**: Desprezível (< 1% token usage)

---

## 🔗 RELACIONADOS

### ADRs
- **ADR-021**: Pre-Implementation Quality Gates (GATE 1 valida UUID explícito)
- **ADR-018**: NLP-First Habit Creation (context sobre Gemini behavior)

### Workflows
- **Workflow 4.5**: Pre-Implementation Gates (GATE 1 Tool Validation)
  - Checklist: "UUID explícito no TEXTO da resposta"

### CLAUDE.md Regras
- **REGRA #15**: AI Context Persistence (UUID Explícito) - espelha este ADR
- **REGRA #16**: Pre-Implementation Quality Gates (referencia REGRA #15)

### Meta-Learnings
- **ML-CONTEXT-01**: Gemini NÃO Persiste Metadados Estruturados (motivação principal)
- **ML-CONTEXT-09**: Fuzzy Match CRUD (complementar - aceita name OU UUID)

### Bugs Resolvidos
- Bug #1: Duplicação "Treino HIIT" (Gemini não reutilizou UUID)
- Bug #2: UUID fake `"some_habit_id"` (inventa em vez de reusar)
- Bug #5: Reminder error (`habit_name` vs `habit_id`)

---

## 📝 NOTAS IMPLEMENTAÇÃO

### Padrão de Código (Template)

**Todos os tools CRUD** devem seguir:

```typescript
// CREATE
export async function createEntity(args: CreateEntityArgs) {
  const uuid = crypto.randomUUID();

  const { error } = await supabase
    .from("lifetracker_entities")
    .insert({ entity_id: uuid, ...args });

  if (error) throw error;

  return JSON.stringify({
    success: true,
    entity_id: uuid,
    message: `${args.name} criada! [ID: ${uuid}]`,  // ← UUID VISÍVEL
    next_step: `Para atualizar, use: entity_id="${uuid}"`
  });
}

// UPDATE
export async function updateEntity(args: UpdateEntityArgs) {
  // args.entityIdOrName (fuzzy match - REGRA #17)
  const entity = await fuzzyMatchEntity(args.entityIdOrName, args.userId);

  const { error } = await supabase
    .from("lifetracker_entities")
    .update(args.updates)
    .eq("entity_id", entity.entity_id);

  if (error) throw error;

  return JSON.stringify({
    success: true,
    entity_id: entity.entity_id,
    message: `${entity.name} atualizada! [ID: ${entity.entity_id}]`,  // ← REFORÇA UUID
    next_step: `Para deletar, use: entity_id="${entity.entity_id}"`
  });
}

// DELETE
export async function deleteEntity(args: DeleteEntityArgs) {
  const entity = await fuzzyMatchEntity(args.entityIdOrName, args.userId);

  const { error } = await supabase
    .from("lifetracker_entities")
    .delete()
    .eq("entity_id", entity.entity_id);

  if (error) throw error;

  return JSON.stringify({
    success: true,
    message: `${entity.name} deletada! [ID removido: ${entity.entity_id}]`  // ← CONFIRMA UUID
  });
}
```

### Aplicar em (7 Tools)

1. **Habits**: `save_habit`, `update_habit`, `delete_habit`
2. **Reminders**: `create_reminder`, `update_reminder`, `delete_reminder`
3. **Goals**: `create_goal`, `update_goal`, `delete_goal`
4. **Assessments**: `create_assessment`, `update_assessment`
5. **Payments**: `create_payment_link` (já implementado)
6. **Profiles**: `update_profile`
7. **Life Areas**: Não aplicável (IDs 1-8 fixos)

### Validação (Workflow 4.5 GATE 1)

**Checklist Tool Definition**:
```markdown
- [ ] Retorno tool inclui UUID no TEXTO?
  - Verificar: `message` contém `[ID: ${uuid}]`
- [ ] `next_step` ensina formato correto?
  - Verificar: Mostra `entity_id="${uuid}"`
- [ ] Tool aceita fuzzy match (REGRA #17)?
  - Verificar: Parâmetro aceita ID OU name
```

### Testing

**Cenário 1: Criação + Atualização Sequential**
```
User: "criar hábito meditação"
Bot: "Hábito 'Meditação' criado! [ID: abc-123]"
User: "atualizar frequência para 7 dias"
Bot: [DEVE chamar update_habit(habit_id="abc-123")] ✅
```

**Cenário 2: Criação + Reminder Chaining**
```
User: "criar hábito correr e lembrete às 7h"
Bot: "Hábito 'Correr' criado! [ID: def-456]"
Bot: [DEVE chamar create_reminder(habit_id="def-456")] ✅
```

---

## 📚 REFERÊNCIAS

1. **Meta-Learning Consolidation 2025-11-13**: ML-CONTEXT-01 primary insight
2. **RCA Analysis Matrix**: 3 bugs context persistence (60%)
3. **Google Gemini Docs - Context Window**: "LLMs maintain conversational text, not structured metadata"
4. **feat-sync-crud-mandamentos**: Bug #1 (4h debugging), Bug #2, Bug #5
5. **LLM Architecture Papers**: Context window = text buffer, não database

---

**Aprovado por**: Tiago
**Data Aprovação**: 2025-11-13
**Revisão**: N/A (ADR inicial)
