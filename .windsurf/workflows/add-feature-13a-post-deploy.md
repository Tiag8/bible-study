---
description: Workflow Add-Feature (13a/13) - Post-Deploy Validation (Parte 1)
auto_execution_mode: 1
---

# Workflow 13a/13: Post-Deploy Validation (Parte 1)

Este é o **primeiro workflow de pós-deploy** para validação, smoke tests e health checks após deploy em produção.

**O que acontece neste workflow:**
- Fase 1: Validação de Deployment
- Fase 2: Smoke Tests e Health Checks
- Fase 3: User Journey Tests
- Fase 4: Performance Validation

**Continuação**: Workflow 13b (RCA, Metrics, Documentação)

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de validação
- 🚀 Maior throughput de tarefas

**Exemplo:**
- Phase 2 (Smoke Tests): 4+ agentes testando diferentes funcionalidades (UI, API, Database, Performance)
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

## 👤 Fase 3: User Journey Tests

### 3.1 Fluxo Novo Usuário

**Simular jornada completa**:
- [ ] Signup funciona?
- [ ] Onboarding wizard completa?
- [ ] Primeiro assessment cria perfil?
- [ ] Wheel of Life renderiza dados iniciais?

### 3.2 Fluxo Usuário Ativo

**Simular uso diário**:
- [ ] Login → Dashboard → Ver progresso?
- [ ] Adicionar habit entry?
- [ ] Chat com Coach AI?
- [ ] Atualizar meta/goal?

### 3.3 Fluxo Edge Cases

**Testar cenários incomuns**:
- [ ] Usuário sem dados?
- [ ] Usuário com muito dados (> 1000 entries)?
- [ ] Network offline/slow?
- [ ] Concurrent updates (race conditions)?

---

## ⚡ Fase 4: Performance Validation

### 4.1 Métricas de Performance

**Targets a validar**:
- [ ] **Dashboard**: < 2s load time
- [ ] **Coach Chat**: < 3s response time
- [ ] **Habit Logging**: < 500ms (optimistic update)
- [ ] **Assessment**: < 2s per question

### 4.2 Resource Usage

**VPS Resources**:
- [ ] CPU < 50% (idle)
- [ ] Memory < 60% (idle)
- [ ] Disk space > 30% free
- [ ] Network latency < 100ms

### 4.3 Browser Performance

**Frontend Metrics**:
- [ ] Nenhum console error
- [ ] Nenhum memory leak (dev tools)
- [ ] Lighthouse score > 80 (performance)
- [ ] Bundle size < 500KB (gzipped)

---

## ✅ Checkpoint: Smoke Tests Completos!

**O que temos até agora:**
- ✅ Deployment validado
- ✅ Smoke tests passando (UI, API, Database, Performance)
- ✅ User journey tests passando
- ✅ Performance targets met

**Status**: APROVADO para continuar

**Se QUALQUER teste falhou**: PARAR aqui e ir direto para Workflow 13b (Root Cause Analysis)

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

**Este workflow continua automaticamente em:**

→ [Workflow 13b - RCA e Metrics](.windsurf/workflows/add-feature-13b-rca-metrics.md)

**Próximas etapas:**
- Análise Root Cause de problemas pós-deploy (se houver)
- Coleta de métricas e KPIs
- Monitoramento em tempo real (10 min)
- Atualização de documentação

*A execução do Workflow 13b deve ser iniciada automaticamente após a conclusão desta parte.*

---

**Workflow criado em**: 2025-11-04
**Parte**: 13a de 13
**Status**: Smoke Tests e Validação
**Próximo**: Workflow 13b (RCA e Metrics)
