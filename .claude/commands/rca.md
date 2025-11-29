# Root Cause Analysis (RCA) - Metodologia Completa

## 🎯 OBJETIVO

Encontrar **CAUSA RAIZ** (não sintomas) + **ERROS SILENCIOSOS** usando checklist sistemático e generalista.

**Regra de Ouro**: Se a solução não previne recorrência, NÃO é solução - é band-aid.

---

## 📋 FASE 1: Análise Inicial (5 Whys)

Execute **5 Whys** para cada problema relatado:

1. **Por quê** [sintoma visível]?
2. **Por quê** [resposta 1]?
3. **Por quê** [resposta 2]?
4. **Por quê** [resposta 3]?
5. **CAUSA RAIZ**: [resposta 4]

**Output esperado**: Tabela com sintomas → causas raiz mapeadas

**Exemplo**:
```
Sintoma: "Botão não funciona"
1. Por quê não funciona? → onClick não dispara
2. Por quê não dispara? → Event listener não registrado
3. Por quê não registrado? → Component não montou
4. Por quê não montou? → Erro no render (exception silenciosa)
5. CAUSA RAIZ: Try-catch mascarando erro de render
```

---

## 🔍 FASE 2: Busca de Erros Silenciosos

**CRÍTICO**: Não confiar apenas no sintoma relatado. Buscar ATIVAMENTE por erros ocultos.

### 2.1 Code Patterns Perigosos (GENERALISTA)

#### A. Operações Críticas Sem Validação

**Buscar no código**:
```bash
# Database/API operations sem error handling
grep -r "\.insert(" | grep -v "error"
grep -r "\.update(" | grep -v "error"
grep -r "\.delete(" | grep -v "error"
grep -r "await fetch(" | grep -v "catch"
grep -r "\.save(" | grep -v "error"
```

**Checklist**:
- [ ] Todas operações críticas validam `error` ou `catch`?
- [ ] Erros **param execução** OU apenas logam?
- [ ] User recebe mensagem clara se operação falha?
- [ ] Sistema monitora/alerta erros críticos?

**Padrão Perigoso**:
```typescript
// ❌ RUIM - erro apenas logado, execução continua
const { error } = await db.insert(data);
if (error) console.error(error);  // ⚠️ Data loss silencioso!

// ✅ BOM - erro para execução
const { error } = await db.insert(data);
if (error) {
  await notifyUser('Erro ao salvar');
  return { status: 'error', message: error.message };
}
```

---

#### B. Spread Operator Sobrescrevendo Dados

**Buscar no código**:
```bash
grep -r "\.\.\." | grep -E "data|fields|state|props"
```

**Checklist**:
- [ ] Spread usa **merge explícito** OU sobrescreve cegamente?
- [ ] Há validação de `undefined`/`null`/valores inválidos?
- [ ] Campos críticos são **preservados** após spread?

**Padrão Perigoso**:
```typescript
// ❌ RUIM - newData sobrescreve campos existentes
const updated = { ...existingData, ...newData };

// ✅ BOM - merge explícito com validação
const merged = {
  ...existingData,
  ...Object.fromEntries(
    Object.entries(newData).filter(([k, v]) => v !== undefined)
  )
};
```

---

#### C. Fallbacks Perigosos (`|| {}`, `|| []`)

**Buscar no código**:
```bash
grep -r "|| {}"
grep -r "|| \[\]"
grep -r "?? {}"
```

**Checklist**:
- [ ] Fallback **MASCARA** erro real?
- [ ] Deveria **ABORTAR** ao invés de usar fallback vazio?
- [ ] Objeto/array vazio causa bugs **downstream**?

**Padrão Perigoso**:
```typescript
// ❌ RUIM - fallback {} mascara query failure
const user = fetchUser() || {};
const name = user.name;  // undefined silencioso!

// ✅ BOM - abortar se fetch falha
const user = fetchUser();
if (!user) throw new Error('User not found');
const name = user.name;
```

---

#### D. Queries Database Sem Proteção

**Buscar no código**:
```bash
grep -r "\.single()"
grep -r "\.first()"
grep -r "SELECT.*LIMIT"
```

**Checklist**:
- [ ] `.single()` tem `.limit(1)` + `.order()` antes?
- [ ] Se múltiplos registros, query **falha** ou retorna **aleatório**?
- [ ] Deveria usar `.maybeSingle()` para casos opcionais?

