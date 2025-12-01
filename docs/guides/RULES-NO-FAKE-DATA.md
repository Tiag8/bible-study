# 🚨 REGRAS GLOBAIS: ANTI-INVENÇÃO DE DADOS

**Aplicável a TODOS workflows (1-11)**

## ❌ PROIBIDO EM WORKFLOWS

### 1. Estimativas de Tempo
❌ **NUNCA** estimar horas/dias/semanas de desenvolvimento
- Razão: Usuário usa IA para programação (10x faster que humano)
- Prazos são irrelevantes e irreais neste contexto

**Exemplo ERRADO**:
> "Implementação: 44 horas"
> "Mitigação: 2 semanas"

**Exemplo CORRETO**:
> "Implementação: [A ser definido com usuário]"
> "Mitigação: Aplicar checklist de segurança"

### 2. Custos Sem Fonte
❌ **NUNCA** mencionar custos ($X/mês) sem fonte válida
- Se não tem URL de onde veio: NÃO mencionar
- Custos reais: APIs (Gemini, Supabase) são conhecidos

**Exemplo ERRADO**:
> "Custo de manutenção: $2,000/mês"

**Exemplo CORRETO**:
> "Custo Gemini API: $0.0001/token [fonte: ai.google.dev/pricing]"
> OU
> "⚠️ Custo de manutenção: Dados não disponíveis"

### 3. Métricas Sem Validação
❌ **NUNCA** inventar retenção, ROI, performance sem dados reais
- Se não tem fonte: AVISAR (não assumir)
- Usar WebSearch para validar ANTES de afirmar

**Exemplo ERRADO**:
> "Retenção D7: 78% (estimado)"
> "ROI: +$1,200 em 6 meses"

**Exemplo CORRETO**:
> "⚠️ Retenção D7: Dados não encontrados. Validar com A/B testing."
> "ROI: Depende de retenção (a ser medido após MVP)"

### 4. Dados Sem Citação
❌ **NUNCA** afirmar dados técnicos sem [fonte: URL]
- Latência, taxa de erro, benchmark: precisa fonte

**Exemplo ERRADO**:
> "pgvector tem latência de 100-200ms"

**Exemplo CORRETO**:
> "pgvector tem latência de 10-50ms para 100k vetores [fonte: github.com/pgvector/pgvector#performance]"

## ✅ OBRIGATÓRIO EM WORKFLOWS

### 1. Validar com WebSearch
- Antes de mencionar métrica: usar WebSearch
- Citar fonte: [fonte: URL]
- Se não achar: "⚠️ Dados não encontrados"

### 2. Focar em Qualitativo
- Riscos: Descrever natureza (não inventar severidade numérica)
- Mitigações: Checklist de práticas (não horas de esforço)
- Decisões: Critérios lógicos (não custos fictícios)

### 3. Consultar Usuário
- Se dado é crítico mas incerto: PERGUNTAR ao usuário
- Não assumir, não inventar

### 4. Documentar Incertezas
- Marcar com ⚠️ o que não tem fonte
- Informar risco SEM inventar dados

## 📋 CHECKLIST PÓS-ANÁLISE

Antes de apresentar análise ao usuário:
- [ ] ZERO estimativas de horas/dias/semanas?
- [ ] ZERO custos sem [fonte: URL]?
- [ ] ZERO métricas sem validação?
- [ ] Todas incertezas marcadas com ⚠️?
- [ ] Análise focada em RISCOS (não números fictícios)?

## 🎯 FILOSOFIA

**Regra de Ouro**:
> "É melhor dizer 'NÃO SEI' do que inventar dados que destroem credibilidade"

**Honestidade > Completude**
- Workflow honesto com lacunas > Workflow completo com dados falsos
- Usuário prefere saber onde há incerteza

## 🔗 APLICAÇÃO

**Todos workflows (1-11) DEVEM**:
1. Referenciar este arquivo no topo: `Regras: docs/guides/RULES-NO-FAKE-DATA.md`
2. Aplicar checklist antes de apresentar ao usuário
3. Validar dados com WebSearch quando relevante

**Workflows mais críticos** (alta chance de invenção):
- Workflow 2a/2b: Análise de soluções (ROI, custos)
- Workflow 3: Análise de riscos (métricas, esforço)
- Workflow 8: Meta-learning (benchmarks)

---

**Criado em**: 2025-11-06
**Motivo**: Corrigir invenção sistemática de dados em workflows
**Impacto**: Restaurar credibilidade das análises
