---
description: Workflow Add-Feature (11a/3) - VPS Deployment Preparation (Preparação)
---

# Workflow 11a/3: VPS Deployment - Preparação

Este é o **décimo primeiro workflow - Parte 1 de 3** de 11 etapas modulares.

**Pré-requisitos**: Ler `docs/PLAN.md` + `docs/TASK.md` | **Próximo**: add-feature-11b-vps-deployment-exec.md

---

## 🚨 REGRA CRÍTICA: USO MÁXIMO DE AGENTES (Claude Code)

**SEMPRE** usar o máximo de agentes em paralelo. Fase 24: 4 agentes (validação código/env/infra/backup). Fase 25: 3 agentes (build/testes/tamanho). Tempo esperado: 5min (paralelo) vs 20min+ (sequencial).

---

## 🎯 Objetivo Desta Preparação

Preparar ambiente e código para deploy seguro em VPS Docker Swarm + Traefik, validando:
- ✅ Código está atualizado e testes passam
- ✅ Build de produção funciona
- ✅ Ambiente configurado (.env, Dockerfile, etc)
- ✅ Infraestrutura VPS acessível e pronta
- ✅ Backup do banco realizado (se necessário)

---

## 📍 Informações Críticas do Ambiente

### VPS Details
- **Host**: `root@31.97.22.151`
- **Domain**: `life-tracker.stackia.com.br`
- **Stack Name**: `lifetracker`
- **Orchestration**: Docker Swarm
- **Reverse Proxy**: Traefik (SSL/TLS automático)
- **Image Registry**: Docker Hub (ou registry local)
- **Timezone**: America/Sao_Paulo (UTC-3)

### Arquivos Chave
- **Dockerfile**: `/Users/tiago/Projects/life_tracker/Dockerfile`
- **Docker Compose**: `/Users/tiago/Projects/life_tracker/docker-compose.yml`
- **Nginx Config**: `/Users/tiago/Projects/life_tracker/nginx.conf`

---

## ⚠️ Quando Executar Este Workflow?

**✅ Deploy quando**: Workflows 1-10 completos ☑ Testes passam ☑ Build OK ☑ Code review aprovado ☑ Horário comercial ☑ Time disponível 10-15min ☑

**❌ NÃO deploy quando**: Validações incompletas ☑ Testes falhando ☑ Sexta-feira após 17h ☑ Você não pode monitorar ☑ Breaking changes sem comunicação ☑

---

## 📋 Fase 24: Pré-Deploy Checklist

**CRÍTICO**: Verificar TODOS os itens antes de prosseguir. Um erro aqui pode causar downtime.

### 24.1 Validações de Código

```bash
# 1. Verificar se está na main atualizada
git checkout main
git pull origin main
git log --oneline -3  # Deve mostrar seus últimos commits

# 2. Verificar se não há mudanças não commitadas
git status  # Deve mostrar "nothing to commit, working tree clean"

# 3. Verificar se testes passam
npm run test
# ✅ Espera: Todos os testes GREEN

# 4. Verificar se build de produção funciona
npm run build
# ✅ Espera: Build sem erros, bundle em dist/

# 5. Verificar bundle size
du -sh dist/
# ✅ Espera: < 5MB total

# 6. Testar preview local
npm run preview &
PREVIEW_PID=$!
sleep 3
curl -f http://localhost:4173 > /dev/null && echo "✅ Preview OK" || echo "❌ Preview FAIL"
kill $PREVIEW_PID
```

**Checklist de Validação**:
- [ ] Main atualizada com últimos commits
- [ ] Working tree limpo (sem mudanças não commitadas)
- [ ] Todos os testes passando
- [ ] Build de produção sem erros
- [ ] Bundle size aceitável (< 5MB)
- [ ] Preview local funcionando

---

### 24.1.5 Validar Integridade do Merge (CRÍTICO)

⚠️ **IMPORTANTE**: Deploy REQUER código atualizado na main!

```bash
# Validar: branch=main, sync com origin, tree limpo, feature integrada
git branch --show-current | grep -q "^main$" && echo "✅ Branch main" || exit 1
git fetch origin && git diff main origin/main --quiet && echo "✅ Sincronizado" || exit 1
git status --porcelain | grep -q . && exit 1; echo "✅ Tree limpo"
```

**Checklist de Integridade**:
- [ ] Branch atual é main (sincronizada com origin/main)
- [ ] Working tree limpo (sem mudanças pendentes)
- [ ] Nenhum merge em progresso
- [ ] Feature integrada nos commits recentes

---

### 24.2 Validações de Ambiente

```bash
# 1. Verificar .env.production existe e está completo
if [ -f .env.production ]; then
  echo "✅ .env.production encontrado"
  # Verificar variáveis críticas (sem mostrar valores)
  grep -q "VITE_SUPABASE_URL" .env.production && echo "✅ VITE_SUPABASE_URL OK" || echo "❌ VITE_SUPABASE_URL MISSING"
  grep -q "VITE_SUPABASE_ANON_KEY" .env.production && echo "✅ VITE_SUPABASE_ANON_KEY OK" || echo "❌ VITE_SUPABASE_ANON_KEY MISSING"
else
  echo "❌ .env.production NÃO ENCONTRADO!"
fi

# 2. Verificar Dockerfile existe
[ -f Dockerfile ] && echo "✅ Dockerfile OK" || echo "❌ Dockerfile MISSING"

# 3. Verificar docker-compose.yml existe
[ -f docker-compose.yml ] && echo "✅ docker-compose.yml OK" || echo "❌ docker-compose.yml MISSING"

# 4. Verificar nginx.conf existe
[ -f nginx.conf ] && echo "✅ nginx.conf OK" || echo "❌ nginx.conf MISSING"
```

