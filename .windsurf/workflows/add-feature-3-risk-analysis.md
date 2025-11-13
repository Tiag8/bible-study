---
description: Workflow Add-Feature (3/9) - Risk Analysis (Análise de Riscos)
auto_execution_mode: 1
---

## 📚 Pré-requisito

Ler ANTES: `docs/PLAN.md`, `docs/TASK.md`, `README.md`, `AGENTS.md`

---

# Workflow 3/11: Risk Analysis (Análise de Riscos e Mitigações)

**Terceiro workflow** de 11 etapas modulares para adicionar nova funcionalidade.

**O que acontece**:
- Fase 5: Análise de Riscos Detalhada
- Fase 6: Estratégias de Mitigação
- **GATE 2**: Usuário aprova plano de riscos

**Por que etapa dedicada**:
- ✅ Análise profunda APÓS escolher solução
- ✅ Riscos específicos da solução escolhida
- ✅ Usuário pode ajustar mitigações

---

## 🤖 USO MÁXIMO DE AGENTES

**SEMPRE paralelo**: 3-5 agentes (análise técnica + segurança + negócio + mitigações)
**Benefício**: 20-30min vs 2-3h

---

## 🛡️ Fase 5: Análise de Riscos Detalhada

### 🚨 REGRA: RISCOS BASEADOS EM EVIDÊNCIAS

**NUNCA criar riscos baseados em**:
- ❌ "Pode acontecer" (teoria sem dados)
- ❌ "Geralmente é problemático" (genérico)
- ❌ Medo/paranoia sem fundamento

**SEMPRE basear riscos em**:
- ✅ **Dados do projeto** (logs, métricas, histórico)
- ✅ **Casos passados** (debugging-cases/, ADRs)
- ✅ **Pesquisa validada** (issues conhecidos, CVEs, benchmarks)
- ✅ **Fatos mensuráveis** (carga atual, volume dados)

### 5.1 Riscos Técnicos

**Performance**
- **Risco**: [ESPECÍFICO + MENSURÁVEL]
- **Evidência**: [métrica atual / caso passado / benchmark]
- **Probabilidade/Impacto**: Alta-Média-Baixa / Alto-Médio-Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

**Breaking Changes**
- **Risco**: [ESPECÍFICO + MENSURÁVEL]
- **Evidência**: [teste quebrado / dependency check / caso similar]
- **Probabilidade/Impacto**: Alta-Média-Baixa / Alto-Médio-Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

### 5.2 Riscos de Segurança

**Exposição de Dados & Injeção**
- **Risco**: [ESPECÍFICO + MENSURÁVEL]
- **Evidência**: [security scan / CVE / caso passado]
- **Probabilidade/Impacto**: Alta-Média-Baixa / Alto-Médio-Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

### 5.3 Riscos de Negócio

**Impacto Usuário**
- **Risco**: [ESPECÍFICO + MENSURÁVEL]
- **Evidência**: [feedback real / analytics / teste usuário]
- **Probabilidade/Impacto**: Alta-Média-Baixa / Alto-Médio-Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

### 5.4 Plano de Rollback

**Opções** (ordem preferência):
1. **Git revert**: Bugs código, banco OK → `git revert <hash>`
2. **Restaurar backup**: Migration quebrou → `./scripts/restore-supabase.sh`
3. **Feature flag**: Desabilitar sem redeploy
4. **Redeploy anterior**: Bugs críticos produção

**Tempo estimado**: [X minutos]

---

## 🔧 Fase 6: Estratégias de Mitigação

### 6.1 Mitigações Técnicas

**Performance & Escalabilidade**
- ✅ Índices WHERE/JOIN, `.select()` específico, LIMIT queries
- ✅ Cache (useMemo, React Query), paginação, lazy loading
- ✅ Monitorar tempo queries (< 500ms)

**Breaking Changes & Complexidade**
- ✅ Testes regressão, migration backward-compatible
- ✅ Testar features relacionadas
- ✅ Documentação inline, testes unitários, código modular
- ✅ ADR se decisão arquitetural

