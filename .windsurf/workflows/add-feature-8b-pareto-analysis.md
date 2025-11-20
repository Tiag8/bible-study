---
description: Workflow Add-Feature (8b/11) - PLAN.md + Análise Pareto 80/20 - Parte 2
auto_execution_mode: 1
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 8a

**Este é o Workflow 8b - Continuação de:**

← [Workflow 8a - Meta-Learning](.windsurf/workflows/add-feature-8a-meta-learning.md)

**Pré-requisito**: Meta-learnings (Fase 16-17) documentados no 8a devem estar completos.

---

## 📚 Pré-requisito: Consultar Documentação

SEMPRE ler: `docs/PLAN.md`, `docs/TASK.md`, `.windsurf/workflows/`

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

# Workflow 8b/11: PLAN.md + Pareto 80/20 - Parte 2

Este é o **oitavo workflow (Parte 2)** de 11 etapas modulares.

**Fases**: 18 (Atualização PLAN.md), 19 (Análise Pareto 80/20), 20 (Próximos Passos)

**Por que Pareto?** Evita over-engineering, foco no essencial (ROI > 10x), sistema sustentável.

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**OBRIGATÓRIO**: Usar 5 agentes em paralelo para Análise Pareto (Workflows, Scripts, Documentação, Padrões, Consolidação). ROI: até 36x mais rápido.

---

## 📝 Fase 18: Atualização do PLAN.md

**Checklist**:
- [ ] Revisar `docs/PLAN.md`
- [ ] Atualizar seção "Learnings" com insights da feature
- [ ] Documentar decisões arquiteturais importantes (ADRs)
- [ ] Validar consistência (links, roadmap, estado atual)

---

## 🎯 Fase 19: Análise Pareto 80/20 (AUTOMÁTICA)

**Objetivo**: Identificar **20% de melhorias que geram 80% do resultado** (ROI > 10x cada).

---

### 19.2 Executar Análise Pareto

**5 Agentes em Paralelo**:
- **Agent 1 (Workflows)**: Ações repetitivas/desnecessárias (Score: Frequência × Tempo economizado)
- **Agent 2 (Scripts)**: Automações críticas (Score: Uso × Economia)
- **Agent 3 (Docs)**: Gaps/redundâncias (Score: Consulta × Clareza)
- **Agent 4 (Padrões)**: Patterns reutilizáveis (Score: % features × Redução duplicação)
- **Agent 5 (Consolidação)**: Output consolidado + tabela final

---

### 19.3 Critérios de Priorização

**Métricas**: ROI (Tempo economizado ÷ Implementação), Frequência (% features), Impacto (1-10), Esforço (horas), Causa Raiz (RCA).

**Ranking**: (Frequência × Impacto × Sistêmico) ÷ Esforço (Sistêmico = 1.5 se RCA, 1.0 caso contrário).

---

#### RCA como Critério de Priorização

**IMPORTANTE**: Melhorias com RCA sistêmico têm ROI > 10x (previne na origem, beneficia TODAS features futuras).

**Exemplo**: Git Hook (ROI 12x) > Fix pontual (ROI 0x, descartado).

---

### 19.4 Output Esperado

**Top 5-7 melhorias**: ≤ 20% esforço, ≥ 80% resultado, ROI > 10x, < 4h implementação, TODAS com RCA sistêmico.

**Formato**:
| # | Ação | Categoria | Tempo (h) | RCA? | Causa Raiz | ROI | Score | Justificativa |
|---|------|-----------|-----------|------|------------|-----|-------|----------------|
| 1 | [Ação] | Workflow/Script/Doc/Padrão | 1.5 | ✅ | [Causa raiz] | 15x | 9/10 | [Por que sistêmico] |

**CRÍTICO**: Só incluir melhorias com `RCA? = ✅`. Correções pontuais descartadas.

---

### 19.5 Apresentação ao Usuário

**Apresentar**: Tabela consolidada (5-7 melhorias), justificativa (por que essas), ordem de execução, score projetado.

---

### 19.6 Decisão do Usuário

**AGUARDAR APROVAÇÃO**. 3 opções:
1. **Implementar todas** (~4h, ganho 82%+)
2. **Implementar selecionadas** (proporcional)
3. **Não implementar** (0h, aceitar score atual)

---

### 19.7 Após Aprovação

Se aprovado: Implementar → Testar → Commit `meta: [N/7] - [Descrição]` → Atualizar `docs/TEMPLATE_EVOLUTION.md` → Validar score.

---

## ✅ Fase 20: Próximos Passos

**Se aprovado**: Implementar → Workflow 9
**Se não aprovado**: Workflow 9 direto

---

## ✅ Checkpoint: Meta-Aprendizado + PLAN.md + Pareto

**Feito**: Análise 8a, PLAN.md atualizado, Pareto 80/20, Top 5-7 melhorias, aguardando aprovação.
**Próximo**: Aprovação → Implementação (se aprovado) → Workflow 9.

---

## 🔄 Sistema de Aprovação de Mudanças

**Processo**: Identificar → Propor → Aguardar aprovação → Aplicar → Testar → Commit → Sincronizar template.

**Nota**: Para bugs recorrentes, use RCA (5 Whys). Ver `docs/guides/ROOT_CAUSE_ANALYSIS.md`.

---

## ✅ Checklist Final

- [ ] PLAN.md atualizado (Fase 18)
- [ ] Pareto 80/20 com 5 agentes (Fase 19)
- [ ] RCA aplicado (ROI > 10x)
- [ ] Top 5-7 melhorias apresentadas
- [ ] Aprovação recebida ANTES de implementar

**Próximo**: Aprovado → Implementar → Workflow 9 | Não aprovado → Workflow 9 direto

---

## 🧠 Meta-Learning: Captura de Aprendizados

**CRÍTICO**: Identificar melhorias sistêmicas nos workflows.

### Questões de Reflexão

**1. Eficiência (1-10)**: Nota __/10. Se < 8: qual fase ineficiente? Como melhorar?
**2. Iterações**: Se > 3: o que causou? Como tornar mais autônomo?
**3. Gaps**: Validação faltou? Gate falhou? Comando repetido 3+ vezes (automatizar)?
**4. RCA**: 5 Whys aplicados? Causa raiz sistêmica (afeta múltiplas features)?

### Ações de Melhoria

**Atualizar**: Workflow (.md), CLAUDE.md (novo padrão), Script (automatizar), ADR (decisão arquitetural)
**ROI Esperado**: [Ex: "20min/feature" ou "Previne bug 2h debugging"]

### Validação Tamanho

```bash
wc -c .windsurf/workflows/NOME_DESTE_WORKFLOW.md
# ✅ < 12000 chars | ❌ > 12000: comprimir/dividir
```

**IMPORTANTE**: Só learnings SISTÊMICOS (não pontuais). Consolidação final no Workflow 8a.

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

### Workflow 8b: PLAN.md + Pareto ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - PLAN.md atualizado com feature e learnings
  - Análise Pareto 80/20 executada (5 agentes paralelos)
  - RCA aplicado (ROI > 10x para cada melhoria)
  - Top 5-7 melhorias identificadas e apresentadas
  - Aprovação recebida (ou não) do usuário
- **Outputs**:
  - Tabela consolidada Top 5-7 melhorias
  - Score projetado e justificativas
  - Ordem de execução definida
- **Next**: Workflow 9a (Finalization) ou implementação melhorias aprovadas
EOF
```

### F.2. Atualizar temp-memory.md

```bash
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 8b (PLAN.md + Pareto) concluído com sucesso.

**Pareto 80/20**: Top 5-7 melhorias identificadas com ROI > 10x.

**Próximo passo**: Executar Workflow 9a (Finalization) para documentar, commitar e finalizar feature.

---

## Próximos Passos

- [ ] Executar Workflow 9a (Finalization)
- [ ] Atualizar documentação final
- [ ] Commit e push
- [ ] RCA retrospectivo (9b)

---

## Decisões Pendentes

- [ ] Nenhuma (melhorias Pareto já aprovadas/rejeitadas)

EOF

sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se aprovamos implementar melhorias Pareto
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 8b - PLAN.md + Pareto
- **Decisão**: Implementar [quantidade] melhorias Pareto (ou Não implementar)
- **Por quê**: [Justificativa - ex: ROI > 10x cada, esforço < 4h total]
- **Trade-off**: [Ex: +4h implementação, mas ganho 82%+ score]
- **Alternativas consideradas**: [Ex: Não implementar (rejeitado - perder ganho)]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 8b (PLAN.md + Pareto) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] PARETO: Top [quantidade] melhorias identificadas, [aprovadas/rejeitadas]" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + decisão Pareto)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🔄 Próximo Workflow

Acionar: `.windsurf/workflows/add-feature-9-finalization.md` ou `/add-feature-9-finalization`

---

**Workflow**: 8b/11 - PLAN.md + Pareto (Parte 2) | **Versão**: 3.2 (Otimizado) | **Data**: 2025-11-08

**Changelog v3.2 (2025-11-08)**: Otimizado de 13,956 → 8,892 chars (-36%, 74% of limit). Removido exemplos redundantes, consolidado checklists, comprimido explicações verbosas. Mantido: metodologia Pareto, RCA, priorização ROI > 10x, meta-learning.
