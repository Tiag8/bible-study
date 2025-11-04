---
description: Workflow Add-Feature (1/11) - Planning e Entendimento
auto_execution_mode: 1
---

# Workflow 1/11: Planning (Entendimento e Contexto)

Este é o **primeiro workflow** de 11 etapas modulares para adicionar uma nova funcionalidade com segurança e qualidade.

**O que acontece neste workflow:**
- Fase 1: Entendimento e Contexto (dinâmico e adaptativo)
- Fase 2: Análise de Documentação Existente
- Fase 3: Planejamento Profundo (Ultra Think, se necessário)

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

**Exemplo:**
- Phase 2 (Análise de Documentação): 3+ agentes explorando diferentes áreas (docs/, supabase/, código)
- Phase 3 (Planejamento Profundo): 5+ agentes analisando diferentes aspectos de impacto
- Investigações paralelas: UI/UX, Database, Backend, Performance, Segurança

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `README.md` - Documentação principal do projeto
- `docs/` - **TODA** a pasta de documentação
- `supabase/` - **TODA** a pasta do backend

---

## 📋 Fase 1: Entendimento e Contexto

### 🔍 Análise Dinâmica da Requisição

**PRIMEIRO**: Analisar a mensagem/requisição do usuário para identificar:
- Tipo de solicitação (bug, feature, otimização, análise, etc.)
- Escopo e complexidade aparente
- Áreas do projeto afetadas
- Nível de urgência

### ❓ Perguntas de Contexto (Dinâmicas)

**Baseado na sua requisição**, vou fazer perguntas específicas para eliminar ambiguidades:

#### Perguntas Fundamentais (sempre aplicáveis)
1. **Qual é o objetivo final?** (O que você quer alcançar com esta ação?)
2. **Qual é o critério de sucesso?** (Como saberemos que está funcionando corretamente?)

#### Perguntas Contextuais (adaptadas ao tipo de solicitação)

**Se for BUG/CORREÇÃO:**
- Onde está ocorrendo o problema? (página, componente, função)
- Quando começou a acontecer?
- Qual é o comportamento esperado vs atual?
- Já tentou alguma solução?

**Se for FEATURE/NOVA FUNCIONALIDADE:**
- Onde vai aparecer na UI? (página, seção, posição)
- Quais dados precisa? (tabelas, campos, cálculos)
- Tem algum exemplo/referência? (screenshot, outra feature similar)
- Qual a prioridade? (urgente, normal, baixa)

**Se for OTIMIZAÇÃO/MELHORIA:**
- O que está lento/ineficiente agora?
- Qual é a meta de performance? (tempo de resposta, etc.)
- Já identificou gargalos específicos?
- Tem métricas atuais para comparar?

**Se for ANÁLISE/AUDITORIA:**
- Qual é o escopo da análise? (tabelas, código, performance, etc.)
- O que você espera encontrar? (problemas, oportunidades, etc.)
- Já tem algum ponto de preocupação específico?
- Para que servirá esta análise? (decisão, planejamento, etc.)

**Se for REFACTOR/REORGANIZAÇÃO:**
- O que está funcionando mal atualmente?
- Qual é o problema de manutenção?
- Já pensou nos riscos da mudança?
- Quer manter compatibilidade?

#### Perguntas de Impacto e Risco
1. **Tem algum risco conhecido?** (performance, breaking change, dados, etc.)
2. **Afeta outros sistemas/funcionalidades?**
3. **Precisa de migração de dados?**
4. **Tem deadline específico?**

---

## ⏸️ **PONTO DE PARADA OBRIGATÓRIO**

**🚨 FLUXO PAUSADO - AGUARDANDO SUAS RESPOSTAS**

Por favor, responda às perguntas acima. **Só continuarei após suas respostas** para garantir 100% de entendimento e eliminar qualquer ambiguidade.

**Objetivo**: Garantir que eu entenda exatamente o que você precisa antes de prosseguir.

---

## *(Continuação só após suas respostas)*

### 📊 Análise de Impacto (será preenchida após suas respostas)

