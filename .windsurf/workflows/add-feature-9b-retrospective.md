---
description: Workflow Add-Feature (9b/10) - Finalization Part B (RCA Retrospective)
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 9a

**Este é o Workflow 9b - Continuação de:**

← [Workflow 9a - Finalization](.windsurf/workflows/add-feature-9a-finalization.md)

**Pré-requisito**: Commit e push do Workflow 9a devem estar completos.

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler INDEX.md (Guia de Leitura)

```bash
cat .context/INDEX.md
```

**Entender**:
- Ordem de leitura dos arquivos
- O que cada arquivo faz
- Checklists obrigatórios

### 0.2. Ler Context Files (Ordem Definida em INDEX.md)

```bash
# Prefixo da branch (ex: feat-members)
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

# 1. Onde estou agora?
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 2. Estado atual resumido
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 3. Decisões já tomadas
cat .context/${BRANCH_PREFIX}_decisions.md

# 4. Histórico completo (últimas 30 linhas)
tail -30 .context/${BRANCH_PREFIX}_attempts.log
```

### 0.3. Validação Context Loaded

**Checklist**:
- [ ] Li INDEX.md?
- [ ] Li workflow-progress.md (onde estou)?
- [ ] Li temp-memory.md (estado atual)?
- [ ] Li decisions.md (decisões já tomadas)?
- [ ] Li últimas 30 linhas de attempts.log?

**Se NÃO leu**: ⛔ PARAR e ler AGORA.

### 0.4. Log Início Workflow

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 9b (RCA Retrospective) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

# Workflow 9b/10: Finalization Part B (RCA Retrospective)

Este é o **segundo bloco do nono workflow** de 10 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow (Parte B):**
- Fase 21.5: Root Cause Analysis (RCA) Retrospectivo
- Consolidação de melhorias sistêmicas
- Checklist Final de Workflow

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

---

## 🔍 Fase 21.5: Root Cause Analysis (RCA) Retrospectivo

**Objetivo**: Identificar gargalos sistêmicos no workflow completo para melhorar próximas features.

**Contexto**: Esta é uma análise **retrospectiva** sobre TODO o workflow (Fases 1-21), não apenas um bug específico. Use a técnica dos **5 Whys** para identificar causas raiz de ineficiências.

### 21.5.1 Análise de Tempo

**Tempo**: X dias vs estimado Y dias

**Se X > Y (acima estimado)**:

**RCA (5 Whys)**:
1. Por quê levou X dias em vez de Y? → [fase/razão]
2. Por quê? → [camada mais profunda]
3. Por quê? → [próxima camada]
4. Por quê não foi prevenido? → [falha processo]
5. **CAUSA RAIZ**: [Sistêmica]

**Ação**: [Imediata + Sistêmica]

---

### 21.5.2 Análise de Qualidade

**Bugs tardiamente**: Z bugs (encontrados em validação/review, não implementação)

**Se Z > 2**:

**RCA**: Por quê bugs descobertos tarde?
1. Por quê? → [falta testes, validação insuficiente]
2-5. [Continuar 5 Whys]

**Ação**: Testes adicionais, smoke tests, validação mais cedo

---

### 21.5.3 Análise de Iterações

**Iterações com usuário**: W iterações

**Se W > 3 (muitas)**:

**RCA**: Por quê W iterações em vez de 1-2?
1-5. [5 Whys]

**Ação**: Requisitos mais claros, protótipo antes de implementar

---

### 21.5.4 Análise de Workflow

**Fases problemáticas**: [Liste quais]

**RCA por fase**: Por quê [fase] foi confusa/demorada?
1-5. [5 Whys]

**Ação**: Melhorar documentação, atualizar workflow

---

### 21.5.4.5 Atualizar Baselines de Estimativa

**⚠️ EXECUTAR SE**: Delta tempo ≥ 20% vs baseline

**Critério**:
```bash
# Calcular delta tempo
REAL_HOURS=[duração real em horas desta feature]
BASELINE_HOURS=[baseline atual tipo feature]
DELTA=$(echo "scale=2; (($REAL_HOURS - $BASELINE_HOURS) / $BASELINE_HOURS) * 100" | bc)

# SE |DELTA| ≥ 20% → Atualizar baseline
if [ $(echo "$DELTA > 20 || $DELTA < -20" | bc) -eq 1 ]; then
  echo "⚠️ Delta ≥ 20% → Atualizar baseline necessário"
else
  echo "✅ Delta < 20% → Baseline estável (SKIP)"
fi
```

**Processo de Atualização**:

1. **Identificar tipo feature**:
   - Landing Page Estática
   - Auth/Onboarding
   - Modal/UI Incremental
   - Feature + DB Schema
   - Backend + Edge Functions

