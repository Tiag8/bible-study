---
description: Workflow Add-Feature (6b/9) - RCA e Edge Cases (Root Cause Analysis)
auto_execution_mode: 1
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 6a

**Este é o Workflow 6b - Continuação de:**

← [Workflow 6a - User Validation](.windsurf/workflows/add-feature-6a-user-validation.md)

**Pré-requisito**: GATE 3 do Workflow 6a deve estar APROVADO.

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

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

---

## 🔍 Root Cause Analysis (RCA) - QUANDO APLICÁVEL

**⚠️ USAR APENAS SE**: Você encontrou bugs durante validação manual ou problemas reportados por usuário.

**PULAR ESTA SEÇÃO SE**: Feature funcionou perfeitamente de primeira ou problemas eram triviais.

---

### Quando Usar RCA Neste Workflow

Use RCA na **Fase 14 (Feedback)** quando:
- ✅ Bug reportado pelo usuário durante testes manuais
- ✅ Edge case não coberto (dados vazios, muitos dados, inválidos)
- ✅ Problema de UX/UI que deveria ter sido detectado antes
- ✅ Funcionalidade quebrou algo existente (regressão)
- ✅ Performance degradou (lento, travou, vazamento memória)

**Exemplos**:
- "Card não exibe dados vazios corretamente" → RCA necessário (edge case)
- "Botão está desalinhado 2px" → RCA NÃO necessário (ajuste trivial)
- "Clicar rápido 2x cria duplicado" → RCA necessário (race condition)

---

### Técnica: 5 Whys para Bugs de Validação

**Objetivo**: Identificar causa raiz de problemas encontrados em testes manuais

**Template**:

```markdown
## 🔍 Root Cause Analysis (5 Whys)

**Problema Reportado**: [Descrever bug encontrado em testes manuais]

**Análise**:

1. **Por quê o problema não foi detectado antes?**
   → [Resposta - falha em fase anterior]

2. **Por quê essa fase não detectou?**
   → [Resposta - teste/validação faltante]

3. **Por quê teste/validação não existia?**
   → [Resposta - checklist incompleto]

4. **Por quê checklist não cobria?**
   → [Resposta - processo com lacuna]

5. **Por quê processo tem lacuna?**
   → [Resposta - CAUSA RAIZ]

**Causa Raiz Identificada**: [Resumo da causa raiz]

**Fix Aplicado**: [Correção específica do código/UI]

**Prevenção Futura**: [Atualizar workflow/checklist/teste automatizado]
```

---

### Exemplos Reais de RCA (2 Casos Principais)

**Nota**: Para mais exemplos detalhados (regressão, performance, acessibilidade), consulte:
→ `docs/guides/ROOT_CAUSE_ANALYSIS.md`

---

### Exemplo Real 1: Edge Case Não Coberto (dados vazios)

```markdown
## 🔍 RCA - Card Mostra "undefined" com Dados Vazios

**Problema**: ProfitCard exibe "undefined" quando usuário não tem transações

**Análise**:
1. Por quê mostra "undefined"?
   → Código assume que data sempre existe (data.total)
2. Por quê assume que data existe?
   → Hook useProfit não trata caso de array vazio
3. Por quê hook não trata?
   → TDD (Workflow 5) só testou com dados mockados (happy path)
4. Por quê TDD não testou edge case?
   → Checklist de testes (Fase 11) não incluiu "dados vazios"
5. Por quê checklist não incluiu?
   → CAUSA RAIZ: Workflow 6 tem edge cases, mas não "retrofeed" para Workflow 5

**Causa Raiz**: Edge cases detectados em Workflow 6 não geram testes automatizados retroativos

**Fix Aplicado**:
```typescript
const total = data?.length > 0 ? data[0].total : 0; // ✅ Trata vazio
```

**Prevenção Futura**:
- ✅ Workflow 5: Adicionar teste com dados vazios
- ✅ Workflow 6: Se encontrar edge case, criar teste automatizado
- ✅ Code review: "Código trata dados vazios/null/undefined?"
```

---

### Exemplo Real 2: Problema de UX (double-click)

```markdown
## 🔍 RCA - Usuário Reporta Duplicação ao Clicar Rápido

**Problema**: Se usuário clica botão "Salvar" 2x rápido, cria 2 registros duplicados

**Análise**:
1. Por quê duplica?
   → Botão não tem proteção contra double-click
2. Por quê não tem proteção?
   → Código implementado sem considerar UX de clicks rápidos
3. Por quê não foi considerado?
   → Testes automatizados (Workflow 5) não simulam double-click
4. Por quê não simulam?
   → Vitest testa lógica, não interação de usuário real
5. Por quê interação real não é testada?
   → CAUSA RAIZ: Workflow 6 findings não viram testes E2E

**Causa Raiz**: Problemas de UX encontrados em testes manuais não geram testes E2E automatizados

**Fix Aplicado**:
```typescript
<Button disabled={isLoading || isSaving}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>
```

**Prevenção Futura**:
- ✅ Workflow 5: Template de Button com disabled={isLoading} por padrão
- ✅ Workflow 6: Adicionar teste de double-click na Fase 13.3
- ✅ Code review: "Botões de mutation têm disabled={isLoading}?"
```

---

### Como Aplicar RCA na Validação Manual (Fase 14)

**Fluxo de RCA**:
1. Usuário reporta problema (Fase 13)
2. Reproduzir bug + Executar 5 Whys
3. Aplicar fix que resolve causa raiz
4. Atualizar Workflow 6 (checklist permanente)
5. Criar teste automatizado se aplicável
6. Re-testar + Commit

**Exemplo de commit após RCA**:
```bash
git commit -m "fix: double-click protection em SaveButton

Problema: Usuário reportou duplicação ao clicar rápido
Causa Raiz: Workflow 6 não testava interações de usuário real
Fix: disabled={isLoading} + loading spinner

Prevenção: Checklist de double-click adicionado ao Workflow 6"
```

---

### Benefícios do RCA em Validação Manual:

- ✅ Bugs não voltam (checklist permanente)
- ✅ Testes E2E crescem com problemas reais
- ✅ Qualidade aumenta (detecta classes de problemas, não instâncias isoladas)

---

### Quando PULAR RCA

**NÃO usar RCA se**:
- ❌ Ajuste trivial de UI (cor, espaçamento, typo)
- ❌ Feature funcionou perfeitamente de primeira
- ❌ Bug óbvio com causa clara (ex: variável com nome errado)
- ❌ Primeira ocorrência sem padrão

**Economiza tempo**: Use RCA para problemas que revelam lacunas sistêmicas.

---

### Próximo Passo Após RCA

Se identificou causa raiz sistêmica:

1. **Atualizar Workflow 6**: Adicionar item em checklist (Fase 13.2/13.3)
2. **Atualizar Workflow 5**: Criar teste automatizado se aplicável
3. **Criar Teste E2E**: Para problemas de UX/interação (Playwright)
4. **Meta-Learning**: Documentar padrão a evitar/adotar (Workflow 8)

---

## ✅ Checkpoint: Validação Manual Completa!

**Feature validada e aprovada pelo usuário!**

**Próximas etapas**:
- Code Review (Workflow 7)
- Security Scan (Workflow 7)
- Documentação + Commit + Push

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-7-quality.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-7-quality`

---

**Workflow criado em**: 2025-10-27 | **Dividido em**: 2025-11-04
**Parte**: 6b de 11 (Parte 2 de 2)
**Próximo**: Quality (Code Review + Security)
