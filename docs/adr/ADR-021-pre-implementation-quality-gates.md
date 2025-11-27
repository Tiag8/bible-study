# ADR-021: Pre-Implementation Quality Gates

**Status**: ✅ Aprovado
**Data**: 2025-11-13
**Contexto**: Meta-Learning Consolidation (comparação feat-sync-crud vs feat-payment-gateway)
**Decisores**: Baseado em análise de 10x diferença tempo (52h vs 5h)

---

## 📋 CONTEXTO

### Problema Identificado

**Comparação de Features**:

**feat-sync-crud-mandamentos**:
- Tempo total: 52h
- Bugs pós-código: 8 bugs
- Debugging: 20h (38% tempo total)
- Quality Gates: Reativos (Workflow 7a DEPOIS código)

**feat-payment-gateway**:
- Tempo total: 5h
- Bugs pós-código: 3 bugs (detectados ANTES código via checklist ML-15)
- Debugging: 1h (20% tempo total)
- Quality Gates: Preventivos (validação ANTES código)

**Diferença**: 10x (52h vs 5h = 47h economizadas)

### Root Cause Analysis (5 Whys)

1. **Por quê payment rápida?** → 3 bugs detectados ANTES código
2. **Por quê antes?** → Quality Gates preventivos (checklist ML-15)
3. **Por quê sync-crud lenta?** → 8 bugs detectados DEPOIS código
4. **Por quê depois?** → Gates no Workflow 7a (pós-implementation)
5. **ROOT CAUSE**: Gates reativos = debugging custoso

### Meta-Learning (ML-CONTEXT-03)

**Evidência**:
- Gates preventivos economizam 10-15h/feature
- 70% bugs detectáveis ANTES implementação
- Shift-left: Detectar → Corrigir barato vs Debugar → Corrigir caro

**Insight**: "Prevenir > Corrigir" - Gates ANTES código eliminam debugging custoso.

---

## 🎯 DECISÃO

### Criar Workflow 4.5: Pre-Implementation Quality Gates

**Posição**: ANTES Workflow 5a (Implementation)

**Ordem Workflows**:
```
Workflow 1 (Planning)
  ↓
Workflow 2a (Solutions)
  ↓
Workflow 2b (Technical Design)
  ↓
Workflow 3 (Risk Analysis)
  ↓
Workflow 4 (Setup) [DEPRECAR - mover para 0]
  ↓
>>> Workflow 4.5 (Pre-Implementation Gates) <<<  ⭐ NOVO
  ↓
Workflow 5a (Implementation)
```

### 6 Gates Obrigatórios

#### GATE 1: Tool Definition Validation (Se Gemini AI Tool)

**Quando**: Feature usa `gemini-tools-*.ts`

**Checklist**:
- [ ] Tool schema completo (name, description, parameters, required)
- [ ] Alinhamento backend (required vs DB NOT NULL)
- [ ] UUID explícito no TEXTO da resposta (ML-CONTEXT-01)
- [ ] Fuzzy match (aceita ID ou name) (ML-CONTEXT-09)

**Benefício**: Previne bugs tool definition (20% total)

**Evidência**:
- Bug #8 (sync-crud): Tool `required: []` vs DB `NOT NULL`
- Bug #1 (payment): Tool definition sem STRIPE_SECRET_KEY validation

---

#### GATE 2: Runtime Compatibility (Se Edge Function)

**Quando**: Feature modifica/cria Edge Function

**Checklist**:
- [ ] Imports Deno-compatíveis (`npm:` ou `jsr:`)
- [ ] Async pattern correto (`Deno.serve`)
- [ ] TypeScript check local (`deno check`)
- [ ] Secrets disponíveis (`supabase secrets list`)

**Benefício**: Previne bugs runtime (15% total)

**Evidência**:
- Bug #2 (payment): `addEventListener` (deprecated) vs `Deno.serve`
- Bug #5 (sync-crud): Import Node.js style quebrou deploy

---

#### GATE 3: Foreign Key Reference Validation (Se Migration com FK)

**Quando**: Migration adiciona FK

**Checklist**:
- [ ] Tabela referenciada existe
- [ ] Coluna referenciada existe
- [ ] FK aponta PK ou UNIQUE
- [ ] Prefixo correto (`lifetracker_`)

**Benefício**: Previne bugs FK (10% total)

**Evidência**:
- Bug #3 (payment): FK apontava `profiles.id` vs `profiles.user_id`
- Bug #7 (sync-crud): FK sem prefixo `lifetracker_`

---

#### GATE 4: File Size Limit (Se Arquivo > 500L)

**Quando**: Arquivo > 500 linhas

**Checklist**:
- [ ] Context decay evidence (NPR/Medium 2025)
- [ ] Divisão proposta (extrair modules)
- [ ] Alternativas (utils, constants, types)

**Benefício**: Previne context decay LLM (25% total)

**Evidência**:
- Handler 1,491L causou inconsistências
- Modularização (275L + 186L + 240L) resolveu

---

#### GATE 5: Anti-Over-Engineering

**Quando**: Feature adiciona 3+ arquivos novos

**Checklist**:
- [ ] Funcionalidade nativa não existe? (Gemini, React, Supabase)
- [ ] Gap real comprovado (teste falhou)
- [ ] Alternativas simples (prompt, config, doc)
- [ ] Red flags (parser custom, cache custom, validation layer)

**Benefício**: Previne over-engineering (10% total)

**Evidência**:
- Quase criamos parser custom (Gemini já faz NLP)
- Quase criamos cache (React Query já tem)

---

#### GATE 6: Schema-First Validation (OBRIGATÓRIO - Todas Features)

**Quando**: SEMPRE

**Checklist**:
- [ ] Script `./scripts/validate-db-sync.sh` passou
- [ ] Prefixo `lifetracker_` em todas tabelas
- [ ] RLS habilitado
- [ ] Types.ts regenerado

**Benefício**: Previne bugs schema (60% total) ⭐ MAIOR IMPACTO

**Evidência**:
- 3 bugs schema (sync-crud): PGRST204, constraint, trigger
- ADR-020 documenta detalhes

---

## 🔧 ALTERNATIVAS CONSIDERADAS

### Alternativa 1: Manter Gates Reativos (Workflow 7a) (REJEITADA)

**Prós**:
- Menos fricção (não bloqueia implementação)
- Workflow atual já existe

**Contras**:
- ❌ Detecta bugs DEPOIS código (debugging caro)
- ❌ 52h sync-crud vs 5h payment = 10x diferença
- ❌ 70% bugs detectáveis antes (desperdiçando potencial)

**Decisão**: ❌ REJEITADA - Evidências mostram ineficiência

### Alternativa 2: Adicionar Gates em Workflow 5a (REJEITADA)

**Prós**:
- Não criar workflow novo
- Gates próximos da implementação

**Contras**:
- ❌ Gates misturados com código (confusão)
- ❌ Workflow 5a já é longo (> 12k chars limite)

**Decisão**: ❌ REJEITADA - Separação de concerns melhor

### Alternativa 3: Criar Workflow 4.5 Dedicado (APROVADA) ✅

**Prós**:
- ✅ Separação clara: Validação (4.5) vs Código (5a)
- ✅ Reusável (não repetir gates em cada workflow)
- ✅ Blocking obrigatório (SE falha, não prossegue)
- ✅ 6 gates organizados por tipo

**Contras**:
- ⚠️ +1 workflow (31→32 total)
- ⚠️ Fricção adicional (15-20min validação)

**Decisão**: ✅ APROVADA - Benefício (10-15h) >> Custo (15-20min)

---

## 📊 CONSEQUÊNCIAS

### Positivas

1. **Economia Tempo**
   - Validação preventiva: 15-20min
   - Debugging evitado: 10-15h
   - **Economia líquida**: 9-14h/feature (94-97%)

2. **Redução Bugs**
   - 70% bugs detectáveis antes código
   - 8 bugs (sync-crud) → 3 bugs (payment) = -62%

3. **Shift-Left Approach**
   - Detectar ANTES implementação (barato)
   - vs Debugar DEPOIS implementação (caro)

4. **Reusabilidade**
   - 6 gates aplicáveis a TODAS features
   - Checklist consolidado (não reinventar)

### Negativas

1. **Fricção Adicional**
   - 15-20min validação obrigatória
   - Blocking (não pode pular)
   - **Mitigação**: Batch gates (3-5 paralelos)

2. **Complexidade Workflows**
   - +1 workflow (31→32 total)
   - Ordem mais longa (9→10 etapas)
   - **Mitigação**: Doc clara, cross-refs

3. **Falsos Positivos**
   - Gates podem bloquear casos válidos
   - **Mitigação**: Documentar exceções claras

---

## 🔗 RELACIONADOS

### ADRs
- **ADR-020**: Schema-First Development (GATE 6)
- **ADR-022**: AI Context Persistence (GATE 1 - UUID explícito)

### Workflows
- **Workflow 4.5**: Pre-Implementation Gates (arquivo criado)
- **Workflow 5a**: Implementation (referencia 4.5 como pré-requisito)
- **Workflow 7a**: Quality Gates (manter gates pós-código complementares)

### CLAUDE.md Regras
- **REGRA #16**: Pre-Implementation Quality Gates (espelha este ADR)
- **REGRA #8**: Source of Truth Validation (usado em GATE 6)
- **REGRA #10**: Anti-Over-Engineering (usado em GATE 5)
- **REGRA #15**: AI Context Persistence (usado em GATE 1)
- **REGRA #17**: Fuzzy Match Obrigatório (usado em GATE 1)

### Meta-Learnings
- **ML-CONTEXT-03**: Quality Gates Preventivos > Reativos (motivação principal)
- **ML-CONTEXT-01**: AI Context Persistence (GATE 1)
- **ML-CONTEXT-02**: Schema-First (GATE 6)
- **ML-CONTEXT-09**: Fuzzy Match (GATE 1)
- **ML-CONTEXT-10**: Context Decay 300+ linhas (GATE 4)

### Features Comparadas
- feat-sync-crud-mandamentos: 52h, 8 bugs (gates reativos)
- feat-payment-gateway: 5h, 3 bugs (gates preventivos)

---

## 📝 NOTAS IMPLEMENTAÇÃO

### Workflow 4.5 Structure

```markdown
# Workflow 4.5/11: Pre-Implementation Quality Gates

**O que acontece**:
- 6 Quality Gates preventivos ANTES de escrever código
- Detecta 70% bugs ANTES implementação
- Economiza 10-15h debugging/feature

**Gates**:
1. Tool Validation (se Gemini tool)
2. Runtime Compatibility (se Edge Function)
3. FK Reference (se migration com FK)
4. File Size (se arquivo > 500L)
5. Anti-Over-Engineering (sempre)
6. Schema-First (sempre - OBRIGATÓRIO)

**Aprovação**: SE TODOS aprovados → Prosseguir Workflow 5a
**Bloqueio**: SE 1+ bloqueado → PARAR, corrigir antes código
```

### Integration com Workflow 5a

Adicionar pré-requisito no topo de Workflow 5a:
```markdown
## 📚 Pré-requisito

⚠️ **OBRIGATÓRIO**: Executar Workflow 4.5 (Pre-Implementation Gates) ANTES.

**SE não executou**: ⛔ PARAR, retornar ao Workflow 4.5.
```

### Métricas de Sucesso

**Tracking** (adicionar em `.context/workflow-progress.md`):
```markdown
### Workflow 4.5: Pre-Implementation Gates
- **Gates executados**: 6
- **Gates aprovados**: X
- **Gates bloqueados**: Y
- **Tempo validação**: Zmin
- **Bugs prevenidos**: [lista]
```

---

## 📚 REFERÊNCIAS

1. **Meta-Learning Consolidation 2025-11-13**: 10 learnings sistêmicos, ML-CONTEXT-03 primary
2. **feat-sync-crud-mandamentos**: 52h, 8 bugs, gates reativos
3. **feat-payment-gateway**: 5h, 3 bugs, gates preventivos (checklist ML-15)
4. **RCA Executive Summary**: Quality Gates como solução sistêmica top 3
5. **Shift-Left Testing**: Google SRE Book - Detectar bugs early economiza 10-100x

---

**Aprovado por**: Tiago
**Data Aprovação**: 2025-11-13
**Revisão**: N/A (ADR inicial)
