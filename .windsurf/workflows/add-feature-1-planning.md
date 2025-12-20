---
description: Workflow Add-Feature (1/11) - Planning e Entendimento
auto_execution_mode: 1
---

# Workflow 1/11: Planning (Entendimento e Contexto)

Primeiro workflow de 11 etapas modulares: Fase 1 (Entendimento), Fase 2 (Análise Docs), Fase 3 (Planejamento Profundo).

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar MÁXIMO de agentes em paralelo**:
- Phase 2: 3+ agentes (docs/, supabase/, código)
- Phase 3: 5+ agentes (UI/UX, Database, Backend, Performance, Segurança)
- ROI: Até 36x mais rápido

---

## 🎯 Skills para Navegação

Use **skills** para decisões de workflow:
- `workflow-navigator` - Recomenda qual workflow usar
- `party-mode` - Debate multi-agente para decisões complexas

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler:
- `docs/PLAN.md`, `docs/TASK.md`, `README.md`
- `docs/` (TODA pasta), `supabase/` (TODA pasta)

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
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 1 (Planning) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🚨 Fase 0.5: Validação Pre-Requisitos Críticos (CSF)

**⚠️ CRITICAL SUCCESS FACTORS - NUNCA PULAR**

**Objetivo**: Validar que workflows críticos foram executados ANTES de prosseguir.

### Checklist CSF (3 validações OBRIGATÓRIAS):

**1. GATE 1 Reframing Executado? (ADR-031)**
- [ ] attempts.log contém "GATE 1.*Reframing"?
- [ ] Perspectiva validada com usuário?
- [ ] Problema CERTO confirmado (não sintoma)?

**⛔ SE NÃO**: PARAR → Retornar Workflow 1 Fase 1.5 → Re-executar GATE 1

---

**2. Workflow 4.5 (Pre-Implementation Gates) Planejado? (ADR-021)**
- [ ] Feature envolve DB changes OU Edge Functions OU Tools?
- [ ] Workflow 4.5 agendado ANTES de Workflow 5a?
- [ ] 6 gates identificados (Tool, Runtime, FK, File Size, Anti-Over-Engineering, Schema-First)?

**⛔ SE SIM + NÃO PLANEJADO**: PARAR → Agendar Workflow 4.5 ANTES 5a

**ℹ️ SE NÃO** (feature apenas frontend estático): SKIP Workflow 4.5 → Documentar motivo em decisions.md

---

