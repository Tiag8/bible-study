---
description: Workflow Add-Feature (13a/13) - Post-Deploy Validation (Parte 1) - Playwright E2E
auto_execution_mode: 1
---

# Workflow 13a/13: Post-Deploy Validation (Parte 1)

Validação E2E automatizada com **Playwright** + **MCP Supabase** após deploy em produção.

**Fases:** Deployment → Smoke Tests (Playwright) → User Journeys (Playwright) → Performance
**Continuação**: Workflow 13b (RCA, Metrics, Documentação)

---

## ⚠️ REGRA: USO MÁXIMO DE AGENTES

**SEMPRE usar MÁXIMO de agentes em paralelo** para todas as fases.

**FASE 2-4**: **7 agentes paralelos** (Playwright + MCP Supabase)

---

## 📚 Pré-requisitos

**Docs**: `docs/PLAN.md`, `docs/TASK.md`, `docs/ops/vps-access.md`
**Scripts**: `scripts/deploy-vps.sh`, `scripts/vps-rollback.sh`
**MCP**: Playwright (E2E), Supabase (SQL)

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler Context Files

```bash
BRANCH_PREFIX=$(git symbolic-ref --short HEAD 2>/dev/null | sed 's/\//-/g' || echo "main")

# 1. Guia
cat .context/INDEX.md

# 2. Progresso
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 3. Estado
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 4. Decisões
cat .context/${BRANCH_PREFIX}_decisions.md

# 5. Histórico
tail -30 .context/${BRANCH_PREFIX}_attempts.log
```

### 0.2. Log Início

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 13a (Post-Deploy Pt1 - Playwright) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 📋 FASE 1: Validação Deployment (Backend)

**Agent 1 - VPS Status (SSH)**

```bash
ssh root@31.97.22.151 <<'EOF'
echo "=== DEPLOYMENT VALIDATION ==="
echo ""

echo "1. Containers:"
docker service ls | grep lifetracker

echo ""
echo "2. Service Status:"
docker service ps lifetracker_app --format "{{.Name}}: {{.CurrentState}}"

echo ""
echo "3. Health Check:"
curl -s http://127.0.0.1:3000/health 2>/dev/null | jq . || echo "Health endpoint not available"

echo ""
echo "4. Traefik Routes:"
curl -s http://127.0.0.1:8080/api/http/routers | jq '.[] | select(.name | contains("lifetracker"))' 2>/dev/null || echo "Traefik API not available"

echo ""
echo "5. Recent Logs (last 20 lines):"
docker service logs lifetracker_app --tail 20
EOF
```

**Critérios**:
- [x] Containers running (replicas 1/1)
- [x] Health endpoint OK
- [x] Traefik routing OK
- [x] Logs sem errors críticos

---

## 🧪 FASE 2-4: SMOKE TESTS + USER JOURNEYS (7 AGENTES PARALELOS)

**⚠️ EXECUTAR TODOS EM PARALELO** usando Task tool.

### Agent 2 - UI/Frontend (PLAYWRIGHT)

**Ferramentas**: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_take_screenshot`

```javascript
await mcp__playwright__browser_navigate({ url: 'https://life-tracker.stackia.com.br' });
const home = await mcp__playwright__browser_snapshot(); // Validar "Life Tracker"

await mcp__playwright__browser_click({ element: 'Login', ref: 'a[href="/auth"]' });
await mcp__playwright__browser_take_screenshot({ filename: 'smoke-test-login.png' });

const login = await mcp__playwright__browser_snapshot(); // Validar "Email" e "Password"
```

**Critérios**:
- [x] Homepage carrega sem erros
- [x] Navegação para /auth funciona
- [x] Formulário login renderizado
- [x] Screenshot capturado

---

### Agent 3 - API/Backend (PLAYWRIGHT + Bash)

**Ferramentas**: `mcp__playwright__browser_evaluate`, `Bash`

```javascript
// API test via browser
const apiTest = await mcp__playwright__browser_evaluate({
  function: `async () => {
    const r = await fetch('/api/life-areas');
    const d = await r.json();
    return { status: r.status, count: d.length, first: d[0]?.name };
  }`
});
// Validar: status 200, count 8, first "Saúde"
```

```bash
# Edge Function timing
curl -w "%{time_total}s" -X POST https://fjddlffnlbrhgogkyplq.supabase.co/functions/v1/coach-chat \
  -H "Authorization: Bearer $ANON_KEY" -d '{"message":"Oi"}' -o /dev/null -s
```

**Critérios**: API 8 áreas, Coach < 3s, Status 200

---

### Agent 4 - Database (MCP SUPABASE)

**Ferramenta**: `mcp__supabase_lifetracker__execute_sql`

**Test Queries**:
```sql
-- 1. RLS Validation (TODAS tabelas com RLS habilitado)
SELECT
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'lifetracker_%'
ORDER BY tablename;

-- EXPECTED: 21 tabelas com "✅ Enabled"

-- 2. Migrations Applied (últimas 5)
SELECT version, applied_at
FROM supabase_migrations.schema_migrations
ORDER BY applied_at DESC
LIMIT 5;

-- 3. Data Integrity (contagem registros)
SELECT
  'profiles' as table_name, COUNT(*) as count FROM lifetracker_profiles
UNION ALL
SELECT 'habits', COUNT(*) FROM lifetracker_habits
UNION ALL
SELECT 'assessments', COUNT(*) FROM lifetracker_assessments;

-- EXPECTED: Counts > 0 (dados preservados)

-- 4. Unique Constraints (phone_number)
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_name = 'lifetracker_profiles'
  AND constraint_type = 'UNIQUE'
  AND constraint_name LIKE '%phone%';

-- EXPECTED: lifetracker_profiles_phone_number_key
```

**Critérios**:
- [x] RLS: 21/21 tabelas habilitadas
- [x] Migrations: > 40 aplicadas
- [x] Data: Profiles + Habits + Assessments > 0
- [x] Constraints: phone_number UNIQUE OK

---

### Agent 5 - Performance (PLAYWRIGHT)

**Ferramentas**: `mcp__playwright__browser_network_requests`, `mcp__playwright__browser_console_messages`

```javascript
await mcp__playwright__browser_navigate({ url: 'https://life-tracker.stackia.com.br/dashboard' });
const reqs = await mcp__playwright__browser_network_requests();
const dash = reqs.find(r => r.url.includes('/dashboard')); // Validar time < 2000

const errs = await mcp__playwright__browser_console_messages({ onlyErrors: true }); // Validar length === 0

const perf = await mcp__playwright__browser_evaluate({
  function: `() => {
    const p = performance.getEntriesByType('navigation')[0];
    return { dom: Math.round(p.domContentLoadedEventEnd - p.domContentLoadedEventStart), load: Math.round(p.loadEventEnd - p.loadEventStart) };
  }`
}); // Validar dom < 2000, load < 3000
```

**Critérios**:
- [x] Dashboard load: < 2000ms
- [x] Console errors: 0
- [x] DOM ready: < 2000ms
- [x] Full load: < 3000ms

---

### Agent 6 - User Journey: Novo Usuário (PLAYWRIGHT)

**Ferramentas**: `mcp__playwright__browser_click`, `mcp__playwright__browser_type`, `mcp__playwright__browser_wait_for`, `mcp__playwright__browser_take_screenshot`

```javascript
await mcp__playwright__browser_navigate({ url: 'https://life-tracker.stackia.com.br/auth' });
await mcp__playwright__browser_click({ element: 'Tab Cadastro', ref: 'button[role="tab"]:has-text("Cadastro")' });

await mcp__playwright__browser_type({ element: 'Email', ref: 'input[type="email"]', text: `test-${Date.now()}@example.com` });
await mcp__playwright__browser_type({ element: 'Senha', ref: 'input[type="password"]', text: 'Test123!@#' });
await mcp__playwright__browser_click({ element: 'Cadastrar', ref: 'button[type="submit"]' });

await mcp__playwright__browser_wait_for({ text: 'Bem-vindo' }); // ou 'Dashboard'
await mcp__playwright__browser_take_screenshot({ filename: 'user-journey-novo.png' });

const snap = await mcp__playwright__browser_snapshot(); // Validar "Dashboard" ou "Onboarding"
```

**Critérios**:
- [x] Signup completo
- [x] Redirect após cadastro
- [x] Dashboard ou Onboarding renderizado
- [x] Screenshot capturado

---

### Agent 7 - User Journey: Usuário Ativo (PLAYWRIGHT)

**Ferramentas**: `mcp__playwright__browser_click`, `mcp__playwright__browser_type`, `mcp__playwright__browser_wait_for`

```javascript
await mcp__playwright__browser_navigate({ url: 'https://life-tracker.stackia.com.br/auth' });
await mcp__playwright__browser_type({ element: 'Email', ref: 'input[type="email"]', text: 'user-ativo@test.com' });
await mcp__playwright__browser_type({ element: 'Senha', ref: 'input[type="password"]', text: 'password123' });
await mcp__playwright__browser_click({ element: 'Login', ref: 'button[type="submit"]' });

await mcp__playwright__browser_wait_for({ text: 'Dashboard' });
await mcp__playwright__browser_take_screenshot({ filename: 'user-journey-ativo.png' });
```

**Critérios**:
- [x] Login funciona
- [x] Dashboard carrega
- [x] Dados user exibidos
- [x] Screenshot capturado

---

### Agent 8 - Regression Tests (PLAYWRIGHT)

```javascript
// Validar 8 áreas imutáveis (IDs 1-8: Saúde, Carreira, Relacionamentos, Finanças, Desenv. Pessoal, Lazer, Espiritualidade, Ambiente)
const areas = await mcp__playwright__browser_evaluate({
  function: `async () => {
    const r = await fetch('/api/life-areas');
    return (await r.json()).map(a => ({ id: a.id, name: a.name }));
  }`
});
// Validar: areas.length === 8, IDs 1-8 corretos
```

**Critérios**: 8 áreas, IDs 1-8, nomes corretos

---

## ✅ Checkpoint: Validação Completa

**Completado:**
- ✅ Deployment validado (FASE 1)
- ✅ Smoke tests OK (7 agentes paralelos - FASE 2-4)
- ✅ User journeys OK (signup + login)
- ✅ Performance targets met (< 2s dashboard, 0 errors)
- ✅ Regression OK (8 áreas preservadas)

**Status**: APROVADO para continuar

**Se QUALQUER teste falhou**: PARAR e ir para Workflow 13b (RCA)

---

## 🧠 Meta-Learning

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua.

### Questões (TODAS)

**1. Eficiência (1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Fase ineficiente? Como melhorar?

**2. Iterações:**
- [ ] Iterações: __
- [ ] Se > 3: O que causou idas e vindas?

**3. Gaps:**
- [ ] Validação faltou? (qual? onde inserir?)
- [ ] Comando repetido 3+ vezes? (automatizar?)

**4. RCA (Se problema):**
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados?
- [ ] Meta-learning previne recorrência?

### Validação Tamanho

```bash
wc -c .windsurf/workflows/add-feature-13a-post-deploy.md
# ✅ < 12000 chars (11.8k atual)
```

---

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git symbolic-ref --short HEAD 2>/dev/null | sed 's/\//-/g' || echo "main")

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 13a: Post-Deploy Validation (Playwright) ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - VPS deployment validation (SSH)
  - Smoke tests E2E (7 agentes Playwright + MCP Supabase)
  - User journeys (signup + login)
  - Performance validation (< 2s, 0 errors)
  - Regression tests (8 áreas OK)
- **Outputs**:
  - Screenshots: login, novo-usuario, ativo
  - Evidências: RLS 21/21, migrations 41+, performance < 2s
  - Deploy aprovado
- **Next**: Workflow 13b (RCA e Metrics)
EOF
```

### F.2. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 13a (Playwright) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] VALIDATION: 7 agents parallel - Deploy APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## ⏭️ CONTINUAÇÃO

**Continua em:** [Workflow 13b - RCA e Metrics](.windsurf/workflows/add-feature-13b-rca-metrics.md)

**Próximas etapas:** RCA pós-deploy | Métricas/KPIs | Monitoramento | Docs

---

## 🚨 REGRA CRÍTICA: ANTI-ROI

**NUNCA calcule ou mencione**:
- ❌ ROI (Return on Investment)
- ❌ Tempo de execução/produção
- ❌ "Horas economizadas"

**Permitido**:
- ✅ Evidências concretas (screenshots, logs, métricas)
- ✅ Comparações qualitativas
- ✅ Métricas técnicas (latência, throughput)

---

**Criado**: 2025-11-04 | **Atualizado**: 2025-11-15 (Playwright + MCP Supabase) | **Status**: E2E Ready