### 6.2 Mitigações Segurança

**Dados Sensíveis & Injeção**
- ✅ RLS habilitado, queries com filtros ownership
- ✅ Supabase query builder (`.eq()`, `.filter()`), NUNCA raw SQL
- ✅ Inputs validados, sem `dangerouslySetInnerHTML`
- ✅ Logs sanitizados

**Autenticação/Autorização**
- ✅ Auth tokens headers (não URL/params)
- ✅ RLS valida ownership TODAS tabelas
- ✅ CORS domínios específicos (não *)
- ✅ Tokens expiram

### 6.3 Backup e Contingência

**Opção A: Dump Lógico** (mudanças pequenas)
- `./scripts/backup-supabase.sh`
- Prós: Rápido, rollback < 5min
- Cons: Não testa migration isolado

**Opção B: Preview Branch** (mudanças complexas)
- `supabase branches create feature-backup`
- Prós: Ambiente isolado, testa migration
- Cons: Mais lento, requer Supabase Pro

**Escolher**: [Dump Lógico / Preview Branch]
**Justificativa**: [Por que]

### 6.4 Checklist Testes

- [ ] TypeScript, ESLint, testes, build passam
- [ ] Feature funciona, UI correta, performance < 500ms
- [ ] Não quebrou features existentes
- [ ] Security scan passa, ZERO secrets, RLS, inputs sanitizados

---

## ✅ Validação: Riscos Reais e Factíveis (OBRIGATÓRIO)

**ANTES do GATE 2**, validar que TODOS riscos identificados sejam:

### Checklist Riscos
- [ ] **Risco ESPECÍFICO** (não genérico "pode degradar")?
  - ❌ "Performance pode cair"
  - ✅ "Query lifetracker_habits pode exceder 500ms (atual: 320ms, +50 habits = 800ms estimado)"

- [ ] **Risco MENSURÁVEL** (dados concretos)?
  - Métrica atual: [valor]
  - Threshold problema: [valor]
  - Evidência: [log/teste/métrica]

- [ ] **Evidência DOCUMENTADA** para cada risco?
  - [ ] Dados projeto: [métrica/log específico]
  - [ ] Caso passado: [debugging-cases/XXX ou ADR/XXX]
  - [ ] Pesquisa validada: [link issue/CVE/benchmark]
  - ❌ SE zero evidências: REMOVER risco (paranoia)

- [ ] **Probabilidade FUNDAMENTADA** (não "achismo")?
  - Alta: Já aconteceu OU altamente provável (evidência)
  - Média: Casos similares conhecidos (ref)
  - Baixa: Possível mas sem precedente (edge case)

**SE algum risco não passa**: ⛔ **REMOVER** (não é risco real, é medo infundado)

**Exemplo Real**:
- ❌ RISCO TEÓRICO: "App pode ficar lento com muitos usuários"
- ✅ RISCO FACTÍVEL: "Dashboard atual 1.2s com 10 users (medido), estimado 5s com 100 users (cálculo queries * avg), threshold 2s (UX guideline)"

---

## 🚨 REGRA CRÍTICA: MITIGAÇÕES BASEADAS EM EVIDÊNCIAS

**NUNCA propor mitigações baseadas em**:
- ❌ Intuição ("acho que deveria...")
- ❌ Suposições fictícias ("pode ser que...")
- ❌ Teoria sem validação ("geralmente é bom ter...")
- ❌ "Best practices" genéricas sem contexto
- ❌ Feeling ou achismo

**SEMPRE basear mitigações em**:
- ✅ **Dados reais do projeto** (logs, métricas, testes)
- ✅ **Documentação oficial** (Supabase docs, React docs, RFCs)
- ✅ **Casos passados documentados** (docs/debugging-cases/, ADRs)
- ✅ **Pesquisa web validada** (Stack Overflow, GitHub issues, benchmarks)
- ✅ **Fatos mensuráveis** (performance real, uso real de memória)

### Checklist Validação de Evidências (OBRIGATÓRIO)

Para CADA mitigação proposta, documentar:

**1. Fonte da Mitigação**
- [ ] **De onde veio esta mitigação?**
  - 📚 Documentação oficial: [link/seção]
  - 🔍 Pesquisa web: [URL + snippet relevante]
  - 📁 Caso passado: [docs/debugging-cases/XXX.md]
  - 📊 Dados projeto: [métrica/log/teste específico]

**2. Evidência de Eficácia**
- [ ] **Como sabemos que funciona?**
  - Benchmark: [dados concretos]
  - Caso de sucesso: [link/referência]
  - Teste local: [resultado medido]
  - Validação empírica: [evidência]

**3. Contexto Aplicável**
- [ ] **Por que aplica ao NOSSO caso?**
  - Cenário similar: [comparação]
  - Stack compatível: [versões/tech]
  - Escala equivalente: [users/dados/carga]
  - Problema idêntico: [sintoma matching]

### Exemplo

**❌ ERRADO**: "Redis é best practice" (achismo)
**✅ CORRETO**: "React Query cache (docs: tanstack.com/query, teste: 2.3s→0.1s, caso: debugging-cases/001)"

### Red Flags - Rejeitar SE:
- ❌ Fonte = "achismo" / "geralmente"
- ❌ Zero evidência eficácia
- ❌ Contexto diferente (escala/stack)
- ❌ Pesquisa < 3 fontes confiáveis

### Ferramentas
- **Web**: `firecrawl_search()` (MCP)
- **Docs**: `context7_get_library_docs()` (MCP)
- **Casos**: `grep -r "keyword" docs/debugging-cases/`

### Validação Final

- [ ] **TODAS** mitigações têm fonte documentada?
- [ ] **TODAS** mitigações têm evidência de eficácia?
- [ ] **TODAS** mitigações têm contexto validado?
- [ ] **ZERO** mitigações baseadas em intuição/achismo?

**SE alguma mitigação falhar**: ⛔ **REMOVER ou SUBSTITUIR** por mitigação com evidências.

**Ver**: `.claude/CLAUDE.md` → REGRA #5 "Advogado do Diabo" (questões 4-6 sobre fontes)

---

## ✋ GATE 2: Aprovação do Plano de Riscos

**⚠️ PARADA OBRIGATÓRIA - Revisão Usuário**

**Revise e confirme:**

1. **Riscos identificados fazem sentido?**
   - Falta risco importante? Algum superestimado?

2. **Mitigações adequadas?**
   - Mitigações suficientes? Precisa adicional?

3. **Estratégia backup apropriada?**
   - Dump lógico suficiente ou Preview Branch?
   - Tempo rollback aceitável?

4. **Plano rollback claro?**
   - Sabe o que fazer se der errado?
   - Tempo recuperação aceitável?

**Opções**:
- **Aprovar** - Digite: `Aprovar` ou `OK` ou `Prosseguir`
- **Ajustar** - Digite: `Ajustar` + explicação
- **Adicionar risco** - Digite: `Risco: [descrição]`
- **Modificar mitigação** - Digite: `Mitigação: [mudança]`

**Aguardando aprovação...** 🚦

---

## 🚨 Validação Anti-Over-Engineering (OBRIGATÓRIO)

**CRÍTICO**: Validar se mitigações propostas não são over-engineered.

### Checklist YAGNI/KISS para Mitigações
- [ ] **Mitigação resolve risco REAL** (não teórico)?
  - Evidência do risco: [dado concreto/caso passado]
  - vs "pode acontecer teoricamente" ❌

- [ ] **Mitigação mais SIMPLES**?
  - Opção simplificada: [descrever]
  - Por que inadequada: [evidência]

- [ ] **Complexidade de mitigação justificada**?
  - Severidade do risco: Alta/Média/Baixa
  - Probabilidade: Alta/Média/Baixa
  - ROI da mitigação: [custo vs benefício]

- [ ] **Posso validar mitigação com teste simples**?
  - Teste: [como validar eficácia]
  - Critério de sucesso: [métrica]

### Red Flags em Mitigações
- [ ] ❌ Infra complexa para problema simples (ex: Redis para 10 users)
- [ ] ❌ Over-monitoring (ex: APM completo para protótipo)
- [ ] ❌ Mitigação > 3x mais complexa que risco
- [ ] ❌ "Best practice" sem evidência de necessidade

**Se 2+ red flags**: ⛔ SIMPLIFICAR mitigações

**Exemplo Real**:
- ❌ Risco: "App pode ficar lento" → Implementar CDN global + caching distribuído
- ✅ Risco: "App pode ficar lento" → React Query cache + lazy loading (validar DEPOIS se precisar mais)

**Ver**: `.claude/CLAUDE.md` → REGRA #10 Anti-Over-Engineering

---

## 🔍 RCA (SE APLICÁVEL)

**Quando**: Risco recorrente, bug durante análise.

**Template 5 Whys**:
1. Por quê? → [R1]
2. Por quê R1? → [R2]
3. Por quê R2? → [R3]
4. Por quê R3? → [R4]
5. Por quê R4? → [R5 = Causa Raiz SISTÊMICA]

**Ação**: [Prevenir recorrência]

**Ver**: `.claude/CLAUDE.md` → REGRA #4

---

## 👿 Advogado do Diabo: Validação Riscos (OBRIGATÓRIO)

**ANTES de prosseguir**, responder:

### Validação Suposições
- [ ] **E se oposto for verdade?** E se risco NÃO é tão alto?
- [ ] **O que NÃO vemos?** Riscos esquecidos?

### Validação Fontes ⭐ (CRÍTICO)
- [ ] **Pesquisamos casos similares?**
  - ✅ docs/debugging-cases/
  - ✅ ADRs anteriores
  - ❌ Faltou: [gaps]

- [ ] **TODAS mitigações TÊM fontes documentadas?**
  - [ ] Fonte 1: [link/path/referência concreta]
  - [ ] Fonte 2: [link/path/referência concreta]
  - [ ] Fonte 3: [link/path/referência concreta]
  - ❌ SE < 3 fontes: mitigação REJEITADA (achismo)

- [ ] **Evidência de eficácia COMPROVADA?**
  - [ ] Benchmark/teste: [dados mensuráveis]
  - [ ] Caso de sucesso: [referência documentada]
  - ❌ SE apenas "best practice" teórica: REJEITAR

- [ ] **Contexto validado?**
  - [ ] Stack/versões compatíveis?
  - [ ] Escala similar ao nosso projeto?
  - [ ] Problema idêntico (não apenas parecido)?

### Validação Abordagem
- [ ] **RCA para riscos recorrentes?**
  - Risco já aconteceu? Se SIM: por que não prevenido?
  - 5 Whys aplicados?

- [ ] **Como validar mitigações antes produção?**
  - Staging disponível? Testes carga? Rollback testado?

**Ver**: `.claude/CLAUDE.md` → "Advogado do Diabo"

**Resultado**: ✅ APROVADO | ⚠️ AJUSTAR | ❌ REJEITAR

---

## ✅ Checkpoint: Riscos Analisados e Mitigados!

**Plano riscos aprovado!**

**Próxima etapa:** Preparar ambiente (backup, branch, sync) e implementação!

---

## 🧠 Meta-Learning

**Objetivo**: Melhorias sistêmicas (não pontuais).

**Questões**:
1. Eficiência workflow (nota 1-10): __/10
2. Iterações usuário: __ (se > 3, identificar causa)
3. Gaps: validação faltou? gate falhou? comando repetitivo?
4. RCA aplicado se problema? (5 Whys → causa sistêmica)

**Ações**: Documentar em Workflow 8a (consolidação final)

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
Acionar: .windsurf/workflows/add-feature-4-setup.md
```

**Ou**: `/add-feature-4-setup`

---

**Criado**: 2025-10-27 | **Atualizado**: 2025-11-08 | **Parte**: 3/11 | **Próximo**: Setup

---

## 🔗 Referências

- `docs/WORKFLOW_BRANCHES.md`: Criação segura branches
- `./scripts/create-feature-branch.sh`: Proteção perda código

---
