---
description: Workflow 11b - VPS Deployment Execution (Build, Deploy, Validação)
---

📋 **NOTA**: Workflow 11 - Parte 2/3 (Execução). Ver: `add-feature-11a` (prep) → `add-feature-11c` (monitor).

---

# Workflow 11b: VPS Deployment - EXECUÇÃO

**Três fases**:
1. **Fase 25**: Build e validação local Docker
2. **Fase 26**: Deploy automático para VPS
3. **Fase 27**: Validação pós-deploy (smoke tests)

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler Context Files

```bash
BRANCH_PREFIX=$(git symbolic-ref --short HEAD 2>/dev/null | sed 's/\//-/g' || echo "main")

# 1. Guia
cat .context/INDEX.md

# 2. Progresso (verificar Workflow 11a completo)
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 3. Estado (verificar deployment prep OK)
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 4. Decisões (revisar deployment strategy)
cat .context/${BRANCH_PREFIX}_decisions.md

# 5. Histórico (últimas 30 linhas)
tail -30 .context/${BRANCH_PREFIX}_attempts.log
```

**Checklist Pré-Deployment Exec**:
- [ ] Li INDEX.md?
- [ ] Workflow 11a marcado como ✅ COMPLETO em workflow-progress.md?
- [ ] temp-memory.md indica "DEPLOYMENT PREP COMPLETO"?
- [ ] Deployment strategy em decisions.md validada?
- [ ] Nenhum bloqueador em attempts.log?

**Se NÃO leu ou tem bloqueadores**: ⛔ PARAR e resolver ANTES de deployment exec.

### 0.2. Log Início Workflow

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 11b (VPS Deployment Exec) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🚫 Fase 0.5: Deploy Approval Checkpoint (Pre-Deploy)

**ZERO deploys production sem aprovação explícita**

**Validação OBRIGATÓRIA:**
- [ ] Environment correto? (production/staging)
- [ ] Pre-deploy checklist executado? (./scripts/pre-deploy-check.sh)
- [ ] Backup database recente? (< 24h)
- [ ] Rollback plan documentado?
- [ ] Smoke tests preparados?

**Template Checkpoint:**
```
🔴 DEPLOY TO VPS:
Environment: [production/staging]
VPS: 31.97.22.151
Changes: [listar features/fixes a deployar]

Pre-Deploy Checklist:
[✅/❌] Pre-deploy script passed
[✅/❌] Database backup exists
[✅/❌] Rollback plan ready

⚠️ OPERAÇÃO IRREVERSÍVEL (afeta usuários)
⏸️ APROVAR deploy to VPS? (yes/no)
```

**SE APROVADO**: Executar `./scripts/deploy-vps.sh`
**SE REJEITADO**: Corrigir issues e repetir checklist

**REGRA CRÍTICA**: Se qualquer item checklist falhou, BLOQUEAR deploy

---

## 🏗️ Fase 25: Build e Validação Local

**Objetivo**: Build Docker local + testes básicos.

```bash
# Build com timestamp
IMAGE_TAG="life-tracker:$(date +%Y%m%d-%H%M%S)"
docker build --tag $IMAGE_TAG --tag life-tracker:latest -f Dockerfile .

# Testar localmente
docker run -d --name lifetracker-test --publish 8080:80 \
  --env NODE_ENV=production --env TZ=America/Sao_Paulo $IMAGE_TAG
sleep 5

# Validações
docker ps --filter "name=lifetracker-test" --format "{{.Status}}"
curl -f http://localhost:8080 > /dev/null && echo "✅ HTTP OK"
curl -s http://localhost:8080 | grep -q "<!DOCTYPE html>" && echo "✅ HTML OK"
docker logs lifetracker-test | grep -i error || echo "✅ No errors"

# Cleanup
docker stop lifetracker-test && docker rm lifetracker-test

# Verificar tamanho (target: < 100MB)
docker images life-tracker:latest --format "{{.Repository}}:{{.Tag}} - {{.Size}}"
```

**Checklist**:
- [ ] Build completado sem erros
- [ ] Container iniciou e está healthy
- [ ] HTTP responde na porta 8080
- [ ] HTML válido
- [ ] Sem erros críticos nos logs
- [ ] Tamanho < 100MB

---

## 🚀 Fase 26: Deploy para VPS

**Use script automático** (recomendado):

```bash
# Se script não existe, criar:
./scripts/deploy-vps.sh

# Se não tiver script, usar manual (ver docs/ops/vps-deployment.md)
```