2. **Ler baseline atual**:
   ```bash
   grep "[Tipo Feature]" docs/ESTIMATION-BASELINES.md
   # Exemplo: "Landing Page Estática" | ... | **4-5h** | ...
   ```

3. **Calcular nova baseline** (média móvel):
   ```bash
   BASELINE_NEW=$(echo "scale=1; ($REAL_HOURS + $BASELINE_HOURS) / 2" | bc)
   echo "Nova baseline: ${BASELINE_NEW}h"
   ```

4. **Atualizar tabela**:
   ```bash
   # Editar docs/ESTIMATION-BASELINES.md
   # Linha "[Tipo Feature]" → coluna "Com Pareto ✅"
   # Atualizar valor: **[BASELINE_NEW]h**
   ```

5. **Adicionar histórico**:
   ```bash
   # Editar docs/ESTIMATION-BASELINES.md
   # Seção "Histórico de Atualizações"
   # Adicionar linha:
   # | [DATA] | [BRANCH] | [TIPO] | [REAL]h | [OLD]h | [NEW]h | [DELTA]% |
   ```

6. **Commit isolado**:
   ```bash
   git add docs/ESTIMATION-BASELINES.md
   git commit -m "docs(estimation): update baseline [tipo] ([OLD]h → [NEW]h)

- Feature: [branch]
- Delta: [DELTA]%
- Causa: [Pareto/Agentes/GATE 1/Outro]
- Baseline: [OLD]h → [NEW]h (média móvel)"
   ```

**Checklist**:
- [ ] Delta calculado?
- [ ] ≥ 20% (ou ≤ -20%)?
- [ ] Tipo feature identificado?
- [ ] Baseline atual lida?
- [ ] Nova baseline calculada (média móvel)?
- [ ] Tabela atualizada (coluna "Com Pareto ✅")?
- [ ] Histórico adicionado (linha nova)?
- [ ] Commit isolado (não misturar com RCA docs)?

**SE Delta < 20%**: ✅ SKIP (baseline estável, não atualizar)

**Evidência**: feat-landing-page-mvp (4h real vs 6-8h baseline = -34% delta → atualizado para 4-5h)

---

### 21.5.5 Consolidação de RCA

**Resumo** (máx 3 causas raiz):
1. [Causa raiz] → Ação sistêmica
2. [Causa raiz] → Ação sistêmica
3. [Causa raiz] → Ação sistêmica

**Melhorias Pareto 80/20**:

| Melhoria | ROI | Esforço | Prioridade |
|----------|-----|---------|-----------|
| [Top ROI] | XXx | X.Xh | Alta |
| [Segundo] | XXx | X.Xh | Alta |
| [Terceiro] | XXx | X.Xh | Média |

**Decidir**: Implementar AGORA? Top 1-2? Documentar só?

---

### 21.5.6 Documentação de RCA

**Criar/Atualizar**:
- [ ] `docs/debugging/` - Se RCA revelou bug recorrente
- [ ] `docs/adr/` - Se RCA levou a decisão arquitetural
- [ ] `.windsurf/workflows/` - Se RCA identificou melhoria de workflow
- [ ] `docs/TROUBLESHOOTING.md` - Se RCA revelou problema comum

**Template**: Ver `docs/guides/ROOT_CAUSE_ANALYSIS.md` (guia completo de RCA)

---

### 21.5.7 Checklist de RCA

- [ ] 4 análises: tempo, qualidade, iterações, workflow
- [ ] Causas raiz (mín 1)
- [ ] Ações corretivas: imediata + sistêmica
- [ ] Melhorias priorizadas (Pareto 80/20)
- [ ] Decisão: implementar/documentar
- [ ] Docs: debugging/ADR/workflow/troubleshooting

**Ver**: `docs/guides/ROOT_CAUSE_ANALYSIS.md`

---

## 🧠 MEMORY UPDATE (Pós-RCA Retrospective - OBRIGATÓRIO)

**CRÍTICO**: RCA retrospectivo SEMPRE produz learnings sistêmicos candidatos a memory global.

**Checklist**:
- [ ] Executou RCA 5 Whys (4 análises)? → Learning para memory
- [ ] Causa raiz afeta múltiplas features? → OBRIGATÓRIO memory update
- [ ] Identificou melhoria Pareto (ROI > 10x)? → Meta-learning para memory
- [ ] Criou ADR? → Learning para memory relevante

**Ação (SEMPRE)**:
1. Para CADA causa raiz sistêmica identificada, criar proposta memory
2. Identificar memory file relevante (debugging.md, workflows.md, [tema].md)
3. **SUGERIR ao usuário** com template completo + aguardar aprovação

**Template Sugestão**:
```
🧠 SUGESTÃO MEMÓRIA GLOBAL:
Arquivo: ~/.claude/memory/[arquivo].md
Seção: [Life Track Growth ou Geral]

Adicionar:
---
### [Título Causa Raiz] (Workflow 9b RCA - feat/branch)
**Problema**: [Gap sistêmico detectado em retrospectiva]
**Root Cause**: [5 Whys consolidados]
**Solução**: [Ação corretiva sistêmica]
**Prevenção**: [Workflow update / script / checklist]
**Exemplo**: [Evidências de múltiplas features]
**Evidências**: [ADR-X, attempts.log, validation-loop]
**Features Afetadas**: [feat-1, feat-2, feat-3]
**ROI**: [Previne X bugs em features futuras]
---

⏸️ APROVAR adição? (yes/no/edit)
```

**Por quê**: RCA retrospectivo é ÚNICA fase que analisa workflow completo (1-9). Causas raiz encontradas aqui SEMPRE afetam múltiplas features → candidato OBRIGATÓRIO para memory global.

**Frequência**: 1+ memory proposals por RCA retrospectivo (típico: 2-3)

**Ver**: `~/.claude/CLAUDE.md` REGRA #20 (Sistema de Memória Global)

---

## ⏸️ FIM DO WORKFLOW AUTOMÁTICO

**🎯 O workflow automático para aqui!**

Código está commitado e push feito para `feat/add-profit-cards-makeup`.

**⚠️ IMPORTANTE**: O merge para `main` **NÃO é automático**. Você decide quando fazer!

---

## 🔄 CHECKLIST TEMPLATE SYNC (OBRIGATÓRIO)

**🎓 LEARNING #5 APLICADO**: Prevenir gap de propagação (2 dias) via reminder manual.

**SE modificou algum destes arquivos durante a feature**:
- [ ] `.windsurf/workflows/` (qualquer workflow)
- [ ] `scripts/validate-*.sh` (scripts de validação)
- [ ] `.claude/agents/` (agentes especializados)
- [ ] `scripts/pre-*.sh` ou `scripts/post-*.sh` (hooks)

**ENTÃO executar ANTES de merge**:
```bash
# Opção A: Sync automático de mudanças recentes
~/.claude/scripts/template-extract.sh life_tracker --changed --auto

# Opção B: Sync manual (escolher arquivos)
~/.claude/scripts/template-extract.sh life_tracker

# Opção C: Apenas validar (sem extrair)
~/.claude/scripts/template-diff.sh life_tracker
```

**Por quê**: Sistema tem automação assimétrica:
- ✅ Propagação automática (template → projetos)
- ❌ Extração MANUAL (projeto → template)

**Sem sync**: Melhorias ficam isoladas em 1 projeto (não propagam para clteam, lavateria, futuros).

**ROI**: 2-3 min sync agora vs 2 dias gap de propagação.

**Ver**: `~/.claude/skills/template-sync/SKILL.md` Learning #5

---

**As próximas fases são MANUAIS e opcionais:**

---

## 🧪 Fase 22: Validação Build Produção (MANUAL/OPCIONAL)

**Antes de merge**:
```bash
npm run build  # Sem erros? Bundle OK?
npm run preview  # Feature OK? Performance OK?
```

**Checklist**:
- [ ] Build sem erros
- [ ] Chunk size OK
- [ ] Feature em produção OK
- [ ] Sem regressões

**OK → Próximo: Fase 23 (Merge)**

---

## 🔀 Fase 23: Merge na Main (COM SUA APROVAÇÃO!)

**Pré-requisito**: Fase 22 OK ou testado suficientemente

**Opção A - Merge Direto**:
```bash
git checkout main && git pull origin main
git merge feat/[nome] && git push origin main
```

**Opção B - Pull Request**:
```bash
gh pr create --title "feat: [descrição]" --body "## Testes\n- [x] Manual\n- [x] Build OK"
```

**Opção C - Não Fazer Merge Ainda**: Continue ajustando

---

## 🎉 Fase 24: Pós-Merge

```bash
./scripts/create-feature-branch.sh "nome-feature"
```

Script detecta commits não mergeados. Ver `docs/WORKFLOW_BRANCHES.md`.

---

## 🚀 Próximo Passo: Deploy VPS?

**Requer deploy para VPS?**
- `s` → Workflow 11 (VPS Deploy)
- `n` → Workflow 10 (Template Sync)
- `staging` → ./scripts/deploy-vps.sh staging

**Sim se**: Frontend/Backend/Infra mudou, hotfix, visível para usuários
**Não se**: Só docs/testes/scripts, refactor interno, merge pending

**Comando**:
```bash
/add-feature-11a-vps-deployment-prep  # (sim)
# Ou pule para Workflow 10 (não)
```

---

## 🔄 Rollback (Se necessário)

```bash
# Opção 1: Revert (Seguro)
git revert -m 1 HEAD && git push origin main

# Opção 2: Reset (Perigoso - force push)
git reset --hard HEAD~1 && git push origin main --force

# Opção 3: Database restore
./scripts/restore-supabase.sh backups/backup-YYYYMMDD-HHMMSS.sql
```

---

## 📝 Resumo

- **Status**: ⏸️ Aguardando merge manual (Fase 23)
- **Lembretes**: Fase 22 é opcional. Fase 23 precisa SUA aprovação. Main sempre funcional!

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

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 9b: RCA Retrospective ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - RCA retrospectivo executado (5 Whys para tempo, qualidade, iterações, workflow)
  - Consolidação de RCA (máx 3 causas raiz sistêmicas)
  - Melhorias Pareto 80/20 priorizadas (Top 3 ROI > 10x)
  - Documentação de RCA (debugging, ADR, workflow, troubleshooting)
- **Outputs**:
  - Mínimo 1 causa raiz sistêmica identificada
  - Ações corretivas imediatas + sistêmicas definidas
  - Melhorias priorizadas (Pareto)
  - Documentação atualizada
- **Next**: Workflow 10 (Template Sync) ou Workflow 11 (VPS Deploy)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 9b (RCA Retrospective) concluído com sucesso.

**RCA retrospectivo completo**. Causas raiz sistêmicas identificadas e melhorias priorizadas.

**Próximo passo**: Feature finalizada. Aguardando merge manual (Fase 23) ou executar Workflow 10 (Template Sync).

---

## Próximos Passos

- [ ] Fase 22: Validação Build Produção (opcional, manual)
- [ ] Fase 23: Merge na Main (manual, COM APROVAÇÃO)
- [ ] Fase 24: Pós-Merge (opcional)
- [ ] Workflow 10: Template Sync (se necessário)
- [ ] Workflow 11: VPS Deploy (se necessário)

---

## Decisões Pendentes

- [ ] Fazer merge agora ou aguardar?
- [ ] Deploy VPS necessário?

EOF

sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se identificamos causa raiz e decidimos implementar melhoria
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 9b - RCA Retrospective
- **Decisão**: [Descrever decisão - ex: Implementar melhoria X (causa raiz Y)]
- **Por quê**: [Justificativa - ex: RCA identificou causa sistêmica, ROI > 10x]
- **Trade-off**: [Ex: +2h implementação, mas previne 20h debugging futuro]
- **Alternativas consideradas**: [Ex: Não implementar (rejeitado - problema recorrente)]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 9b (RCA Retrospective) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] RCA: [Quantidade] causas raiz sistêmicas identificadas" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + RCA)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🎉 FIM DO WORKFLOW ADD-FEATURE!

Parabéns! Completou: planejamento, implementação TDD, validação, code review, documentação, commits.

**Próximo passo**: Iniciar próxima feature (Workflow 1) ou fazer deploy (Workflow 11).

---

**Workflow criado em**: 2025-11-04
**Versão**: 3.0 (Split em 9a/9b)
**Autor**: Windsurf AI Workflow + Claude Code

---

## 📝 Changelog

**v3.0 (2025-11-04)**:
- ✅ Split de Workflow 9 em Parte A (9a) e Parte B (9b)
- ✅ Parte B: RCA Retrospectivo (Fase 21.5) + Fases Manuais (22-24)
- ✅ Continuidade automática desde Parte A
- ✅ Tamanho reduzido para < 12k chars
- ✅ Integração completa com análise retrospectiva (5 Whys)
- ✅ Consolidação de melhorias sistêmicas e Pareto 80/20

**v2.1 (2025-11-04)**:
- Adicionada Fase 21.5: Root Cause Analysis (RCA) Retrospectivo
- 4 análises estruturadas: Tempo, Qualidade, Iterações, Workflow (5 Whys cada)
- Consolidação de RCA com priorização Pareto 80/20

**v2.0 (2025-10-27)**:
- Modular workflow structure (9/10)
- User validation integration
- Meta-learning before documentation

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 10] - Template Sync** ou **[Workflow 11] - VPS Deploy**: Feature finalizada → sincronizar templates ou fazer deploy conforme necessidade.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| RCA revelou causa raiz crítica | [Workflow afetado] | Corrigir antes de finalizar |
| Merge bloqueado por conflict | 9a (Finalization) | Resolver conflitos primeiro |
| Deploy necessário urgente | 11a (VPS Deploy Prep) | Priorizar deploy sobre template sync |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| Build de produção falhou | 7a (Quality Gates) | Re-executar validações |
| RCA incompleto | 9b (continuar) | Completar análise retrospectiva |
| Baseline delta > 20% não documentado | 9b Fase 21.5.4.5 | Atualizar estimativas |

### Regras de Ouro
- ⛔ **NUNCA pular**: Memory Update pós-RCA - causas raiz são candidatas obrigatórias
- ⚠️ **Merge manual**: Fase 23 SEMPRE requer aprovação explícita do usuário
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto
