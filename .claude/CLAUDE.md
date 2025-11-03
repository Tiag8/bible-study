# Claude Code - Life Track Growth (Life Tracker)

> Aplicação AI-powered de desenvolvimento pessoal e habit tracking baseada na metodologia "Roda da Vida" (Wheel of Life).

---

## 📚 ESTRUTURA DE DOCUMENTAÇÃO

Este arquivo contém instruções **específicas do projeto Life Tracker**. Para regras **globais**, consulte:
- **`/Users/tiago/.codeium/windsurf/memories/global_rules.md`**: Regras universais

**Hierarquia**: Regras deste arquivo têm prioridade para Life Tracker.

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

## 📚 DOCUMENTAÇÃO COMPLEMENTAR

**Para informações detalhadas removidas desta versão otimizada**, consulte:

- **Features detalhadas**: `docs/FEATURES.md`
- **Arquitetura completa**: `docs/ARCHITECTURE.md`
- **Migration History**: `docs/MIGRATION_COMPLETE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Comandos úteis**: `docs/COMMANDS.md`
- **Workflows detalhados**: `.windsurf/workflows/`
- **User Flows**: `docs/USER_FLOWS.md` (4 fluxos críticos)
- **Design Principles**: `docs/DESIGN_PRINCIPLES.md`

---

**Última atualização**: 2025-11-01 (v2.2 - PLAN.md e TASK.md obrigatórios)
**Versão**: 2.2.0 (Documentação Obrigatória)
**Projeto**: Life Track Growth (Life Tracker)
**Stack Core**: React 18.3 + TypeScript 5.8 + Vite 5.4 + Supabase + Gemini AI

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
