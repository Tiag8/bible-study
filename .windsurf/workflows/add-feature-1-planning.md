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

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Carregar Contexto

```bash
./scripts/context-read-all.sh  # Lê todos arquivos .context/
```

**Checklist**: Li INDEX.md? workflow-progress? temp-memory? decisions? attempts.log?

**Se NÃO leu**: ⛔ PARAR e ler AGORA.

---

## 🛡️ GATE 0: Deep Context Capture (/clarify) - OBRIGATÓRIO 🆕

**⚠️ CRÍTICO**: Capturar contexto COMPLETO antes de qualquer análise.

### Quando Executar GATE 0

- ✅ Pedido tem < 30 palavras E envolve criação/modificação
- ✅ Pedido menciona "ou", "talvez", "pode ser" (ambiguidade)
- ✅ Pedido afeta 2+ sistemas (front+back, back+db)
- ✅ É primeira mensagem de feature/bug nova
- ✅ Você não tem 100% clareza do que o usuário quer

### Executar /clarify

```bash
# Skill /clarify executa 3 fases:
# Fase 1: Contextualização técnica (busca teia no código/DB)
# Fase 2: Perguntas de contexto (loop até usuário validar)
# Fase 3: Persistir em .context/{branch}_context-captured.md
```

**Output esperado**:
```
📊 CONTEXTO TÉCNICO ENCONTRADO:
- Componentes: [lista]
- Hooks: [lista]
- Edge Functions: [lista]
- Tabelas DB: [lista]
- Dependências: [N arquivos]

✅ CHECKLIST CONTEXTO CAPTURADO:
- [x] Objetivo claro
- [x] Escopo definido (dentro/fora)
- [x] Comportamento esperado
- [x] Edge cases identificados
- [x] Integrações mapeadas

⏸️ CONTEXTO SUFICIENTE? (sim/não/mais perguntas)
```

### Validação GATE 0

```bash
./scripts/validate-context-captured.sh
# Exit 0 = GATE 0 PASSOU
# Exit 1 = GATE 0 FALHOU (executar /clarify)
```

**Checklist GATE 0**:
- [ ] Contexto técnico buscado automaticamente?
- [ ] Perguntas de contexto feitas ao usuário?
- [ ] Usuário confirmou "contexto suficiente"?
- [ ] Arquivo `.context/{branch}_context-captured.md` existe?

**⛔ SE FALHOU**: PARAR → Executar `/clarify` → Re-validar

**Log Decisão**:
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 0: Context Capture - [APROVADO/BLOQUEADO]" >> .context/${BRANCH_PREFIX}_attempts.log
```

**✅ SE APROVADO**: Prosseguir para Fase 0.5 (CSF Validation).

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

**✅ SE APROVADO**: Prosseguir para Fase 1.6 (Spec Generation + Clarify).

---

## 📐 Fase 1.6: SPECIFY - Preencher spec.md (REGRA #46)

**⚠️ CRÍTICO**: Preencher `{prefix}_spec.md` APÓS GATE 1 Reframing aprovado.

### 1.6.1 Localizar spec.md

**Arquivo**: `.context/{prefix}_spec.md` (criado por `context-init.sh`)

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
cat .context/${BRANCH_PREFIX}_spec.md
```

### 1.6.2 Preencher spec.md

**Preencher spec.md** com base no Reframing:
- **Overview**: Problema REFRAMADO (não original)
- **Problem Statement**: Para quem? Qual impacto?
- **Requirements**: Derivados do problema reframado
- **User Stories**: Como [persona], quero [ação], para [benefício]
- **Out of Scope**: O que NÃO está incluído (explícito)
- **Success Criteria**: Como saber que está PRONTO?

**Template Rápido**:
```markdown
## Requirements (spec.md)

### Functional Requirements
- [ ] FR-1: [Derivado do problema reframado]
- [ ] FR-2: [Testável com critério de aceite]

### Non-Functional Requirements
- [ ] NFR-1: Performance - [critério mensurável]
- [ ] NFR-2: Security - RLS obrigatório (lifetracker_*)

## User Stories
- US-1: Como [persona], quero [ação], para [benefício]
```

### 1.6.3 CLARIFY - Resolver Ambiguidades

**ANTES de prosseguir para análise de impacto**, resolver TODAS ambiguidades:

