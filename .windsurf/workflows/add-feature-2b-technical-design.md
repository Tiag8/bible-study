---
description: Workflow Add-Feature (2b/11) - Technical Design & Validation
auto_execution_mode: 1
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 2a

**Este é o Workflow 2b - Continuação de:**

← [Workflow 2a - Solutions](.windsurf/workflows/add-feature-2a-solutions.md)

**Pré-requisito**: Solução deve ter sido escolhida e documentada no Workflow 2a.

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `README.md` - Descrição do projeto
- `AGENTS.md` - Comportamento dos agents
- `.windsurf/workflows` - Todos workflows em etapas (arquivos diferentes)
- `docs/` - Todos documentos importantes
- `scripts/` - Todos scrips importantes

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler INDEX.md (Guia de Leitura)

```bash
cat .context/INDEX.md
```

**Entender**:
- Ordem de leitura dos arquivos
- O que cada arquivo faz
- Checklists obrigatórios

### 0.2. Ler Context Files (Ordem Definida em INDEX.md)

```bash
# Prefixo da branch (ex: feat-members)
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

# 1. Onde estou agora?
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 2. Estado atual resumido
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 3. Decisões já tomadas
cat .context/${BRANCH_PREFIX}_decisions.md

# 4. Histórico completo (últimas 30 linhas)
tail -30 .context/${BRANCH_PREFIX}_attempts.log
```

### 0.3. Validação Context Loaded

**Checklist**:
- [ ] Li INDEX.md?
- [ ] Li workflow-progress.md (onde estou)?
- [ ] Li temp-memory.md (estado atual)?
- [ ] Li decisions.md (decisões já tomadas)?
- [ ] Li últimas 30 linhas de attempts.log?

**Se NÃO leu**: ⛔ PARAR e ler AGORA.

### 0.4. Log Início Workflow

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 2b (Technical Design) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## ⚠️ REGRA: 5 AGENTES OBRIGATÓRIOS (100% Features)

**CRÍTICO**: SEMPRE executar os 5 agentes abaixo em PARALELO. Não opcional.

**Benefício**: 4x faster (15-20min vs 1-2h sequencial), análise completa, zero gaps.

**5 Agentes Obrigatórios**:
1. **Agent Schema Design**
   - Analisa database schema (tabelas, colunas, constraints, índices)
   - Valida prefixos `lifetracker_`, RLS policies, migrations
   - Output: `.context/{branch}_technical-design-agent-1-schema.md`

2. **Agent Trigger Design**
   - Analisa triggers PostgreSQL, functions, procedures
   - Valida lógica de invalidação, sync cross-channel
   - Output: `.context/{branch}_technical-design-agent-2-trigger.md`

3. **Agent Backend Design**
   - Analisa Edge Functions (Deno), APIs, webhooks
   - Valida runtime compatibility, secrets, error handling
   - Output: `.context/{branch}_technical-design-agent-3-backend.md`

4. **Agent Frontend Design**
   - Analisa componentes React, hooks, context, state
   - Valida feature-first structure, custom hooks, UI/UX
   - Output: `.context/{branch}_technical-design-agent-4-frontend.md`

5. **Agent Testing & RCA**
   - Analisa cenários teste (E2E, unit, integration)
   - Valida riscos, edge cases, RCA preventivo
   - Output: `.context/{branch}_technical-design-agent-5-testing-rca.md`

**Exemplo de Execução** (usar Task tool 5x em 1 mensagem):
```markdown
Vou executar os 5 agentes em paralelo:
[Task Agent 1 - Schema]
[Task Agent 2 - Trigger]
[Task Agent 3 - Backend]
[Task Agent 4 - Frontend]
[Task Agent 5 - Testing & RCA]
```

**⚠️ SE LLM ESQUECER**: Workflow DEVE bloquear e avisar "Faltam X agentes. Executar TODOS 5."

---

# Workflow 2b/11: Technical Design & Validation

Este é o **segundo workflow (parte B)** de 11 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 3: Design Técnico Detalhado
- Fase 4: Validação da Solução
- Root Cause Analysis (quando aplicável)
- ADR (Architecture Decision Record) se necessário

---

## 🔍 Root Cause Analysis (RCA) - QUANDO APLICÁVEL

> **💡 MCPs Úteis**: `context7` (validar APIs libs), `gemini-cli` (análise arquitetura)
> Ver: `docs/integrations/MCP.md`