**3. Schema-First Validation Executada? (REGRA #9)**
- [ ] SE feature envolve DB: `./scripts/validate-schema-first.sh` executado?
- [ ] Source of truth validado (DB real > migrations > types)?
- [ ] Prefixo `lifetracker_` validado?

**⛔ SE NÃO**: PARAR → Executar validation → Corrigir divergências

---

### ✅ GATE 0.5 APROVADO

**Evidências**:
- [ ] GATE 1: attempts.log linha [número]
- [ ] Workflow 4.5: [AGENDADO para Workflow X] OU [SKIP - motivo: Y]
- [ ] Schema-First: [VALIDADO] OU [N/A - sem DB changes]

**Próximo**: Workflow 1 (Planning) → Fase 1 (Contexto)

---

## 📋 Fase 1: Entendimento e Contexto

### 🔍 Análise Dinâmica da Requisição

Identificar: tipo (bug/feature/otimização), escopo, áreas afetadas, urgência.

### ❓ Perguntas de Contexto (Dinâmicas)

**Fundamentais (sempre aplicáveis)**:
1. Qual é o objetivo final?
2. Qual é o critério de sucesso?

**Se for BUG/CORREÇÃO**:
- Onde ocorre? (página/componente/função)
- Quando começou?
- Comportamento esperado vs atual?
- Já tentou alguma solução?

**Se for FEATURE/NOVA FUNCIONALIDADE**:
- Onde aparece na UI?
- Quais dados precisa?
- Tem exemplo/referência?
- Qual prioridade?

**Se for OTIMIZAÇÃO/MELHORIA**:
- O que está lento/ineficiente?
- Meta de performance?
- Gargalos identificados?
- Métricas atuais?

**Se for ANÁLISE/AUDITORIA**:
- Escopo? (tabelas/código/performance)
- O que espera encontrar?
- Ponto de preocupação específico?
- Para que servirá?

**Se for REFACTOR/REORGANIZAÇÃO**:
- O que funciona mal?
- Problema de manutenção?
- Riscos da mudança?
- Manter compatibilidade?

**Impacto e Risco**:
1. Risco conhecido? (performance/breaking change/dados)
2. Afeta outros sistemas?
3. Migração de dados?
4. Deadline específico?

---

## ⏸️ PONTO DE PARADA OBRIGATÓRIO

**🚨 FLUXO PAUSADO - AGUARDANDO SUAS RESPOSTAS**

Responda às perguntas acima. **Só continuarei após suas respostas**.

---

## 🔄 Fase 1.5: Reframing do Problema (OBRIGATÓRIO)

**ANTES de análise de impacto**, validar problema CERTO:

### 3 Passos de Reframing

**Passo 1: Questionar Problema**
- [ ] Problema ou sintoma?
- [ ] Como EU defini ou como USUÁRIO percebe?
- [ ] Quem mais deveria opinar?

**Passo 2: Perspectivas Externas**
- [ ] Como usuário final descreveria?
- [ ] Stakeholders concordam?
- [ ] Dados contradizem suposição?

**Passo 3: ⭐ Pergunta Forte (OBRIGATÓRIA)**

> **"Qual problema, se resolvido, eliminaria múltiplos sintomas?"**

**Exemplo**:
```
❌ Apresentado: "Usuário quer botão vermelho"
🔄 Reframing: "Por que pediu botão vermelho?"
⭐ Pergunta Forte: "Qual problema elimina confusão + cliques errados + frustração?"
✅ Real: "Ações destrutivas sem affordance visual clara"
   → Solução: Sistema cores consistente (não apenas 1 botão)
```

**Resultado**:
- **Problema ORIGINAL**: [O que usuário pediu]
- **Problema REFRAMADO**: [O que realmente precisa resolver]

**Validação**:
- [ ] Abre soluções antes invisíveis?
- [ ] Resolve múltiplos sintomas?
- [ ] Mais sistêmico que original?

---

## 🛡️ GATE 1: Reframing Validation (OBRIGATÓRIO)

**⚠️ CRÍTICO**: GATE de aprovação ANTES de prosseguir.

**Checklist Obrigatório**:
- [ ] Executei 3 Passos Reframing acima?
- [ ] Pergunta Forte foi aplicada? ("Qual problema elimina múltiplos sintomas?")
- [ ] Problema reframado abre 3+ soluções possíveis?
- [ ] Usuário validou problema REFRAMADO (não original)?

**SE 1+ check FALHOU**: ⛔ PARAR workflow. Re-executar Reframing.

**Meta-Learning** (ML-CONTEXT-06):
- Reframing GATE elimina 90% backtracking
- feat-sync-crud: 4 fases retrabalho (sem GATE)
- feat-payment-gateway: 0 fases retrabalho (com GATE preventivo)

**Documentação**: ADR-021, CLAUDE.md REGRA #3

**Log Decisão**:
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 1: Reframing - [APROVADO/BLOQUEADO]" >> .context/${BRANCH_PREFIX}_attempts.log
```

**✅ SE APROVADO**: Prosseguir para Análise de Impacto abaixo.

---

### 📊 Análise de Impacto (após suas respostas)

Identificar:
- 🎨 UI: Componentes criados/modificados
- 🪝 Hooks: Lógica de dados
- 🗄️ Database: Tabelas/views/functions
- 📊 Performance: Impacto queries/carga
- 🔒 Segurança: RLS, validações
- 📚 Docs: Documentação a atualizar
- 🚨 Riscos: Problemas e mitigações

---

## 📚 Fase 2: Análise de Documentação Existente

**ANTES de planejar**, verificar `docs/` e `supabase/`.

### 2.1 Verificar Documentação
```bash
ls -la docs/ supabase/
```

### 2.2 Buscar Padrões e Código Reutilizável

**Perguntas**:
- [ ] Feature similar já implementada? (`docs/features/`)
- [ ] Componentes reutilizáveis? (`docs/arquitetura/`)
- [ ] ADR sobre decisões relacionadas? (`docs/adr/`)
- [ ] Regras de negócio aplicáveis? (`docs/regras-de-negocio/`)
- [ ] Migrations/schemas relacionados? (`docs/supabase/`)

### 2.3 Documentação Encontrada

**Resumo**:
- ✅ Features similares: [listar]
- ✅ Componentes reutilizáveis: [listar]
- ✅ ADRs relevantes: [listar]
- ✅ Regras de negócio: [listar]
- ✅ Schemas/Migrations: [listar]

---

## 🎯 Fase 3: Planejamento Profundo (Ultra Think)

### 3.1 Quando Usar Ultra Think?

**Use quando**:
- ✅ Feature complexa com múltiplas abordagens
- ✅ Decisão arquitetural importante
- ✅ Trade-offs não óbvios
- ✅ Impacto significativo performance/escalabilidade
- ✅ Mudança afeta múltiplos componentes

**Pular quando**:
- ❌ Feature trivial e direta
- ❌ Padrão já estabelecido
- ❌ Urgência extrema (com cuidado!)

### 3.2 Acionar Ultra Think (se aplicável)

```
Acionar workflow: .windsurf/workflows/ultra-think.md
Questão: [Descrição do problema/decisão]
```

**Output esperado**:
- Múltiplas opções (3-5)
- Prós e contras
- Matriz de decisão
- Recomendação fundamentada
- Plano de implementação

**🚨 EXCEÇÃO Fast-Track**: Para bugs críticos em produção (usuários bloqueados):
- Workflow: `add-feature-fast-track-critical-bug.md`
- Foco: Correção < 2h
- Obrigatório: Code review + security scan pós-fix + docs retrospectiva

---

## 🔍 Root Cause Analysis (RCA) - OPCIONAL

**Quando usar**: Se identificar problema/bug durante workflow.

### Técnica: 5 Whys

Pergunte "Por quê?" 5 vezes até **causa raiz**:

**Exemplo**:
```
Problema: Email não salvou

1. Por quê? → Campo metadata.whatsapp_state erro
2. Por quê? → Coluna metadata não existe
3. Por quê? → Migration nunca criou JSONB
4. Por quê? → Código antes de migration
5. Por quê? → Faltou checklist "Schema-First"

✅ Causa Raiz: Falta checklist pre-implementation
```

**Template**:
- **Problema**: [Sintoma]
- **5 Whys**: [Perguntas e respostas 1-5]
- **Causa Raiz**: [Resposta 5]
- **Ação Corretiva**: [Prevenir recorrência]

**Quando NÃO usar**:
- ❌ Problema trivial (typo)
- ❌ Primeira ocorrência sem padrão
- ❌ Causa óbvia

**Documentar em**: Meta-Learning (Workflow 8), ADR, ou TROUBLESHOOTING.md

---

## ✅ Checkpoint: Fase 1 Completa!

**O que temos**:
- ✅ Contexto completo
- ✅ Documentação analisada
- ✅ Código/padrões reutilizáveis identificados
- ✅ Ultra Think acionado (se necessário)

**Próxima etapa**: Propor 3 soluções e escolher melhor!

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua.

### Questões de Reflexão (TODAS)

**1. Eficiência (Nota 1-10)**:
- [ ] Nota: __/10
- [ ] Se < 8: Fase ineficiente? Como melhorar?
- [ ] Alguma fase demorou muito? Qual? Por quê?

**2. Iterações**:
- [ ] Número: __
- [ ] Se > 3: O que causou múltiplas idas e vindas?
- [ ] Como tornar workflow mais autônomo?

**3. Gaps**:
- [ ] Validação faltou? (Onde inserir checklist?)
- [ ] Gate falhou detectar erro? (Melhorar qual?)
- [ ] Comando repetido 3+ vezes? (Automatizar em script?)

**4. RCA (se identificou problema)**:
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados? (causa raiz sistêmica?)
- [ ] Afeta múltiplas features? (SE NÃO: descartar - não é sistêmico)
- [ ] Meta-learning previne recorrência? (não apenas corrige sintoma)

### Ações de Melhoria

**Documentação a atualizar**:
- [ ] Workflow (.md) precisa melhorias? → Descrever alterações
- [ ] CLAUDE.md precisa seção nova? → Especificar
- [ ] Novo script útil? → Nome + função
- [ ] ADR necessário? → Decisão arquitetural

**ROI Esperado**: [Ex: "20min economizadas/feature" ou "Previne 2h debugging"]

**IMPORTANTE**:
- Só learnings SISTÊMICOS (não pontuais)
- Aplicar RCA para validar
- Consolidação final: Workflow 8a

### Validação Tamanho

```bash
wc -c .windsurf/workflows/add-feature-1-planning.md
# ✅ < 12000 chars (12k limit)
```

**Se workflow > 11k**:
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists similares
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows (se > 12k)

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

## ✅ FASE 4: CHECKPOINTS (REGRA #13 - Uma Ação Por Vez)

**CRÍTICO**: Durante todo este workflow, SEMPRE executar checkpoint após CADA ação atômica.

### 4.1. O que é uma Ação Atômica?

**Ação atômica** = Menor unidade testável e reversível.

**Exemplos deste workflow**:
- ✅ "Ler e analisar docs/PLAN.md"
- ✅ "Executar Reframing do problema"
- ✅ "Identificar arquivos afetados no database"
- ✅ "Executar Ultra Think para decisão arquitetural"
- ❌ "Fazer todo planejamento" (NÃO atômico - múltiplas ações)

### 4.2. Checkpoint Obrigatório (Após Cada Ação)

**Usar script automatizado**:
```bash
./scripts/checkpoint.sh "descrição da ação executada"
```

**Ou manualmente**:

**Template de Checkpoint**:
```
✅ AÇÃO COMPLETA: [descrição da ação]

📸 EVIDÊNCIA:
[screenshot, log, diff, análise feita]

🔍 VALIDAÇÃO:
- [x] Ação executada com sucesso
- [x] Sem erros/warnings
- [x] Output documentado
- [x] Próxima ação identificada

🎯 PRÓXIMA AÇÃO PROPOSTA:
[descrição da próxima ação]

⏸️ AGUARDANDO APROVAÇÃO do usuário para continuar.
```

### 4.3. Checklist Checkpoint (Executar a Cada Ação)

- [ ] **Executei apenas 1 ação?**
- [ ] **Mostrei evidência ao usuário?** (análise, documentos lidos, output)
- [ ] **Usuário validou?** (aprovação explícita)
- [ ] **Documentei em `.context/`?** (attempts.log)
- [ ] **Identifiquei próxima ação?** (planejamento incremental)

### 4.4. Exemplo de Aplicação (Workflow 1)

**Fluxo com Checkpoints**:

```
1. AÇÃO: "Ler docs/PLAN.md"
   → Executar → Checkpoint → Aprovação

2. AÇÃO: "Executar Reframing do problema"
   → Executar → Checkpoint → Aprovação

3. AÇÃO: "Identificar features similares em docs/features/"
   → Executar → Checkpoint → Aprovação

4. AÇÃO: "Analisar impacto no database"
   → Executar → Checkpoint → Aprovação

5. AÇÃO: "Executar Ultra Think (se aplicável)"
   → Executar → Checkpoint → Aprovação
```

### 4.5. Quando NÃO Aplicar Checkpoint

**Exceções** (ações podem ser agrupadas):
- ✅ **Leitura múltipla**: Ler 3 docs em sequência (não muda estado)
- ✅ **Análise agregada**: Grep + Find + Análise (apenas busca)

**MAS**: Mesmo nas exceções, mostrar resultado ANTES de próxima ação.

### 4.6. Benefícios no Workflow 1

**Eficiência**:
- ✅ Reframing validado ANTES de análise profunda
- ✅ Documentação encontrada ANTES de Ultra Think
- ✅ Zero retrabalho (cada etapa validada)

**Colaboração**:
- ✅ Usuário vê progresso incremental
- ✅ Feedback loop rápido (30seg por checkpoint)
- ✅ Correção de rota imediata (se necessário)

### 4.7. Documentação Automática

Cada checkpoint DEVE logar em `.context/attempts.log`:

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] CHECKPOINT: [ação] - SUCCESS" >> .context/${BRANCH_PREFIX}_attempts.log
```

**Ver**: REGRA #13 em `.claude/CLAUDE.md` para detalhes completos.

---

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 1: Planning ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Análise dinâmica da requisição
  - Reframing do problema (problema CERTO identificado)
  - Análise de impacto (UI, hooks, database, performance, segurança)
  - Análise de documentação existente
  - Planejamento profundo (Ultra Think se aplicável)
  - RCA (se problema/bug identificado)
- **Outputs**:
  - Contexto completo
  - Problema reframado validado
  - Documentação/código reutilizável identificado
  - Plano de implementação (se Ultra Think usado)
- **Next**: Workflow 2a (Solutions)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 1 (Planning) concluído com sucesso.

**Problema identificado**: [Descrever problema REFRAMADO]

**Próximo passo**: Executar Workflow 2a (Solutions) para propor 3 soluções viáveis.

---

## Próximos Passos

- [ ] Executar Workflow 2a (Solutions)
- [ ] Propor 3 soluções com matriz de decisão
- [ ] Selecionar solução com usuário

---

## Decisões Pendentes

- [ ] Escolher solução (entre 3 opções do Workflow 2a)

EOF

# Substituir seção no arquivo original (preservar "Última Atualização")
sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se escolhemos usar Ultra Think
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 1 - Planning
- **Decisão**: Usar Ultra Think para planejamento profundo
- **Por quê**: Feature complexa com múltiplas abordagens possíveis
- **Trade-off**: +30min planejamento, mas previne retrabalho
- **Alternativas consideradas**: Planning simples (rejeitado - risco alto)
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 1 (Planning) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] DECISION: Problema reframado - [descrever]" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + decisões)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🔄 Próximo Workflow

```
Acionar: .windsurf/workflows/add-feature-2-solutions.md
```

Ou manualmente: `/add-feature-2-solutions`

---

**Criado**: 2025-10-27 | **Atualizado**: 2025-11-20 | **Parte**: 1/11

**v2.1** (2025-11-20):
- 🆕 Fase 0.5: CSF Validation (GATE 1, Workflow 4.5, Schema-First)
- 🔧 Enforcement: Pre-requisitos críticos obrigatórios
- ✅ ADR-031, ADR-021, REGRA #9

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 2a/2b] - Solutions/Technical Design**: GATE 1 Reframing aprovado → propor soluções técnicas.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| Problema trivial, solução óbvia | 2b (Technical Design) | Pular 2a se apenas 1 solução viável |
| Bug crítico em produção | fast-track-critical-bug | Correção urgente < 2h |
| Decisão arquitetural complexa | ultra-think | Análise profunda antes de soluções |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| GATE 1 Reframing falhou | 1 Fase 1.5 | Re-executar Reframing até aprovar |
| Escopo não está claro | 1 Fase 1 | Fazer mais perguntas de contexto |
| Usuário não validou problema | 1 Fase 1.5 | Reframing precisa aprovação |

### Regras de Ouro
- ⛔ **NUNCA pular**: GATE 1 Reframing - problema ERRADO = feature ERRADA
- ⚠️ **Re-executar GATE 1 se**: Problema parece sintoma, não causa raiz
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto

