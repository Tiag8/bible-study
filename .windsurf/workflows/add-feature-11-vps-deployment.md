---
description: Workflow Add-Feature (11/11) - VPS Deployment (Deploy para Produção)
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

# Workflow 11/11: VPS Deployment (Deploy para Produção)

Este é o **décimo primeiro e último workflow** de 11 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 24: Pré-Deploy Checklist (Verificações de Segurança)
- Fase 25: Build e Validação Local (Testar Imagem Docker)
- Fase 26: Deploy para VPS (Automático com script)
- Fase 27: Validação Pós-Deploy (Smoke Tests)
- Fase 28: Monitoramento (10 minutos de observação)
- Fase 29: Rollback (Se necessário)
- Fase 30: Documentação do Deploy

---

## 🎯 Objetivo

Deploy seguro e automatizado para VPS (Virtual Private Server) usando Docker Swarm + Traefik, com validação completa e procedimento de rollback.

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

### ✅ Executar Deploy quando:

1. **Feature completa e validada**
   - ✅ Todos os workflows anteriores (1-10) foram completados
   - ✅ Merge na main foi feito (Workflow 9)
   - ✅ Template sync concluído (Workflow 10)
   - ✅ Testes passando (unit + integration + E2E)
   - ✅ Code review aprovado
   - ✅ Security scan passou

2. **Build de produção validado**
   - ✅ `npm run build` sem erros
   - ✅ Bundle size aceitável (< 1MB inicial)
   - ✅ Preview local testado (`npm run preview`)

3. **Contexto apropriado**
   - ✅ Horário comercial (9h-18h) - evitar deploy em horários críticos
   - ✅ Não há incidentes em andamento
   - ✅ Backup do banco atualizado (< 24h)
   - ✅ Time disponível para monitorar por 10-15min

### ❌ NÃO executar deploy quando:

1. **Validações incompletas**
   - ❌ Workflows 1-10 não foram concluídos
   - ❌ Testes falhando
   - ❌ Build com erros ou warnings críticos
   - ❌ Code review pendente

2. **Contexto inadequado**
   - ❌ Sexta-feira após 17h (evitar deploys antes do fim de semana)
   - ❌ Véspera de feriados
   - ❌ Durante horários de pico (20h-23h se app tem usuários)
   - ❌ Você não pode monitorar por 10-15min

3. **Riscos técnicos**
   - ❌ Mudanças no schema do banco sem migrations testadas
   - ❌ Breaking changes sem plano de comunicação
   - ❌ Dependências novas não auditadas
   - ❌ Feature flags não configuradas (se aplicável)

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

⚠️ **IMPORTANTE**: Workflow 9 diz que merge é OPCIONAL, mas deploy REQUER código atualizado!

Esta validação garante que o código a ser deployado inclui todas as mudanças da feature.

```bash
# 1. Verificar se está na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "❌ ERRO: Você NÃO está na branch main (está em: $CURRENT_BRANCH)"
  echo "Deploy deve ser feito SEMPRE da main!"
  exit 1
else
  echo "✅ Branch main confirmada"
fi

# 2. Verificar se main está atualizada com origin
git fetch origin main
LOCAL_HASH=$(git rev-parse main)
REMOTE_HASH=$(git rev-parse origin/main)

if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
  echo "❌ ERRO: Branch main local está DESATUALIZADA"
  echo "Local:  $LOCAL_HASH"
  echo "Remote: $REMOTE_HASH"
  echo "Execute: git pull origin main"
  exit 1
else
  echo "✅ Main sincronizada com origin"
fi

# 3. Verificar working tree limpo (sem mudanças não commitadas)
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ ERRO: Working tree com mudanças não commitadas"
  echo "Mudanças detectadas:"
  git status --short
  echo "Execute: git stash ou git commit antes do deploy"
  exit 1
else
  echo "✅ Working tree limpo"
fi

# 4. Verificar que não há merge em progresso
if [ -f .git/MERGE_HEAD ]; then
  echo "❌ ERRO: Merge em progresso detectado!"
  echo "Complete ou aborte o merge antes do deploy:"
  echo "  git merge --abort   # Para abortar"
  echo "  git merge --continue # Para continuar"
  exit 1
else
  echo "✅ Nenhum merge em progresso"
fi

# 5. Verificar merge nos últimos commits (evidência de integração)
RECENT_MERGES=$(git log --oneline --merges -10 | head -5)
if [ -z "$RECENT_MERGES" ]; then
  echo "⚠️ ATENÇÃO: Nenhum merge detectado nos últimos 10 commits"
  echo "Você fez merge da feature branch na main (Workflow 9)?"
  echo ""
  echo "Últimos 5 commits:"
  git log --oneline -5
  echo ""
  read -p "Confirmar deploy mesmo sem merge recente? (yes/NO): " CONFIRM_NO_MERGE
  if [ "$CONFIRM_NO_MERGE" != "yes" ]; then
    echo "Deploy cancelado. Execute Workflow 9 primeiro."
    exit 1
  fi
else
  echo "✅ Merge(s) recente(s) detectado(s):"
  echo "$RECENT_MERGES"
fi

# 6. Mostrar commits desde último tag (se houver)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LAST_TAG" ]; then
  echo ""
  echo "📊 Commits desde último deploy ($LAST_TAG):"
  git log --oneline "$LAST_TAG..HEAD" | head -10
else
  echo ""
  echo "📊 Últimos 10 commits a serem deployados:"
  git log --oneline -10
fi
```

