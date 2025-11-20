---
description: Workflow Add-Feature (10/10) - Template Sync (Sincronização com Template Base)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas
- `README.md`, `AGENTS.md`, `.windsurf/workflows`, `docs/`, `scripts/`

---

# Workflow 10/11: Template Sync

Este é o **décimo e último workflow** de 11 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Identificar melhorias genéricas aplicadas nesta feature
- Sincronizar com project-template
- Documentar sincronização

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

**Exemplo**: FASE 1 (3+ agentes), FASE 2 (template + validação), FASE 3 (secrets, paths), FASE 4 (docs)

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler Context Files

```bash
BRANCH_PREFIX=$(git symbolic-ref --short HEAD 2>/dev/null | sed 's/\//-/g' || echo "main")

# 1. Guia
cat .context/INDEX.md

# 2. Progresso (verificar workflows 1-9 completos)
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 3. Estado (verificar branch ready for template sync)
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 4. Decisões (revisar decisões de sincronização)
cat .context/${BRANCH_PREFIX}_decisions.md

# 5. Histórico (últimas 30 linhas)
tail -30 .context/${BRANCH_PREFIX}_attempts.log
```

**Checklist Pré-Template Sync**:
- [ ] Li INDEX.md?
- [ ] Workflows 1-9 marcados como ✅ COMPLETO em workflow-progress.md?
- [ ] temp-memory.md indica "pronto para template sync"?
- [ ] Decisões críticas em decisions.md validadas?
- [ ] Nenhum bloqueador em attempts.log?

**Se NÃO leu ou tem bloqueadores**: ⛔ PARAR e resolver ANTES de sync.

### 0.2. Log Início Workflow

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 10 (Template Sync) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🎯 Objetivo

Sincronizar melhorias genéricas aplicadas nesta feature com o `project-template`, garantindo que **futuros projetos herdem automaticamente os aprendizados** deste projeto.

**Sistema de Melhoria Contínua Bidirecional:**
```
Projeto Atual → Aprende → Aplica melhorias → Sincroniza com Template → Futuros Projetos herdam
```

---

## 📋 Quando Executar

**SEMPRE** ao final de cada feature (após Etapa 9), especialmente quando houve melhorias em:

- **Scripts** (`.sh`) - Automações reutilizáveis
- **Workflows** (`.windsurf/workflows/*.md`) - Processos genéricos
- **Documentação** (`.claude/CLAUDE.md`, `AGENTS.md`) - Contexto reutilizável
- **ADRs** (`docs/adr/*.md`) - Decisões arquiteturais genéricas
- **Padrões de código** - Soluções reutilizáveis

---

## 🔄 Processo Executável

### FASE 1: Identificar Melhorias Genéricas

**Analisar commits da feature atual:**

```bash
# Ver diff desde main
git diff main...HEAD --name-only

# Ver commits da branch
git log main..HEAD --oneline
```

**Candidatos**: `scripts/*.sh` (sem lógica específica), `.windsurf/workflows/*.md`, `.claude/agents/*.md` (genéricas), `.claude/commands/*.md`, `.claude/CLAUDE.md` (seções reutilizáveis), `AGENTS.md`, `docs/adr/*.md`

---

### FASE 1.5: Auditoria Multi-Categoria (3+ Agentes Paralelos)

**CRÍTICO**: Executar auditoria estrutural ANTES de sync.

```bash
# Usar Task tool com 3-4 agentes paralelos
```

**Agentes**:
1. Workflows: Detectar duplicatas + obsoletos + novos
2. Scripts: Listar genéricos (validate-*, context-*, deploy-*)
3. .claude/: Agentes/commands genéricos
4. docs/: ADRs/guides genéricos (sem específicos projeto)

**Output esperado**:
- ADD: Lista arquivos novos
- DELETE: Lista obsoletos
- UPDATE: Lista desatualizados (diff bytes)
- SKIP: Lista específicos (não sync)

**Perguntar ao usuário:**

```
🔄 Melhorias aplicadas nesta feature:
1. Script X melhorado (motivo)
2. Workflow Y atualizado (motivo)
3. Documentação Z enriquecida (motivo)

Sincronizar com project-template? (sim/não/escolher)
```

**Opções:**
- `sim` → Sincronizar TODAS as melhorias genéricas
- `não` → Pular sincronização (feature específica do projeto)
- `escolher` → Selecionar individualmente

---

### FASE 2: Executar Script de Sincronização

**Executar:**

```bash
./scripts/sync-to-template.sh
```

**O script v2.0**:
1. ✅ Backup automático (`.backup-YYYYMMDD/`)
2. ✅ Cleanup duplicatas workflows (número inteiro → deletar)
3. ✅ Detecta mudanças (diff multi-categoria)
4. ✅ Apresenta lista categorizada (ADD/DELETE/UPDATE/SKIP)
5. ✅ Permite seleção (a/n/s)
6. ✅ Copia + sobrescreve template
7. ✅ Validação estrutural (diff vazio = sucesso)
8. ✅ Oferece commit automático

---

### FASE 3: Validação (Pós-Sincronização)

