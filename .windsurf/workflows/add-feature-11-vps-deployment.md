---
description: Workflow Add-Feature (11/11) - VPS Deployment (Deploy para Produção)
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

## 🔧 CONFIGURAÇÃO INICIAL

**IMPORTANTE**: Este workflow usa placeholders que DEVEM ser customizados para seu projeto.

### Variáveis para Configurar:

Antes de usar este workflow, substitua os seguintes placeholders nos scripts:

```bash
# Configurações VPS
VPS_USER="root"                           # Usuário SSH (ex: root, deploy, ubuntu)
VPS_HOST="192.168.1.100"                  # IP ou hostname do VPS
VPS_PATH="/root/myapp"                    # Caminho no VPS para deploy
DOMAIN="myapp.example.com"                # Domínio da aplicação
STACK_NAME="myapp"                        # Nome do stack Docker Swarm
PORT="3000"                               # Porta interna do container
```

### Onde Configurar:

1. **`.env.production`** (criar se não existir):
   ```bash
   VPS_HOST=192.168.1.100
   VPS_USER=root
   VPS_PATH=/root/myapp
   DOMAIN=myapp.example.com
   STACK_NAME=myapp
   PORT=3000
   ```

2. **Scripts** (editar diretamente ou ler do `.env.production`):
   - `scripts/deploy-vps.sh`
   - `scripts/vps-rollback.sh`
   - `scripts/vps-smoke-tests.sh`

3. **Docker Compose** (`docker-compose.swarm.yml`):
   - Substituir labels do Traefik com seu domínio

---

## 🎯 Objetivo

Deploy seguro e automatizado para VPS (Virtual Private Server) usando Docker Swarm + Traefik, com validação completa e procedimento de rollback.

---

## 📍 Informações Críticas do Ambiente

### VPS Details (CUSTOMIZE!)
- **Host**: `${VPS_USER}@${VPS_HOST}` (ex: root@192.168.1.100)
- **Domain**: `${DOMAIN}` (ex: myapp.example.com)
- **Stack Name**: `${STACK_NAME}` (ex: myapp)
- **Orchestration**: Docker Swarm
- **Reverse Proxy**: Traefik (SSL/TLS automático)
- **Image Registry**: Docker Hub (ou registry local)
- **Timezone**: America/Sao_Paulo (UTC-3) - ajustar se necessário

### Arquivos Chave
- **Dockerfile**: `Dockerfile.react` (template multi-stage)
- **Docker Compose**: `docker-compose.swarm.yml` (para Swarm)
- **Nginx Config**: `nginx.conf` (servir build React/Vite)

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

### 24.2 Validações de Ambiente

```bash
# 1. Verificar .env.production existe e está completo
if [ -f .env.production ]; then
  echo "✅ .env.production encontrado"
  # Verificar variáveis críticas (sem mostrar valores)
  grep -q "VPS_HOST" .env.production && echo "✅ VPS_HOST OK" || echo "❌ VPS_HOST MISSING"
  grep -q "DOMAIN" .env.production && echo "✅ DOMAIN OK" || echo "❌ DOMAIN MISSING"
else
  echo "❌ .env.production NÃO ENCONTRADO!"
fi

# 2. Verificar Dockerfile existe
[ -f Dockerfile.react ] && echo "✅ Dockerfile.react OK" || echo "❌ Dockerfile.react MISSING"

# 3. Verificar docker-compose.swarm.yml existe
[ -f docker-compose.swarm.yml ] && echo "✅ docker-compose.swarm.yml OK" || echo "❌ docker-compose.swarm.yml MISSING"

# 4. Verificar nginx.conf existe (se aplicável)
[ -f nginx.conf ] && echo "✅ nginx.conf OK" || echo "ℹ️ nginx.conf não usado"
```

**Checklist de Ambiente**:
- [ ] `.env.production` existe com todas as variáveis
- [ ] `Dockerfile.react` presente
- [ ] `docker-compose.swarm.yml` presente
- [ ] `nginx.conf` presente (se aplicável)

---

### 24.3 Validações de Infraestrutura

```bash
# Carregar variáveis do .env.production
source .env.production

# 1. Verificar conectividade com VPS
ssh ${VPS_USER}@${VPS_HOST} "echo '✅ SSH OK'" || echo "❌ SSH FAIL - Verificar conexão"

# 2. Verificar Docker Swarm ativo no VPS
ssh ${VPS_USER}@${VPS_HOST} "docker info | grep -q 'Swarm: active' && echo '✅ Swarm OK' || echo '❌ Swarm INACTIVE'"

# 3. Verificar espaço em disco no VPS
ssh ${VPS_USER}@${VPS_HOST} "df -h / | awk 'NR==2 {print \$5}' | sed 's/%//' | awk '{if (\$1 < 80) print \"✅ Disk OK (\" \$1 \"% usado)\"; else print \"❌ Disk WARNING (\" \$1 \"% usado)\"}'"

# 4. Verificar se Traefik está rodando
ssh ${VPS_USER}@${VPS_HOST} "docker ps | grep -q traefik && echo '✅ Traefik OK' || echo '❌ Traefik NOT RUNNING'"

# 5. Verificar se stack já existe (para determinar se é deploy inicial ou update)
ssh ${VPS_USER}@${VPS_HOST} "docker stack ls | grep -q ${STACK_NAME} && echo '✅ Stack existe (UPDATE)' || echo 'ℹ️ Stack não existe (DEPLOY INICIAL)'"
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
IMAGE_TAG="${STACK_NAME}:$(date +%Y%m%d-%H%M%S)"
IMAGE_LATEST="${STACK_NAME}:latest"

echo "📦 Building Docker image: $IMAGE_TAG"

# 2. Build multi-stage (Node.js builder + Nginx production)
docker build \
  --tag $IMAGE_TAG \
  --tag $IMAGE_LATEST \
  --file Dockerfile.react \
  --no-cache \
  .

# ✅ Espera: Build completado com sucesso (exitcode 0)
if [ $? -eq 0 ]; then
  echo "✅ Docker build OK"
  docker images | grep ${STACK_NAME}
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
   - Configura timezone (America/Sao_Paulo por padrão)
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
# Carregar variáveis
source .env.production

# 1. Rodar container local para testes
docker run -d \
  --name ${STACK_NAME}-test \
  --publish 8080:80 \
  --env NODE_ENV=production \
  --env TZ=America/Sao_Paulo \
  ${IMAGE_LATEST}

# 2. Aguardar 5s para inicialização
sleep 5

# 3. Verificar health check
docker ps --filter "name=${STACK_NAME}-test" --format "{{.Status}}"
# ✅ Espera: Status com "(healthy)"

# 4. Testar HTTP response
curl -f http://localhost:8080 > /dev/null && echo "✅ HTTP OK" || echo "❌ HTTP FAIL"

# 5. Testar se HTML está sendo servido
curl -s http://localhost:8080 | grep -q "<!DOCTYPE html>" && echo "✅ HTML OK" || echo "❌ HTML MALFORMED"

# 6. Verificar logs para erros
docker logs ${STACK_NAME}-test | grep -i error && echo "⚠️ Errors found in logs" || echo "✅ No errors in logs"

# 7. Limpar container de teste
docker stop ${STACK_NAME}-test
docker rm ${STACK_NAME}-test
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
docker images ${STACK_NAME}:latest --format "{{.Repository}}:{{.Tag}} - {{.Size}}"

# ✅ Target: < 100MB (ideal: ~50MB com Nginx Alpine)
```

**Checklist de Tamanho**:
- [ ] Imagem < 100MB (ideal: ~50MB)
- [ ] Se > 100MB, investigar (possível problema no build)

---

## 🚀 Fase 26: Deploy para VPS

**IMPORTANTE**: Deploy automático via script.

### 26.1 Deploy Automático (Recomendado)

```bash
# Executar script de deploy
./scripts/deploy-vps.sh production

# O script automaticamente:
# 1. Build da imagem Docker localmente
# 2. Salva imagem como .tar
# 3. Transfere .tar para VPS via SCP
# 4. Carrega imagem no Docker do VPS
# 5. Transfere docker-compose.swarm.yml para VPS
# 6. Deploy stack no Docker Swarm
# 7. Limpa arquivos temporários
```

**Tempo estimado**: 5-7 minutos (dependendo da velocidade da internet)

**Checklist de Deploy Automático**:
- [ ] Script executado sem erros
- [ ] Imagem transferida para VPS
- [ ] Stack deployed no Swarm
- [ ] Sem erros no output do script

---

### 26.2 Deploy Manual (Alternativa)

**Use apenas se script automático falhar ou para entender o processo.**

```bash
# Carregar variáveis
source .env.production

# 1. Build da imagem Docker localmente
docker build -t ${STACK_NAME}:latest -f Dockerfile.react .

# 2. Salvar imagem como tar
docker save ${STACK_NAME}:latest -o /tmp/${STACK_NAME}.tar

# 3. Transferir imagem para VPS
scp /tmp/${STACK_NAME}.tar ${VPS_USER}@${VPS_HOST}:/tmp/

# 4. Carregar imagem no VPS
ssh ${VPS_USER}@${VPS_HOST} "docker load -i /tmp/${STACK_NAME}.tar && rm /tmp/${STACK_NAME}.tar"

# 5. Transferir docker-compose.swarm.yml para VPS
scp docker-compose.swarm.yml ${VPS_USER}@${VPS_HOST}:/tmp/docker-compose-${STACK_NAME}.yml

# 6. Deploy stack no Docker Swarm
ssh ${VPS_USER}@${VPS_HOST} "docker stack deploy -c /tmp/docker-compose-${STACK_NAME}.yml ${STACK_NAME}"

# 7. Aguardar 30-60s para service iniciar
sleep 60

# 8. Verificar status do service
ssh ${VPS_USER}@${VPS_HOST} "docker service ls | grep ${STACK_NAME}"

# 9. Limpar arquivo local
rm /tmp/${STACK_NAME}.tar
```

**Checklist de Deploy Manual**:
- [ ] Cada comando executado sem erros
- [ ] Imagem carregada no VPS
- [ ] Stack deployed no Swarm
- [ ] Service listado em `docker service ls`

---

## ✅ Fase 27: Validação Pós-Deploy (Smoke Tests)

**CRÍTICO**: Validar que a aplicação está rodando corretamente no VPS antes de concluir.

### 27.1 Executar Smoke Tests Automáticos

```bash
# Executar script de smoke tests
./scripts/vps-smoke-tests.sh production

# O script testa automaticamente:
# 1. Home page acessível (HTTP 200)
# 2. Health endpoint (se existir)
# 3. Recursos estáticos (CSS/JS)
# 4. Performance (< 2s load time)
# 5. Docker services health
# 6. Certificado SSL válido
```

**Checklist de Smoke Tests**:
- [ ] Todos os testes passaram (ou >= 80% de sucesso)
- [ ] HTTPS responde (status 200)
- [ ] SSL certificado válido
- [ ] Services Docker rodando (1/1 réplicas)

---

### 27.2 Teste Manual no Browser

**IMPORTANTE**: Abrir browser e testar manualmente é essencial!

```
1. Abrir: https://${DOMAIN}
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
# Carregar variáveis
source .env.production

# Abrir logs em tempo real
ssh ${VPS_USER}@${VPS_HOST} "docker service logs -f --tail 100 ${STACK_NAME}_app"

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
# Carregar variáveis
source .env.production

# A cada 2 minutos, verificar status
watch -n 120 "ssh ${VPS_USER}@${VPS_HOST} 'docker service ps ${STACK_NAME}_app'"

# ✅ Espera: State = "Running", sem restarts
# ❌ Se restarts frequentes (> 2 em 10min): Problema crítico, acionar rollback (Fase 29)
```

**Checklist de Monitoramento**:
- [ ] Service mantém estado "Running"
- [ ] Sem restarts inesperados
- [ ] Logs mostram requisições normais
- [ ] Sem erros 500/502/503/504

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
# Executar script de rollback
./scripts/vps-rollback.sh production

# O script automaticamente:
# 1. Remove stack atual do Swarm
# 2. Aguarda cleanup (30s)
# 3. Reverte código para commit anterior (HEAD~1)
# 4. Rebuild imagem com código antigo
# 5. Redeploy stack
# 6. Valida health checks
```

**Tempo estimado**: 2-3 minutos

**Checklist de Rollback**:
- [ ] Stack anterior removida
- [ ] Código revertido para commit anterior
- [ ] Imagem rebuild com código antigo
- [ ] Redeploy executado
- [ ] Smoke tests passando
- [ ] Aplicação voltou ao normal

---

## 📝 Fase 30: Documentação do Deploy

**IMPORTANTE**: Documentar deploy para histórico e aprendizado.

### 30.1 Atualizar Deploy History

```bash
# Criar arquivo de histórico (se não existir)
mkdir -p docs/ops
if [ ! -f docs/ops/deploy-history.md ]; then
  cat > docs/ops/deploy-history.md << 'EOF'
# Deploy History

Histórico de deploys para produção (VPS).

---
EOF
fi

# Adicionar entrada de deploy
cat >> docs/ops/deploy-history.md << EOF

---

### Deploy $(date '+%Y-%m-%d %H:%M')

**Branch/Commit**: \`$(git rev-parse --short HEAD)\`
**Features Deployadas**:
- [Descrever features incluídas neste deploy]

**Validações**:
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

**Links**:
- Produção: https://${DOMAIN}

---
EOF

echo "✅ Deploy history atualizado em docs/ops/deploy-history.md"
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

## 📚 Troubleshooting Comum

### Problema: Service fica em "Preparing" por muito tempo

**Causa**: Imagem grande, internet lenta, ou Docker pulling imagem.

**Solução**:
```bash
# Verificar se imagem foi carregada corretamente
ssh ${VPS_USER}@${VPS_HOST} "docker images | grep ${STACK_NAME}"

# Se não aparecer, retransferir imagem (Fase 26)
```

---

### Problema: HTTPS não responde (ERR_CONNECTION_REFUSED)

**Causa**: Traefik não está provisionando certificado, ou domínio não aponta para VPS.

**Solução**:
```bash
# 1. Verificar DNS
nslookup ${DOMAIN}
# Deve resolver para ${VPS_HOST}

# 2. Verificar Traefik
ssh ${VPS_USER}@${VPS_HOST} "docker ps | grep traefik"
# Deve mostrar container rodando

# 3. Verificar logs do Traefik
ssh ${VPS_USER}@${VPS_HOST} "docker logs \$(docker ps -q -f name=traefik) | tail -50"
# Procurar por "certificate obtained" ou erros
```

---

### Problema: Página mostra 502 Bad Gateway

**Causa**: Service não está respondendo, ou Traefik não consegue rotear.

**Solução**:
```bash
# Verificar service health
ssh ${VPS_USER}@${VPS_HOST} "docker service ps ${STACK_NAME}_app"
# Deve mostrar "Running", não "Failed"

# Verificar logs do service
ssh ${VPS_USER}@${VPS_HOST} "docker service logs ${STACK_NAME}_app | tail -50"
# Procurar por erros de inicialização
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
🌐 **https://${DOMAIN}**

### Métricas:
- **Tempo de deploy**: ~7 minutos
- **Downtime**: 0s (blue-green deploy via Swarm)
- **Rollback time**: ~3 minutos (se necessário)

---

## 🔄 Próximos Passos

### Manutenção Contínua

1. **Monitoramento diário** (primeiros 3 dias após deploy):
   - Verificar logs: `ssh ${VPS_USER}@${VPS_HOST} "docker service logs ${STACK_NAME}_app | tail -100"`
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
1. Verificar logs (Fase 27)
2. Consultar Troubleshooting (seção acima)
3. Acionar rollback se necessário (Fase 29)
4. Documentar problema para melhorar processo

**Recursos úteis**:
- Docker Swarm docs: https://docs.docker.com/engine/swarm/
- Traefik docs: https://doc.traefik.io/traefik/
- Nginx docs: https://nginx.org/en/docs/

---

**Workflow criado em**: 2025-10-31
**Versão**: 1.0 (Generic Template)
**Parte**: 11 de 11 (FINAL)
**Próximo**: Voltar ao Workflow 1 para próxima feature

---

**🎉 FIM DO WORKFLOW ADD-FEATURE COMPLETO (11 etapas)!**