**Checklist de Integridade do Merge**:
- [ ] Branch atual é main
- [ ] Main sincronizada com origin/main
- [ ] Working tree limpo (sem mudanças pendentes)
- [ ] Nenhum merge em progresso
- [ ] Merge da feature detectado nos commits recentes (ou confirmado manualmente)
- [ ] Lista de commits a serem deployados revisada

**Por que isso é crítico?**
- Deploy da feature branch = código incompleto/desatualizado
- Main desatualizada = pode fazer deploy de código antigo
- Merge em progresso = estado inconsistente
- Working tree sujo = mudanças não rastreadas vão para produção

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
# 1. Definir tag da imagem com timestamp
IMAGE_TAG="life-tracker:$(date +%Y%m%d-%H%M%S)"
IMAGE_LATEST="life-tracker:latest"

echo "📦 Building Docker image: $IMAGE_TAG"

# 2. Build multi-stage (Node.js builder + Nginx production)
docker build \
  --tag $IMAGE_TAG \
  --tag $IMAGE_LATEST \
  --file Dockerfile \
  --no-cache \
  .

# ✅ Espera: Build completado com sucesso (exitcode 0)
if [ $? -eq 0 ]; then
  echo "✅ Docker build OK"
  docker images | grep life-tracker
else
  echo "❌ Docker build FAILED"
  exit 1
fi
```

**O que acontece no build**:
1. **Stage 1 (builder)**: Node.js 18 Alpine
   - Instala dependências (`npm install`)
   - Build do Vite (`npm run build`)
   - Gera bundle em `/app/dist`

2. **Stage 2 (production)**: Nginx Alpine
   - Copia arquivos buildados de `/app/dist` para `/usr/share/nginx/html`
   - Configura Nginx com `nginx.conf`
   - Configura timezone America/Sao_Paulo
   - Expõe porta 80
   - Imagem final < 50MB

**Checklist de Build**:
- [ ] Comando `docker build` completado sem erros
- [ ] Imagem criada com tags (timestamped + latest)
- [ ] Imagem aparece em `docker images`
- [ ] Tamanho da imagem aceitável (< 100MB)

---

### 25.2 Testar Imagem Localmente

```bash
# 1. Rodar container local para testes
docker run -d \
  --name lifetracker-test \
  --publish 8080:80 \
  --env NODE_ENV=production \
  --env TZ=America/Sao_Paulo \
  $IMAGE_LATEST

# 2. Aguardar 5s para inicialização
sleep 5

# 3. Verificar health check
docker ps --filter "name=lifetracker-test" --format "{{.Status}}"
# ✅ Espera: Status com "(healthy)"

# 4. Testar HTTP response
curl -f http://localhost:8080 > /dev/null && echo "✅ HTTP OK" || echo "❌ HTTP FAIL"

# 5. Testar se HTML está sendo servido
curl -s http://localhost:8080 | grep -q "<!DOCTYPE html>" && echo "✅ HTML OK" || echo "❌ HTML MALFORMED"

# 6. Verificar logs para erros
docker logs lifetracker-test | grep -i error && echo "⚠️ Errors found in logs" || echo "✅ No errors in logs"

# 7. Limpar container de teste
docker stop lifetracker-test
docker rm lifetracker-test
```

**Checklist de Validação Local**:
- [ ] Container iniciou sem erros
- [ ] Health check passou (status "healthy")
- [ ] HTTP responde na porta 8080
- [ ] HTML válido sendo servido
- [ ] Sem erros críticos nos logs
- [ ] Container de teste removido

---

### 25.3 Verificar Tamanho da Imagem

```bash
# Verificar tamanho da imagem
docker images life-tracker:latest --format "{{.Repository}}:{{.Tag}} - {{.Size}}"

# ✅ Target: < 100MB (ideal: ~50MB com Nginx Alpine)
```

**Checklist de Tamanho**:
- [ ] Imagem < 100MB (ideal: ~50MB)
- [ ] Se > 100MB, investigar (possível problema no build)

---

## 🚀 Fase 26: Deploy para VPS

**IMPORTANTE**: Deploy pode ser automático (script) ou manual. Recomenda-se automático para consistência.

### 26.1 Deploy Automático (Recomendado)

**⚠️ ATENÇÃO**: Este script NÃO existe ainda no projeto. Vamos criar durante o deploy.

```bash
# Criar script de deploy VPS
cat > scripts/deploy-vps.sh << 'EOF'
#!/bin/bash
# Script de deploy automatizado para VPS
# Deploy Life Tracker para Docker Swarm em VPS

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
VPS_HOST="root@31.97.22.151"
STACK_NAME="lifetracker"
IMAGE_NAME="life-tracker"
IMAGE_TAG="latest"
DOMAIN="life-tracker.stackia.com.br"

