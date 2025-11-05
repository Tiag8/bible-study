---
description: Workflow Add-Feature (13b/13) - RCA, Metrics e Documentação (Parte 2)
auto_execution_mode: 1
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 13a

**Este é o Workflow 13b - Continuação de:**

← [Workflow 13a - Post-Deploy Validation](.windsurf/workflows/add-feature-13a-post-deploy.md)

**Pré-requisito**: Smoke tests do Workflow 13a devem estar APROVADOS.

---

# Workflow 13b/13: RCA, Metrics e Documentação (Parte 2)

Este é o **segundo workflow de pós-deploy** para análise de problemas, coleta de métricas e documentação final.

**O que acontece neste workflow:**
- Fase 5: Root Cause Analysis (se houver problemas)
- Fase 6: Monitoramento em Tempo Real (10 min)
- Fase 7: Coleta de Métricas e KPIs
- Fase 8: Documentação Final e Rollback Planning

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Exemplo:**
- Phase 6 (Monitoramento): 4+ agentes verificando diferentes métricas (VPS, Container, Logs, UX)
- Phase 7 (Metrics): 3+ agentes coletando diferentes KPIs

---

## 🔍 Fase 5: Root Cause Analysis (Se Smoke Tests Falharem)

### 5.1 Quando Usar RCA

**Usar RCA quando**: Um ou mais smoke tests falharam, mas causa não é óbvia após verificação rápida.

**Guia completo**: Ver `docs/guides/ROOT_CAUSE_ANALYSIS.md` para metodologia detalhada de RCA com 5 Whys.

### 5.2 Processo Estruturado (5 Why's + Correlação)

```
Exemplo 1: "Dashboard não carrega (spinner infinito)"

1. Por quê dashboard não carrega?
   → "Requisição GET /api/life-areas retorna 500"

2. Por quê retorna 500?
   → "Database query falha com 'relation does not exist'"

3. Por quê relation não existe?
   → "Migration não foi aplicada no deploy"

4. Por quê migration não foi aplicada?
   → "Script de deploy não executa supabase db push"

5. Por quê script não executa?
   → "Assumiu que migrations seriam aplicadas manualmente"

Causa Raiz: Deploy não aplica migrations automaticamente
Solução: Adicionar step de migration no script deploy-vps.sh
Prevenção: Checklist Workflow 11a incluir "migrations aplicadas?"
```

```
Exemplo 2: "Coach AI não responde (timeout)"

1. Por quê Coach timeout?
   → "Edge Function demora >10s e retorna timeout"

2. Por quê Edge Function tão lenta?
   → "Gemini API não responde em tempo hábil"

3. Por quê Gemini não responde?
   → "Rate limit atingido (verificar logs Edge Function)"

4. Por quê rate limit?
   → "Deploy resetou contador local, muitos requests simultâneos"

5. Por quê muitos requests simultâneos?
   → "Smoke tests + usuários reais + monitoramento = sobrecarga"

Causa Raiz: Rate limit Gemini após deploy (spike de requests)
Solução: Implementar exponential backoff + queue para requests AI
Prevenção: Smoke tests de AI em sequência (não paralelo)
```

### 5.3 Correlacionar Múltiplos Testes Falhados

Se múltiplos smoke tests falham, pode indicar causa raiz comum:

| Testes Falhados | Padrão | Causa Raiz Provável | Ação |
|----------------|--------|---------------------|------|
| UI + API + Database | Todos retornam erro | Migration não aplicada, schema desatualizado | Aplicar migrations manualmente, re-deploy |
| Coach + Edge Functions | Timeout | Rate limit API externa (Gemini/Supabase) | Aguardar reset de quota, implementar retry |
| Login + Auth + RLS | 401/403 | JWT secret mudou, .env desatualizado | Verificar .env, sincronizar secrets |
| Performance (todos lentos) | Latência alta | Database overload, índices faltando | EXPLAIN ANALYZE queries, criar índices |
| Apenas 1 feature | Isolado | Bug em código novo desta feature | Code review, rollback se crítico |

### 5.4 Perguntas Diagnósticas por Tipo de Falha

**UI Tests (Frontend)**:
1. Console mostra erro? → Qual? Exception? Network? 404?
2. Network tab mostra falha? → Qual endpoint? Status code?
3. State management OK? → React Query cache corrompido? Revalidate?
4. Rendering OK? → Component crash? Infinite loop? Memory leak?

