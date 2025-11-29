---
description: Workflow 14 - Meta-Learning Consolidation (Consolidar Aprendizados 8-14)
auto_execution_mode: 1
---

## Pré-requisito

Ler: `docs/PLAN.md`, `docs/TASK.md`, `.claude/CLAUDE.md`

---

## FASE 0: LOAD CONTEXT

**Workflow 14 = Meta-processo (3-5 features EM PARALELO, nunca single feature)**

### 0.1. Selecionar Features

```bash
git branch -a | grep "feat/" | head -5
./scripts/context-load-all.sh  # Carrega TODOS arquivos .context/
```

**Checklist**:
- [ ] Selecionei 3-5 features diversas?
- [ ] Li workflow-progress + decisions + attempts.log de CADA?

---

## FASE 21: Análise .context/

**Usar 5 agentes em paralelo** para análise máxima.

### 21.1. Análise Por Feature

Para cada feature, analisar:
- **workflow-progress.md**: Qual workflow foi problema/lento/pulado?
- **decisions.md**: Padrões arquiteturais emergentes
- **attempts.log**: Erros recorrentes (grep "ERRO\|FALHOU")
- **validation-loop.md**: Padrões UX (comportamento não esperado)

### 21.2. Padrão Consolidação

```
Workflow X [frequência N features]:
- ✅ Sucesso: [N]
- ⚠️ Lentidão: [N, causa]
- ❌ Pulo/erro: [N, causa]
- Melhoria: [proposta]
```

**Outputs Esperados**:
- 10+ padrões sistêmicos (2+ features)
- 5+ RCAs sistêmicos (causa compartilhada)
- 3+ erros recorrentes (3+ features)

---

## FASE 22: Padrões Sistêmicos

### 22.1. Template Padrão

```
PADRÃO [Frequência: N features]
├─ Tipo: [Workflow|RCA|Erro|UX|Gate]
├─ Features: [1, 2, 3]
├─ Causa raiz (5 Whys): [...]
├─ Prevenção: [Gate/checklist/script]
└─ Impacto: [Qualitativo]
```

### 22.2. Priorização (Matriz)

```
[CRÍTICO] Freq 4+ | Impacto Alto → DO FIRST
[IMPORTANTE] Freq 3+ | Impacto Médio
[BACKLOG] Freq 2+ | Impacto Baixo
```

**Gate**: < 10 padrões? Re-executar Fase 21.

---

## FASE 23: Propostas

### 23.1. Template Proposta

```
PROPOSTA [Tipo]: [Nome]
├─ Arquivo/Local: [...]
├─ Problema resolvido: [RCA-N]
├─ Features beneficiadas: [N]
├─ Implementação: [Resumo]
└─ Impacto: [Qualitativo]
```

### 23.2. Tipos de Proposta

| Tipo | Local | Exemplo |
|------|-------|---------|
| Workflow | .windsurf/workflows/ | Adicionar gate token count |
| Script | scripts/ | validate-gemini-context.sh |
| CLAUDE.md | .claude/CLAUDE.md | Nova REGRA #N |
| ADR | docs/adr/ | ADR-N decisão arquitetural |
| Memory | ~/.claude/memory/ | Learning sistêmico (REQUER APROVAÇÃO) |

### 23.3. Priorização Pareto

TOP = Impacto Alto + Esforço Baixo → Implementar primeiro

**Gate**: < 5 propostas? Re-executar Fase 22-23.

---

## FASE 24: Aplicar

### 24.1. Implementar TOP Propostas

**Workflow**: Editar → validate-workflow-size.sh → Commit
**Script**: Criar → chmod +x → Testar → Commit
**CLAUDE.md**: Editar → Atualizar índice → Commit
**ADR**: Criar template → Commit → Atualizar INDEX.md
**Memory**: Propor → AGUARDAR APROVAÇÃO → Editar → Commit separado

### 24.2. Validação Compliance

```bash
./scripts/validate-workflow-compliance-advanced.sh 8 14
```

Focos críticos:
- Check 10: Meta-Learning presente (Workflows 8+)
- Check 13: Consolidação documentada (Workflow 14)

### 24.3. Git Checkpoints

**Docs Commit** (separado de código):
```
docs(meta-learning): consolidate [X] learnings from workflows [A-B]
```

**Push** (REQUER APROVAÇÃO):
```
🔴 PUSH CONSOLIDATION BRANCH:
Branch: meta/consolidation-[range]
Commits: [N]
⏸️ APROVAR? (yes/no)
```

### 24.4. Atualizar INDEX.md + CLAUDE.md Changelog

---

## FASE FINAL: UPDATE CONTEXT

```bash
# Log conclusão
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 14 - COMPLETO" >> .context/WORKFLOW-14.log

# Commit final
git add .context/ docs/ .claude/ .windsurf/workflows/ scripts/
git commit -m "meta(consolidation): Workflow 14 completo - [N] features analisadas"
```

---

## Checklist Final

**Fase 21**: [ ] Analisei 3-5 features (workflow-progress, decisions, attempts, validation-loop)?
**Fase 22**: [ ] 10+ padrões sistêmicos classificados por frequência/impacto?
**Fase 23**: [ ] 5+ propostas priorizadas (Pareto)?
**Fase 24**: [ ] TOP propostas implementadas + validação compliance?
**Final**: [ ] INDEX.md + CLAUDE.md changelog + commit?

---

## REGRA ANTI-ROI

**NUNCA**: ROI, tempo, "horas economizadas"
**PERMITIDO**: "Previne N bugs", "Melhora UX X%", evidências concretas

---

**Versão**: 2.0 (Otimizado)
**Próximo**: Novo ciclo features (sistemas consolidados)
