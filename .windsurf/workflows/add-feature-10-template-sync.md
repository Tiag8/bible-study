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

**Candidatos**: `scripts/*.sh` (sem lógica específica), `.windsurf/workflows/*.md`, `.claude/CLAUDE.md` (seções reutilizáveis), `AGENTS.md` (genéricas), `docs/adr/*.md`

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

**O script**:
1. Detecta mudanças em `.windsurf/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`
2. Apresenta lista com diff
3. Permite seleção (a=todos, n=nenhum, s=individual)
4. Copia para `/Users/tiago/Projects/project-template`
5. Oferece commit automático
6. Verifica: template path existe? arquivos mudaram? cria diretórios?

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