---
description: Análise profunda e resolução de problemas com pensamento multidimensional
---

## 📚 Pré-requisitos Essenciais

Antes de iniciar qualquer análise ultra-think:

1. **Consultar documentação base**:
   - `docs/PLAN.md` - Visão estratégica atual
   - `docs/TASK.md` - Status das tarefas em andamento
   - `docs/pesquisa-de-mercado/` - Fundamentos científicos

2. **Proteção de código** (CRÍTICO):
   - Ler **[`ultra-think-git.md`](./ultra-think-git.md)** para workflow Git completo
   - Fazer `git status` antes de começar
   - Para análises >2h: usar `./scripts/create-feature-branch.sh analysis-[tema]`

3. **Salvamento de análises**:
   - Salvar em: `docs/analyses/YYYY-MM-DD-tema.md`
   - Fazer commits intermediários a cada fase
   - Ver `ultra-think-git.md` para detalhes completos

---

# Workflow: Ultra Think - Análise Profunda

Este workflow ativa um modo de raciocínio aprofundado e sistemático para resolver problemas complexos, tomar decisões arquiteturais ou avaliar trade-offs técnicos.

---

## 🎯 Quando Usar

Use este workflow quando precisar de:
- 🏗️ **Decisões Arquiteturais**: Escolher entre microservices vs monolith, stack tecnológica, padrões de design
- 🔧 **Resolução de Problemas Complexos**: Performance, escalabilidade, bugs sistêmicos
- 📊 **Análise de Trade-offs**: Avaliar prós e contras de diferentes abordagens
- 🚀 **Planejamento Estratégico**: Roadmap técnico, migração de sistemas, refatoração
- 💡 **Inovação**: Encontrar soluções criativas para desafios técnicos

**Não use para**: Perguntas simples, bugs triviais, tarefas de implementação direta

---

## 📋 Fase 1: Ativação do Modo Ultra Think

### 1.1 Reconhecimento

Vou ativar o **modo de pensamento aprofundado** para analisar sua questão de forma:
- 🧠 **Sistemática**: Estruturada e organizada
- 🔍 **Multidimensional**: Várias perspectivas
- 🎯 **Focada**: No problema real
- 💡 **Criativa**: Soluções inovadoras
- ⚖️ **Balanceada**: Prós e contras honestos

### 1.2 Contexto do Problema

**Questão/Problema**: [Extraído de sua pergunta]

Vou começar fazendo perguntas de clarificação se necessário:
- Qual o contexto completo?
- Quais são as restrições (tempo, budget, recursos)?
- Quem são os stakeholders?
- Qual o critério de sucesso?
- Há algum requisito não-funcional crítico?

---

## 🔍 Fase 2: Análise Multidimensional

Vou analisar o problema sob múltiplas perspectivas:

### 2.1 Perspectiva Técnica 🔧

**Análise**:
- Viabilidade técnica e restrições
- Escalabilidade e performance
- Manutenibilidade e extensibilidade
- Dívida técnica e trade-offs
- Segurança e confiabilidade

**Perguntas**:
- Esta solução escala?
- É manutenível a longo prazo?
- Quais os riscos técnicos?
- Como testar isso?

---

### 2.2 Perspectiva de Negócio 💼

**Análise**:
- Valor de negócio e ROI
- Time-to-market
- Vantagem competitiva
- Custo vs. benefício
- Impacto em usuários

**Perguntas**:
- Vale o esforço?
- Resolve um problema real?
- Quanto tempo para implementar?
- Qual o custo de oportunidade?

---

### 2.3 Perspectiva do Usuário 👥

**Análise**:
- Necessidades e pain points
- Usabilidade e acessibilidade
- Experiência do usuário
- Edge cases e jornadas
- Feedback loops

**Perguntas**:
- Usuários vão realmente usar?
- É intuitivo?
- Funciona para edge cases?
- Como medir sucesso?

---

### 2.4 Perspectiva de Sistema 🌐

**Análise**:
- Impactos sistêmicos
- Pontos de integração
- Dependências e acoplamento
- Comportamentos emergentes
- Efeitos de segunda ordem

**Perguntas**:
- Como afeta o resto do sistema?
- Quais as dependências?
- O que pode quebrar?
- Há efeitos colaterais?

---

## 💡 Fase 3: Geração de Soluções

Vou gerar **3-5 abordagens diferentes**, incluindo:
- ✅ **Soluções Convencionais**: Comprovadas e seguras
- 🚀 **Soluções Inovadoras**: Criativas e arriscadas
- 🔀 **Soluções Híbridas**: Melhor dos dois mundos

