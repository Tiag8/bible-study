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

**Checklist**:
- [ ] Service status = 1/1 replicas
- [ ] Current State = "Running"
- [ ] HTTPS responde
- [ ] HTML válido
- [ ] Assets servindo
- [ ] SSL válido
- [ ] Teste manual no browser OK

---

## 🎯 Próximos Passos

**Deploy OK?** → Prosseguir para `add-feature-11c1` (Monitoramento 10-15min)

**Problemas?** → Ver `docs/debugging/` ou `docs/TROUBLESHOOTING.md`

---

**Workflow**: 11b | **Status**: Pronto | **Versão**: 1.0 (otimizado 2025-11-03)

---

## 🔄 Próximo Workflow (Automático)

✅ Deploy executado! Prosseguindo automaticamente para **Workflow 11c1** (Monitoramento).

**Próximo**: `.windsurf/workflows/add-feature-11c1-vps-monitoring.md`

**⚠️ IMPORTANTE**: Monitoramento deve começar **imediatamente** após deploy bem-sucedido. Não deixe passar mais de 30-60 segundos entre o fim do deploy e início do monitoramento.

**Checkpoint**: Verifique se todos os smoke tests passaram antes de prosseguir.