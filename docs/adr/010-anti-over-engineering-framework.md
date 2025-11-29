# ADR 010: Anti-Over-Engineering Framework (YAGNI + KISS)

**Status**: ✅ Aceito
**Data**: 2025-11-09
**Autor(es)**: Claude Code (Orchestrator)
**Decisão Substituída**: N/A (Nova framework)

---

## Contexto

**Problema**: Identificamos que Sentry MCP foi implementado mas não agregou valor real ao projeto. Análise revelou que `curl` + API Sentry poderia fazer o mesmo, mas com menos overhead de configuração, manutenção e documentação.

**Por que precisamos tomar essa decisão?**
- Prevenir over-engineering sistêmico em TODOS os planejamentos futuros
- Economizar centenas de horas desperdiçadas em complexidade desnecessária
- Manter projeto simples, manutenível e focado no 20% que entrega 80% do valor
- Proteger contra armadilhas de "best practices" e "future-proofing" sem evidência

**Stakeholders envolvidos**:
- Desenvolvedores IA (Claude, agentes especializados)
- Usuário final (Tiago - solo developer)
- Projeto Life Tracker (longo prazo)

**Restrições**:
- Solo developer (sem time para manter código complexo)
- AI-powered development (precisa de padrões claros)
- Budget limitado (cada overhead conta)
- Tempo crítico (soft launch planejado)

---

## Opções Consideradas

### Opção 1: Framework Sistemático Anti-Over-Engineering ⭐ (Escolhida)

**Descrição**:
Implementar framework obrigatório baseado em YAGNI (You Aren't Gonna Need It), KISS (Keep It Simple, Stupid) e Princípio de Pareto 80/20 em TODOS workflows, agents e validações de planejamento.

**Componentes**:
1. **REGRA #10** em `.claude/CLAUDE.md` (documento principal)
2. **Checklists** em 4 workflows críticos (2a, 2b, 3, 5a)
3. **Validações** em 2 agents críticos (orchestrator, rca-analyzer)
4. **ADR 010** (este documento) para referência futura

**Prós**:
- ✅ Prevenção sistêmica (não apenas reativa)
- ✅ Aplicável a TODAS decisões (design, código, mitigações)
- ✅ Checklist concreto (não subjetivo)
- ✅ Red flags claros (2+ = rejeitar)
- ✅ Exemplos reais (Sentry MCP como case study)
- ✅ ROI alto (centenas de horas economizadas)

**Contras**:
- ❌ Adiciona validação extra (5-10min por workflow)
- ❌ Pode gerar falsos positivos (precisa calibração)

**Complexidade**:
- Implementação: Baixa (adicionar seções em docs existentes)
- Manutenção: Baixa (framework auto-aplicável)

**Custo (tempo/recursos)**:
- Implementação: 2h (adicionar em 7 arquivos)
- Manutenção: 0h (auto-enforcement via checklists)
- ROI: 100h+/ano (prevenir 1 over-engineering/mês)

---

### Opção 2: Code Review Manual (Caso-a-Caso)

**Descrição**:
Revisar cada solução manualmente, sem framework sistemático.

**Prós**:
- ✅ Flexibilidade (decisões caso-a-caso)
- ✅ Sem overhead de checklists

**Contras**:
- ❌ Inconsistente (depende de percepção no momento)
- ❌ Reativo (só detecta DEPOIS de implementar)
- ❌ Sem prevenção (mesmos erros recorrem)
- ❌ Sem evidência obrigatória (decisões subjetivas)

**Por que foi rejeitada?**:
Sentry MCP passou despercebido MESMO com code review manual. Framework sistemático garante que TODA solução seja questionada.

---

### Opção 3: Aceitar Complexidade (Status Quo)

**Descrição**:
Continuar implementando soluções complexas sem validação de simplicidade.

**Prós**:
- ✅ Zero trabalho adicional

**Contras**:
- ❌ Centenas de horas desperdiçadas (over-engineering recorrente)
- ❌ Codebase inchado (difícil manter)
- ❌ Bugs complexos (debugging difícil)
- ❌ Onboarding lento (curva de aprendizado)

**Por que foi rejeitada?**:
ROI negativo. Complexidade sem benefício é desperdício puro.

---

## Decisão

**Decidimos adotar a Opção 1**: Framework Sistemático Anti-Over-Engineering

**Justificativa**:
Sentry MCP foi implementado sem validação de simplicidade. Análise post-facto revelou que:
- Curl + API Sentry = mesma funcionalidade
- Overhead: Configuração MCP + docs + manutenção
- ROI: Negativo (mais trabalho que benefício)

Framework YAGNI/KISS previne recorrência sistematicamente.

**Critérios de decisão**:
1. **Prevenção** (não reação) - Framework detecta ANTES de implementar
2. **Objetividade** - Checklist concreto, não opinião
3. **Escalabilidade** - Aplica a TODAS decisões futuras

**Fatores decisivos**:
- Caso real (Sentry MCP) comprova necessidade
- ROI massivo (100h+/ano economizadas)
- Solo developer (sem time para manter complexidade)

---

## Consequências

### Positivas ✅

- **Prevenção Sistêmica**: TODAS soluções validadas contra over-engineering
- **Economia de Tempo**: 100h+/ano não desperdiçadas em complexidade inútil
- **Codebase Simples**: Apenas 20% do código que entrega 80% do valor
- **Debugging Rápido**: Menos camadas de abstração = bugs mais fáceis de resolver
- **Onboarding Fácil**: Código simples = curva de aprendizado suave
- **Manutenção Barata**: Menos código = menos bugs = menos trabalho

### Negativas ❌

- **Validação Extra**: 5-10min por workflow (overhead aceitável vs 100h economizadas)
- **Falsos Positivos**: Soluções legítimas podem ser questionadas (calibração necessária)
- **Resistência Inicial**: "Best practices" podem ser rejeitadas (requer evidência)

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Falsos positivos (rejeitar soluções boas) | Média | Médio | Checklist exige EVIDÊNCIA (não rejeita por padrão) |
| Simplificação excessiva (miss edge cases) | Baixa | Alto | Red flags requerem 2+ (não 1), contexto importa |
| Adesão baixa (ignorar framework) | Baixa | Alto | Obrigatório em workflows + agents (não opcional) |

---

## Alternativas Rejeitadas

**Opção 2 (Code Review Manual)** foi rejeitada porque:
- Sentry MCP passou despercebido mesmo com review
- Inconsistente (depende de percepção momentânea)
- Reativo (só detecta depois de implementar)

**Opção 3 (Status Quo)** foi rejeitada porque:
- ROI negativo (centenas de horas desperdiçadas)
- Codebase inchado (difícil manter long-term)
- Solo developer não tem tempo para complexidade desnecessária

---

## Plano de Implementação

### Fase 1: Documentação Core ✅ COMPLETO
- [x] Adicionar REGRA #10 em `.claude/CLAUDE.md`
- [x] Criar ADR-010 (este documento)
- [x] Documentar caso Sentry MCP como exemplo

**Tempo estimado**: 1h
**Status**: ✅ COMPLETO (2025-11-09)

### Fase 2: Workflows ✅ COMPLETO
- [x] Adicionar checklist em Workflow 2a (Solutions)
- [x] Adicionar checklist em Workflow 2b (Technical Design)
- [x] Adicionar checklist em Workflow 3 (Risk Analysis)
- [x] Adicionar checklist em Workflow 5a (Implementation)

**Tempo estimado**: 1h
**Status**: ✅ COMPLETO (2025-11-09)

### Fase 3: Agents ✅ COMPLETO
- [x] Adicionar validação em `orchestrator.md`
- [x] Adicionar validação em `rca-analyzer.md`

**Tempo estimado**: 30min
**Status**: ✅ COMPLETO (2025-11-09)

### Fase 4: Disseminação (Futuro)
- [ ] Adicionar em Workflow 6a, 7a, 8a, 9a (quando refatorar)
- [ ] Adicionar em outros agents conforme necessário
- [ ] Criar examples/ com casos reais (Sentry MCP + futuros)

**Tempo estimado**: 2h (distribuído ao longo de 3-6 meses)

---

## Métricas de Sucesso

**Como saberemos que a decisão foi boa?**

- [ ] **Zero over-engineering detectado pós-framework**: Features implementadas usam solução mais simples
- [ ] **Checklist aplicado 100%**: Todos workflows 2a/2b/3/5a executam validação
- [ ] **Red flags documentados**: Casos de 2+ red flags rejeitados têm ADR/debugging case
- [ ] **ROI positivo**: < 100h/ano desperdiçadas (vs 100h+/ano antes)
- [ ] **Codebase simples**: Linhas de código estabilizam (não crescem desnecessariamente)

**Revisão agendada**: 2026-01-09 (3 meses após implementação)

**Métricas a coletar**:
1. Quantos proposals rejeitados por 2+ red flags (mês a mês)
2. Quantos casos de over-engineering detectados ANTES vs DEPOIS
3. Feedback qualitativo (código ficou mais simples?)

---

## Referências

**Internas**:
- `.claude/CLAUDE.md` - REGRA #10 Anti-Over-Engineering
- `docs/integrations/MCP.md` - Sentry MCP removido (caso real)
- `.windsurf/workflows/add-feature-2a-solutions.md` - Checklist implementado
- `.claude/agents/orchestrator.md` - Validação implementada

**Externas**:
- YAGNI Principle: https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it
- KISS Principle: https://en.wikipedia.org/wiki/KISS_principle
- Pareto 80/20: https://en.wikipedia.org/wiki/Pareto_principle
- The Art of Unix Programming (KISS): http://www.catb.org/~esr/writings/taoup/html/ch01s06.html

---

## Notas Adicionais

**Caso Real (Sentry MCP)**:
- **Prometido**: Debug automático via MCP
- **Realidade**: Curl + API Sentry faz o mesmo
- **Overhead**: Config, docs, manutenção
- **Decisão**: REMOVIDO (2025-11-09)
- **Aprendizado**: Inspirou framework anti-over-engineering

**Exemplo de Red Flags**:
1. ❌ Múltiplas camadas de abstração (MCP + wrapper + docs)
2. ❌ "Best practice" sem evidência de necessidade (Sentry MCP "bom ter")
3. ❌ Complexidade > benefício (setup > uso real)

**Princípios Aplicados**:
- **YAGNI**: Não implementamos "para o futuro" (Sentry MCP não tinha uso imediato)
- **KISS**: Curl é mais simples que MCP (mesma funcionalidade)
- **Pareto**: MCP seria 80% do código, 20% do valor (invertido)

**Framework vs Sentry MCP** (contraste):
- Framework: Previne desperdício (ROI positivo)
- Sentry MCP: Adicionou overhead (ROI negativo)
- Framework: Simples (checklist)
- Sentry MCP: Complexo (config + docs + manutenção)

---

**Última atualização**: 2025-11-09
**Revisores**: Orchestrator (auto-validação via Evidence-Based Analysis)
**Status de Implementação**: ✅ Fases 1-3 completas (4 em progresso incremental)
