---
description: Workflow Add-Feature (2b/11) - Technical Design & Validation
auto_execution_mode: 1
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 2a

**Este é o Workflow 2b - Continuação de:**

← [Workflow 2a - Solutions](.windsurf/workflows/add-feature-2a-solutions.md)

**Pré-requisito**: Solução deve ter sido escolhida e documentada no Workflow 2a.

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `README.md` - Descrição do projeto
- `AGENTS.md` - Comportamento dos agents
- `.windsurf/workflows` - Todos workflows em etapas (arquivos diferentes)
- `docs/` - Todos documentos importantes
- `scripts/` - Todos scrips importantes

---

## 🤖 CRÍTICO: Uso Máximo de Agentes (Claude Code)

> **🚨 REGRA ABSOLUTA E OBRIGATÓRIA 🚨**
>
> **SEMPRE** usar o **MÁXIMO de agentes possível** em paralelo para validação técnica.
>
> Esta seção pode requerer:
> - Análise de viabilidade técnica (agent 1)
> - Verificação de dependências (agent 2)
> - Revisão de código similar (agent 3)
> - Análise de performance (agent 4)
> - Root Cause Analysis profunda (agent 5)

---

# Workflow 2b/11: Technical Design & Validation

Este é o **segundo workflow (parte B)** de 11 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 3: Design Técnico Detalhado
- Fase 4: Validação da Solução
- Root Cause Analysis (quando aplicável)
- ADR (Architecture Decision Record) se necessário

---

## 🔍 Root Cause Analysis (RCA) - QUANDO APLICÁVEL

**⚠️ USAR APENAS SE**: Você está resolvendo um problema/bug arquitetural ou decisão técnica problemática.

**PULAR ESTA SEÇÃO SE**: Esta é uma nova feature sem problema prévio.

---

### Quando Usar RCA Neste Workflow

Use RCA na **Fase 3 (Technical Design)** quando:
- ✅ Arquitetura atual não escala (ex: state management inadequado)
- ✅ Design pattern causou problemas recorrentes
- ✅ Performance degradou por decisão arquitetural
- ✅ Refatoração necessária por design ruim

**Exemplos**:
- "State machine atual não suporta novos estados" → RCA necessário
- "Adicionar novo card ao dashboard" → RCA NÃO necessário (nova feature)
- "Cache strategy causa bugs intermitentes" → RCA necessário

---

### Técnica: 5 Whys para Análise Arquitetural

**Template**:
```
1. Por quê problema ocorre? → [sintoma]
2. Por quê disso? → [causa próxima]
3. Por quê? → [causa intermediária]
4. Por quê não foi prevenido? → [falha design]
5. Por quê? → [CAUSA RAIZ]

**Ação**: [Como resolver + prevenir recorrência]
```

---

### Exemplos de RCA na Prática

**Ex 1 (Email)**: Email não salvou → metadata.whatsapp_state erro → Coluna não existe → Migration não criou → Código antes de migration → **Causa Raiz**: Sem checklist "Schema First" → **Ação**: Gate obrigatório: schema validado antes de código

**Ex 2 (Webhook)**: Parsing falhou → payload structure undefined → API mudou → Sem validação → Paths hardcoded → **Causa Raiz**: Não validar APIs externas → **Ação**: Zod validation + ADR 007 (Adaptive Parser)

**Ex 3 (State)**: State machine não escala → Lógica espalhada → Sem coordenação → useState local → MVP não considerou crescimento → **Causa Raiz**: Arquitetura MVP sem "path to scale" → **Ação**: Context API ou Zustand + ADR

---

### Como Aplicar RCA na Solução Escolhida

1. Identificar problema arquitetural
2. Executar 5 Whys até causa raiz
3. Validar que solução resolve CAUSA RAIZ (não sintomas)
4. Documentar prevenção (ADR, checklists, tests)
5. Implementar gates preventivos

---

### Benefícios do RCA:
- ✅ Evita sintomas vs causa raiz
- ✅ Previne recorrência (design melhor)
- ✅ Identifica falhas sistêmicas
- ✅ Documenta aprendizado

---

### Quando PULAR RCA

**NÃO usar RCA se**:
- ❌ Nova feature sem problema prévio
- ❌ Melhoria incremental simples
- ❌ Problema é óbvio (ex: typo, bug trivial)
- ❌ Primeira ocorrência sem padrão

**Economiza tempo**: RCA é poderoso mas tem overhead. Use quando necessário.

---

### Próximo Passo Após RCA

