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

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler Context Files

```bash
BRANCH_PREFIX=$(git symbolic-ref --short HEAD 2>/dev/null | sed 's/\//-/g' || echo "main")

# 1. Guia
cat .context/INDEX.md

# 2. Progresso (verificar workflows 1-11 completos)
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 3. Estado (verificar branch pronta para merge)
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 4. Decisões (revisar decisões arquiteturais críticas)
cat .context/${BRANCH_PREFIX}_decisions.md

# 5. Histórico (últimas 30 linhas)
tail -30 .context/${BRANCH_PREFIX}_attempts.log
```

**Checklist Pré-Merge**:
- [ ] Li INDEX.md?
- [ ] Workflows 1-11 marcados como ✅ COMPLETO em workflow-progress.md?
- [ ] temp-memory.md indica "pronto para merge"?
- [ ] Decisões críticas em decisions.md validadas?
- [ ] Nenhum bloqueador em attempts.log?

**Se NÃO leu ou tem bloqueadores**: ⛔ PARAR e resolver ANTES de merge.

### 0.2. Log Início Workflow

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 12 (Merge to Main) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

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

**OBRIGATÓRIO**: Varredura final antes de merge.

```bash
./scripts/code-hygiene-scan.sh
```

**Validar**:
- [ ] Zero arquivos temporários
- [ ] Zero console.logs em src/ (produção)
- [ ] Duplicação < 5%
- [ ] Código formatado 100%
- [ ] TODOs < 20 (ou documentados em issues)

**Se FALHAR**: ⛔ **NÃO fazer merge até corrigir**.

#### Checklist Code Hygiene Final

**Arquivos de Teste**:
- [ ] Arquivos `test-*.js` temporários removidos?
- [ ] Scripts de debug em `scripts/` removidos?
- [ ] Dados de teste em `.sql` removidos?
- [ ] READMEs temporários (`README-test-*.md`) removidos?

**Código Limpo**:
- [ ] Console.logs de debug removidos?
- [ ] Comentários `// DEBUG:` removidos?
- [ ] TODOs resolvidos ou com issue vinculado?
- [ ] Código duplicado refatorado?

**Dependências**:
- [ ] Packages não usados removidos? (`npm prune`)
- [ ] Imports de dev não estão em produção?

**Dados Sensíveis**:
- [ ] `.env.example` atualizado?
- [ ] Nenhum secret hardcoded?
- [ ] Nenhum email/phone real em exemplos?

**Formatação**:
```bash
npx prettier --check "src/**/*.{ts,tsx}"
npx eslint "src/**/*.{ts,tsx}"
```

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

**Workflow criado em**: 2025-11-03
**Versão**: 1.0 (Novo workflow de merge)
**Autor**: Claude Code
