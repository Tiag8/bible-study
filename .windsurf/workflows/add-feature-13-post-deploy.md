---
description: Workflow Add-Feature (13a/13) - Post-Deploy Validation (Parte 1)
auto_execution_mode: 1
---

# Workflow 13a/13: Post-Deploy Validation (Parte 1)

Validação, smoke tests e health checks após deploy em produção.

**Fases:** Validação Deployment → Smoke Tests → User Journey → Performance
**Continuação**: Workflow 13b (RCA, Metrics, Documentação)

---

## ⚠️ REGRA: USO MÁXIMO DE AGENTES

**SEMPRE usar MÁXIMO de agentes em paralelo** para todas as fases.

**Benefícios:** ⚡ 36x mais rápido | 🎯 Melhor cobertura | 🚀 Maior throughput

**Exemplo:** Phase 2 → 4 agentes paralelos (UI, API, Database, Performance)

---

## 📚 Pré-requisito: Docs

SEMPRE consultar: `docs/PLAN.md`, `docs/TASK.md`, `docs/ops/vps-access.md`, `scripts/deploy-vps.sh`, `scripts/vps-rollback.sh`

---

## 📋 Fase 1: Validação Deployment

### 1.1 Status Deploy

- [ ] Deploy script exit code 0
- [ ] Containers rodando (`docker service ls`)
- [ ] Imagens atualizadas (`docker service ps lifetracker_app`)
- [ ] Logs inicialização OK

### 1.2 Configurações

- [ ] `.env` injetado (Vite build time)
- [ ] Variáveis VITE_* disponíveis
- [ ] Secrets carregados (Swarm)
- [ ] Migrations completaram

### 1.3 Checklist Commands

```bash
ssh root@31.97.22.151

# Containers
docker service ls
docker service ps lifetracker_app

# Logs
docker service logs -f lifetracker_app

# Health
curl -s http://localhost:3000/health | jq .

# Traefik
curl -s http://localhost:8080/api/routes | jq .
```

---

## 🧪 Fase 2: Smoke Tests (PARALELO)

Executar com MÁXIMO agentes:

**Agent 1 - UI/Frontend:**
- [ ] Login carrega sem erros
- [ ] Autenticação funciona
- [ ] Dashboard carrega dados
- [ ] Wheel of Life renderiza

**Agent 2 - API/Backend:**
- [ ] Endpoints respondendo (`/api/life-areas`)
- [ ] Database queries executam
- [ ] Edge Functions < 3s (Coach AI)
- [ ] Real-time conectando

**Agent 3 - Database:**
- [ ] RLS policies aplicadas
- [ ] Migrations completaram
- [ ] Dados antigos intactos
- [ ] Backups funcionando

**Agent 4 - Performance:**
- [ ] Dashboard < 2s
- [ ] Coach < 3s
- [ ] Habit logging < 500ms
- [ ] Zero console errors

### 2.2 Regression Tests

- [ ] 8 áreas da vida corretas
- [ ] Assessments funcionam (dinâmica, cálculos)
- [ ] Habit streaks corretos
- [ ] Gamificação funciona (badges, points)
- [ ] Coach conversa normal

---

## 👤 Fase 3: User Journey Tests

### 3.1 Novo Usuário

- [ ] Signup funciona
- [ ] Onboarding completo
- [ ] Primeiro assessment cria perfil
- [ ] Wheel renderiza dados iniciais

### 3.2 Usuário Ativo

- [ ] Login → Dashboard → Progresso
- [ ] Adicionar habit entry
- [ ] Chat Coach AI
- [ ] Atualizar goal

### 3.3 Edge Cases

- [ ] Usuário sem dados
- [ ] Usuário com > 1000 entries
- [ ] Network offline/slow
- [ ] Concurrent updates (race conditions)

---

## ⚡ Fase 4: Performance Validation

### 4.1 Targets

- [ ] Dashboard < 2s
- [ ] Coach Chat < 3s
- [ ] Habit Logging < 500ms
- [ ] Assessment < 2s/question

### 4.2 VPS Resources

- [ ] CPU < 50% idle
- [ ] Memory < 60% idle
- [ ] Disk > 30% free
- [ ] Network < 100ms latency

### 4.3 Frontend Metrics

- [ ] Zero console errors
- [ ] No memory leaks (dev tools)
- [ ] Lighthouse > 80 performance
- [ ] Bundle < 500KB gzipped

---

## ✅ Checkpoint: Validação Completa

**Completado:**
- ✅ Deployment validado
- ✅ Smoke tests OK (UI, API, DB, Performance)
- ✅ User journeys OK
- ✅ Performance targets met

**Status**: APROVADO para continuar

**Se QUALQUER teste falhou**: PARAR e ir direto para Workflow 13b (RCA)

---

## 🧠 Meta-Learning

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua.

### Questões (TODAS)

**1. Eficiência (1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Fase ineficiente? Como melhorar?
- [ ] Fase demorou? Qual? Por quê?

**2. Iterações:**
- [ ] Iterações: __
- [ ] Se > 3: O que causou idas e vindas?
- [ ] Como tornar workflow mais autônomo?

**3. Gaps:**
- [ ] Validação faltou? (qual? onde inserir?)
- [ ] Gate falhou detectar erro? (qual melhorar?)
- [ ] Comando repetido 3+ vezes? (automatizar?)

**4. RCA (Se problema):**
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados? (causa raiz sistêmica)
- [ ] Afeta múltiplas features? (SE NÃO: descartar)
- [ ] Meta-learning previne recorrência?

### Ações Melhoria

**Documentação a atualizar:**
- [ ] Este workflow precisa melhorias? → Alterações
- [ ] CLAUDE.md precisa novo padrão? → Especificar
- [ ] Novo script útil? → Nome + função
- [ ] ADR necessário? → Decisão a documentar

**ROI Esperado:** [Ex: "20min/feature" ou "Previne 2h debugging"]

### Validação Tamanho

```bash
wc -c .windsurf/workflows/add-feature-13a-post-deploy.md
# ✅ < 12000 chars (12k limit)
# ❌ > 12000: Comprimir ou dividir
```

**Otimização** (se > 11k):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists
- [ ] Extrair detalhes p/ docs/
- [ ] Dividir em 2 workflows

---

## ⏭️ CONTINUAÇÃO

**Continua em:** [Workflow 13b - RCA e Metrics](.windsurf/workflows/add-feature-13b-rca-metrics.md)

**Próximas etapas:** RCA pós-deploy | Métricas/KPIs | Monitoramento 10min | Docs

*Workflow 13b inicia automaticamente após conclusão.*

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

**Criado**: 2025-11-04 | **Parte**: 13a/13 | **Status**: Smoke Tests | **Próximo**: 13b (RCA)
