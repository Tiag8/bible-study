---
description: Workflow Add-Feature (2a/11) - Solution Design (Research & Decision)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler:
- `docs/PLAN.md`, `docs/TASK.md`, `README.md`, `AGENTS.md`
- `.windsurf/workflows`, `docs/`, `scripts/`

---

## 🧠 FASE 0: LOAD CONTEXT (Script Unificado)

**⚠️ USAR SCRIPT** (não Read manual):

```bash
./scripts/context-load-all.sh feat-nome-feature
```

**Output**: Resumo 6 arquivos .context/ (INDEX, workflow-progress, temp-memory, decisions, attempts.log, validation-loop).

**SE script falhar**: Fallback manual (Read 6 arquivos).

**Benefício**: Consolidated context loading vs manual Fase 0 (redução tempo).

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

## 🔍 GATE 1.6: Code Reuse Research (ANTES de propor soluções)

**CRÍTICO**: Pesquisar implementações existentes ANTES de criar código do zero.

### Ordem de Busca (OBRIGATÓRIA)

**1. Lib instalada cobre?** (package.json + node_modules)
```bash
# Verificar libs instaladas
cat package.json | grep -A 100 '"dependencies"' | head -50
# Buscar funcionalidade em node_modules
grep -r "funcionalidade" node_modules/*/README.md 2>/dev/null | head -5
```
- [ ] Verificado package.json?
- [ ] Lib instalada resolve? → SE SIM: Usar lib, documentar uso

**2. NPM tem lib madura?** (npmjs.com)
```bash
# Pesquisar via MCP firecrawl ou web
# Critérios: >1000 downloads/week, maintained (<6 meses), TypeScript support
```
- [ ] Pesquisado npm? Termos: [listar]
- [ ] Encontrou lib? Nome: [___] Downloads: [___] Última release: [___]
- [ ] Critérios atingidos? → SE SIM: Avaliar instalação

**3. Shadcn/ui ou componente pronto?** (ui.shadcn.com)
```bash
# Verificar componentes shadcn disponíveis
npx shadcn-ui@latest add --help 2>/dev/null | grep -A 100 "Available components"
```
- [ ] Feature é UI? → SE SIM: Verificar shadcn primeiro
- [ ] Componente existe? → SE SIM: Usar `npx shadcn-ui add [componente]`

**4. GitHub reference implementation?** (última opção)
```bash
# Pesquisar via MCP firecrawl
# Critérios: MIT/Apache license, >100 stars, commits <6 meses, TypeScript
```
- [ ] Pesquisado GitHub? Query: [___]
- [ ] Encontrou repo? URL: [___] Stars: [___] License: [___]
- [ ] Critérios atingidos? (MIT/Apache, >100★, <6m, TS)
- [ ] Código copiável ou apenas referência?

### Matriz de Decisão Code Reuse

| Encontrou | Qualidade | Ação |
|-----------|-----------|------|
| Lib instalada | Funciona | ✅ Usar lib, SKIP implementação |
| Lib npm nova | Madura (>1k/week) | ⚠️ Instalar, avaliar bundle size |
| Lib npm nova | Imatura | ❌ Não instalar, implementar próprio |
| Shadcn component | Existe | ✅ Usar shadcn |
| GitHub code | MIT + TS + Recent | ⚠️ Copiar + adaptar + documentar origem |
| GitHub code | GPL ou Stale | ❌ Apenas referência, não copiar |
| Nada encontrado | - | ✅ Prosseguir implementação própria |

### Documentação Obrigatória

**SE usou lib/código externo**:
```markdown
### Code Reuse Decision
- **Fonte**: [npm/shadcn/github URL]
- **License**: [MIT/Apache/etc]
- **Motivo**: [Por que escolheu esta fonte]
- **Adaptações**: [O que precisou mudar]
```

**SE não encontrou nada útil**:
```markdown
### Code Reuse Research
- **Termos pesquisados**: [listar]
- **Resultado**: Nenhuma solução pronta atende aos critérios
- **Motivo**: [Por que implementar do zero]
```

---

## 🚨 GATE 1.5: Necessity Validation (Anti-Duplicação)

**CRÍTICO**: Validar se solução NÃO duplica funcionalidade existente.

### Checklist Anti-Duplicação (OBRIGATÓRIO)

**1. Funcionalidade Nativa Existente?**
- [ ] **Gemini AI** JÁ faz isso nativamente? (parsing, extração, análise, tool calling)
  - Verificar: function declarations, prompts atuais
  - Se SIM → ⛔ BLOQUEAR, usar Gemini nativo
