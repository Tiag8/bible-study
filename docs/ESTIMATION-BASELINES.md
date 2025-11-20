# Estimation Baselines - Feature Development

**Última Atualização**: 2025-11-20
**Versão**: 1.0.0

---

## 📊 Propósito

Rastrear **baselines de estimativa** por tipo de feature para melhorar planejamento e alocação de recursos.

**Por quê**: Metodologias novas (Pareto Analysis, agentes paralelos) reduziram tempo -30-40%, mas baselines não atualizavam automaticamente.

**Como usar**:
1. Identificar tipo feature (Landing, Auth, Modal, DB Schema)
2. Consultar baseline "Duração (com Pareto)"
3. Aplicar fatores de ajuste (agentes paralelos, GATE 1, Pareto)
4. Documentar estimativa em PLAN.md

---

## 🎯 Metodologia Atual

**Workflows**: 1 → 2b → 3 → 4.5 → 5a → 6b → 7a → 8a → 8b → 9a

**Otimizações**:
- **Agentes Paralelos**: 3-5 simultâneos (Workflow 8b Pareto Analysis)
- **Pareto 80/20**: Top 20-30% melhorias = 70-80% impacto (ROI 60x+)
- **GATE 1 Reframing**: Previne 70% pivots (ADR-031 CSF)

---

## 📋 Baselines por Tipo de Feature

| Tipo Feature | Workflows | Sem Pareto | Com Pareto ✅ | Evidência |
|--------------|-----------|------------|---------------|-----------|
| **Landing Page Estática** | 1,2b,3,4,5a,6b,6c,7a,8a,8b | 6-8h | **4-5h** | feat-landing-page-mvp (4h real) |
| **Auth/Onboarding** | 1,2b,3,4,4.5,5a,6a,7a,8a,8b | 8-12h | **5-7h** (proj.) | feat-magic-link-onboarding |
| **Modal/UI Incremental** | 1,2b,3,4,4.5,5a,6a,7a,8a,8b | 10-15h | **6-9h** (proj.) | feat-modal-primeiro-acesso |
| **Feature + DB Schema** | Todos (11 workflows) | 15-20h | **9-12h** (proj.) | - |
| **Backend + Edge Functions** | 1,2b,3,4,4.5,5a,6a,7a,8a,8b | 12-18h | **7-11h** (proj.) | - |

**Legenda**:
- **Sem Pareto**: Baseline histórica (features anteriores a 2025-11-16)
- **Com Pareto ✅**: Baseline atual (pós-Pareto Analysis ADR-032)
- **(proj.)**: Projeção baseada em evidências parciais

---

## ⚙️ Fatores de Ajuste

### 1. Agentes Paralelos (Workflow 8b)

**Speedup**: 2.25x (13.5h sequencial → 6h paralelo)

**Condição**: Workflows SEM dependências entre si (modificações em arquivos diferentes)

**Aplicável**: Workflow 8b (Pareto Analysis), Workflow 8a (PLAN/TASK/README paralelos)

**Evidência**: feat-landing-page-mvp (Workflow 8b 54min vs 180min estimado)

---

### 2. Pareto 80/20 (Workflow 8b)

**Impacto**: -30-40% tempo total

**Condição**: ≥ 20 melhorias identificadas, scoring objetivo `(Frequency × Impact × Systemic) ÷ Effort`

**Aplicável**: Features COM acúmulo de melhorias (executar Workflow 8b a cada 3-5 features)

**Evidência**: ADR-032 (29% melhorias → 70-80% impacto, ROI 60x+)

---

### 3. GATE 1 Reframing (ADR-031)

**Impacto**: -70% pivots (0-1 vs 2-4 sem reframing)

**Condição**: Workflow 1 Fase 1.5 executado ANTES de Workflow 2b

**Aplicável**: 100% features (CSF non-negotiable)

**Evidência**: feat-landing (0 pivots), feat-modal (4 pivots SEM GATE 1)

---

### 4. Workflow 6c Visual Refinement

**Impacto**: -65% tempo Workflow 6a (178min → 9min validação + 50min refinement)

**Condição**: Features UI/UX (frontend 80%+)

**Aplicável**: Landing pages, dashboards, onboarding flows, mobile UI

**Evidência**: feat-landing-page-mvp (14 iterações visuais não estruturadas)

---

## 📈 Histórico de Atualizações

| Data | Feature | Tipo | Duração Real | Baseline Anterior | Baseline Nova | Delta |
|------|---------|------|--------------|-------------------|---------------|-------|
| 2025-11-20 | feat-landing-page-mvp | Landing Estática | 4h | 6-8h | 4-5h | -34% |

**Próximas atualizações**: Workflow 9b Fase 21.5 atualiza SE delta ≥ 20%

---

## 🔄 Como Atualizar (Workflow 9b Fase 21.5)

**Critério**: SE Delta tempo ≥ 20% vs baseline → Atualizar

**Processo**:
1. Ler baseline atual: `grep "[Tipo Feature]" docs/ESTIMATION-BASELINES.md`
2. Calcular nova baseline: `(Duração Real + Baseline Anterior) / 2` (média móvel)
3. Atualizar tabela (coluna "Com Pareto")
4. Adicionar linha em "Histórico de Atualizações"
5. Commit isolado: `git commit -m "docs(estimation): update baseline [tipo] (Xh → Yh)"`

**SE Delta < 20%**: SKIP (baseline estável)

---

## 📝 Exemplo Prático

**Feature**: Nova landing page institucional

**Passo 1 - Identificar tipo**: Landing Page Estática

**Passo 2 - Consultar baseline**: 4-5h (com Pareto)

**Passo 3 - Aplicar fatores**:
- Agentes paralelos: ✅ (3+ agentes Workflow 8b)
- Pareto 80/20: ✅ (executado a cada 3-5 features)
- GATE 1 Reframing: ✅ (CSF obrigatório)
- Workflow 6c: ✅ (feature UI/UX)

**Passo 4 - Estimativa final**: 4-5h

**Passo 5 - Documentar**: Adicionar em `docs/PLAN.md` seção "Feature X"

---

## 🎯 Benefícios

1. **Estimativas precisas**: -10-20min planejamento/feature (negociação, recursos)
2. **Zero subestimações**: Cronogramas realistas (impacto stakeholders)
3. **Baselines atualizadas**: Auto-evolução (Workflow 9b Fase 21.5)
4. **ROI rastreável**: Validar eficácia Pareto/GATE 1/agentes paralelos

---

## 📚 Referências

- ADR-032: Pareto Batch System Decision
- ADR-031: GATE 1 Reframing CSF
- Workflow 9b RCA Retrospectivo (feat-landing-page-mvp)
- `.claude/CLAUDE.md` REGRA #16 (Pre-Implementation Gates)

---

**Versão**: 1.0.0
**Data**: 2025-11-20
**Autor**: Life Track Growth (RCA Workflow 9b)
