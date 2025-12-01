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
**Próximo**: Workflow 3 (Risk Analysis)