**Perguntas Obrigatórias para CADA requirement**:
- [ ] Requirement é TESTÁVEL? (critério de aceite explícito?)
- [ ] Existe CONTRADIÇÃO entre requirements?
- [ ] ESCOPO (IN/OUT) está claro?
- [ ] DEPENDÊNCIAS identificadas?
- [ ] EDGE CASES considerados?

**Técnica: 5 Whys para Requirements Vagos**:
```
Requirement: "Sistema deve ser rápido"
1. O que é rápido? → < 2 segundos
2. Para qual operação? → Dashboard load
3. Em qual cenário? → 100 usuários simultâneos
4. Com qual hardware? → VPS 2GB RAM
5. REQUIREMENT CLARO: "Dashboard carrega < 2s com 100 usuários em VPS 2GB"
```

**Transformação**:
```
❌ Ambíguo: "Suportar múltiplos usuários"
✅ Claro: "Suportar 1000 usuários ativos, 100 simultâneos, 10 req/s por usuário"
```

### 🛡️ GATE 1.6: Clarify Validation

**Checklist Obrigatório**:
- [ ] spec.md preenchido com requirements derivados do problema reframado?
- [ ] ZERO requirements ambíguos? (todos testáveis)
- [ ] Contradições resolvidas?
- [ ] Escopo IN/OUT documentado?
- [ ] Usuário validou clarificações?

**⛔ SE NÃO**: PARAR → Clarificar → Re-validar

**Log Decisão**:
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 1.6: Clarify - [APROVADO/BLOQUEADO]" >> .context/${BRANCH_PREFIX}_attempts.log
```

**✅ SE APROVADO**: Prosseguir para Análise de Impacto.

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

**Ver detalhes**: Workflow 8a (Meta-Learning) para processo completo.

**Quick Checklist**:
- [ ] Eficiência ≥ 8/10? Iterações ≤ 3?
- [ ] Gaps identificados? (validação/gate/script)
- [ ] RCA aplicado SE problema sistêmico?

**Regra**: ANTI-ROI - NUNCA calcular tempo/ROI. Ver `~/.claude/rules/08-communication.md` REGRA #7.

---

## ✅ FASE 4: CHECKPOINTS (REGRA #14)

**CRÍTICO**: Checkpoint após CADA ação atômica.

```bash
./scripts/checkpoint.sh "descrição da ação executada"
```

**Checklist**: Executei 1 ação? Mostrei evidência? Usuário validou? Logei em .context/?

**Ver**: `~/.claude/rules/05-git-deploy.md` REGRA #14 para detalhes.

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

**Criado**: 2025-10-27 | **Atualizado**: 2025-12-30 | **Parte**: 1/11

**v2.4** (2025-12-30):
- 🆕 GATE 0: Deep Context Capture (`/clarify` v2.0) - OBRIGATÓRIO
- 🆕 Script: `validate-context-captured.sh` (validação GATE 0)
- 🔄 Fluxo: GATE 0 → Fase 0.5 (CSF) → GATE 1 (Reframing)
- ✅ Problema resolvido: Contexto insuficiente antes de análise

**v2.3** (2025-12-28):
- 🔄 Fase 1.6: SPECIFY - Preencher `{prefix}_spec.md` (inline v2.0)
- 🔄 Spec.md agora em `.context/{prefix}_spec.md` (não mais em specs/)
- 🔄 Removida dependência de spec-init.sh (context-init.sh já cria)
- ✅ Integração com Spec-Driven Unified

**v2.2** (2025-12-27):
- 🆕 Fase 1.6: Spec Generation + Clarify (REGRA #46 Spec-Driven)
- 🆕 GATE 1.6: Clarify Validation (5 checks obrigatórios)
- ✅ Fonte: GitHub Spec Kit + OpenSpec

**v2.1** (2025-11-20):
- 🆕 Fase 0.5: CSF Validation (GATE 1, Workflow 4.5, Schema-First)
- 🔧 Enforcement: Pre-requisitos críticos obrigatórios
- ✅ ADR-031, ADR-021, REGRA #9

---

## 🧭 WORKFLOW NAVIGATOR

**Próximo**: Workflow 2a (Solutions) ou 2b (Technical Design)

**Desvios**: Bug crítico → fast-track | Decisão complexa → ultra-think

**Regra de Ouro**: ⛔ NUNCA pular GATE 1 Reframing. Dúvida? → skill `workflow-navigator`