**⚠️ USAR APENAS SE**: Você está resolvendo um problema/bug arquitetural ou decisão técnica problemática.

**PULAR ESTA SEÇÃO SE**: Esta é uma nova feature sem problema prévio.

---

### Quando Usar RCA Neste Workflow

Use RCA na **Fase 3 (Technical Design)** quando:
- ✅ Arquitetura atual não escala (ex: state management inadequado)
- ✅ Design pattern causou problemas recorrentes
- ✅ Performance degradou por decisão arquitetural
- ✅ Refatoração necessária por design ruim

**Exemplos**:
- "State machine atual não suporta novos estados" → RCA necessário
- "Adicionar novo card ao dashboard" → RCA NÃO necessário (nova feature)
- "Cache strategy causa bugs intermitentes" → RCA necessário

---

### Técnica: 5 Whys para Análise Arquitetural

**Template**:
```
1. Por quê problema ocorre? → [sintoma]
2. Por quê disso? → [causa próxima]
3. Por quê? → [causa intermediária]
4. Por quê não foi prevenido? → [falha design]
5. Por quê? → [CAUSA RAIZ]

**Ação**: [Como resolver + prevenir recorrência]
```

---

### Exemplos de RCA na Prática

**Email**: metadata column missing → migration não criou → código before schema → **Causa**: Sem "Schema First" gate → **Ação**: Validar schema antes de código

**Webhook**: Parsing falhou → API mudou → sem validação → **Causa**: Não validar APIs externas → **Ação**: Zod validation + ADR

**State**: Machine não escala → useState local → **Causa**: MVP sem "path to scale" → **Ação**: Context API/Zustand + ADR

---

### Como Aplicar RCA na Solução Escolhida

1. Identificar problema arquitetural
2. Executar 5 Whys até causa raiz
3. Validar que solução resolve CAUSA RAIZ (não sintomas)
4. Documentar prevenção (ADR, checklists, tests)
5. Implementar gates preventivos

---

### Benefícios do RCA:
- ✅ Evita sintomas vs causa raiz
- ✅ Previne recorrência (design melhor)
- ✅ Identifica falhas sistêmicas
- ✅ Documenta aprendizado

---

### Quando PULAR RCA

**NÃO usar RCA se**:
- ❌ Nova feature sem problema prévio
- ❌ Melhoria incremental simples
- ❌ Problema é óbvio (ex: typo, bug trivial)
- ❌ Primeira ocorrência sem padrão

**Economiza tempo**: RCA é poderoso mas tem overhead. Use quando necessário.

---

### Próximo Passo Após RCA

Se identificou causa raiz sistêmica, documentar em:

1. **Meta-Learning** (Workflow 8, Fase 17):
   - Lesson learned sobre arquitetura
   - Pattern a evitar/adotar
   - Processo a adicionar

2. **ADR** (Architecture Decision Record):
   - Se decisão arquitetural foi causa raiz
   - Documentar nova decisão com contexto do RCA
   - Exemplo: ADR 007 (Adaptive Parser) surgiu de RCA

3. **TROUBLESHOOTING.md**:
   - Se procedimento de debug específico
   - Como identificar problema similar no futuro
   - Checklist de validação

---

## 📋 Fase 3: Design Técnico Detalhado

**Solução escolhida**: [A / B / C / Customizada]

### 🔍 Pré-requisito: Validar Sincronização DB (OBRIGATÓRIO)

**SEMPRE executar ANTES de análise de schema**:

```bash
# Validar sincronização DB real vs types.ts vs migrations
./scripts/validate-db-sync.sh

# Se defasado, regenerar types
./scripts/regenerate-supabase-types.sh
```

**Por quê**:
- DB real pode diferir de migrations (falhas silenciosas)
- types.ts pode estar desatualizado (>3 dias)
- Análise baseada em código desatualizado = falsos positivos

**Regra**: NUNCA confiar em código estático. Source of truth = DB real.

---

### 🔍 Pré-Design: Duplication Check (OBRIGATÓRIO)

**CRÍTICO**: Validar que solução NÃO duplica funcionalidade existente ANTES de design detalhado.

#### Ferramentas de Validação

**1. Grep Codebase** (buscar implementações similares):
```bash
# Buscar funcionalidade similar
grep -r "parse\|extract\|transform" supabase/functions/_shared/
grep -r "cache\|stale\|invalidate" src/hooks/
grep -r "auth\|login\|otp" supabase/functions/

# Se encontrar → Analisar se reutilizar vs criar novo
# Perguntar: "Esta função JÁ faz o que preciso?"
```

