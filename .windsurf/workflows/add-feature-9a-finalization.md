---
description: Workflow Add-Feature (9a/10) - Finalization Part A (Docs + Commit + Summary)
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

## 🧠 FASE 0: LOAD CONTEXT (Script Unificado)

**⚠️ USAR SCRIPT** (não Read manual):

```bash
./scripts/context-load-all.sh feat-nome-feature
```

**Output**: Resumo 6 arquivos .context/ (INDEX, workflow-progress, temp-memory, decisions, attempts.log, validation-loop).

**SE script falhar**: Fallback manual (Read 6 arquivos).

**Benefício**: Consolidated context loading vs manual Fase 0 (redução tempo).
---

## 📋 Fase 0.5: Usar Template Checklist (OBRIGATÓRIO)

**CRÍTICO**: Validação de documentação, commit e cleanup DEVEM usar formato padronizado.

### 0.5.1. Template Validation Checklist

**Localização**: `.windsurf/templates/validation-checklist-template.md`

**5 Elementos Obrigatórios**:
1. **Título numerado** (ex: "✅ 1. Docs atualizados")
2. **Cenário** (contexto - ex: "Validar docs refletem mudanças")
3. **Steps** (lista executável, verificações exatas)
4. **Validação** (checklist compliance, não subjetivo)
5. **Screenshots** (diffs, git log - OPCIONAL)

### 0.5.2. Como Usar

```bash
# 1. Abrir template
cat .windsurf/templates/validation-checklist-template.md

# 2. Copiar exemplo relevante para Workflow 9a (Finalization)

# 3. Adaptar para checklist de finalization

# 4. Executar ANTES de commit
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
# Validar cada item antes de marcar completo
```

### 0.5.3. Exemplo Workflow 9a

**Ver no template**: Seção "Workflow 9a (Finalization)" com 3 exemplos:
- Docs atualizados (PLAN, TASK, ADR, INDEX)
- Code Hygiene (limpeza pré-commit)
- Git commit compliance (Conventional Commits)

### 0.5.4. Anti-Patterns (EVITAR)

❌ **Validação vaga**: "Docs OK"
✅ **Validação específica**: "PLAN.md: Feature ✅ COMPLETO + TASK.md: todas checked + ADR criado"

❌ **Steps subjetivos**: "Revisar código"
✅ **Steps objetivos**: "./scripts/code-hygiene-scan.sh && verificar 0 temporários"

### 0.5.5. Benefícios

- **Zero débito técnico** (cleanup sistemático)
- **Rastreabilidade completa** (docs + commits alinhados)
- **Compliance garantido** (checklists previnem esquecimentos)

---

# Workflow 9a/10: Finalization Part A (Finalização - Parte A)

**Nono workflow** de 10 etapas modulares para adicionar funcionalidade.

**O que acontece (Parte A):**
- Fase 19: Atualização de Documentação
- Fase 20: Commit e Push
- Fase 21: Resumo e Métricas
- **⏭️ CONTINUAÇÃO AUTOMÁTICA para Parte 9b**

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo**.

**Benefícios**: 36x mais rápido, melhor cobertura, maior throughput.

**Exemplo**:
- Documentação + Commits: 2+ agentes paralelos
- Validação final: 3+ agentes (docs, código, build)
- Merge preparation: 2+ agentes (branch status, changelog)

---

## 🧹 Fase 18: Code Hygiene Check (PRÉ-COMMIT)

**OBRIGATÓRIO**: Executar limpeza de código antes de commit.

### 18.1 Executar Script Automático

```bash
./scripts/code-hygiene-scan.sh
```

**Se FALHAR** (exit code 1):
- [ ] Revisar relatório `hygiene-report.txt`
- [ ] Corrigir issues críticos (ver seção abaixo)
- [ ] Re-executar até PASSAR

### 18.2 Checklist Manual (após script passar)

**Importações**:
- [ ] Removeu imports não usados?
- [ ] Importações duplicadas eliminadas?
- [ ] Importações organizadas (terceiros → locais)?

