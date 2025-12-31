---
description: Workflow Add-Feature (12/12) - Merge to Main (Finalização Completa)
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

## 🎯 Objetivo

Finalizar completamente o ciclo de desenvolvimento de uma feature com merge seguro para main, validação completa e limpeza adequada.

---

## 🧠 FASE 0: LOAD CONTEXT

```bash
./scripts/context-read-all.sh  # Lê todos arquivos .context/
```

**Checklist Pré-Merge**: Workflows 1-11 ✅? temp-memory "pronto para merge"? Sem bloqueadores?

**Se bloqueadores**: ⛔ PARAR e resolver ANTES de merge.

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

### 1.2 Code Hygiene Final Scan

```bash
./scripts/code-hygiene-scan.sh
```

**Validar**: Zero arquivos temp, Zero console.logs, Duplicação < 5%, TODOs < 20

**Se FALHAR**: ⛔ NÃO fazer merge até corrigir.

### 1.3 Verificar Status da Branch

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
- **Code hygiene passou**

---

## 📋 Fase 1.5: Git Approval Checkpoint (Checkout Main) ⏸️

**Main é protected branch (modificações requerem cautela)**

**Validação:**
- [ ] Feature branch 100% pronta? (PR aprovada?)
- [ ] Commits locais todos pushed?
- [ ] Working directory limpo? (git status)
- [ ] Nenhum WIP/TODO crítico?

**Template Checkpoint:**
```
⚠️ CHECKOUT MAIN BRANCH:
Current: feat/[feature-name]
Target: main (protected)
Status: [git status output]

⏸️ APROVAR checkout main? (yes/no)
```

**SE APROVADO**: `git checkout main`
**SE REJEITADO**: Finalizar trabalho na feature branch

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

## 📋 Fase 2.5: Git Approval Checkpoint (Merge to Main) 🚫

**Merge to main é IRREVERSÍVEL (afeta todos devs)**

**Validação CRÍTICA:**
- [ ] PR aprovada por reviewers?
- [ ] CI/CD passou 100%?
- [ ] Conflicts resolvidos?
- [ ] Merge message descritiva?
- [ ] Main branch atualizada? (git pull)

**Template Checkpoint:**
```
🔴 MERGE TO MAIN:
Source: feat/[feature-name]
Target: main
Strategy: [--no-ff / fast-forward]
Conflicts: [none / resolved]

Merge Message:
[mostrar mensagem gerada]

⚠️ OPERAÇÃO IRREVERSÍVEL (afeta main branch)
⏸️ APROVAR merge? (yes/no)
```

**SE APROVADO**: Executar `git merge`
**SE REJEITADO**: Corrigir issues e repetir validação

**BLOQUEIO**: Se CI/CD falhou ou conflicts, NUNCA merge

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

```bash
gh pr create --title "feat: descrição" --body "Ver .github/PULL_REQUEST_TEMPLATE.md"
# Após aprovação: gh pr merge [PR_NUMBER] --merge
```

---

## 📋 Fase 3.5: Git Approval Checkpoint (Push Main) 🚫

**Push main é público (dispara CI/CD, notifica equipe)**

**Validação:**
- [ ] Merge local 100% sucesso?
- [ ] Nenhum erro de merge?
- [ ] Tests passaram localmente?
- [ ] Build sucesso?

**Template Checkpoint:**
```
🔴 PUSH MAIN TO REMOTE:
Branch: main
Commits: [listar novos commits]
Tests: [✅ passed]
Build: [✅ success]

⚠️ DISPARA CI/CD + NOTIFICA EQUIPE
⏸️ APROVAR push main? (yes/no)
```

**SE APROVADO**: `git push origin main`
**SE REJEITADO**: Rollback merge (`git reset --hard HEAD~1`)

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

## 📋 Fase 4.5: Git Approval Checkpoint (Delete Remote Branch) ⏸️

**Deleção de branch é irreversível (perda histórico)**

**Validação:**
- [ ] Merge 100% sucesso?
- [ ] Push main completo?
- [ ] PR fechada/merged?
- [ ] Nenhum trabalho pendente na branch?

**Template Checkpoint:**
```
⚠️ DELETE REMOTE BRANCH:
Branch: feat/[feature-name]
Status: [merged to main]
PR: [closed]

⏸️ APROVAR delete remote branch? (yes/no)
```

**SE APROVADO**: `git push origin --delete feat/[name]`
**SE REJEITADO**: Manter branch (pode ter trabalho pendente)

**NOTA**: Branch local pode ser mantida para referência

---

## 📋 Fase 5: Limpeza de Branches

**⚠️ EXECUTAR APENAS APÓS**:
- ✅ Merge completo em main
- ✅ Push origin main sucesso
- ✅ Deploy completo (Workflow 11)
- ✅ Post-deploy validation OK (Workflow 13)

### 5.1 Deletar Branch Local