**2. Testar Solução Atual** (antes de redesenhar):
```typescript
// Exemplo: Testar se Gemini JÁ extrai frequência
const userMessage = "Quero treinar 3x por semana";
const result = await callGemini(userMessage, HABIT_TOOLS);

// Se result.tool_calls[0].name === "create_habit"
// E result.tool_calls[0].parameters.target_frequency === 3
// → NÃO criar parser, Gemini JÁ faz!
```

**3. Consultar Docs Oficiais** (MCP context7):
```bash
# Validar se biblioteca/framework JÁ tem feature
context7_get_library_docs({
  libraryID: "/google/generative-ai",  # Gemini
  topic: "function calling structured output",
  tokens: 3000
})

# Se docs confirmam feature nativa → NÃO reimplementar
```

**4. Análise de Duplicação** (código atual):
```bash
# Buscar padrões similares
find supabase/functions -name "*.ts" -exec grep -l "parse\|extract" {} \;

# Comparar implementações (se encontrar múltiplas)
diff file1.ts file2.ts

# Decisão:
# - Se idênticas → Consolidar em 1
# - Se complementares → Documentar diferenças
# - Se redundantes → Deletar menos usada
```

#### Checklist Validação

**Antes de prosseguir para "Arquitetura Detalhada"**:
- [ ] **Grepei codebase** por funcionalidade similar?
  - Arquivos encontrados: [listar ou "nenhum"]
  - Análise: [reutilizar / criar novo / consolidar]

- [ ] **Testei solução atual** e FALHOU?
  - Teste executado: [código/comando]
  - Resultado: [success → NÃO criar / failed → prosseguir]
  - Evidência: [log/screenshot]

- [ ] **Consultei docs oficiais** (biblioteca/framework)?
  - Fonte: [URL + seção + data]
  - Feature nativa existe? [sim/não]
  - Se SIM: [link doc + exemplo uso]

- [ ] **Analisei duplicações** (se encontradas)?
  - Arquivos comparados: [listar]
  - Decisão: [consolidar / deletar / manter separado]
  - Justificativa: [por quê não é duplicação OU por quê manter ambos]

#### Resultado Esperado

- ✅ **Zero duplicação** → Prosseguir para Design
- ⚠️ **Duplicação parcial** → Reutilizar existente + complementar (não recriar)
- ❌ **Duplicação total** → ⛔ CANCELAR design, usar existente

#### Ação se Duplicação Detectada

- ⛔ **PAUSAR** Workflow 2b
- 🔙 **VOLTAR** para Workflow 2a (reprojetar solução)
- 📝 **DOCUMENTAR** por quê duplicação não foi detectada no Gate 1.5
- ✅ **APRENDER** (meta-learning) para prevenir recorrência

#### Exemplos Reais (Histórico)

**1. ❌ Duplicação Detectada Tarde (Parser)**
- **Workflow 2a**: Gate 1.5 não executado corretamente
- **Workflow 2b**: Parser criado (680 linhas)
- **Descoberta**: Commit e380c00 (revert após identificação)
- **Custo**: 2h desenvolvimento + 1h revert + doc
- **Prevenção**: Este checklist adicionado

**2. ✅ Duplicação Detectada Cedo (Cache Custom)**
- **Workflow 2a**: Gate 1.5 bloqueou (React Query já tem staleTime)
- **Workflow 2b**: NÃO iniciado (prevenido)
- **Ação**: Documentar uso React Query (5min)
- **Economia**: ~8h desenvolvimento + manutenção futura

---

### Arquitetura Detalhada

**Componentes a criar/modificar**:
```
[Lista de componentes com responsabilidades]
```

**Hooks customizados**:
```
[Lista de hooks com lógica de negócio]
```

**Database Changes**:
```sql
-- Migrations necessárias
-- Incluir DDL completo
```

**API/Queries**:
```typescript
// Queries Supabase ou API calls
```

**Estado e Fluxo de Dados**:
```
[Diagrama ou descrição do fluxo de dados]
```

### Dependências

**⚠️ METODOLOGIA: Escolha de Ferramentas**

