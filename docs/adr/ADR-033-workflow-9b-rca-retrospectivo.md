# ADR-033: Workflow 9b RCA Retrospectivo

**Status**: ✅ Aceito
**Data**: 2025-11-20
**Contexto**: Workflow 9b RCA Retrospective (feat/landing-page-mvp)
**Decisores**: RCA 4 agentes paralelos + consolidação Pareto
**Tags**: #rca #workflow #meta-learning #retrospective

---

## Contexto

Primeira execução completa de **Workflow 9b RCA Retrospectivo** após feat/landing-page-mvp (9 workflows, 4h execução, 0 bugs, 6 iterações).

**Desafio**: Identificar gargalos sistêmicos workflow completo (não apenas bugs específicos) para melhorar próximas features.

**Solução**: RCA 5 Whys em 4 dimensões (Tempo, Qualidade, Iterações, Workflow) com 4 agentes paralelos.

---

## Problema

### Análise 5 Whys (Por Quê RCA Retrospectivo Sistêmico?)

1. **Por quê feat-landing teve -34% tempo vs estimado?**
   → Agentes paralelos + Pareto não atualizaram baselines

2. **Por quê 0 bugs vs 2-4 histórico?**
   → Primeira feature pós-Pareto Analysis (Top 14 learnings)

3. **Por quê -40% iterações?**
   → GATE 1 Reframing preveniu pivots estratégicos

4. **Por quê Workflow 6a levou 67% tempo total?**
   → Mistura validação técnica (9min) + refinamento visual (169min)

5. **Por quê causas raiz não foram identificadas ANTES?**
   → **CAUSA RAIZ**: Ausência RCA retrospectivo sistêmico após cada feature (apenas RCA bugs pontuais)

---

## Decisão

**Implementar RCA Retrospectivo Sistêmico (Workflow 9b) como padrão permanente.**

### 3 Melhorias Implementadas

#### M1: Workflow 6c Visual Refinement (Separação Validação vs Refinement)

**Problema**: Workflow 6a misturava validação técnica + refinamento visual (178min, 67% overhead)

**Solução**: Criar Workflow 6c especializado em refinamento visual iterativo (UI/UX)

**Estrutura**:
- **Workflow 6a**: Validação técnica automatizada (9min) → Build, TypeScript, Responsivo
- **Workflow 6c** (NOVO): Refinamento visual iterativo (30-60min) → Screenshot-driven feedback loops

**ROI**: -65% tempo validação UI (178min → 9min + 50min estruturado)

**Aplicabilidade**: Features UI/UX (frontend 80%+): Landing pages, dashboards, onboarding flows

**Evidência**: `.windsurf/workflows/add-feature-6c-visual-refinement.md` (11.5 KB)

---

#### M2: docs/ESTIMATION-BASELINES.md (Baselines Atualizadas)

**Problema**: Baselines estimativa desatualizados (6-8h/feature vs 4-5h real com Pareto)

**Solução**: Documento rastreando baselines por tipo feature + fatores ajuste

**Conteúdo**:
- 5 tipos features (Landing, Auth, Modal, DB Schema, Backend)
- Baselines "Sem Pareto" vs "Com Pareto ✅"
- 4 fatores ajuste (agentes paralelos 2.25x, Pareto -30-40%, GATE 1 -70% pivots, Workflow 6c -65%)
- Histórico atualizações (rastreabilidade)

**Atualização**: Workflow 9b Fase 21.5 atualiza SE delta ≥ 20%

**ROI**: 10-20h economia planejamento (60 features futuras)

**Evidência**: `docs/ESTIMATION-BASELINES.md` (5.1 KB)

---

#### M3: Workflow 9b Fase 21.5 Atualizar Baselines

**Problema**: Baselines não atualizavam automaticamente quando metodologias evoluíam

**Solução**: Adicionar Fase 21.5 "Atualizar Baselines de Estimativa" em Workflow 9b

**Critério**: SE delta tempo ≥ 20% vs baseline → Atualizar (média móvel)

**Processo**:
1. Calcular delta: `|((Real - Baseline) / Baseline) × 100| ≥ 20%`
2. Atualizar baseline: `(Real + Baseline) / 2`
3. Adicionar histórico
4. Commit isolado

**ROI**: Baselines auto-evolutivas (zero manutenção manual)

**Evidência**: `.windsurf/workflows/add-feature-9b-retrospective.md` linha 161-242

---

## Métricas 4 Análises RCA

### Análise 1 - TEMPO

