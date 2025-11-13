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

> **💡 MCPs Úteis**: `context7` (validar APIs libs), `gemini-cli` (análise arquitetura)
> Ver: `docs/integrations/MCP.md`

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

**Email**: metadata column missing → migration não criou → código before schema → **Causa**: Sem "Schema First" gate → **Ação**: Validar schema antes de código

**Webhook**: Parsing falhou → API mudou → sem validação → **Causa**: Não validar APIs externas → **Ação**: Zod validation + ADR

**State**: Machine não escala → useState local → **Causa**: MVP sem "path to scale" → **Ação**: Context API/Zustand + ADR

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

### 🔍 Pré-requisito: Validar Sincronização DB (OBRIGATÓRIO)

**SEMPRE executar ANTES de análise de schema**:

```bash
# Validar sincronização DB real vs types.ts vs migrations
./scripts/validate-db-sync.sh

# Se defasado, regenerar types
./scripts/regenerate-supabase-types.sh
```

**Por quê**:
- DB real pode diferir de migrations (falhas silenciosas)
- types.ts pode estar desatualizado (>3 dias)
- Análise baseada em código desatualizado = falsos positivos

**Regra**: NUNCA confiar em código estático. Source of truth = DB real.

---

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

**⚠️ METODOLOGIA: Escolha de Ferramentas**

**4 passos obrigatórios**:
1. **Check Current**: `cat package.json | jq '.dependencies'`
2. **Verify Versions**: `npm info @package-name version`
3. **Suggest 2-3 Options**: Incluir "usar existente" como opção
4. **Comparison Table**:
   | Critério | Opção A | Opção B | Opção C |
   |----------|---------|---------|---------|
   | Precisão | 85-90% | 70-75% | 85-90% |
   | Latência | +200ms | Base | +200ms |
   | Custo | +20% | Base | +20% |
   | Uso Atual | ✅ | ❌ | ✅ |
   | ★ | ⭐ | - | ⭐⭐ |

**Justificativa**: Por que esta opção vs. alternativas?

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

## 🚨 Validação Anti-Over-Engineering (OBRIGATÓRIO)

**CRÍTICO**: SEMPRE validar design técnico antes de aprovar.

### Checklist YAGNI/KISS
- [ ] **Design resolve problema REAL** (não edge cases hipotéticos)?
  - Problema documentado: [onde? evidência?]
  - vs "pode acontecer no futuro" ❌

- [ ] **Existe design mais SIMPLES**?
  - Alternativa simplificada: [descrever]
  - Por que não funciona: [evidência técnica]

- [ ] **Complexidade justificada por EVIDÊNCIA**?
  - Benchmark/docs oficiais: [link]
  - Caso real de uso: [exemplo concreto]
  - Relevância ao projeto: [como se aplica]

- [ ] **Posso validar com POC (10% do código)**?
  - POC: [prova de conceito mínima]
  - Critério de sucesso: [métrica mensurável]

### Red Flags Detectados?
- [ ] ❌ Mais de 3 camadas de abstração
- [ ] ❌ Padrões complexos para problema simples
- [ ] ❌ Otimização prematura (sem evidência de gargalo)
- [ ] ❌ Dependências "nice-to-have" (não must-have)

**Se 2+ red flags**: ⛔ REJEITAR design, simplificar

**Exemplo Real**:
- ❌ Implementar caching distribuído para 10 usuários
- ✅ useState + React Query (escala até 1000+ usuários)

**Ver**: `.claude/CLAUDE.md` → REGRA #10 Anti-Over-Engineering

---

## 📝 ADR (Architecture Decision Record) - SE NECESSÁRIO

**⚠️ ANTES DE CRIAR ADR**: Verificar ADRs existentes!

```bash
# Listar ADRs existentes
ls -1 docs/adr/

# Ver último número de ADR
ls -1 docs/adr/ | grep -E "^ADR-[0-9]+" | tail -1
```

**Criar ADR quando**:
- ✅ Decisão arquitetural significativa (state management, API design, etc)
- ✅ Trade-off importante foi feito (performance vs. simplicidade)
- ✅ Padrão novo foi introduzido no projeto
- ✅ RCA identificou necessidade de mudança arquitetural

**Não criar ADR duplicado**:
- ❌ Se ADR similar já existe, atualizar o existente (adicionar seção "Updates")
- ❌ Se ADR supersede anterior, marcar anterior como "Superseded by ADR-XXX"

**Template ADR** (`docs/adr/ADR-[número]-[título].md`):

```markdown
# ADR [número]: [Título]
**Status**: Proposto | Aceito | Rejeitado | Deprecated | Superseded by ADR-XXX
**Data**: YYYY-MM-DD

**Contexto**: Problema a resolver

**Decisão**: Solução escolhida

**Consequências**:
- Positivas: [benefícios]
- Negativas: [trade-offs]

**Alternativas**: [Opções rejeitadas e por quê]

**Referências**: [Workflow/docs relacionados]
```

---

## ✅ Checkpoint: Design Técnico Validado!

**Validações completas**:
- ✅ RCA executado (se aplicável)
- ✅ Design técnico detalhado
- ✅ Viabilidade confirmada
- ✅ Riscos identificados e mitigados
- ✅ ADR criado (se necessário)

---

## 👿 Advogado do Diabo: Validação Técnica (OBRIGATÓRIO)

**ANTES de Risk Analysis**, validar:

### Checklist de Validação
- [ ] **E se o oposto for verdade?** (ex: arquitetura NÃO escala?)
- [ ] **Problema é sintoma sistêmico?** (RCA aplicado se sim)
- [ ] **Fontes consultadas?**
  - [ ] Código similar (src/...), migrations, ADRs, padrões
- [ ] **Stack validado?** (package.json, dependencies, database schema)
- [ ] **Dependências atualizadas?** (`npm info X version`)
- [ ] **RCA se aplicável?** (5 Whys completos, causa raiz documentada)
- [ ] **Validação pré-implementação?** (POC necessário? Rollback plan?)

**Resultado**: ✅ APROVADO | ⚠️ AJUSTAR | ❌ REJEITAR

---

**Próxima etapa:** Análise de riscos e planejamento de mitigações!

---

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO**: Identificar melhorias sistêmicas (não pontuais).

### Questões de Reflexão

**1. Eficiência** (Nota 1-10): __/10
- Se < 8: Qual fase ineficiente? Como melhorar?

**2. Iterações**: __
- Se > 3: O que causou idas/vindas? Como tornar workflow mais claro?

**3. Gaps**:
- [ ] Validação faltou? Gate falhou? Comando repetiu 3+x?
- [ ] Ação: [Inserir checklist/melhorar gate/automatizar script]

**4. RCA** (se problema identificado):
- [ ] 5 Whys aplicados? Causa raiz SISTÊMICA (afeta múltiplas features)?
- [ ] Meta-learning previne recorrência? (não apenas corrige sintoma)

### Ações de Melhoria

**Documentação**:
- [ ] Workflow/CLAUDE.md/Script/ADR a atualizar? [Especificar]

**ROI**: [ex: "20min/feature futura" ou "Previne 2h debugging"]

**Consolidação**: Workflow 8a (Meta-Learning centralizado)

### Validação Tamanho

```bash
wc -c .windsurf/workflows/add-feature-2b-technical-design.md
# ✅ < 12000 chars | ❌ > 12000: Comprimir
```

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