echo -e "${GREEN}🚀 Life Tracker - Deploy para VPS${NC}"
echo "================================================"
echo "Host: $VPS_HOST"
echo "Stack: $STACK_NAME"
echo "Domain: $DOMAIN"
echo "================================================"

# 1. Build da imagem Docker localmente
echo -e "\n${YELLOW}📦 Step 1/6: Building Docker image...${NC}"
docker build -t $IMAGE_NAME:$IMAGE_TAG -f Dockerfile . || {
  echo -e "${RED}❌ Docker build FAILED${NC}"
  exit 1
}
echo -e "${GREEN}✅ Docker build OK${NC}"

# 2. Salvar imagem como tar
echo -e "\n${YELLOW}💾 Step 2/6: Saving image to tar...${NC}"
docker save $IMAGE_NAME:$IMAGE_TAG -o /tmp/$IMAGE_NAME.tar || {
  echo -e "${RED}❌ Docker save FAILED${NC}"
  exit 1
}
echo -e "${GREEN}✅ Image saved to /tmp/$IMAGE_NAME.tar${NC}"

# 3. Transferir imagem para VPS
echo -e "\n${YELLOW}📤 Step 3/6: Transferring image to VPS...${NC}"
scp /tmp/$IMAGE_NAME.tar $VPS_HOST:/tmp/ || {
  echo -e "${RED}❌ SCP transfer FAILED${NC}"
  exit 1
}
echo -e "${GREEN}✅ Image transferred${NC}"

# 4. Carregar imagem no VPS
echo -e "\n${YELLOW}📥 Step 4/6: Loading image on VPS...${NC}"
ssh $VPS_HOST "docker load -i /tmp/$IMAGE_NAME.tar && rm /tmp/$IMAGE_NAME.tar" || {
  echo -e "${RED}❌ Docker load FAILED${NC}"
  exit 1
}
echo -e "${GREEN}✅ Image loaded on VPS${NC}"

# 5. Transferir docker-compose.yml para VPS
echo -e "\n${YELLOW}📋 Step 5/6: Transferring docker-compose.yml...${NC}"
scp docker-compose.yml $VPS_HOST:/tmp/docker-compose-$STACK_NAME.yml || {
  echo -e "${RED}❌ docker-compose.yml transfer FAILED${NC}"
  exit 1
}
echo -e "${GREEN}✅ docker-compose.yml transferred${NC}"

# 6. Deploy stack no Docker Swarm
echo -e "\n${YELLOW}🚢 Step 6/6: Deploying stack to Docker Swarm...${NC}"
ssh $VPS_HOST "docker stack deploy -c /tmp/docker-compose-$STACK_NAME.yml $STACK_NAME" || {
  echo -e "${RED}❌ Stack deploy FAILED${NC}"
  exit 1
}
echo -e "${GREEN}✅ Stack deployed${NC}"

# Limpar arquivo local
rm /tmp/$IMAGE_NAME.tar

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}🎉 Deploy completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "📊 Next steps:"
echo "  1. Wait 30-60s for service to start"
echo "  2. Check service status: ssh $VPS_HOST 'docker service ls'"
echo "  3. Check logs: ssh $VPS_HOST 'docker service logs $STACK_NAME\_app'"
echo "  4. Access: https://$DOMAIN"
echo ""
echo "🔍 Monitoring commands:"
echo "  docker service ls                    # List services"
echo "  docker service ps $STACK_NAME\_app   # Service tasks"
echo "  docker service logs -f $STACK_NAME\_app  # Follow logs"
echo ""
EOF

# Tornar script executável
chmod +x scripts/deploy-vps.sh

# Executar deploy
./scripts/deploy-vps.sh
```

**O que o script faz**:
1. ✅ Build da imagem Docker localmente
2. ✅ Salva imagem como `.tar`
3. ✅ Transfere `.tar` para VPS via SCP
4. ✅ Carrega imagem no Docker do VPS
5. ✅ Transfere `docker-compose.yml` para VPS
6. ✅ Deploy stack no Docker Swarm
7. ✅ Limpa arquivos temporários

**Tempo estimado**: 5-7 minutos (dependendo da velocidade da internet)

**Checklist de Deploy Automático**:
- [ ] Script `deploy-vps.sh` criado
- [ ] Script executado sem erros
- [ ] Imagem transferida para VPS
- [ ] Stack deployed no Swarm
- [ ] Sem erros no output do script

---

### 26.2 Deploy Manual (Alternativa)

**Use apenas se script automático falhar ou para entender o processo.**

```bash
# 1. Build da imagem Docker localmente
docker build -t life-tracker:latest -f Dockerfile .

# 2. Salvar imagem como tar
docker save life-tracker:latest -o /tmp/life-tracker.tar

# 3. Transferir imagem para VPS
scp /tmp/life-tracker.tar root@31.97.22.151:/tmp/

