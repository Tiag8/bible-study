---
description: Workflow 11/11 - VPS Deployment - Parte 3b/3 (Rollback & Docs)
---

## 📋 Workflow 11 - Parte 3b/3 (Rollback & Documentação)

**Parte final do Deploy. Partes do Workflow 11**:
- Parte 1/3: `add-feature-11a-vps-deployment-prep.md`
- Parte 2/3: `add-feature-11b-vps-deployment-exec.md`
- Parte 3a/3: `add-feature-11c1-vps-monitoring.md`
- Parte 3b/3: `add-feature-11c2-vps-rollback-docs.md` ← **AQUI**

**Objetivo**: Rollback (se necessário) e documentação de deploy.

---

## 🎯 Como Chegou Aqui?

Você chegou aqui após concluir o **Workflow 11c1 (Monitoramento)**. Dependendo dos resultados, siga um dos dois caminhos:

**Cenário 1: Tudo OK ✅**
- Monitoramento passou sem erros críticos (10 minutos)
- Pule **Fase 29** e execute **Fase 30** (Documentação apenas)
- Tempo: ~5-10 minutos

**Cenário 2: Encontrou Problemas ❌**
- Erros críticos detectados durante monitoramento
- Execute **Fase 29** (Rollback) + **Fase 30** (Documentação)
- Tempo: ~10-15 minutos
- Analise problema em `docs/INCIDENTS.md` após concluir

---

## 📋 Dois Caminhos Possíveis

**Monitoramento OK?** Pule Fase 29 e execute Fase 30 (Documentação). Tempo: 5-10min.

**Problemas?** Execute Fase 29 (Rollback) + Fase 30. Tempo: 10-15min.

---

## 🔄 Fase 29: Rollback (Se Necessário)

**Sinais de rollback**: Service não inicia, 500+ erros, restarts frequentes, feature crítica quebrou, dados corrompidos.

### 29.1 Executar Rollback

```bash
# Script automático
./scripts/vps-rollback.sh

# OU manual:
ssh root@31.97.22.151 "docker stack rm lifetracker"
sleep 30
git checkout <commit-anterior>
docker build -t life-tracker:rollback .
./scripts/deploy-vps.sh
```

**Tempo**: 2-3 minutos. Ver `docs/ops/vps-access.md` para detalhes.

### 29.2 Pós-Rollback: Root Cause Analysis

**CRÍTICO**: Após rollback, SEMPRE fazer RCA para evitar recorrência.

**Processo (5 Why's + Lições)**:

```
Exemplo: "Deploy quebrou login de usuários"

1. Por quê login quebrou?
   → "API retorna 401 Unauthorized para todos os requests"

2. Por quê retorna 401?
   → "JWT token validation falha no backend"

3. Por quê validation falha?
   → "JWT secret mudou entre deploy"

4. Por quê secret mudou?
   → ".env.production tinha VITE_SUPABASE_ANON_KEY diferente do .env local"

5. Por quê tinha diferente?
   → "Secrets foram rotacionados no Supabase mas .env.production não foi atualizado"

Causa Raiz: .env.production desatualizado após rotação de secrets
Solução: Sincronizar .env.production com secrets atuais do Supabase
Prevenção: Adicionar validação em pre-deploy (Workflow 11a) para verificar secrets válidos
```

**Documentação obrigatória**:

1. **Criar incident report** em `docs/INCIDENTS.md`:
```markdown
## [2025-11-03 15:30] Deploy Rollback - Login Failure

**Sintoma**: Login quebrou para todos os usuários após deploy

**Causa Raiz**: .env.production com secrets desatualizados (JWT secret rotacionado)

**Impacto**:
- Duração: 15 minutos (deploy + monitoramento + rollback)
- Usuários afetados: Todos (~100 usuários)
- Funcionalidade afetada: Login/Autenticação

**Timeline**:
- 15:00: Deploy iniciado
- 15:07: Smoke tests detectaram 401 em todas as APIs
- 15:10: Rollback iniciado
- 15:13: Rollback completado
- 15:15: Validação OK (versão anterior funcionando)

**Root Cause Analysis**:
- [5 Why's acima]

**Solução Aplicada**:
- Rollback para commit abc123
- Sincronização .env.production com Supabase
- Re-deploy após validação

**Prevenção Futura**:
- Adicionar validação de secrets em Workflow 11a (Fase 24.2)
- Script de sincronização automática de .env com Supabase
- Health check mais robusto (testar autenticação antes de deploy)

**Lições Aprendidas**:
1. Secrets devem ser validados ANTES de build (não apenas após deploy)
2. Smoke tests devem incluir autenticação (não apenas HTTP 200)
3. Rollback time foi bom (15min), mas pode melhorar para <10min
```

2. **Atualizar `docs/TROUBLESHOOTING.md`** (se novo tipo de problema):
```markdown
### Deploy falha: 401 Unauthorized após deploy

**Sintoma**: API retorna 401 para requests autenticados

**Causa comum**: JWT secret ou SUPABASE_ANON_KEY desatualizado em .env

**Solução**:
1. Verificar secrets no Supabase Dashboard (Project Settings → API)
2. Comparar com .env.production local
3. Atualizar .env.production se necessário
4. Rebuild + Re-deploy

**Prevenção**: Validar secrets em Workflow 11a antes de build
```

3. **Criar ADR** (se decisão arquitetural necessária):
```markdown
# ADR XXX: Validação de Secrets no Pre-Deploy

**Status**: Accepted
**Date**: 2025-11-03
**Context**: Deploy falhou por secrets desatualizados em .env.production
**Decision**: Adicionar validação automática de secrets em Workflow 11a
**Consequences**: Zero deploys com secrets inválidos (prevenção)
```

**Checklist Pós-Rollback**:
- [ ] Rollback executado com sucesso (versão anterior OK)
- [ ] 5 Why's completado (causa raiz identificada)
- [ ] Incident report criado em docs/INCIDENTS.md
- [ ] TROUBLESHOOTING.md atualizado (se novo problema)
- [ ] ADR criado (se decisão arquitetural)
- [ ] Solução implementada e testada
- [ ] Re-deploy bem-sucedido (se solução pronta)
- [ ] Meta-learning aplicado em workflow (prevenção futura)

---

## 📝 Fase 30: Documentação do Deploy

**IMPORTANTE**: Documentar deploy para histórico e aprendizado.

### 30.1 Atualizar Deploy History

```bash
# Adicionar entry em docs/ops/deploy-history.md
DATE=$(date '+%Y-%m-%d %H:%M')
COMMIT=$(git rev-parse --short HEAD)
BRANCH=$(git branch --show-current)

cat >> docs/ops/deploy-history.md << EOF

### Deploy $DATE
**Branch**: \`$BRANCH\` | **Commit**: \`$COMMIT\`
**Status**: ✅ Sucesso / ❌ Rollback | **Tempo**: ~7-10 min
**Validações**: Testes ✅ | Build ✅ | Smoke tests ✅ | Monitoramento 10min ✅
**Notas**: [Observações, problemas, lições aprendidas]

---
EOF
```

### 30.2 Atualizar Documentação (Se necessário)

Se houve mudanças operacionais importantes:
- Atualizar `docs/ops/README.md` (novos procedimentos)
- Criar ADR em `docs/adr/` (decisões arquiteturais)
- Atualizar `README.md` (seção Deploy)

---

## ✅ Checklist Final

**Monitoramento** (Fase 28):
- [ ] 10min sem erros críticos
- [ ] Service "Running" o tempo todo
- [ ] Testes OK (carga, manual, regressões)

**Rollback** (Fase 29 - se necessário):
- [ ] Executado com sucesso
- [ ] Versão anterior estável

**Documentação** (Fase 30):
- [ ] Deploy history atualizado
- [ ] Problemas documentados
- [ ] ADRs criados (se necessário)

---

## Concluído!

**Workflow 11 completo**: Preparação → Execução → Monitoramento → Rollback & Docs

Tempo: ~20-25 min. Próxima: Voltar ao Workflow 1 (Planning).

Aplicação em produção: **https://life-tracker.stackia.com.br**

Após finalizar:
- [ ] Atualizar `docs/TASK.md`
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


- [ ] Atualizar `docs/PLAN.md` (se mudança estratégica)
- [ ] Criar ADR (se decisão arquitetural)
- [ ] Adicionar entry em `docs/ops/deploy-history.md`

