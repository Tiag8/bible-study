---
description: Workflow Add-Feature (12/12) - Merge to Main (Finalização Completa)
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

# Workflow 12/12: Merge to Main (Finalização Completa)

Este é o **décimo segundo e último workflow** de 12 etapas modulares para adicionar uma nova funcionalidade com segurança e qualidade.

**O que acontece neste workflow:**
- Verificação final de segurança antes do merge
- Merge da feature para main
- Validação pós-merge
- Limpeza de branches
- Ciclo completado

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

**Exemplo:**
- Fase 1 (Verificação Final): 3+ agentes validando código, testes e segurança em paralelo
- Fase 2 (Merge Preparation): 2+ agentes preparando merge e verificando conflitos
- Fase 3 (Validação Pós-Merge): 3+ agentes testando build, documentação e integridade
- Fase 4 (Limpeza): 2+ agentes sincronizando branches e removendo dados temporários

---

## 🎯 Objetivo

Finalizar completamente o ciclo de desenvolvimento de uma feature com merge seguro para main, validação completa e limpeza adequada.

---

## 📋 Fase 1: Verificação Final (Pré-Merge)

### 1.1 Checklist de Segurança

Antes de fazer merge, validar:

**Código:**
- [ ] Todos os testes passando (`npm run test`)
- [ ] Build de produção funciona (`npm run build`)
- [ ] Sem console errors em produção
- [ ] Sem warnings críticos

**Segurança:**
- [ ] Nenhum secret hardcoded
- [ ] Variáveis de ambiente corretas em `.env`
- [ ] RLS policies ativas (se banco de dados modificado)
- [ ] Nenhuma SQL injection possível

**Documentação:**
- [ ] README.md atualizado (se necessário)
- [ ] ADRs criados (se decisão arquitetural)
- [ ] Feature map atualizado (se novo componente)
- [ ] TASK.md marcado como completado

**Commits:**
- [ ] Mensagens de commit claras e em português
- [ ] Commits organizados logicamente (não amontoados)
- [ ] Sem commits acidentais (debug, temporários)

### 1.2 Verificar Status da Branch

```bash
# Ver status atual
git status

# Ver commits da feature (vs main)
git log main..HEAD --oneline

# Ver arquivos modificados
git diff main...HEAD --name-only

# Ver estatísticas
git diff main...HEAD --stat
```

**Esperado:**
- Branch local está à frente de main
- Todos os commits são relevantes
- Sem arquivos não commitados

---

## 📋 Fase 2: Preparação para Merge

### 2.1 Atualizar Main Localmente

```bash
# Garantir que main está atualizada
git checkout main
git pull origin main
```

**Resultado esperado:**
- [ ] main está sincronizada com remoto
- [ ] Sem mensagens de "behind" ou "ahead"

### 2.2 Verificar Conflitos (Antes de Fazer Merge)

```bash
# Simular o merge sem executar
git merge --no-commit --no-ff [nome-da-branch]

# Se houver conflitos, será mostrado aqui
# Cancelar merge:
git merge --abort
```

**Se houver conflitos:**
- Voltar para a feature branch
- Resolver conflitos localmente
- Testar novamente
- Fazer novo push

**Se sem conflitos:**
- Prosseguir para Fase 3

### 2.3 Atualizar PLAN.md e TASK.md

Antes do merge, atualizar documentação:

**`docs/TASK.md`:**
```markdown
- [x] Feature: Nome da Feature
  - [x] Implementação
  - [x] Testes
  - [x] Code Review
  - [x] Security Scan
  - [x] Documentação
  - [ ] Merge para main ← PRÓXIMO
```

**`docs/PLAN.md`:**
- Se houve mudança no roadmap estratégico, atualizar

---

## 📋 Fase 3: Merge para Main

### Opção A: Merge Direto (Projeto Solo)

**Para projetos solo ou sem necessidade de PR:**

```bash
# 1. Estar em main (atualizada)
git checkout main
git pull origin main

# 2. Fazer merge da feature
git merge --ff-only [nome-da-branch]

# ⚠️ Se tiver conflitos, resolver manualmente:
# git merge [nome-da-branch]
# [editar arquivos em conflito]
# git add .
# git commit -m "merge: resolver conflitos com main"

# 3. Push para remoto
git push origin main

# 4. Validar merge
git log main --oneline -5
```

**Checklist:**
- [ ] Merge executado sem erros
- [ ] Push realizado com sucesso
- [ ] `git log` mostra commits da feature em main

---

### Opção B: Pull Request (Projeto com Time)

**Para projetos com revisão de código:**

```bash
# Criar PR via GitHub CLI
gh pr create \
  --title "feat: descrição da feature" \
  --body "$(cat <<'EOF'
## 📝 Descrição
- O que foi implementado
- Problemas resolvidos
- Melhorias adicionadas

## ✅ Checklist
- [x] Testes passando
- [x] Build de produção OK
- [x] Code review aprovado
- [x] Security scan passou
- [x] Documentação atualizada

## 📊 Mudanças
- X arquivos modificados
- +YYY linhas adicionadas
- -ZZZ linhas removidas

## 🔗 Relacionados
- Fecha issue #123 (se aplicável)
- Depende de PR #456 (se aplicável)
EOF
)"
```

**Após aprovação:**
- Mergear via GitHub UI (Squash ou Merge commit)
- Ou via CLI: `gh pr merge [PR_NUMBER] --merge`

---

## 📋 Fase 4: Validação Pós-Merge

### 4.1 Verificar Integridade

```bash
# Pull main com merge realizado
git checkout main
git pull origin main

# Verificar commits
git log main --oneline -5

# Construir localmente
npm run build

# Verificar se build passa
npm run preview
```

