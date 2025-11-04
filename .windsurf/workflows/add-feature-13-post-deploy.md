---
description: Workflow Add-Feature (13/11) - Post-Deploy Validation e Monitoramento
auto_execution_mode: 1
---

# Workflow 13/11: Post-Deploy (Validação e Monitoramento)

Este é o **workflow final** de pós-deploy para validação, monitoramento e health checks após deploy em produção.

**O que acontece neste workflow:**
- Fase 1: Validação de Deployment
- Fase 2: Smoke Tests e Health Checks
- Fase 3: Monitoramento em Tempo Real
- Fase 4: Documentação e Rollback Planning

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de validação
- 🚀 Maior throughput de tarefas

**Exemplo:**
- Phase 2 (Smoke Tests): 3+ agentes testando diferentes funcionalidades (UI, API, Database)
- Phase 3 (Monitoramento): 4+ agentes verificando diferentes métricas (performance, logs, errros, health)
- Validações paralelas: VPS status, Container health, Traefik routing, Aplicação UI

---

## 📚 Pré-requisito: Documentação Necessária

Antes de executar este workflow, SEMPRE consultar:
- `docs/PLAN.md` - Plano estratégico
- `docs/TASK.md` - Status de tarefas
- `docs/ops/vps-access.md` - Acesso VPS e credentials
- `scripts/deploy-vps.sh` - Script de deployment
- `scripts/vps-rollback.sh` - Script de rollback

---

## 📋 Fase 1: Validação de Deployment

### 1.1 Verificar Status do Deploy

**PRIMEIRO**: Confirmar que o deploy completou com sucesso:
- [ ] Deploy script retornou exit code 0?
- [ ] Containers estão rodando? (`docker service ls`)
- [ ] Imagens foram atualizadas? (`docker service ps lifetracker_app`)
- [ ] Logs de aplicação mostram inicialização correta?

### 1.2 Verificar Configurações

**Validar que configurações foram aplicadas:**
- [ ] `.env` foi injetado corretamente em build time (Vite)?
- [ ] Variáveis VITE_* estão disponíveis no frontend?
- [ ] Secrets foram carregados do Docker Swarm?
- [ ] Database migrations completaram? (se houver)

### 1.3 Checklist de Deployment

```bash
# SSH para VPS
ssh root@31.97.22.151

# Verificar containers
docker service ls
docker service ps lifetracker_app

# Verificar logs
docker service logs -f lifetracker_app

# Verificar health
curl -s http://localhost:3000/health | jq .

# Verificar Traefik
curl -s http://localhost:8080/api/routes | jq .
```

---

## 🧪 Fase 2: Smoke Tests e Health Checks

### 2.1 Tests Críticos (Independentes - PARALELO)

Executar em paralelo com MÁXIMO de agentes:

**Agent 1 - UI/Frontend Tests:**
- [ ] Página de login carrega sem erros?
- [ ] Autenticação funciona? (login/logout)
- [ ] Dashboard carrega com dados corretos?
- [ ] Wheel of Life renderiza corretamente?

**Agent 2 - API/Backend Tests:**
- [ ] Endpoints principais respondendo? (GET /api/life-areas)
- [ ] Database queries executam corretamente?
- [ ] Edge Functions (Coach AI) respondendo? (< 3s)
- [ ] WebSocket/Real-time features conectando?

**Agent 3 - Database/Data Tests:**
- [ ] RLS policies aplicadas? (usuário não vê dados de outros)
- [ ] Migrations completaram? (se houver)
- [ ] Dados antigos intactos? (nenhuma perda)
- [ ] Backups funcionando?

**Agent 4 - Performance Tests:**
- [ ] Dashboard carrega em < 2s?
- [ ] Coach responde em < 3s?
- [ ] Habit logging instantâneo? (< 500ms)
- [ ] Nenhum console error?

### 2.2 Regression Tests

**CRÍTICO**: Testar funcionalidades que podem ter quebrado:
- [ ] Todas as 8 áreas da vida aparecem corretamente?
- [ ] Assessments funcionam? (dinâmica, cálculos)
- [ ] Habit streaks calculam corretamente?
- [ ] Gamificação funciona? (badges, points)
- [ ] Coach conversa normalmente?

---

### 🐛 Se Smoke Tests Falharem com Causa Não-Óbvia

**Quando usar**: Testes falhando, mas dificuldade em identificar a causa. Múltiplas funcionalidades afetadas ou comportamento intermitente.

**Ação**: Execute o workflow de debugging:

```bash
# Ver workflow completo
cat .windsurf/workflows/debug-complex-problem.md
```

**O que ele faz**:
- 5 agentes paralelos diagnosticam (Database, Frontend, Backend, Auth, Logs)
- Root cause analysis sistemática
- Solution design com rollback plan
- Documentação do caso em docs/debugging/

**Exemplos de quando usar**:
- ❌ "Assessments não carregam dados"
- ❌ "Coach responde genérico, não contextual"
- ❌ "Habit logging às vezes falha"
- ❌ "Performance piorou drasticamente"
- ❌ "Usuários vendo dados de outro usuário" (RLS issue)

**Próximo passo se teste falhar**:
1. Tentar isolar problema (qual área? qual usuário?)
2. Se não conseguir reproduzir em 2-3 min → usar debug workflow
3. Debug workflow identificará causa em ~30 min com 5 agentes paralelos

---

## 📊 Fase 3: Monitoramento em Tempo Real

### 3.1 Métricas a Acompanhar (10 minutos)

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

### 3.2 Alertas para Escalação

Se **QUALQUER** dos seguintes ocorrer:
- ❌ CPU > 85% por > 2 min
- ❌ Memória > 90%
- ❌ Container reiniciando
- ❌ Erros 5xx > 1%
- ❌ Coach timeout > 5s
- ❌ Database unavailable

**Ação**: Iniciar rollback imediatamente (seção 4.3)

---

## 📝 Fase 4: Documentação e Rollback Planning

### 4.1 Documentação Pós-Deploy

**SEMPRE atualizar:**
- [ ] `docs/TASK.md` - Marcar deploy como completo
- [ ] `docs/DEPLOYMENT_LOG.md` - Timestamp, versão, status
- [ ] Release notes - O que mudou nesta versão
- [ ] Changelog - Commits inclusos

**Formato:**
```markdown
## [2025-11-03] Deploy v1.2.3

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

### 4.2 Rollback Planning

**IMPORTANTE**: Estar preparado para rollback em < 5 min.

```bash
# Rollback command
./scripts/vps-rollback.sh production

# Esperado: 2-3 min para imagem anterior estar rodando
# Validar: health checks passando novamente
```

### 4.3 Quando Fazer Rollback

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
- ✅ Monitoramento 10min passou
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

**Workflow criado em**: 2025-11-03
**Parte**: 13 de 11
**Status**: Workflow Final (Post-Deploy)
**Próximo**: Nenhum (ciclo completo)