**Checklist de Ambiente**:
- [ ] `.env.production` existe com todas as variáveis
- [ ] `Dockerfile` presente
- [ ] `docker-compose.yml` presente
- [ ] `nginx.conf` presente

---

### 24.3 Validações de Infraestrutura

```bash
# 1. Verificar conectividade com VPS
ssh root@31.97.22.151 "echo '✅ SSH OK'" || echo "❌ SSH FAIL - Verificar conexão"

# 2. Verificar Docker Swarm ativo no VPS
ssh root@31.97.22.151 "docker info | grep -q 'Swarm: active' && echo '✅ Swarm OK' || echo '❌ Swarm INACTIVE'"

# 3. Verificar espaço em disco no VPS
ssh root@31.97.22.151 "df -h / | awk 'NR==2 {print \$5}' | sed 's/%//' | awk '{if (\$1 < 80) print \"✅ Disk OK (\" \$1 \"% usado)\"; else print \"❌ Disk WARNING (\" \$1 \"% usado)\"}'"

# 4. Verificar se Traefik está rodando
ssh root@31.97.22.151 "docker ps | grep -q traefik && echo '✅ Traefik OK' || echo '❌ Traefik NOT RUNNING'"

# 5. Verificar se stack lifetracker já existe (para determinar se é deploy inicial ou update)
ssh root@31.97.22.151 "docker stack ls | grep -q lifetracker && echo '✅ Stack existe (UPDATE)' || echo 'ℹ️ Stack não existe (DEPLOY INICIAL)'"
```

**Checklist de Infraestrutura**:
- [ ] SSH para VPS funcionando
- [ ] Docker Swarm ativo
- [ ] Espaço em disco suficiente (< 80%)
- [ ] Traefik rodando
- [ ] Stack status verificado (inicial ou update)

---

### 24.4 Backup do Banco de Dados

**CRÍTICO**: SEMPRE fazer backup antes de deploy que inclui migrations ou mudanças no schema.

```bash
# Se houver migrations na sua feature, SEMPRE fazer backup
if [ -d "supabase/migrations" ] && [ "$(ls -A supabase/migrations/*.sql 2>/dev/null)" ]; then
  echo "ℹ️ Migrations detectadas - Backup OBRIGATÓRIO"
  ./scripts/backup-supabase.sh
  echo "✅ Backup concluído em backups/backup-$(date +%Y%m%d-%H%M%S).sql"
else
  echo "ℹ️ Sem migrations - Backup recomendado mas opcional"
fi
```

**Checklist de Backup**:
- [ ] Backup do banco criado (se houver migrations)
- [ ] Backup salvo em `backups/backup-YYYYMMDD-HHMMSS.sql`
- [ ] Backup testado (verificar se arquivo não está vazio)

---

## 🏗️ Fase 25: Build e Validação Local da Imagem Docker

**Objetivo**: Testar a imagem Docker LOCALMENTE antes de fazer deploy no VPS.

### 25.1 Build da Imagem Docker

```bash
# Build multi-stage (Node.js builder + Nginx production)
docker build \
  --tag "life-tracker:$(date +%Y%m%d-%H%M%S)" \
  --tag "life-tracker:latest" \
  --file Dockerfile \
  --no-cache .

# ✅ Espera: Build sem erros (imagem < 100MB, ideal ~50MB)
docker images | grep life-tracker
```

**Checklist de Build**:
- [ ] Build completado sem erros
- [ ] Imagem < 100MB (ideal ~50MB)

---

### 25.2 Testar Imagem Localmente

```bash
# Rodar container, aguardar inicialização, validar HTTP + HTML
docker run -d --name test --publish 8080:80 \
  --env NODE_ENV=production --env TZ=America/Sao_Paulo life-tracker:latest

sleep 3

# Verificar health (status "healthy")
docker ps --filter "name=test" --format "{{.Status}}"

# Testar HTTP + HTML
curl -fs http://localhost:8080 | grep -q "<!DOCTYPE html>" && echo "✅ OK" || echo "❌ FAIL"

# Limpar
docker stop test && docker rm test
```

**Checklist de Validação**:
- [ ] Container iniciou e health check passou
- [ ] HTTP responde com HTML válido
- [ ] Sem erros críticos nos logs

---

## ✅ Checklist Final

**Pré-Deploy**: Main atualizada ☑ Testes passando ☑ Build OK ☑ .env.production ☑ Arquivos Docker ☑ SSH/Swarm ☑ Backup (se necessário) ☑

**Build & Validação**: Docker buildado ☑ Imagem testada ☑ Tamanho < 100MB ☑ Sem erros ☑

---

## 🎯 Próximos Passos

Você completou a **Fase 1 de 3** do Workflow 11.

**➡️ Próximo: add-feature-11b-vps-deployment-exec.md**

Nesta próxima parte, você vai:
1. Fazer deploy da imagem para VPS
2. Validar que a aplicação está rodando
3. Fazer smoke tests completos
4. Monitorar por 10 minutos

---

**Workflow 11a (Preparação) | Próximo**: add-feature-11b-vps-deployment-exec.md

---

## 🔄 Próximo Workflow (Automático)

✅ Preparação completa! Prosseguindo automaticamente para **Workflow 11b** (Deploy).

**Próximo**: `.windsurf/workflows/add-feature-11b-vps-deployment-exec.md`

**Checkpoint**: Se precisar pausar, este é um bom momento. Caso contrário, continue imediatamente para a fase de execução do deploy.

**O que esperar em 11b**:
- Fase 25: Build Docker local
- Fase 26: Deploy automático para VPS
- Fase 27: Validação pós-deploy (smoke tests)
- Tempo estimado: 10-15 minutos