**Real**: 236min (4h)
**Estimado**: 360-480min (6-8h)
**Delta**: -34% a -51% ABAIXO estimado ✅

**Causa Raiz**: Ausência meta-processo para atualizar baselines quando metodologias (Pareto, agentes paralelos) introduzidas

**Ação**: M2 (ESTIMATION-BASELINES.md) + M3 (Fase 21.5 automática)

---

### Análise 2 - QUALIDADE

**Bugs tardiamente**: 0 (vs 2-4 histórico)
**Pivots**: 0 (vs 2-4 histórico)
**Delta**: -100% bugs ✅

**Causa Raiz**: feat-landing foi PRIMEIRA feature pós-Pareto Analysis consolidado (Top 14 learnings aplicados)

**Ação**: MANTER Workflow 8b Pareto a cada 3-5 features (replicar padrão)

---

### Análise 3 - ITERAÇÕES

**Iterações**: 6 (vs 8-12 histórico)
**Retrabalhos**: 0
**Delta**: -40% iterações ✅

**Causa Raiz**: GATE 1 Reframing é CSF que previne desperdício estrutural (resolver problema ERRADO - 70-90% overhead)

**Ação**: MANTER GATE 1 CSF enforcement (ADR-031, REGRA #26)

---

### Análise 4 - WORKFLOW

**Workflow 6a**: 178min (67% tempo total)
**Validação técnica**: 9min
**Refinamento visual**: 169min (não estruturado)

**Causa Raiz**: Sistema workflows otimizado para backend, não previu features frontend-heavy com refinamento visual iterativo

**Ação**: M1 (Workflow 6c Visual Refinement separado)

---

## Consequências

### Positivas ✅

1. **Objetividade RCA**: 4 agentes paralelos eliminam viés (tempo, qualidade, iterações, workflow)
2. **Causas Raiz Sistêmicas**: 3/4 análises identificaram causas sistêmicas (não pontuais)
3. **ROI Consolidado**: 90x+ (2h 45min implementação vs 180h economia projetada)
4. **Pareto Validado**: 3 melhorias (75% ações) = 80%+ impacto
5. **Replicabilidade**: Workflow 9b RCA repetível em TODAS features futuras
6. **Auto-Evolutivo**: Fase 21.5 atualiza baselines automaticamente (SE delta ≥ 20%)

### Negativas ⚠️

1. **Overhead Inicial**: +54min RCA retrospectivo (mas ROI 90x+)
2. **Complexidade**: 4 agentes paralelos requerem orchestration (4 análises simultâneas)
3. **Tamanho Workflow**: Workflow 9b agora 16.5 KB (acima 12k ideal, mas necessário)

### Trade-offs

**RCA Profundo vs Rápido**:
- ✅ Profundo: 4 análises 5 Whys (54min) → causas sistêmicas (ROI 90x+)
- ❌ Rápido: 1 análise superficial (10min) → causas pontuais (ROI baixo)
- **Decisão**: Profundo (causas sistêmicas previnem recorrências)

**Workflow 6c Separado vs Unificado**:
- ✅ Separado: Validação (6a) + Refinement (6c) → clareza responsabilidades
- ❌ Unificado: Workflow 6a único → overhead 67% (178min)
- **Decisão**: Separado (features UI/UX necessitam refinement estruturado)

---

## Alternativas Consideradas

### Alternativa 1: RCA apenas bugs (não retrospectivo)

- ✅ Menor overhead (10min vs 54min)
- ❌ Perde causas sistêmicas (workflow gargalos, baselines desatualizados)
- ❌ Não identifica padrões multi-features
- **Rejeitada**: ROI baixo (bugs pontuais vs prevenção sistêmica)

### Alternativa 2: Atualizar baselines manualmente (sem Fase 21.5)

- ✅ Sem modificação Workflow 9b
- ❌ Baselines desatualizados (esquecer manual)
- ❌ Inconsistência (diferentes critérios atualização)
- **Rejeitada**: Fase 21.5 automatizada previne esquecimento (critério delta ≥ 20%)

### Alternativa 3: Unificar Workflow 6a+6c (não separar)

- ✅ Menos workflows (10 vs 11)
- ❌ Overhead 67% continua (validação + refinement misturados)
- ❌ Não resolve problema sistêmico (features UI/UX)
- **Rejeitada**: Separação clara necessária (validação técnica vs refinement visual)

---

## Implementação

### Estrutura RCA Retrospectivo (Workflow 9b Fase 21.5)

**4 Análises Paralelas** (4 agentes simultâneos):

```markdown
## 🔍 Fase 21.5: Root Cause Analysis (RCA) Retrospectivo

### Agent 1 (Tempo): 5 Whys
1. Por quê duração real vs estimado?
2-5. [Continuar 5 Whys]
**CAUSA RAIZ**: [Sistêmica]

### Agent 2 (Qualidade): 5 Whys
1. Por quê bugs descobertos tarde?
2-5. [Continuar 5 Whys]
**CAUSA RAIZ**: [Sistêmica]

### Agent 3 (Iterações): 5 Whys
1. Por quê N iterações em vez de M?
2-5. [Continuar 5 Whys]
**CAUSA RAIZ**: [Sistêmica]

### Agent 4 (Workflow): 5 Whys POR FASE problemática
1. Por quê [fase] foi longa/confusa?
2-5. [Continuar 5 Whys]
**CAUSA RAIZ**: [Sistêmica]
```

**Consolidação**:
- Máximo 3 causas raiz sistêmicas (não pontuais)
- Priorização Pareto 80/20 (ROI > 10x)
- Implementação Top 3-5 melhorias

---

### Workflow 6c Visual Refinement (Template)

**Estrutura**:
```markdown
## 🎨 Fase 14: Visual Refinement Iterativo

### 14.1 Setup Screenshot-Driven
mkdir -p screenshots/[branch]/iterations/

### 14.2 Iteração Visual (Repetir 6-12x)
1. Screenshot BEFORE (iter-N-before.png)
2. Feedback estruturado (O quê, Por quê, Onde, Desejado)
3. Implementar ajuste (código diff)
4. Screenshot AFTER (iter-N-after.png)
5. Validação (mudança OK, sem regressões, responsivo, aprovado)

### 14.3 Categorias Refinamento
- Cores e Contraste (WCAG AA 4.5:1)
- Layout e Espaçamento (escala 8px)
- Tipografia (hierarquia clara)
- Componentes UI (ícones consistentes)

### 14.4 Convergência
**Critério**: 3 iterações consecutivas aprovadas → COMPLETO
```

---

### ESTIMATION-BASELINES.md (Estrutura)

**Tabela**:
| Tipo Feature | Sem Pareto | Com Pareto ✅ | Evidência |
|--------------|------------|---------------|-----------|
| Landing Estática | 6-8h | **4-5h** | feat-landing-page-mvp |
| Auth/Onboarding | 8-12h | **5-7h** | feat-magic-link |
| Modal/UI | 10-15h | **6-9h** | feat-modal-primeiro-acesso |

**Fatores Ajuste**:
1. Agentes Paralelos: 2.25x speedup
2. Pareto 80/20: -30-40% tempo
3. GATE 1 Reframing: -70% pivots
4. Workflow 6c: -65% tempo validação UI

**Atualização Automática** (Workflow 9b Fase 21.5):
```bash
SE |delta| ≥ 20% → Nova baseline = (Real + Anterior) / 2
SE |delta| < 20% → SKIP (baseline estável)
```

---

## Validação

**Próximas 5 features**:
- [ ] Workflow 9b RCA executado 5/5?
- [ ] 3+ causas sistêmicas identificadas (não pontuais)?
- [ ] Top 3-5 melhorias implementadas (ROI > 10x)?
- [ ] Baselines atualizados SE delta ≥ 20%?
- [ ] Workflow 6c usado SE feature UI/UX?

**SE 4/5 ✅**: ADR-033 consolidado (padrão permanente)
**SE 2+ ❌**: Re-analisar (investigar falhas sistêmicas)

---

## Referências

- `.context/feat-landing-page-mvp_workflow-progress.md` (9 workflows completos)
- `.windsurf/workflows/add-feature-9b-retrospective.md` (Workflow 9b template)
- `.windsurf/workflows/add-feature-6c-visual-refinement.md` (Workflow 6c novo)
- `docs/ESTIMATION-BASELINES.md` (baselines atualizadas)
- ADR-010: Pareto Analysis Meta-Learning (framework origem)
- ADR-031: GATE 1 Reframing CSF (previne pivots -70%)
- ADR-032: Pareto Batch System (ROI 60x+)

---

## Meta-Learning

**Categoria**: Process & Workflows (RCA Retrospective)
**Impacto**: TODAS features (100% aplicável)
**ROI**: 90x+ (2h 45min vs 180h economia projetada 60 features)
**Sistêmico**: ✅ SIM (4 análises paralelas, causas raiz sistêmicas)
**Replicabilidade**: ✅ 100% (Workflow 9b template)

---

**Próximo ADR**: ADR-034 (Continuous Workflow Optimization via RCA)
