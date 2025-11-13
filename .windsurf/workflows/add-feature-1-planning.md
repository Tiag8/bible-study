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

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler:
- `docs/PLAN.md`, `docs/TASK.md`, `README.md`
- `docs/` (TODA pasta), `supabase/` (TODA pasta)

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

## 🔄 Próximo Workflow

```
Acionar: .windsurf/workflows/add-feature-2-solutions.md
```

Ou manualmente: `/add-feature-2-solutions`

---

**Criado**: 2025-10-27 | **Atualizado**: 2025-11-08 | **Parte**: 1/11 | **Próximo**: Solution Design (3 Soluções)
