---
description: Workflow Add-Feature (11/11) - VPS Deployment - Parte 3b/3 (Root Cause Analysis + Rollback + Troubleshooting)
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 11c1a

**Este é o Workflow 11c1b - Continuação de:**

← [Workflow 11c1a - VPS Monitoring](.windsurf/workflows/add-feature-11c1a-vps-monitoring.md)

**Pré-requisito**: Monitoramento do Workflow 11c1a deve ter sido completado (10min).

**Quando usar este workflow**:
- Problemas detectados durante Fase 28 (Monitoramento)
- Service status = "Failed" ou "Rejected"
- Erros 500/502/503 em > 20% requisições
- Service reinicia > 3 vezes em 10 min
- Feature quebrou funcionalidade crítica
- Timeout em > 30% das requisições

**Se monitoramento OK**: Pule este workflow e vá direto para Workflow 11c2 (Documentação).

---

## 📋 Workflow 11c1b - RCA e Rollback (Parte 2/2)

**Partes do Workflow 11**:
- **Parte 1/3**: `add-feature-11a-vps-deployment-prep.md` (Pré-Deploy Checklist + Build Local)
- **Parte 2/3**: `add-feature-11b-vps-deployment-exec.md` (Deploy Automático + Validação Pós-Deploy)
- **Parte 3a/3**: `add-feature-11c1a-vps-monitoring.md` (Health Checks + Monitoramento)
- **Parte 3b/3**: `add-feature-11c1b-rca-rollback.md` (RCA + Rollback) ← **VOCÊ ESTÁ AQUI**
- **Parte 3c/3**: `add-feature-11c2-vps-rollback-docs.md` (Documentação Final)

---

## ⚡ Use Múltiplos Agentes

**RCA + Troubleshooting**: 5 agentes paralelos (VPS, Container, Traefik, Logs, Database) = Diagnóstico completo em 5min.

---

## 🎯 Objetivo

Diagnosticar causa raiz de problemas detectados no monitoramento, executar troubleshooting, e realizar rollback se necessário.

---

## 🔍 Fase 28.6: Root Cause Analysis (RCA)

**Quando usar**: Monitoramento detectou problemas, mas causa raiz não é óbvia.

