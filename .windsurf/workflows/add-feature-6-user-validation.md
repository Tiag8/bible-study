---
description: Workflow Add-Feature (6a/9) - User Validation (Validação Manual - CRÍTICO!)
auto_execution_mode: 1
---

## 📚 Pré-requisito
Ler: `docs/PLAN.md`, `docs/TASK.md`, `.windsurf/workflows/`, `docs/`

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES
**SEMPRE usar o MÁXIMO de agentes possível em paralelo** (até 36x mais rápido).

---

# Workflow 6a/11: User Validation

**O que acontece**:
- Fase 12.5: Reframing Pré-Validação
- Fase 13: PARADA OBRIGATÓRIA - Testar Manualmente
- Fase 14: Ciclo de Feedback
- GATE 3: Usuário confirma "funciona perfeitamente!"

**⚠️ NENHUM commit foi feito ainda!** Código está na branch local esperando SUA aprovação.

---

## 🔄 Fase 12.5: Reframing Pré-Validação

**ANTES de testar**, validar se estamos testando o problema CERTO.

### 3 Passos
1. **Questionar**: O que usuário REALMENTE pediu? Resolve raiz ou sintoma?
2. **Perspectiva**: Como usuário usaria? Qual dor resolvemos? Casos não considerados?
3. **⭐ Pergunta Forte**:
   > "Qual problema, se resolvido, eliminaria múltiplos sintomas?"

**Exemplo**:
```
❌ "Botão export PDF"
⭐ "Qual problema PDF + impressão + compartilhamento resolvem?"
✅ "Compartilhar progresso" → Link público + PDF opcional
```

**Decisão**:
- [ ] ✅ Continuar (problema CERTO)
- [ ] ⚠️ Ajustar (solução melhor)
- [ ] ❌ Repensar (problema mal definido)

---

## 🧪 Fase 13: PARADA OBRIGATÓRIA - Testar

```bash
npm run dev  # http://localhost:5173/
```

### Checklist Funcional
- [ ] Feature funciona (comportamento, dados, interações)
- [ ] Não quebrou features existentes
- [ ] UI correta (layout, cores, espaçamento)
- [ ] Responsivo OK (mobile < 640px, tablet, desktop)
- [ ] Performance < 500ms, sem travamentos
- [ ] Console limpo (F12 → sem erros)
- [ ] TypeScript OK (terminal)

### Edge Cases
- [ ] Dados vazios (mensagem amigável)
- [ ] Muitos dados (100+ itens)
- [ ] Dados inválidos (validação clara)
- [ ] Offline (DevTools → Network → Offline, se aplicável)

### Integração
- [ ] Supabase OK (busca, mutations, RLS)
- [ ] Queries < 500ms (DevTools → Network)
- [ ] Sem vazamento memória (interagir 1-2min)
- [ ] Build produção (`npm run build`)

---

## 🔄 Fase 14: Ciclo de Feedback

### 14.1 Problemas ⚠️

**NÃO prossiga! Descreva**:
- O que está errado?
- Como reproduzir?
- Esperado vs. atual?
- Screenshot/video?

**Fluxo**: Descreve → IA corrige (`fix:`) → Testes auto (Fase 11) → Testa (Fase 13) → Repete até perfeito

**🐛 Complexos**: Use `debug-complex-problem.md` (5 agentes, 5 Whys)

**Iterações esperadas**: 2-4 (normal)

### 14.2 Tudo OK ✅

**Confirme**:
- ✅ TODOS checkboxes marcados
- ✅ Performance OK, UI/UX como esperado
- ✅ Sem erros console, build OK

**Digite**: `Aprovar` ou `OK` ou `Funciona perfeitamente`

---

## ✅ GATE 3 CHECKLIST

**⛔ NÃO prosseguir sem ✅ em TODOS**

**Funcionalidade**
- [ ] Feature funciona conforme especificado
- [ ] Casos de uso testados (happy + edge)
- [ ] Integração OK

**Design & UX**
- [ ] Layout correto
- [ ] Cores consistentes
- [ ] Responsivo (375px, 768px, 1440px)
- [ ] Navegação teclado (Tab, Enter, Esc)
- [ ] Contraste WCAG AA
- [ ] Animações < 16ms/frame

**Qualidade Técnica**
- [ ] Console limpo (0 erros, 0 warnings críticos)
- [ ] Vite compila sem TS errors
- [ ] Performance (queries < 500ms, interações < 100ms)
- [ ] Build produção funciona
- [ ] TypeScript compila

**Integração**
- [ ] Supabase: salva/carrega OK
- [ ] RLS: não vê outros usuários
- [ ] Mutations funcionam
- [ ] Sem vazamento memória
- [ ] Queries otimizadas (sem N+1)

**Edge Cases**
- [ ] Dados vazios OK
- [ ] Muitos dados (> 100)
- [ ] Dados inválidos OK
- [ ] Offline testado
- [ ] Erros tratados

**Se item NÃO está ✅**: Voltar Fase 14.1!

---

## ✋ GATE 3: Confirmação

**⚠️ PARADA OBRIGATÓRIA**

**Decisão**:
- **✅ APROVAR** - Todos checkboxes ✅
- **⚠️ AJUSTAR** - Problemas, volta 14.1

**Aguardando confirmação...** 🚦

---

## 🧠 Meta-Learning

**⚠️ NÃO PULE**: Fundamental para evolução.

### Questões (TODAS)

**1. Eficiência (1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Qual fase? Como melhorar?

**2. Iterações:**
- [ ] Número: __
- [ ] Se > 3: O que causou? Como automatizar?

**3. Gaps:**
- [ ] Validação faltou? Gate falhou?
- [ ] Comando repetido 3+ vezes? Automatizar?

**4. RCA (se problema):**
- [ ] Problema: [breve]
- [ ] 5 Whys? Causa raiz sistêmica?
- [ ] Afeta múltiplas features? (SE NÃO: descartar)
- [ ] Meta-learning previne?

### Ações (Se Aplicável)
- [ ] Workflow precisa melhorias?
- [ ] CLAUDE.md precisa seção?
- [ ] Novo script? Nome + função
- [ ] ADR necessário?

**ROI**: [Ex: "20min/feature" ou "Previne 2h debug"]

**Só learnings SISTÊMICOS** (não pontuais)

**Validar tamanho**:
```bash
wc -c .windsurf/workflows/add-feature-6a-user-validation.md  # ✅ < 12000
```

**Se > 11k**: Remover exemplos, consolidar checklists, extrair para docs/

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

## ⏭️ CONTINUAÇÃO

**Continua em**: [Workflow 6b - RCA e Edge Cases](.windsurf/workflows/add-feature-6b-rca-edge-cases.md)

**Próximas etapas**:
- Análise Root Cause
- Testes edge cases
- Validação final

---

## 📝 Atualização Docs

**Obrigatório**
- [ ] Atualizar `docs/TASK.md`
- [ ] Atualizar `docs/PLAN.md` (se mudança estratégica)

**Se Criou Docs**
- [ ] Adicionar em `docs/INDEX.md`, `README.md`
- [ ] Nomes consistentes
- [ ] "Última atualização"

**Se Decisão Arquitetural**
- [ ] Criar ADR `docs/adr/`
- [ ] Referenciar `docs/ARCHITECTURE.md`

**Boas Práticas**: Não criar docs desnecessários, manter atualizados, links absolutos (`/docs/`), versionamento

---

**Workflow criado**: 2025-10-27 | **Dividido**: 2025-11-04
**Parte**: 6a de 11 (Parte 1 de 2)
**Próximo**: Workflow 6b
