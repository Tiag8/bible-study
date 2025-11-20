---
description: Workflow Add-Feature (6a/9) - User Validation (Validação Manual - CRÍTICO!)
auto_execution_mode: 1
---

## 📚 Pré-requisito
Ler: `docs/PLAN.md`, `docs/TASK.md`, `.windsurf/workflows/`, `docs/`

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES
**SEMPRE usar o MÁXIMO de agentes possível em paralelo** (até 36x mais rápido).

---

# Workflow 6a/11: User Validation

---

## 🧠 FASE 0: LOAD CONTEXT (Script Unificado)

**⚠️ USAR SCRIPT** (não Read manual):

```bash
./scripts/context-load-all.sh feat-nome-feature
```

**Output**: Resumo 6 arquivos .context/ (INDEX, workflow-progress, temp-memory, decisions, attempts.log, validation-loop).

**SE script falhar**: Fallback manual (Read 6 arquivos).

**Benefício**: Consolidated context loading vs manual Fase 0 (redução tempo).
---

## 📋 Fase 0.5: Usar Template Checklist (OBRIGATÓRIO)

**CRÍTICO**: TODAS validações DEVEM usar formato padronizado.

### 0.5.1. Template Validation Checklist

**Localização**: `.windsurf/templates/validation-checklist-template.md`

**5 Elementos Obrigatórios**:
1. **Título numerado** (ex: "✅ 1. Login Magic Link funcional")
2. **Cenário** (contexto específico)
3. **Steps** (lista executável, não genérica)
4. **Validação** (critérios objetivos, mensuráveis)
5. **Screenshots** (OPCIONAL mas recomendado)

### 0.5.2. Como Usar

```bash
# 1. Abrir template
cat .windsurf/templates/validation-checklist-template.md

# 2. Copiar exemplo relevante para Workflow 6a (User Validation)

# 3. Adaptar para caso específico da feature atual

# 4. Colar em validation-loop.md
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
# Editar .context/${BRANCH_PREFIX}_validation-loop.md
```

### 0.5.3. Exemplo Workflow 6a

**Ver no template**: Seção "Workflow 6a (User Validation)" com 3 exemplos:
- Login Magic Link funcional
- Sistema reconhece usuário existente
- Erro de network timeout (edge case)

### 0.5.4. Anti-Patterns (EVITAR)

❌ **Título vago**: "Teste de login"
✅ **Título específico**: "Login Magic Link funcional (Web → WhatsApp)"

❌ **Steps genéricos**: "Testar funcionalidade"
✅ **Steps executáveis**: "1. Acessar /magic-login 2. Inserir telefone..."

❌ **Validação ambígua**: "Sistema funciona"
✅ **Validação objetiva**: "Dashboard carrega em < 2s + dados corretos"

### 0.5.5. Benefícios

- **-50% ambiguidade** (evidência: Meta-Learning #3, #4)
- **100% reprodutível** (qualquer pessoa pode executar)
- **Zero perda contexto** (validation-loop.md preserva tudo)

---

**O que acontece**:
- Fase 12.5: Reframing Pré-Validação
- Fase 13: PARADA OBRIGATÓRIA - Testar Manualmente
- Fase 14: Ciclo de Feedback
- GATE 3: Usuário confirma "funciona perfeitamente!"

**⚠️ NENHUM commit foi feito ainda!** Código está na branch local esperando SUA aprovação.

---

## 📸 Fase 12: Screenshot DEPOIS (Visual Comparison)

**⚠️ CRÍTICO**: Capturar estado DEPOIS implementação (ADR-029).

### Executar Validação

```bash
./scripts/validate-screenshot-gate.sh 6a
```

**SE APROVADO** (exit 0):
- ✅ Screenshots ANTES + DEPOIS existem
- 🎯 Prosseguir Fase 12.5 (Reframing)

**SE REJEITADO** (exit 1):
- ❌ Screenshot DEPOIS faltando
- 🎯 AÇÃO: Capturar screenshot → Salvar `screenshots/after/feature-after.png`
- ⛔ BLOQUEIO: Fase 12.5 requer comparação visual

---

### Como Capturar

1. **Build + Preview**: `npm run build && npm run preview` → http://localhost:4173
2. **Navegar**: Mesma página/componente do screenshot ANTES
3. **Screenshot**: Mesma área (comparação consistente)
4. **Salvar**: `screenshots/after/[feature]-after-[timestamp].png`

**Exemplo**: `screenshots/after/landing-page-after-20251120.png`

---

### Comparação Visual (Fase 12.5 Input)

**Apresentar ao usuário**:
```markdown
🔄 **Reframing: Problema CERTO Resolvido?**

**ANTES**:
![Screenshot Before](screenshots/before/feature-before.png)

**DEPOIS**:
![Screenshot After](screenshots/after/feature-after.png)

**Pergunta**: A implementação resolve o problema CERTO identificado no GATE 1?
- [ ] SIM: Problema original resolvido
- [ ] PARCIAL: Resolve mas expõe gaps
- [ ] NÃO: Problema diferente (pivot necessário)
```

---

## 🔄 Fase 12.5: Reframing Pré-Validação

**ANTES de testar**, validar se estamos testando o problema CERTO.

### 3 Passos
1. **Questionar**: O que usuário REALMENTE pediu? Resolve raiz ou sintoma?
2. **Perspectiva**: Como usuário usaria? Qual dor resolvemos? Casos não considerados?
3. **⭐ Pergunta Forte**:
   > "Qual problema, se resolvido, eliminaria múltiplos sintomas?"

**Exemplo**:
```
❌ "Botão export PDF"
⭐ "Qual problema PDF + impressão + compartilhamento resolvem?"
✅ "Compartilhar progresso" → Link público + PDF opcional
```

**Decisão**:
- [ ] ✅ Continuar (problema CERTO)
- [ ] ⚠️ Ajustar (solução melhor)
- [ ] ❌ Repensar (problema mal definido)

---

## 🧪 Fase 13: PARADA OBRIGATÓRIA - Testar

> **💡 MCPs Úteis**: `playwright` (testes E2E automatizados)
> Ver: `docs/integrations/MCP.md`

```bash
npm run dev  # http://localhost:5173/
```

### 13.1 Checklist de Validação (Batch 6 Cenários)

**Objetivo**: Validar feature em 6 dimensões antes considerar "pronta".

**⚠️ CRÍTICO**: NUNCA validar 1 cenário por vez. Executar em BATCH (6 cenários paralelos).

---

**Template Checklist (Copiar para attempts.log)**:

```markdown
## 🧪 VALIDAÇÃO BATCH - [Nome Feature]

**Data**: [YYYY-MM-DD HH:MM -03]
**Branch**: [nome]
**Ambiente**: [local/staging/prod]

---

### ✅ CENÁRIO F1: Funcionalidade Core

**Descrição**: Happy path da feature principal funciona end-to-end.

**Steps**:
1. [ ] Ação 1: [descrever]
2. [ ] Ação 2: [descrever]
3. [ ] Ação 3: [descrever]

**Expected**: [comportamento esperado]
**Actual**: [resultado obtido]
**Status**: ⏸️ PENDING / ✅ PASS / ❌ FAIL

**Evidência**: [screenshot path OU log snippet]

---

### ✅ CENÁRIO F2: Integrações

**Descrição**: Feature se integra corretamente com sistemas existentes.

**Validações**:
- [ ] checkAuth preservado (SE aplicável)
- [ ] RLS funciona (query com user_id diferente retorna vazio)
- [ ] Edge Functions respondem 200 (SE aplicável)
- [ ] Frontend recebe dados corretos

**Status**: ⏸️ PENDING / ✅ PASS / ❌ FAIL

**Evidência**: [curl output OU network tab screenshot]

---

### ✅ CENÁRIO R1: Responsividade

**Descrição**: UI funciona em mobile, tablet, desktop.

**Devices Testados**:
- [ ] Mobile (375px): [Chrome DevTools]
- [ ] Tablet (768px): [Chrome DevTools]
- [ ] Desktop (1920px): [Browser]

**Validações**:
- [ ] Sem scroll horizontal
- [ ] Botões clicáveis (não sobrepostos)
- [ ] Texto legível (font-size >= 14px mobile)

**Status**: ⏸️ PENDING / ✅ PASS / ❌ FAIL

**Evidência**: [screenshots 3 viewports]

---

### ✅ CENÁRIO C1: Cross-Browser/Platform

**Descrição**: Feature funciona em navegadores principais.

**Browsers Testados**:
- [ ] Chrome/Edge (Chromium): [versão]
- [ ] Safari (Webkit): [SE disponível]
- [ ] Firefox (Gecko): [SE disponível]

**Validações**:
- [ ] CSS fallback para features não suportadas
- [ ] JavaScript funciona (sem console errors)
- [ ] Performance aceitável (< 3s load)

**Status**: ⏸️ PENDING / ✅ PASS / ❌ FAIL

**Evidência**: [console screenshots ZERO errors]

---

### ✅ CENÁRIO P1: Performance

**Descrição**: Feature atende targets de performance.

**Métricas**:
- [ ] Bundle size: [X KB gzipped] < [target KB]
- [ ] Initial load: [X s] < 3s
- [ ] Interaction latency: [X ms] < 500ms
- [ ] Lazy loading: [X chunks] (SE aplicável)

**Tools**: `npm run build` + Chrome DevTools Network

**Status**: ⏸️ PENDING / ✅ PASS / ❌ FAIL

**Evidência**: [build output + network waterfall screenshot]

---

### ✅ CENÁRIO E1: Edge Cases

**Descrição**: Feature lida com inputs inválidos, estados edge.

**Casos Testados**:
1. [ ] Input vazio: [comportamento]
2. [ ] Input muito longo (1000+ chars): [comportamento]
3. [ ] Caracteres especiais: [comportamento]
4. [ ] Concurrent actions: [comportamento]
5. [ ] Network offline: [comportamento]

**Validações**:
- [ ] ZERO crashes
- [ ] Errors descritivos (usuário entende)
- [ ] Graceful degradation

**Status**: ⏸️ PENDING / ✅ PASS / ❌ FAIL

**Evidência**: [error messages screenshots]

---

## 📊 RESULTADO BATCH

**Total Cenários**: 6
**Passed**: [X] ✅
**Failed**: [Y] ❌
**Pending**: [Z] ⏸️

**Decisão**:
- **SE 6/6 PASS**: ✅ Workflow 6a COMPLETO → Workflow 7a (Quality Gates)
- **SE 1+ FAIL**: ❌ BLOQUEIO → Corrigir falhas → Re-executar batch
- **SE 1+ PENDING**: ⏸️ AGUARDANDO → Completar pendentes → Re-avaliar

**Evidências Consolidadas**: [pasta screenshots/ OU arquivo evidences.md]
```

---

**Uso do Template**:
1. Copiar template para attempts.log no início Fase 13
2. Executar 6 cenários em BATCH (não sequencial)
3. Atualizar Status de cada cenário
4. Consolidar resultado final
5. Decidir: APROVAR / BLOQUEAR / AGUARDAR

---

### 13.2 Formato de Checklist Estruturado (PADRÃO OBRIGATÓRIO) ⭐

**Formato Aprovado pelo Usuário** (baseado em feat-modal-primeiro-acesso-web):

```markdown
## Edge Case E2: Re-login
**Cenário**: Usuário volta ao app depois de escolher onboarding

**Steps**:
1. Login com test-onboarding-2@example.com (que escolheu Opção 2)
2. Verificar redirect NÃO vai para /onboarding-choice
3. Deve ir direto para /dashboard (metadata persiste)
4. Screenshot 16: Dashboard com hábito "Meditar"

**Validação**:
- [ ] metadata onboarding_choice persistiu
- [ ] Não vê onboarding choice novamente
- [ ] Redirect correto para /dashboard
- [ ] Dados do usuário preservados
```

**Características do Formato**:
- ✅ **Título numerado** (Edge Case E2, Cenário E2E-1, etc.)
- ✅ **Cenário** em negrito com descrição clara
- ✅ **Steps** numerados e sequenciais
- ✅ **Validação** com checkboxes específicos
- ✅ **Screenshots** referenciados nos steps

---

### 13.2 Batch Validation Pattern (RECOMENDADO) 🚀

**Objetivo**: Executar TODOS cenários → Coletar screenshots → Aprovar em BATCH (1 pausa vs 4 pausas).

**Benefício**: -50% tempo validação (6h → 3h), -75% pausas (4 → 1), menor fadiga usuário.

**Baseado em**: ML-CONTEXT-05 (Checkpoint Assíncrono - Batch Permitido para validações relacionadas)

---

#### Metodologia Batch

**1. Executar Cenários Sequencialmente (SEM pausas)** usando formato estruturado:
```markdown
## Cenário E2E-1: Signup Web
**Cenário**: Novo usuário se cadastra via formulário web

**Steps**:
1. Navegar para /signup
2. Preencher email, senha, nome completo
3. Submit formulário
4. Screenshot 1: Redirect para /dashboard

**Validação**:
- [ ] Signup completou sem erros
- [ ] DB atualizado (lifetracker_profiles row criada)
- [ ] Redirect /dashboard funcionou
- [ ] Toast de sucesso exibido

---

## Cenário E2E-2: Signup WhatsApp
**Cenário**: Usuário inicia onboarding via WhatsApp

**Steps**:
1. Enviar mensagem "Oi" para bot WhatsApp
2. Bot responde com menu inicial
3. Usuário escolhe "Cadastrar"
4. Screenshot 2: Confirmação de cadastro

**Validação**:
- [ ] Phone validado corretamente
- [ ] Edge Function sucesso (200 OK)
- [ ] Profile criado no DB
- [ ] Bot responde confirmação

---

## Cenário E2E-3: Validação Cross-Channel
**Cenário**: Usuário cadastrado no WhatsApp faz login na web

**Steps**:
1. Login na web com phone cadastrado no WhatsApp
2. Verificar dados sincronizados
3. Screenshot 3: Dashboard com dados do WhatsApp

**Validação**:
- [ ] Login sucesso com phone
- [ ] Dados sincronizados (nome, preferências)
- [ ] Trigger disparou corretamente
- [ ] Log PostgreSQL confirmado
```

**2. Apresentar Batch Consolidado**:
```markdown
📸 **EVIDÊNCIAS BATCH (4 Cenários)**:

**Cenário 1: Signup Web**
![Screenshot 1](screenshots/scenario-1-signup-web.png)
- ✅ Signup completou
- ✅ DB atualizado
- ✅ Redirect funcionou

**Cenário 2: Signup WhatsApp**
![Screenshot 2](screenshots/scenario-2-signup-whatsapp.png)
- ✅ Phone validado
- ✅ Edge Function sucesso
- ✅ Profile criado

**Cenário 3: Validação Cross-Channel**
![Screenshot 3](screenshots/scenario-3-cross-channel.png)
- ✅ Trigger disparou
- ✅ Verificações invalidadas
- ✅ Log PostgreSQL confirmado

**Cenário 4: Constraint UNIQUE**
![Screenshot 4](screenshots/scenario-4-unique-constraint.png)
- ✅ Duplicação bloqueada
- ✅ Error code 23505
- ✅ Toast exibido

---

⏸️ **APROVAR BATCH (4 cenários)?**
- ✅ Aprovar todos (se todos passaram)
- ⚠️ Rejeitar parcial (especificar quais falharam)
```

**3. Aguardar 1 Aprovação (não 4)**

---

#### Quando NÃO usar Batch

❌ **Cenários independentes** (ex: signup Web + API externa não relacionada)
❌ **Ação crítica** (pode quebrar sistema, requer aprovação individual)
❌ **Contextos diferentes** (frontend + backend + DB em áreas desconectadas)

✅ **Usar Batch SE**:
- Cenários relacionados (mesmo fluxo E2E)
- Validação manual (não código)
- 3-5 cenários max (não 10+)

---

### Checklist Funcional
- [ ] Feature funciona (comportamento, dados, interações)
- [ ] Não quebrou features existentes
- [ ] UI correta (layout, cores, espaçamento)
- [ ] Responsivo OK (mobile < 640px, tablet, desktop)
- [ ] Performance < 500ms, sem travamentos
- [ ] Console limpo (F12 → sem erros)
- [ ] TypeScript OK (terminal)

### 13.3 Sistema de Loop de Validação (.context/validation-loop.md) 🔄⭐

**CRÍTICO**: Sistema aprovado pelo usuário - **"funcionou muitíssimo bem"**

**O que é**: Arquivo `.context/{branch}_validation-loop.md` que registra CADA iteração de teste/fix.

**Benefícios Comprovados**:
- ✅ **Zero perda de contexto** entre iterações
- ✅ **Rastreabilidade completa** (24 iterações documentadas)
- ✅ **Aprendizado incremental** (cada bug documentado)
- ✅ **Meta-learnings ricos** (3 bugs → 3 prevenções)
- ✅ **Histórico auditável** (RCA de cada problema)

**⚠️ Meta-Learning (ADR-027)**: **Timing Coincidence Trap** - Se fix + test pass dentro de 5min, SEMPRE validar:
1. Test negative case (reproduzir sintoma SEM o fix)
2. Revert fix (remover temporariamente)
3. Re-test (confirmar sintoma retorna)
**Regra**: Timing coincidence ≠ causation (60% false positives sem validação)

---

#### Template de Iteração (Padrão Obrigatório)

```markdown
### Iteração X (STATUS - Título Descritivo)
- **Data**: 2025-11-15 18:35
- **Tentativa**: [O que está sendo testado]
- **Cenário/Steps**: [Se aplicável, usar formato estruturado]
  - Cenário: [descrição]
  - Steps: [lista numerada]
  - Validação: [checkboxes]
- **Problema Reportado**: [Se falhou, descrever sintomas]
- **Sintomas**: [Lista de evidências - console, UI, DB]
- **Resultado**: ✅ SUCESSO | ❌ FALHA | 🔍 INVESTIGAÇÃO
- **RCA (5 Whys)**: [Se falhou, identificar causa raiz]
  1. Por quê X? → Y
  2. Por quê Y? → Z
  3. Por quê Z? → W
  4. Por quê W? → V
  5. **Causa Raiz**: [Causa sistêmica, não sintoma]
- **Fix Aplicado**: [Mudanças específicas]
- **Evidências**: [Código, logs, screenshots]
- **Meta-Learning**: [O que aprendeu? Como prevenir?]
- **Próxima**: [Próximo passo]
```

**Exemplo Real (feat-modal-primeiro-acesso-web)**:

```markdown
### Iteração 23 (✅ SUCESSO TOTAL - Assessment Suggestions Geradas!)
- **Data**: 2025-11-15 19:10
- **Tentativa**: Reteste completo após fix frontend
- **Testes Executados**:
  - ✅ Completar Assessment (8 áreas)
  - ✅ Toast exibido: "Aguarde enquanto a IA analisa suas respostas..."
  - ✅ Console: `[Assessment] Analysis success: {success: true, suggestionsCount: 24}`
  - ✅ Redirect /results com 24 sugestões personalizadas
  - ✅ Dashboard: Botão "Sugestões" habilitado (suggestionsCount === 24)
- **Resultado**: ✅ **ASSESSMENT SUGGESTIONS 100% VALIDADAS!**
- **Meta-Learning (3 Bugs Resolvidos)**:
  1. **Bug #1**: Edge Function usava tabelas sem prefixo `lifetracker_`
     - Root Cause: Migration adicionou prefixo mas função não atualizada
     - Fix: Atualizar 3 nomes de tabelas
     - Prevenção: Checklist "Schema-First Validation" (REGRA #8)
  2. **Bug #2**: Edge Function usava Lovable API (obsoleto)
     - Root Cause: Migração para Gemini foi apenas em `generate-dynamic-question`
     - Fix: Migrar `analyze-assessment` para Gemini API direto
     - Prevenção: Documentar padrões de API (ADR)
  3. **Bug #3**: Frontend não validava retorno de Edge Function
     - Root Cause: `supabase.functions.invoke()` sem destructure `{ error }`
     - Fix: Adicionar error handling + logs
     - Prevenção: Pattern "SEMPRE validar retorno de async calls"
- **Arquivos Modificados**:
  - `supabase/functions/analyze-assessment/index.ts` (3 tabelas + Gemini API)
  - `src/pages/Assessment.tsx` (error handling linha 278-287)
- **Próxima**: Edge Case E1 (Assessment Prévio)
```

---

#### Quando Registrar Iteração

**SEMPRE registrar**:
- ✅ **Antes de testar**: Iteração iniciada com "Tentativa"
- ✅ **Após teste**: Resultado (sucesso/falha)
- ✅ **Se falhou**: RCA completo (5 Whys)
- ✅ **Após fix**: Fix aplicado + evidências
- ✅ **Meta-learning**: O que aprendeu

**Frequência**: **A CADA interação** usuário-LLM durante validação.

---

#### Checklist Iteração
- [ ] Registrei tentativa ANTES de testar?
- [ ] Documentei resultado (✅ | ❌ | 🔍)?
- [ ] Se falhou: Executei RCA (5 Whys)?
- [ ] Documentei fix aplicado?
- [ ] Adicionei meta-learning?
- [ ] Defini próxima ação?

---

### Edge Cases
- [ ] **Dados vazios**: Exibir mensagem amigável (não quebrar UI)
- [ ] **Muitos dados**: Testar com 100+ itens (verificar paginação/scroll virtual)
- [ ] **Dados inválidos**: Validação clara com mensagens de erro (form validation)
- [ ] **Offline**: DevTools → Network → Offline (se feature usa API externa)
- [ ] **Paths críticos** (testar TODOS os caminhos):
  - Happy path (fluxo principal sem erros)
  - Error path (falha de API, timeout, 500)
  - Recovery path (retry automático, fallback, cache)
  - Navigation path (voltar, cancelar, fechar modal)
- [ ] **Múltiplos usuários**: Testar com 2+ contas (validar RLS, isolamento de dados)
- [ ] **Performance edge**: Response > 1MB, renderização > 100 componentes

### Integração
- [ ] Supabase OK (busca, mutations, RLS)
- [ ] Queries < 500ms (DevTools → Network)
- [ ] Sem vazamento memória (interagir 1-2min)
- [ ] Build produção (`npm run build`)

---

## 🔄 Fase 14: Ciclo de Feedback

### 14.1 Problemas ⚠️

**NÃO prossiga! Descreva**:
- O que está errado?
- Como reproduzir?
- Esperado vs. atual?
- Screenshot/video?

**Fluxo**: Descreve → IA corrige (`fix:`) → Testes auto (Fase 11) → Testa (Fase 13) → Repete até perfeito

**🐛 Complexos**: Use `debug-complex-problem.md` (5 agentes, 5 Whys)

**Iterações esperadas**: 2-4 (normal)

### 14.2 Tudo OK ✅

**Confirme**:
- ✅ TODOS checkboxes marcados
- ✅ Performance OK, UI/UX como esperado
- ✅ Sem erros console, build OK

**Digite**: `Aprovar` ou `OK` ou `Funciona perfeitamente`

---

## ✅ GATE 3 CHECKLIST

**⛔ NÃO prosseguir sem ✅ em TODOS**

**Funcionalidade**
- [ ] Feature funciona conforme especificado
- [ ] Casos de uso testados (happy + edge)
- [ ] Integração OK

**Design & UX**
- [ ] Layout correto
- [ ] Cores consistentes
- [ ] Responsivo (375px, 768px, 1440px)
- [ ] Navegação teclado (Tab, Enter, Esc)
- [ ] Contraste WCAG AA
- [ ] Animações < 16ms/frame

**Qualidade Técnica**
- [ ] Console limpo (0 erros, 0 warnings críticos)
- [ ] Vite compila sem TS errors
- [ ] Performance (queries < 500ms, interações < 100ms)
- [ ] Build produção funciona
- [ ] TypeScript compila

**Integração**
- [ ] Supabase: salva/carrega OK
- [ ] RLS: não vê outros usuários
- [ ] Mutations funcionam
- [ ] Sem vazamento memória
- [ ] Queries otimizadas (sem N+1)

**Edge Cases**
- [ ] Dados vazios OK
- [ ] Muitos dados (> 100)
- [ ] Dados inválidos OK
- [ ] Offline testado
- [ ] Erros tratados

**Validação Executada**
- [ ] Batch validation executado (4 cenários em 1 aprovação) OU
- [ ] Validação individual justificada (cenários críticos/independentes)
- [ ] Screenshots de TODOS cenários coletados
- [ ] Aprovação recebida (batch ou individual)

**Se item NÃO está ✅**: Voltar Fase 14.1!

---

## ✋ GATE 3: Confirmação

**⚠️ PARADA OBRIGATÓRIA**

**Decisão**:
- **✅ APROVAR** - Todos checkboxes ✅
- **⚠️ AJUSTAR** - Problemas, volta 14.1

**Aguardando confirmação...** 🚦

---

## 🧠 Meta-Learning

**⚠️ NÃO PULE**: Fundamental para evolução.

### Questões (TODAS)

**1. Eficiência (1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Qual fase? Como melhorar?

**2. Iterações:**
- [ ] Número: __
- [ ] Se > 3: O que causou? Como automatizar?

**3. Gaps:**
- [ ] Validação faltou? Gate falhou?
- [ ] Comando repetido 3+ vezes? Automatizar?

**4. RCA (se problema):**
- [ ] Problema: [breve]
- [ ] 5 Whys? Causa raiz sistêmica?
- [ ] Afeta múltiplas features? (SE NÃO: descartar)
- [ ] Meta-learning previne?

### Ações (Se Aplicável)
- [ ] Workflow precisa melhorias?
- [ ] CLAUDE.md precisa seção?
- [ ] Novo script? Nome + função
- [ ] ADR necessário?

**ROI**: [Ex: "20min/feature" ou "Previne 2h debug"]

**Só learnings SISTÊMICOS** (não pontuais)

**Validar tamanho**:
```bash
wc -c .windsurf/workflows/add-feature-6a-user-validation.md  # ✅ < 12000
```

**Se > 11k**: Remover exemplos, consolidar checklists, extrair para docs/

---

## 🧠 MEMORY UPDATE (Pós-Workflow - OPCIONAL)

**APLICÁVEL**: Se validação revelou padrões UX sistêmicos (recorrentes em 2+ features).

**Checklist**:
- [ ] Executou RCA 5 Whys? → Learning para memory/debugging.md
- [ ] Bug UX recorrente (2+ features)? → Pattern para memory/validation.md
- [ ] Edge case não coberto (2+ features)? → Checklist para memory
- [ ] Iterações > 5 (2+ features)? → Meta-learning sobre processo

**Ação (SE aplicável)**:
1. Identificar memory file relevante (debugging.md, validation.md, workflows.md)
2. **SUGERIR ao usuário** com template completo + aguardar aprovação

**Template Sugestão**:
```
🧠 SUGESTÃO MEMÓRIA GLOBAL:
Arquivo: ~/.claude/memory/[arquivo].md
Seção: [Life Track Growth ou Geral]

Adicionar:
---
### [Título Padrão UX] (Workflow 6a - feat/branch)
**Problema**: [Comportamento não esperado detectado em validação]
**Root Cause**: [5 Whys]
**Solução**: [Como resolver]
**Prevenção**: [Checklist validação / test case]
**Exemplo**: [Cenário + steps + validação]
**Evidências**: [validation-loop.md, screenshots]
**Features Afetadas**: [feat-1, feat-2]
---

⏸️ APROVAR adição? (yes/no/edit)
```

**Por quê**: Validação manual frequentemente revela padrões UX sistêmicos. Se mesmo bug/edge case aparece em 2+ features, é candidato a memory global (previne recorrência).

**Ver**: `~/.claude/CLAUDE.md` REGRA #20 (Sistema de Memória Global)

---

## ⏭️ CONTINUAÇÃO

**Continua em**: [Workflow 6b - RCA e Edge Cases](.windsurf/workflows/add-feature-6b-rca-edge-cases.md)

**Próximas etapas**:
- Análise Root Cause
- Testes edge cases
- Validação final

---

## 📝 Atualização Docs

**Obrigatório**
- [ ] Atualizar `docs/TASK.md`
- [ ] Atualizar `docs/PLAN.md` (se mudança estratégica)

**Se Criou Docs**
- [ ] Adicionar em `docs/INDEX.md`, `README.md`
- [ ] Nomes consistentes
- [ ] "Última atualização"

**Se Decisão Arquitetural**
- [ ] Criar ADR `docs/adr/`
- [ ] Referenciar `docs/ARCHITECTURE.md`

**Boas Práticas**: Não criar docs desnecessários, manter atualizados, links absolutos (`/docs/`), versionamento

---

## 🚨 REGRA CRÍTICA: ANTI-ROI

**NUNCA calcule ou mencione**:
- ❌ ROI (Return on Investment)
- ❌ Tempo de execução/produção
- ❌ "Horas economizadas"
- ❌ Estimativas temporais (Xmin vs Ymin)

**Por quê**:
- Projeto desenvolvido por IA (não humanos)
- IA executa tarefas em paralelo (não linear)
- Cálculos consomem tokens sem valor
- Polui documentação com dados irrelevantes

**Permitido**:
- ✅ Evidências concretas (código, logs, testes)
- ✅ Comparações qualitativas ("mais rápido", "mais eficiente")
- ✅ Métricas técnicas (latência, throughput, memory usage)

**Regra**: NEVER guess time/ROI. Use dados concretos ou não mencione.

---

## ✅ FASE 4: CHECKPOINTS (REGRA #13 - Uma Ação Por Vez)

**CRÍTICO**: Durante todo este workflow, SEMPRE executar checkpoint após CADA ação atômica.

### 4.1. O que é uma Ação Atômica?

**Ação atômica** = Menor unidade testável e reversível.

**Exemplos deste workflow (User Validation)**:
- ✅ "Testar fluxo de login manualmente"
- ✅ "Validar responsividade em mobile (screenshot)"
- ✅ "Executar teste E2E com Playwright"
- ✅ "Validar performance de query (< 2s)"
- ✅ "Coletar feedback do usuário sobre feature X"
- ❌ "Validar tudo de uma vez" (NÃO atômico - múltiplas ações)

### 4.2. Checkpoint Obrigatório (Após Cada Ação)

**Usar script automatizado**:
```bash
./scripts/checkpoint.sh "descrição da ação executada"
```

**Ou manualmente**:

**Template de Checkpoint**:
```
✅ AÇÃO COMPLETA: [descrição da ação]

📸 EVIDÊNCIA:
[screenshot ANTES/DEPOIS, log de teste, feedback usuário]

🔍 VALIDAÇÃO:
- [x] Teste executado com sucesso
- [x] Comportamento esperado confirmado
- [x] Screenshot capturado (se UI)
- [x] Próxima ação identificada

🎯 PRÓXIMA AÇÃO PROPOSTA:
[descrição da próxima ação]

⏸️ AGUARDANDO APROVAÇÃO do usuário para continuar.
```

### 4.3. Checklist Checkpoint (Executar a Cada Ação)

- [ ] **Executei apenas 1 ação?**
- [ ] **Mostrei evidência ao usuário?** (screenshot, log, feedback)
- [ ] **Usuário validou?** (aprovação explícita)
- [ ] **Documentei em `.context/`?** (attempts.log + validation-loop.md)
- [ ] **Identifiquei próxima ação?** (próximo teste a executar)

### 4.4. Exemplo de Aplicação (User Validation)

**Fluxo com Checkpoints**:

```
1. AÇÃO: "Screenshot ANTES da mudança (baseline)"
   → Executar → Checkpoint → Aprovação

2. AÇÃO: "Testar fluxo de login manualmente"
   → Executar → Checkpoint → Aprovação

3. AÇÃO: "Screenshot DEPOIS (validar UI)"
   → Executar → Checkpoint → Aprovação

4. AÇÃO: "Executar teste E2E com Playwright"
   → Executar → Checkpoint → Aprovação

5. AÇÃO: "Validar performance (latência < 2s)"
   → Executar → Checkpoint → Aprovação
```

### 4.5. Quando NÃO Aplicar Checkpoint

**Exceções** (ações podem ser agrupadas):
- ✅ **Testes E2E suite**: Se suite rápida (< 1min total)
- ✅ **Screenshots múltiplos**: Se mesma página, viewports diferentes

**MAS**: Mesmo nas exceções, mostrar resultado ANTES de próxima ação.

### 4.6. Benefícios no User Validation

**Eficiência**:
- ✅ Bug UI identificado ANTES de deploy
- ✅ Performance validada ANTES de usuários reais
- ✅ Zero retrabalho (cada teste validado incrementalmente)
- ✅ Snapshot ANTES/DEPOIS comparação exata

**Colaboração**:
- ✅ Usuário vê validação incremental (login → UI → E2E → performance)
- ✅ Feedback loop rápido (30seg por teste)
- ✅ Correção imediata (se teste falhar)

### 4.7. Documentação Automática

Cada checkpoint DEVE logar em `.context/attempts.log` E `validation-loop.md`:

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] CHECKPOINT: [ação] - SUCCESS" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] VALIDATION: [teste] - PASS" >> .context/${BRANCH_PREFIX}_validation-loop.md
```

**Ver**: REGRA #13 em `.claude/CLAUDE.md` para detalhes completos.

---

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 6a: User Validation ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Reframing pré-validação (problema CERTO confirmado)
  - Testes manuais completos (funcionalidade + edge cases)
  - Ciclo de feedback (iterações até perfeito)
  - GATE 3 aprovado (todos checkboxes validados)
- **Outputs**:
  - Feature funcionando perfeitamente
  - Screenshots de validação
  - Problemas reportados e corrigidos (se aplicável)
- **Next**: Workflow 6b (RCA & Edge Cases)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 6a (User Validation) concluído com sucesso.

**Feature validada**: [Descrever feature testada]

**Próximo passo**: Executar Workflow 6b (RCA & Edge Cases) para análise de causa raiz (se bugs encontrados).

---

## Próximos Passos

- [ ] Executar Workflow 6b (RCA & Edge Cases)
- [ ] Documentar RCA (se problemas encontrados)
- [ ] Prosseguir para Workflow 7 (Quality Gates)

---

## Decisões Pendentes

Nenhuma (GATE 3 aprovado).

EOF

# Substituir seção no arquivo original (preservar "Última Atualização")
sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar validation-loop.md (CRÍTICO para Workflow 6)

```bash
cat >> .context/${BRANCH_PREFIX}_validation-loop.md <<EOF

### Iteração N ([✅ SUCESSO / ❌ FALHA])
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Tentativa**: [O que tentei implementar]
- **Resultado**: [O que aconteceu]
- **Erro** (se falha): [Mensagem de erro completa]
- **Causa Root** (se falha): [Análise RCA]
- **Fix Aplicado** (se falha): [O que mudei]
- **Screenshot** (se sucesso): [Link para validação]
EOF
```

### F.4. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se decidimos ajustar solução após reframing
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 6a - User Validation
- **Decisão**: [Descrever decisão - ex: "Ajustar UI após reframing"]
- **Por quê**: [Motivo - ex: "Problema CERTO era compartilhamento, não apenas export"]
- **Trade-off**: [Ex: "+1h desenvolvimento, mas solução melhor"]
- **Alternativas consideradas**: [Listar opções rejeitadas]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.5. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 6a (User Validation) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 3: APROVADO - Feature validada manualmente" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] VALIDATION: [N iterações até sucesso]" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.6. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei validation-loop.md (tentativas e resultado)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + GATE 3)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

**Workflow criado**: 2025-10-27 | **Dividido**: 2025-11-04 | **Atualizado**: 2025-11-20
**Parte**: 6a de 11 (Parte 1 de 2)
**Próximo**: Workflow 6b

**v2.1** (2025-11-20):
- 🆕 Fase 13: Template Checklist 6 Cenários Batch
- 🔧 Validação estruturada (F1, F2, R1, C1, P1, E1)
- ✅ Evidências obrigatórias por cenário