Baseado nas suas respostas, vou identificar:
- 🎨 **UI**: Componentes que serão criados/modificados
- 🪝 **Hooks**: Lógica de dados necessária
- 🗄️ **Database**: Tabelas/views/functions envolvidas
- 📊 **Performance**: Impacto em queries/carga
- 🔒 **Segurança**: RLS, validações necessárias
- 📚 **Docs**: Documentação a ser atualizada
- 🚨 **Riscos**: Potenciais problemas e mitigações

---

## 📚 Fase 2: Análise de Documentação Existente

**IMPORTANTE**: Antes de planejar, SEMPRE verificar a pasta `docs/` para entender arquitetura existente e aproveitar código/padrões.

### 2.1 Verificar Documentação
```bash
# Verificar TODA documentação
ls -la docs/

# Explorar pasta completa do backend Supabase
ls -la supabase/
```

### 2.2 Buscar Padrões e Código Reutilizável

**Perguntas a responder**:
- [ ] Existe feature similar já implementada? (em `docs/features/`)
- [ ] Há componentes que podem ser reutilizados? (verificar `docs/arquitetura/`)
- [ ] Existe ADR sobre decisões relacionadas? (em `docs/adr/`)
- [ ] Há regras de negócio aplicáveis? (em `docs/regras-de-negocio/`)
- [ ] Existem migrations/schemas relacionados? (em `docs/supabase/`)

### 2.3 Documentação Encontrada

**Resumo do que foi encontrado**:
- ✅ Features similares: [listar]
- ✅ Componentes reutilizáveis: [listar]
- ✅ ADRs relevantes: [listar]
- ✅ Regras de negócio: [listar]
- ✅ Schemas/Migrations: [listar]

**Código e padrões a aproveitar**:
- [Listar arquivos/código que pode ser reutilizado]

---

## 🎯 Fase 3: Planejamento Profundo (Ultra Think)

**IMPORTANTE**: Para features complexas ou decisões arquiteturais importantes, vou acionar o workflow Ultra Think.

### 3.1 Quando Usar Ultra Think?

Use quando:
- ✅ Feature complexa com múltiplas abordagens possíveis
- ✅ Decisão arquitetural importante
- ✅ Trade-offs não óbvios
- ✅ Impacto significativo em performance/escalabilidade
- ✅ Mudança que afeta múltiplos componentes

**Pular para planejamento simples** quando:
- ❌ Feature trivial e direta
- ❌ Padrão já estabelecido e claro
- ❌ Urgência extrema (mas com cuidado!)

### 3.2 Acionar Ultra Think (se aplicável)

Se necessário, vou usar**CRÍTICO**: Sempre siga os workflows em `.windsurf/workflows/`. NUNCA pule etapas, mesmo sob pressão.

**🚨 EXCEÇÃO**: Fast-Track para bugs críticos em produção
Se usuários estiverem bloqueados ou funcionalidade quebrada em produção:
- Usar workflow: `add-feature-fast-track-critical-bug.md`
- Foco: Correção rápida (< 2 horas)
- Obrigatório: Code review + security scan pós-fix
- Obrigatório: Documentação retrospectiva completa

**Por que esta exceção?**
- Meta-Learning mostrou que workflow completo demoraria 1 dia para bug crítico
- Fast-track resolveu em < 2 horas mantendo qualidade
- Usuários não ficam bloqueados desnecessariamente: [Descrição do problema/decisão]

```
Acionar workflow: .windsurf/workflows/ultra-think.md
Questão: [Descrição do problema/decisão]
```

**Output esperado do Ultra Think**:
- Múltiplas opções de solução (3-5)
- Análise de prós e contras
- Matriz de decisão
- Recomendação fundamentada
- Plano de implementação

---

## ✅ Checkpoint: Fase 1 Completa!

**O que temos até agora:**
- ✅ Contexto completo da funcionalidade
- ✅ Documentação existente analisada
- ✅ Código/padrões reutilizáveis identificados
- ✅ Ultra Think acionado (se necessário)

**Próxima etapa:** Propor 3 soluções diferentes e escolher a melhor!

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-2-solutions.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-2-solutions`

---

**Workflow criado em**: 2025-10-27
**Workflow atualizado em**: 2025-11-03
**Parte**: 1 de 11
**Próximo**: Solution Design (3 Soluções)