**Código**:
- [ ] Removeu funções/variáveis não usadas?
- [ ] Removeu código comentado antigo?
- [ ] Removeu console.log/debug prints?
- [ ] Removeu TODOs resolvidos?

**Arquivos Temporários**:
- [ ] Arquivos `test-*.js` removidos?
- [ ] READMEs temporários (`README-test-*.md`) removidos?
- [ ] Screenshots de debug removidos?

**Formatação**:
- [ ] Código formatado (Prettier)?
```bash
npx prettier --write "src/**/*.{ts,tsx}"
npx eslint --fix "src/**/*.{ts,tsx}"
```

**Evidências Visuais (Opcional)**:
```bash
./scripts/validate-screenshot-gate.sh 9a
```

**Output**:
- ✅ Screenshots ANTES + DEPOIS → Adicionar PR description
- ⚠️ Screenshots faltando → Não bloqueante (recomendado para docs)

**Benefício**: PR reviewers veem mudanças visuais (não apenas código)

---

### 18.3 Correções Comuns

**Se script reportar issues**:

1. **Temp files**: Remover manualmente
```bash
find . -name "*.tmp" -o -name "*.bak" -o -name ".DS_Store" -delete
find scripts/ -name "test-*.js" -mtime +7 -delete
```

2. **Console.logs**: Buscar e remover
```bash
grep -rn "console\.\(log\|debug\)" src/ --exclude-dir=node_modules
```

3. **TODOs antigos**: Resolver ou criar issues
```bash
grep -rn "TODO\|FIXME" src/ | head -20
```

4. **Duplicação > 5%**: Refatorar código duplicado
```bash
npx jscpd src/ --threshold 5
```

### 18.4 Validação Final

**Checklist**:
- [ ] Script passou (exit code 0)
- [ ] Relatório sem ⚠️ críticos
- [ ] Build sem warnings (`npm run build`)
- [ ] Testes passando (`npm run test`)

**Regra**: "Limpar enquanto cozinha, não depois do jantar."

---

## ⏸️ Fase 18.5: Git Approval Checkpoint (Code Hygiene Commit)

**Code hygiene commit separado da feature**

### 18.5.1 Validação

- [ ] Apenas mudanças de limpeza? (imports, console.log, formatação)
- [ ] NENHUMA mudança de lógica?
- [ ] Mensagem: "chore(hygiene): ..." ou "style: ..."?

### 18.5.2 Template Checkpoint

```
✅ CODE HYGIENE COMMIT:
Arquivos: [listar apenas hygiene fixes]
Tipo: [imports removidos, console.logs, formatação]
Mensagem: chore(hygiene): remove unused imports and console.logs

⏸️ APROVAR commit code hygiene? (yes/no)
```

### 18.5.3 Decisão

**SE APROVADO**: Prosseguir Fase 19
**SE REJEITADO**: Separar melhor hygiene vs feature

---

## 📚 Fase 19: Atualização de Documentação

**IMPORTANTE**: Documentação incorpora aprendizados da Fase 17 (Meta-Learning).

### 19.1 Checklist de Documentação

#### ✅ Atualizar Mapa de Feature (se aplicável)

**Quando**: Adicionar/modificar componentes, hooks ou queries

**Arquivos**:
- `docs/features/stats.md` - Performance/stats
- `docs/features/makeup.md` - Gestão financeira
- Criar novo `.md` se feature totalmente nova

**O que documentar**:
- Componente: path, props, uso
- Hook: assinatura, query, propósito
- Database: tabelas, colunas, índices

#### ✅ Criar ADR (se decisão arquitetural)

**Quando**: Decisão técnica importante (biblioteca, padrão, performance)

**Arquivo**: `docs/adr/XXX-titulo-decisao.md`

**Template**: Ver `docs/adr/` (Status, Contexto, Decisão, Consequências, Alternativas)

#### ✅ Atualizar README.md (se necessário)

**Quando**: Feature nova, mudança setup, otimização

**Seções**:
- Funcionalidades Principais
- Stack Tecnológica
- Scripts Disponíveis
- Otimizações