Se identificou causa raiz sistêmica, documentar em:

1. **Meta-Learning** (Workflow 8, Fase 17):
   - Lesson learned sobre arquitetura
   - Pattern a evitar/adotar
   - Processo a adicionar

2. **ADR** (Architecture Decision Record):
   - Se decisão arquitetural foi causa raiz
   - Documentar nova decisão com contexto do RCA
   - Exemplo: ADR 007 (Adaptive Parser) surgiu de RCA

3. **TROUBLESHOOTING.md**:
   - Se procedimento de debug específico
   - Como identificar problema similar no futuro
   - Checklist de validação

---

## 📋 Fase 3: Design Técnico Detalhado

**Solução escolhida**: [A / B / C / Customizada]

### Arquitetura Detalhada

**Componentes a criar/modificar**:
```
[Lista de componentes com responsabilidades]
```

**Hooks customizados**:
```
[Lista de hooks com lógica de negócio]
```

**Database Changes**:
```sql
-- Migrations necessárias
-- Incluir DDL completo
```

**API/Queries**:
```typescript
// Queries Supabase ou API calls
```

**Estado e Fluxo de Dados**:
```
[Diagrama ou descrição do fluxo de dados]
```

### Dependências

**Novas dependências** (se houver):
```json
{
  "dependencies": {
    "[package]": "[version]"
  }
}
```

**Justificativa**: [Por que adicionar esta dependência?]

---

## ✅ Fase 4: Validação da Solução

### Checklist de Viabilidade Técnica

- [ ] Solução é compatível com stack atual (React 18.3 + TypeScript 5.8 + Vite 5.4 + Supabase)
- [ ] Database schema suporta a feature (ou migrations planejadas)
- [ ] Performance targets são atingíveis (< 2s dashboard, < 3s AI responses)
- [ ] Segurança validada (RLS policies, secrets management)
- [ ] Custos de AI dentro do orçamento ($11-15/mês para 100 usuários)
- [ ] Dependencies não introduzem vulnerabilidades
- [ ] Testes são viáveis (unit + integration)
- [ ] Não quebra features existentes (backward compatibility)

### Análise de Impacto

**Features afetadas**:
- [Lista de features que podem ser impactadas]

**Mitigações**:
- [Como minimizar impacto em features existentes]

### Riscos Técnicos Identificados

1. **[Risco 1]**:
   - **Severidade**: Alta/Média/Baixa
   - **Mitigação**: [Como resolver]

2. **[Risco 2]**:
   - **Severidade**: Alta/Média/Baixa
   - **Mitigação**: [Como resolver]

---

## 📝 ADR (Architecture Decision Record) - SE NECESSÁRIO

**Criar ADR quando**:
- ✅ Decisão arquitetural significativa (state management, API design, etc)
- ✅ Trade-off importante foi feito (performance vs. simplicidade)
- ✅ Padrão novo foi introduzido no projeto
- ✅ RCA identificou necessidade de mudança arquitetural

**Template ADR**:

```markdown
# ADR [número]: [Título da Decisão]

**Status**: Proposto | Aceito | Rejeitado | Deprecated | Superseded by [ADR-XXX]

**Data**: [YYYY-MM-DD]

**Contexto**: [Qual problema estamos resolvendo? Por quê esta decisão é necessária?]

**Decisão**: [Qual solução foi escolhida? Descrever em detalhes.]

**Consequências**:
- **Positivas**:
  - [Benefício 1]
  - [Benefício 2]

- **Negativas**:
  - [Trade-off 1]
  - [Trade-off 2]

**Alternativas Consideradas**:
1. [Alternativa 1] - Rejeitada porque [razão]
2. [Alternativa 2] - Rejeitada porque [razão]

**Referências**:
- [Workflow ou discussão que originou]
- [Documentação técnica relevante]
```

**Localização**: `docs/adr/ADR-[número]-[título-kebab-case].md`

---

## ✅ Checkpoint: Design Técnico Validado!

**Validações completas**:
- ✅ RCA executado (se aplicável)
- ✅ Design técnico detalhado
- ✅ Viabilidade confirmada
- ✅ Riscos identificados e mitigados
- ✅ ADR criado (se necessário)

**Próxima etapa:** Análise de riscos e planejamento de mitigações!

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-3-risk-analysis.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-3-risk-analysis`

---

**Workflow criado em**: 2025-10-27
**Workflow atualizado em**: 2025-11-04
**Parte**: 2b de 11
**Próximo**: Risk Analysis (Análise de Riscos)
---
