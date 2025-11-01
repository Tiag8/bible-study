# Docker Swarm + Traefik Setup

> Guia completo para deploy de aplicações usando Docker Swarm com Traefik como reverse proxy e SSL automático

---

## 📚 Índice

1. [O que é Docker Swarm?](#o-que-é-docker-swarm)
2. [O que é Traefik?](#o-que-é-traefik)
3. [Setup Docker Swarm](#setup-docker-swarm)
4. [Setup Traefik](#setup-traefik)
5. [Deploy de Aplicação](#deploy-de-aplicação)
6. [Labels Obrigatórios](#labels-obrigatórios)
7. [Troubleshooting](#troubleshooting)
8. [Meta-Learning](#meta-learning)

---

## O que é Docker Swarm?

### Definição

Docker Swarm é o orquestrador nativo do Docker para gerenciar clusters de containers.

### Principais Recursos

- **Clustering**: Múltiplos hosts como um único sistema
- **Service Discovery**: Containers se encontram automaticamente
- **Load Balancing**: Distribuição automática de tráfego
- **Rolling Updates**: Deploy sem downtime
- **Declarativo**: Define estado desejado, Swarm mantém
- **Built-in**: Vem com Docker, sem instalação extra

### Swarm vs Kubernetes

| Aspecto | Docker Swarm | Kubernetes |
|---------|-------------|-----------|
| **Complexidade** | Simples | Complexo |
| **Setup** | 2 comandos | Múltiplas ferramentas |
| **Curva de aprendizado** | Baixa | Alta |
| **Ecossistema** | Menor | Maior |
| **Uso ideal** | Projetos pequenos/médios | Enterprise |

---

## O que é Traefik?

### Definição

Traefik é um reverse proxy e load balancer moderno que se integra nativamente com Docker/Swarm.

### Principais Recursos

- **Auto-discovery**: Detecta services automaticamente
- **SSL/TLS automático**: Let's Encrypt integrado
- **Labels-based config**: Configuração via labels do Docker
- **Dashboard**: UI web para monitoramento
- **Multi-protocol**: HTTP, HTTPS, TCP, UDP
- **Zero-downtime**: Rolling updates sem interrupção

### Por que Traefik?

✅ **Vantagens:**
- Configuração via labels (infrastructure as code)
- SSL grátis e automático (Let's Encrypt)
- Atualiza configuração sem restart
- Dashboard para debugging
- Perfeito para Swarm

❌ **Alternativas:**
- **Nginx**: Mais manual, requer reload
- **Caddy**: Similar, mas menos integrado com Docker
- **HAProxy**: Mais complexo para configurar

---

## Setup Docker Swarm

### 1. Inicializar Swarm

```bash
# No servidor VPS (manager node)
docker swarm init --advertise-addr <VPS_IP>

# Exemplo:
docker swarm init --advertise-addr 192.168.1.100

# Output:
# Swarm initialized: current node (abc123) is now a manager.
# To add a worker to this swarm, run the following command:
#   docker swarm join --token SWMTKN-1-xxx... 192.168.1.100:2377
```

### 2. Verificar Status

```bash
# Verificar se Swarm está ativo
docker info | grep Swarm
# Output: Swarm: active

# Listar nodes
docker node ls
# Output:
# ID              HOSTNAME   STATUS   AVAILABILITY   MANAGER STATUS
# abc123 *        vps-001    Ready    Active         Leader
```

### 3. Criar Network Overlay

```bash
# Criar network para comunicação entre services
docker network create --driver overlay network_public

# Verificar
docker network ls | grep network_public
```

**Por que network overlay?**
- Permite comunicação entre containers em diferentes hosts
- Traefik precisa estar na mesma network que os services
- Isolamento de tráfego

---

## Setup Traefik

### 1. Criar Diretórios

```bash
# Criar diretórios para Traefik
mkdir -p /opt/traefik
cd /opt/traefik
```

### 2. Docker Compose para Traefik

Criar arquivo `docker-compose.yml`:

```yaml
version: '3.7'

services:
  traefik:
    image: traefik:v2.10
    networks:
      - network_public
    ports:
      - "80:80"       # HTTP
      - "443:443"     # HTTPS
      - "8080:8080"   # Dashboard (opcional - remover em produção)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    command:
      # API e Dashboard
      - "--api.insecure=true"  # Remover em produção
      - "--api.dashboard=true"

      # Docker provider
      - "--providers.docker=true"
      - "--providers.docker.swarmMode=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=network_public"

      # Entrypoints
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"

      # Let's Encrypt
      - "--certificatesresolvers.letsencryptresolver.acme.email=your-email@example.com"
      - "--certificatesresolvers.letsencryptresolver.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencryptresolver.acme.tlschallenge=true"

      # Logs
      - "--log.level=INFO"
      - "--accesslog=true"

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      restart_policy:
        condition: any
      labels:
        - traefik.enable=true
        # Dashboard (opcional)
        - traefik.http.routers.traefik-dashboard.rule=Host(`traefik.example.com`)
        - traefik.http.routers.traefik-dashboard.entrypoints=websecure
        - traefik.http.routers.traefik-dashboard.tls.certresolver=letsencryptresolver
        - traefik.http.routers.traefik-dashboard.service=api@internal
        - traefik.http.services.traefik-dashboard.loadbalancer.server.port=8080

networks:
  network_public:
    external: true
    name: network_public
```

**IMPORTANTE**: Substitua `your-email@example.com` pelo seu email real!

### 3. Deploy Traefik

```bash
# Deploy como stack
docker stack deploy -c docker-compose.yml traefik

# Verificar
docker service ls | grep traefik
# Output: traefik_traefik   1/1   traefik:v2.10

# Verificar logs
docker service logs -f traefik_traefik
# Aguardar: "Server configuration reloaded on :80" e ":443"
```

### 4. Testar Traefik

```bash
# Testar entrypoint HTTP
curl http://localhost
# Output: 404 page not found (esperado - sem services ainda)

# Acessar dashboard (se habilitado)
# http://<VPS_IP>:8080
```

---

## Deploy de Aplicação

### Exemplo: React App

Criar `docker-compose.swarm.yml`:

```yaml
version: '3.7'

services:
  app:
    image: myapp:latest
    networks:
      - network_public
    environment:
      - NODE_ENV=production
      - TZ=America/Sao_Paulo
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      restart_policy:
        condition: any
      labels:
        # CRÍTICO: Labels do Traefik
        - traefik.enable=true
        - traefik.docker.network=network_public

        # Router HTTP -> HTTPS redirect
        - traefik.http.routers.myapp-http.rule=Host(`myapp.example.com`)
        - traefik.http.routers.myapp-http.entrypoints=web
        - traefik.http.routers.myapp-http.middlewares=redirect-to-https

        # Router HTTPS
        - traefik.http.routers.myapp-https.rule=Host(`myapp.example.com`)
        - traefik.http.routers.myapp-https.entrypoints=websecure
        - traefik.http.routers.myapp-https.tls.certresolver=letsencryptresolver
        - traefik.http.routers.myapp-https.service=myapp-service

        # Service (loadbalancer)
        - traefik.http.services.myapp-service.loadbalancer.server.port=80

        # Middleware: Redirect HTTP -> HTTPS
        - traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
        - traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true

networks:
  network_public:
    external: true
    name: network_public
```

### Deploy

```bash
# Deploy stack
docker stack deploy -c docker-compose.swarm.yml myapp

# Verificar service
docker service ls
# Output: myapp_app   1/1   myapp:latest

# Verificar tasks
docker service ps myapp_app
# Output: Status = Running

# Acessar aplicação
curl https://myapp.example.com
# Output: HTML da aplicação
```

---

## Labels Obrigatórios

### Labels Essenciais (mínimo)

```yaml
labels:
  # 1. Habilitar Traefik para este service
  - traefik.enable=true

  # 2. Especificar network (obrigatório em Swarm)
  - traefik.docker.network=network_public

  # 3. Router HTTPS
  - traefik.http.routers.ROUTER_NAME.rule=Host(`domain.com`)
  - traefik.http.routers.ROUTER_NAME.entrypoints=websecure
  - traefik.http.routers.ROUTER_NAME.tls.certresolver=letsencryptresolver
  - traefik.http.routers.ROUTER_NAME.service=SERVICE_NAME

  # 4. Service (porta interna do container)
  - traefik.http.services.SERVICE_NAME.loadbalancer.server.port=80
```

**IMPORTANTE**: Substitua:
- `ROUTER_NAME`: Nome único do router (ex: `myapp-https`)
- `SERVICE_NAME`: Nome único do service (ex: `myapp-service`)
- `domain.com`: Seu domínio real
- `80`: Porta INTERNA do container (não exposta)

### Labels Opcionais (mas recomendados)

```yaml
labels:
  # HTTP -> HTTPS redirect
  - traefik.http.routers.ROUTER_NAME-http.rule=Host(`domain.com`)
  - traefik.http.routers.ROUTER_NAME-http.entrypoints=web
  - traefik.http.routers.ROUTER_NAME-http.middlewares=redirect-to-https
  - traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
  - traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true

  # Priority (se múltiplos routers)
  - traefik.http.routers.ROUTER_NAME.priority=1

  # Pass Host header
  - traefik.http.services.SERVICE_NAME.loadbalancer.passHostHeader=true
```

---

## Troubleshooting

### Problema 1: "404 page not found"

**Sintoma**: Traefik retorna 404 ao acessar domínio.

**Causas possíveis**:
1. DNS não aponta para VPS
2. Labels incorretos
3. Service não está na mesma network que Traefik

**Solução**:
```bash
# 1. Verificar DNS
nslookup myapp.example.com
# Deve retornar IP do VPS

# 2. Verificar labels
docker service inspect myapp_app --format '{{json .Spec.Labels}}' | jq

# 3. Verificar network
docker service inspect myapp_app --format '{{json .Spec.TaskTemplate.Networks}}'
# Deve mostrar network_public
```

---

### Problema 2: SSL não funciona (ERR_SSL_PROTOCOL_ERROR)

**Sintoma**: HTTPS não funciona, certificado inválido.

**Causas possíveis**:
1. Let's Encrypt não conseguiu validar domínio
2. Porta 443 bloqueada por firewall
3. DNS não propaga

**Solução**:
```bash
# 1. Verificar logs do Traefik
docker service logs traefik_traefik | grep -i "certificate"
# Procurar por: "Unable to obtain ACME certificate" ou "certificate obtained"

# 2. Verificar firewall
sudo ufw status
# Porta 80 e 443 devem estar abertas

# 3. Testar porta 80 (HTTP Challenge precisa dela)
curl http://myapp.example.com/.well-known/acme-challenge/test
# Não deve retornar erro de conexão

# 4. Forçar renovação (se necessário)
# Remover /opt/traefik/letsencrypt/acme.json e redeployar Traefik
```

---

### Problema 3: "502 Bad Gateway"

**Sintoma**: Traefik retorna 502.

**Causas possíveis**:
1. Container não está rodando
2. Porta errada no label
3. Container não responde na porta especificada

**Solução**:
```bash
# 1. Verificar se container está rodando
docker service ps myapp_app
# Status deve ser "Running", não "Failed"

# 2. Verificar porta do container
docker service inspect myapp_app --format '{{json .Spec.TaskTemplate.ContainerSpec}}' | jq
# Ver se EXPOSE está correto no Dockerfile

# 3. Testar porta localmente
docker exec $(docker ps -q -f name=myapp) curl http://127.0.0.1:80
# Deve retornar HTML
```

---

### Problema 4: Service não atualiza após deploy

**Sintoma**: Redeploy não atualiza aplicação.

**Causas possíveis**:
1. Imagem com mesma tag não é re-pulled
2. Cache do Docker

**Solução**:
```bash
# Opção 1: Forçar update
docker service update --force myapp_app

# Opção 2: Remover stack e redeployar
docker stack rm myapp
sleep 30  # Aguardar cleanup
docker stack deploy -c docker-compose.swarm.yml myapp

# Opção 3: Usar image digest ao invés de tag
# No build:
docker build -t myapp:latest .
docker tag myapp:latest myapp@sha256:abc123...
```

---

## Meta-Learning

### ML-2: Traefik Labels em Docker Swarm

**Situação**: Aplicação deployada, mas Traefik retornava 404.

**Problema**: Labels do Traefik devem estar em `deploy.labels`, NÃO em `labels` root.

**Solução**:
```yaml
# ❌ INCORRETO (labels no root - ignorados em Swarm)
services:
  app:
    labels:
      - traefik.enable=true

# ✅ CORRETO (labels em deploy - usado em Swarm)
services:
  app:
    deploy:
      labels:
        - traefik.enable=true
```

**Impacto**:
- 100% dos services agora funcionam primeiro deploy
- Documentação clara evita repetir erro

**Aprendizado**: Em Swarm, SEMPRE usar `deploy.labels`, nunca `labels` root.

---

## Checklist de Deploy

Ao deployar nova aplicação:

- [ ] DNS aponta para VPS IP
- [ ] Traefik está rodando (`docker service ls`)
- [ ] Network `network_public` existe
- [ ] Imagem Docker foi buildada e transferida
- [ ] `docker-compose.swarm.yml` tem labels corretos:
  - [ ] `traefik.enable=true`
  - [ ] `traefik.docker.network=network_public`
  - [ ] Router com domínio correto
  - [ ] Service com porta interna correta
  - [ ] TLS certresolver configurado
- [ ] Stack deployed: `docker stack deploy -c docker-compose.swarm.yml <name>`
- [ ] Service rodando: `docker service ps <name>_app`
- [ ] HTTPS funcionando: `curl https://domain.com`
- [ ] Certificado válido (não auto-assinado)

---

## Recursos

### Documentação Oficial
- [Docker Swarm](https://docs.docker.com/engine/swarm/)
- [Traefik v2](https://doc.traefik.io/traefik/)
- [Traefik + Docker Swarm](https://doc.traefik.io/traefik/providers/docker/)
- [Let's Encrypt](https://letsencrypt.org/docs/)

### Artigos
- [Traefik 2.0 + Docker Swarm Tutorial](https://dockerswarm.rocks/traefik/)
- [Let's Encrypt TLS Challenge](https://letsencrypt.org/docs/challenge-types/)

---

**Última atualização**: 2025-10-31
**Versão**: 1.0
**Mantido por**: Your Team