**API Tests (Backend)**:
1. Endpoint responde? → Status code? 500/502/503/504?
2. Database OK? → Connection string? RLS policies? Migration?
3. Auth OK? → JWT válido? User_id passing? Session?
4. Edge Function OK? → Timeout? Memory? Cold start?

**Database Tests**:
1. RLS funciona? → Usuário vê apenas seus dados? Test cross-user?
2. Migration aplicada? → Schema match code? Tabelas existem?
3. Performance OK? → Queries rápidas? Índices presentes? EXPLAIN ANALYZE?
4. Data intacta? → Nenhuma perda? Backup disponível?

**Performance Tests**:
1. Dashboard < 2s? → Por quê não? Query lenta? Bundle grande?
2. Coach < 3s? → Por quê não? Gemini slow? Context caching?
3. Habit logging < 500ms? → Por quê não? Optimistic update? Network?
4. Sem console errors? → Por quê tem? Source? Stack trace?

### 5.5 Checklist RCA

- [ ] Identifiquei qual(is) teste(s) falharam exatamente
- [ ] Reproduzi falha manualmente (não apenas em script)
- [ ] Coletei evidências (logs, console, network, database)
- [ ] Correlacionei múltiplos testes (padrão comum?)
- [ ] Perguntei "Por quê?" 5 vezes até causa raiz
- [ ] Causa raiz é algo fixável (não "azar" ou "timing")
- [ ] Tenho solução testável (ou rollback plan)
- [ ] Documentei em commit/INCIDENTS.md/TROUBLESHOOTING.md

### 5.6 Workflow de Debug Completo (Se RCA Não Resolver)

**Se RCA não resolve em 10-15min**: Use workflow de debugging completo:

```bash
# Workflow multi-agent com 5 agentes paralelos
cat .windsurf/workflows/debug-complex-problem.md

# Documentar problema primeiro (template)
cp docs/debugging/template-problem-statement.md docs/debugging/post-deploy-[issue].md
# Preencher: sintomas, impacto, reprodução, contexto
# Depois: lançar 5 agentes (Database, Frontend, Backend, Auth, Logs)
```

**Exemplos de quando usar debug workflow completo**:
- ❌ "Assessments não carregam dados" (múltiplas tabelas envolvidas)
- ❌ "Coach responde genérico, não contextual" (Edge Function + DB + LLM)
- ❌ "Habit logging às vezes falha" (intermitente = race condition?)
- ❌ "Performance piorou drasticamente" (múltiplos fatores)
- ❌ "Usuários vendo dados de outro usuário" (RLS + Auth crítico)

---

## 📊 Fase 6: Monitoramento em Tempo Real

### 6.1 Métricas a Acompanhar (10 minutos)

**Agent 1 - VPS Infrastructure:**
- [ ] CPU < 70%?
- [ ] Memória < 75%?
- [ ] Disk space > 20% livre?
- [ ] Network latency normal?

**Agent 2 - Container Health:**
- [ ] Container health check passing?
- [ ] Restart count = 0?
- [ ] Uptime > 10 minutos?
- [ ] Nenhum OOM killer?

**Agent 3 - Application Logs:**
- [ ] Nenhum erro crítico? (ERROR, FATAL)
- [ ] Nenhuma stack trace inesperada?
- [ ] Warnings conhecidos apenas?
- [ ] Performance logs normais?

**Agent 4 - User Experience:**
- [ ] Erros no Sentry/logging? (se aplicável)
- [ ] Nenhuma resposta 5xx?
- [ ] Respostas rápidas? (< 500ms p95)
- [ ] Conversão/fluxos normais?

### 6.2 Alertas para Escalação

Se **QUALQUER** dos seguintes ocorrer:
- ❌ CPU > 85% por > 2 min
- ❌ Memória > 90%
- ❌ Container reiniciando
- ❌ Erros 5xx > 1%
- ❌ Coach timeout > 5s
- ❌ Database unavailable

**Ação**: Iniciar rollback imediatamente (Fase 8.3)

---

## 📈 Fase 7: Coleta de Métricas e KPIs

### 7.1 KPIs Técnicos

**Performance**:
- [ ] Latência média (p50, p95, p99)
- [ ] Throughput (requests/segundo)
- [ ] Error rate (%)
- [ ] Uptime (%)

**Resources**:
- [ ] CPU usage (média, pico)
- [ ] Memory usage (média, pico)
- [ ] Disk I/O
- [ ] Network bandwidth

### 7.2 KPIs de Produto

**Engagement**:
- [ ] Daily Active Users (DAU)
- [ ] Habit entries logged
- [ ] Coach interactions
- [ ] Assessment completions

**Quality**:
- [ ] Feature adoption rate
- [ ] User satisfaction (se houver)
- [ ] Bug reports
- [ ] Performance complaints

### 7.3 Comparação Antes/Depois Deploy

**Benchmark**:
- [ ] Performance melhorou/piorou?
- [ ] Error rate aumentou?
- [ ] Engagement mudou?
- [ ] Conversão afetada?

---

## 📝 Fase 8: Documentação Final e Rollback Planning

### 8.1 Documentação Pós-Deploy

**SEMPRE atualizar:**
- [ ] `docs/TASK.md` - Marcar deploy como completo
- [ ] `docs/DEPLOYMENT_LOG.md` - Timestamp, versão, status
- [ ] Release notes - O que mudou nesta versão
- [ ] Changelog - Commits inclusos

**Formato:**
```markdown
## [2025-11-04] Deploy v1.2.3

**Status**: ✅ Sucesso

**O que foi deployado:**
- feat: Feature X
- fix: Bug Y
- perf: Optimization Z

**Validações:**
- ✅ UI tests passed
- ✅ API tests passed
- ✅ Performance targets met
- ✅ 10min monitoring passed

**Rollback command (se necessário):**
./scripts/vps-rollback.sh production
```

### 8.2 Rollback Planning

**IMPORTANTE**: Estar preparado para rollback em < 5 min.

```bash
# Rollback command
./scripts/vps-rollback.sh production

# Esperado: 2-3 min para imagem anterior estar rodando
# Validar: health checks passando novamente
```

### 8.3 Quando Fazer Rollback

**Critérios para decisão IMEDIATA**:
1. Funcionalidade crítica quebrada (login, assessments, coach)
2. Data corruption detectado
3. Performance degradada > 50%
4. High error rate (> 5% das requests falhando)
5. Security vulnerability descoberto

**NÃO fazer rollback por**:
- [ ] Warning logs (normais)
- [ ] Feature menor não funcionando (hotfix rápido)
- [ ] Performance menor que esperado (profiling depois)

---

## ✅ Checkpoint: Post-Deploy Completo!

**O que temos até agora:**
- ✅ Deployment validado
- ✅ Smoke tests passando
- ✅ RCA completo (se houver problemas)
- ✅ Monitoramento 10min passou
- ✅ Métricas coletadas
- ✅ Documentação atualizada
- ✅ Rollback plan pronto

**Próxima etapa:** Comunicar sucesso ao time e encerrar sprint.

---

## 🔄 Próximas Ações

```markdown
## Se Deploy Bem-Sucedido:
1. Atualizar TASK.md com sucesso
2. Comunicar time
3. Criar post-mortem (se houver incidentes menores)
4. Planejar próxima feature

## Se Necessário Rollback:
1. Executar: ./scripts/vps-rollback.sh production
2. Validar health checks novamente
3. Investigar causa raiz
4. Criar issue para fix
5. Planejar re-deploy
```

---

## 🚨 Troubleshooting Rápido

| Problema | Causa | Solução |
|----------|-------|---------|
| Container não inicia | Build falhou / Health check failing | Ver logs: `docker service logs -f lifetracker_app` |
| Traefik não roteia | Label traefik.docker.network faltando | Verificar docker-compose.yml labels |
| Health check falha | Usando localhost em vez de 127.0.0.1 | Usar 127.0.0.1 em Alpine |
| .env não injetado | Variáveis não em build time | Verificar Dockerfile: VITE_ vars precisam estar em BUILD TIME |
| API não responde | Database unavailable | Verificar connection string em .env |
| Coach timeout | Edge Function lenta | Verificar Gemini API rate limits |

---

**Workflow criado em**: 2025-11-04
**Parte**: 13b de 13
**Status**: Workflow Final (Post-Deploy)
**Próximo**: Nenhum (ciclo completo)