- [ ] **React/Supabase** JÁ tem built-in? (cache, validation, auth, RLS)
  - Verificar: docs oficiais + código atual
  - Se SIM → ⛔ BLOQUEAR, usar built-in
- [ ] **Biblioteca instalada** JÁ cobre? (verificar package.json + node_modules)
  - Verificar: grep -r "funcionalidade" node_modules/
  - Se SIM → ⛔ BLOQUEAR, documentar uso lib

**2. Evidências de Gap Real**
- [ ] **Testei solução atual** e FALHOU em caso real? (não hipotético)
  - Evidência: [screenshot/log/código testado]
  - Se NÃO testei → ⛔ PAUSAR, testar primeiro
- [ ] **Tenho log/screenshot** provando inadequação?
  - Anexar: [link ou caminho arquivo]
  - Se NÃO tenho → ⛔ PAUSAR, criar evidência
- [ ] Gap é **SISTÊMICO** (afeta 3+ casos) ou pontual (1 edge case)?
  - Se pontual → ⚠️ Considerar workaround ao invés de feature
  - Se sistêmico → ✅ Prosseguir

**3. Alternativas Mais Simples**
- [ ] **Ajustar prompt/config** resolve? (vs criar código novo)
  - Exemplo: Melhorar system prompt Gemini, adicionar few-shot examples
  - Se SIM → ⛔ BLOQUEAR, usar alternativa
- [ ] **Parâmetro/flag** resolve? (vs criar abstração)
  - Exemplo: staleTime no React Query, enable flag no Supabase
  - Se SIM → ⛔ BLOQUEAR, usar parâmetro
- [ ] **Documentar uso existente** resolve? (vs reimplementar)
  - Exemplo: README de como usar feature X corretamente
  - Se SIM → ⛔ BLOQUEAR, criar doc

### Red Flags - Bloqueio Imediato

**❌ Se QUALQUER item abaixo for verdade, REJEITAR solução**:
- Parser/Extractor → Gemini JÁ faz via tool calling
- Cache custom → React Query JÁ tem staleTime/cacheTime
- Validation layer → Zod/TypeScript JÁ valida
- Auth middleware → Supabase Auth + RLS JÁ protege
- Wrapper/Adapter → Biblioteca já tem API direta

### Exemplos Bloqueados (Over-Engineering Detectados)

1. ❌ **`habit-field-parser.ts`**
   - Prometia: Parsing texto → estruturado
   - Realidade: Gemini JÁ extrai via function calling
   - ROI: Negativo (680 linhas sem benefício)
   - Ação: DELETADO (commit e380c00)

2. ❌ **Sentry MCP**
   - Prometia: Debug automático via MCP
   - Realidade: Curl + API Sentry faz o mesmo
   - ROI: Negativo (overhead config/manutenção)
   - Ação: REMOVIDO (ADR-010)

3. ❌ **Custom Auth**
   - Prometia: Login avançado
   - Realidade: Supabase Auth JÁ cobre 100%
   - ROI: Negativo (reinventar roda)
   - Ação: BLOQUEADO antes de implementar

### Regra de Ouro

> **"Se solução pode ser substituída por prompt melhor, config ou doc, é over-engineering."**

### Ação se Gate 1.5 FALHAR

- ⛔ **PAUSAR** Workflow 2a
- 🔙 **VOLTAR** para Workflow 1 (Reframing)
- 🔍 **PESQUISAR** alternativa nativa/existente
- ✅ **VALIDAR** com usuário antes de prosseguir

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

## ✅ FASE 4: CHECKPOINTS (REGRA #13 - Uma Ação Por Vez)

**CRÍTICO**: Durante todo este workflow, SEMPRE executar checkpoint após CADA ação atômica.

### 4.1. O que é uma Ação Atômica?

**Ação atômica** = Menor unidade testável e reversível.

**Exemplos deste workflow (Solutions)**:
- ✅ "Pesquisar abordagem X em docs oficiais (MCP context7)"
- ✅ "Executar brainstorm Gemini para gerar 5 soluções"
- ✅ "Criar matriz de decisão comparando 3 soluções"
- ✅ "Validar viabilidade técnica da solução A"
- ✅ "Documentar trade-offs de cada solução"
- ❌ "Criar todas 3 soluções completas" (NÃO atômico - múltiplas ações)

### 4.2. Checkpoint Obrigatório (Após Cada Ação)

**Usar script automatizado**:
```bash
./scripts/checkpoint.sh "descrição da ação executada"
```

**Ou manualmente**:

**Template de Checkpoint**:
```
✅ AÇÃO COMPLETA: [descrição da ação]

📸 EVIDÊNCIA:
[pesquisa realizada, matriz criada, análise de viabilidade]

🔍 VALIDAÇÃO:
- [x] Ação executada com sucesso
- [x] Sem erros/warnings
- [x] Output documentado
- [x] Próxima ação identificada

🎯 PRÓXIMA AÇÃO PROPOSTA:
[descrição da próxima ação]

⏸️ AGUARDANDO APROVAÇÃO do usuário para continuar.
```

### 4.3. Checklist Checkpoint (Executar a Cada Ação)

- [ ] **Executei apenas 1 ação?**
- [ ] **Mostrei evidência ao usuário?** (pesquisa, matriz, análise)
- [ ] **Usuário validou?** (aprovação explícita)
- [ ] **Documentei em `.context/`?** (attempts.log)
- [ ] **Identifiquei próxima ação?** (planejamento incremental)

### 4.4. Exemplo de Aplicação (Solutions)

**Fluxo com Checkpoints**:

```
1. AÇÃO: "Pesquisar libs para feature X (MCP context7 + firecrawl)"
   → Executar → Checkpoint → Aprovação

2. AÇÃO: "Brainstorm Gemini: gerar 5 soluções candidatas"
   → Executar → Checkpoint → Aprovação

3. AÇÃO: "Filtrar 5 → 3 soluções viáveis (Pareto 80/20)"
   → Executar → Checkpoint → Aprovação

4. AÇÃO: "Criar matriz de decisão (complexidade, risco, ROI)"
   → Executar → Checkpoint → Aprovação

5. AÇÃO: "Validar viabilidade técnica solução recomendada"
   → Executar → Checkpoint → Aprovação
```

### 4.5. Quando NÃO Aplicar Checkpoint

**Exceções** (ações podem ser agrupadas):
- ✅ **Pesquisa paralela**: Buscar 3 libs simultaneamente (MCP)
- ✅ **Análise agregada**: Ler docs oficiais + exemplos (leitura)

**MAS**: Mesmo nas exceções, mostrar resultado ANTES de próxima ação.

### 4.6. Benefícios no Solutions

**Eficiência**:
- ✅ Solução validada ANTES de design técnico detalhado
- ✅ Trade-offs discutidos ANTES de implementação
- ✅ Zero retrabalho (cada solução avaliada incrementalmente)

**Colaboração**:
- ✅ Usuário escolhe solução com visibilidade completa
- ✅ Feedback loop rápido (30seg por checkpoint)
- ✅ Ajuste de rota imediato (se solução inviável)

### 4.7. Documentação Automática

Cada checkpoint DEVE logar em `.context/attempts.log`:

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] CHECKPOINT: [ação] - SUCCESS" >> .context/${BRANCH_PREFIX}_attempts.log
```

**Ver**: REGRA #13 em `.claude/CLAUDE.md` para detalhes completos.

---

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 2a: Solutions ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Propostas 3 soluções (A: Simples, B: Balanceada, C: Avançada)
  - Comparação matriz de decisão (prós/contras/trade-offs)
  - Gate 1.5: Anti-duplicação validada (Gemini/React/Supabase nativo)
  - Recomendação fundamentada apresentada
  - Advogado do Diabo executado (10 perguntas críticas)
  - Anti-over-engineering validado (YAGNI/KISS)
- **Outputs**:
  - Matriz de decisão completa (3 soluções comparadas)
  - Solução recomendada com justificativa
  - Trade-offs documentados
  - Riscos iniciais identificados
- **Next**: Workflow 2b (Technical Design)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 2a (Solutions) concluído com sucesso.

**Solução escolhida**: [A / B / C / Customizada]

**Justificativa**: [Resumo da decisão baseada em matriz]

**Próximo passo**: Executar Workflow 2b (Technical Design) para detalhar arquitetura da solução escolhida.

---

## Próximos Passos

- [ ] Executar Workflow 2b (Technical Design)
- [ ] Arquitetura detalhada da solução
- [ ] Validação viabilidade técnica
- [ ] Criar ADR (se decisão arquitetural importante)

---

## Decisões Pendentes

[Se houver decisões técnicas pendentes após escolha da solução]

EOF

# Substituir seção no arquivo original (preservar "Última Atualização")
sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se escolhemos Solução B (Balanceada)
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 2a - Solutions
- **Decisão**: Solução B (Balanceada)
- **Por quê**: Equilíbrio simplicidade/performance, escalável, risco controlado
- **Trade-off**: Mais complexo que A, mas evita refatoração futura
- **Alternativas consideradas**:
  - A (Simples): Rejeitada - pode precisar refatorar depois
  - C (Otimizada): Rejeitada - over-engineering para volume atual
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 2a (Solutions) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] DECISION: Solução escolhida - [A/B/C]" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + decisão)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

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
