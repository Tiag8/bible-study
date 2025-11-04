---
description: Workflow Add-Feature (8/9) - Meta-Learning (Aprender ANTES de Documentar)
auto_execution_mode: 1
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

# Workflow 8/11: Meta-Learning (Meta-Aprendizado)

Este é o **oitavo workflow** de 11 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 17: Meta-Aprendizado (análise guiada de aprendizados)
- Fase 18: Identificar Documentação Necessária

**Por que ANTES de documentar?**
- ✅ Aprendizados estão frescos na memória
- ✅ Documentação fica mais completa (inclui insights da implementação)
- ✅ Evita esquecer decisões/trade-offs importantes
- ✅ Sistema evolui continuamente

**⭐ IMPORTANTE**: Esta fase é fundamental para evolução do template e workflows!

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

**Exemplo:**
- Phase 17 (Meta-Aprendizado): 3+ agentes analisando diferentes aspectos (workflows, scripts, documentação)
- Phase 18 (Identificação de Docs): 5+ agentes investigando necessidades de diferentes áreas
- Investigações paralelas: Padrões, Segurança, Performance, Scripts, Documentação

---

## 🧠 Fase 17: Meta-Aprendizado (Análise Guiada)

**Objetivo**: Identificar melhorias em workflows, scripts, padrões e documentação.

### 17.1 Sobre o Workflow

**Análise de Eficiência:**

- [ ] **Alguma fase foi pulada ou considerada desnecessária?**
      → Se SIM: Qual fase? Por que foi pulada?
      → Ação: Devemos removê-la ou melhorar a descrição?

- [ ] **Alguma fase foi confusa ou ambígua?**
      → Se SIM: Qual fase? O que faltou de clareza?
      → Ação: Como podemos tornar mais clara?

- [ ] **Faltou alguma etapa que deveria existir?**
      → Se SIM: Qual etapa? Onde inserir no workflow?

- [ ] **Alguma fase tomou mais tempo que o esperado?**
      → Se SIM: Qual fase? Por quê?
      → Ação: Como otimizar? Criar script? Melhorar docs?

---

### 17.2 Novos Scripts/Ferramentas

- [ ] **Durante o desenvolvimento, você pensou: "Seria útil ter um script que..."?**
      → Se SIM: Descrever funcionalidade do script ideal
      → Exemplos:
        * Script para detectar queries N+1
        * Script para gerar boilerplate de componentes
        * Script para validar RLS no Supabase
        * Script para analisar performance de queries

- [ ] **Algum comando foi repetido várias vezes manualmente?**
      → Se SIM: Qual comando? Quantas vezes?
      → Ação: Deveria ser um script automatizado?

---

### 17.3 Sobre Código e Padrões

**Novos Padrões Descobertos:**

- [ ] **Surgiu algum padrão de código que vale documentar?**
      → Se SIM: Descrever padrão
      → Exemplo: "Padrão de hooks com cache + revalidação"
      → Onde documentar: AGENTS.md ou docs/padroes/

- [ ] **Descobrimos alguma otimização ou best practice nova?**
      → Se SIM: Qual? Qual foi o ganho?
      → Exemplo: "Lazy loading reduziu bundle em 40%"

- [ ] **Há algum anti-pattern que devemos evitar?**
      → Se SIM: Qual? Por que é ruim?
      → Exemplo: "Evitar múltiplas chamadas sequenciais ao Supabase"

**Decisões Arquiteturais:**

- [ ] **Alguma decisão arquitetural importante que merece ADR?**
      → Se SIM: Qual decisão? Por que foi importante?
      → Ação: Criar ADR em docs/adr/

---

### 17.4 Sobre Segurança

- [ ] **Encontramos alguma vulnerabilidade nova para adicionar ao scan?**
      → Se SIM: Qual tipo? Como detectar?
      → Ação: Adicionar pattern em scripts/run-security-tests.sh

- [ ] **Algum padrão de segurança que devemos documentar?**
      → Se SIM: Qual? Por que é importante?

- [ ] **Os scripts de segurança detectaram tudo necessário?**
      → Se NÃO: O que escapou? Como detectar no futuro?

---

### 17.5 Sobre Documentação

- [ ] **A estrutura de docs/ funcionou bem?**
      → Se NÃO: O que melhorar? Faltou alguma pasta?

- [ ] **Faltou algum tipo de documentação?**
      → Se SIM: Qual? Para que serve?
      → Exemplo: "docs/apis/ para documentar endpoints"

- [ ] **Tem algum documento inútil para o projeto?**
      → Se SIM: Qual? Porquê? Serve de histórico ou não serve para nada?

- [ ] **ADRs foram úteis? Precisam de melhorias?**
      → Se SIM: Que melhoria no template de ADR?

---

### 17.6 Sobre Scripts e Automação

- [ ] **Os scripts funcionaram conforme esperado?**
      → Se NÃO: Qual script? Qual problema?
      → Ação: Corrigir bug ou melhorar script

- [ ] **Algum script novo seria útil?**
      → Se SIM: Qual funcionalidade? Para que situação?

- [ ] **Validações dos scripts foram adequadas?**
      → Se NÃO: O que faltou validar?

- [ ] **Mensagens de erro dos scripts foram claras?**
      → Se NÃO: Qual script? Como melhorar mensagem?

---

## 📋 Fase 18: Identificar Documentação Necessária

Baseado nos aprendizados da Fase 17, identificar que documentação criar/atualizar:

### 18.1 Novos Padrões → AGENTS.md

**Se descobriu padrão novo:**
- Documentar em `AGENTS.md` na seção apropriada
- Incluir exemplo de código
- Explicar "por que" e "quando usar"

**Exemplo**:
```markdown
### Padrão: Lazy Loading de Libs Pesadas

**Quando usar**: Libs > 100KB (jspdf, html2canvas, recharts)

**Como fazer**:
```typescript
// ❌ Errado - importação estática
import jsPDF from 'jspdf';

// ✅ Correto - importação dinâmica
const { default: jsPDF } = await import('jspdf');
```

**Benefício**: Reduz bundle inicial em ~40%
```

---

### 18.2 Decisões Importantes → ADR

**Se tomou decisão arquitetural importante:**
- Criar ADR em `docs/adr/XXX-titulo-decisao.md`
- Usar template padrão
- Documentar alternativas consideradas

**Exemplo de ADR**:
- ADR 005: Usar Lazy Loading para Libs Pesadas
- ADR 006: Implementar Cache com React Query
- ADR 007: Separar Lógica de UI com Hooks Customizados

---

### 18.3 Feature Implementada → docs/features/

**Sempre atualizar feature map:**
- `docs/features/makeup.md` (se feature é do MakeUp)
- `docs/features/stats.md` (se feature é de Stats)
- Criar novo `.md` se for feature totalmente nova

**O que documentar**:
- Componentes novos/modificados (UI)
- Hooks novos/modificados (lógica de dados)
- Tabelas/schemas afetados (database)

---

### 18.4 Regras de Negócio → docs/regras-de-negocio/

**Se implementou nova regra/cálculo:**
- Atualizar `docs/regras-de-negocio/calculo-de-performance.md`
- Documentar fórmulas, pesos, lógica

---

### 18.5 README.md (se necessário)

**Quando atualizar**:
- Feature nova e importante (adicionar na lista)
- Nova dependência crítica (adicionar na stack)
- Novo script criado (adicionar em "Scripts Disponíveis")
- Nova otimização implementada (adicionar em "Otimizações")

---

### 18.6 Validar Tamanho de Workflows (OBRIGATÓRIO)

**Executar**: `./scripts/validate-workflow-size.sh`

**Se > 12k**: Split em `workflow-Xa.md`, `workflow-Xb.md` com navegação.

**Se splits < 12k juntos**: Consolidar se subsequentes diretos (fases relacionadas, fluxo contínuo). Caso contrário, manter separados (checkpoint natural é crítico).

**Checklist**:
- [ ] Validação executada
- [ ] Todos workflows <= 12.000 caracteres
- [ ] Splits com navegação (se necessário)
- [ ] Consolidações aplicadas (se aplicável)
- [ ] Referências atualizadas

---

### 18.7 Workflows (se necessário)

**Quando atualizar**:
- Quando alguma etapa foi pulada
- Quando ficou mais tempo que o normal em uma mesma etapa
- Quando faltou alguma etapa ou fase dentro de uma etapa
- Quando arquivo de workflow passa de 12 mil caracteres. Precisa dividir em mais de um arquivo e manter limite de 12 mil caracteres.
- Quando a atualização será benéfica para todo tipo de projeto, ou seja, nunca atualize arquivos de workflows com dados específicos do projeto corrente. As atualizações precisam ser genéricas e servir para todos projetos.
OBS: atualize inclusive esse próprio workflow de meta aprendizado se necessário.

---

## 🔄 Sistema de Aprovação de Mudanças

**Processo**: Identificar → Documentar proposta → Pedir aprovação → Aplicar (SE aprovado)

1. **Descrever** problema + solução + benefícios esperados
2. **Propor** mudança claramente (Workflow/Script/Documentação/Padrão)
3. **Aguardar aprovação** do usuário (CRÍTICO - não aplicar antes!)
4. **Aplicar** (se aprovado) → Testar → Commit `"meta: ..."`
5. **Sincronizar** com template (se genérico) + atualizar `docs/TEMPLATE_EVOLUTION.md`

---

## ✅ Checklist Final de Meta-Aprendizado

- [ ] Análise completa: todas perguntas respondidas ou N/A
- [ ] Pelo menos 1 aprendizado identificado
- [ ] Melhoria proposta (se houver) → aguardando aprovação
- [ ] Documentação mapeada: padrões (AGENTS.md), ADRs, features, regras-negocio
- [ ] Validação de workflow size executada (18.6)

---

## ✅ Checkpoint: Meta-Aprendizado Completo!

**Aprendizados capturados!**

**O que foi feito:**
- ✅ Análise guiada completa
- ✅ Melhorias identificadas (se houver)
- ✅ Documentação necessária mapeada
- ✅ Padrões novos documentados (se houver)
- ✅ Sistema evoluiu (se aprovado pelo usuário)

**Próxima etapa:** Documentação + Commit + Push + Merge!

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-9-finalization.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-9-finalization`

---

**Workflow criado em**: 2025-10-27
**Workflow atualizado em**: 2025-11-03
**Parte**: 8 de 11
**Próximo**: Finalization (Docs + Commit + Merge)