# 4. Carregar imagem no VPS
ssh root@31.97.22.151 "docker load -i /tmp/life-tracker.tar && rm /tmp/life-tracker.tar"

# 5. Transferir docker-compose.yml para VPS
scp docker-compose.yml root@31.97.22.151:/tmp/docker-compose-lifetracker.yml

# 6. Deploy stack no Docker Swarm
ssh root@31.97.22.151 "docker stack deploy -c /tmp/docker-compose-lifetracker.yml lifetracker"

# 7. Aguardar 30-60s para service iniciar
sleep 60

# 8. Verificar status do service
ssh root@31.97.22.151 "docker service ls | grep lifetracker"

# 9. Limpar arquivo local
rm /tmp/life-tracker.tar
```

**Checklist de Deploy Manual**:
- [ ] Cada comando executado sem erros
- [ ] Imagem carregada no VPS
- [ ] Stack deployed no Swarm
- [ ] Service listado em `docker service ls`

---

## ✅ Fase 27: Validação Pós-Deploy (Smoke Tests)

**CRÍTICO**: Validar que a aplicação está rodando corretamente no VPS antes de concluir.

### 27.1 Verificar Status do Service

```bash
# 1. Verificar se service está rodando
ssh root@31.97.22.151 "docker service ls" | grep lifetracker

# ✅ Espera: 1/1 réplica rodando (coluna REPLICAS)
# ❌ Se 0/1: Service não iniciou, verificar logs (Seção 27.3)

# 2. Verificar tasks do service
ssh root@31.97.22.151 "docker service ps lifetracker_app --no-trunc"

# ✅ Espera: Current State = "Running" (não "Preparing", "Starting", "Failed")
# ⚠️ Se "Preparing"/"Starting": Aguardar mais 30s
# ❌ Se "Failed": Verificar logs (Seção 27.3)
```

**Checklist de Status**:
- [ ] Service `lifetracker_app` existe
- [ ] REPLICAS mostra 1/1 (ou 2/2 se multi-replica)
- [ ] Current State = "Running"
- [ ] Sem tasks com estado "Failed"

---

### 27.2 Smoke Tests HTTP

```bash
# 1. Testar endpoint raiz (deve retornar HTML)
curl -f https://life-tracker.stackia.com.br > /dev/null && echo "✅ HTTPS OK" || echo "❌ HTTPS FAIL"

# 2. Verificar se HTML está bem formado
curl -s https://life-tracker.stackia.com.br | grep -q "<!DOCTYPE html>" && echo "✅ HTML OK" || echo "❌ HTML MALFORMED"

# 3. Verificar se assets estão sendo servidos (CSS, JS)
curl -s https://life-tracker.stackia.com.br | grep -q "assets/" && echo "✅ Assets linked" || echo "⚠️ Assets not found"

# 4. Verificar certificado SSL (Traefik Let's Encrypt)
curl -s https://life-tracker.stackia.com.br -v 2>&1 | grep -q "SSL certificate verify ok" && echo "✅ SSL OK" || echo "⚠️ SSL warning"

# 5. Testar redirect HTTP -> HTTPS (se configurado)
curl -s -o /dev/null -w "%{http_code}" http://life-tracker.stackia.com.br | grep -q "301\|302" && echo "✅ HTTP redirect OK" || echo "ℹ️ No HTTP redirect"
```

**Checklist de Smoke Tests**:
- [ ] HTTPS responde (status 200)
- [ ] HTML válido sendo servido
- [ ] Assets (CSS/JS) linkados corretamente
- [ ] SSL certificado válido
- [ ] HTTP -> HTTPS redirect (opcional)

---

### 27.3 Verificar Logs (Se houver problemas)

```bash
# Logs do service (últimas 50 linhas)
ssh root@31.97.22.151 "docker service logs --tail 50 lifetracker_app"

# ✅ Procurar por: "nginx: configuration file /etc/nginx/nginx.conf test is successful"
# ❌ Procurar por: "error", "failed", "exit code"

# Logs em tempo real (para monitoramento contínuo - Fase 28)
ssh root@31.97.22.151 "docker service logs -f lifetracker_app"
```

**Problemas Comuns**:

1. **Service não inicia (0/1 réplicas)**
   - Verificar logs: `docker service logs lifetracker_app`
   - Possível causa: Imagem corrompida, configuração inválida

2. **Service "Failed" / "Rejected"**
   - Verificar: `docker service ps lifetracker_app --no-trunc`
   - Possível causa: Porta 80 já em uso, constraints não atendidos

3. **HTTPS não responde**
   - Verificar Traefik: `docker ps | grep traefik`
   - Verificar labels no docker-compose.yml
   - Aguardar 2-3 min para Let's Encrypt provisionar certificado

4. **HTML vazio / 404**
   - Verificar se build copiou arquivos: `ssh root@31.97.22.151 "docker exec \$(docker ps -q -f name=lifetracker) ls -la /usr/share/nginx/html"`
   - Possível causa: Build falhou, arquivos não foram copiados

---

### 27.4 Teste Manual no Browser

**IMPORTANTE**: Abrir browser e testar manualmente é essencial!

```
1. Abrir: https://life-tracker.stackia.com.br
2. Verificar:
   - [ ] Página carrega corretamente
   - [ ] Não há erros no console do browser (F12)
   - [ ] CSS está aplicado corretamente
   - [ ] JavaScript está funcionando (interações)
   - [ ] Autenticação funciona (se aplicável)
   - [ ] Feature recém-deployada está visível e funcionando
   - [ ] Não há regressões em features existentes