### Template de Solução

Para cada opção, vou apresentar:

```
## Opção X: [Nome da Solução]

### Descrição
[Explicação clara da abordagem]

### Como Implementar
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

### Prós ✅
- Vantagem 1
- Vantagem 2
- Vantagem 3

### Contras ❌
- Desvantagem 1
- Desvantagem 2
- Desvantagem 3

### Complexidade
- **Implementação**: Baixa/Média/Alta
- **Manutenção**: Baixa/Média/Alta
- **Tempo**: X dias/semanas

### Riscos
- Risco 1 (Probabilidade: X, Impacto: Y)
- Risco 2 (Probabilidade: X, Impacto: Y)

### Mitigação de Riscos
- Como reduzir risco 1
- Como reduzir risco 2

### Quando Usar
[Cenários ideais para esta solução]

### Quando NÃO Usar
[Cenários onde esta solução é inadequada]
```

---

## 🔬 Fase 4: Deep Dive (Soluções Promissoras)

Para as 2-3 soluções mais promissoras, vou fazer análise aprofundada:

### 4.1 Plano de Implementação Detalhado
- Fases e marcos
- Recursos necessários
- Dependências críticas
- Timeline realista

### 4.2 Análise de Falhas
- Modos de falha possíveis
- Estratégias de recovery
- Planos de contingência
- Rollback plan

### 4.3 Efeitos de Segunda Ordem
- Consequências das consequências
- Impactos indiretos
- Oportunidades emergentes
- Riscos cascata

### 4.4 MVP e Faseamento
- O que entregar primeiro?
- Como validar incrementalmente?
- Quando pivotar ou persistir?

---

## 🌍 Fase 5: Pensamento Cross-Domain

Vou buscar insights de outras áreas:

### 5.1 Analogias
- Sistemas biológicos
- Outras indústrias
- Padrões da natureza
- Casos históricos

### 5.2 Design Patterns
- Padrões de software
- Padrões arquiteturais
- Padrões de escalabilidade
- Padrões de resiliência

### 5.3 Inovação Combinatória
- Combinar soluções existentes
- Adaptar técnicas de outros domínios
- Aplicar frameworks mentais diferentes

---

## 🎭 Fase 6: Devil's Advocate

Vou **atacar cada solução** para encontrar fraquezas:

### Perguntas Críticas
- E se tudo der errado?
- Quais as premissas não validadas?
- Onde está o ponto cego?
- O que estou ignorando?
- Quais vieses tenho?

### Scenarios "What If"
- What if 10x mais tráfego?
- What if equipe reduz 50%?
- What if requisitos mudam drasticamente?
- What if tecnologia fica obsoleta?

### Stress Testing
- Limites de cada solução
- Pontos de ruptura
- Degradação sob pressão

---

## 🎯 Fase 7: Síntese e Recomendação

### Matriz de Decisão

| Critério | Peso | Opção 1 | Opção 2 | Opção 3 |
|----------|------|---------|---------|---------|
| Viabilidade Técnica | 20% | 8 | 6 | 9 |
| Custo | 15% | 7 | 9 | 5 |
| Time-to-Market | 25% | 6 | 8 | 4 |
| Escalabilidade | 20% | 9 | 5 | 8 |
| Manutenibilidade | 20% | 7 | 7 | 9 |
| **TOTAL** | | **X** | **Y** | **Z** |

### Fatores de Decisão Chave
1. [Fator mais importante]
2. [Segundo fator]
3. [Terceiro fator]

### Trade-offs Críticos
- **Se escolher A**: Ganha X, perde Y
- **Se escolher B**: Ganha Y, perde Z
- **Se escolher C**: Ganha Z, perde X

---

## 🏆 Fase 8: Recomendação Final

### ⭐ Solução Recomendada: [Nome]

**Racional**:
[Por que esta é a melhor escolha dado o contexto]

**Roadmap de Implementação**:

#### Fase 1: MVP (Semana 1-2)
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

#### Fase 2: Refinamento (Semana 3-4)
- [ ] Item 1
- [ ] Item 2

#### Fase 3: Otimização (Semana 5+)
- [ ] Item 1
- [ ] Item 2

**Métricas de Sucesso**:
- Métrica 1: [Target]
- Métrica 2: [Target]
- Métrica 3: [Target]

**Plano de Mitigação de Riscos**:
1. Risco X → Mitigação Y
2. Risco Z → Mitigação W

**Quick Wins**:
- Resultado rápido 1 (1-2 dias)
- Resultado rápido 2 (3-5 dias)

---


## 🔄 Fase 9: Perspectivas Alternativas

### Visão Contrária
[Argumentos contra a recomendação - para ter certeza]

### Considerações Futuras
- O que vigiar nos próximos 3 meses?
- Quando reavaliar a decisão?
- Sinais de que devemos pivotar

### Áreas para Pesquisa Adicional
- [ ] Tópico 1 que precisa mais investigação
- [ ] Tópico 2 para explorar posteriormente
- [ ] Tópico 3 para validar com especialistas

---

## 🧠 Fase 10: Meta-Análise

### Reflexão sobre o Processo
- Qual foi a insight mais valiosa?
- O que surpreendeu na análise?
- Onde há maior incerteza?

### Confidence Levels
- **Análise Técnica**: 85% confiante
- **Estimativas de Tempo**: 70% confiante
- **Premissas de Negócio**: 60% confiante

### Vieses Reconhecidos
- [Viés 1 que pode ter afetado análise]
- [Viés 2 para ter consciência]

### Expertise Adicional Recomendada
- [ ] Consultar especialista em X
- [ ] Validar com stakeholder Y
- [ ] Pesquisar mais sobre Z

---

## 📚 Princípios Aplicados

Este workflow usa os seguintes frameworks mentais:

### 🔹 First Principles Thinking
Quebrar problema até verdades fundamentais, questionar todas premissas

### 🔹 Systems Thinking
Considerar interconexões, feedback loops, comportamentos emergentes

### 🔹 Probabilistic Thinking
Trabalhar com incertezas, ranges, distribuições de probabilidade

### 🔹 Inversion
Pensar no que evitar, não apenas no que fazer

### 🔹 Second-Order Thinking
Consequências das consequências, efeitos de longo prazo

### 🔹 Occam's Razor
Preferir soluções simples quando apropriado

### 🔹 Risk/Reward Asymmetry
Buscar opções com risco limitado e upside ilimitado

---

## 💡 Exemplos de Uso

- **Arquitetura**: Microservices vs Monolith, Stack choice
- **Performance**: Escalabilidade, otimização de custo
- **Refatoração**: Código legado, padrões de migração
- **Decisões Técnicas**: Ferramentas, frameworks, padrões

---

## ⚙️ Como Ativar Este Workflow

### No Windsurf IDE
```bash
# Simplesmente descreva seu problema/pergunta
# O workflow será ativado automaticamente se detectar complexidade
```

### Exemplos de Ativação
```
"Preciso decidir entre usar React Server Components ou manter Client Components"
"Como arquitetar sistema de notificações que escale para milhões de usuários?"
"Avaliar trade-offs entre GraphQL e REST para nossa nova API"
"Estratégia para migrar 10 anos de código legado sem parar produção"
```

---

## 🎯 Quando NÃO Usar

❌ **Não use para**:
- Perguntas factuais simples ("Como fazer X em React?")
- Bugs óbvios ("Erro de sintaxe na linha 42")
- Tarefas de implementação direta ("Criar componente de card")
- Questões com resposta única clara

✅ **Use para**:
- Decisões com múltiplas variáveis
- Trade-offs não óbvios
- Problemas sem solução clara
- Planejamento estratégico
- Inovação e criatividade


## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural
- [ ] Salvar análise em `docs/analyses/[data]-[tema].md` (ver `ultra-think-git.md`)

---

## 🔗 Proteção de Código e Git Workflow

Para **proteção completa de código, salvamento de análises, commits intermediários e troubleshooting**, consulte:

**[→ ultra-think-git.md](./ultra-think-git.md)**

Documentação complementar cobre:
- Checklist pré-voo Git
- Branch dedicadas para análises >2h
- Template de salvamento em `docs/analyses/`
- Commits intermediários a cada fase
- Ciclo completo de workflow
- Cenários de recuperação
- Checklist de salvamento

---

**Última atualização**: 2025-11-03
**Versão**: 2.1 (Split em 2 arquivos)
**Autor**: Windsurf AI Workflow (baseado em Claude Code ultra-think)
**Mudanças v2.1**:
- Dividido em `ultra-think.md` (workflow principal) + `ultra-think-git.md` (proteção Git)
- Referências cruzadas adicionadas
- Redundâncias removidas