**O que o script faz**:
- Build Docker (local)
- Salva como `.tar`
- Transfere para VPS via SCP
- Carrega no Docker Swarm
- Deploy stack
- Limpa temporários

**Tempo**: ~5-7 minutos

**Checklist**:
- [ ] Script executado sem erros
- [ ] Imagem transferida para VPS
- [ ] Stack deployed no Swarm

---

## ✅ Fase 27: Validação Pós-Deploy

**Verificar status**:

```bash
# Status do service
ssh root@31.97.22.151 "docker service ls | grep lifetracker"
# Espera: 1/1 replicas

ssh root@31.97.22.151 "docker service ps lifetracker_app --no-trunc"
# Espera: Current State = "Running"
```

**Smoke tests**:

```bash
# HTTP/HTTPS
curl -f https://life-tracker.stackia.com.br > /dev/null && echo "✅ HTTPS OK"

# HTML
curl -s https://life-tracker.stackia.com.br | grep -q "<!DOCTYPE html>" && echo "✅ HTML OK"

# Assets
curl -s https://life-tracker.stackia.com.br | grep -q "assets/" && echo "✅ Assets OK"

# SSL
curl -s https://life-tracker.stackia.com.br -v 2>&1 | grep -q "SSL certificate verify ok" && echo "✅ SSL OK"
```

**Se problemas, verificar logs**:

```bash
ssh root@31.97.22.151 "docker service logs --tail 50 lifetracker_app"
```

