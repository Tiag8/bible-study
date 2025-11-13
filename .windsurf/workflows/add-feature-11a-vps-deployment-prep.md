---
description: Workflow Add-Feature (11a/4) - VPS Deployment Preparation - Part 1 (Preparação)
---

# Workflow 11a/4: VPS Deployment - Preparação (Parte 1)

**Décimo primeiro workflow - Parte 1 de 4**. **Pré-requisitos**: Ler `docs/PLAN.md` + `docs/TASK.md` | **Próximo**: add-feature-11a2-vps-deployment-prep-part2.md

---

## 🚨 REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE** usar máximo de agentes em paralelo. Fase 24: 4 agentes (validação código/env/infra/backup). Tempo: 5min vs 20min+.

---

## 🚨 PRÉ-REQUISITOS OBRIGATÓRIOS

**CRÍTICO**: Verificar TODOS os itens ANTES de executar. Se QUALQUER item está ❌: PARE e corrija.

### Workflows Anteriores Concluídos
- [ ] Workflow 5-9 completos (Implementation → Finalization)
- [ ] Workflow 6: GATE 3 aprovado (validação manual + screenshots)
- [ ] Workflow 7: Code Review + Security OK
- [ ] Snapshot BEFORE/AFTER capturado

### Validações Técnicas
- [ ] Testes E2E passaram: `./scripts/test-whatsapp-flow-complete.sh`
- [ ] Build OK: `npm run build`
- [ ] Lint OK: `npm run lint`
- [ ] TypeScript OK: `npx tsc --noEmit`

### Evidências e Documentação
- [ ] Screenshot em `docs/validation-screenshots/`
- [ ] Snapshot atualizado: `docs/FUNCTIONAL_STATE_SNAPSHOT.md`
- [ ] Último commit inclui "GATE 3 OK" ou "test: validar"

### Prontidão Operacional
- [ ] Rollback plan testado: `./scripts/vps-rollback.sh`
- [ ] Deploy incremental planejado
- [ ] Monitoramento preparado: `supabase functions logs`

---

## ⛔ SE ALGUM ITEM ACIMA ESTÁ ❌

**NÃO PROSSIGA!** Ações obrigatórias:
1. Complete workflows faltantes (5-9)
2. Execute validações técnicas
3. Documente evidências
4. SOMENTE após TUDO ✅, retorne

**Por quê?** Deploy sem validação = 80% chance regressão = 4h debugging vs 30min validação (ROI 8x).

**Caso real**: 2025-11-06 Onboarding WhatsApp regrediu por pular Workflow 6. Custo: 4h debugging.

---

## 📋 GATE 0: Validação Automatizada

Execute antes de iniciar Fase 24:
```bash
./scripts/pre-deploy-check.sh
```

**Se FALHAR**: Leia erro, corrija, re-execute. **Se PASSAR**: ✅ Prosseguir.

---

## 🎯 Objetivo

Preparar ambiente/código para deploy seguro em VPS Docker Swarm + Traefik:
- ✅ Código atualizado e testes passam
- ✅ Build de produção funciona
- ✅ Ambiente configurado (.env, Dockerfile)
- ✅ Infraestrutura VPS acessível
- ✅ Backup banco (se necessário)

---

## 📍 Informações Críticas

**VPS**: `root@31.97.22.151` | **Domain**: `life-tracker.stackia.com.br` | **Stack**: `lifetracker` | **Orchestration**: Docker Swarm | **Reverse Proxy**: Traefik | **Timezone**: America/Sao_Paulo (UTC-3)

**Arquivos Chave**: Dockerfile, docker-compose.yml, nginx.conf

---

## ⚠️ Quando Executar?

**✅ Deploy quando**: Workflows 1-10 completos ☑ Testes passam ☑ Build OK ☑ Code review OK ☑ Horário comercial ☑ Time disponível 10-15min ☑

**❌ NÃO deploy quando**: Validações incompletas ☑ Testes falhando ☑ Sexta pós 17h ☑ Não pode monitorar ☑

---

## 📋 Fase 24: Pré-Deploy Checklist

GATE 0 já validou pré-requisitos técnicos. Esta fase valida contexto de negócio.

### 24.1 Validações de Código
```bash
# 1. Main atualizada
git checkout main && git pull origin main
git log --oneline -3

# 2. Working tree limpo
git status  # Espera: "nothing to commit, working tree clean"

# 3. Testes
npm run test  # ✅ Todos GREEN

# 4. Build produção
npm run build  # ✅ Sem erros

# 5. Bundle size
du -sh dist/  # ✅ < 5MB

# 6. Preview local
npm run preview &
PREVIEW_PID=$!
sleep 3
curl -f http://localhost:4173 && echo "✅ OK" || echo "❌ FAIL"
kill $PREVIEW_PID
```

**Checklist**:
- [ ] Main atualizada
- [ ] Working tree limpo
- [ ] Testes passando
- [ ] Build OK
- [ ] Bundle < 5MB
- [ ] Preview funciona

---

### 24.1.5 Validar Integridade Merge

Deploy REQUER código atualizado na main:
```bash
# Validar: branch=main, sync, tree limpo, feature integrada
git branch --show-current | grep -q "^main$" && echo "✅ Branch main" || exit 1
git fetch origin && git diff main origin/main --quiet && echo "✅ Sync" || exit 1
git status --porcelain | grep -q . && exit 1; echo "✅ Tree limpo"
```

**Checklist**:
- [ ] Branch main sincronizada
- [ ] Working tree limpo
- [ ] Sem merge em progresso
- [ ] Feature integrada

---

### 24.2 Validações de Ambiente
```bash
# 1. .env.production
if [ -f .env.production ]; then
  echo "✅ .env.production OK"
  grep -q "VITE_SUPABASE_URL" .env.production && echo "✅ URL OK" || echo "❌ URL MISSING"
  grep -q "VITE_SUPABASE_ANON_KEY" .env.production && echo "✅ KEY OK" || echo "❌ KEY MISSING"
else
  echo "❌ .env.production NÃO ENCONTRADO"
fi

# 2-4. Arquivos Docker
[ -f Dockerfile ] && echo "✅ Dockerfile" || echo "❌ MISSING"
[ -f docker-compose.yml ] && echo "✅ docker-compose" || echo "❌ MISSING"
[ -f nginx.conf ] && echo "✅ nginx.conf" || echo "❌ MISSING"
```

**Checklist**:
- [ ] `.env.production` com todas variáveis
- [ ] `Dockerfile` presente
- [ ] `docker-compose.yml` presente
- [ ] `nginx.conf` presente

---

### 24.3 Validações de Infraestrutura
```bash
# 1. SSH
ssh root@31.97.22.151 "echo '✅ SSH OK'" || echo "❌ SSH FAIL"

# 2. Swarm
ssh root@31.97.22.151 "docker info | grep -q 'Swarm: active' && echo '✅ Swarm' || echo '❌ INACTIVE'"

# 3. Disco
ssh root@31.97.22.151 "df -h / | awk 'NR==2 {print \$5}' | sed 's/%//' | awk '{if (\$1 < 80) print \"✅ Disk (\" \$1 \"%)\"; else print \"❌ WARNING (\" \$1 \"%)\"}'"

# 4. Traefik
ssh root@31.97.22.151 "docker ps | grep -q traefik && echo '✅ Traefik' || echo '❌ NOT RUNNING'"

# 5. Stack status
ssh root@31.97.22.151 "docker stack ls | grep -q lifetracker && echo '✅ UPDATE' || echo 'ℹ️ DEPLOY INICIAL'"
```

**Checklist**:
- [ ] SSH OK
- [ ] Swarm ativo
- [ ] Disco < 80%
- [ ] Traefik rodando
- [ ] Stack status verificado

---

### 24.4 Backup do Banco

CRÍTICO: SEMPRE backup antes de migrations/schema changes.
```bash
# Se migrations, backup OBRIGATÓRIO
if [ -d "supabase/migrations" ] && [ "$(ls -A supabase/migrations/*.sql 2>/dev/null)" ]; then
  echo "ℹ️ Migrations - Backup OBRIGATÓRIO"
  ./scripts/backup-supabase.sh
  echo "✅ Backup em backups/backup-$(date +%Y%m%d-%H%M%S).sql"
else
  echo "ℹ️ Sem migrations - Backup opcional"
fi
```

**Checklist**:
- [ ] Backup criado (se migrations)
- [ ] Salvo em `backups/backup-YYYYMMDD-HHMMSS.sql`
- [ ] Arquivo não vazio

---

## ✅ Checkpoint: Fase 24 Completa

Main atualizada ☑ Testes OK ☑ Build OK ☑ .env.production ☑ Arquivos Docker ☑ SSH/Swarm ☑ Backup (se necessário) ☑

---

## 🧠 Meta-Learning

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua.

### Questões de Reflexão

**1. Eficiência (Nota 1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Qual fase ineficiente? Como melhorar?

**2. Iterações:**
- [ ] Número: __
- [ ] Se > 3: O que causou? Como tornar mais autônomo?

**3. Gaps:**
- [ ] Validação faltou? (qual? onde inserir?)
- [ ] Gate falhou? (qual melhorar?)
- [ ] Comando repetido 3+ vezes? (automatizar?)

**4. RCA (se problema):**
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados? (causa raiz sistêmica)
- [ ] Afeta múltiplas features? (SE NÃO: descartar - não sistêmico)
- [ ] Meta-learning previne recorrência?

### Ações de Melhoria

**Documentação:**
- [ ] Workflow precisa melhorias? → Descrever
- [ ] CLAUDE.md precisa seção? → Especificar
- [ ] Novo script útil? → Nome + função
- [ ] ADR necessário? → Decisão arquitetural

**ROI Esperado:** [ex: "20min/feature" ou "Previne bug 2h debugging"]

### ⚠️ IMPORTANTE
- Só documentar learnings SISTÊMICOS (não pontuais)
- Aplicar RCA para validar
- Consolidação em Workflow 8a

### Validação Tamanho
```bash
wc -c .windsurf/workflows/NOME_DESTE_WORKFLOW.md
# ✅ < 12000 chars | ❌ > 12000: comprimir/dividir
```

**Checklist Otimização** (se > 11k chars):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows

---

## 🔄 Próximo Workflow

✅ Validações completas! Prosseguir para **Workflow 11a2** (Build & Validação Docker).

**Próximo**: `.windsurf/workflows/add-feature-11a2-vps-deployment-prep-part2.md`

**O que esperar**: Fase 25: Build Docker + RCA (se necessário). Tempo: 5-10min.

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

**Criado**: 2025-11-08 | **Versão**: 2.1 | **Parte**: 1 de 4