**4 passos obrigatórios**:
1. **Check Current**: `cat package.json | jq '.dependencies'`
2. **Verify Versions**: `npm info @package-name version`
3. **Suggest 2-3 Options**: Incluir "usar existente" como opção
4. **Comparison Table**:
   | Critério | Opção A | Opção B | Opção C |
   |----------|---------|---------|---------|
   | Precisão | 85-90% | 70-75% | 85-90% |
   | Latência | +200ms | Base | +200ms |
   | Custo | +20% | Base | +20% |
   | Uso Atual | ✅ | ❌ | ✅ |
   | ★ | ⭐ | - | ⭐⭐ |

**Justificativa**: Por que esta opção vs. alternativas?

---

## ✅ Fase 4: Validação da Solução

### Checklist de Viabilidade Técnica

- [ ] Solução é compatível com stack atual (React 18.3 + TypeScript 5.8 + Vite 5.4 + Supabase)
- [ ] Database schema suporta a feature (ou migrations planejadas)
- [ ] Performance targets são atingíveis (< 2s dashboard, < 3s AI responses)
- [ ] Segurança validada (RLS policies, secrets management)
- [ ] Custos de AI dentro do orçamento ($11-15/mês para 100 usuários)
- [ ] Dependencies não introduzem vulnerabilidades
- [ ] Testes são viáveis (unit + integration)
- [ ] Não quebra features existentes (backward compatibility)

### Análise de Impacto

**Features afetadas**:
- [Lista de features que podem ser impactadas]

**Mitigações**:
- [Como minimizar impacto em features existentes]

### Riscos Técnicos Identificados

1. **[Risco 1]**:
   - **Severidade**: Alta/Média/Baixa
   - **Mitigação**: [Como resolver]

2. **[Risco 2]**:
   - **Severidade**: Alta/Média/Baixa
   - **Mitigação**: [Como resolver]

---

## 🚨 Validação Anti-Over-Engineering (OBRIGATÓRIO)

**CRÍTICO**: SEMPRE validar design técnico antes de aprovar.

### Checklist YAGNI/KISS
- [ ] **Design resolve problema REAL** (não edge cases hipotéticos)?
  - Problema documentado: [onde? evidência?]
  - vs "pode acontecer no futuro" ❌

- [ ] **Existe design mais SIMPLES**?
  - Alternativa simplificada: [descrever]
  - Por que não funciona: [evidência técnica]

- [ ] **Complexidade justificada por EVIDÊNCIA**?
  - Benchmark/docs oficiais: [link]
  - Caso real de uso: [exemplo concreto]
  - Relevância ao projeto: [como se aplica]

- [ ] **Posso validar com POC (10% do código)**?
  - POC: [prova de conceito mínima]
  - Critério de sucesso: [métrica mensurável]

### Red Flags Detectados?
- [ ] ❌ Mais de 3 camadas de abstração
- [ ] ❌ Padrões complexos para problema simples
- [ ] ❌ Otimização prematura (sem evidência de gargalo)
- [ ] ❌ Dependências "nice-to-have" (não must-have)

**Se 2+ red flags**: ⛔ REJEITAR design, simplificar

**Exemplo Real**:
- ❌ Implementar caching distribuído para 10 usuários
- ✅ useState + React Query (escala até 1000+ usuários)

**Ver**: `.claude/CLAUDE.md` → REGRA #10 Anti-Over-Engineering

---

## 📝 ADR (Architecture Decision Record) - SE NECESSÁRIO

**⚠️ ANTES DE CRIAR ADR**: Verificar ADRs existentes!

```bash
# Listar ADRs existentes
ls -1 docs/adr/

# Ver último número de ADR
ls -1 docs/adr/ | grep -E "^ADR-[0-9]+" | tail -1
```

**Criar ADR quando**:
- ✅ Decisão arquitetural significativa (state management, API design, etc)
- ✅ Trade-off importante foi feito (performance vs. simplicidade)
- ✅ Padrão novo foi introduzido no projeto
- ✅ RCA identificou necessidade de mudança arquitetural

**Não criar ADR duplicado**:
- ❌ Se ADR similar já existe, atualizar o existente (adicionar seção "Updates")
- ❌ Se ADR supersede anterior, marcar anterior como "Superseded by ADR-XXX"

**Template ADR** (`docs/adr/ADR-[número]-[título].md`):

```markdown
# ADR [número]: [Título]
**Status**: Proposto | Aceito | Rejeitado | Deprecated | Superseded by ADR-XXX
**Data**: YYYY-MM-DD

**Contexto**: Problema a resolver

**Decisão**: Solução escolhida

**Consequências**:
- Positivas: [benefícios]
- Negativas: [trade-offs]

**Alternativas**: [Opções rejeitadas e por quê]

**Referências**: [Workflow/docs relacionados]
```

---

## ✅ Checkpoint: Design Técnico Validado!

**Validações completas**:
- ✅ 5 agentes executados em paralelo (não sequencial)
- ✅ 5 arquivos `.context/*_technical-design-agent-*.md` criados
- ✅ RCA executado (se aplicável)
- ✅ Design técnico detalhado
- ✅ Viabilidade confirmada
- ✅ Riscos identificados e mitigados
- ✅ ADR criado (se necessário)

---

## 👿 Advogado do Diabo: Validação Técnica (OBRIGATÓRIO)

**ANTES de Risk Analysis**, validar:

### Checklist de Validação
- [ ] **E se o oposto for verdade?** (ex: arquitetura NÃO escala?)
- [ ] **Problema é sintoma sistêmico?** (RCA aplicado se sim)
- [ ] **Fontes consultadas?**
  - [ ] Código similar (src/...), migrations, ADRs, padrões
- [ ] **Stack validado?** (package.json, dependencies, database schema)
- [ ] **Dependências atualizadas?** (`npm info X version`)
- [ ] **RCA se aplicável?** (5 Whys completos, causa raiz documentada)
- [ ] **Validação pré-implementação?** (POC necessário? Rollback plan?)

**Resultado**: ✅ APROVADO | ⚠️ AJUSTAR | ❌ REJEITAR

---

**Próxima etapa:** Análise de riscos e planejamento de mitigações!

---

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO**: Identificar melhorias sistêmicas (não pontuais).

### Questões de Reflexão

**1. Eficiência** (Nota 1-10): __/10
- Se < 8: Qual fase ineficiente? Como melhorar?

**2. Iterações**: __
- Se > 3: O que causou idas/vindas? Como tornar workflow mais claro?

**3. Gaps**:
- [ ] Validação faltou? Gate falhou? Comando repetiu 3+x?
- [ ] Ação: [Inserir checklist/melhorar gate/automatizar script]

**4. RCA** (se problema identificado):
- [ ] 5 Whys aplicados? Causa raiz SISTÊMICA (afeta múltiplas features)?
- [ ] Meta-learning previne recorrência? (não apenas corrige sintoma)

### Ações de Melhoria

**Documentação**:
- [ ] Workflow/CLAUDE.md/Script/ADR a atualizar? [Especificar]

**ROI**: [ex: "20min/feature futura" ou "Previne 2h debugging"]

**Consolidação**: Workflow 8a (Meta-Learning centralizado)

### Validação Tamanho

```bash
wc -c .windsurf/workflows/add-feature-2b-technical-design.md
# ✅ < 12000 chars | ❌ > 12000: Comprimir
```

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

## ✅ FASE 5: CHECKPOINTS (REGRA #13 - Uma Ação Por Vez)

**CRÍTICO**: Durante todo este workflow, SEMPRE executar checkpoint após CADA ação atômica.

### 5.1. O que é uma Ação Atômica?

**Ação atômica** = Menor unidade testável e reversível.

**Exemplos deste workflow (Technical Design)**:
- ✅ "Criar schema SQL para tabela X"
- ✅ "Definir interface TypeScript para componente Y"
- ✅ "Especificar contrato da API endpoint Z"
- ✅ "Validar schema com database-schema-validator agent"
- ✅ "Documentar decisão arquitetural em ADR"
- ❌ "Criar todo design técnico completo" (NÃO atômico - múltiplas ações)

### 5.2. Checkpoint Obrigatório (Após Cada Ação)

**Usar script automatizado**:
```bash
./scripts/checkpoint.sh "descrição da ação executada"
```

**Ou manualmente**:

**Template de Checkpoint**:
```
✅ AÇÃO COMPLETA: [descrição da ação]

📸 EVIDÊNCIA:
[schema SQL, interface TypeScript, spec API, validação]

🔍 VALIDAÇÃO:
- [x] Ação executada com sucesso
- [x] Sem erros/warnings
- [x] Design documentado
- [x] Próxima ação identificada

🎯 PRÓXIMA AÇÃO PROPOSTA:
[descrição da próxima ação]

⏸️ AGUARDANDO APROVAÇÃO do usuário para continuar.
```

### 5.3. Checklist Checkpoint (Executar a Cada Ação)

- [ ] **Executei apenas 1 ação?**
- [ ] **Mostrei evidência ao usuário?** (schema, interface, spec)
- [ ] **Usuário validou?** (aprovação explícita)
- [ ] **Documentei em `.context/`?** (attempts.log)
- [ ] **Identifiquei próxima ação?** (planejamento incremental)

### 5.4. Exemplo de Aplicação (Technical Design)

**Fluxo com Checkpoints**:

```
1. AÇÃO: "Criar schema SQL para tabela lifetracker_X"
   → Executar → Checkpoint → Aprovação

2. AÇÃO: "Adicionar RLS policies para tabela"
   → Executar → Checkpoint → Aprovação

3. AÇÃO: "Definir interface TypeScript para hook useX()"
   → Executar → Checkpoint → Aprovação

4. AÇÃO: "Especificar contrato Edge Function /api/X"
   → Executar → Checkpoint → Aprovação

5. AÇÃO: "Validar design com database-schema-validator"
   → Executar → Checkpoint → Aprovação
```

### 5.5. Quando NÃO Aplicar Checkpoint

**Exceções** (ações podem ser agrupadas):
- ✅ **Schema + RLS**: Se trivial e padrão (ex: tabela CRUD simples)
- ✅ **Validação múltipla**: Rodar 3 validators em paralelo

**MAS**: Mesmo nas exceções, mostrar resultado ANTES de próxima ação.

### 5.6. Benefícios no Technical Design

**Eficiência**:
- ✅ Schema validado ANTES de migration
- ✅ Interface TypeScript validada ANTES de componente
- ✅ Zero retrabalho (cada design validado incrementalmente)

**Colaboração**:
- ✅ Usuário vê design incremental (tabela → RLS → API)
- ✅ Feedback loop rápido (30seg por checkpoint)
- ✅ Correção de design imediata (antes de código)

### 5.7. Documentação Automática

Cada checkpoint DEVE logar em `.context/attempts.log`:

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] CHECKPOINT: [ação] - SUCCESS" >> .context/${BRANCH_PREFIX}_attempts.log
```

**Ver**: REGRA #13 em `.claude/CLAUDE.md` para detalhes completos.

---

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 2b: Technical Design ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Validação sincronização DB (validate-db-sync.sh executado)
  - Pre-Design: Duplication Check (grep codebase + docs oficiais)
  - Arquitetura detalhada (componentes, hooks, database, queries)
  - Dependências validadas (4 passos metodologia)
  - Viabilidade técnica confirmada (stack, schema, performance, segurança)
  - Validação Anti-Over-Engineering (YAGNI/KISS)
  - Advogado do Diabo executado (fontes validadas, abordagem correta)
  - ADR criado (se decisão arquitetural importante)
- **Outputs**:
  - Design técnico completo
  - Lista de componentes/hooks/migrations necessários
  - Riscos técnicos identificados + mitigações
  - ADR (se aplicável)
- **Next**: Workflow 3 (Risk Analysis)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 2b (Technical Design) concluído com sucesso.

**Design técnico validado e aprovado**.

**Componentes planejados**: [Lista resumida de componentes principais]

**Migrations necessárias**: [Lista de tabelas/mudanças DB]

**Próximo passo**: Executar Workflow 3 (Risk Analysis) para análise detalhada de riscos e estratégias de mitigação.

---

## Próximos Passos

- [ ] Executar Workflow 3 (Risk Analysis)
- [ ] Identificar riscos técnicos, segurança e negócio
- [ ] Definir estratégias de mitigação
- [ ] Planejar rollback strategy

---

## Decisões Pendentes

[Se houver decisões técnicas pendentes após design]

EOF

# Substituir seção no arquivo original (preservar "Última Atualização")
sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se criamos ADR sobre state management
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 2b - Technical Design
- **Decisão**: Usar Zustand para state management (vs Context API)
- **Por quê**: Performance superior, bundle menor, API simples
- **Trade-off**: Mais uma dependência, mas ROI positivo (< 3KB gzipped)
- **Alternativas consideradas**:
  - Context API: Rejeitada - re-renders desnecessários
  - Redux: Rejeitada - over-engineering para escopo atual
- **ADR**: docs/adr/ADR-XXX-zustand-state-management.md
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 2b (Technical Design) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] OUTPUT: Design técnico validado + ADR criado (se aplicável)" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + outputs)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-3-risk-analysis.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-3-risk-analysis`

---

**Workflow criado em**: 2025-10-27
**Workflow atualizado em**: 2025-11-04
**Parte**: 2b de 11
**Próximo**: Risk Analysis (Análise de Riscos)
---