**Padrão Perigoso**:
```typescript
// ❌ RUIM - .single() falha se múltiplos registros
const { data } = await db.from('users').select().eq('email', x).single();

// ✅ BOM - limit + order para determinismo
const { data } = await db.from('users')
  .select()
  .eq('email', x)
  .order('created_at', { ascending: false })
  .limit(1);
```

---

### 2.2 Database Integrity (GENERALISTA)

#### A. NOT NULL Constraints

**Buscar schema vs código**:
```bash
# Buscar constraints no schema
grep -r "NOT NULL" db/schema/ migrations/

# Verificar se código valida ANTES de INSERT
grep -r "INSERT INTO" | grep -v "validate"
```

**Checklist**:
- [ ] Todos campos NOT NULL são **validados ANTES** de INSERT?
- [ ] Schema permite NULL MAS lógica **assume NOT NULL**?
- [ ] Há DEFAULT values que **conflitam** com validação?

---

#### B. Foreign Keys

**Buscar no schema**:
```bash
grep -r "FOREIGN KEY\|REFERENCES"
```

**Checklist**:
- [ ] Foreign keys validadas **ANTES** de INSERT?
- [ ] Se FK falha, user recebe **mensagem clara**?
- [ ] `ON DELETE CASCADE/SET NULL` configurado **corretamente**?

---

#### C. ENUMs e Constraints

**Buscar no schema**:
```bash
grep -r "ENUM\|CHECK\|CONSTRAINT"
```

**Checklist**:
- [ ] Valores ENUM/CHECK validados **antes** de INSERT?
- [ ] Código pode inserir valores **inválidos** (typos, case-sensitive)?
- [ ] Há validação **TypeScript + DB-side** (defense in depth)?

---

#### D. Tabelas/Colunas Órfãs

**Buscar tabelas não usadas**:
```bash
# Listar todas tabelas
grep -r "CREATE TABLE" migrations/

# Buscar uso no código
for table in $(list_tables); do
  grep -r "from('$table')" src/ || echo "❌ $table NÃO USADA"
done
```

**Checklist**:
- [ ] Todas tabelas/colunas são **usadas no código**?
- [ ] Tabelas vazias são **features futuras** OU **órfãs**?
- [ ] DROP tables não usadas OU **documentar propósito**?

---

### 2.3 Concurrency & Race Conditions (GENERALISTA)

#### A. Concurrent Updates

**Buscar operações de escrita**:
```bash
grep -r "\.update("
grep -r "\.save("
grep -r "SET.*WHERE"
```

**Checklist**:
- [ ] Se 2 requests **simultâneos**, dados são sobrescritos?
- [ ] Há **optimistic locking** (verificar `updated_at`, `version`)?
- [ ] **Transações DB** garantem atomicidade?

**Padrão Perigoso**:
```typescript
// ❌ RUIM - race condition entre read e write
const data = await db.get(id);
data.count += 1;
await db.update(id, data);  // Outro request pode ter atualizado no meio!

// ✅ BOM - operação atômica
await db.update(id).increment('count', 1);

// ✅ BOM - optimistic locking
await db.update(id, data).where('updated_at', oldTimestamp);
```

---

#### B. Duplicate Detection

**Buscar operações de criação**:
```bash
grep -r "\.insert("
grep -r "\.create("
grep -r "INSERT INTO"
```

**Checklist**:
- [ ] Se 2 INSERTs **simultâneos**, há duplicatas?
- [ ] Constraints **UNIQUE** previnem duplicatas no DB?
- [ ] Código detecta e **trata** duplicatas (idempotência)?

---

### 2.4 State Machines & Flow Logic

**Buscar gerenciamento de estado**:
```bash
grep -r "state.*=\|setState\|status.*="
grep -r "switch.*state\|if.*status"
```

**Checklist**:
- [ ] State transitions são **válidas** (não há deadlock)?
- [ ] Edge cases cobertos (user pula etapa, envia input inválido)?
- [ ] Recovery de falhas OK (retry logic, fallbacks)?
- [ ] Há validação **"não voltar para estado anterior"** se necessário?

**Padrão Perigoso**:
```typescript
// ❌ RUIM - pode voltar para estado inválido
if (input === 'name') setState('asking_name');

// ✅ BOM - validar se estado permite transição
if (input === 'name' && !alreadyAskedName) setState('asking_name');
```

---

## 🎭 FASE 3: Devil's Advocate (Atacar Soluções)

**Para CADA fix proposto**, atacar com perguntas críticas:

### Template de Ataque

#### 1. E se valor edge case?
- String vazia `""`?
- Zero `0`?
- Null/Undefined?
- Array vazio `[]`?
- Objeto vazio `{}`?
- Número negativo?
- Infinity/NaN?

#### 2. E se falhar SEMPRE?
- Query sempre retorna NULL (RLS bug, permissions)?
- API sempre retorna 503/timeout?
- DB sempre em manutenção?
- Network sempre offline?

#### 3. E se concorrência?
- 2 requests simultâneos?
- 10 requests simultâneos?
- 1000 requests simultâneos (DDoS)?
- Race condition possível?

#### 4. E se escala 10x?
- 10x mais tráfego (performance degrada)?
- 10x mais dados (memory overflow)?
- 10x mais custo (budget explode)?

#### 5. E se premissa inválida?
- Schema/API muda sem aviso?
- Credenciais revogadas?
- Usuário mal-intencionado (injection, XSS)?
- Dependência externa quebra?

### Exemplo de Uso

**Solução proposta**: "Adicionar retry se API falha"

**Devil's Advocate**:
- ❌ E se API **SEMPRE** falha? Retry infinito?
- ❌ E se cada retry **demora 30s**? User espera 5min?
- ❌ E se retry **custa $$$**? Budget explode?
- ❌ E se erro **não é retryable** (400 Bad Request)? Desperdiça recursos?

**Solução melhorada**: "Retry com exponential backoff, max 3 tentativas, apenas para erros 503/429, timeout 5s"

---

## 📊 FASE 4: Priorização (Impact Matrix)

**Classificar TODOS os bugs encontrados**:

| # | Bug Descoberto | Severidade | Impacto | Esforço | Prioridade |
|---|----------------|------------|---------|---------|------------|
| 1 | [Bug 1] | P0 | Alto | Baixo | **CRÍTICO** |
| 2 | [Bug 2] | P1 | Médio | Alto | **HIGH** |
| 3 | [Bug 3] | P2 | Baixo | Baixo | **MEDIUM** |
| ... | ... | ... | ... | ... | ... |

**Critérios de Severidade**:
- **P0 Blocker**: Data loss, security breach, crash/downtime
- **P1 High**: UX ruim, performance degradada, cost explosion
- **P2 Medium**: Edge cases, minor bugs, código feio
- **P3 Low**: Cleanup, refactoring, melhorias futuras

**Priorização Final**:
1. **Sprint 1** (URGENTE): Todos P0
2. **Sprint 2** (48h): Todos P1
3. **Backlog**: P2 e P3

---

## 🧪 FASE 5: Testes Obrigatórios

**NUNCA deploy sem testes de regressão**!

### Template de Teste

```typescript
describe('Bug Fix: [descrição curta]', () => {
  it('DEVE prevenir regressão: [cenário que causou bug]', () => {
    // 1. SETUP: simular condição que causou bug
    const bugCondition = setupBugScenario();

    // 2. ACT: executar código corrigido
    const result = executeFixedCode(bugCondition);

    // 3. ASSERT: verificar bug NÃO ocorre
    expect(result).not.toHaveError();
    expect(result.data).toBeDefined();
  });

  it('DEVE tratar edge case: [cenário edge case]', () => {
    // Testar cenários descobertos no Devil's Advocate
  });
});
```

**Checklist**:
- [ ] **1 teste** para CADA bug corrigido?
- [ ] Teste cobre **edge cases** (Devil's Advocate)?
- [ ] Teste **FALHA ANTES** do fix, **PASSA DEPOIS**?
- [ ] Teste é **determinístico** (não flaky)?

---

## 📝 FASE 6: Output Final

**RCA Completo deve conter**:

### 1. Tabela 5 Whys
```markdown
| Sintoma | Why 1 | Why 2 | Why 3 | Why 4 | Causa Raiz |
|---------|-------|-------|-------|-------|------------|
| [S1] | [W1] | [W2] | [W3] | [W4] | **[ROOT]** |
```

### 2. Lista Erros Silenciosos
```markdown
## Erros Silenciosos Descobertos

1. **[Erro 1]**: [Descrição + localização código]
   - **Padrão**: [Code pattern perigoso]
   - **Impacto**: [Consequência se não corrigir]

2. **[Erro 2]**: ...
```

### 3. Devil's Advocate Attacks
```markdown
## Ataques às Soluções Propostas

**Fix #1**: [Descrição da solução]
- ❌ E se [cenário edge case]?
- ❌ E se [cenário falha]?
- ✅ **Solução melhorada**: [Como mitigar ataques]
```

### 4. Impact Matrix
```markdown
## Priorização de Bugs

[Tabela completa com 4 colunas]

**Sprint 1 (P0)**: [Lista bugs críticos]
**Sprint 2 (P1)**: [Lista bugs high]
```

### 5. Plano de Testes
```markdown
## Testes de Prevenção de Regressão

- [ ] Test: [Bug 1 - cenário]
- [ ] Test: [Bug 2 - cenário]
- [ ] Test: [Edge case 1]
```

### 6. Estimativa Esforço
```markdown
## Roadmap de Implementação

**Sprint 1** (8h):
- Fix #1 (2h)
- Fix #2 (3h)
- Tests (3h)

**Sprint 2** (6h):
- Fix #3 (4h)
- Tests (2h)

**Total**: 14h
```

### 7. Métricas de Sucesso
```markdown
## Before vs After

**ANTES** (bugs ativos):
- ❌ Métrica 1: [valor ruim]
- ❌ Métrica 2: [valor ruim]

**DEPOIS** (bugs corrigidos):
- ✅ Métrica 1: [valor bom]
- ✅ Métrica 2: [valor bom]

**ROI**: [Horas economizadas vs investidas]
```

---

## 🎯 FASE 7: Meta-Learning

**Após completar RCA, documentar aprendizado**:

### Perguntas de Reflexão
1. Que **padrão de bug** foi descoberto (generalizar)?
2. Como **prevenir** no futuro (checklist, linter, CI)?
3. Bug é **recorrente** neste projeto (adicionar ao RCA)?
4. Ferramenta/processo **faltou** (monitoring, alerting, testing)?

### Documentar em
- `docs/debugging-cases/YYYY-MM-DD-[tema].md` (caso específico)
- `docs/meta-learning/bug-pattern-[X].md` (padrão generalizado)
- Atualizar `.claude/commands/rca.md` se descobrir novo checklist

---

## 🔄 Exemplos de Uso

### Exemplo 1: Bug de Performance
```markdown
**Sintoma**: Página demora 10s para carregar

**5 Whys**:
1. Por quê demora? → 50 queries SQL
2. Por quê 50 queries? → N+1 problem
3. Por quê N+1? → ORM não usa JOIN
4. Por quê não usa? → Relacionamento não configurado
5. **CAUSA RAIZ**: Schema migration incompleta

**Erros Silenciosos**:
- 15 outras tabelas COM O MESMO PROBLEMA (grep revelou)

**Fix**: Adicionar JOIN + eager loading
**Test**: Verificar queries < 5 por request
```

### Exemplo 2: Bug de Segurança
```markdown
**Sintoma**: User A vê dados de User B

**5 Whys**:
1. Por quê vê? → Query não filtra por userId
2. Por quê não filtra? → WHERE clause faltando
3. Por quê faltou? → RLS policy desabilitada
4. Por quê desabilitada? → Migration não aplicada em prod
5. **CAUSA RAIZ**: Processo de deploy sem validação de migrations

**Erros Silenciosos**:
- 8 outras tabelas SEM RLS (grep revelou)

**Fix**: Habilitar RLS + adicionar policy
**Test**: Tentar acessar dados de outro user (deve falhar)
```

---

## 📚 Referências

- **5 Whys**: Toyota Production System (Taiichi Ohno)
- **Devil's Advocate**: Red Team thinking
- **Impact Matrix**: Eisenhower Matrix adaptado
- **Code Patterns**: OWASP Top 10, CWE Top 25

---

**Versão**: 2.0 (2025-11-07)
**Changelog**: Expandido de 13 linhas → 400+ linhas com checklists generalistas
**Baseado em**: Ultra Think Analysis - 7 erros silenciosos descobertos em WhatsApp Onboarding
**Autor**: Claude Code + Tiago (feedback generalista)
