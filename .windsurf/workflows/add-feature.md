---
description: Adicionar nova funcionalidade ao projeto (Sistema Modular 9 Workflows)
---

# Workflow: Adicionar Nova Funcionalidade (Master)

Este workflow guia a implementação de uma nova feature do início ao fim, com segurança e qualidade.

**🔥 NOVO**: Sistema modular com 10 workflows que se chamam automaticamente!

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

## 📋 Sistema Modular (10 Workflows)

Este workflow foi dividido em **10 etapas modulares** que se chamam automaticamente:

### **1️⃣ Planning** (Entendimento e Contexto)
📄 `add-feature-1-planning.md`

**O que faz:**
- Fase 1: Entendimento e Contexto (perguntas ao usuário)
- Fase 2: Análise de Documentação Existente
- Fase 3: Planejamento Profundo (Ultra Think, se necessário)

**Saída:** Contexto completo da funcionalidade

---

### **2️⃣ Solution Design** (3 Soluções) ⭐ NOVO!
📄 `add-feature-2-solutions.md`

**O que faz:**
- Fase 4: Propor 3 Soluções Diferentes (A, B, C)
- Comparação de Prós/Contras/Trade-offs
- Recomendação fundamentada
- **GATE 1**: Usuário escolhe solução

**Por que 3 soluções?** Força IA a pensar profundamente, não aceitar primeira ideia!

---

### **3️⃣ Risk Analysis** (Análise de Riscos) ⭐ NOVO!
📄 `add-feature-3-risk-analysis.md`

**O que faz:**
- Fase 5: Análise de Riscos Detalhada (técnicos, segurança, negócio)
- Fase 6: Estratégias de Mitigação
- Plano de Rollback
- **GATE 2**: Usuário aprova plano de riscos

**Por que separar riscos?** Análise profunda APÓS escolher solução!

---

### **4️⃣ Setup** (Preparação do Ambiente)
📄 `add-feature-4-setup.md`

**O que faz:**
- Fase 7: Checkpoint (Backup do banco)
- Fase 8: Sincronizar com Main (garantir código atualizado)
- Fase 9: Criar Branch Git **via script inteligente** (isolar mudanças)
  - Detecta automaticamente se há commits não mergeados
  - Oferece 3 opções de segurança
  - Mantém histórico em `.git/branch-history.log`

**⚠️ IMPORTANTE**: SEMPRE usar `./scripts/create-feature-branch.sh` (nunca `git checkout -b` manual).

**Saída:** Ambiente preparado com backup, branch criada com proteção contra perda de código

---

### **5️⃣ Implementation** (Código + TDD + Testes)
📄 `add-feature-5-implementation.md`

**O que faz:**
- Fase 10: Implementação (Código + TDD + Pequenos Diffs)
- Fase 11: Validação Automática (TypeScript, ESLint, Vitest, Build)
- Fase 12: Auto-Fix (se testes falharem)

**⚠️ IMPORTANTE:** NÃO comita ainda! Precisa de validação manual primeiro!

**Saída:** Código implementado e testes automáticos passando

---

### **6️⃣ User Validation** (Validação Manual) ⭐ NOVO!
📄 `add-feature-6-user-validation.md`

**O que faz:**
- Fase 13: **PARADA OBRIGATÓRIA** - Testar Manualmente
- Fase 14: Ciclo de Feedback (ajustes se necessário)
- **GATE 3**: Usuário confirma "funciona perfeitamente!"

**Por que CRÍTICO?** IA raramente acerta de primeira! Feedback do usuário é essencial!

---

### **7️⃣ Quality** (Code Review + Security)
📄 `add-feature-7-quality.md`

**O que faz:**
- Fase 15: Code Review Automatizado (OBRIGATÓRIO)
- Fase 16: Testes de Segurança (OBRIGATÓRIO)

**Saída:** Código revisado, seguro e aprovado

---

### **8️⃣ Meta-Learning** (Aprender ANTES de Documentar) ⭐ MOVIDO!
📄 `add-feature-8-meta-learning.md`

**O que faz:**
- Fase 17: Meta-Aprendizado (análise guiada de aprendizados)
- Fase 18: Identificar Documentação Necessária

**Por que ANTES de documentar?** Aprendizados frescos são incorporados na documentação!

---

### **9️⃣ Finalization** (Docs + Commit + Merge)
📄 `add-feature-9-finalization.md`

**O que faz:**
- Fase 19: Atualização de Documentação (incorporando aprendizados)
- Fase 20: Commit e Push
- Fase 21: Resumo e Métricas
- **⏸️ FIM DO WORKFLOW AUTOMÁTICO**
- Fase 22: Validação do Usuário (build produção - MANUAL)
- Fase 23: Merge na Main (MANUAL - COM APROVAÇÃO!)
- Fase 24: Pós-Merge

**Saída:** Feature completa, commitada e pronta para merge (quando usuário aprovar)

---

### **🔟 Template Sync** (Sincronização com Template Base) ⭐ NOVO!
📄 `add-feature-10-template-sync.md`

**O que faz:**
- Identificar melhorias genéricas aplicadas nesta feature
- Executar `./scripts/sync-to-template.sh`
- Sincronizar com `/Users/tiago/Projects/project-template`
- Documentar sincronização em `TEMPLATE_EVOLUTION.md`
- Fechar ciclo de melhoria contínua

**Por que NOVO?** Sistema bidirecional: Projeto → Template → Futuros Projetos herdam!

**Saída:** Template atualizado com melhorias genéricas (futuros projetos se beneficiam)

---

### **1️⃣1️⃣ VPS Deployment** (Deploy para Produção) ⭐ NOVO!
📄 `.windsurf/workflows/add-feature-11a-vps-deployment-prep.md`
📄 `.windsurf/workflows/add-feature-11b-vps-deployment-exec.md`
📄 `.windsurf/workflows/add-feature-11c1-vps-monitoring.md`
📄 `.windsurf/workflows/add-feature-11c2-vps-rollback-docs.md`

**O que acontece nestes workflows (4 partes)**:

**Parte A (Prep)**:
- Fase 24: Pré-Deploy Checklist (merge OK, build OK, security OK)
- Fase 25: Build e Validação Local (testar imagem antes de deploy)

**Parte B (Exec)**:
- Fase 26: Deploy para VPS (automático via script ou manual SSH)
- Fase 27: Validação Pós-Deploy (smoke tests, health checks)

**Parte 3a (Monitoring)**:
- Fase 28: Monitoramento (10min observando logs/métricas)
- Testes de carga paralelos
- Teste manual no browser

**Parte 3b (Rollback & Docs)**:
- Fase 29: Rollback (se necessário, script automático em 2-3min)
- Fase 30: Documentação do Deploy (atualizar deploy-history.md)

**Quando executar:**
- ✅ Feature modifica frontend/backend/infra
- ✅ Hotfix crítico
- ❌ Feature apenas docs/testes/scripts (pular este workflow)

**Entrada:** Feature mergeada na main, build testado
**Saída:** Aplicação deployada em produção VPS (https://life-tracker.stackia.com.br)

**Por que este workflow é NOVO?** Deployment automatizado e seguro com rollback rápido!

**Scripts disponíveis:**
- `./scripts/deploy-vps.sh production` - Deploy automático (5-7min)
- `./scripts/vps-rollback.sh production` - Rollback rápido (2-3min)
- `./scripts/vps-smoke-tests.sh production` - Validação pós-deploy

**Tempo estimado:** 15-20min (deploy + validação + monitoramento)

---

## 🚀 Como Usar?

### **Opção A: Chamar o Primeiro e Deixar Fluir (Recomendado)**

Basta chamar o primeiro workflow:

```
/add-feature-1-planning
```

**O resto flui automaticamente!** Cada workflow chama o próximo ao final. ✨

---

### **Opção B: Chamar Workflow Específico (Retomar)**

Se precisar retomar de uma etapa específica:

```
/add-feature-2-solutions   # Pular planejamento, ir direto para soluções
/add-feature-6-user-validation   # Retomar na validação manual
/add-feature-9-finalization   # Pular para documentação/commit
```

---

## 🎯 Fluxo Visual Completo

```
1️⃣  Planning → Entendimento + Docs existentes
          ↓ (automático)
2️⃣  Solution Design → 3 Soluções + Escolha (GATE 1) ⭐
          ↓ (automático)
3️⃣  Risk Analysis → Riscos + Mitigações (GATE 2) ⭐
          ↓ (automático)
4️⃣  Setup → Backup + Branch
          ↓ (automático)
5️⃣  Implementation → Código + TDD + Testes Auto
          ↓ (automático)
6️⃣  User Validation → PARADA! Usuário testa (GATE 3) ⭐
          ↓ (ciclo de feedback até aprovar)
7️⃣  Quality → Code Review + Security
          ↓ (automático)
8️⃣  Meta-Learning → Aprender ANTES de docs ⭐
          ↓ (automático)
9️⃣  Finalization → Docs + Commit + Push + Merge
          ↓ (PERGUNTA: Deploy VPS necessário?) ⭐
         / \
        /   \
     SIM   NÃO
      ↓     ↓
1️⃣1️⃣    🔟
VPS     Template
Deploy  Sync
```

---

## ⭐ Novidades desta Versão 2.0

### **3 GATEs de Aprovação do Usuário**
- **GATE 1**: Escolher solução (A, B ou C)
- **GATE 2**: Aprovar análise de riscos
- **GATE 3**: Confirmar validação manual ("funciona!")

### **Workflow 2 - Solution Design (NOVO!)**
- IA propõe 3 soluções diferentes
- Você escolhe a melhor
- Força IA a pensar profundamente

### **Workflow 3 - Risk Analysis (NOVO!)**
- Análise de riscos como etapa dedicada
- APÓS escolher solução
- Mitigações específicas

### **Workflow 6 - User Validation (NOVO!)**
- PARADA obrigatória para testar manualmente
- Ciclo de feedback iterativo
- IA aprende com suas correções
- **Nada é commitado sem sua aprovação!**

### **Workflow 8 - Meta-Learning (MOVIDO!)**
- Antes estava no final (Fase 14)
- Agora vem ANTES de documentar
- Aprendizados frescos são incorporados nos docs

---

## 💡 Benefícios do Sistema Modular

✅ **Automático**: Workflows se chamam sozinhos
✅ **Modular**: Cada arquivo < 12k caracteres (dentro do limite Windsurf)
✅ **Flexível**: Pode retomar de qualquer etapa
✅ **Organizado**: Fases agrupadas logicamente
✅ **Manutenível**: Editar só módulo relevante
✅ **Rastreável**: Git history mais limpo
✅ **Validação do Usuário**: IA raramente acerta de primeira!
✅ **Meta-Aprendizado**: Sistema evolui continuamente

---

## 📝 Notas Importantes

### **Workflow para na Fase 21 (Push)**
- Código está commitado e push feito
- MAS merge para `main` **NÃO é automático**
- Você decide quando fazer merge (Fase 23)

### **3 Momentos de Decisão do Usuário**
1. **GATE 1** (Workflow 2): Escolher solução (A, B, C)
2. **GATE 2** (Workflow 3): Aprovar análise de riscos
3. **GATE 3** (Workflow 6): Aprovar validação manual

### **Nada é commitado sem sua aprovação!**
- Código implementado (Workflow 5)
- Usuário testa e aprova (Workflow 6)
- Code Review + Security (Workflow 7)
- ENTÃO comita (Workflow 9)

---

## 🎉 Comece Agora!

Pronto para adicionar uma nova feature? Digite:

```
/add-feature-1-planning
```

E deixe o sistema guiar você pelo processo completo! ✨

---

## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural

---

**Última atualização**: 2025-11-01
**Versão**: 2.3 (Adicionado leitura obrigatória de PLAN.md e TASK.md)
**Autor**: Windsurf AI Workflow + Claude Code + Feedback do Usuário