**Processo completo (5 Why's + Correlação)**:

### Exemplos: RCA 5 Whys

**Exemplo 1 (Memory)**: Service reinicia → Health check falha → Nginx morre → OOM Killer → Memory leak ou bundle > RAM → **Solução**: Profiling/reduzir bundle

**Exemplo 2 (Query)**: 502 errors → Backend não responde → CPU 100% → Query sem índice+RLS → Full table scan → **Solução**: Criar índice em user_id

---

### Correlação de Sinais Multi-Dimensional

**Correlacionar sinais de múltiplos agentes**:

| Sinal Agent 1 (VPS) | Sinal Agent 2 (Container) | Sinal Agent 3 (Logs) | Sinal Agent 4 (UX) | Causa Raiz Provável | Ação |
|---------------------|--------------------------|---------------------|-------------------|---------------------|------|
| CPU 100% | Restart count = 0 | Logs normais | Timeout em 30% requests | Query lenta (database) | EXPLAIN ANALYZE queries, criar índices |
| CPU normal | Restart count = 5 | OOM Killer logs | App trava após 3min | Memory leak | Profiling memória, reduzir bundle |
| CPU normal | Restart count = 0 | Erros 502 intermitentes | 50% requests fail | Rate limit externo (Supabase/Gemini) | Verificar quotas, implementar retry |
| Disk 95% | Restart count = 0 | "No space left" | Upload falha | Disco cheio | Limpar logs antigos, aumentar disco |

---

### Perguntas Diagnósticas (Resumidas)

| Sintoma | Causa Provável | Check |
|---------|----------------|-------|
| CPU/Mem alto | Query lenta, memory leak, bundle grande | `docker stats`, logs |
| Disk 95% | Logs/uploads acumulando | `df -h` |
| Restarts > 3x | OOM, health check, resource limit | `docker logs` |
| 500 Error | Exception no código, Supabase down | Logs da app |
| 502 Error | Backend não responde, timeout | Health check, CPU/Mem |
| 503 Error | Rate limit, deploy em progresso | Verificar quotas |

---

### Checklist RCA Completo

- [ ] Coletei logs de TODOS os agentes (VPS, Container, Traefik, Aplicação)
- [ ] Identifiquei padrão temporal (sempre após 3min? sob carga? aleatório?)
- [ ] Correlacionei múltiplos sinais (CPU + logs + UX)
- [ ] Perguntei "Por quê?" 5 vezes até causa raiz
- [ ] Causa raiz é algo fixável e testável
- [ ] Tenho rollback plan se solução falhar
- [ ] Documentei em docs/debugging/ ou docs/TROUBLESHOOTING.md

**Se RCA não resolve em 15min**: Use workflow de debugging multi-agent:
```bash
# Workflow completo com 5 agentes paralelos
cat .windsurf/workflows/debug-complex-problem.md

# Documentar problema primeiro
cp docs/debugging/template-problem-statement.md docs/debugging/problema-[nome].md
# Preencher template, depois lançar 5 agentes
```

---

## 🕸️ DEPOIS DO RCA: Resolução em Teia (OBRIGATÓRIO)

**CRÍTICO**: Após executar 5 Whys e identificar causa raiz, aplicar **Resolução em Teia**.

**Objetivo**: Mapear TODA teia de código/docs/testes conectados à causa raiz e resolver holisticamente (não apenas 1 arquivo).

**Checklist rápido**:
- [ ] Mapeei TODOS arquivos conectados (import/export)?
- [ ] Identifiquei TODAS funções relacionadas?
- [ ] Busquei padrões similares no codebase?
- [ ] Vou atualizar TODA documentação relacionada?
- [ ] Vou adicionar testes para TODA teia?

**Ferramentas**:
```bash
# Buscar conexões
grep -r "import.*from.*arquivo-afetado" src/ supabase/
grep -r "funçãoAfetada(" src/ supabase/
grep -r "tabela_afetada" supabase/
```

**Ver metodologia completa**: `.claude/CLAUDE.md` → Regra 4B (Resolução em Teia)

**Workflows relacionados**:
- Workflow 5b (Refactoring & RCA) - Metodologia completa
- debug-complex-problem (Fase 3.5) - Multi-agent approach

---

## 🔧 Troubleshooting Comum

### Problemas Comuns (Troubleshooting)

**Problema 1: Connection refused**
- Check: `docker exec lifetracker env | grep SUPABASE` → Verificar variáveis
- Check: `curl -v <SUPABASE_URL>` → Verificar conectividade
- Ação: Se credenciais inválidas → Rollback (Fase 29)

**Problema 2: Service reinicia**
- Check: `docker service logs lifetracker_app | grep -i error` → Ver logs
- Check: `free -h && df -h` → RAM > 1GB? Disk < 80%?
- Ação: Memory leak → Profiling. Sem espaço → Rollback (Fase 29)

**Problema 3: HTTP lento (> 5s)**
- Check: `docker stats` → CPU/Mem saturados?
- Check: Logs para queries lentas → Falta índices?
- Ação: Otimizar queries ou implementar caching

**Problema 4: ERR_CERT_AUTHORITY_INVALID**
- Check: `docker ps | grep traefik` → Traefik rodando?
- Check: `nslookup life-tracker.stackia.com.br` → DNS OK?
- Ação: Aguardar 2-3min para Let's Encrypt renewal

---

## 🔄 Fase 29: Rollback (Se Necessário)

**Quando executar rollback**:
- Causa raiz não identificada em 15-20min
- Fix não é possível sem retrabalho significativo
- Problemas críticos que afetam usuários em produção
- Service completamente instável (> 5 restarts em 10min)

### 29.1 Rollback Automático (Script)

```bash
# Rollback usando script dedicado
./scripts/vps-rollback.sh production

# Este script vai:
# 1. Verificar última versão estável (git tags)
# 2. Fazer pull da imagem anterior no VPS
# 3. Atualizar service com versão anterior
# 4. Validar health checks pós-rollback
# 5. Monitorar por 5min

# Tempo estimado: 2-3min
```

**O script faz automaticamente**:
- Identifica última versão estável (tag git anterior)
- Atualiza service Docker Swarm para versão anterior
- Valida health checks
- Monitora logs por 5min

---

### 29.2 Rollback Manual (Se script falhar)

```bash
# 1. SSH no VPS
ssh root@31.97.22.151

# 2. Listar imagens Docker disponíveis
docker images | grep life-tracker

# 3. Identificar versão anterior estável
# Exemplo: life-tracker:v1.2.3 (anterior) vs life-tracker:v1.2.4 (atual com problemas)

# 4. Atualizar service para versão anterior
docker service update --image life-tracker:v1.2.3 lifetracker_app

# 5. Verificar rollback
docker service ps lifetracker_app

# 6. Monitorar logs por 5min
docker service logs -f --tail 100 lifetracker_app
```

---

### 29.3 Validação Pós-Rollback

**Após rollback (automático ou manual), validar**:

```bash
# 1. Health check
curl -I https://life-tracker.stackia.com.br
# Espera: HTTP/2 200

# 2. Service status
ssh root@31.97.22.151 "docker service ps lifetracker_app"
# Espera: State = "Running"

# 3. Logs sem erros
ssh root@31.97.22.151 "docker service logs --tail 50 lifetracker_app"
# Espera: Nenhum erro 500/502/503

# 4. Teste manual no browser
# Abrir https://life-tracker.stackia.com.br
# Verificar se funcionalidade crítica está OK
```

**Checklist Pós-Rollback**:
- [ ] Service status = "Running"
- [ ] Health check retorna 200
- [ ] Logs sem erros críticos (5min)
- [ ] Teste manual no browser OK
- [ ] Funcionalidade crítica funcionando

---

### 29.4 Documentar Rollback

**Após rollback bem-sucedido**:

```bash
# Criar registro em docs/debugging/
cat > docs/debugging/rollback-$(date +%Y-%m-%d).md << 'EOF'
# Rollback - [Data]

## Problema Detectado
- **Versão com problema**: v1.2.4
- **Sintomas**: [Descrever sintomas observados]
- **Horário detecção**: [Horário]

## Causa Raiz (RCA)
[Resultado da análise 5 Why's]

## Rollback Executado
- **Versão rollback**: v1.2.3
- **Método**: Automático via script / Manual
- **Horário execução**: [Horário]
- **Duração**: [Minutos]

## Validação Pós-Rollback
- [ ] Health check OK
- [ ] Service running
- [ ] Logs sem erros
- [ ] Teste manual OK

## Ações Futuras
- [ ] Fix do bug identificado
- [ ] Teste adicional antes de re-deploy
- [ ] Atualizar CI/CD para detectar este tipo de problema

## Lessons Learned
[O que aprendemos com este incidente]
EOF

# Commitar documentação
git add docs/debugging/rollback-$(date +%Y-%m-%d).md
git commit -m "docs: rollback v1.2.4 → v1.2.3 - [motivo]"
```

---

## ✅ Checklist Final: RCA + Rollback Completo

- [ ] RCA executado (5 Why's)
- [ ] Causa raiz identificada e documentada
- [ ] Troubleshooting executado (se aplicável)
- [ ] Rollback executado (se necessário)
- [ ] Validação pós-rollback OK (se rollback foi feito)
- [ ] Problema documentado em docs/debugging/
- [ ] Lessons learned capturados

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

## 🔄 Próximo Workflow

**Após completar RCA/Rollback**:

→ Prosseguir para **Workflow 11c2** (Documentação Final): `add-feature-11c2-vps-rollback-docs.md`

**Ações finais em 11c2**:
- Atualizar CHANGELOG.md
- Atualizar docs/TASK.md
- Atualizar docs/PLAN.md (se necessário)
- Criar tag git (se deploy OK)
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

**Fim do Workflow 11c1b** - RCA e Rollback concluído.
