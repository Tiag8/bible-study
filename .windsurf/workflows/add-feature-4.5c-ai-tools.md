---
description: Workflow 4.5c - AI/Gemini Tool Validation
auto_execution_mode: 1
---

# Workflow 4.5c: AI Tool Validation

> **Parte de**: Workflow 4.5 Pre-Implementation Gates (decomposto)
> **Pré-requisito**: GATE 0 (4.5a) APROVADO
> **QUANDO**: Feature usa Gemini AI tools

---

## 🎯 Objetivo

Validar schema de tool Gemini ANTES de codificar handler.

---

## 🛡️ GATE 1: Tool Definition Validation

### 🚨 QUANDO EXECUTAR
- Feature usa Gemini AI tools (`gemini-tools-*.ts`)
- Qualquer modificação em tool existente

### ✅ Checklist

**1. Tool Schema Completo**
- [ ] `name` descritivo (ex: `save_habit`, não `save`)
- [ ] `description` clara (50-100 chars)
- [ ] `parameters` com tipos corretos
- [ ] `required` array define campos obrigatórios

**2. Alinhamento Backend**
```bash
# Verificar DB schema
./scripts/validate-db-sync.sh

# Query direto se necessário
mcp__supabase_lifetracker__execute_sql "
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'lifetracker_habits'
ORDER BY ordinal_position;
"
```

**3. UUID Explícito (ML-CONTEXT-01)**
- [ ] Retorno tool inclui UUID no TEXTO
```typescript
// ✅ CORRETO
message: `Hábito criado! [ID: ${uuid}]`

// ❌ ERRADO
{ habit_id: uuid }  // LLM não vê
```

**4. Fuzzy Match CRUD (ML-CONTEXT-09)**
- [ ] Tool aceita ID OU name (busca fuzzy)
```typescript
const habit = await fuzzyMatchHabit(habitIdOrName, userId);
```

**5. customSystemPrompt Usage (fix-coach-web)**
```bash
# Validar que customSystemPrompt definido é usado
./scripts/validate-custom-system-prompt-usage.sh
```

**6. Token Budget (ADR-023)**
```bash
# Validar system prompt < 9000 tokens
./scripts/validate-gemini-token-budget.sh
```
- [ ] System prompt < 9000 tokens
- [ ] Target: 8000-8500 (margem segurança)

### 🔴 BLOQUEIO

**SE 1+ check FALHOU**: ⛔ PARAR. Ajustar tool definition ANTES de codificar.

---

## 🛡️ GATE 2: Approval Queue Validation (REGRA #45) 🆕

### 🚨 QUANDO EXECUTAR
- Feature usa AI para decisões que podem ir para aprovação humana
- Qualquer implementação de human-in-the-loop
- Threshold de confiança para auto-aprovar vs revisar

### ✅ Checklist

**1. Interface de Revisão**
- [ ] Interface de revisão existe ANTES de produção?
- [ ] SE não vai existir: NÃO implementar approval queue

**2. Configuração de Threshold**
- [ ] CONFIDENCE_THRESHOLD inicial é baixo (0.2-0.3)?
- [ ] Plano para ajustar com dados reais?

**3. Expiração**
- [ ] expires_at é curto (≤ 24h)?
- [ ] Job de auto-expire implementado?
- [ ] Fallback definido para items expirados?

**4. Monitoring**
- [ ] Dashboard/alerting se fila crescer?
- [ ] Métricas de items pendentes visíveis?

### 🔴 BLOQUEIO

**SE "Interface depois"**: ⛔ PARAR. Implementar interface OU remover approval queue.

**SE threshold > 0.5 sem interface**: ⛔ PARAR. Baixar threshold para 0.2-0.3.

### Evidência

RCA-037: 90% candidatos bloqueados 4+ dias por pending approvals sem interface.

---

## 📝 Log

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 1: Tool Validation - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 📚 Referências

- **ADR-023**: Gemini Token Limit (9000)
- **ADR-018**: NLP-First Habit Creation
- **Guide**: `docs/guides/GEMINI-PROMPT-INTERPRETATION-TESTING.md`
- **Memory**: `~/.claude/memory/gemini-core.md` (ou `gemini-*.md`)

---

**Versão**: 1.1.0 | **Origem**: Decomposição Workflow 4.5 (Pareto fix-coach-web)

**Changelog v1.1.0** (2025-12-26): Adicionado GATE 2 - Approval Queue Validation (REGRA #45, RCA-037)