**Problemas comuns** (ver `docs/debugging/`):
- Service não inicia: Verificar logs, imagem corrompida?
- HTTPS não responde: Aguardar 2-3min (Let's Encrypt provisioning)
- HTML vazio: Build falhou, verificar `/usr/share/nginx/html`

---

### 27.1 Root Cause Analysis (Se Validação Falhar)

**Quando usar**: Smoke tests falham, mas causa não é óbvia após verificar logs.

**Processo sistemático (5 Why's)**:

```
Exemplo 1: "Service não inicia (Current State = Rejected)"

1. Por quê service foi rejeitado?
   → "Docker Swarm recusou iniciar o container"

2. Por quê Swarm recusou?
   → "Health check falhou 3 vezes consecutivas"

3. Por quê health check falha?
   → "curl http://localhost:80 retorna erro de conexão"

4. Por quê conexão falha?
   → "Alpine Linux não resolve localhost, apenas 127.0.0.1"

5. Causa Raiz: Health check usa localhost em Alpine
   Solução: Alterar HEALTHCHECK no Dockerfile para usar 127.0.0.1
```

```
Exemplo 2: "HTTPS responde mas HTML está vazio"

1. Por quê HTML está vazio?
   → "Nginx está servindo diretório vazio"

2. Por quê diretório está vazio?
   → "dist/ não foi copiado para /usr/share/nginx/html"

3. Por quê dist/ não foi copiado?
   → "Dockerfile multi-stage não copia dist/ do builder"

4. Por quê COPY falhou?
   → "COPY --from=builder /app/dist não encontra arquivos"

5. Causa Raiz: Build de produção (npm run build) não executou no stage builder
   Solução: Verificar Dockerfile, adicionar RUN npm run build antes de COPY
```

**Problemas deploy + RCA típico**:

| Sintoma | 5 Why's Resumido | Causa Raiz | Solução | ADR/Doc |
|---------|------------------|------------|---------|---------|
| Service "Rejected" | Por quê? Health check falha → Por quê? localhost em Alpine | Health check usa localhost | Usar 127.0.0.1 em HEALTHCHECK | Meta-Learning 3 |
| Traefik não roteia | Por quê? Service não aparece em /api/routes → Por quê? Label faltando | traefik.docker.network não definida | Adicionar label no docker-compose.yml | Meta-Learning 2 |
| HTML vazio | Por quê? dist/ vazio → Por quê? Build não executou | .env não disponível em build time | .dockerignore bloqueia .env, remover | Meta-Learning 1 |
| HTTPS ERR_CERT | Por quê? Let's Encrypt falhou → Por quê? DNS não propaga | DNS não aponta para VPS | Verificar nslookup + aguardar propagação | docs/ops/dns.md |
| Performance lenta | Por quê? CPU 100% → Por quê? Loop infinito | Code regression | Verificar git diff, rollback se necessário | git revert |

**Correlacionar múltiplos sinais**:

Se múltiplos problemas aparecem juntos, pode ser causa raiz comum:
- Service não inicia + Logs vazios + Health check fail → **Imagem corrompida** (rebuild)
- HTTPS timeout + Traefik logs error + DNS OK → **Rate limit Let's Encrypt** (aguardar 1h)
- HTML OK + API 502 + Database timeout → **Supabase credentials inválidas** (verificar .env)

**Checklist RCA**:
- [ ] Identifiquei sintoma exato (status, log, comportamento)
- [ ] Coletei evidências (logs VPS, Traefik, container)
- [ ] Perguntei "Por quê?" 5 vezes até causa raiz
- [ ] Causa raiz é algo fixável (não "sorte" ou "timing")
- [ ] Testei solução em ambiente isolado (se possível)
- [ ] Documentei em commit/ADR/TROUBLESHOOTING.md

**Se RCA não resolve em 10-15min**: Use workflow de debugging completo:
```bash
# Ver workflow de debugging multi-agent
cat .windsurf/workflows/debug-complex-problem.md
```

---

**Checklist**:
- [ ] Service status = 1/1 replicas
- [ ] Current State = "Running"
- [ ] HTTPS responde
- [ ] HTML válido
- [ ] Assets servindo
- [ ] SSL válido
- [ ] Teste manual no browser OK

---

## ⏸️ Fase 27.5: Git Approval Checkpoint (Git Tag)

**Git tags são imutáveis (versionamento semântico)**

**Validação:**
- [ ] Deploy 100% sucesso?
- [ ] Smoke tests passaram?
- [ ] Versão semântica correta? (vX.Y.Z)
- [ ] Tag message descritiva?
- [ ] CHANGELOG.md atualizado?

**Template Checkpoint:**
```
✅ DEPLOY SUCCESS - Criar Git Tag:
Tag: v[X.Y.Z]
Message: [deployment summary]

Deployment Status:
[✅] Deploy completed
[✅] Health checks OK
[✅] Smoke tests passed

⏸️ APROVAR git tag? (yes/no)
```

**SE APROVADO**: Executar `git tag -a v[X.Y.Z]` + push tag
**SE REJEITADO**: Investigar issues antes de tagear

**REGRA**: Tag APENAS após deploy 100% validado

---

## 📊 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 11b: VPS Deployment Exec ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Build Docker local (multi-stage, Alpine)
  - Push image para VPS (rsync/scp)
  - Deploy Docker Swarm (docker stack deploy)
  - Health checks (curl HTTPS, service status)
  - Smoke tests (HTML válido, assets OK, SSL OK)
- **Outputs**:
  - Image: life-tracker:$(date +%Y%m%d-%H%M%S)
  - Service: lifetracker_app (1/1 replicas Running)
  - URL: https://life-tracker.stackia.com.br ✅ HTTPS OK
  - SSL: ✅ VALID
  - Smoke tests: ✅ PASSING
- **Deploy Time**: [timestamp deploy completo]
- **Next**: Workflow 11c1a (VPS Monitoring 10-15min)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

✅ **DEPLOYED TO PRODUCTION**

Workflow 11b (VPS Deployment Exec) concluído.

**Status Deployment Pipeline**:
- ✅ Workflows 1-10 (Feature completa)
- ✅ Deployment Prep (Workflow 11a)
- ✅ **Deployment Exec (Workflow 11b)** ← **DEPLOYED**

**Production Status**:
- ✅ Service: lifetracker_app (1/1 replicas Running)
- ✅ URL: https://life-tracker.stackia.com.br (HTTPS OK)
- ✅ SSL: VALID
- ✅ Health checks: PASSING
- ✅ Smoke tests: OK (HTML, assets, SSL)

**Deploy Info**:
- Image: life-tracker:[timestamp]
- Deploy time: [timestamp]
- Service replicas: 1/1 Running

**Próximo passo**: Workflow 11c1a (VPS Monitoring) - Monitorar 10-15min

## Bloqueios/Questões

- Nenhum bloqueador - monitoramento necessário (10-15min)
EOF

sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisão Tomada)

**SE houve decisão crítica durante deploy**:

```bash
cat >> .context/${BRANCH_PREFIX}_decisions.md <<'EOF'

---

## Decisão: Deploy Execution Strategy

**Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
**Contexto**: Workflow 11b - Deploy Docker Swarm em produção
**Decisão**: [Rolling update / Blue-Green / Recreate]

**Configurações Aplicadas**:
- Update parallelism: [1 / 2 / 3]
- Update delay: [10s / 30s / 60s]
- Rollback on failure: [SIM / NÃO]
- Health check grace period: [30s / 60s / 90s]

**Resultado**:
- Deploy time total: [X minutos]
- Downtime: [ZERO / X segundos]
- Replicas afetadas: [1/1 / 2/2]

**Issues Durante Deploy** (se aplicável):
- [Issue 1]: [Como resolvido]
- [Issue 2]: [Como resolvido]

**Referências**: ADR-003 (Docker Swarm), docs/ops/deploy-history.md
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 11b (VPS Deployment Exec) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ✅ DEPLOY: Service lifetracker_app 1/1 Running, HTTPS OK, SSL OK" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] PRÓXIMO PASSO: Workflow 11c1a (VPS Monitoring - 10-15min obrigatório)" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md com deploy timestamp e service status?
- [ ] Atualizei temp-memory.md (Estado Atual + Production Status)?
- [ ] Atualizei decisions.md (se deploy strategy decidida ou issues encontrados)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + service status)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🎯 Próximos Passos

**Deploy OK?** → Prosseguir para `add-feature-11c1` (Monitoramento 10-15min)

**Problemas?** → Ver `docs/debugging/` ou `docs/TROUBLESHOOTING.md`

---

**Workflow**: 11b | **Status**: Pronto | **Versão**: 1.0 (otimizado 2025-11-03)

---

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Esta fase é fundamental para evolução contínua do sistema.

**Objetivo**: Identificar melhorias nos workflows, scripts e processos baseado na execução desta feature.

### Questões de Reflexão (Responder TODAS)

**1. Eficiência do Workflow (Nota 1-10):**
- [ ] Nota atribuída: __/10
- [ ] Se nota < 8: Qual fase foi ineficiente? Como melhorar?
- [ ] Alguma fase tomou muito tempo? Qual? Por quê?

**2. Iterações com Usuário:**
- [ ] Número de iterações necessárias: __
- [ ] Se > 3 iterações: O que causou múltiplas idas e vindas?
- [ ] Como tornar workflow mais autônomo/claro para próxima vez?

**3. Gaps Identificados:**
- [ ] Alguma validação faltou? (Se SIM: qual? onde inserir checklist?)
- [ ] Algum gate falhou para detectar erro? (Se SIM: qual gate melhorar?)
- [ ] Algum comando foi repetido 3+ vezes? (Se SIM: automatizar em script?)

**4. Root Cause Analysis (RCA) - Se identificou problema:**
- [ ] Problema: [descrever brevemente]
- [ ] 5 Whys aplicados? (validar causa raiz sistêmica, não sintoma pontual)
- [ ] Causa raiz afeta múltiplas features? (SE NÃO: descartar learning - não é sistêmico)
- [ ] Meta-learning previne recorrência? (não apenas corrige sintoma desta feature)

### Ações de Melhoria (Se Aplicável)

**Documentação a atualizar:**
- [ ] Este workflow (.md) precisa melhorias? → Descrever alterações necessárias
- [ ] CLAUDE.md precisa novo padrão/seção? → Especificar o quê
- [ ] Novo script seria útil? → Nome do script + função
- [ ] ADR necessário? → Decisão arquitetural a documentar

**ROI Esperado:** [Estimar ganho - ex: "20min economizadas por feature futura" ou "Previne bug que custaria 2h debugging"]

### ⚠️ IMPORTANTE

- **Só documentar learnings SISTÊMICOS** (não pontuais/específicos desta feature)
- **Aplicar RCA obrigatoriamente** para validar se é realmente sistêmico
- **Consolidação final** acontece no Workflow 8a (Meta-Learning centralizado)

### Validação de Tamanho do Workflow

```bash
# Se você fez alterações neste workflow, validar tamanho
wc -c .windsurf/workflows/NOME_DESTE_WORKFLOW.md
# ✅ Espera: < 12000 chars (12k limit)
# ❌ Se > 12000: Comprimir ou dividir workflow
```

**Checklist de Otimização** (se workflow > 11k chars):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists similares
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows (se > 12k)

## 🔄 Próximo Workflow (Automático)

✅ Deploy executado! Prosseguindo automaticamente para **Workflow 11c1** (Monitoramento).

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


**Próximo**: `.windsurf/workflows/add-feature-11c1-vps-monitoring.md`

**⚠️ IMPORTANTE**: Monitoramento deve começar **imediatamente** após deploy bem-sucedido. Não deixe passar mais de 30-60 segundos entre o fim do deploy e início do monitoramento.

**Checkpoint**: Verifique se todos os smoke tests passaram antes de prosseguir.