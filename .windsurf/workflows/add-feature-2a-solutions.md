---
description: Workflow Add-Feature (2a/11) - Solution Design (Research & Decision)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler:
- `docs/PLAN.md`, `docs/TASK.md`, `README.md`, `AGENTS.md`
- `.windsurf/workflows`, `docs/`, `scripts/`

---

## 🤖 CRÍTICO: Uso Máximo de Agentes (Claude Code)

> **🚨 REGRA ABSOLUTA 🚨**
>
> **SEMPRE** usar o **MÁXIMO de agentes possível** em paralelo para analisar as 3 soluções propostas.
>
> - Exploração arquitetura (agent 1), dependências (agent 2), performance (agent 3), código similar (agent 4), risco (agent 5)
> - 3 soluções = 3-5 agentes paralelos = 4-5x mais rápido

---

# Workflow 2a/11: Solution Design - Research & Decision

**O que acontece**:
- Fase 1: Propor 3 Soluções Diferentes (A, B, C)
- Fase 2: Comparação Prós/Contras/Trade-offs
- Recomendação fundamentada
- **GATE 1**: Usuário escolhe solução

**Por que 3 soluções?**
- ✅ Força IA a pensar profundamente (não aceitar primeira ideia)
- ✅ Usuário tem opções (poder de decisão)
- ✅ Considera trade-offs (simplicidade vs. otimização)

---

## 📐 Fase 1: Propor 3 Soluções Diferentes

> **💡 MCPs Úteis**: `firecrawl-mcp` (pesquisa mercado), `context7` (docs libs), `gemini-cli brainstorm` (ideação)
> Ver: `docs/integrations/MCP.md`

### 🅰️ Solução A: Conservadora/Simples

**Abordagem**: [Descrever abordagem mais simples e direta]

**Arquitetura**:
- **Componentes**: [listar]
- **Hooks**: [listar]
- **Database**: [mudanças necessárias]
- **Queries**: [estratégia]

**Exemplo de código**:
```typescript
// Exemplo ilustrativo da solução A
```

**Tempo estimado**: [X horas]

---

### 🅱️ Solução B: Moderada/Balanceada

**Abordagem**: [Descrever abordagem intermediária, balanceando simplicidade e otimização]

**Arquitetura**:
- **Componentes**: [listar]
- **Hooks**: [listar]
- **Database**: [mudanças necessárias]
- **Queries**: [estratégia]

**Exemplo de código**:
```typescript
// Exemplo ilustrativo da solução B
```

**Tempo estimado**: [X horas]

---

### 🅲 Solução C: Avançada/Otimizada

**Abordagem**: [Descrever abordagem mais sofisticada, com otimizações]

**Arquitetura**:
- **Componentes**: [listar]
- **Hooks**: [listar]
- **Database**: [mudanças necessárias]
- **Queries**: [estratégia]

**Exemplo de código**:
```typescript
// Exemplo ilustrativo da solução C
```

**Tempo estimado**: [X horas]

---

## ⚖️ Fase 2: Comparação - Prós, Contras e Trade-offs

### Matriz de Decisão

| Critério | A (Simples) | B (Balanceada) | C (Otimizada) |
|----------|-------------|----------------|---------------|
| **Simplicidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Manutenibilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Escalabilidade** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Time to Market** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Risco** | Baixo | Médio | Alto |
| **Tempo** | [X]h | [Y]h | [Z]h |

### Prós e Contras

#### Solução A (Simples)
**Prós**: ✅ Rápida, fácil manter, baixo risco, menor complexidade
**Contras**: ❌ Performance não ideal, pode precisar refatorar depois
**Quando**: Prioridade é velocidade, feature experimental/MVP, baixo volume

---

#### Solução B (Balanceada)
**Prós**: ✅ Equilíbrio simplicidade/performance, escalável, risco controlado
**Contras**: ❌ Mais complexo que A, pode ser over-engineering se volume baixo
**Quando**: Projeto maduro, quer evitar refatoração futura, volume médio-alto

---

#### Solução C (Otimizada)
**Prós**: ✅ Performance máxima, escalável alto volume, preparado para crescimento
**Contras**: ❌ Maior complexidade, mais difícil manter, maior tempo, risco bugs
**Quando**: Performance crítica, volume muito alto, orçamento/tempo para investir

---

## 💡 Recomendação

Baseado no contexto, **recomendo a Solução [A/B/C]**.

**Justificativa**:
[Explicar considerando: contexto Life Tracker, prioridade feature, recursos disponíveis, volume dados, crescimento futuro, risco aceitável]

**Evolução futura**:
- A → B quando [condição]
- B já preparado para [cenário]
- C garante [benefício]

---

## ✋ GATE 1: Escolha da Solução

**⚠️ PARADA OBRIGATÓRIA - Decisão do Usuário**

**Qual solução implementar?**

**Opções**:
1. **A** (Simples/Rápida)
2. **B** (Balanceada)
3. **C** (Otimizada)
4. **Combinar** (mix) - explique
5. **Ajustar** - explique o quê

**Por que importa?**
- ✅ Controle sobre trade-offs (velocidade vs. qualidade)
- ✅ Sistema aprende suas preferências
- ✅ Evita aceitar cegamente primeira proposta
- ✅ Garante alinhamento estratégico

**Aguardando decisão...** 🚦

---

## ✅ Checkpoint: Solução Escolhida!

**Solução selecionada**: [A / B / C / Customizada]

---

