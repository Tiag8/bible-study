---
description: Workflow Add-Feature (8/9) - Meta-Learning (Aprender ANTES de Documentar)
---

# Workflow 8/9: Meta-Learning (Meta-Aprendizado)

Este é o **oitavo workflow** de 9 etapas modulares para adicionar uma nova funcionalidade.

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

## 🔄 Sistema de Aprovação de Mudanças

**IMPORTANTE**: Antes de aplicar qualquer mudança em workflows, scripts ou padrões, SEMPRE seguir este processo:

### Passo 1: Identificar Melhoria

Se você identificou alguma melhoria (novo script, melhoria em workflow, padrão novo), siga este fluxo:

1. Descrever claramente a melhoria proposta
2. Explicar o problema que resolve
3. Mostrar benefícios esperados

### Passo 2: Preparar Proposta

**Template de Solicitação de Mudança:**
```markdown
## 🔄 Proposta de Melhoria

**Tipo**: [Workflow / Script / Documentação / Padrão]

**Problema Identificado**:
[O que não funciona bem hoje]

**Solução Proposta**:
[O que vai mudar e como resolve]

**Benefícios Esperados**:
- ✅ Benefício 1
- ✅ Benefício 2

**Riscos/Trade-offs**:
- ⚠️ Risco 1 (e como mitigar)
```

### Passo 3: Pedir Aprovação ao Usuário

**⚠️ AGUARDAR RESPOSTA DO USUÁRIO**

Não aplicar mudanças até receber aprovação explícita!

### Passo 4: Aplicar (SE Aprovado)

Apenas se usuário aprovar:
1. Aplicar mudança no projeto atual
2. Testar mudança
3. Commit: `git commit -m "meta: [descrição da melhoria]"`
4. Sincronizar com template (se melhoria for genérica)
5. Documentar evolução em `docs/TEMPLATE_EVOLUTION.md`

---

## ✅ Checklist Final de Meta-Aprendizado

**Antes de finalizar, confirme:**

#### Análise Completa
- [ ] Respondi todas as perguntas de análise (ou marquei N/A)
- [ ] Identifiquei pelo menos 1 aprendizado (mesmo que pequeno)
- [ ] Avaliei se workflow funcionou bem nesta feature

#### Ações Tomadas
- [ ] **Se identifiquei melhoria** → Documentei proposta
- [ ] **Se proposta criada** → Pedi aprovação ao usuário (ANTES/DEPOIS)
- [ ] **Se usuário aprovou** → Apliquei mudança e testei
- [ ] **Se aplicado** → Commit com mensagem "meta: ..."

#### Documentação Identificada
- [ ] Listei que docs criar/atualizar
- [ ] Novos padrões → AGENTS.md
- [ ] Decisões importantes → ADR
- [ ] Feature implementada → docs/features/
- [ ] Regras de negócio → docs/regras-de-negocio/

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
**Parte**: 8 de 9
**Próximo**: Finalization (Docs + Commit + Merge)
