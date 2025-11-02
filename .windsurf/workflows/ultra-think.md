---
description: Análise profunda e resolução de problemas com pensamento multidimensional
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

## 🔒 Pré-requisito: Proteção de Código

**CRÍTICO**: Ultra-think é para análises LONGAS (horas/dias). Proteja seu código antes de começar!

### ✅ Checklist Pré-Voo

Antes de iniciar qualquer análise ultra-think:

- [ ] **Git status limpo?** - Execute `git status` e verifique estado
- [ ] **Branch correta?** - Confirme que está na branch apropriada
- [ ] **Sincronizada com main?** - Execute `git pull origin main` se necessário
- [ ] **Commits não mergeados?** - Se houver trabalho em progresso, faça merge primeiro
- [ ] **Tempo estimado?** - Se >2h, criar branch dedicada (ver abaixo)

### 🌿 Para Análises Longas (>2 horas)

**SEMPRE criar branch dedicada** para análises extensas:

```bash
# Usar script automatizado
./scripts/create-feature-branch.sh analysis-[tema]

# Exemplo
./scripts/create-feature-branch.sh analysis-whatsapp-architecture
./scripts/create-feature-branch.sh analysis-supabase-optimization
```

### 💾 Onde Salvar Outputs

- **Localização**: `docs/analyses/[data]-[tema].md`
- **Naming**: `YYYY-MM-DD-tema-descritivo.md`
- **Exemplos**:
  - `docs/analyses/2025-11-01-whatsapp-integration-tradeoffs.md`
  - `docs/analyses/2025-11-01-supabase-vs-firebase.md`
  - `docs/analyses/2025-11-01-microservices-vs-monolith.md`

### 🔄 Commits Intermediários

**Faça commits a cada fase concluída**:

```bash
# Após Fase 2 (Análise Multidimensional)
git add docs/analyses/
git commit -m "docs: ultra-think fase 2 - análise multidimensional [tema]"

# Após Fase 5 (Pensamento Cross-Domain)
git add docs/analyses/
git commit -m "docs: ultra-think fase 5 - cross-domain insights [tema]"

# Após Fase 8 (Recomendação Final)
git add docs/analyses/
git commit -m "docs: ultra-think fase 8 - recomendação final [tema]"
```

**Benefícios**:
- ✅ Zero risco de perda de código
- ✅ Histórico completo do raciocínio
- ✅ Fácil de revisar/comparar versões
- ✅ Possível reverter se necessário

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

## 💾 Salvamento de Análises

**CRÍTICO**: SEMPRE salvar análises ultra-think para referência futura!

### 📂 Localização e Naming

```bash
# Estrutura de diretório
docs/analyses/

# Padrão de nomenclatura
YYYY-MM-DD-tema-descritivo.md

# Exemplos reais
docs/analyses/2025-11-01-whatsapp-integration-architecture.md
docs/analyses/2025-11-01-supabase-rls-vs-edge-functions.md
docs/analyses/2025-11-01-coach-ai-implementation-strategy.md
```

### 📝 Template de Arquivo

```markdown
# Ultra Think: [Título da Análise]

**Data**: 2025-11-01
**Autor**: Claude Code (Ultra Think Workflow)
**Status**: Completo / Em Progresso
**Decisão**: [Se aplicável]

## Contexto
[Problema/Questão original]

## Análise Multidimensional
[Fases 1-6 do ultra-think]

## Opções Consideradas
[Fase 3 - Soluções geradas]

## Recomendação
[Fase 8 - Solução escolhida]

## Próximos Passos
[Ações concretas]

## Meta-Análise
[Fase 10 - Reflexões]
```

### 🔄 Comandos de Commit

```bash
# 1. Criar/atualizar arquivo de análise
# (usar editor ou copiar output do ultra-think)

# 2. Adicionar ao git
git add docs/analyses/2025-11-01-[tema].md

# 3. Commit com mensagem descritiva
git commit -m "docs: ultra-think completo - [tema-curto]

Análise ultra-think sobre [descrição breve do problema].

Opções consideradas:
- Opção 1: [nome]
- Opção 2: [nome]
- Opção 3: [nome]

Recomendação: [opção escolhida]

Próximos passos: [ação principal]"

# 4. Push para remote (se em branch dedicada)
git push origin feat/[nome-branch]
```

### ✅ Checklist de Salvamento

- [ ] Arquivo criado em `docs/analyses/` com nome padronizado
- [ ] Conteúdo inclui todas as fases relevantes (1-10)
- [ ] Recomendação final está clara e documentada
- [ ] Próximos passos estão explícitos
- [ ] Arquivo commitado com mensagem descritiva
- [ ] Se análise >2h, está em branch dedicada
- [ ] README.md em `docs/analyses/` atualizado com nova entrada

### 🎯 Benefícios do Salvamento

- ✅ **Zero risco de perda**: Análise preservada permanentemente
- ✅ **Histórico de decisões**: Entender por que escolhemos X em vez de Y
- ✅ **Reutilização**: Problemas similares no futuro
- ✅ **Onboarding**: Novos devs entendem raciocínio
- ✅ **Auditoria**: Compliance e governança
- ✅ **Aprendizado**: Revisar decisões passadas

### 📊 Exemplo Real

```bash
# Cenário: Análise de integração WhatsApp (3 horas)
# 1. Criar branch
./scripts/create-feature-branch.sh analysis-whatsapp

# 2. Executar ultra-think (fases 1-10)
# 3. Salvar em arquivo
echo "# Ultra Think: WhatsApp Integration..." > docs/analyses/2025-11-01-whatsapp-integration.md

# 4. Commit intermediário (após fase 5)
git add docs/analyses/
git commit -m "docs: ultra-think fase 5 - cross-domain WhatsApp"

# 5. Commit final
git add docs/analyses/
git commit -m "docs: ultra-think completo - integração WhatsApp

Análise ultra-think sobre estratégia de integração WhatsApp UAZAPI.

Opções consideradas:
- Opção 1: Edge Functions + Webhooks
- Opção 2: Node.js Backend
- Opção 3: Híbrido (Edge + Backend)

Recomendação: Opção 3 (Híbrido)

Próximos passos: Implementar Edge Functions para validação HMAC"

# 6. Push
git push origin feat/analysis-whatsapp
```

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

### Exemplo 1: Decisão Arquitetural
```
Problema: Devemos migrar para microservices ou melhorar nosso monolith?
Output: Análise completa com 4 opções (microservices, modular monolith,
        SOA, event-driven architecture) + recomendação baseada em contexto
```

### Exemplo 2: Problema de Escalabilidade
```
Problema: Como escalar o sistema para 10x tráfego reduzindo custos?
Output: 5 estratégias (vertical scale, horizontal scale, caching,
        edge computing, query optimization) com plano faseado
```

### Exemplo 3: Escolha de Stack
```
Problema: Qual stack tecnológica para nova plataforma?
Output: Comparação detalhada de 3 stacks (MERN, .NET, Python/Django)
        considerando equipe, requisitos, mercado, comunidade
```

### Exemplo 4: Refatoração
```
Problema: Como refatorar código legado sem quebrar produção?
Output: Estratégias incrementais (strangler pattern, branch by abstraction,
        feature flags) com plano de rollout seguro
```

---

## 📊 Output Esperado

### Estrutura Típica do Output

```markdown
# Análise Ultra Think: [Seu Problema]

## 1. Entendimento do Problema
[Contexto, stakeholders, restrições]

## 2. Análise Multidimensional
[Técnica, Negócio, Usuário, Sistema]

## 3. Opções de Solução
### Opção 1: [Nome]
[Detalhes]

### Opção 2: [Nome]
[Detalhes]

### Opção 3: [Nome]
[Detalhes]

## 4. Deep Dive Top 2
[Análise aprofundada]

## 5. Matriz de Decisão
[Comparação estruturada]

## 6. Recomendação
[Solução escolhida + roadmap]

## 7. Riscos e Mitigações
[Plano de contingência]

## 8. Perspectivas Alternativas
[Devil's advocate]

## 9. Próximos Passos
[Ações concretas]

## 10. Meta-Análise
[Reflexão e incertezas]
```

### Características do Output
- ✅ **Comprimento**: Tipicamente 3-5 páginas de análise
- ✅ **Múltiplas soluções**: Pelo menos 3 opções viáveis
- ✅ **Raciocínio claro**: Cadeias lógicas explícitas
- ✅ **Reconhecimento de incertezas**: Honestos sobre o que não sabemos
- ✅ **Acionável**: Recomendações concretas
- ✅ **Insights novos**: Perspectivas não óbvias

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
- [ ] Salvar análise em `docs/analyses/[data]-[tema].md`

---

## 🔗 Integração com Workflow de Branches

**IMPORTANTE**: Ultra-think deve seguir o mesmo workflow de proteção de código usado em todo o projeto.

### 📚 Documentação de Referência

- **Workflow completo de branches**: `docs/WORKFLOW_BRANCHES.md`
- **Script de criação de branches**: `scripts/create-feature-branch.sh`
- **Exemplos de uso**: Ver seção "Proteção de Código" acima

### 🌿 Tipos de Branches para Ultra-Think

```bash
# Análises estratégicas (>2h)
./scripts/create-feature-branch.sh analysis-[tema]

# Exemplos reais
./scripts/create-feature-branch.sh analysis-whatsapp-architecture
./scripts/create-feature-branch.sh analysis-ai-coach-strategy
./scripts/create-feature-branch.sh analysis-database-migration

# Decisões arquiteturais
./scripts/create-feature-branch.sh arch-[decisao]

# Exemplos
./scripts/create-feature-branch.sh arch-microservices-vs-monolith
./scripts/create-feature-branch.sh arch-event-driven-refactor
```

### 🔄 Ciclo Completo: Ultra-Think + Git Workflow

```bash
# 1. ANTES de começar ultra-think
git status                          # Verificar estado
git checkout main                   # Ir para main
git pull origin main                # Sincronizar

# 2. Criar branch dedicada (se análise >2h)
./scripts/create-feature-branch.sh analysis-[tema]

# 3. Executar ultra-think (Fases 1-10)
# ... análise em progresso ...

# 4. Commits intermediários
# Após Fase 2
git add docs/analyses/
git commit -m "docs: ultra-think fase 2 - [tema]"

# Após Fase 5
git add docs/analyses/
git commit -m "docs: ultra-think fase 5 - [tema]"

# Após Fase 8
git add docs/analyses/
git commit -m "docs: ultra-think fase 8 - recomendação [tema]"

# 5. Commit final
git add docs/analyses/
git commit -m "docs: ultra-think completo - [tema]

[descrição detalhada da análise e recomendação]"

# 6. Push e PR (se necessário)
git push origin feat/analysis-[tema]
# Criar PR no GitHub se decisão precisa de revisão
```

### ⚠️ Avisos e Verificações

**SEMPRE verificar antes de começar**:

```bash
# Comando rápido de verificação
git status && git branch && echo "--- PRONTO PARA ULTRA-THINK ---"
```

**Se ver estas mensagens, PARAR**:
- "Changes not staged for commit" → Commitar ou stash primeiro
- "Your branch is behind" → Fazer pull primeiro
- "You are in detached HEAD state" → Checkout para branch apropriada

**Cenários de recuperação**:

```bash
# Se esquecer de criar branch e já começou análise
git stash                                           # Salvar trabalho
./scripts/create-feature-branch.sh "analysis-tema" # Criar branch CORRETAMENTE
git stash pop                                       # Recuperar trabalho

# Se perder progresso (sem commit)
# Verificar se ainda há no histórico do editor
# Ou usar git reflog se houve algum commit
git reflog
git checkout [hash-do-commit-perdido]
```

### 🎯 Lembrete Final

**Ultra-think SEM proteção Git = RISCO ALTO**

- Análises longas (3-8 horas) podem ser perdidas
- Sempre usar branch dedicada
- Sempre salvar em `docs/analyses/`
- Sempre fazer commits intermediários
- Sempre seguir `docs/WORKFLOW_BRANCHES.md`

**Veja também**:
- `docs/WORKFLOW_BRANCHES.md` - Workflow completo de Git
- `scripts/create-feature-branch.sh` - Automação de branches
- `docs/analyses/README.md` - Índice de análises salvas

---
---

**Última atualização**: 2025-11-01
**Versão**: 2.0
**Autor**: Windsurf AI Workflow (baseado em Claude Code ultra-think)
**Mudanças v2.0**: Adicionadas seções de proteção de código e integração Git
