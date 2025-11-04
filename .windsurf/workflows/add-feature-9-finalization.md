---
description: Workflow Add-Feature (9/10) - Finalization (Docs + Commit + Merge)
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

# Workflow 9/10: Finalization (Finalização)

Este é o **nono workflow** de 10 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 19: Atualização de Documentação
- Fase 20: Commit e Push
- Fase 21: Resumo e Métricas
- **⏸️ FIM DO WORKFLOW AUTOMÁTICO**
- Fase 22: Validação do Usuário (build produção - MANUAL)
- Fase 23: Merge na Main (MANUAL - COM APROVAÇÃO!)
- Fase 24: Pós-Merge
- Seção Informativa: Boas Práticas Git/GitHub

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

**Exemplo:**
- Documentação + Commits: 2+ agentes explorando paralelamente
- Validação final: 3+ agentes checando diferentes aspetos (docs, código, build)
- Merge preparation: 2+ agentes verificando branch status e changelog

---

## 📚 Fase 19: Atualização de Documentação

**IMPORTANTE**: A documentação é atualizada **incorporando aprendizados** da Fase 17 (Meta-Learning).

### 19.1 Checklist de Documentação

#### ✅ Atualizar Mapa de Feature (se aplicável)

**Quando**: Adicionar/modificar componentes, hooks ou queries em uma feature existente

**Arquivos**:
- `docs/features/stats.md` - Sistema de performance/stats
- `docs/features/makeup.md` - Gestão financeira
- Criar novo `.md` se for feature totalmente nova

**O que documentar**:
- Componente novo: path, props, uso
- Hook novo: assinatura, query, propósito
- Database: tabelas, colunas, índices

---

#### ✅ Criar ADR (se decisão arquitetural)

**Quando**: Decisão técnica importante (ex: escolher biblioteca, mudar padrão, performance)

**Arquivo**: `docs/adr/XXX-titulo-decisao.md` (XXX = número sequencial)

**Template**: Ver `docs/adr/` (template padrão ADR com Status, Contexto, Decisão, Consequências, Alternativas)

---

#### ✅ Atualizar README.md (se necessário)

**Quando**: Feature nova, mudança no setup, nova otimização

**Seções a considerar**:
- Funcionalidades Principais - Adicionar nova feature
- Stack Tecnológica - Nova dependência importante
- Scripts Disponíveis - Novo script criado
- Otimizações - Nova otimização implementada

---

#### ✅ Atualizar Regras de Negócio (se aplicável)

**Arquivo**: `docs/regras-de-negocio/calculo-de-performance.md`

**Quando**: Mudar fórmulas, pesos, lógica de cálculo

---

## 💾 Fase 20: Commit e Push

```bash
./scripts/commit-and-push.sh "feat: adicionar cards PROFIT (7/14/30/180d) no MakeUp"
```

Script cria múltiplos commits (TDD: tests → implementation → styles → docs). Push realizado! ✅

---

## 🎉 Fase 21: Resumo e Próximos Passos

### ✅ O que foi feito:
- [x] Backup criado
- [x] Branch Git criada
- [x] Código implementado com TDD
- [x] Usuário validou manualmente (2-4 iterações)
- [x] Code review aprovado
- [x] Security scan passou
- [x] Meta-aprendizado realizado
- [x] Documentação atualizada
- [x] Commits e push realizados

### 📊 Métricas:
- **Commits**: 8-15 commits pequenos ✅
- **Cobertura**: Testado manualmente com sucesso

---

## ⏸️ FIM DO WORKFLOW AUTOMÁTICO

**🎯 O workflow automático para aqui!**

Código está commitado e push feito para `feat/add-profit-cards-makeup`.

**⚠️ IMPORTANTE**: O merge para `main` **NÃO é automático**. Você decide quando fazer!

**As próximas fases são MANUAIS e opcionais:**

---

## 🧪 Fase 22: Validação do Usuário (build produção - MANUAL)

**Esta fase é MANUAL e OPCIONAL antes do merge!**

### Checklist de Testes Finais

Antes de fazer merge na main, recomenda-se testar build de produção:

```bash
npm run build
```

**Verificar**:
- [ ] Build completa sem erros
- [ ] Sem warnings críticos (chunk size OK)
- [ ] Bundle size aceitável

**Se build passar**:
```bash
npm run preview
```

