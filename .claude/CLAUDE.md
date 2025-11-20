# Claude Code - Life Track Growth (Life Tracker)

> Aplicação AI-powered de desenvolvimento pessoal e habit tracking baseada na metodologia "Roda da Vida" (Wheel of Life).

---

## 📚 ESTRUTURA DE DOCUMENTAÇÃO

Este arquivo contém instruções **específicas do projeto Life Tracker**. Para regras **globais**, consulte:
- **`/Users/tiago/.codeium/windsurf/memories/global_rules.md`**: Regras universais
- **`docs/INDEX-MASTER.md`**: ⭐ Índice mestre da documentação (consultar ANTES de criar docs)

**Hierarquia**: Regras deste arquivo têm prioridade para Life Tracker.

### 🆕 Meta-Learning Patterns (v2.3.0)
Quick links to patterns synced from feat/magic-link-onboarding-whatsapp:
- [Multi-Agent RCA Parallelization](#multi-agent-rca-parallelization) - 36x faster debugging
- [Achievement Documentation](#-achievement-documentation-workflow-8a) - 56x context reduction
- [Timing Validation Protocol](#-timing-validation-protocol) - -95% false positives
- [Debugging Best Practices](#-debugging-best-practices) - When to use each pattern
- [INDEX-MASTER Pattern](#index-master-pattern) - Documentation governance

---

## ⚠️ MUITO IMPORTANTE: USO MÁXIMO DE AGENTES (Claude Code)

> **🚨 REGRA ABSOLUTA E OBRIGATÓRIA 🚨**
>
> **SEMPRE** usar o **MÁXIMO de agentes possível** em paralelo para **TODAS** as tarefas.
>
> Esta é a regra **MAIS IMPORTANTE** de todas. NÃO PULE. NÃO IGNORE.
>
> **Casos de uso comprovados neste projeto:**
> - Troubleshooting VPS Traefik: 5 agentes em paralelo = diagnóstico em 5min vs 20min+
> - Criação de Workflow 11: 5 agentes em paralelo = criação completa em 8min vs 30min+
> - Análise de infraestrutura VPS: 5 agentes em paralelo = análise completa em 4min vs 15min+

### 🎯 REGRA CRÍTICA
**SEMPRE** avaliar possibilidade de usar o **máximo de agentes possível** em paralelo.

### Quando Usar Múltiplos Agentes
- Tarefas independentes executáveis simultaneamente
- Exploração de código + análise de dependências + verificação de configurações
- Personalização de múltiplos arquivos
- Testes em diferentes módulos
- Análise de diferentes aspectos do projeto

### Multi-Agent RCA Parallelization

**Pattern**: 5+ parallel agents for complex debugging

**When**: Bug with 3+ symptoms OR 3+ layers affected (DB, Edge, Frontend)

**Structure**:
- Agent 1: Database layer analysis
- Agent 2: Edge Function behavior
- Agent 3: Frontend state/props flow
- Agent 4: Integration points
- Agent 5: RCA meta-analysis (synthesize findings)

**Benefit**: 36x faster (2h vs 84h), 8+ root causes found vs 1-2

**See**: ADR-026

### Benefícios
- ⚡ Redução drástica do tempo de execução
- 🎯 Melhor uso de recursos
- 🚀 Maior throughput de tarefas

**Nota**: Esta regra aplica-se ao **Claude Code** (suporta multi-agentes). O Windsurf não tem suporte a múltiplos agentes.

---

## 📋 DOCUMENTAÇÃO OBRIGATÓRIA (PLAN.md e TASK.md)

> **🚨 REGRA CRÍTICA 🚨**
>
> **SEMPRE** consultar PLAN.md e TASK.md **ANTES** de qualquer planejamento ou ação.

### Documentos a Consultar SEMPRE

**Antes de iniciar qualquer tarefa**:
1. **`docs/PLAN.md`** - Plano estratégico atual e roadmap das 10 etapas macro
2. **`docs/TASK.md`** - Status atual das tarefas e checklist executável
3. **`docs/pesquisa-de-mercado/`** - Fundamentos científicos e pesquisas

**Após completar tarefas**:
1. **Atualizar `docs/TASK.md`** - Marcar tarefas como completadas
2. **Atualizar `docs/PLAN.md`** - Se houver mudança estratégica
3. **Criar ADR** - Se houver decisão arquitetural importante

### Por que isso é crítico?
- ✅ Mantém alinhamento com estratégia atual
- ✅ Evita retrabalho e decisões conflitantes
- ✅ Garante continuidade entre sessões
- ✅ Documenta progresso real do projeto

**Regra**: NUNCA iniciar trabalho sem ler PLAN.md e TASK.md primeiro!

---

## 🎯 CORE CONCEPT: 8 ÁREAS DA VIDA

**CRÍTICO**: O Life Tracker é baseado na metodologia "Roda da Vida" com **8 áreas fixas**:

1. **Saúde** (Health) - ID: 1
2. **Carreira** (Career) - ID: 2
3. **Relacionamentos** (Relationships) - ID: 3
4. **Finanças** (Finance) - ID: 4
5. **Desenvolvimento Pessoal** (Personal Development) - ID: 5
6. **Lazer** (Leisure) - ID: 6
7. **Espiritualidade** (Spirituality) - ID: 7
8. **Ambiente** (Environment) - ID: 8

**⚠️ REGRA ABSOLUTA**: NUNCA adicionar/remover áreas. IDs 1-8 são fixos e imutáveis.

---

## 🎯 FEATURES CORE (Resumo)

1. **Assessments Dinâmicos**: IA gera perguntas adaptativas, gráfico Wheel of Life, histórico
2. **Habit Tracking**: Criação manual/IA, streak counting, calendário visual, gamificação
3. **AI Coach** (Gemini 2.5 Flash): Chat contextual, insights personalizados, daily messages
4. **Goals**: SMART goals, milestones, progress tracking
5. **Dashboard**: Wheel of Life, métricas agregadas, charts (Recharts)
6. **Onboarding**: Welcome wizard, tours interativos
7. **Admin**: Gestão usuários, analytics, system health

---

## ⏰ CONTEXTO TEMPORAL (SEMPRE LER PRIMEIRO!)

**CRÍTICO**: Sempre usar timezone local do Brasil e data/hora atual do sistema.

- **Timezone**: America/Sao_Paulo (UTC-3)
- **Verificar data**: `TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S %Z'`

### Regras:
1. **NUNCA hardcode anos/meses** - Sempre `new Date()`
2. **Queries**: Datas dinâmicas (`WHERE data >= CURRENT_DATE`)
3. **Logs**: Sempre incluir timestamp com timezone

### Erros Comuns:
- ❌ `WHERE data = '2024-10-01'` (hardcoded)
- ✅ `WHERE data >= CURRENT_DATE` (dinâmico)

---

## 🛠️ STACK CORE

- **Frontend**: React 18.3 + TypeScript 5.8 + Vite 5.4 + TailwindCSS 3.4
- **UI**: shadcn/ui (Radix UI primitives)
- **Router**: React Router v7.1
- **State**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL 15+, Auth, Storage, Edge Functions Deno)
- **AI**: Google Gemini 2.5 Flash
- **Charts**: Recharts

---

## 🗄️ DATABASE SCHEMA (Resumo)

**Prefixo obrigatório**: `lifetracker_` em TODAS as tabelas

**21 tabelas principais**:
- `lifetracker_profiles`: Perfis usuário
- `lifetracker_life_areas`: 8 áreas fixas (IDs 1-8)
- `lifetracker_habits`, `lifetracker_habit_entries`: Hábitos + log
- `lifetracker_goals`, `lifetracker_goal_entries`: Metas + progresso
- `lifetracker_assessment_history`, `lifetracker_assessment_responses`: Assessments
- `lifetracker_coach_conversations`, `lifetracker_coach_messages`: AI Coach
- Outras: categories, refinements, insights, suggestions, milestones, versions, logs

**Ver detalhes**: `docs/ARCHITECTURE.md` ou migrations em `supabase/migrations/`

---

## 📐 CONVENÇÕES DE CÓDIGO

### Naming:
- **Variáveis/funções**: camelCase (inglês)
- **Componentes**: PascalCase
- **Database**: snake_case + prefixo `lifetracker_`
- **API Routes**: kebab-case (`/api/life-areas`)

### Comentários:
- **Código**: Português
- **Commits**: Português + Conventional Commits (`feat:`, `fix:`, `refactor:`)

### 8 Áreas da Vida:
- SEMPRE usar IDs 1-8 (não strings)
- NUNCA permitir CRUD nas áreas (são fixas)

---

## 🔄 WORKFLOWS DISPONÍVEIS

Ver `.windsurf/workflows/`:

1. **`/add-feature-1-planning`**: Sistema modular 9 etapas (Planning → Solution → Implementation → Validation → Docs)
2. **`/ultra-think`**: Análise profunda para decisões arquiteturais

**Regra**: SEMPRE seguir workflows. NUNCA pular etapas.

### 📝 Achievement Documentation (Workflow 8a)

**Pattern**: After complex feature completion, create mini-postmortem

**File**: `.context/{branch}_achievement.md` (< 50 lines)

**Structure**:
- 🐛 The Bug (2-3 sentences)
- 🛠️ The Fix (3-5 bullets)
- 📣 User Feedback (1-2 quotes)
- ✅ Validation (evidence)

**Why**: 56x context reduction, 10x faster onboarding, replicability 9/10

**When**: Complex bugs (3+ symptoms), multi-layer fixes (3+ files), pattern-worthy solutions

**See**: ADR-028, Workflow 8a Phase 18

---

## 🔒 SEGURANÇA CRÍTICA

1. **ZERO secrets hardcoded** - Sempre `.env` + variáveis de ambiente
2. **RLS obrigatório** - Row Level Security em TODAS as tabelas Supabase
3. **NUNCA logar**: Assessment responses, coach messages, habit data (dados sensíveis)
4. **Anonimização**: Analytics agregadas sem identificação de usuários
5. **GDPR/LGPD**: Direito ao esquecimento, exportação de dados
6. **Queries parametrizadas**: NUNCA SQL injection

---

## 🚀 PERFORMANCE CRÍTICA

### Targets:
- **Dashboard**: < 2s load (múltiplas queries)
- **Coach Chat**: < 3s response (Edge Function + LLM)
- **Habit Logging**: Instantâneo (optimistic updates)
- **Assessments**: < 2s perguntas dinâmicas

### Técnicas:
- **React Query**: Cache agressivo (5 min staleTime)
- **Lazy Loading**: Componentes pesados (Wheel of Life, Calendar)
- **Optimistic Updates**: UI responde antes de API (habit logging)
- **Memoização**: useMemo/useCallback em cálculos pesados

---

## 💰 CUSTOS DE AI

- **Gemini 2.5 Flash**: Modelo econômico ($0.30/1M tokens input, $2.50/1M output)
- **Context Caching**: 75-90% economia (cachear system prompts)
- **Rate Limiting**: 30 msgs/hora (coach), 5 assessments/dia
- **Token Limits**: coach (500 tokens), assessment (300), habit suggestions (400)

**Orçamento**: ~$11-15/mês para 100 usuários ativos (com caching).

---

## 🧪 TESTES PRIORITÁRIOS

1. **RLS Policies**: Usuário não vê dados de outros
2. **AI Responses**: Validação Zod (não confiar em LLM)
3. **Habit Streaks**: Lógica de cálculo crítica (gamificação depende disso)
4. **Assessment Scores**: Cálculos precisos das 8 áreas

**TDD obrigatório**: Lógica de negócio (hooks, cálculos, validações).

---

## 🔬 TIMING VALIDATION PROTOCOL

**Rule**: Before declaring fix success, validate timing and causation

**Checklist**:
- [ ] Did symptom occur AFTER my change?
- [ ] Did symptom disappear AFTER my revert?
- [ ] Can I reproduce reliably (3/3 times)?
- [ ] Are there other variables changed simultaneously?
- [ ] Did I test with/without my change (A/B comparison)?

**Why**: Prevents correlation≠causation trap (-95% false positives)

**Pattern**: Change → Test → Revert → Test → Re-apply → Test (3-step validation)

**Red Flags**:
- "Fixed it!" without before/after comparison
- Single test run (not reproducible)
- Multiple changes at once (can't isolate cause)
- Time gaps between change and test (confounding variables)

**See**: ADR-027

---

## 🐛 DEBUGGING BEST PRACTICES

### When to Use Timing Validation
- Bug appears/disappears inconsistently
- Multiple changes deployed simultaneously
- "Works on my machine" scenarios
- Performance regressions

### When to Use Multi-Agent RCA
- 3+ symptoms across different layers
- Root cause unclear after initial analysis
- Multiple teams/domains involved
- High-impact production issues

**Principle**: Invest 20% time in proper diagnosis to save 80% time in implementation

---

## 🔄 FLUXO TÍPICO

```bash
# 1. Branch
git checkout main && git pull
git checkout -b feat/nome-feature

# 2. Desenvolver (TDD)
npm run dev
# ... código ...

# 3. Quality Gates
./scripts/run-tests.sh
./scripts/code-review.sh
./scripts/run-security-tests.sh

# 4. Commit
git add .
git commit -m "feat: descrição"
git push

# 5. Merge (manual após validação)
```

---

## 🚀 DEPLOYMENT & INFRA

### VPS Docker Swarm
- **Provider**: VPS (31.97.22.151)
- **Stack**: Docker Swarm + Traefik + Nginx
- **Domain**: https://life-tracker.stackia.com.br
- **Deployment**: Automático via `./scripts/deploy-vps.sh production`
- **Acesso**: Ver `docs/ops/vps-access.md`

### Docker Best Practices (Projeto)
- **Multi-stage builds**: Redução 95% tamanho (1GB → 45MB)
- **Health checks**: 127.0.0.1 (Alpine Linux) - NÃO usar localhost
- **Traefik labels**: OBRIGATÓRIO `traefik.docker.network=network_public` em Swarm
- **.env em build time**: Vite precisa de variáveis em BUILD TIME (incluir .env no Docker build)

### Workflow de Deploy
1. Feature desenvolvida localmente (Workflows 1-9)
2. Merge na main (manual)
3. Deploy VPS (Workflow 11): `./scripts/deploy-vps.sh production`
4. Validação (smoke tests, health checks)
5. Monitoramento (10min)
6. Rollback se necessário: `./scripts/vps-rollback.sh`

### Troubleshooting Rápido
- **Container não inicia**: `ssh root@31.97.22.151 "docker service logs -f lifetracker_app"`
- **Traefik não roteia**: Verificar label `traefik.docker.network` no docker-compose.yml
- **Health check falha**: Usar 127.0.0.1 em vez de localhost (Alpine)
- **Build falha**: Verificar se .env está disponível para Vite (variáveis VITE_*)
- **Rollback**: `./scripts/vps-rollback.sh production` (2-3min)

### Meta-Learnings Críticos
- **ML-1**: .dockerignore bloqueando .env → Vite precisa em BUILD TIME
- **ML-2**: traefik.docker.network label → CRÍTICO em multi-network Swarm
- **ML-3**: Alpine 127.0.0.1 vs localhost → Health checks falham com localhost
- **ML-4**: 5 agentes paralelos = 4x rápido → Troubleshooting 5min vs 20min+
- **ML-5**: Multi-stage builds → Redução 95% tamanho

### ADR Relacionado
- **ADR 003**: Docker Swarm + Traefik (2025-10-31)

---

## 🚨 GEMINI SYSTEM PROMPT HARD LIMIT (9000 TOKENS)

**CRÍTICO**: Gemini 2.5 Flash falha silenciosamente quando system prompt > 9000 tokens.

**Problema**:
- Gemini retorna vazio (`{"content": {"role": "model"}}` sem `parts`)
- `finishReason: "STOP"` mas sem tool call ou texto
- Nenhum erro explícito, falha 100% silenciosa

**Evidências**:
- **9350 tokens**: Gemini retorna vazio ❌
- **9034 tokens**: Gemini chama tools corretamente ✅
- **Limite real**: ~9000 tokens (não documentado oficialmente)

**Regra Obrigatória**:
> **System prompt do Gemini 2.5 Flash NUNCA pode exceder 9000 tokens.**

**Monitoramento**:
```typescript
// SEMPRE logar promptTokenCount
console.log('[DEBUG] 📥 Gemini Response:', JSON.stringify(result));
// Verificar: "promptTokenCount": 9034  // ✅ < 9000
```

**Prevenção**:
1. ❌ **NUNCA adicionar** examples/tools sem remover outros
2. ✅ **SEMPRE verificar** total após mudanças
3. ✅ **SEMPRE manter** margem de 1000 tokens (safety buffer)
4. ✅ **SEMPRE remover** redundâncias (examples similares, descriptions verbosas)

**Otimização**:
- **Examples**: Máximo 5 (essenciais, não redundantes)
- **Tool descriptions**: Concisas (< 200 chars por tool)
- **RAG context**: Máximo 200 tokens (últimas 20 msgs)
- **Total target**: 8000-8500 tokens (margem de 500-1000)

**Red Flags**:
- ⚠️ Prompt > 8500 tokens → Risco alto
- 🔴 Prompt > 9000 tokens → Falha garantida
- ❌ Adicionar example sem remover outro

**Checklist** (antes de modificar system prompt):
- [ ] Contei tokens atuais?
- [ ] Nova mudança adiciona quantos tokens?
- [ ] Total ficará < 9000?
- [ ] Posso remover algo redundante?

**Benefício**: Previne falhas silenciosas, tool calling 100% estável

---

## 📚 DOCUMENTAÇÃO COMPLEMENTAR

**Para informações detalhadas removidas desta versão otimizada**, consulte:

- **INDEX-MASTER.md** ⭐: `docs/INDEX-MASTER.md` - CONSULTAR ANTES de criar documentação
- **Features detalhadas**: `docs/FEATURES.md`
- **Arquitetura completa**: `docs/ARCHITECTURE.md`
- **Migration History**: `docs/MIGRATION_COMPLETE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Comandos úteis**: `docs/COMMANDS.md`
- **Workflows detalhados**: `.windsurf/workflows/`
- **User Flows**: `docs/USER_FLOWS.md` (4 fluxos críticos)
- **Design Principles**: `docs/DESIGN_PRINCIPLES.md`

### INDEX-MASTER Pattern

**Rule**: ALWAYS check `docs/INDEX-MASTER.md` BEFORE creating new documentation

**Why**:
- Prevents duplicate documentation (same topic, different locations)
- Ensures consistent structure and naming
- Reduces navigation friction (1 entry point)
- Avoids orphaned docs (docs not referenced anywhere)

**When to Update INDEX-MASTER.md**:
- After creating new ADR
- After adding guide/tutorial
- After adding troubleshooting doc
- After workflow changes

**Pattern**: Create doc → Update INDEX-MASTER.md → Link from relevant sections

**Red Flags**:
- Doc exists but not in INDEX-MASTER.md (orphaned)
- 2+ docs covering same topic (duplication)
- Deep nesting without index entry (navigation friction)

---

**Última atualização**: 2025-11-19 (v2.3 - Meta-Learning Patterns)
**Versão**: 2.3.0 (Meta-Learning Patterns)
**Projeto**: Life Track Growth (Life Tracker)
**Stack Core**: React 18.3 + TypeScript 5.8 + Vite 5.4 + Supabase + Gemini AI

**Changelog v2.3.0 (2025-11-19)**:
- Adicionado: Achievement Documentation Pattern (Workflow 8a, ADR-028)
- Adicionado: Multi-Agent RCA Parallelization (ADR-026)
- Adicionado: Timing Validation Protocol (ADR-027)
- Adicionado: Debugging Best Practices section
- Adicionado: INDEX-MASTER Pattern (documentation governance)
- Total: 8 generic sections from feat/magic-link-onboarding-whatsapp meta-learning
- File size: 14KB → 16.5KB (within < 20KB target)

**Changelog v2.2.0 (2025-11-01)**:
- Adicionado: Seção "Documentação Obrigatória (PLAN.md e TASK.md)"
- Adicionado: Regra crítica de consultar PLAN.md/TASK.md antes de qualquer ação
- Atualizado: Todos os 13 workflows com pré-requisito e atualização de docs
- Criado: docs/PLAN.md (estratégia macro 10 etapas)
- Criado: docs/TASK.md (checklist executável)

**Changelog v2.1.0 (2025-10-31)**:
- Adicionado: Seção "Deployment & Infra" (Docker Swarm + Traefik)
- Adicionado: Meta-learnings críticos de deploy (5 lessons learned)
- Adicionado: Troubleshooting rápido VPS
- Adicionado: Workflow de deploy completo
- Referência: ADR 003 (Docker Swarm + Traefik)

**Changelog v2.0.0 (2025-10-30)**:
- Redução de 88% no tamanho (2091 → 242 linhas) - superou meta de -66%
- Adicionado: Seção "Uso de Agentes" para Claude Code (multi-agente)
- Removido: Seções duplicadas, troubleshooting detalhado, princípios de design extensos
- Foco em: Regras críticas, convenções, 8 áreas da vida, stack core, segurança
- Alinhado com práticas Cursor/Copilot/Anthropic (2 páginas de instruções essenciais)
- Documentação detalhada movida para `docs/` (referências adicionadas)