**Verificar no template:**

```bash
cd /Users/tiago/Projects/project-template

# Ver arquivos copiados
git status

# Ver diff dos arquivos
git diff

# Verificar conteúdo
cat scripts/[arquivo-sincronizado].sh
```

**Checklist**: Arquivos copiados? Sem referências específicas? Sem secrets? Sem paths hardcoded? Código limpo?

**Exemplos**: SUPABASE_URL="${VITE_SUPABASE_URL}" (genérico, não hardcoded), BACKUP_DIR="./backups" (relativo)

---

### FASE 3.5: Validação Estrutural (OBRIGATÓRIA)

**SEMPRE executar**:

```bash
# 1. Workflows estrutura idêntica
diff <(ls -1 /Users/tiago/Projects/life_tracker/.windsurf/workflows/add-feature-*.md | xargs -n1 basename | sort) \
     <(ls -1 /Users/tiago/Projects/project-template/.windsurf/workflows/add-feature-*.md | xargs -n1 basename | sort)

# Diff VAZIO = ✅ | Diff NÃO VAZIO = ❌
```

**Se falhar**: Investigar diferenças, corrigir, re-executar sync.

---

### FASE 4: Documentar Sincronização

**Atualizar `project-template/docs/TEMPLATE_EVOLUTION.md`:**

```markdown
## v[X.Y] - 2025-10-28

### 🔄 Melhorias Sincronizadas do [Nome do Projeto]

**Origem**: feat/add-[feature-name]

**Melhorias aplicadas:**
1. **Script X melhorado** - [Motivo da melhoria]
   - Arquivo: `scripts/X.sh`
   - Mudança: [Breve descrição]

2. **Workflow Y atualizado** - [Motivo da melhoria]
   - Arquivo: `.windsurf/workflows/Y.md`
   - Mudança: [Breve descrição]

3. **Documentação Z enriquecida** - [Motivo da melhoria]
   - Arquivo: `.claude/CLAUDE.md`
   - Seção: [Nome da seção]
   - Mudança: [Breve descrição]

**Métricas:**
- Scripts: X → X+1
- Workflows: Y → Y+1
- Linhas de documentação: +ZZZ

**Impacto:**
- Futuros projetos herdarão [benefício específico]
- Redução de [problema específico]
```

**Commit no template:**

```bash
cd /Users/tiago/Projects/project-template

git add docs/TEMPLATE_EVOLUTION.md
git commit -m "meta: documentar sincronização v[X.Y] do [projeto]"
```

---

## ✅ Checklist Executável

Antes de marcar Etapa 10 como completa:

- [ ] Analisei commits e identifiquei melhorias genéricas (0 ou 1+)
- [ ] **SE houve melhorias genéricas:**
  - [ ] Executei `./scripts/sync-to-template.sh`
  - [ ] Selecionei arquivos apropriados (todos/nenhum/individual)
  - [ ] Validei arquivos no template:
    - [ ] Sem referências específicas do projeto original
    - [ ] Sem secrets/dados sensíveis
    - [ ] Sem paths hardcoded
  - [ ] Atualizei `TEMPLATE_EVOLUTION.md` no template
  - [ ] Commitei mudanças no template
- [ ] **SE não houve melhorias genéricas:**
  - [ ] Marquei "Nenhuma melhoria genérica nesta feature"
- [ ] Marcar como `completed` no TodoWrite

---

## 🔄 Sistema Auto-Evolutivo

**Como o sistema funciona:**

```
Feature N (Projeto A):
  └─ Detecta gap → Aplica melhoria local → Sincroniza com Template

Template:
  └─ Recebe melhoria → Documenta em EVOLUTION.md

Feature M (Projeto B - novo projeto):
  └─ Inicia com Template atualizado → JÁ TEM melhoria → Zero retrabalho

Feature N+1 (Projeto A - próxima feature):
  └─ Detecta novo gap → Aplica nova melhoria → Sincroniza novamente → Ciclo continua
```

**Resultado após 10 execuções:**
- Template tem 10x mais conhecimento
- Scripts otimizados com aprendizados reais
- Workflows refinados com padrões validados
- Documentação enriquecida com troubleshooting real
- **Futuros projetos começam 10x mais maduros**

---

## 🎯 Exemplos Práticos

### Exemplo 1: Script Melhorado

`run-security-tests.sh` agora aceita path. Sincronizar: `./scripts/sync-to-template.sh` → selecionar script → validar sem referências ao projeto → atualizar TEMPLATE_EVOLUTION.md

### Exemplo 2: Workflow Atualizado

Workflow 5 (Implementation) com "Fase 5.4: Parsing". Sincronizar: diff → sync → validar genérico → documentar

---

## 🚀 Boas Práticas

### ✅ Sincronizar

Scripts automação, processos/workflows, padrões de código, ADRs reutilizáveis, troubleshooting, comandos úteis

### ❌ NÃO sincronizar

Lógica de negócio, schemas específicos, configurações, secrets/credenciais, dados de produção, features do domínio

---

## 💡 Dicas

### Identificar se melhoria é genérica

**Perguntas-chave:**

1. **Esta melhoria serve para QUALQUER projeto?**
   - SIM → Sincronizar
   - NÃO → Pular

2. **Esta melhoria contém lógica/dados específicos do projeto?**
   - SIM → Não sincronizar (ou limpar antes)
   - NÃO → Sincronizar

3. **Futuros projetos se beneficiariam desta melhoria?**
   - SIM → Sincronizar
   - NÃO → Pular

### Quando pular sincronização

- Feature 100% específica do domínio
- Nenhum script/workflow foi modificado
- Mudanças apenas em código de negócio
- Projeto experimental/descartável

---

## 📊 Métricas de Sucesso

**KPIs do Sistema:**

- **Taxa de sincronização**: % features que sincronizam melhorias
  - Meta: >30% (1 em 3 features contribui para template)

- **Redução de retrabalho**: Menos fixes em projetos novos
  - Meta: Fix ratio cai de 0.3 → 0.1 em projetos novos

- **Velocidade de setup**: Tempo para iniciar novo projeto
  - Meta: Reduzir de 2h → 30min (template maduro)

- **Reutilização de código**: % código vindo do template
  - Meta: >40% do código base vem do template

---

---

## 📊 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 10: Template Sync ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Análise de melhorias genéricas (diff main...HEAD)
  - Identificação de candidatos (scripts, workflows, docs, ADRs)
  - Sincronização com project-template (./scripts/sync-to-template.sh)
  - Validação no template (sem secrets, paths relativos, código limpo)
  - Documentação em TEMPLATE_EVOLUTION.md
- **Outputs**:
  - Melhorias sincronizadas: [Listar arquivos sincronizados ou "Nenhuma"]
  - Template atualizado: $([ -d /Users/tiago/Projects/project-template ] && echo "✅ Sincronizado" || echo "⚠️ Template path não encontrado")
  - TEMPLATE_EVOLUTION.md documentado
- **Decisão**: [Sincronizou tudo/seleção individual/nenhuma melhoria genérica]
- **Next**: Workflow 12 (Merge to Main) ou Workflow 11a-c (se deploy VPS)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

✅ **TEMPLATE SYNCHRONIZED**

Workflow 10 (Template Sync) concluído.

**Status Final**:
- ✅ Planning (Workflow 1)
- ✅ Solutions Design (Workflow 2a/2b)
- ✅ Risk Analysis (Workflow 3)
- ✅ Pre-Implementation Gates (Workflow 4.5)
- ✅ Implementation (Workflow 5a)
- ✅ User Validation (Workflow 6a)
- ✅ Quality Gates (Workflow 7a)
- ✅ Meta-Learning (Workflow 8a)
- ✅ Clean Commit (Workflow 9a)
- ✅ **Template Sync (Workflow 10)** ← **SINCRONIZADO**

**Template Sync Status**: [SINCRONIZADO / NENHUMA MELHORIA GENÉRICA]

**Próximo passo**: Workflow 12 (Merge to Main) ou Workflow 11a (se deploy VPS necessário)

## Bloqueios/Questões

- Nenhum bloqueio após template sync
EOF

sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisão Tomada)

**SE houve decisão de sincronização (tudo/seleção/nenhuma)**:

```bash
# Exemplo: Se decisão de sincronizar scripts específicos foi tomada
cat >> .context/${BRANCH_PREFIX}_decisions.md <<'EOF'

---

## Decisão: Template Sync Strategy

**Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
**Contexto**: Workflow 10 - Identificadas melhorias genéricas em scripts/workflows/docs
**Decisão**: [SINCRONIZAR TUDO / SELEÇÃO INDIVIDUAL / NENHUMA]

**Arquivos Sincronizados** (se aplicável):
- scripts/[arquivo].sh - [Motivo da melhoria]
- .windsurf/workflows/[workflow].md - [Motivo da melhoria]
- .claude/CLAUDE.md (seção [X]) - [Motivo da melhoria]

**Impacto**:
- Template project-template agora inclui [melhorias]
- Futuros projetos herdarão automaticamente [benefícios]
- Redução de [problema específico] em projetos novos

**Alternativas Consideradas**:
- Não sincronizar: Descartado (melhorias são genéricas)
- Sincronizar apenas X: Descartado (Y também é reutilizável)

**Referências**: TEMPLATE_EVOLUTION.md v[X.Y]
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 10 (Template Sync) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ✅ TEMPLATE SYNC: [Status - sincronizado/nenhuma melhoria]" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] PRÓXIMO PASSO: Workflow 12 (Merge to Main)" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md com status de sincronização?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão de sync foi tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + status sync)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

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

## 🎉 FIM DO WORKFLOW 10/10: TEMPLATE SYNC

**Parabéns! Você completou o workflow de adicionar uma nova funcionalidade!**

Conquistado: Planejamento, análise de riscos, setup, TDD, validação, code review, security, meta-aprendizado, docs, commits, **template sincronizado!**

**Próximo**: Iniciar próxima feature (Workflow 1)

---

**Workflow criado em**: 2025-10-28 | **Versão**: 1.0


## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural

---