**Esperado:**
- [ ] Build completa sem erros
- [ ] Preview funciona em http://localhost:4173
- [ ] Feature está visível/funcional em preview

### 4.2 Atualizar Documentação Pós-Merge

**`docs/TASK.md`:**
```markdown
- [x] Feature: Nome da Feature
  - [x] Implementação
  - [x] Testes
  - [x] Code Review
  - [x] Security Scan
  - [x] Documentação
  - [x] Merge para main ✅ 2025-11-03
```

**`docs/PLAN.md`:**
- Marcar feature como CONCLUÍDA no roadmap

---

## 📋 Fase 5: Limpeza de Branches

### 5.1 Deletar Branch Local

```bash
# Deletar branch feature localmente
git branch -d [nome-da-branch]

# Se houver erro, forçar delete:
git branch -D [nome-da-branch]
```

### 5.2 Deletar Branch Remota

```bash
# Deletar branch remota (GitHub)
git push origin --delete [nome-da-branch]
```

### 5.3 Limpar Branches Remotas Stale

```bash
# Atualizar lista de branches remotos
git fetch --prune
```

**Resultado esperado:**
- [ ] Branch feature deletada localmente
- [ ] Branch feature deletada no GitHub
- [ ] `git branch -a` não mostra branch antiga

---

## 📋 Fase 6: Próximas Ações

### Deploy para Produção?

**Pergunta crítica**: Esta feature modificou código/banco/infra visível para usuários?

**Opções:**
- `sim` → Executar **Workflow 11** (VPS Deployment) para deploy em produção
- `não` → Feature finalizada, sem necessidade de deploy imediato
- `staging` → Deploy para staging primeiro (testar com usuários reais)

### Verificar Nova Feature

**IMPORTANTE**: Sempre validar main após merge:

```bash
# Criar nova branch para próxima feature
./scripts/create-feature-branch.sh "proxima-funcionalidade"

# Branch herdará:
# ✅ Código da feature anterior (agora em main)
# ✅ Documentação atualizada
# ✅ Scripts mais recentes
```

---

## 🎉 Checklist Final - Feature Completada!

Antes de considerar a feature **completamente finalizada**, validar:

**Desenvolvimento:**
- [x] Planejamento (Workflow 1)
- [x] Design de Soluções (Workflow 2)
- [x] Análise de Risco (Workflow 3)
- [x] Setup (Workflow 4)
- [x] Implementação (Workflow 5)
- [x] Validação do Usuário (Workflow 6)
- [x] Quality Gates (Workflow 7)
- [x] Meta-Learning (Workflow 8)
- [x] Finalização (Workflow 9)
- [x] Template Sync (Workflow 10)
- [ ] Deploy (Workflow 11 - se necessário)

**Repositório:**
- [x] Merge realizado em main
- [x] Branch feature deletada
- [x] Documentação atualizada
- [x] TASK.md marcado como concluído
- [x] PLAN.md atualizado

**Monitoramento:**
- [ ] Usuários testaram em produção (se deploy)
- [ ] Nenhum bug crítico reportado
- [ ] Performance dentro dos limites
- [ ] Nenhuma regression detectada

---

## 🚀 Métricas da Feature

**Tempos estimados:**
- Workflow 1 (Planning): 20-30 min
- Workflow 2 (Solutions): 30-45 min
- Workflow 3 (Risk): 15-20 min
- Workflow 4 (Setup): 10-15 min
- Workflow 5 (Implementation): 1-3 horas
- Workflow 6 (User Validation): 30-60 min
- Workflow 7 (Quality): 20-30 min
- Workflow 8 (Meta-Learning): 15-20 min
- Workflow 9 (Finalization): 20-30 min
- Workflow 10 (Template Sync): 15-30 min
- Workflow 11 (Deployment): 15-30 min (se necessário)
- **Workflow 12 (Merge): 10-15 min** ← VOCÊ ESTÁ AQUI

**Total estimado**: 5-8 horas (simples) até 10-15 horas (complexa com deploy)

---

## 🔄 Se Precisar Reverter (Rollback)

**Se fez merge mas precisa reverter:**

### Opção 1: Revert (Seguro - Recomendado)

```bash
# Criar commit que desfaz a merge
git checkout main
git revert -m 1 HEAD
git push origin main

# ✅ Safe: Cria novo commit, não altera história
```

### Opção 2: Reset (Perigoso)

```bash
# ⚠️ CUIDADO: Altera história do repositório
git checkout main
git reset --hard HEAD~1
git push origin main --force  # Force push!
```

**Preferir Opção 1 (Revert)** - é mais seguro em projetos com time.

---

## 📚 Documentação de Referência

Para informações completas sobre workflows e processos:

- **Todos os workflows**: `.windsurf/workflows/`
- **Plano estratégico**: `docs/PLAN.md`
- **Tarefas em andamento**: `docs/TASK.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Branching workflow**: `docs/WORKFLOW_BRANCHES.md`

---

## 🎉 FIM DO WORKFLOW COMPLETO!

**Parabéns! Você completou todo o ciclo de 12 workflows!**

**Feature está:**
- ✅ Desenvolvida com excelência
- ✅ Testada completamente
- ✅ Documentada profundamente
- ✅ Mergeada em main com segurança
- ✅ Pronta para produção (se necessário)

**Próximo passo**: Iniciar próxima feature (começar do Workflow 1 novamente)!

---

**Workflow criado em**: 2025-11-03
**Versão**: 1.0 (Novo workflow de merge)
**Autor**: Claude Code