```bash
# 1. Verificar branch foi mergeada
git branch --merged main | grep [nome-da-branch]

# 2. SE mergeada: Deletar branch local
git branch -d [nome-da-branch]

# Se houver erro (não mergeada mas ok deletar):
git branch -D [nome-da-branch]
```

**Output esperado:**
```
Deleted branch [nome-da-branch] (was 337886a).
```

**Por quê AGORA?**:
1. ✅ Branch já mergeada (commits em main)
2. ✅ Deploy completo (Workflow 11)
3. ✅ Branch não mais necessária
4. ✅ SE precisar: `git checkout -b [nome-da-branch] 337886a` (reversível)

**⚠️ NÃO deletar SE**:
- ❌ Deploy falhou (pode precisar rollback)
- ❌ Merge conflitos não resolvidos
- ❌ Ainda em staging (não production)

### 5.2 Deletar Branch Remota (OPCIONAL)

```bash
# Deletar branch remota (GitHub/GitLab)
git push origin --delete [nome-da-branch]
```

**Exceção Branch Remota**:
- `git push origin --delete` é **OPCIONAL**
- Manter remota OK (histórico, PRs)
- Deletar remota SE: branch foi pushed E não tem PR aberto

### 5.3 Limpar Branches Remotas Stale

```bash
# Atualizar lista de branches remotos
git fetch --prune
```

**Resultado esperado:**
- [ ] Branch feature deletada localmente
- [ ] Branch feature deletada no GitHub (opcional)
- [ ] `git branch -a` não mostra branch antiga
- [ ] Reversível via git checkout -b

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

## 📊 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 12: Merge to Main ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Code review final (todos conflitos resolvidos)
  - Validação RLS policies (merge-safe)
  - Database migrations review (sem conflicts)
  - Documentação atualizada (TASK.md, PLAN.md, ADRs)
  - Branch merge para main (squash/rebase aplicado)
  - CI/CD pipeline verde (tests + security + lint OK)
  - Limpeza branches temporárias
- **Outputs**:
  - Feature mesclada em main com sucesso
  - Merge commit hash: $(git log main --oneline -1 | awk '{print $1}')
  - Documentação sincronizada (TASK.md ✅, PLAN.md ✅)
  - CI/CD aprovado (0 bloqueadores)
  - Branch feature deletada
- **Next**: Workflow 13a (Post-Deploy Validation) ou Workflow 1 (próxima feature)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

✅ **FEATURE MERGED TO MAIN**

Workflow 12 (Merge to Main) concluído com sucesso.

**Status Final**:
- ✅ Planning (Workflow 1)
- ✅ Solutions Design (Workflow 2a/2b)
- ✅ Risk Analysis (Workflow 3)
- ✅ Setup (Workflow 4)
- ✅ Pre-Implementation Gates (Workflow 4.5)
- ✅ Implementation (Workflow 5a/5b)
- ✅ User Validation (Workflow 6a/6b)
- ✅ Quality Gates (Workflow 7a/7b)
- ✅ Meta-Learning (Workflow 8a/8b)
- ✅ Finalization (Workflow 9a/9b)
- ✅ Template Sync (Workflow 10)
- ✅ **Merge to Main (Workflow 12)** ← **MERGED**

**Merge Status**: ✅ MAIN BRANCH (feature mesclada, código sincronizado)

**Próximo passo**: Deploy para produção (Workflow 13a - Post-Deploy Validation)

---

## Próximos Passos

- [ ] Deploy para produção (Workflow 13a se deploy necessário)
- [ ] OU iniciar próxima feature (Workflow 1)
- [ ] Comunicar time sobre merge bem-sucedido

---

## Decisões Pendentes

- [ ] Deploy imediato ou aguardar? (validar com PO/Tech Lead)

EOF

sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisão Tomada)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se decisão sobre merge strategy foi tomada
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 12 - Merge to Main
- **Decisão**: Feature mesclada para main com sucesso
- **Por quê**: Code review aprovado, conflitos resolvidos, CI/CD verde
- **Trade-off**: N/A
- **Alternativas consideradas**: Aguardar mais testes (rejeitado - gates passaram)
- **Merge Strategy**: $(git log --oneline -1 main | grep -q "Merge" && echo "Merge commit" || echo "Squash/Rebase")
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 12 (Merge to Main) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ✅ MERGE OK: Feature mesclada em main ($(git log main --oneline -1 | awk '{print $1}'))" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] PRÓXIMO PASSO: Deploy em produção (Workflow 13a) ou próxima feature (Workflow 1)" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md com merge commit hash?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se merge strategy decision tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + merge hash)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🔄 Rollback (Se Necessário)

```bash
# Revert seguro (recomendado)
git checkout main && git revert -m 1 HEAD && git push origin main
```

Ver `docs/ops/ROLLBACK-GUIDE.md` para detalhes.

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

**Regra**: ANTI-ROI - NUNCA calcular tempo/ROI. Ver `~/.claude/rules/08-communication.md` REGRA #7.

---

**Versão**: 1.1 | **Atualizado**: 2025-12-26
