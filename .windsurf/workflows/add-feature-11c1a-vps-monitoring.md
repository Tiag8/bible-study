---
description: Workflow Add-Feature (11/11) - VPS Deployment - Parte 3a/3 (Monitoring - Health Checks e Testes)
---

## 📋 Workflow 11c1a - Monitoramento (Parte 1/2)

**Este é o Workflow 11 - Parte 3a/3 (Monitoramento do Deploy para Produção)**

**Partes do Workflow 11**:
- **Parte 1/3**: `add-feature-11a-vps-deployment-prep.md` (Pré-Deploy + Build)
- **Parte 2/3**: `add-feature-11b-vps-deployment-exec.md` (Deploy + Validação)
- **Parte 3a/3**: `add-feature-11c1a-vps-monitoring.md` (Monitoring) ← **VOCÊ ESTÁ AQUI**
- **Parte 3b/3**: `add-feature-11c1b-rca-rollback.md` (RCA + Rollback)
- **Parte 3c/3**: `add-feature-11c2-vps-rollback-docs.md` (Documentação)

---

## ⚡ Use Múltiplos Agentes

**Fase 28**: Logs + Testes de Carga + Métricas + Teste Manual (4 agentes paralelos)

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler Context Files

```bash
BRANCH_PREFIX=$(git symbolic-ref --short HEAD 2>/dev/null | sed 's/\//-/g' || echo "main")

# 1. Guia
cat .context/INDEX.md

# 2. Progresso (verificar Workflow 11b completo)
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 3. Estado (verificar deploy OK)
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 4. Decisões (revisar deploy decisions)
cat .context/${BRANCH_PREFIX}_decisions.md

# 5. Histórico (últimas 30 linhas)
tail -30 .context/${BRANCH_PREFIX}_attempts.log
```

**Checklist Pré-Monitoring**:
- [ ] Li INDEX.md?
- [ ] Workflow 11b marcado como ✅ COMPLETO em workflow-progress.md?
- [ ] temp-memory.md indica "DEPLOYED TO PRODUCTION"?
- [ ] Service status em temp-memory.md = 1/1 Running?
- [ ] Nenhum bloqueador crítico em attempts.log?

**Se NÃO leu ou deploy falhou**: ⛔ PARAR e resolver ANTES de monitoring.

### 0.2. Log Início Workflow

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 11c1a (VPS Monitoring) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🎯 Objetivo

Monitorar saúde da aplicação após deploy, executar testes de carga, validar funcionalidades, e garantir estabilidade.

---

## 📊 Fase 28: Monitoramento (10-15 minutos)

**CRÍTICO**: Monitorar por pelo menos 10 minutos após deploy bem-sucedido.

### 28.1 Monitorar Logs em Tempo Real

```bash
# Terminal 1: Logs em tempo real
ssh root@31.97.22.151 "docker service logs -f --tail 100 lifetracker_app"
```

**Checklist**:
- [ ] Logs aparecem em tempo real
- [ ] Requisições HTTP mostram status 200/304 (não 500/502/503/504)
- [ ] Nenhum "error", "crash", "fatal" nos primeiros 10min
- [ ] Timestamps corretos

---

### 28.2 Monitorar Métricas do Service

```bash
# Terminal 2: Verificar status a cada 2min
watch -n 120 "ssh root@31.97.22.151 'docker service ps lifetracker_app'"

# ❌ Se restarts > 2 em 10min: Acionar rollback (Workflow 11c1b)
```

**Checklist**:
- [ ] Current State = "Running", Desired State = "Running"
- [ ] Restart count ≤ 1
- [ ] Sem mudanças de node, Task ID permanece o mesmo

---

### 28.3 Testes de Carga Leve

```bash
# Terminal 3: Simular 100 requisições ao longo de ~1min
for i in {1..100}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://life-tracker.stackia.com.br)
  echo "Requisição $i: HTTP $HTTP_CODE"
  sleep 0.5
done | sort | uniq -c | sort -rn
```

**Checklist**:
- [ ] 100 requisições completadas
- [ ] 90%+ status 200, 5-10% status 304
- [ ] Sem timeouts ou 500/502/503
- [ ] Service não reiniciou durante teste

---

### 28.4 Teste Manual no Browser

Navegue para: **https://life-tracker.stackia.com.br**

**Verificações críticas**:

```
1. Página Inicial + Console (F12)
   [ ] Página carrega sem erros, layout OK
   [ ] Console sem erros em vermelho/CORS

2. Network (F12 → Network)
   [ ] Requisições HTTP retornam 200/304
   [ ] Tempo de resposta < 1s para HTML

3. Funcionalidade
   [ ] Autenticação funciona (login/logout)
   [ ] Feature nova está visível e funcional
   [ ] Dashboard carrega, formulários submetem sem erro

4. Performance + Compatibilidade
   [ ] Página não trava, animações smooth
   [ ] Testar em mobile (responsividade)
```

