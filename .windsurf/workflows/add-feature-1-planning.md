---
description: Workflow Add-Feature (1/9) - Planning e Entendimento
---

# Workflow 1/9: Planning (Entendimento e Contexto)

Este é o **primeiro workflow** de 9 etapas modulares para adicionar uma nova funcionalidade com segurança e qualidade.

**O que acontece neste workflow:**
- Fase 1: Entendimento e Contexto
- Fase 2: Análise de Documentação Existente
- Fase 3: Planejamento Profundo (Ultra Think, se necessário)

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

## 📋 Fase 1: Entendimento e Contexto

Antes de começar, vou fazer perguntas para entender completamente o que você precisa:

### Perguntas de Contexto
1. **Qual é a funcionalidade?** (ex: "Adicionar cards PROFIT (7/14/30/180d) no MakeUp")
2. **Onde vai aparecer na UI?** (página, seção, posição)
3. **Quais dados precisa?** (tabelas, campos, cálculos)
4. **Tem algum exemplo/referência?** (screenshot, outra feature similar)
5. **Qual a prioridade?** (urgente, normal, baixa)
6. **Tem algum risco conhecido?** (performance, breaking change, etc)

### Análise de Impacto
Baseado nas respostas, vou identificar:
- 🎨 **UI**: Componentes que serão criados/modificados
- 🪝 **Hooks**: Lógica de dados necessária
- 🗄️ **Database**: Tabelas/views/functions envolvidas
- 📊 **Performance**: Impacto em queries/carga
- 🔒 **Segurança**: RLS, validações necessárias
- 📚 **Docs**: Documentação a ser atualizada

---

## 📚 Fase 2: Análise de Documentação Existente

**IMPORTANTE**: Antes de planejar, SEMPRE verificar a pasta `docs/` para entender arquitetura existente e aproveitar código/padrões.

### 2.1 Verificar Documentação
```bash
# Explorar estrutura de documentação
ls -la docs/

# Verificar arquitetura
ls -la docs/architecture/
ls -la docs/arquitetura/

# Verificar features existentes
ls -la docs/features/

# Verificar ADRs (Architecture Decision Records)
ls -la docs/adr/

# Verificar regras de negócio
ls -la docs/regras-de-negocio/

# Verificar docs do Supabase
ls -la docs/supabase/
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

Se necessário, vou usar:
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
**Parte**: 1 de 9
**Próximo**: Solution Design (3 Soluções)