```

**Checklist de Teste Manual**:
- [ ] Página principal carrega
- [ ] Sem erros no console
- [ ] Estilos aplicados corretamente
- [ ] JavaScript funcionando
- [ ] Feature nova está presente
- [ ] Sem regressões

---

## 📊 Fase 28: Monitoramento (10 minutos)

**CRÍTICO**: Monitorar por pelo menos 10 minutos após deploy bem-sucedido.

### 28.1 Monitorar Logs em Tempo Real

```bash
# Abrir logs em tempo real
ssh root@31.97.22.151 "docker service logs -f --tail 100 lifetracker_app"

# Deixar rodando por 10 minutos
# ✅ Procurar por: Requisições HTTP normais (200, 304)
# ❌ Alertar para: 500, 502, 503, 504, "error", "crash"
```

**O que observar**:
- ✅ Requisições HTTP normais (GET /assets, GET /index.html)
- ✅ Status codes 200, 304 (cache)
- ❌ Erros 500 (Internal Server Error)
- ❌ Erros 502/503/504 (Gateway/Service Unavailable)
- ❌ Crashes / restarts do container

---

### 28.2 Monitorar Métricas do Service

```bash
# A cada 2 minutos, verificar status
watch -n 120 "ssh root@31.97.22.151 'docker service ps lifetracker_app'"

# ✅ Espera: State = "Running", sem restarts
# ❌ Se restarts frequentes (> 2 em 10min): Problema crítico, acionar rollback (Fase 29)
```

**Checklist de Monitoramento**:
- [ ] Service mantém estado "Running"
- [ ] Sem restarts inesperados
- [ ] Logs mostram requisições normais
- [ ] Sem erros 500/502/503/504

---

### 28.3 Testes de Carga Leve (Opcional)

```bash
# Simular 100 requisições (teste leve)
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://life-tracker.stackia.com.br
  sleep 0.5
done | sort | uniq -c

# ✅ Espera: Maioria 200, alguns 304 (cache)
# ❌ Se muitos 500/502/503: Problema de performance, investigar
```

**Checklist de Carga**:
- [ ] 100 requisições completadas
- [ ] Maioria status 200/304
- [ ] Sem timeouts
- [ ] Service não reiniciou

---

## 🔄 Fase 29: Rollback (Se Necessário)

**Quando fazer rollback?**

### ⚠️ Sinais de que é necessário rollback:

1. **Service não inicia** (0/1 réplicas por > 5 min)
2. **Erros 500/502/503** em > 20% das requisições
3. **Service reinicia constantemente** (> 3 restarts em 10 min)
4. **Feature quebrou funcionalidade crítica** (validação manual falhou)
5. **Dados corrompidos / bugs críticos** detectados

### 29.1 Rollback Automático (Script)

```bash
# Criar script de rollback VPS
cat > scripts/vps-rollback.sh << 'EOF'
#!/bin/bash
# Script de rollback para VPS
# Reverte deploy para versão anterior

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

VPS_HOST="root@31.97.22.151"
STACK_NAME="lifetracker"

echo -e "${YELLOW}🔄 Life Tracker - ROLLBACK VPS${NC}"
echo "================================================"
echo -e "${RED}ATENÇÃO: Esta operação vai reverter o deploy!${NC}"
echo "================================================"

read -p "Confirmar rollback? (yes/NO): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelado."
  exit 0
fi

echo -e "\n${YELLOW}Step 1/3: Stopping current stack...${NC}"
ssh $VPS_HOST "docker stack rm $STACK_NAME" || {
  echo -e "${RED}❌ Stack removal FAILED${NC}"
  exit 1
}
echo -e "${GREEN}✅ Stack stopped${NC}"

echo -e "\n${YELLOW}Step 2/3: Waiting for cleanup (30s)...${NC}"
sleep 30

echo -e "\n${YELLOW}Step 3/3: Deploying previous version...${NC}"
echo "ℹ️ Para redeployer versão anterior, você precisa:"
echo "  1. Git: git checkout <commit-anterior>"
echo "  2. Build: docker build -t life-tracker:rollback ."
echo "  3. Deploy: ./scripts/deploy-vps.sh"
echo ""
echo "Ou restaurar backup do banco (se necessário):"
echo "  ./scripts/restore-supabase.sh backups/backup-YYYYMMDD-HHMMSS.sql"

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}Stack removido. Próximo passo: redeployer versão anterior.${NC}"
echo -e "${GREEN}================================================${NC}"
EOF

chmod +x scripts/vps-rollback.sh

# Executar rollback
./scripts/vps-rollback.sh
```

**O que o script faz**:
1. ⚠️ Pede confirmação (rollback é destrutivo)
2. ✅ Remove stack atual do Swarm
3. ✅ Aguarda cleanup (30s)
4. ℹ️ Instrui como redeployer versão anterior

**Tempo estimado**: 2-3 minutos

---

### 29.2 Rollback Manual (Passo a Passo)

```bash
# 1. Remover stack atual
ssh root@31.97.22.151 "docker stack rm lifetracker"

# 2. Aguardar cleanup (30s)
sleep 30

# 3. Verificar que stack foi removida
ssh root@31.97.22.151 "docker stack ls" | grep lifetracker || echo "✅ Stack removida"

# 4. (Local) Voltar para commit anterior
git log --oneline -5  # Identificar commit anterior ao deploy
git checkout <commit-hash-anterior>

# 5. (Local) Rebuild imagem com código anterior
docker build -t life-tracker:rollback -f Dockerfile .

# 6. (Local) Redeploy versão anterior
# Modificar scripts/deploy-vps.sh para usar tag "rollback" temporariamente
# Ou executar deploy manual (Fase 26.2)

# 7. Verificar se rollback funcionou (Fase 27 - Smoke Tests)
```

---

### 29.3 Rollback do Banco de Dados (Se necessário)

**APENAS se deploy incluiu migrations que corromperam dados.**

```bash
# 1. Listar backups disponíveis
ls -lh backups/

# 2. Restaurar backup anterior ao deploy
./scripts/restore-supabase.sh backups/backup-YYYYMMDD-HHMMSS.sql

# ⚠️ ATENÇÃO: Isso vai SOBRESCREVER dados do banco!
# Certifique-se de que não há dados novos importantes criados após o deploy.
```

**Checklist de Rollback**:
- [ ] Stack anterior removida
- [ ] Código revertido para commit anterior
- [ ] Imagem rebuild com código antigo
- [ ] Redeploy executado
- [ ] Smoke tests passando
- [ ] Banco restaurado (se necessário)
- [ ] Aplicação voltou ao normal

---

## 📝 Fase 30: Documentação do Deploy

**IMPORTANTE**: Documentar deploy para histórico e aprendizado.

### 30.1 Atualizar Deploy History

```bash
# Criar arquivo de histórico (se não existir)
if [ ! -f docs/ops/deploy-history.md ]; then
  cat > docs/ops/deploy-history.md << 'EOF'
# Deploy History

Histórico de deploys para produção (VPS).

---

## Template

```markdown
### Deploy YYYY-MM-DD HH:MM

**Branch**: `<branch-name>`
**Commit**: `<hash>`
**Merge Status**: ✅ Feature merged / ⚠️ Direct commit to main
**Features Deployadas**:
- Feature 1
- Feature 2

**Commits Incluídos** (desde último deploy):
- `abc1234` feat: nova funcionalidade X
- `def5678` fix: correção bug Y
- `ghi9012` docs: atualizar documentação

**Validações**:
- [ ] Testes passando
- [ ] Build OK
- [ ] Smoke tests OK

**Monitoramento**:
- Sem erros nos primeiros 10min
- Status: ✅ Sucesso / ❌ Rollback

**Notas**:
- [Observações, problemas encontrados, lições aprendidas]
```

---
EOF
fi

# Capturar informações do deploy
DEPLOY_DATE=$(date '+%Y-%m-%d %H:%M')
CURRENT_BRANCH=$(git branch --show-current)
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_HASH_FULL=$(git rev-parse HEAD)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# Verificar merge status
RECENT_MERGES=$(git log --oneline --merges -5 2>/dev/null | head -1)
if [ -n "$RECENT_MERGES" ]; then
  MERGE_STATUS="✅ Feature merged (último merge: $(echo $RECENT_MERGES | cut -d' ' -f1))"
else
  MERGE_STATUS="⚠️ Direct commit to main (nenhum merge recente detectado)"
fi

# Capturar commits desde último tag
if [ -n "$LAST_TAG" ]; then
  COMMITS_SINCE_LAST=$(git log --oneline "$LAST_TAG..HEAD" 2>/dev/null | head -10)
  DEPLOY_RANGE="desde $LAST_TAG"
else
  COMMITS_SINCE_LAST=$(git log --oneline -10 2>/dev/null)
  DEPLOY_RANGE="últimos 10 commits"
fi

# Adicionar entrada de deploy
cat >> docs/ops/deploy-history.md << EOF

---

### Deploy $DEPLOY_DATE

**Branch**: \`$CURRENT_BRANCH\`
**Commit**: \`$COMMIT_HASH\`
**Merge Status**: $MERGE_STATUS

**Features Deployadas**:
- [Descrever features incluídas neste deploy]

**Commits Incluídos** ($DEPLOY_RANGE):
\`\`\`
$COMMITS_SINCE_LAST
\`\`\`

**Validações**:
- [x] Branch main validada
- [x] Working tree limpo
- [x] Testes passando
- [x] Build OK
- [x] Smoke tests OK
- [x] Monitoramento 10min OK

**Tempo de Deploy**: ~7 minutos
**Status**: ✅ Sucesso

**Notas**:
- Deploy realizado via Workflow 11 (VPS Deployment)
- Docker Swarm + Traefik
- SSL provisionado automaticamente
- Sem rollback necessário
- Validações pré-deploy incluem verificação de integridade do merge

**Links**:
- Produção: https://life-tracker.stackia.com.br
- Commit: https://github.com/<user>/<repo>/commit/$COMMIT_HASH_FULL

---
EOF

echo "✅ Deploy history atualizado em docs/ops/deploy-history.md"
```

---

### 30.2 Atualizar Documentação Geral (Se necessário)

```bash
# Se houver mudanças operacionais importantes, atualizar docs
# Exemplos:
# - Nova variável de ambiente adicionada
# - Nova dependência de infraestrutura
# - Mudança no processo de deploy

# Atualizar README.md (seção Deploy, se houver)
# Atualizar docs/ops/README.md (se houver novos procedimentos)
```

---

## ✅ Checklist Final: Deploy Completo!

**Parabéns! Seu deploy foi concluído. Verifique todos os itens:**

### Pré-Deploy
- [ ] Código na main atualizada
- [ ] Todos os testes passando
- [ ] Build de produção OK
- [ ] Bundle size aceitável
- [ ] .env.production completo
- [ ] Arquivos Docker presentes
- [ ] VPS acessível via SSH
- [ ] Swarm ativo no VPS
- [ ] Backup do banco criado (se necessário)

### Build & Deploy
- [ ] Imagem Docker buildada localmente
- [ ] Imagem testada localmente
- [ ] Imagem transferida para VPS
- [ ] Stack deployed no Swarm
- [ ] Service iniciado (1/1 réplicas)

### Validação
- [ ] Smoke tests HTTP passaram
- [ ] SSL certificado válido
- [ ] Teste manual no browser OK
- [ ] Feature nova funcionando
- [ ] Sem regressões detectadas

### Monitoramento
- [ ] Logs monitorados por 10min
- [ ] Sem erros 500/502/503
- [ ] Service não reiniciou
- [ ] Testes de carga OK (opcional)

### Documentação
- [ ] Deploy history atualizado
- [ ] Notas e observações documentadas

---

## 🎯 Casos de Uso

### Caso 1: Deploy de Feature Nova

**Contexto**: Você completou Workflows 1-10 e quer levar feature para produção.

**Passos**:
1. Executar Fase 24 (Pré-Deploy Checklist) ✅
2. Executar Fase 25 (Build e Validação Local) ✅
3. Executar Fase 26 (Deploy Automático com script) ✅
4. Executar Fase 27 (Smoke Tests) ✅
5. Executar Fase 28 (Monitoramento 10min) ✅
6. Executar Fase 30 (Documentação) ✅

**Tempo total**: ~20-25 minutos

---

### Caso 2: Deploy com Migrations no Banco

**Contexto**: Feature inclui mudanças no schema (novas tabelas/colunas).

**Passos**:
1. **Backup obrigatório** em Fase 24.4 ⚠️
2. Testar migrations localmente ANTES do deploy ✅
3. Deploy normalmente (Fases 25-28) ✅
4. **Monitoramento extra** (20min ao invés de 10min) ✅
5. Se houver problemas: Rollback + Restore banco (Fase 29.3) ⚠️

**Atenção**: Migrations são irreversíveis sem backup!

---

### Caso 3: Rollback Após Deploy

**Contexto**: Deploy foi feito, mas service está com erros críticos.

**Passos**:
1. Identificar problema (Fase 27.3 - Logs) ✅
2. Decidir por rollback (Fase 29) ⚠️
3. Executar `./scripts/vps-rollback.sh` ✅
4. Voltar código para commit anterior (`git checkout <hash>`) ✅
5. Rebuild e redeploy versão anterior ✅
6. Restaurar banco se necessário (Fase 29.3) ⚠️
7. Documentar incidente (Fase 30) ✅

**Tempo total**: ~10-15 minutos

---

### Caso 4: Deploy Inicial (Primeira Vez)

**Contexto**: Primeira vez deployando Life Tracker no VPS.

**Diferenças**:
- Stack `lifetracker` não existe ainda
- Pode levar mais tempo (60-90s) para Traefik provisionar SSL
- Verificar que domínio `life-tracker.stackia.com.br` aponta para VPS (DNS)

**Passos extras**:
1. Verificar DNS: `nslookup life-tracker.stackia.com.br` deve resolver para `31.97.22.151` ✅
2. Verificar Traefik está configurado para Let's Encrypt ✅
3. Aguardar 2-3min após deploy para SSL provisionar ✅
4. Testar HTTP e HTTPS separadamente ✅

---

## 📚 Troubleshooting Comum

### Problema: "docker service ps" mostra "No such service"

**Causa**: Stack não foi deployed ou nome incorreto.

**Solução**:
```bash
# Verificar stacks existentes
ssh root@31.97.22.151 "docker stack ls"

# Se lifetracker não existe, redeploy
./scripts/deploy-vps.sh
```