**Se encontrar erro**: Ir para Workflow 11c1b (RCA + Rollback)

---

### 28.5 Resumo do Monitoramento

```bash
# Capturar dados finais
echo "=== MONITORAMENTO 10 MINUTOS ==="
ssh root@31.97.22.151 "docker service logs --tail 20 lifetracker_app"
ssh root@31.97.22.151 "docker service ps lifetracker_app"
echo "Uptime verificado por 10min: ✅"
```

**Decisão**:
- ✅ **Tudo OK?** → Prosseguir para Workflow 11c2 (Documentação)
- ⚠️ **Warnings menores?** → Documentar, monitorar mais tempo, prosseguir 11c2
- ❌ **Erro crítico?** → Prosseguir para Workflow 11c1b (RCA + Rollback)

---

## ✅ Checklist Final: Monitoramento Completo (Fase 28)

- [ ] Logs monitorados por 10min sem interrupção
- [ ] Nenhum erro 500/502/503/504
- [ ] Service status "Running" o tempo todo, restart count ≤ 1
- [ ] Teste de carga OK (100 requisições, 90%+ status 200)
- [ ] Teste manual no browser OK, feature nova funcionando
- [ ] Sem regressões detectadas

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua do sistema.

### Questões de Reflexão (Responder TODAS)

**1. Eficiência do Workflow (Nota 1-10):**
- [ ] Nota atribuída: __/10
- [ ] Se nota < 8: Qual fase foi ineficiente? Como melhorar?

**2. Iterações com Usuário:**
- [ ] Número de iterações: __
- [ ] Se > 3: O que causou múltiplas idas e vindas?

**3. Gaps Identificados:**
- [ ] Alguma validação faltou? (qual? onde inserir checklist?)
- [ ] Algum gate falhou? (qual gate melhorar?)
- [ ] Algum comando repetido 3+ vezes? (automatizar em script?)

**4. Root Cause Analysis (RCA) - Se identificou problema:**
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados? (validar causa raiz sistêmica)
- [ ] Causa raiz afeta múltiplas features? Meta-learning previne recorrência?

### Ações de Melhoria (Se Aplicável)

**Documentação a atualizar:**
- [ ] Este workflow (.md) precisa melhorias? → Descrever
- [ ] CLAUDE.md precisa novo padrão/seção? → Especificar
- [ ] Novo script seria útil? → Nome + função
- [ ] ADR necessário? → Decisão arquitetural

**ROI Esperado:** [Estimar ganho - ex: "20min economizadas por feature futura"]

**⚠️ IMPORTANTE**:
- Só documentar learnings SISTÊMICOS (não pontuais)
- Aplicar RCA obrigatoriamente para validar se é sistêmico
- Consolidação final acontece no Workflow 8a (Meta-Learning centralizado)

**Guia completo**: `docs/WORKFLOW_META_LEARNING.md`

### Validação de Tamanho do Workflow

```bash
# Se alterou este workflow, validar tamanho
wc -c .windsurf/workflows/add-feature-11c1a-vps-monitoring.md
# ✅ Espera: < 12000 chars (12k limit)
```

**Se workflow > 11k chars**: Remover exemplos redundantes, consolidar checklists, extrair detalhes para docs/, dividir em 2 workflows.

---

## 📊 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 11c1a: VPS Monitoring ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Monitoramento logs 10min (tempo real, sem erros críticos)
  - Monitoramento service status (1/1 Running, restart ≤ 1)
  - Teste de carga (100 requisições, 90%+ status 200)
  - Teste manual browser (HTTPS, assets, funcionalidades)
  - Validação métricas (CPU, memória, disk, network)
- **Outputs**:
  - Logs: ✅ SEM ERROS (10min)
  - Service: 1/1 Running (restart count: [X])
  - Load test: [Y]% status 200 (90%+ ✅)
  - Manual test: ✅ PASSING
  - Uptime: 10min+ ✅
- **Decisão**: [TUDO OK / WARNINGS / PROBLEMAS]
- **Next**: [Workflow 11c2 (Docs) SE OK / Workflow 11c1b (RCA/Rollback) SE PROBLEMAS]
EOF
```

### F.2. Atualizar temp-memory.md

```bash
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

✅ **MONITORING COMPLETO**

Workflow 11c1a (VPS Monitoring) concluído - [TUDO OK / WARNINGS / PROBLEMAS].

**Status Deployment Pipeline**:
- ✅ Workflows 1-10 (Feature completa)
- ✅ Deployment Prep (Workflow 11a)
- ✅ Deployment Exec (Workflow 11b)
- ✅ **Monitoring (Workflow 11c1a)** ← **[STATUS]**

**Monitoring Results** (10min):
- Logs: [SEM ERROS / WARNINGS / ERROS]
- Service: 1/1 Running (restart: [X])
- Load test: [Y]% status 200
- Manual test: [OK / ISSUES]
- Uptime: 10min+ ✅

**Próximo passo**: [Workflow 11c2 (Docs) SE OK / Workflow 11c1b (RCA/Rollback) SE PROBLEMAS]

## Bloqueios/Questões

- [Nenhum / WARNINGS: X / BLOQUEADOR: Y]
EOF

sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Problemas Detectados)

**SE houve problemas ou decisão de rollback**:

```bash
cat >> .context/${BRANCH_PREFIX}_decisions.md <<'EOF'

---

## Decisão: Monitoring Outcome & Next Steps

**Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
**Contexto**: Workflow 11c1a - Monitoramento 10min pós-deploy
**Decisão**: [PROSSEGUIR COM DEPLOY / ROLLBACK NECESSÁRIO]

**Issues Detectados** (se aplicável):
- [Issue 1]: [Descrição + gravidade]
- [Issue 2]: [Descrição + gravidade]

**Métricas**:
- Error rate: [X]% (threshold: < 5%)
- Restart count: [Y] (threshold: ≤ 1)
- Response time p95: [Z]ms (threshold: < 1000ms)
- Load test success: [W]% (threshold: > 90%)

**Ação Tomada**:
- [PROSSEGUIR: Deploy estável, documentar / ROLLBACK: Acionar Workflow 11c1b]

**Referências**: [Logs snippet, screenshots, métricas capturadas]
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 11c1a (VPS Monitoring) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ✅ MONITORING: [STATUS] - Service 1/1 Running, Load test [Y]%, Manual OK" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] PRÓXIMO PASSO: [Workflow 11c2 (Docs) / Workflow 11c1b (RCA/Rollback)]" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md com monitoring results e decisão?
- [ ] Atualizei temp-memory.md (Estado Atual + Monitoring Results)?
- [ ] Atualizei decisions.md (se problemas detectados ou decisão rollback)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + status + próximo passo)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🔄 Próximo Workflow (Condicional)

**Checkpoint**: Decisão baseada em métricas da Seção 28.5.

### Caso 1 - Tudo OK ✅
- Monitoramento passou sem erros críticos
- Service status = "Running", restart count ≤ 1
- Teste de carga OK (90%+ status 200)
- Teste manual no browser sem erros

**Ação**: → **Workflow 11c2** (Documentação): `add-feature-11c2-vps-rollback-docs.md`

### Caso 2 - Problemas Detectados ❌
- Service status = "Failed" ou "Rejected"
- Erros 500/502/503 em > 20% requisições
- Service reinicia > 3 vezes em 10 min
- Feature quebrou funcionalidade crítica

**Ação**: → **Workflow 11c1b** (RCA + Rollback): `add-feature-11c1b-rca-rollback.md`
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

## 🔄 VALIDATION LOOP (OBRIGATÓRIO - Workflows Iterativos)

**APLICÁVEL**: Se monitoring detectou issues ou iterações de validação necessárias.

**Sistema**: Registrar monitoramento em `.context/{branch}_validation-loop.md`.

### Quando Usar

**Usar SE**:
- [ ] Monitoramento detectou erros (logs, métricas, testes)
- [ ] Service status problemático (restarts, falhas)
- [ ] Validação manual encontrou issues

**Criar Validation Loop** (SE aplicável):

```bash
BRANCH=$(git branch --show-current | sed 's/\//-/g')

cat > .context/${BRANCH}_validation-loop.md <<'EOF'
# Validation Loop - Workflow 11c1a (VPS Monitoring)

**Data Início**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
**Status**: 🔄 Em Progresso

## Iteração 1

**Monitoring**: [Logs / Service Status / Load Test / Manual]
**Issue**: [Erro detectado - ex: 502 errors, restarts > 3]
**Investigation**: [Causa analisada]
**Action**: [Fix ou rollback]
**Resultado**: ✅ | ❌

EOF
```

**Benefícios**: Troubleshooting rastreável, decisões de rollback documentadas, meta-learnings de deploy.

**Ref**: Workflow 6a aprovado

---

**Fim do Workflow 11c1a** - Monitoramento concluído.
