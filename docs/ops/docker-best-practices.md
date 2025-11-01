# Docker Best Practices

> Melhores práticas para containerização com Docker, baseadas em aprendizados de projetos reais

---

## 📚 Índice

1. [Multi-Stage Builds](#multi-stage-builds)
2. [Alpine vs Debian](#alpine-vs-debian)
3. [Health Checks](#health-checks)
4. [.dockerignore](#dockerignore)
5. [Security Best Practices](#security-best-practices)
6. [Meta-Learnings](#meta-learnings)

---

## Multi-Stage Builds

### O que são?

Multi-stage builds permitem usar múltiplas imagens base em um único Dockerfile, copiando apenas os artefatos necessários entre stages.

### Por que usar?

- **Imagens menores**: Imagem final não contém ferramentas de build
- **Segurança**: Menos ferramentas = menor superfície de ataque
- **Build cache**: Stages são cacheados independentemente
- **Separação de responsabilidades**: Build vs Runtime

### Exemplo: React/Vite Application

```dockerfile
# =============================================================================
# Stage 1: Build (Node.js 18 Alpine)
# =============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application
ENV NODE_ENV=production
RUN npm run build

# Clean up (reduce stage size)
RUN rm -rf node_modules src public

# =============================================================================
# Stage 2: Production (Nginx Alpine)
# =============================================================================
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Configure timezone (optional)
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone && \
    apk del tzdata

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Benefícios Reais

- **Imagem final**: ~50MB (vs ~500MB sem multi-stage)
- **Build time**: ~3-5 min
- **Security**: Sem npm, node, source code na imagem final

---

## Alpine vs Debian

### Comparação

| Aspecto | Alpine | Debian |
|---------|--------|--------|
| **Tamanho base** | ~5MB | ~120MB |
| **Package manager** | apk | apt |
| **Libc** | musl | glibc |
| **Compatibilidade** | Menor | Maior |
| **Segurança** | Menos pacotes = menos vulnerabilidades | Mais testado |

### Quando usar Alpine?

✅ **Use Alpine quando:**
- Aplicações stateless (web servers, APIs)
- Prioridade: tamanho da imagem
- Dependências disponíveis no apk
- Não há dependências binárias específicas

### Quando usar Debian?

✅ **Use Debian quando:**
- Compatibilidade com bibliotecas C (glibc) é crítica
- Ferramentas específicas não disponíveis no Alpine
- Aplicações legadas ou com dependências complexas

### Exemplo: Node.js

```dockerfile
# Alpine (menor, mais rápido)
FROM node:18-alpine
# Imagem: ~170MB

# Debian (mais compatível)
FROM node:18-bullseye-slim
# Imagem: ~250MB
```

---

## Health Checks

### Importância

Health checks permitem que Docker/Kubernetes saibam se o container está saudável, não apenas rodando.

### Syntax

```dockerfile
HEALTHCHECK --interval=<duration> \
            --timeout=<duration> \
            --start-period=<duration> \
            --retries=<count> \
    CMD <command>
```

### ⚠️ CRÍTICO: 127.0.0.1 vs localhost

**SEMPRE use `127.0.0.1` em Alpine!**

```dockerfile
# ✅ CORRETO (Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# ❌ INCORRETO (Alpine pode falhar DNS)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
```

**Por quê?**
- Alpine usa musl libc, que pode ter problemas com resolução `localhost`
- `127.0.0.1` evita DNS lookup (mais rápido e confiável)
- Em Debian/Ubuntu, ambos funcionam, mas `127.0.0.1` é mais consistente

### Exemplos por Tipo de Aplicação

#### Web Server (Nginx/Apache)

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1
```

#### Node.js API

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
```

#### Python API (FastAPI/Django)

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/health || exit 1
```

### Parâmetros Recomendados

- **interval**: 30s (padrão para produção)
- **timeout**: 3s (tempo máximo para health check responder)
- **start-period**: 5-15s (depende do tempo de inicialização)
- **retries**: 3 (quantas falhas antes de marcar como unhealthy)

---

## .dockerignore

### O que é?

Arquivo que define quais arquivos/diretórios NÃO devem ser copiados para o contexto do Docker build.

### Por que usar?

- **Build mais rápido**: Menos arquivos para copiar
- **Imagens menores**: Evita copiar arquivos desnecessários
- **Segurança**: Evita copiar secrets acidentalmente
- **Cache melhor**: Mudanças em arquivos ignorados não invalidam cache

### Template Genérico

```dockerignore
# =============================================================================
# .dockerignore - Generic Template
# =============================================================================
# Prevents unnecessary files from being copied to Docker build context
# Reduces build time, image size, and prevents secrets leakage
# =============================================================================

# Dependencies (will be installed inside container)
node_modules/
*.pnp
*.pnp.js

# Production build (will be generated inside container)
dist/
build/

# Version control
.git/
.gitignore
.gitattributes

# Environment variables (SECURITY: Never copy to image!)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*

# IDE and editor
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Documentation (not needed in runtime)
README.md
docs/
*.md
CHANGELOG.md
LICENSE

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Testing
coverage/
.nyc_output/
*.lcov
test/
tests/
__tests__/
*.test.js
*.test.ts
*.spec.js
*.spec.ts

# Cache
.cache/
.eslintcache
.node_repl_history
.parcel-cache
.pytest_cache
.tsbuildinfo

# Temporary files
*.tmp
*.bak
.turbo/
.tmp/
temp/

# Optional npm files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Docker files (not needed inside image)
Dockerfile*
docker-compose*.yml
.dockerignore

# GitHub
.github/
.gitpod.yml

# Development
.env.example
.editorconfig
.prettierrc
.eslintrc*
tsconfig.json
vite.config.ts
vitest.config.ts

# CI/CD
.gitlab-ci.yml
.travis.yml
Jenkinsfile
azure-pipelines.yml

# Scripts (usually not needed in runtime)
scripts/

# Backup files
*.backup
*.dump
*.sql
backups/
```

### Dicas

1. **Ordene por categoria**: Facilita manutenção
2. **Comente seções**: Explica por que cada grupo é ignorado
3. **Revise regularmente**: Adicione padrões conforme projeto cresce
4. **Teste com `docker build`**: Verifique tamanho do contexto

---

## Security Best Practices

### 1. Não rode como root

```dockerfile
# Crie usuário não-privilegiado
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Mude ownership dos arquivos
RUN chown -R appuser:appgroup /app

# Mude para usuário não-root
USER appuser
```

### 2. Use imagens oficiais e atualizadas

```dockerfile
# ✅ CORRETO
FROM node:18-alpine

# ❌ EVITAR
FROM node:latest  # Pode quebrar em produção
FROM node:10      # Versão desatualizada
```

### 3. Scan de vulnerabilidades

```bash
# Docker Scout (built-in no Docker Desktop)
docker scout cves my-image:latest

# Trivy (open-source)
trivy image my-image:latest

# Snyk (SaaS)
snyk container test my-image:latest
```

### 4. Multi-stage builds para reduzir superfície de ataque

```dockerfile
# Build stage tem ferramentas de desenvolvimento
FROM node:18-alpine AS builder
RUN npm install  # Inclui devDependencies

# Production stage tem APENAS runtime
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Sem npm, node, source code!
```

### 5. Minimize camadas

```dockerfile
# ❌ EVITAR (muitas camadas)
RUN apk add curl
RUN apk add wget
RUN apk add git

# ✅ CORRETO (uma camada)
RUN apk add --no-cache curl wget git
```

### 6. Use .dockerignore para evitar secrets

```dockerignore
# CRÍTICO: Nunca copiar secrets!
.env
.env.*
*.key
*.pem
credentials.json
secrets/
```

---

## Meta-Learnings

### ML-1: Multi-Stage Builds são Essenciais

**Situação**: Imagem de produção com 500MB, incluindo npm e source code.

**Melhoria**: Implementado multi-stage build (Node builder + Nginx production).

**Impacto**:
- Imagem final: 500MB → 50MB (-90%)
- Build time: Não alterado (~5 min)
- Security: Sem ferramentas de build na imagem final

**Aprendizado**: Multi-stage builds devem ser padrão para TODAS as aplicações web.

---

### ML-2: Alpine Health Checks com 127.0.0.1

**Situação**: Health check usando `localhost` falhava intermitentemente em Alpine.

**Problema**: Alpine (musl libc) pode ter problemas com DNS lookup de `localhost`.

**Solução**: Trocar `localhost` por `127.0.0.1` em todos os health checks.

**Impacto**:
- Health checks 100% confiáveis
- Container não reinicia desnecessariamente
- Melhor observabilidade

**Aprendizado**: Em Alpine, SEMPRE use `127.0.0.1` ao invés de `localhost`.

---

### ML-3: .dockerignore Evita Problemas Sutis

**Situação**: Build demorava 2x mais após adicionar pasta `docs/` com PDFs grandes.

**Problema**: Docker copiava 500MB de docs desnecessários para build context.

**Solução**: Adicionar `docs/` ao `.dockerignore`.

**Impacto**:
- Build time: 10 min → 5 min (-50%)
- Contexto: 600MB → 100MB (-83%)

**Aprendizado**: `.dockerignore` bem configurado é tão importante quanto `.gitignore`.

---

### ML-4: Cache de Dependências

**Situação**: Build invalidava cache toda vez que qualquer arquivo mudava.

**Problema**: `COPY . .` antes de `npm install`.

**Solução**: Copiar `package*.json` primeiro, depois instalar, depois copiar resto.

```dockerfile
# ✅ CORRETO (aproveita cache)
COPY package*.json ./
RUN npm install
COPY . .

# ❌ EVITAR (invalida cache sempre)
COPY . .
RUN npm install
```

**Impacto**:
- Build com cache: 5 min → 30s (-90%)
- Iterações de desenvolvimento muito mais rápidas

---

### ML-5: Start Period no Health Check

**Situação**: Container reiniciava logo após iniciar em produção.

**Problema**: Health check começava antes do app estar pronto (Node.js demora ~10s).

**Solução**: Adicionar `--start-period=10s` no HEALTHCHECK.

```dockerfile
# ✅ CORRETO
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:3000/health || exit 1

# ❌ INCORRETO (sem start-period)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://127.0.0.1:3000/health || exit 1
```

**Impacto**:
- Zero restarts desnecessários
- Deploy mais confiável
- Logs mais limpos

**Aprendizado**: `start-period` deve ser >= tempo de inicialização da aplicação.

---

## Recursos

### Documentação Oficial
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Docker Security](https://docs.docker.com/engine/security/)

### Ferramentas
- [Docker Scout](https://docs.docker.com/scout/) - Vulnerability scanning
- [Trivy](https://github.com/aquasecurity/trivy) - Security scanner
- [Hadolint](https://github.com/hadolint/hadolint) - Dockerfile linter

### Artigos
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Alpine vs Debian](https://nickjanetakis.com/blog/alpine-based-docker-images-make-a-difference-in-real-world-apps)

---

**Última atualização**: 2025-10-31
**Versão**: 1.0
**Mantido por**: Your Team