Testar app no preview (http://localhost:4173):
- [ ] Feature funciona em build de produção
- [ ] Performance está OK
- [ ] Não há regressões

**Se tudo OK → Prossiga para Fase 23 (Merge).**

---

## 🔀 Fase 23: Merge na Main (APENAS COM SUA APROVAÇÃO!)

**⚠️ ATENÇÃO**: Esta fase só deve ser executada quando:
1. ✅ Você validou TUDO na Fase 22 (ou testou suficientemente)
2. ✅ Está 100% confiante que o código está pronto
3. ✅ Não há mais ajustes a fazer

### Opção A: Merge Direto

```bash
git checkout main
git pull origin main
git merge feat/add-profit-cards-makeup
git push origin main
git branch -d feat/add-profit-cards-makeup
```

### Opção B: Pull Request (com Time)

```bash
gh pr create --title "feat: adicionar cards PROFIT no MakeUp" \
  --body "## Mudanças\n- Implementado cards PROFIT\n## Testes\n- [x] Manual\n- [x] Build OK\n- [x] Code review OK"
```

### Opção C: Não Fazer Merge Ainda

Encontrou bugs ou precisa ajustes? Continue trabalhando na branch e repita validação.

---

## 🎉 Fase 24: Pós-Merge

Após merge, a main está atualizada. Para próxima feature:

```bash
./scripts/create-feature-branch.sh "proxima-funcionalidade"
```

Script automaticamente detecta commits não mergeados e oferece opções seguras. Ver `docs/WORKFLOW_BRANCHES.md`.

---

## 🚀 Próximo Passo: Deploy VPS?

**Pergunta OBRIGATÓRIA** (após merge na main):

Esta feature requer deploy para VPS?

**Opções:**
- `s` (sim) → Executar **Workflow 11** (VPS Deployment)
- `n` (não) → Pular para **Workflow 10** (Template Sync) - feature não requer deploy
- `staging` → Deploy apenas para staging (testar antes de produção)

**Quando responder "sim" (executar Workflow 11):**
- ✅ Feature modifica frontend (componentes, UI, hooks)
- ✅ Feature modifica backend (lógica, APIs, integrações)
- ✅ Feature modifica infra (Docker, Nginx, configurações)
- ✅ Hotfix crítico
- ✅ Mudança visível para usuários

**Quando responder "não" (pular Workflow 11):**
- ❌ Feature apenas de docs (README, ADRs, markdown)
- ❌ Feature apenas de testes (specs, test files)
- ❌ Feature apenas de scripts (automações locais)
- ❌ Refatoração interna sem mudança de comportamento
- ❌ Merge ainda não aprovado (aguardando review)

**Se responder "sim":**
```bash
# Acionar Workflow 11 (Parte A - Prep)
/add-feature-11a-vps-deployment-prep
```

**Nota**: Workflow 11 foi split em 3 partes (11a, 11b, 11c) para ficar dentro do limite de caracteres. Parte 11a chama 11b, que chama 11c automaticamente.

**Se responder "não":**
- Pular diretamente para Workflow 10 (Template Sync)
- Workflow de features termina aqui

**Se responder "staging":**
```bash
# Deploy staging para testes
./scripts/deploy-vps.sh staging

# Testar em staging antes de produção
# Deploy produção manualmente quando aprovado
```

---

## 🔄 Rollback (Se necessário)

Se fez merge mas precisa reverter:

```bash
# Opção 1: Revert (Seguro - cria commit novo)
git revert -m 1 HEAD && git push origin main

# Opção 2: Reset (Perigoso - force push)
git reset --hard HEAD~1 && git push origin main --force

# Opção 3: Banco de dados
./scripts/restore-supabase.sh backups/backup-YYYYMMDD-HHMMSS.sql
```

---

## 📝 Resumo

- **Status**: ⏸️ Aguardando merge manual (Fase 23)
- **Lembretes**: Fase 22 é opcional. Fase 23 precisa SUA aprovação. Main sempre funcional!

---

## 🎉 FIM DO WORKFLOW ADD-FEATURE!

Parabéns! Completou: planejamento, implementação TDD, validação, code review, documentação, commits.

**Próximo passo**: Iniciar próxima feature (Workflow 1) ou fazer deploy (Workflow 11).

---

**Workflow criado em**: 2025-10-27
**Versão**: 2.0 (Modular + Validação do Usuário + Meta-Learning)
**Autor**: Windsurf AI Workflow + Claude Code
