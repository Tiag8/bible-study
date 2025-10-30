---
description: Workflow Add-Feature (10/10) - Template Sync (Sincronização com Template Base)
---

# Workflow 10/10: Template Sync

Este é o **décimo e último workflow** de 10 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Identificar melhorias genéricas aplicadas nesta feature
- Sincronizar com project-template
- Documentar sincronização
- Fechar ciclo de melhoria contínua

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

**Candidatos automáticos para sincronização:**
- `scripts/*.sh` - Se não contém lógica específica do projeto
- `.windsurf/workflows/*.md` - Sempre genéricos (processos)
- `.claude/CLAUDE.md` - Seções reutilizáveis (ex: troubleshooting, comandos úteis)
- `AGENTS.md` - Seções genéricas (ex: coding style, git workflow)
- `docs/adr/*.md` - Padrões/decisões genéricas (ex: ADR sobre TypeScript any)

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

**O script faz:**

1. **Detecta mudanças** em caminhos sincronizáveis:
   - `.windsurf/workflows/`
   - `.claude/commands/`
   - `.claude/CLAUDE.md`
   - `scripts/`
   - `AGENTS.md`

2. **Apresenta lista** de arquivos modificados com diff

3. **Permite seleção:**
   - `a` - Sincronizar TODOS
   - `n` - NÃO sincronizar nenhum
   - `s` - Selecionar individualmente

4. **Copia arquivos** para `/Users/tiago/Projects/project-template`

5. **Oferece commit** automático no template:
   - Mensagem padrão: `meta: sincronizar melhorias do projeto`
   - Permite customizar mensagem

**Verificações automáticas do script:**
- ✅ Template path existe?
- ✅ Arquivos realmente mudaram (diff)?
- ✅ Criar diretórios se não existirem?

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

**Checklist de Validação:**
- [ ] Arquivos copiados corretamente?
- [ ] **SEM referências específicas** ao projeto original? (usar placeholders genéricos)
- [ ] **SEM secrets** ou dados sensíveis?
- [ ] **SEM hardcoded paths** específicos? (usar variáveis/placeholders)
- [ ] Comentários em português? (padrão)
- [ ] Código limpo e documentado?

**Exemplos de limpeza necessária:**

```bash
# ❌ RUIM - Específico do projeto
SUPABASE_URL="https://clteam.supabase.co"

# ✅ BOM - Genérico (placeholder)
SUPABASE_URL="${VITE_SUPABASE_URL}"

# ❌ RUIM - Path hardcoded
BACKUP_DIR="/Users/tiago/Projects/clteam/backups"

# ✅ BOM - Path relativo
BACKUP_DIR="./backups"
```

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

**Feature**: `feat/add-profit-cards`

**Melhoria aplicada**: `run-security-tests.sh` agora aceita path específico

**Sincronização:**

```bash
# 1. Identificar
git diff main scripts/run-security-tests.sh
# Mudança: Adicionado parâmetro opcional $1 para path

# 2. Executar sync
./scripts/sync-to-template.sh
# Selecionar: scripts/run-security-tests.sh

# 3. Validar no template
cd /Users/tiago/Projects/project-template
cat scripts/run-security-tests.sh
# ✅ Sem referências ao CLTeam

# 4. Documentar
# Atualizar TEMPLATE_EVOLUTION.md:
## v2.1 - 2025-10-28
### Script run-security-tests.sh melhorado
- Aceita path opcional para escanear apenas diretório/arquivo específico
- Uso: ./scripts/run-security-tests.sh src/hooks
```

### Exemplo 2: Workflow Atualizado

**Feature**: `feat/fix-pdf-export-layout`

**Melhoria aplicada**: Workflow 5 (Implementation) agora tem "Fase 5.4: Parsing de Dados com Estrutura Desconhecida"

**Sincronização:**

```bash
# 1. Identificar
git diff main .windsurf/workflows/add-feature-5-implementation.md
# Mudança: Adicionada Fase 5.4 (processo para parsing de dados desconhecidos)

# 2. Executar sync
./scripts/sync-to-template.sh
# Selecionar: .windsurf/workflows/add-feature-5-implementation.md

# 3. Validar no template
# ✅ Processo genérico (aplicável a qualquer projeto)

# 4. Documentar
## v2.1 - 2025-10-28
### Workflow 5 (Implementation) enriquecido
- Fase 5.4: Processo obrigatório para parsing de dados com estrutura desconhecida
- Impacto: Reduz iterações de 4+ para 1
```

---

## 🚀 Boas Práticas

### ✅ O QUE sincronizar

- Scripts automação (se genéricos)
- Processos/workflows (sempre genéricos)
- Padrões de código (sempre genéricos)
- ADRs de decisões reutilizáveis
- Troubleshooting genérico
- Comandos úteis genéricos

### ❌ O QUE NÃO sincronizar

- Lógica de negócio específica
- Schemas de banco específicos
- Configurações específicas do projeto
- Secrets/credenciais
- Dados de produção
- Features específicas do domínio

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

## 🎉 FIM DO WORKFLOW 10/10: TEMPLATE SYNC

**Parabéns! Você completou o workflow de adicionar uma nova funcionalidade!**

**O que foi conquistado:**
- ✅ Planejamento profundo (3 soluções)
- ✅ Análise de riscos (mitigações planejadas)
- ✅ Setup seguro (backup + branch)
- ✅ Implementação com TDD
- ✅ Validação manual (feedback iterativo)
- ✅ Code review + Security scan
- ✅ Meta-aprendizado (sistema evoluindo)
- ✅ Documentação atualizada
- ✅ Commits + Push
- ✅ **Template sincronizado (futuros projetos herdam!)** ⭐

**Próximo passo**: Iniciar próxima feature (começar do zero, Workflow 1)!

---

**Workflow criado em**: 2025-10-28
**Versão**: 1.0
**Autor**: Tiago + Claude Code + Windsurf AI
