---
description: Workflow Add-Feature (8a/11) - Meta-Learning (Aprender ANTES de Documentar)
auto_execution_mode: 1
---

## 📚 Pré-requisito
SEMPRE ler: `docs/PLAN.md`, `docs/TASK.md`, `docs/INDEX.md`, `README.md`, `AGENTS.md`

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

### 16.1 Workflow
- [ ] Fase pulada/desnecessária? Qual? Ação?
- [ ] Fase confusa? Como clarificar?
- [ ] Faltou etapa? Onde inserir?
- [ ] Fase demorou? Como otimizar?

### 16.2 Scripts/Ferramentas
- [ ] Ideia novo script? Funcionalidade?
- [ ] Comando repetido 3+? Automatizar?

### 16.3 Root Cause Analysis (PRÉ-REQUISITO)

**Template RCA**:
```markdown
**Problema**: [Descrever]

**5 Whys**:
1. Por quê? → [Resposta imediata]
2. Por quê? → [Causa subjacente]
3. Por quê? → [Causa profunda]
4. Por quê? → [Processo/sistema]
5. Por quê? → [Causa raiz SISTÊMICA]

**Causa Raiz**: Sistêmica ou pontual?
- Sistêmica: Afeta múltiplas features → VÁLIDO
- Pontual: Afeta apenas feature atual → DESCARTAR

**Meta-Learning**: Como prevenir?
**Onde Documentar**: Workflow, AGENTS.md, ADR
**ROI**: [Quantificar ganho]
```

**Checklist**:
- [ ] RCA aplicado (5 Whys completos)
- [ ] Causa sistêmica (afeta múltiplas features) - SE NÃO: descartar
- [ ] Meta-learning previne recorrência
- [ ] ROI > 10x
- [ ] Documentação identificada

### 16.4 Código e Padrões
- [ ] Novo padrão? Descrever, documentar AGENTS.md
- [ ] Otimização/best practice? Ganho?
- [ ] Anti-pattern? Qual?
- [ ] Decisão arquitetural? Criar ADR

### 16.5 Segurança
- [ ] Nova vulnerabilidade? Tipo? Detectar?
- [ ] Padrão segurança? Documentar?
- [ ] Scripts segurança melhorar?

### 16.6 Documentação
- [ ] Estrutura docs/ OK? Melhorias?
- [ ] Tipo doc faltando? Qual?
- [ ] Doc inútil? Remover?
- [ ] ADRs úteis? Melhorias template?

### 16.7 Scripts e Automação
- [ ] Scripts OK? Problema? Corrigir?
- [ ] Script novo útil? Funcionalidade?
- [ ] Validações adequadas? Faltou?
- [ ] Mensagens erro claras? Melhorar?

### 16.8 Gate Validação 🚨

**⚠️ CHECKPOINT CRÍTICO**:
- [ ] Mínimo 1 learning identificado (se 0: re-analisar)
- [ ] RCA aplicado CADA learning (5 Whys completos)
- [ ] Causa raiz SISTÊMICA (não pontual)
- [ ] Meta-learning previne recorrência
- [ ] ROI quantificado

**⛔ SE < 1 LEARNING SISTÊMICO**: Re-executar Fase 16.

---

## 📋 Fase 17: Documentação

### 17.1 Novos Padrões → AGENTS.md
Documentar: padrão + exemplo + por quê

### 17.2 Decisões → ADR
Criar ADR: `docs/adr/XXX-titulo.md`

### 17.3 Feature → docs/features/
Atualizar: componentes, hooks, schemas

### 17.4 Regras Negócio → docs/regras-de-negocio/
Documentar: fórmulas, pesos, lógica

### 17.5 README.md (se necessário)
Atualizar se: nova feature importante, dependência crítica, novo script

### 17.6 INDEX.md 🚨 OBRIGATÓRIO

**Checklist**:
- [ ] Novos arquivos adicionados (debugging cases, snapshots, scripts)
- [ ] Estatísticas atualizadas: `ls -1 docs/adr/*.md | wc -l`
- [ ] Versão atualizada (data YYYY-MM-DD + incrementar versão)

**Por quê**: INDEX.md = mapa projeto. Se não atualizar, docs invisíveis.

### 17.7 CLAUDE.md 🚨 OBRIGATÓRIO

**Checklist**:
- [ ] Novos padrões código (seção "Convenções de Código")
- [ ] Changelog atualizado (final arquivo): data + versão + mudanças
- [ ] Meta-learnings críticos (se ROI > 10x)

**Por quê**: CLAUDE.md lido TODA sessão. Se não atualizar, repete erros.

