---
description: Workflow Add-Feature (8a/11) - Meta-Learning (Aprender ANTES de Documentar)
auto_execution_mode: 1
---

## 📚 Pré-requisito
SEMPRE ler: `docs/PLAN.md`, `docs/TASK.md`, `docs/INDEX.md`, `README.md`, `AGENTS.md`

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

# 4. Histórico completo (TODAS linhas - OBRIGATÓRIO para meta-learning)
cat .context/${BRANCH_PREFIX}_attempts.log

# 5. Loop de validação (TODOS iterações - análise meta-learning)
cat .context/${BRANCH_PREFIX}_validation-loop.md 2>/dev/null || echo "N/A"

# 6. TODOS arquivos .context/ adicionais (fonte primária meta-learning) 🚨 CRÍTICO
# Este script lê TODOS os 20+ arquivos .context/ da branch (zero perda de conhecimento)
# Inclui: debugging cases, quality gates, RCA retrospectives, web resolutions,
# technical design agents, implementation summaries, user validation checklists
./scripts/context-read-all.sh
```

### 0.3. Validação Context Loaded

**Checklist**:
- [ ] Li INDEX.md?
- [ ] Li workflow-progress.md (onde estou)?
- [ ] Li temp-memory.md (estado atual)?
- [ ] Li decisions.md (decisões já tomadas)?
- [ ] Li attempts.log COMPLETO (todo histórico, não apenas últimas 30)?
- [ ] Li validation-loop.md COMPLETO (todas iterações)?
- [ ] 🚨 Executei `./scripts/context-read-all.sh` e li TODOS os 20+ arquivos .context/?

**⚠️ CRÍTICO**: `.context/` é a **FONTE PRIMÁRIA** de aprendizado. Arquivos adicionais contêm:
- **Debugging Cases**: Erros críticos + soluções (ex: whatsapp-validation)
- **Quality Gates**: Validações preventivas (ex: quality-gates-4.5)
- **RCA Retrospectives**: Causas raiz sistêmicas (ex: rca-retrospective-summary, refactoring-rca)
- **Web Resolutions**: Resolução holística cenários complexos (ex: magic-link-login, cenario-2)
- **Technical Design Agents**: Decisões arquiteturais por agente (ex: agent-1-schema, agent-2-trigger)
- **Implementation Summaries**: Decisões técnicas completas
- **User Validation Checklists**: Validação manual E2E

**Perda de Contexto**: Se ler apenas 5 arquivos core (workflow-progress, temp-memory, decisions, attempts.log, validation-loop), você perde **76% do contexto** (16/21 arquivos). Meta-learnings ficam rasos, incompletos e não capturam padrões sistêmicos.

**Paper GCC (Oxford 2025)**: Working Memory +48% SOTA → só funciona se COMPLETO (zero perda).

**Se NÃO leu TODOS**: ⛔ PARAR e executar `./scripts/context-read-all.sh` AGORA.

### 0.4. Log Início Workflow

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 8a (Meta-Learning) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

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
**Próximo**: Workflow 8b - PLAN.md + Pareto

**Changelog v4.0**:
- Otimizado: Redução 62% (22,766 → 8,642 chars)
- Removido: Explicações verbose, checklists redundantes
- Consolidado: Seções similares, exemplos duplicados
- Mantido: TODAS fases críticas + framework meta-learning completo