## 👿 Advogado do Diabo: Validação Crítica (OBRIGATÓRIO)

**ANTES de prosseguir**, responder:

### Validação de Suposições
- [ ] **E se o oposto for verdade?** (desafiar premissa)
  - Ex: E se usuários NÃO querem esta feature?
  - Resposta: [análise]

- [ ] **O que NÃO estamos vendo?** (blind spots)
  - Ex: Esquecemos mobile/offline?
  - Resposta: [análise]

### Validação de Fontes ⭐
- [ ] **Quais são suas fontes?**
  - Lista completa de docs/código consultado:
    - [ ] docs/PLAN.md (linha X)
    - [ ] supabase/migrations/...
    - [ ] src/components/...

- [ ] **Pesquisou nos lugares certos?**
  - ✅ Verificado: [listar]
  - ❌ Faltou: [gaps]

- [ ] **Fontes atualizadas?**
  - ✅ Recentes (< 1 semana)
  - ⚠️ Médios (1 sem - 1 mês)
  - ❌ Antigos (> 1 mês) ← revalidar!

### Validação de Abordagem
- [ ] **Executamos Reframing?** (problema CERTO?)
  - Ref: Workflow 1, Fase 1.5
  - Validado: Sim/Não

- [ ] **Custo de oportunidade?**
  - O que NÃO faremos se escolher essa solução?
  - Trade-offs aceitáveis?

- [ ] **O que pode dar errado?**
  - Top 3 riscos
  - Mitigações planejadas

**Ver**: `.claude/CLAUDE.md` → Seção "Advogado do Diabo"

**Resultado**: ✅ APROVADO | ⚠️ AJUSTAR | ❌ REJEITAR

---

## 🚨 Validação Anti-Over-Engineering (OBRIGATÓRIO)

**CRÍTICO**: SEMPRE validar se solução não é over-engineered ANTES de aprovar.

### Checklist YAGNI/KISS
- [ ] **Solução resolve problema REAL** (não futuro hipotético)?
  - Evidência de necessidade: [citar fonte/dado concreto]
  - vs "futuramente pode precisar" ❌

- [ ] **Existe alternativa mais SIMPLES**?
  - Opção simplificada: [descrever]
  - Por que não funciona: [razão baseada em evidência]

- [ ] **Complexidade justificada por EVIDÊNCIA**?
  - Fonte: [doc oficial, benchmark, caso real]
  - Link: [URL acessível]
  - Relevância: [como se aplica AQUI]

- [ ] **Posso validar com MVP (10% do código)**?
  - MVP: [versão mínima viável]
  - Validação incremental: [como testar antes de implementar tudo]

### Red Flags Detectados?
- [ ] ❌ Abstrações > 3 camadas
- [ ] ❌ Padrões de design sem justificativa
- [ ] ❌ Features "para o futuro"
- [ ] ❌ Over-optimization prematura

**Se 2+ red flags**: ⛔ REJEITAR solução, pedir simplificação

**Exemplo Over-Engineering (NÃO fazer)**:
- MCP Sentry: Prometia debug via MCP, mas curl + API faz o mesmo
- Overhead: Config, manutenção, docs
- Decisão: REMOVIDO (este workflow implementou regra para prevenir)

**Ver**: `.claude/CLAUDE.md` → REGRA #10 Anti-Over-Engineering

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua.

### Questões de Reflexão (Responder TODAS)

**1. Eficiência (Nota 1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Fase ineficiente? Como melhorar?

**2. Iterações com Usuário:**
- [ ] Número: __
- [ ] Se > 3: O que causou? Como tornar mais autônomo?

**3. Gaps Identificados:**
- [ ] Validação faltou? (qual? onde inserir?)
- [ ] Gate falhou? (qual melhorar?)
- [ ] Comando repetido 3+? (automatizar?)

**4. RCA - Se identificou problema:**
- [ ] Problema: [breve]
- [ ] 5 Whys aplicados? (causa raiz sistêmica?)
- [ ] Afeta múltiplas features? (SE NÃO: descartar - não sistêmico)
- [ ] Meta-learning previne recorrência?

### Ações de Melhoria (Se Aplicável)

**Documentação a atualizar:**
- [ ] Este workflow precisa melhorias? → Descrever
- [ ] CLAUDE.md precisa novo padrão? → Especificar
- [ ] Novo script útil? → Nome + função
- [ ] ADR necessário? → Decisão a documentar

**ROI Esperado:** [Ex: "20min/feature futura" ou "Previne 2h debugging"]

### ⚠️ IMPORTANTE
- **Só documentar learnings SISTÊMICOS** (não pontuais)
- **Aplicar RCA obrigatoriamente** para validar se sistêmico
- **Consolidação final** no Workflow 8a

### Validação de Tamanho

```bash
# Se alterou workflow, validar tamanho
wc -c .windsurf/workflows/add-feature-2a-solutions.md
# ✅ < 12000 chars | ❌ > 12000: comprimir/dividir
```

**Checklist Otimização** (se > 11k):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows

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

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

**Próximo workflow:**

→ [Workflow 2b - Technical Design](.windsurf/workflows/add-feature-2b-technical-design.md)

**Próximas etapas:**
- Design técnico detalhado da solução escolhida
- Root Cause Analysis (se aplicável)
- Validação viabilidade técnica
- Criação de ADR (se necessário)

---

**Criado**: 2025-10-27 | **Atualizado**: 2025-11-08
**Parte**: 2a/11 | **Próximo**: Workflow 2b