#### ✅ Atualizar Regras de Negócio (se aplicável)

**Arquivo**: `docs/regras-de-negocio/calculo-de-performance.md`

**Quando**: Mudar fórmulas, pesos, lógica de cálculo

---

## 🚫 Fase 19.5: Git Approval Checkpoint (Push Feature Branch)

**Push de feature branch (pre-PR)**

### 19.5.1 Validação

- [ ] Todos commits locais incluídos?
- [ ] Quality gates passaram? (./scripts/run-tests.sh)
- [ ] Build sucesso? (npm run build)
- [ ] Nenhum TODO/FIXME crítico?

### 19.5.2 Template Checkpoint

```
🔴 PUSH FEATURE BRANCH:
Branch: feat/[feature-name]
Commits: [listar todos commits]
Quality Gates: [✅ tests, ✅ build, ✅ lint]

⚠️ Após push, PR poderá ser criada
⏸️ APROVAR push feature branch? (yes/no)
```

### 19.5.3 Decisão

**SE APROVADO**: Prosseguir Fase 20
**SE REJEITADO**: Corrigir issues localmente

---

## 💾 Fase 20: Commit e Push

```bash
./scripts/commit-and-push.sh "feat: descrição da feature"
```

Script cria múltiplos commits (tests → implementation → styles → docs). Push realizado! ✅

---

## 🚫 Fase 20.5: Git Approval Checkpoint (PR Creation)

**PR é operação pública (visibilidade externa)**

### 20.5.1 Validação

- [ ] Título PR descritivo?
- [ ] Body com Summary + Test Plan?
- [ ] Base branch correta? (main)
- [ ] Reviewers necessários identificados?

### 20.5.2 Template Checkpoint

```
🔴 CREATE PULL REQUEST:
Título: [PR title]
Base: main ← feat/[feature-name]
Commits: [X commits]
Files changed: [Y files]

Summary:
[mostrar summary gerado]

⚠️ PR será pública e notificará stakeholders
⏸️ APROVAR criação PR? (yes/no)
```

### 20.5.3 Decisão

**SE APROVADO**: Executar `gh pr create`
**SE REJEITADO**: Revisar título/descrição

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

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua do sistema.

**Objetivo**: Identificar melhorias nos workflows/scripts/processos.

### Questões de Reflexão (Responder TODAS)

**1. Eficiência do Workflow (Nota 1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Qual fase ineficiente? Como melhorar?
- [ ] Fase demorada? Qual? Por quê?

**2. Iterações com Usuário:**
- [ ] Número de iterações: __
- [ ] Se > 3: O que causou idas/vindas?
- [ ] Como tornar workflow mais autônomo?

**3. Gaps Identificados:**
- [ ] Validação faltou? (onde inserir checklist?)
- [ ] Gate falhou? (qual melhorar?)
- [ ] Comando repetido 3+ vezes? (automatizar?)

**4. Root Cause Analysis (se problema):**
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados? (causa raiz sistêmica, não sintoma)
- [ ] Afeta múltiplas features? (SE NÃO: descartar - não é sistêmico)
- [ ] Meta-learning previne recorrência?

### Ações de Melhoria (Se Aplicável)

**Documentação a atualizar:**
- [ ] Este workflow precisa melhorias? → Alterações necessárias
- [ ] CLAUDE.md precisa novo padrão? → Especificar
- [ ] Novo script útil? → Nome + função
- [ ] ADR necessário? → Decisão a documentar

**ROI Esperado:** [ex: "20min/feature" ou "Previne 2h debugging"]

### ⚠️ IMPORTANTE

- **Só documentar learnings SISTÊMICOS** (não pontuais)
- **Aplicar RCA obrigatoriamente** para validar se é sistêmico
- **Consolidação final** em Workflow 8a

### Validação de Tamanho do Workflow

```bash
# Se alterou workflow, validar tamanho
wc -c .windsurf/workflows/add-feature-9a-finalization.md
# ✅ Espera: < 12000 chars
# ❌ Se > 12000: Comprimir ou dividir
```

**Checklist de Otimização** (se > 11k chars):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists similares
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows (se > 12k)

---

## 🧠 Fase 21.5: Memory System Checklist

**CRÍTICO**: Verificar se learnings devem ser capturados em memória global.

### 21.5.1 Detecção de Keywords

**Verificar commit messages/branch por keywords**:
- `gemini, ai, tool` → memory/gemini.md
- `supabase, RLS, migration` → memory/supabase.md
- `deploy, docker, traefik` → memory/deployment.md
- `debug, bug, rca` → memory/debugging.md
- `whatsapp, webhook` → memory/uazapi.md
- `security, injection` → memory/security.md
- `git, commit, push` → memory/git.md
- `workflow, gate` → memory/workflow.md

### 21.5.2 Checklist Memory

- [ ] Keywords detectadas na feature/commits?
- [ ] Houve bug sistêmico resolvido (RCA 5 Whys)?
- [ ] Houve decisão arquitetural (ADR criado)?
- [ ] Houve meta-learning reutilizável?

**SE SIM (qualquer item)**:
```bash
# Executar extração de learning
/extract-learning
```

**SE NÃO**: Marcar "No learning this feature" e prosseguir.

### 21.5.3 Novo Domínio (Se Necessário)

**SE learning não cabe em domínio existente**:
```bash
~/.claude/scripts/sync-memory-domains.sh <novo-dominio> "<keywords>"
# Exemplo: sync-memory-domains.sh stripe "stripe|payment|checkout"
```

### 21.5.4 Validação

- [ ] Learning extraído (se aplicável)?
- [ ] MEMORY.md index atualizado?
- [ ] Commit local de memory? (aguarda aprovação push)

**Ref**: REGRA #20 (Memória Global), `/extract-learning` command

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

**Este workflow continua automaticamente em:**

→ [Workflow 9b - Retrospective RCA](.windsurf/workflows/add-feature-9b-retrospective.md)

**Próximas etapas:**
- Análise Root Cause retrospectiva
- Identificação de melhorias sistêmicas
- Consolidação de meta-learnings

*Workflow 9b deve ser iniciado automaticamente após conclusão desta parte.*

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

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 9a: Finalization Part A ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Documentação atualizada (features, ADRs, README, regras negócio)
  - Commits e push realizados (script commit-and-push.sh)
  - Resumo e métricas finalizadas
  - Meta-learning capturado
- **Outputs**:
  - Documentação sincronizada
  - Código commitado e pushed para branch
  - Resumo completo do que foi feito
- **Next**: Workflow 9b (RCA Retrospective)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 9a (Finalization Part A) concluído com sucesso.

**Documentação e commits finalizados**. Feature implementada e pushed para branch.

**Próximo passo**: Executar Workflow 9b (RCA Retrospective) para análise retrospectiva e identificação de melhorias sistêmicas.

---

## Próximos Passos

- [ ] Executar Workflow 9b (RCA Retrospective)
- [ ] RCA retrospectivo (5 Whys para tempo, qualidade, iterações, workflow)
- [ ] Consolidação de melhorias sistêmicas

---

## Decisões Pendentes

- [ ] Nenhuma (aguardando RCA 9b)

EOF

sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se decisão arquitetural documentada em ADR
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 9a - Finalization Part A
- **Decisão**: [Descrever decisão - ex: ADR criado para padrão X]
- **Por quê**: [Justificativa - ex: Decisão arquitetural importante]
- **Trade-off**: [Ex: +30min documentação, mas previne confusão futura]
- **Alternativas consideradas**: [Ex: Não documentar (rejeitado - perda conhecimento)]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 9a (Finalization Part A) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] FINALIZATION: Documentação + commits + push realizados" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + ações)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

### F.6. Cleanup .context/ (Opcional - Arquivar)

**⚠️ APENAS se feature está 100% completa e mergeada**:

```bash
# Se feature está 100% completa e mergeada
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
BACKUP_DIR=".context/.archive/$(TZ='America/Sao_Paulo' date '+%Y%m%d-%H%M%S')-${BRANCH_PREFIX}"

mkdir -p "$BACKUP_DIR"
mv .context/${BRANCH_PREFIX}_* "$BACKUP_DIR/"

echo "✅ Context arquivado em $BACKUP_DIR"
```

**Quando arquivar**:
- ✅ Feature mergeada em main
- ✅ Deploy realizado (se necessário)
- ✅ Validação produção OK
- ✅ Documentação completa

**Quando NÃO arquivar**:
- ❌ Feature ainda em branch (não mergeada)
- ❌ Aguardando validação
- ❌ Pode haver revisões/ajustes

---

## 🔄 VALIDATION LOOP (OBRIGATÓRIO - Workflows Iterativos)

**APLICÁVEL**: Se finalization envolve validação manual final ou ajustes pré-commit.

**Sistema**: Registrar iterações finais em `.context/{branch}_validation-loop.md`.

### Quando Usar

**Usar SE**:
- [ ] Code hygiene check falhou (iterações de limpeza)
- [ ] Documentação incompleta (ajustes iterativos)
- [ ] Commit/push com erros (re-tentativas)

**Criar Validation Loop** (SE aplicável):

```bash
BRANCH=$(git branch --show-current | sed 's/\//-/g')

cat > .context/${BRANCH}_validation-loop.md <<'EOF'
# Validation Loop - Workflow 9a (Finalization)

**Data Início**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
**Status**: 🔄 Em Progresso

## Iteração 1

**Fase**: [Code Hygiene / Docs / Commit]
**Issue**: [Descrição]
**Fix**: [Correção]
**Resultado**: ✅ | ❌

EOF
```

**Benefícios**: Finalization rastreável, zero erros de commit, validação completa.

**Ref**: Workflow 6a (aprovado), Paper GCC Oxford 2025

---

**Workflow criado em**: 2025-11-04
**Versão**: 3.2 (Git Approval Checkpoints)
**Autor**: Windsurf AI Workflow + Claude Code

---

## 📝 Changelog

**v3.2 (2025-11-18)**:
- ✅ Adicionadas 3 Git Approval Checkpoints (REGRA #23)
  - Fase 18.5: Code Hygiene Commit ⏸️
  - Fase 19.5: Push Feature Branch 🚫
  - Fase 20.5: PR Creation 🚫
- ✅ Renumeração de fases subsequentes
- ✅ Alinhamento com `~/.claude/CLAUDE.md` REGRA #23
- ✅ Alinhamento com `~/.claude/memory/git.md`

**v3.1 (2025-11-08)**:
- ✅ Otimização -47% (8.6k chars vs 14.9k anterior)
- ✅ Removido redundâncias e exemplos excessivos
- ✅ Consolidado checklists
- ✅ Comprimido meta-commentary
- ✅ TODAS funcionalidades críticas preservadas

**v3.0 (2025-11-04)**:
- ✅ Split de Workflow 9 em Parte A (9a) e Parte B (9b)
- ✅ Parte A: Docs + Commit + Summary (Fases 19-21)
- ✅ Continuidade automática para Parte B

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 11a/12] - Deploy ou Merge**: Feature finalizada → deploy para staging/prod ou merge para main.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| Retrospectiva necessária | 9b (Retrospective) | Feature complexa, lições a capturar |
| Pronto para deploy VPS | 11a (VPS Deployment Prep) | Deploy antes de merge |
| Apenas merge sem deploy | 12 (Merge to Main) | Feature não precisa deploy imediato |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| Docs incompletas | 8a (Meta-Learning) | Capturar learnings faltantes |
| Commit não atômico | 7a (Quality Gates) | Reorganizar commits |
| Tests falhando | 5a (Implementation) | Corrigir código |

### Regras de Ouro
- ⛔ **NUNCA pular**: Commit atômico com mensagem descritiva
- ⚠️ **Deploy sem staging**: SEMPRE testar em staging antes de prod
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto

