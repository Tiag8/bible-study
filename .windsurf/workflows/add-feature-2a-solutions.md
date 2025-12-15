---
description: Workflow Add-Feature (2a/11) - Solution Design (Research & Decision)
auto_execution_mode: 1
---

# Workflow 2a/11: Solution Design - Research & Decision

**Objetivo**: Propor 3 soluções diferentes (A, B, C), comparar prós/contras/trade-offs, e obter decisão fundamentada do usuário.

---

## 1️⃣ O QUE FAZER (5W1H Framework)

### WHO (Quem está envolvido?)
- **Developer/AI**: Propor 3 soluções viáveis
- **User**: Escolher solução baseada em trade-offs
- **Reviewer**: Validar decisão contra anti-patterns

### WHAT (O que deve ser feito?)
- **Core**: Propor 3 abordagens diferentes (Simples, Balanceada, Otimizada)
- **Comparison**: Matriz de decisão (prós/contras/trade-offs)
- **Validation**: GATE 1.5 (Anti-Duplicação), GATE 1.6 (Code Reuse), Advogado do Diabo

### WHERE (Onde acontece?)
- **Research**: MCPs (context7, firecrawl), npm, shadcn/ui, GitHub
- **Documentation**: `.context/{branch}_decisions.md`
- **Next**: Workflow 2b (Technical Design)

### WHEN (Quando executar?)
1. **ANTES**: Workflow 1 (Reframing) completo, GATE 1 aprovado
2. **DURANTE**: Pesquisa paralela, matriz de decisão, validações
3. **DEPOIS**: Usuário escolhe solução → atualizar .context/

### WHY (Por quê importa?)
- **Quality**: 3 soluções → evita aceitar primeira ideia
- **Tradeoffs**: Usuário decide com visibilidade (simplicidade vs otimização)
- **Anti-Over-Engineering**: Validações previnem duplicação/over-complexity

### HOW (Como executar?)
- **Pattern**: Research → Propose 3 → Compare → Validate → User Decision
- **Agents**: MÁXIMO paralelo (pesquisa, arquitetura, performance, risco)
- **Checkpoints**: REGRA #14 - Uma ação atômica → aprovação

---

## 2️⃣ PRINCÍPIOS DE SOLUTION DESIGN

### P1: Three-Solution Rule (COMO propor?)
**Princípio**: SEMPRE propor 3 soluções diferentes (Simples, Balanceada, Otimizada)

**Guidelines**:
- **Solução A (Simples)**: Abordagem direta, tempo mínimo, baixo risco
- **Solução B (Balanceada)**: Equilíbrio simplicidade/performance, escalável
- **Solução C (Otimizada)**: Performance máxima, alto volume, complexa

**Red Flags**:
- ❌ Propor apenas 1 solução (não validou alternativas)
- ❌ Soluções muito similares (não explorou espaço de design)

---

### P2: Anti-Duplicação (O QUE validar?)
**Princípio**: NUNCA implementar funcionalidade que já existe nativa/lib

**Guidelines**:
1. **Gemini nativo?** (parsing, tool calling, extração)
2. **React/Supabase built-in?** (cache, validation, auth, RLS)
3. **Lib instalada cobre?** (package.json + node_modules)
4. **Evidência de gap real?** (screenshot/log de falha)

**Red Flags**:
- ❌ Parser custom → Gemini JÁ extrai via function calling
- ❌ Cache custom → React Query JÁ tem staleTime/cacheTime
- ❌ Auth middleware → Supabase Auth + RLS JÁ protege

**GATE 1.5 Bloqueio**: SE funcionalidade existe nativa → ⛔ PARAR, usar nativa

---

### P3: Code Reuse First (ONDE buscar?)
**Princípio**: Buscar solução existente ANTES de implementar do zero

**Ordem OBRIGATÓRIA**:
1. **Lib instalada cobre?** (package.json)
2. **NPM tem lib madura?** (>1k downloads/week, <6 meses, TypeScript)
3. **Shadcn/ui componente?** (ui.shadcn.com)
4. **GitHub reference?** (MIT/Apache, >100★, <6m, TS)

