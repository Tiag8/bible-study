# Workflow Fast-Track: Bug Crítico em Produção

> **Meta-Learning Aprendizado**: Bugs críticos que bloqueiam usuários não podem esperar 9 workflows
> 
> **Criado após**: Implementação WhatsApp buttons levou 2h por causa de workflow completo

---

## 📋 Quando Usar

**APENAS para bugs críticos em produção:**
- 🔥 **Usuários bloqueados** (não conseguem usar功能)
- 🚨 **Pagina quebrada** em produção
- 💳 **Perda de dados** ou corrupção
- 🔐 **Vulnerabilidade de segurança** ativa

**NÃO usar para:**
- ❌ Features novas
- ❌ Melhorias opcionais  
- ❌ Bugs não-críticos
- ❌ Desenvolvimento normal

---

## ⚡ Fluxo Fast-Track (3 etapas)

### Etapa 1: Diagnóstico Rápido (10 min)
```bash
# 1. Reproduzir bug
./scripts/reproduce-bug.sh

# 2. Verificar logs recentes
./scripts/check-recent-logs.sh

# 3. Identificar scope exato
echo "Arquivos afetados: [lista]"
```

### Etapa 2: Fix Imediato (tempo variável)
```bash
# 1. Fazer branch de emergência
git checkout -b fix/critical-bug-$(date +%Y%m%d-%H%M%S)

# 2. Implementar correção MÍNIMA
# FOCO: Funcionar, não perfeito

# 3. Testar manualmente
./scripts/smoke-test.sh

# 4. Deploy para produção
supabase functions deploy [function-name]
```

### Etapa 3: Quality Obrigatório (15 min)
```bash
# 1. Code review RÁPIDO
./scripts/code-review.sh --fast

# 2. Security scan CRÍTICO
./scripts/run-security-tests.sh --critical-only

# 3. Commit e push
git commit -m "fix: [descrição do bug] - CRITICAL"
git push origin fix/critical-bug-$(date +%Y%m%d-%H%M%S)
```

---

## 🔄 Pós-Fast-Track (OBRIGATÓRIO)

Após fix aplicado, executar **RETROSPECTIVA COMPLETA**:

### 1. Root Cause Analysis (30 min)
```bash
# Por que aconteceu?
# Como poderíamos ter evitado?
# O que precisa melhorar?
```

### 2. Documentação (20 min)
- Atualizar ADR se necessário
- Criar/registrar teste automatizado
- Atualizar feature map

### 3. Process Improvement (10 min)
- Melhorar scripts se necessário
- Atualizar workflows
- Adicionar aos checklists

---

## 🚨 Regras de Ouro

### ✅ **OBRIGATÓRIO**
- [ ] **Confirmar criticidade** com stakeholder
- [ ] **Testar em staging** antes de produção
- [ ] **Backup completo** antes de mudanças
- [ ] **Monitorar pós-deploy** por 1 hora
- [ ] **Documentar causa raiz** após fix

### ❌ **PROIBIDO**
- [ ] Pular **security scan** (mesmo rápido)
- [ ] Fazer **mudanças grandes** (só o mínimo)
- [ ] **Ignorar monitoramento** pós-deploy
- [ ] **Esquecer documentação** retrospectiva

---

## 📊 Exemplo Real: WhatsApp Buttons

### Situação:
- Usuários não conseguiam completar onboarding
- Botões LGPD não funcionavam
- **Impacto**: Crítico (bloqueia novos usuários)

### Execução Fast-Track:
1. **Diagnóstico** (10 min): Payload real ≠ documentação
2. **Fix** (45 min): Parser adaptativo + dados sintéticos  
3. **Quality** (15 min): Code review rápido + security scan
4. **Deploy** (5 min): Funcionalidade restaurada

### Resultado:
- ✅ Bug corrigido em **1h 15min**
- ✅ Usuários desbloqueados
- ✅ Zero regressões

---

## 🎯 Success Metrics

### Tempo Médio de Resolução:
- **Meta**: < 2 horas para bugs críticos
- **Atual**: 1h 15min (WhatsApp buttons)

### Qualidade Mantida:
- ✅ Zero regressões
- ✅ Security scan passa
- ✅ Documentação atualizada

---

## 📝 Template de Commit

```bash
git commit -m "fix: [breve descrição do bug] - CRITICAL

- Bug: [o que quebrava]
- Impact: [porque era crítico] 
- Fix: [correção mínima aplicada]
- Test: [como foi validado]
- Monitor: [status pós-deploy]

Fixes #XXX
```

---

## 🔄 Evolução deste Workflow

Este workflow foi criado via **Meta-Learning** após observar que:
- Workflow completo demoraria 1 dia para bug crítico
- Usuários ficariam bloqueados por muitas horas
- Fast-track resolveu em < 2 horas
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


- Qualidade foi mantida com steps essenciais

**Status**: ✅ Validado em produção  
**Último update**: 2025-11-02 (WhatsApp buttons case)