### 17.8 Workflows Afetados 🚨 OBRIGATÓRIO

**Checklist**:
- [ ] Identificar workflows relacionados
  - Ex: Bug implementação → Workflow 5
  - Ex: Regressão validação → Workflow 6
  - Ex: Deploy falha → Workflow 11
- [ ] Adicionar gates/checklists específicos
- [ ] Adicionar avisos: "⚠️ Meta-Learning: [link debugging case]"

**Por quê**: Workflows = guias. Se não melhoram, sistema não evolui.

### 17.9 Validar Tamanho Workflows

**Executar**: `./scripts/validate-workflow-size.sh`
- Se > 12k: split em `workflow-Xa.md`, `workflow-Xb.md`

**Checklist**:
- [ ] Validação executada
- [ ] Todos workflows <= 12k chars
- [ ] Splits com navegação (se necessário)
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

**Processo**: Identificar → Propor → Aguardar aprovação → Aplicar → Commit `"meta: ..."` → Sincronizar template

---

## ✅ Checklist Final

### Fase 16 (Análise - OBRIGATÓRIO)
- [ ] Análise completa: perguntas 16.1-16.7 respondidas ou N/A
- [ ] Mínimo 1 learning sistêmico (Gate 16.8)
- [ ] RCA aplicado CADA learning (5 Whys completos)
- [ ] Causas raiz SISTÊMICAS (não pontuais)
- [ ] ROI quantificado cada meta-learning

### Fase 17 (Documentação - OBRIGATÓRIO)
- [ ] Documentação mapeada: AGENTS.md, ADRs, features (17.1-17.5)
- [ ] INDEX.md atualizado (17.6)
- [ ] CLAUDE.md atualizado (17.7)
- [ ] Workflows afetados melhorados (17.8)
- [ ] Validação workflow size executada (17.9)

### Gate Final
- [ ] Todos 3 arquivos críticos atualizados (INDEX.md, CLAUDE.md, workflows)
- [ ] Validação final checkpoint passou

---

## 🧠 Meta-Learning: Captura Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Evolução contínua do sistema.

### Questões de Reflexão (Responder TODAS)

**1. Eficiência Workflow (1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Qual fase ineficiente? Como melhorar?

**2. Iterações Usuário:**
- [ ] Número iterações: __
- [ ] Se > 3: Causa? Como tornar autônomo?

**3. Gaps Identificados:**
- [ ] Validação faltou? Onde inserir?
- [ ] Gate falhou? Melhorar?
- [ ] Comando repetiu 3+? Automatizar?

**4. RCA - Se identificou problema:**
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados? (validar causa sistêmica)
- [ ] Causa afeta múltiplas features? (SE NÃO: descartar)
- [ ] Meta-learning previne recorrência?

### Ações Melhoria (Se Aplicável)

**Documentação atualizar:**
- [ ] Este workflow precisa melhorias? → Descrever
- [ ] CLAUDE.md precisa novo padrão? → Especificar
- [ ] Novo script útil? → Nome + função
- [ ] ADR necessário? → Decisão arquitetural

**ROI Esperado:** [Estimar - ex: "20min/feature" ou "Previne 2h debugging"]

### ⚠️ IMPORTANTE

- **Só documentar learnings SISTÊMICOS** (não pontuais)
- **Aplicar RCA obrigatoriamente** (validar se sistêmico)
- **Consolidação final** no Workflow 8a

### Validação Tamanho Workflow
```bash
wc -c .windsurf/workflows/NOME_DESTE_WORKFLOW.md
# ✅ < 12000 chars | ❌ > 12000: Comprimir ou dividir
```

**Checklist Otimização** (se > 11k chars):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists similares
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows (se > 12k)

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

→ [Workflow 8b - PLAN.md + Análise Pareto](.windsurf/workflows/add-feature-8b-pareto-analysis.md)

**Próximas etapas** (Workflow 8b):
- Fase 18: Atualização PLAN.md
- Fase 19: Análise Pareto 80/20
- Fase 20: Próximos Passos

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

**Workflow**: 8a/11 - Meta-Learning (Parte 1)
**Versão**: 4.0 (Ultra-Optimized)
**Data**: 2025-11-08
**Próximo**: Workflow 8b - PLAN.md + Pareto

**Changelog v4.0**:
- Otimizado: Redução 62% (22,766 → 8,642 chars)
- Removido: Explicações verbose, checklists redundantes
- Consolidado: Seções similares, exemplos duplicados
- Mantido: TODAS fases críticas + framework meta-learning completo
