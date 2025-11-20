---
description: Workflow Add-Feature (6c/11) - Visual Refinement (UI/UX Iterativo)
auto_execution_mode: 1
---

## 📚 Pré-requisito
Ler: `docs/PLAN.md`, `docs/TASK.md`, `.windsurf/workflows/add-feature-6a-user-validation.md`

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES
**SEMPRE usar o MÁXIMO de agentes possível em paralelo** (até 36x mais rápido).

---

# Workflow 6c/11: Visual Refinement (UI/UX Iterativo)

**Pré-requisito**: Workflow 6a (Validação Técnica) completo ✅

**Quando usar**:
- ✅ Feature UI/UX (frontend 80%+): Landing pages, dashboards, onboarding flows
- ❌ Feature backend (Edge/DB 80%+): SKIP (Workflow 6a suficiente)

**Duração típica**: 30-60min (6-12 iterações visuais)

**Evidência**: feat-landing-page-mvp (14 iterações visuais, 169min não estruturado → 40min estruturado)

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

```bash
./scripts/context-load-all.sh feat-nome-feature
```

**Output**: Resumo 6 arquivos (INDEX, workflow-progress, temp-memory, decisions, attempts.log, validation-loop).

**SE falhar**: Fallback manual (Read 6 arquivos).

---

### 0.1. Validar Pré-Requisito Workflow 6a

**Checklist**:
- [ ] Workflow 6a executado? (workflow-progress.md)
- [ ] GATE 3 aprovado?
- [ ] Feature funciona tecnicamente?

**SE NÃO**: ⛔ PARAR. Executar Workflow 6a ANTES.

**Por quê**: Refinamento visual assume feature funcional.

---

### 0.2. Identificar Feature UI-Heavy

**Critérios para executar Workflow 6c**:
- ✅ Feature 80%+ frontend (landing, dashboard, onboarding)
- ✅ Usuário pediu refinamento visual
- ✅ Screenshots ANTES/DEPOIS capturados (Workflow 6a)
- ✅ Múltiplos aspectos visuais a ajustar

**SE NÃO**: ⛔ SKIP. Prosseguir Workflow 7a.

---

## 🎨 FASE 14: Visual Refinement Iterativo (Screenshot-Driven)

**Objetivo**: Refinar aspectos visuais (cores, layout, espaçamento, tipografia) baseado em feedback estruturado.

**Metodologia**: Screenshot BEFORE → Feedback estruturado → Implementar ajuste → Screenshot AFTER → Validação → Repetir.

**Convergência**: 3 iterações consecutivas aprovadas pelo usuário (usuário não pede mais mudanças).

---

### 14.1 Setup Screenshot-Driven

**Pasta de Iterações**:

```bash
BRANCH=$(git branch --show-current)
mkdir -p screenshots/${BRANCH}/iterations
```

**Estrutura**:
```
screenshots/
└── [branch]/
    ├── before/              # (já existe - Workflow 6a Fase 12)
    ├── after/               # (já existe - Workflow 6a Fase 12)
    └── iterations/          # (novo - refinamento)
        ├── iter-01-before.png
        ├── iter-01-after.png
        ├── iter-02-before.png
        ├── iter-02-after.png
        └── ...
```

**Preview Server**:
```bash
npm run build && npm run preview
# http://localhost:4173
```

---

### 14.2 Iteração Visual (Repetir 6-12x)

**⚠️ CRÍTICO**: CADA iteração DEVE seguir template estruturado.

**Template Iteração**:

```markdown
### 🎨 Iteração Visual N

**Data**: [YYYY-MM-DD HH:MM -03]
**Aspecto**: [cores/layout/tipografia/componentes]

#### 1. Screenshot BEFORE
`screenshots/[branch]/iterations/iter-[N]-before.png`

#### 2. Feedback Usuário
- **O quê**: [Mudança específica]
- **Por quê**: [Razão - contraste, legibilidade, hierarquia]
- **Onde**: [Componente + linha]
- **Desejado**: [Especificar mudança]

#### 3. Implementar Ajuste
**Arquivo**: [path]
**Código**: [diff ANTES/DEPOIS]

#### 4. Screenshot AFTER
`screenshots/[branch]/iterations/iter-[N]-after.png`

#### 5. Validação
- [ ] Mudança aplicada?
- [ ] Sem regressões?
- [ ] Responsivo OK?
- [ ] Usuário aprovou?

**Resultado**: ✅ APROVADO / ⚠️ AJUSTAR / ❌ REJEITAR

#### 6. Próxima
**SE 3 consecutivas ✅**: CONVERGÊNCIA → Workflow 6c COMPLETO
**SE NÃO**: Iteração N+1
```

---

### 14.3 Categorias de Refinamento Visual

**CRÍTICO**: Estruturar iterações por categoria (não misturar tudo).

---

#### Categoria 1: Cores e Contraste

**Checklist**:
- [ ] Cores consistentes? (primary, secondary, accent)
- [ ] Contraste WCAG AA? (4.5:1 texto normal, 3:1 texto grande)
- [ ] Gradientes suaves?
- [ ] Cores acessíveis? (não apenas vermelho/verde)

**Ferramenta**: WebAIM Contrast Checker, Chrome DevTools Accessibility

---

#### Categoria 2: Layout e Espaçamento

**Checklist**:
- [ ] Margins/paddings consistentes? (escala 8px: 8, 16, 24, 32, 48, 64)
- [ ] Alinhamento vertical/horizontal?
- [ ] Responsividade mobile? (sm:640px, md:768px, lg:1024px)
- [ ] Sem scroll horizontal?

**Padrão**: `p-4 mb-8 gap-6` (consistente 8px) vs `p-3 mb-7 gap-5` (aleatório)

---

#### Categoria 3: Tipografia

**Checklist**:
- [ ] Hierarquia clara? (h1 > h2 > h3 > p)
- [ ] Font-sizes adequados? (mobile: 14-16px, desktop: 16-18px)
- [ ] Line-height legível? (1.5-1.8 texto, 1.2-1.4 títulos)
- [ ] Font-weight consistente? (400 normal, 600 semibold, 700 bold)

**Padrão**: `text-5xl font-bold leading-tight` (títulos) vs `text-base leading-relaxed` (texto)

---

#### Categoria 4: Componentes UI

**Checklist**:
- [ ] Ícones consistentes? (mesmo pack: Lucide, Heroicons)
- [ ] Tamanho adequado? (16px inline, 24px standalone, 32px hero)
- [ ] Botões CTA destacados? (cor primária, shadow-md)
- [ ] Cards com sombras sutis? (shadow-sm, shadow-md hover)
- [ ] Estados interativos? (hover, focus, active)

**Padrão CTA**: `bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md`

---

### 14.4 Convergência: 3 Iterações Consecutivas Aprovadas

**Regra**: Workflow 6c finaliza quando usuário aprova 3 iterações seguidas (sem pedir mudanças).

**Por quê**: 3 aprovações consecutivas indica refinamento estabilizado (usuário satisfeito).

**Checklist Convergência**:
- [ ] Iteração N: ✅ APROVADO
- [ ] Iteração N+1: ✅ APROVADO
- [ ] Iteração N+2: ✅ APROVADO
- [ ] Usuário confirmou "está perfeito" ou similar?

**SE SIM**: ✅ Workflow 6c COMPLETO → Fase 14.5 (Checklist Final Visual)

**SE NÃO**: Continuar iterações até convergência.

**Exceção**: Se iterações > 15, pausar e perguntar usuário se deseja continuar (pode indicar escopo mal definido).

---

### 14.5 Checklist Final Visual (Antes de Aprovar)

**⛔ NÃO aprovar Workflow 6c sem validar TODOS os itens**:

#### Visual Quality
- [ ] 6-12 iterações executadas? (screenshot BEFORE/AFTER cada)
- [ ] 3 iterações consecutivas aprovadas? (convergência atingida)
- [ ] ZERO regressões visuais? (componentes não modificados mantiveram aparência)
- [ ] 4 categorias validadas? (cores, layout, tipografia, componentes)

#### Responsividade
- [ ] Mobile 375px testado? (iPhone SE)
- [ ] Tablet 768px testado? (iPad)
- [ ] Desktop 1024px+ testado? (laptop/desktop)
- [ ] Sem scroll horizontal? (overflow-x adequado)
- [ ] Botões clicáveis? (não sobrepostos, tamanho touch-friendly 44x44px)

#### Acessibilidade (WCAG AA)
- [ ] Contraste texto/fundo > 4.5:1? (texto normal)
- [ ] Contraste texto/fundo > 3:1? (texto grande > 18px)
- [ ] Navegação por teclado? (Tab, Enter, Esc funcionam)
- [ ] Estados de foco visíveis? (outline ou ring em elementos focados)

#### Performance
- [ ] Lighthouse Performance > 90? (npm run build → Chrome DevTools Lighthouse)
- [ ] CLS < 0.1? (Cumulative Layout Shift - não pula elementos)
- [ ] LCP < 2.5s? (Largest Contentful Paint - imagem hero carrega rápido)

---

## 🧠 MEMORY UPDATE (Pós-Refinement - OPCIONAL)

**APLICÁVEL**: Se padrão visual reutilizável identificado (2+ features).

**Checklist**:
- [ ] Padrão recorrente? (ex: espaçamento 8px, cores tema)
- [ ] Categoria específica? (cores, layout, tipografia, componentes)
- [ ] Aprovado pelo usuário?

**Ação**: Sugerir adição a `~/.claude/memory/tailwind-patterns.md` com template completo + aguardar aprovação.

**Ver**: `~/.claude/CLAUDE.md` REGRA #20

---

## ✅ GATE 4: Visual Refinement Aprovado

**⚠️ PARADA OBRIGATÓRIA**

**Checklist GATE 4** (TODOS devem estar ✅):
- [ ] 6-12 iterações executadas (screenshots documentados)
- [ ] 3 consecutivas aprovadas (convergência)
- [ ] Responsivo testado (375px, 768px, 1024px)
- [ ] WCAG AA validado (contraste, navegação teclado)
- [ ] Performance OK (Lighthouse > 90)
- [ ] ZERO regressões visuais

**Decisão**:
- **✅ APROVAR** - Todos checkboxes ✅ → Workflow 7a (Quality Gates)
- **⚠️ AJUSTAR** - 1+ itens falharam → Corrigir → Re-validar

**Aguardando confirmação...** 🚦

---

## ✅ CHECKPOINTS (REGRA #14)

**Ação atômica**: 1 iteração visual completa (BEFORE → Feedback → Implementar → AFTER → Validação).

**Checkpoint**: Após cada iteração, apresentar evidências (screenshots) + validação + aguardar aprovação.

**Documentação**: Logar cada iteração em `.context/attempts.log` com timestamp, aspecto, resultado.

**Ver**: REGRA #14 em `.claude/CLAUDE.md`.

---

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

Adicionar:
- Workflow 6c completo
- N iterações (convergência 3 consecutivas)
- GATE 4 aprovado
- Próximo: Workflow 7a

### F.2. Atualizar temp-memory.md

Atualizar Estado Atual:
- Workflow 6c concluído
- Iterações executadas (N)
- Próximo: Workflow 7a

### F.3. Atualizar validation-loop.md

Adicionar resumo iterações visuais (total, convergência, screenshots path).

### F.4. Atualizar decisions.md (Se Decisões)

**⚠️ Só atualizar se decisão visual tomada** (ex: mudar paleta de cores).

### F.5. Log em attempts.log

```bash
echo "[$(date '+%Y-%m-%d %H:%M')] WORKFLOW: 6c - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(date '+%Y-%m-%d %H:%M')] GATE 4: APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.6. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei validation-loop.md (iterações visuais)?
- [ ] Atualizei decisions.md (se decisão visual tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + GATE 4)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🚀 Próximo Workflow

**Workflow 7a**: Quality Gates (Build, TypeScript, ESLint, Tests)

**Continuação**: [Workflow 7a - Quality Gates](.windsurf/workflows/add-feature-7a-quality-gates.md)

---


## 📝 Changelog

**v1.0 (2025-11-20)**:
- ✅ Workflow criado (RCA Workflow 9b - Retrospectivo)
- ✅ Screenshot-driven iterations (6-12 ciclos estruturados)
- ✅ 4 categorias refinamento (cores, layout, tipografia, componentes)
- ✅ Convergência 3 iterações consecutivas (critério explícito)
- ✅ Separação clara Workflow 6a (validação técnica) vs 6c (refinamento visual)
- ✅ GATE 4 checklist visual (responsividade, WCAG AA, performance)
- ✅ Checkpoints iteração (REGRA #14 compliance)
- ✅ Context update obrigatório (validation-loop.md iterações)

**Evidência**: feat-landing-page-mvp (14 iterações visuais, 169min Workflow 6a não estruturado)

**Baseado em**: ADR-026 (Multi-Agent Parallelization), WR-009 (Workflow 9b RCA), Workflow 6a (User Validation)

---

**Workflow criado**: 2025-11-20 | **Versão**: 1.0
**Parte**: 6c de 11 (Visual Refinement Iterativo)
**Predecessora**: Workflow 6a (User Validation)
**Sucessora**: Workflow 7a (Quality Gates)
