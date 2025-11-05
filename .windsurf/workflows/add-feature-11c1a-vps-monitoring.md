---
description: Workflow Add-Feature (11/11) - VPS Deployment - Parte 3a/3 (Monitoring - Health Checks e Testes)
---

## 📋 Workflow 11c1a - Monitoramento (Parte 1/2)

**Este é o Workflow 11 - Parte 3a/3 (Monitoramento do Deploy para Produção)**

**Partes do Workflow 11**:
- **Parte 1/3**: `add-feature-11a-vps-deployment-prep.md` (Pré-Deploy Checklist + Build Local)
- **Parte 2/3**: `add-feature-11b-vps-deployment-exec.md` (Deploy Automático + Validação Pós-Deploy)
- **Parte 3a/3**: `add-feature-11c1a-vps-monitoring.md` (Health Checks + Monitoramento) ← **VOCÊ ESTÁ AQUI**
- **Parte 3b/3**: `add-feature-11c1b-rca-rollback.md` (RCA + Rollback + Troubleshooting)
- **Parte 3c/3**: `add-feature-11c2-vps-rollback-docs.md` (Documentação Final)

---

## ⚡ Use Múltiplos Agentes

**Fase 28**: Logs + Testes de Carga + Métricas + Teste Manual (4 agentes paralelos) = Monitoramento completo.

---

## 🎯 Objetivo

Monitorar saúde da aplicação após deploy, executar testes de carga, validar funcionalidades, e garantir que aplicação está estável.

---

## 📊 Fase 28: Monitoramento (10-15 minutos)

**CRÍTICO**: Monitorar por pelo menos 10 minutos após deploy bem-sucedido.

Este é o momento em que a aplicação será testada em produção. Erros sutis que não foram detectados localmente podem aparecer aqui.

### 28.1 Monitorar Logs em Tempo Real

```bash
# Terminal 1: Abrir logs em tempo real
ssh root@31.97.22.151 "docker service logs -f --tail 100 lifetracker_app"

# Deixar rodando por 10 minutos
# ✅ Procurar por: Requisições HTTP normais (200, 304)
# ❌ Alertar para: 500, 502, 503, 504, "error", "crash"
```

**O que observar**:
- ✅ Requisições HTTP normais (GET /assets, GET /index.html)
- ✅ Status codes 200, 304 (cache)
- ✅ Timestamps corretos (timezone America/Sao_Paulo)
- ❌ Erros 500 (Internal Server Error)
- ❌ Erros 502/503/504 (Gateway/Service Unavailable)
- ❌ Crashes / restarts do container
- ❌ Exceções não tratadas
- ❌ Warnings de dependências

**Exemplo de logs bons**:
```
GET /index.html HTTP/1.1 200 5432 "-" "Mozilla/5.0..." 0.045ms
GET /assets/main.abc123.js HTTP/1.1 304 0 "-" "Mozilla/5.0..." 0.012ms
GET /assets/style.def456.css HTTP/1.1 200 123456 "-" "Mozilla/5.0..." 0.025ms
```

**Exemplo de logs ruins**:
```
GET /api/data HTTP/1.1 502 0 "-" "Mozilla/5.0..." timeout
[ERROR] Cannot connect to database: Connection refused
[CRITICAL] Service restart detected (restart count: 3)
```

**Checklist de Logs**:
- [ ] Logs aparecem em tempo real (sem delays)
- [ ] Requisições HTTP mostram status 200/304
- [ ] Nenhum erro 500/502/503/504 nos primeiros 10min
- [ ] Nenhum "error", "crash", "fatal" nos logs
- [ ] Timestamps estão corretos

---

### 28.2 Monitorar Métricas do Service

```bash
# Terminal 2: A cada 2 minutos, verificar status
watch -n 120 "ssh root@31.97.22.151 'docker service ps lifetracker_app'"

# ✅ Espera: State = "Running", sem restarts
# ❌ Se restarts frequentes (> 2 em 10min): Problema crítico, acionar rollback (Workflow 11c1b)
```

