# ADR-029: Screenshot-First Development for UI-Heavy Features

**Status**: ✅ Aceito
**Data**: 2025-11-20
**Contexto**: feat/landing-page-mvp
**Decisores**: Workflow 8a Meta-Learning Analysis
**Tags**: #ui #validation #workflow

---

## Contexto

Durante implementação da landing page MVP (feat/landing-page-mvp), o Workflow 6a (User Validation) necessitou **6 iterações de ajustes visuais** ao longo de 11 horas, desde 19:49 (2025-11-19) até 06:48 (2025-11-20).

**Evidências**:
- `.context/feat-landing-page-mvp_attempts.log` linhas 20-33 (6 ajustes incrementais)
- `.context/feat-landing-page-mvp_workflow-progress.md` linhas 112-114
- `.context/feat-landing-page-mvp_validation-loop.md` (6 iterações: Header gradiente, Hero stats, Personas layout, Process colorido, Pricing nova, Features cores)

**Comparação**:
- feat-landing-page-mvp: **6 iterações** (11h overhead)
- feat-magic-link-onboarding: 1 iteração
- feat-payment: 2 iterações
- **Conclusão**: Landing pages = 3x mais iterações que features backend

---

## Problema

### Root Cause Analysis (5 Whys)

1. **Por quê 6 iterações foram necessárias?**
   → Ajustes visuais progressivos não detectados em design técnico

2. **Por quê ajustes não foram detectados em Workflow 2b?**
   → Technical Design focou em arquitetura (12 arquivos, 1305 LOC) mas NÃO validou mockups/wireframes ANTES de código

3. **Por quê mockups não foram criados?**
   → Workflow 2b Fase 4 não tem gate "Mockup/Screenshot de Referência ANTES de Workflow 5a"

4. **Por quê ausência de mockup causou 6 iterações?**
   → Implementação seguiu design system JSON (text-only), mas usuário esperava visual Mandatão.com.br (screenshot)

5. **Por quê gap text vs screenshot é sistêmico?**
   → **CAUSA RAIZ**: Workflow 2b aceita design systems text, mas landing pages precisam validação VISUAL antes de código

---

## Decisão

**Implementar "Screenshot-First Development" para features UI-heavy.**

### Novo Gate: Workflow 2b Fase 4.5

**CRÍTICO**: ANTES de Workflow 5a (Implementation), validar screenshot/mockup de referência.

**Checklist**:
- [ ] Feature é UI-heavy? (landing, dashboard, onboarding flow)
- [ ] SE SIM: Screenshot/mockup de referência existe?
- [ ] Screenshot aprovado pelo usuário?
- [ ] Design system (cores, componentes, layout) alinhado com screenshot?

**Enforcement**:
```markdown
## ⚠️ GATE 4.5: Screenshot/Mockup Validation (UI-Heavy Features)

**Aplicável SE**:
- [ ] Landing page
- [ ] Dashboard redesign
- [ ] Onboarding flow
- [ ] Marketing pages

**Checklist**:
1. [ ] Screenshot/mockup de referência anexado
2. [ ] Usuário aprovou visual (GATE 1)
3. [ ] Componentes mapeados (Hero, Features, CTA, etc.)
4. [ ] Cores customizadas identificadas
5. [ ] Layout responsivo validado

**⛔ SE FALHOU**: PARAR → Obter screenshot → Retornar Workflow 2b
```

---

## Consequências

### Positivas ✅

1. **Redução de iterações**: 6 → 1-2 (estimado 67% redução)
2. **Alinhamento visual**: Screenshot = contrato entre usuário e implementação
3. **Detecção precoce**: Cores, layout, responsividade validados ANTES de código
4. **Zero surpresas**: Usuário vê mockup ANTES de build

### Negativas ⚠️

1. **Overhead Workflow 2b**: +10-15min para criar/aprovar screenshot
2. **Dependência usuário**: Precisa fornecer screenshot ou aprovar mockup
3. **Não aplicável**: Features backend-only (API, DB, Edge Functions)

### Trade-offs

**Tempo investido**: +15min Workflow 2b
**Tempo economizado**: -4h30min (6 iterações × 45min/iteração)
**ROI**: 18x (270min economizados / 15min investidos)

---

## Alternativas Consideradas

### Alternativa 1: Manter Workflow 2b como está
- ❌ **Rejeitada**: Padrão de 6 iterações recorrente em features UI-heavy
- ❌ **Evidência**: Landing page não é caso isolado (dashboard redesign futuro terá mesmo problema)

### Alternativa 2: Criar Workflow 2c específico para UI
- ❌ **Rejeitada**: Over-engineering, GATE 4.5 resolve sem novo workflow
- ❌ **Pareto 80/20**: 1 gate adicional > criar workflow inteiro

### Alternativa 3: Usar Figma/Wireframe obrigatório
- ⚠️ **Parcial**: Screenshot de referência (Mandatão, inspiração) é suficiente
- ✅ **Aceitável**: Figma opcional, screenshot obrigatório

---

## Implementação

### Workflow 2b - Adicionar Fase 4.5

**Localização**: `.windsurf/workflows/add-feature-2b-technical-design.md`

**Inserir após Fase 4** (linha ~150):

```markdown
---

## 🎨 Fase 4.5: Screenshot/Mockup Validation (UI-Heavy) 🚨 OBRIGATÓRIO

**⚠️ APLICÁVEL SE**: Feature é landing page, dashboard redesign, ou onboarding flow.

### 4.5.1. Identificar SE Feature é UI-Heavy

**Checklist**:
- [ ] Landing page?
- [ ] Dashboard redesign?
- [ ] Onboarding flow visual?
- [ ] Marketing pages?

**SE NENHUM**: ⏭️ SKIP para Workflow 3 (Risk Analysis)

**SE 1+ marcado**: ⚠️ CONTINUAR Fase 4.5

---

### 4.5.2. Validar Screenshot/Mockup de Referência

**Perguntar ao usuário**:

> 🖼️ **Screenshot de Referência**
>
> Esta feature é UI-heavy (landing/dashboard/onboarding).
>
> **Perguntas**:
> 1. Você tem screenshot/mockup de referência visual?
> 2. Qual visual inspiração? (ex: Mandatão.com.br, Material Design, Tailwind UI)
> 3. Cores customizadas? (ex: gradiente verde-azul, botão laranja)
>
> **Ação**: Anexar screenshot OU descrever visual esperado (aprovação obrigatória).

---

### 4.5.3. Checklist Screenshot Aprovado

- [ ] Screenshot/mockup anexado OU visual descrito
- [ ] Usuário aprovou visual (GATE 1)
- [ ] Componentes principais identificados (Hero, Features, CTA, etc.)
- [ ] Cores customizadas mapeadas (Tailwind safelist SE dinâmicas)
- [ ] Layout responsivo considerado (mobile/tablet/desktop)

**⛔ SE FALHOU**: PARAR → Obter screenshot → Retornar Fase 4.5

---

### 4.5.4. Log Decisão

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] DECISION: Screenshot-First - Visual aprovado (UI-heavy feature)" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

**Benefício**: -67% iterações (6 → 2), -4h overhead, +15min investimento (ROI 18x)
```

---

### Workflow 1 - Adicionar Pergunta Contextual

**Localização**: `.windsurf/workflows/add-feature-1-planning.md` Fase 3

**Adicionar à lista de perguntas**:

```markdown
11. **Visual de Referência** (SE landing/dashboard/UI-heavy):
    - Tem screenshot/mockup de referência?
    - Qual inspiração visual? (ex: Mandatão, Material Design)
    - Cores customizadas? Gradientes?
```

---

### Template validation-loop.md - Enforcement

**Localização**: `.context/TEMPLATE_validation-loop.md`

**Adicionar validação**:

```markdown
**⚠️ OBRIGATÓRIO**: PREENCHER todas iterações OU marcar "ZERO iterações (GATE 4.5 Screenshot-First aplicado)".

**Enforcement**: SE validation-loop.md vazio E feature UI-heavy → ❌ REJEITAR Workflow 8a
```

---

## Validação

**Próximas features UI-heavy** (dashboard redesign, onboarding visual):
- [ ] GATE 4.5 executado?
- [ ] Iterações <= 2?
- [ ] Overhead <= 1h?

**SE 3/3 ✅**: ADR-029 validado (padrão consolidado)
**SE 1+ ❌**: Re-analisar (ADR-029 pode precisar ajuste)

---

## Referências

- `.context/feat-landing-page-mvp_validation-loop.md` (6 iterações documentadas)
- `.context/feat-landing-page-mvp_workflow-progress.md` linhas 112-114
- Workflow 6a: User Validation (evidência 11h overhead)
- ADR-010: Pareto Analysis Meta-Learning (framework 80/20)

---

## Meta-Learning

**Categoria**: Process & Workflows
**Impacto**: TODAS features UI-heavy (estimado 30% features/ano)
**ROI**: 18x (270min economizados / 15min investidos)
**Sistêmico**: ✅ SIM (3+ features futuras: dashboard, onboarding, marketing)

---

**Próximo ADR**: ADR-030 (Risk Analysis Categorization) ou ADR-031 (GATE 1 Reframing CSF)