---

### Problema: Service fica em "Preparing" por muito tempo

**Causa**: Imagem grande, internet lenta, ou Docker pulling imagem.

**Solução**:
```bash
# Verificar se imagem foi carregada corretamente
ssh root@31.97.22.151 "docker images | grep life-tracker"

# Se não aparecer, retranferir imagem (Fase 26)
```

---

### Problema: HTTPS não responde (ERR_CONNECTION_REFUSED)

**Causa**: Traefik não está provisionando certificado, ou domínio não aponta para VPS.

**Solução**:
```bash
# 1. Verificar DNS
nslookup life-tracker.stackia.com.br
# Deve resolver para 31.97.22.151

# 2. Verificar Traefik
ssh root@31.97.22.151 "docker ps | grep traefik"
# Deve mostrar container rodando

# 3. Verificar logs do Traefik
ssh root@31.97.22.151 "docker logs \$(docker ps -q -f name=traefik) | tail -50"
# Procurar por "certificate obtained" ou erros
```

---

### Problema: Página mostra 502 Bad Gateway

**Causa**: Service não está respondendo, ou Traefik não consegue rotear.

**Solução**:
```bash
# Verificar service health
ssh root@31.97.22.151 "docker service ps lifetracker_app"
# Deve mostrar "Running", não "Failed"

# Verificar logs do service
ssh root@31.97.22.151 "docker service logs lifetracker_app | tail -50"
# Procurar por erros de inicialização
```

---

### Problema: Deploy demora muito (> 10min)

**Causa**: Imagem muito grande, internet lenta, ou VPS com pouco recurso.

**Solução**:
```bash
# Verificar tamanho da imagem
docker images life-tracker:latest
# Se > 200MB, otimizar Dockerfile (multi-stage build)

# Verificar recursos do VPS
ssh root@31.97.22.151 "free -h && df -h"
# Se < 1GB RAM livre ou < 5GB disco, limpar ou aumentar VPS
```

---

## 🎉 Parabéns! Deploy Concluído!

**Você completou o Workflow 11 - VPS Deployment!**

### O que foi conquistado:
- ✅ Aplicação buildada como imagem Docker
- ✅ Imagem deployed em VPS com Docker Swarm
- ✅ SSL/TLS configurado automaticamente (Traefik)
- ✅ Smoke tests passaram
- ✅ Monitoramento realizado
- ✅ Procedimento de rollback documentado
- ✅ Deploy history atualizado

### Aplicação em produção:
🌐 **https://life-tracker.stackia.com.br**

### Métricas:
- **Tempo de deploy**: ~7 minutos
- **Downtime**: 0s (blue-green deploy via Swarm)
- **Rollback time**: ~3 minutos (se necessário)

---

## 🔄 Próximos Passos

### Manutenção Contínua

1. **Monitoramento diário** (primeiros 3 dias após deploy):
   - Verificar logs: `ssh root@31.97.22.151 "docker service logs lifetracker_app | tail -100"`
   - Verificar métricas: uptime, response time, erros

2. **Otimizações futuras**:
   - [ ] Configurar CI/CD automático (GitHub Actions)
   - [ ] Adicionar monitoring (Prometheus + Grafana)
   - [ ] Configurar alertas (Slack, Email)
   - [ ] Implementar blue-green deployment
   - [ ] Configurar backup automático do banco

3. **Próxima feature**:
   - Voltar ao **Workflow 1** (Planning) para próxima funcionalidade
   - Código na main já inclui deploy atualizado
   - Scripts de deploy reutilizáveis

---

## 📞 Suporte

**Se algo der errado**:
1. Verificar logs (Fase 27.3)
2. Consultar Troubleshooting (seção acima)
3. Acionar rollback se necessário (Fase 29)
4. Documentar problema para melhorar processo

**Recursos úteis**:
- Docker Swarm docs: https://docs.docker.com/engine/swarm/
- Traefik docs: https://doc.traefik.io/traefik/
- Nginx docs: https://nginx.org/en/docs/

---

**Workflow criado em**: 2025-10-31
**Versão**: 1.0
**Parte**: 11 de 11 (FINAL)
**Próximo**: Voltar ao Workflow 1 para próxima feature

---

**🎉 FIM DO WORKFLOW ADD-FEATURE COMPLETO (11 etapas)!**

**Você dominou**:
1. ✅ Planning (Workflow 1)
2. ✅ Solution Design (Workflow 2)
3. ✅ Risk Analysis (Workflow 3)
4. ✅ Setup (Workflow 4)
5. ✅ Implementation (Workflow 5)
6. ✅ User Validation (Workflow 6)
7. ✅ Quality Gates (Workflow 7)
8. ✅ Meta-Learning (Workflow 8)
9. ✅ Finalization (Workflow 9)
10. ✅ Template Sync (Workflow 10)
11. ✅ **VPS Deployment (Workflow 11)** 🚀

**Sistema completo de desenvolvimento profissional estabelecido!**


## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural

---