**Informações a observar**:
- **Current State**: Deve ser "Running" o tempo todo
- **Desired State**: Deve ser "Running"
- **Error**: Deve estar vazio
- **Restart Count**: Deve permanecer 0 ou 1 (máximo) durante 10min
- **Node**: Deve estar no mesmo nó (Docker node)

**Exemplo de status bom**:
```
ID        NAME                           IMAGE               NODE  DESIRED STATE  CURRENT STATE
abc123xyz lifetracker_app.1.xyz789abc    life-tracker:latest node1 Running        Running 5 minutes ago
```

**Exemplo de status ruim**:
```
ID        NAME                           IMAGE               NODE  DESIRED STATE  CURRENT STATE
abc123xyz lifetracker_app.1.xyz789abc    life-tracker:latest node1 Running        Rejected 1 second ago
(ou)
ID        NAME                           IMAGE               NODE  DESIRED STATE  CURRENT STATE
abc123xyz lifetracker_app.1.xyz789abc    life-tracker:latest node1 Running        Failed 10 seconds ago
```

**Checklist de Métricas**:
- [ ] Current State = "Running"
- [ ] Desired State = "Running"
- [ ] Restart count = 0 ou 1 (máximo)
- [ ] Sem mudanças de node durante monitoramento
- [ ] Task ID permanece o mesmo (não é substituída)

---

### 28.3 Testes de Carga Leve (Paralelo com logs)

**Execute em paralelo com logs (Terminal 3 ou 4)**:

```bash
# Simular 100 requisições ao longo de ~1 minuto
for i in {1..100}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://life-tracker.stackia.com.br)
  echo "Requisição $i: HTTP $HTTP_CODE"
  sleep 0.5
done | sort | uniq -c | sort -rn

# ✅ Espera:
#   90+ respostas com 200
#   5-10 respostas com 304 (cache)
#   0 respostas com 500/502/503/504

# ❌ Se muitos 500/502/503: Problema de performance ou banco de dados
```

**Análise dos resultados**:

```
      95 HTTP 200    ← Maioria
       5 HTTP 304    ← Cache (normal)
       0 HTTP 50x    ← Bom sinal
```

Se resultado for ruim:
```
      30 HTTP 200    ← Muito baixo!
      10 HTTP 304
      60 HTTP 502    ← Problema crítico → Investigar logs
```

**Checklist de Carga**:
- [ ] 100 requisições completadas
- [ ] Maioria status 200 (90+%)
- [ ] Alguns status 304 (5-10%)
- [ ] Sem timeouts
- [ ] Sem 500/502/503
- [ ] Service não reiniciou durante teste

---

### 28.4 Teste Manual no Browser

**IMPORTANTE**: Abrir browser e testar manualmente é essencial!

Navegue para: **https://life-tracker.stackia.com.br**

**Verificar**:

```
1. Página carrega sem problemas
   [ ] Página inicial aparece
   [ ] Layout não está quebrado
   [ ] Imagens carregam normalmente

2. Verificar console do browser (F12 → Console)
   [ ] Nenhum erro em vermelho (Red X)
   [ ] Nenhum "Uncaught Error"
   [ ] Warnings são aceitáveis (deprecation, CSP)
   [ ] Nenhum erro de CORS

3. Verificar Network (F12 → Network)
   [ ] Requisições HTTP para /api/* retornam 200/304
   [ ] Assets carregam com status 200 ou 304 (cache)
   [ ] Tempo de resposta razoável (< 1s para HTML principal)

4. Testes Funcionais
   [ ] Autenticação funciona (login, logout)
   [ ] Feature recém-deployada está visível
   [ ] Dashboard carrega corretamente
   [ ] Gráficos renderizam sem erros
   [ ] Formulários submitem sem erro

5. Performance Subjetiva
   [ ] Página não trava ao clicar
   [ ] Animações são smooth
   [ ] Scroll é responsivo
   [ ] Nenhuma lag visível

6. Compatibilidade
   [ ] Testar em diferentes abas/janelas
   [ ] Testar em modo dark (se aplicável)
   [ ] Testar em mobile (responsividade)
   [ ] Testar em diferentes navegadores (Chrome, Firefox, Safari)
```

**Se encontrar erro no console**:
1. Notar a mensagem de erro exata
2. Reproduzir a ação que causou o erro
3. Ir para Workflow 11c1b (RCA + Rollback) para análise detalhada

**Checklist de Teste Manual**:
- [ ] Página principal carrega sem erros
- [ ] Sem erros críticos no console
- [ ] Assets carregam com sucesso
- [ ] Feature nova está presente e funcional
- [ ] Sem regressões em features existentes
- [ ] Performance aceitável (sem travamentos)

---

### 28.5 Resumo do Monitoramento (10min check)

Após 10 minutos, preencher checklist final:

```bash
# Capturar dados finais
echo "=== MONITORAMENTO 10 MINUTOS ==="
echo ""
echo "Logs:"
ssh root@31.97.22.151 "docker service logs --tail 20 lifetracker_app"
echo ""
echo "Service Status:"
ssh root@31.97.22.151 "docker service ps lifetracker_app"
echo ""
echo "Uptime verificado por 10min: ✅"
```

**Decisão**:
- ✅ **Tudo OK?** → Prosseguir para Workflow 11c2 (Documentação)
- ⚠️ **Warnings menores?** → Documentar e monitorar por mais tempo, depois prosseguir para 11c2
- ❌ **Erro crítico?** → Prosseguir para Workflow 11c1b (RCA + Rollback)

---

## ✅ Checklist Final: Monitoramento Completo (Fase 28)

**Verifique todos os itens antes de prosseguir:**

- [ ] Logs monitorados por 10min sem interrupção
- [ ] Nenhum erro 500/502/503/504
- [ ] Service status "Running" o tempo todo
- [ ] Restart count = 0 ou 1 (máximo)
- [ ] Teste de carga OK (100 requisições, 90%+ status 200)
- [ ] Teste manual no browser OK
- [ ] Feature nova funcionando
- [ ] Sem regressões detectadas

---

## 🔄 Próximo Workflow (Condicional)

**Checkpoint**: Decisão baseada em métricas observadas na Seção 28.5.

### Caso 1 - Tudo OK ✅

**Critérios**:
- Monitoramento passou sem erros críticos
- Logs mostram apenas requisições normais (200, 304)
- Service status = "Running" o tempo todo
- Restart count ≤ 1
- Teste de carga OK (90%+ status 200)
- Teste manual no browser sem erros

**Ação**: Prosseguir para **Workflow 11c2** (Documentação): `add-feature-11c2-vps-rollback-docs.md`

---

### Caso 2 - Problemas Detectados ❌

**Critérios**:
- Service status = "Failed" ou "Rejected"
- Erros 500/502/503 em > 20% requisições
- Service reinicia > 3 vezes em 10 min
- Feature quebrou funcionalidade crítica
- Banco corrompido / bugs críticos
- Timeout em > 30% das requisições

**Ação**: Prosseguir para **Workflow 11c1b** (RCA + Rollback): `add-feature-11c1b-rca-rollback.md`

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

**Se problemas detectados, este workflow continua automaticamente em:**

→ [Workflow 11c1b - RCA e Rollback](.windsurf/workflows/add-feature-11c1b-rca-rollback.md)

**Próximas etapas (se problemas detectados)**:
- Root Cause Analysis detalhada (5 Why's)
- Troubleshooting multi-dimensional com correlação de sinais
- Procedimentos de rollback se necessário
- Documentação de problemas encontrados

**Se monitoramento OK (Caso 1)**:
- Pular Workflow 11c1b
- Ir direto para Workflow 11c2 (Documentação)

---

**Fim do Workflow 11c1a** - Monitoramento concluído.