**Matriz Decisão**:
- Lib instalada + funciona → ✅ Usar lib, SKIP implementação
- Lib npm madura → ⚠️ Instalar, avaliar bundle size
- Shadcn existe → ✅ Usar shadcn
- GitHub MIT + TS + Recent → ⚠️ Copiar + adaptar + documentar
- Nada encontrado → ✅ Implementar próprio

**GATE 1.6 Bloqueio**: SE lib cobre → ⛔ PARAR, não reinventar roda

---

### P4: Trade-Off Transparency (COMO comparar?)
**Princípio**: Usuário decide baseado em trade-offs claros, não preferências IA

**Matriz Decisão** (obrigatória):
| Critério | A (Simples) | B (Balanceada) | C (Otimizada) |
|----------|-------------|----------------|---------------|
| Simplicidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Performance | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Manutenibilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Escalabilidade | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Time to Market | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Guidelines**:
- **Solução A**: Quando prioridade = velocidade, MVP, baixo volume
- **Solução B**: Quando quer evitar refatoração futura, volume médio-alto
- **Solução C**: Quando performance crítica, volume muito alto

**Red Flags**:
- ❌ Recomendação sem justificativa (qual contexto/prioridade?)
- ❌ Trade-offs vagos ("mais rápido", "melhor")

---

### P5: Devil's Advocate (QUANDO questionar?)
**Princípio**: SEMPRE validar suposições com perguntas críticas ANTES aprovar

**10 Perguntas OBRIGATÓRIAS**:
1. **E se oposto for verdade?** (desafiar premissa)
2. **O que NÃO estamos vendo?** (blind spots)
3. **Fontes atualizadas?** (< 1 semana ✅, > 1 mês ❌)
4. **Executamos Reframing?** (problema CERTO?)
5. **Custo de oportunidade?** (o que NÃO faremos?)
6. **O que pode dar errado?** (top 3 riscos)
7. **Complexidade justificada?** (evidência vs "best practice")
8. **MVP validou?** (10% código testa suposição?)
9. **Abstração necessária?** (< 3 camadas)
10. **YAGNI?** (resolve problema REAL vs futuro hipotético)

**Resultado**: ✅ APROVADO | ⚠️ AJUSTAR | ❌ REJEITAR

**Red Flags**:
- ❌ Solução "C" sem evidência de necessidade (over-engineering)
- ❌ Abstrações prematuras (antes de 3 usos - Rule of Three)

---

## 3️⃣ EXEMPLOS CANÔNICOS (Pattern Reference)

### Example 1: Habit Tracking Feature (Simple → Balanceada)
```markdown
**Solução A (Simples)**:
- useState local
- API call direto
- Zero cache
- Time: 2h

**Solução B (Balanceada)**: ✅ ESCOLHIDA
- React Query (staleTime 5min)
- Optimistic updates
- RLS policies
- Time: 4h
- Trade-off: +2h → evita refatoração (cache futuro)

**Solução C (Otimizada)**:
- IndexedDB offline-first
- Sync service worker
- Time: 8h
- ❌ REJEITADA: Volume não justifica (50 habits/user)
```

---

### Example 2: Payment Integration (Code Reuse)
```markdown
**GATE 1.6 - Code Reuse Research**:
1. Lib instalada? → ❌ Não tem Stripe SDK
2. NPM madura? → ✅ @stripe/stripe-js (5M/week, <6m, TS)
3. Shadcn? → N/A (não é UI)
4. GitHub? → N/A (lib oficial cobre)

**Decisão**: ✅ Instalar @stripe/stripe-js (não implementar do zero)

**Solução A (Simples)**:
- Stripe SDK
- Webhook simples
- Zero retry
- Time: 3h

**Solução B (Balanceada)**: ✅ ESCOLHIDA
- Stripe SDK + webhook
- Exponential backoff
- Idempotency keys
- Time: 5h
- Trade-off: +2h → previne duplicação pagamentos

**Solução C (Otimizada)**:
- Stripe + custom processor
- ❌ REJEITADA: GATE 1.5 (Stripe JÁ cobre 100%)
```

---

### Example 3: NLP Parsing (Anti-Duplicação)
```markdown
**GATE 1.5 - Anti-Duplicação**:
- [ ] Gemini nativo? → ✅ SIM (tool calling + structured output)
- [ ] React/Supabase built-in? → N/A
- [ ] Lib instalada? → N/A
- [ ] Evidência gap? → ❌ NÃO testei Gemini nativo

**Resultado**: ⛔ BLOQUEIO - Testar Gemini nativo ANTES custom parser

**Teste Gemini**:
```typescript
// Gemini function declaration
{ name: "save_habit", description: "Parse texto → hábito", parameters: {...} }
// Result: 98.9% precisão (9/9 casos)
```

**Decisão**: ✅ Usar Gemini nativo, SKIP custom parser

**Learning**: habit-field-parser.ts (680 linhas) DELETADO - over-engineering (commit e380c00)
```

---

## 4️⃣ VALIDATION GATES

### GATE 0: Load Context
**Quando**: SEMPRE (início workflow)

```bash
./scripts/context-load-all.sh feat-nome-feature
```

---

### GATE 1.5: Anti-Duplicação
**Quando**: ANTES propor soluções

**Checklist**:
- [ ] Funcionalidade nativa existente? (Gemini/React/Supabase/Lib)
- [ ] Evidências de gap real? (screenshot/log falha)
- [ ] Gap sistêmico (3+ casos) ou pontual?
- [ ] Alternativa mais simples? (prompt/config/doc vs código)

**SE FALHOU**: ⛔ PARAR → Usar nativo → SKIP implementação

---

### GATE 1.6: Code Reuse Research
**Quando**: ANTES propor soluções

**Checklist**:
- [ ] Verificado package.json?
- [ ] Pesquisado NPM? (termos: [___])
- [ ] Verificado shadcn/ui?
- [ ] Pesquisado GitHub? (MIT/Apache, >100★, <6m, TS)

**SE ENCONTROU**: ⛔ PARAR → Usar lib → SKIP implementação

**Documentar**:
```markdown
### Code Reuse Decision
- **Fonte**: [npm/shadcn/github URL]
- **License**: [MIT/Apache]
- **Motivo**: [Por que escolheu]
- **Adaptações**: [O que mudou]
```

---

### GATE 1: User Decision
**Quando**: APÓS comparação de soluções

**Opções**:
1. **A** (Simples/Rápida)
2. **B** (Balanceada)
3. **C** (Otimizada)
4. **Combinar** (mix) - explique
5. **Ajustar** - explique o quê

**Aguardando decisão...** 🚦

---

### Devil's Advocate Validation
**Quando**: APÓS escolha, ANTES aprovar

**Checklist**:
- [ ] 10 perguntas respondidas?
- [ ] Fontes atualizadas (<1 semana)?
- [ ] Reframing executado?
- [ ] Top 3 riscos identificados?
- [ ] Mitigações planejadas?

**Resultado**: ✅ APROVADO | ⚠️ AJUSTAR | ❌ REJEITAR

---

## 5️⃣ CONTEXT UPDATE (.context/ - OBRIGATÓRIO)

### Update workflow-progress.md
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 2a: Solutions ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Propostas 3 soluções (A, B, C)
  - Matriz decisão comparando trade-offs
  - GATE 1.5 + 1.6 validados
  - Advogado do Diabo executado
- **Outputs**: Solução escolhida: [A/B/C]
- **Next**: Workflow 2b (Technical Design)
EOF
```

---

### Update decisions.md
```bash
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 2a - Solutions
- **Decisão**: Solução [A/B/C]
- **Por quê**: [Justificativa]
- **Trade-off**: [Resumo]
- **Alternativas**: [Rejeitadas + motivo]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

---

### Log attempts.log
```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 2a (Solutions) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] DECISION: Solução [A/B/C]" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## ⏭️ PRÓXIMO WORKFLOW

**Workflow 2b - Technical Design**: Detalhar arquitetura da solução escolhida (componentes, hooks, database, queries)

---

**Criado**: 2025-10-27 | **Otimizado**: 2025-12-10 (5W1H Meta-Framework)
**Parte**: 2a/11 | **Próximo**: Workflow 2b
