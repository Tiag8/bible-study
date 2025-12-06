---
description: Workflow 2b - Technical Design & Validation
auto_execution_mode: 1
---

## Pré-requisito

← [Workflow 2a - Solutions](.windsurf/workflows/add-feature-2a-solutions.md)

Ler: `docs/PLAN.md`, `docs/TASK.md`, `.claude/CLAUDE.md`

---

## PRE-REQUISITO: GATE 1 Reframing (CSF)

```bash
./scripts/validate-gate-1-executed.sh
```

**SE REJEITADO** (exit 1): ⛔ Retornar Workflow 1 → Fase 1.5

---

## FASE 0.1: EXTERNAL VALIDATION (Pontos Cegos) 🆕

**Objetivo**: Identificar riscos e problemas que outros já enfrentaram. Prevenir vieses de planejamento.

### Pesquisa Obrigatória (3-5 min)

**Fontes a consultar** (usar WebSearch/WebFetch):
1. **GitHub Issues**: `site:github.com [tecnologia] [problema] issue`
2. **Stack Overflow**: `site:stackoverflow.com [tecnologia] [erro comum]`
3. **Reddit**: `site:reddit.com [tecnologia] problems OR issues OR gotchas`

**Perguntas a responder**:
- [ ] "Que problemas outros tiveram com [tecnologia/abordagem]?"
- [ ] "O que pode dar errado que não estou vendo?"
- [ ] "Quais são os gotchas/armadilhas comuns?"

### Output Obrigatório

Documentar em `.context/{branch}_decisions.md`:
```markdown
## External Validation (Workflow 2b)
**Data**: [timestamp]
**Tecnologias pesquisadas**: [lista]

### Riscos Identificados
1. [Risco 1]: [fonte] → [mitigação]
2. [Risco 2]: [fonte] → [mitigação]

### Padrões Encontrados
- [Padrão 1]: [como aplicar]
- [Padrão 2]: [como aplicar]

### Fontes Consultadas
- [URL 1]: [resumo]
- [URL 2]: [resumo]
```

**SE zero riscos encontrados**: ⚠️ Pesquisar mais ou documentar "Tecnologia madura, sem gotchas conhecidos"

---

## FASE 0.2: MEMORY AUDIT (Consulta Intencional) 🆕

**Objetivo**: Garantir que conhecimento existente seja aplicado. Evitar erros repetidos.

### Mapeamento de Domínios

**Identificar domínios da feature**:
```bash
# Listar domínios tocados (marcar todos aplicáveis)
DOMINIOS=""
# [ ] whatsapp/webhook → uazapi.md
# [ ] gemini/ai/tool → gemini.md
# [ ] supabase/RLS/migration → supabase.md
# [ ] deploy/docker → deployment.md
# [ ] edge/deno → edge-functions.md
# [ ] react/frontend → frontend.md
# [ ] git/commit → git.md
# [ ] security/auth → security.md
# [ ] prompt/few-shot → prompt.md
# [ ] workflow/gate → workflow.md
# [ ] debug/rca → debugging.md
```

### Leitura OBRIGATÓRIA (não depender de keywords)

**Para CADA domínio identificado**:
```bash
# Ler arquivo de memory correspondente
cat ~/.claude/memory/[dominio].md

# OU usar Read tool
Read ~/.claude/memory/[dominio].md
```

### Extração de Conhecimento

**Para cada memory file lido, extrair**:
- [ ] Erros conhecidos relevantes à feature
- [ ] Padrões a seguir
- [ ] Anti-patterns a evitar
- [ ] Checklists aplicáveis

### Output Obrigatório

Documentar em `.context/{branch}_decisions.md`:
```markdown
## Memory Audit (Workflow 2b)
**Data**: [timestamp]
**Arquivos consultados**: [lista]

### Erros Conhecidos Relevantes
1. [Erro de memory/X.md]: [como evitar nesta feature]

### Padrões a Aplicar
1. [Padrão de memory/Y.md]: [onde aplicar]

### Checklists Extraídos
- [ ] [Item 1 de memory/Z.md]
- [ ] [Item 2 de memory/Z.md]
```

### Validação (Script)

```bash
./scripts/validate-memory-consulted.sh
```

**SE REJEITADO**: ⛔ Ler arquivos faltantes antes de prosseguir

---

## FASE 0: LOAD CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
./scripts/context-load-all.sh $BRANCH_PREFIX
```

---

## FASE 0.5: GAP ANALYSIS (OBRIGATÓRIO)

**Pergunta**: "Quanto % do código JÁ EXISTE para esta feature?"

```bash
./scripts/validate-gap-analysis.sh
```

**Target**: 90%+ reuso = ✅ IDEAL | 70-89% = ⚠️ OK | < 70% = 🔴 INVESTIGAR

**Documentar em decisions.md**:
```markdown
## Workflow 2b: Gap Analysis
- Backend reuso: XX%
- Frontend reuso: XX%
- Schema: OK/Migrations
- Deps novas: ZERO
```

---

## REGRA: 5 AGENTES OBRIGATÓRIOS

**SEMPRE executar em PARALELO**:

1. **Agent Schema**: DB schema, prefixos, RLS, migrations
2. **Agent Trigger**: PostgreSQL triggers, sync cross-channel
3. **Agent Backend**: Edge Functions, APIs, webhooks
4. **Agent Frontend**: Componentes React, hooks, state
5. **Agent Testing**: Cenários E2E, unit, RCA preventivo

**Output**: `.context/{branch}_technical-design-agent-[1-5]-*.md`

---

## FASE 3: DESIGN TÉCNICO

### 3.1. Pré-Design: DB Sync

```bash
./scripts/validate-db-sync.sh
./scripts/regenerate-supabase-types.sh
```

### 3.1.5. Schema Discovery (SE feature usa DB) 🆕

**Objetivo**: Consultar schema REAL antes de desenhar SQL. Prevenir suposições de nomes de colunas.

**Quando executar**: Feature envolve SELECT/INSERT/UPDATE/CREATE FUNCTION em tabelas existentes.

**Protocolo Obrigatório**:

1. **Listar tabelas que serão usadas**:
```markdown
Tabelas envolvidas nesta feature:
- lifetracker_profiles
- lifetracker_habits
- lifetracker_[outras]
```

2. **Consultar colunas via MCP** (OBRIGATÓRIO para cada tabela):
```sql
-- Via mcp__supabase_lifetracker__execute_sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lifetracker_TABELA'
ORDER BY ordinal_position;
```

3. **Documentar em `.context/{branch}_decisions.md`**:
```markdown
## Schema Discovery (Workflow 2b - Fase 3.1.5) ✅

**Tabelas consultadas:**
| Tabela | Colunas Relevantes |
|--------|-------------------|
| lifetracker_habits | id, user_id, name, current_streak, longest_streak |
| lifetracker_profiles | user_id, journey_state, journey_metadata |

**Colunas que VOU usar no design:**
- lifetracker_habits.current_streak ✅ (existe)
- lifetracker_habits.longest_streak ✅ (existe)

**Colunas que NÃO existem (evitar no design):**
- ❌ streak_count (não existe, usar current_streak)
```

**Checklist**:
- [ ] Listei todas tabelas que vou usar?
- [ ] Consultei information_schema para CADA tabela?
- [ ] Documentei colunas disponíveis?
- [ ] Evitei assumir nomes por convenção?

**SE SKIP**: ⚠️ Alto risco de erro em Workflow 5a (ex: column not found)

**ROI**: 3-5 min agora vs 15-60 min debug depois (5-20x)

---

### 3.2. Duplication Check (OBRIGATÓRIO)

```bash
# Buscar implementações similares
grep -r "parse\|extract\|transform" supabase/functions/_shared/
grep -r "cache\|stale\|invalidate" src/hooks/
```

- [ ] Grepei codebase?
- [ ] Testei solução atual e FALHOU?
- [ ] Consultei docs oficiais?

**SE duplicação**: ⛔ CANCELAR, usar existente

### 3.3. Arquitetura Detalhada

```markdown
**Componentes**: [lista]
**Hooks**: [lista]
**Database Changes**: [SQL]
**API/Queries**: [TypeScript]
**Fluxo de Dados**: [diagrama]
```

### 3.4. Dependências (4 passos)

1. Check Current: `cat package.json | jq '.dependencies'`
2. Verify Versions: `npm info @package version`
3. Suggest 2-3 Options (incluir "usar existente")
4. Comparison Table

---

## FASE 3.5: GATE Anti-Over-Engineering

```bash
./scripts/validate-yagni.sh "Feature X" "Solução Y"
```

**SE REJEITADO**: Retornar Fase 2 → Reprojetar

---

## FASE 4: VALIDAÇÃO

### Checklist Viabilidade

- [ ] Stack compatível (React 18.3 + TS 5.8 + Vite + Supabase)?
- [ ] Performance targets atingíveis (< 2s dashboard)?
- [ ] Segurança OK (RLS, secrets)?
- [ ] Custos AI ($11-15/mês)?
- [ ] Não quebra features existentes?

### Checklist YAGNI/KISS

- [ ] Design resolve problema REAL?
- [ ] Existe design mais SIMPLES?
- [ ] Complexidade justificada por EVIDÊNCIA?
- [ ] Posso validar com POC (10% código)?

**Red Flags**: > 3 camadas abstração, otimização prematura

---

## ADR (SE NECESSÁRIO)

```bash
ls -1 docs/adr/ | tail -1  # Último número
```

**Criar SE**: Decisão arquitetural significativa, trade-off importante, padrão novo

---

## FASE FINAL: UPDATE CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')

# Atualizar workflow-progress.md
cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 2b: Technical Design ✅
- **Data**: $TIMESTAMP
- **Gap Analysis**: [XX]% reuso
- **5 Agentes**: Executados
- **ADR**: [ADR-XXX ou N/A]
- **Next**: Workflow 3 (Risk Analysis)
EOF

# Log em attempts.log
echo "[$TIMESTAMP] WORKFLOW: 2b - Design completo" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## Checklist Final

- [ ] **GATE 1**: Reframing validado?
- [ ] **Fase 0.1**: External Validation executado? (Pontos cegos pesquisados)
- [ ] **Fase 0.2**: Memory Audit executado? (Arquivos relevantes lidos)
- [ ] **Fase 0.5**: Gap Analysis documentado?
- [ ] **5 Agentes**: Executados em paralelo?
- [ ] **Fase 3**: Design + Duplication Check?
- [ ] **Fase 3.5**: YAGNI aprovado?
- [ ] **Fase 4**: Viabilidade confirmada?
- [ ] **ADR**: Criado (se necessário)?
- [ ] **.context/**: Atualizado?

---

## REGRA ANTI-ROI

**NUNCA**: ROI, tempo, "horas economizadas"
**PERMITIDO**: Evidências concretas, métricas técnicas

---

**Versão**: 2.0 (Otimizado)

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 3] - Risk Analysis**: Design técnico aprovado → identificar e mitigar riscos antes de implementar.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| Feature trivial, riscos óbvios | 4.5 (Pre-Implementation) | Pular risk analysis se < 100 linhas código |
| Gap Analysis < 70% reuso | 1 (Planning) | Voltar para reframing - solução muito complexa |
| Design requer validação técnica | ultra-think | Análise profunda antes de riscos |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| GATE 1 não executado | 1 Fase 1.5 | Reframing obrigatório antes de design |
| Solução escolhida inviável | 2a (Solutions) | Escolher outra solução |
| Gap Analysis < 70% | 1 (Planning) | Re-planejar com escopo menor |

### Regras de Ouro
- ⛔ **NUNCA pular**: Gap Analysis 90%+ é target - investigar se < 70%
- ⚠️ **GATE 1 obrigatório**: validate-gate-1-executed.sh DEVE passar
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto

