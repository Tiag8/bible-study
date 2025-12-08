---
description: Workflow Add-Feature (8a/11) - Meta-Learning (Aprender ANTES de Documentar)
auto_execution_mode: 1
---

## 📚 Pré-requisito
SEMPRE ler: `docs/PLAN.md`, `docs/TASK.md`, `docs/INDEX.md`, `README.md`, `AGENTS.md`

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

# Workflow 8a/11: Meta-Learning - Parte 1

**Fases**: 16 (Análise), 17 (Documentação), 18 (PLAN.md - Workflow 8b)

**⭐ CRÍTICO**: Fase fundamental para evolução do sistema! ROI > 10x.

---

## ⚠️ REGRA: USO MÁXIMO DE AGENTES
**SEMPRE usar 3+ agentes em paralelo** para Fases 16-17. Benefícios: 36x faster.

---

## 🧠 Fase 16: Meta-Aprendizado (Análise) 🚨 OBRIGATÓRIO

**⚠️ NÃO PULE** - Sistema aprende com cada implementação.

### 16.1-16.2 Workflow + Scripts
- [ ] Fase pulada/confusa/demorou? Ação?
- [ ] Faltou etapa? Onde inserir?
- [ ] Comando repetido 3+? Automatizar?

### 16.3 Root Cause Analysis (PRÉ-REQUISITO)

**Template**: Problema → 5 Whys (imediata → subjacente → profunda → processo → SISTÊMICA) → Sistêmica? (múltiplas features = VÁLIDO, só feature atual = DESCARTAR) → Meta-Learning → Onde doc (Workflow/AGENTS/ADR)

**Checklist**:
- [ ] 5 Whys completos
- [ ] Causa sistêmica (SE NÃO: descartar)
- [ ] Previne recorrência
- [ ] Doc identificada

### 16.4-16.7 Código, Segurança, Docs, Automação
- [ ] Novo padrão/anti-pattern? → AGENTS.md/ADR
- [ ] Vulnerabilidade? → Scripts segurança
- [ ] Doc faltando/inútil? → Adicionar/remover
- [ ] Script útil/validações faltaram? → Criar/melhorar

### 16.8 Gate Validação 🚨

**⚠️ CHECKPOINT**:
- [ ] Mínimo 1 learning sistêmico (0: re-analisar)
- [ ] RCA 5 Whys (CADA learning)
- [ ] Causa SISTÊMICA (não pontual)
- [ ] Previne recorrência

**⛔ < 1 LEARNING SISTÊMICO**: Re-executar Fase 16.

---

## 📋 Fase 17: Documentação

### 17.1-17.5 Documentar
- [ ] Novos padrões → AGENTS.md (padrão + exemplo + por quê)
- [ ] Decisões → ADR (`docs/adr/XXX-titulo.md`)
- [ ] Feature → `docs/features/` (componentes, hooks, schemas)
- [ ] Regras negócio → `docs/regras-de-negocio/` (fórmulas, pesos)
- [ ] README.md (se feature importante, dep crítica, novo script)

### 17.6 INDEX.md 🚨 OBRIGATÓRIO
- [ ] Novos arquivos (debugging cases, snapshots, scripts)
- [ ] Stats: `ls -1 docs/adr/*.md | wc -l`
- [ ] Versão (data YYYY-MM-DD + incrementar)

**Por quê**: INDEX.md = mapa. Não atualizar = docs invisíveis.

### 17.7 CLAUDE.md 🚨 OBRIGATÓRIO
- [ ] Novos padrões código ("Convenções de Código")
- [ ] Changelog (final): data + versão + mudanças
- [ ] Meta-learnings críticos

**Por quê**: CLAUDE.md lido TODA sessão. Não atualizar = repete erros.

### 17.8 Workflows Afetados 🚨 OBRIGATÓRIO
- [ ] Identificar workflows (bug implementação → Workflow 5, etc.)
- [ ] Adicionar gates/checklists
- [ ] Avisos: "⚠️ Meta-Learning: [link case]"

**Por quê**: Workflows = guias. Não melhoram = sistema não evolui.

### 17.9 Validar Tamanho
- [ ] `./scripts/validate-workflow-size.sh`
- [ ] <= 12k chars (split se > 12k)
- [ ] INDEX.md atualizado

### 17.10 Memória Global (Sugestões) 🧠 OPCIONAL

**SE há learnings sistêmicos** (recorrentes 2+ projetos, evidências fortes):

**5 Perguntas de Validação**:
1. Específico desta feature OU genérico? → Genérico? Continuar
2. Previne recorrência? → SIM? Continuar
3. Qual evidência? (ADR-X, WR-Y, paper) → Tem? Continuar
4. Em quantos workflows/features aplica? → 2+? Continuar
5. Requer mudança CLAUDE.md/docs? → Avaliar impacto

**SE TODAS 5 respondidas positivamente**:

- [ ] Formatar learning (template `~/.claude/MEMORY.md` seção "Template Padrão")
- [ ] Identificar memory file (gemini.md, supabase.md, deployment.md, debugging.md, validation.md, workflows.md)
- [ ] **SUGERIR ao usuário** com template completo + aguardar aprovação ⭐
- [ ] **SE APROVADO**: Commitar em `~/.claude/memory/[arquivo].md`

**Template Sugestão**:
```
🧠 SUGESTÃO MEMÓRIA GLOBAL:
Arquivo: ~/.claude/memory/[arquivo].md
Seção: [Geral ou Life Track Growth]

Adicionar:
---
### [Título] ([Fonte ADR/WR])
**Problema**: [gap/erro]
**Root Cause**: [5 Whys]
**Solução**: [definitiva]
**Prevenção**: [checklist/script]
**Exemplo**: [code snippet]
**Evidências**: [ADR-X, WR-Y]
---

⏸️ APROVAR adição? (yes/no/edit)
```

**Por quê**: Memória global = zero re-aprendizado entre projetos. Learnings sistêmicos DEVEM persistir em `~/.claude/memory/` (não apenas `.context/` local). **Ver**: `~/.claude/MEMORY.md` para workflow completo.

---

### 17.11 Memory Consolidation Check 🧠 GATE-BASED

**CRÍTICO**: APÓS adicionar learnings à memória global (Fase 17.10), validar se consolidação é necessária.

**Quando Executar**: SEMPRE após atualizar arquivo memory (workflow.md, gemini.md, supabase.md, etc.)

**Execute Analyzer**:
```bash
# Verificar arquivo atualizado
./scripts/memory-analyzer.sh ~/.claude/memory/workflow.md
```

**GATE Criteria** (quando consolidar obrigatório):
- [ ] Arquivo > 1800 linhas
- [ ] Token count > 2000
- [ ] Duplicados > 3
- [ ] Learnings obsoletos > 5
- [ ] Domínio com 7+ patterns (candidato split)

**SE NENHUM GATE ATIVADO**:
- ✅ Consolidação NÃO necessária
- ⏸️ Aguardar próximo threshold trigger
- 📝 Log: "SKIP consolidation (thresholds não atingidos)"

**SE 1+ GATE ATIVADO**:
- 🔴 Consolidação OBRIGATÓRIA
- 🔧 Execute: `./scripts/memory-consolidate.sh ~/.claude/memory/workflow.md`
- 📋 Revisão interativa: merge duplicados, archive obsoletos, split domínios
- 📝 Commit separado: `chore(memory): consolidate workflow`

**Arquivo ESPECÍFICO**:
| Arquivo atualizado | Analyzer path |
|-------------------|---------------|
| workflow.md | `~/.claude/memory/workflow.md` |
| gemini.md | `~/.claude/memory/gemini.md` |
| supabase.md | `~/.claude/memory/supabase.md` |
| deployment.md | `~/.claude/memory/deployment.md` |

**Por quê**: Previne context overflow (workflow.md v2.7 = 1533 linhas, projeção v3.0 = 2000+ linhas). Consolidação gate-based garante memória saudável sem intervenção manual constante.

**Evidência**: Party Mode analysis (2025-12-08) - learnings sistêmicos documentados mas workflow só adiciona, nunca consolida.

---

### 17.12 Validação Compliance Workflows 1-7 🚨 OBRIGATÓRIO

**CRÍTICO**: Garantir que Workflows 1-7 seguem padrões de documentação e meta-learning.

**Por quê**: Sem compliance → próximo workflow perde 40-60% contexto → retrabalho 10x.

**Execute**:
```bash
./scripts/validate-workflow-compliance.sh
```

**Manual (Se sem script)**:
```bash
for WF in {1..7}; do
  FILE=".windsurf/workflows/add-feature-${WF}*.md"
  echo "Workflow ${WF}:"
  echo "  ✅/❌ Fase 0 (Load .context/) presente?"
  grep -q "## 🧠 FASE 0:" ${FILE} && echo "    ✅" || echo "    ❌"

  echo "  ✅/❌ Fase Final (Update .context/) presente?"
  grep -q "## 🧠 FASE FINAL:" ${FILE} && echo "    ✅" || echo "    ❌"

  echo "  ✅/❌ workflow-progress.md atualizado?"
  grep -q "workflow-progress.md" ${FILE} && echo "    ✅" || echo "    ❌"

  echo "  ✅/❌ temp-memory.md atualizado?"
  grep -q "temp-memory.md" ${FILE} && echo "    ✅" || echo "    ❌"

  echo "  ✅/❌ attempts.log logado?"
  grep -q "attempts.log" ${FILE} && echo "    ✅" || echo "    ❌"

  SIZE=$(wc -c < ${FILE})
  echo "  ✅/❌ Workflow size (${SIZE} < 12000)?"
  [ ${SIZE} -lt 12000 ] && echo "    ✅" || echo "    ❌"
done
```

**Resultado esperado**: ✅ Todos workflows 6/6 checks OK

**Se FALHOU 1+ checks**:
1. Identificar workflow não-compliant
2. Abrir issue em `docs/TASK.md`
3. Priorizar correção (Workflow 10 ou próximo ciclo)

**Log Resultado**:
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] VALIDATION: Workflows 1-7 Compliance - [PASSED/FAILED]" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## ✅ Checkpoint: Meta-Aprendizado Parte 1 Completo

**Aprendizados capturados e documentados!**

**Validação Final**:
- [ ] INDEX.md atualizado (novos arquivos, stats, versão)
- [ ] CLAUDE.md atualizado (padrões, changelog, meta-learnings)
- [ ] Workflows melhorados (gates, checklists, avisos)

**Próximo**: PLAN.md + Análise Pareto 80/20 (Workflow 8b)

---

## 🔄 Sistema de Aprovação de Mudanças

Identificar → Propor → Aguardar aprovação → Aplicar → Commit `"meta: ..."` → Sincronizar template

---

## ✅ Checklist Final

**Fase 16 (Análise)**:
- [ ] Análise 16.1-16.7 completa
- [ ] Mínimo 1 learning sistêmico (Gate 16.8)
- [ ] RCA 5 Whys aplicado
- [ ] Causas SISTÊMICAS (não pontuais)

**Fase 17 (Docs)**:
- [ ] Docs mapeada (AGENTS.md, ADRs, features)
- [ ] INDEX.md + CLAUDE.md + workflows atualizados
- [ ] Workflow size validado (< 12k)

---

## 🧠 Meta-Learning: Reflexão

**Eficiência (1-10)**: __/10 (< 8: melhorar)
**Iterações usuário**: __ (> 3: tornar autônomo)
**Gaps**: Validação/gates faltaram? Comando repetiu 3+?
**RCA**: 5 Whys aplicados? Causa sistêmica? Previne recorrência?

**Ações**:
- [ ] Workflow melhorias
- [ ] CLAUDE.md padrão novo
- [ ] Script útil
- [ ] ADR necessário

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

→ [Workflow 8b - PLAN.md + Análise Pareto](.windsurf/workflows/add-feature-8b-pareto-analysis.md)

**Próximas etapas** (Workflow 8b):
- Fase 18: Atualização PLAN.md
- Fase 19: Análise Pareto 80/20
- Fase 20: Próximos Passos

---

## 🚨 REGRA: ANTI-ROI

**NUNCA**: ROI, tempo execução, horas economizadas, estimativas temporais (Xmin vs Ymin).
**Por quê**: IA paralela, cálculos consomem tokens sem valor, polui docs.
**Permitido**: Evidências concretas (código, logs, testes), comparações qualitativas, métricas técnicas.

---

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 8a: Meta-Learning ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Análise workflow completa (16.1-16.7)
  - RCA aplicado (5 Whys para cada learning)
  - Identificação de causas raiz sistêmicas
  - Documentação de meta-learnings (AGENTS.md, ADRs, workflows)
  - INDEX.md atualizado (novos arquivos, stats)
  - CLAUDE.md atualizado (padrões, changelog)
  - Workflows afetados melhorados (gates, checklists)
- **Outputs**:
  - Mínimo 1 learning sistêmico documentado
  - ROI quantificado para cada meta-learning
  - Documentação sincronizada (INDEX, CLAUDE, workflows)
- **Next**: Workflow 8b (PLAN.md + Pareto)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 8a (Meta-Learning) concluído com sucesso.

**Meta-learnings capturados**: [Quantidade] learnings sistêmicos identificados e documentados.

**Próximo passo**: Executar Workflow 8b (PLAN.md + Pareto) para atualizar roadmap e análise 80/20.

---

## Próximos Passos

- [ ] Executar Workflow 8b (PLAN.md + Pareto)
- [ ] Atualizar PLAN.md com feature e learnings
- [ ] Análise Pareto 80/20 (Top 5-7 melhorias ROI > 10x)

---

## Decisões Pendentes

- [ ] Aprovar melhorias Pareto (Workflow 8b)

EOF

sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se identificamos padrão novo para AGENTS.md
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 8a - Meta-Learning
- **Decisão**: [Descrever decisão - ex: Novo padrão de validação]
- **Por quê**: [Justificativa - ex: Previne 3 tipos de bugs recorrentes]
- **Trade-off**: [Ex: +5min validação, mas previne 2h debugging]
- **Alternativas consideradas**: [Ex: Validação manual (rejeitado - não sistêmico)]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 8a (Meta-Learning) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] META-LEARNING: [Quantidade] learnings sistêmicos documentados" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + meta-learnings)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

**Workflow**: 8a/11 - Meta-Learning (Parte 1)
**Versão**: 4.0 (Ultra-Optimized)
**Data**: 2025-11-08

**Changelog v4.0**:
- Otimizado: Redução 62% (22,766 → 8,642 chars)
- Removido: Explicações verbose, checklists redundantes
- Consolidado: Seções similares, exemplos duplicados
- Mantido: TODAS fases críticas + framework meta-learning completo

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 9a] - Finalization**: Learnings extraídos → finalizar docs + commit atômico.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| Pareto analysis necessária | 8b (Pareto Analysis) | Identificar melhorias 80/20 |
| Learning sistêmico grave descoberto | 2b (Technical Design) | Redesenhar baseado no learning |
| Bug recorrente identificado (3+x) | 5b (Refactoring RCA) | Corrigir bug sistêmico |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| Learning mostra problema de design | 2b (Technical Design) | Redesenhar antes de finalizar |
| RCA revela escopo errado | 1 (Planning) | Re-planejar com escopo correto |
| Meta-learning requer novo gate | 4.5 (Pre-Implementation) | Adicionar gate preventivo |

### Regras de Ouro
- ⛔ **NUNCA pular**: RCA 5 Whys - learnings sem causa raiz são inúteis
- ⚠️ **Learning não sistêmico**: DESCARTAR - só documentar se afeta múltiplas features
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto

