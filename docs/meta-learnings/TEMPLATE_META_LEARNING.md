# Meta-Learning Template

**Use este template para documentar meta-learnings sistêmicos**

---

## 📋 INFORMAÇÕES BÁSICAS

**Data**: YYYY-MM-DD
**Feature**: [Nome da feature]
**Branch**: [Nome da branch]
**Status**: ✅ COMPLETO / ⚠️ EM PROGRESSO / ❌ CANCELADO

---

## 🎯 RESUMO EXECUTIVO

**Feature implementada**: [Breve descrição do que foi feito]

**Bugs corrigidos** (N total):
1. [Bug 1 - breve descrição]
2. [Bug 2 - breve descrição]
3. [Bug N - breve descrição]

**Meta-Learnings sistêmicos** identificados (ROI > 10x):
- ML-XX.1: [Nome do learning 1]
- ML-XX.2: [Nome do learning 2]
- ML-XX.N: [Nome do learning N]

---

## 🐛 PROBLEMA 1: [Título do Problema]

### **Sintoma**
- [Descrição do que aconteceu]
- [Logs/erros observados]

### **Root Cause Analysis (5 Whys)**
1. Por quê [sintoma]? → [Resposta imediata]
2. Por quê [resposta 1]? → [Causa subjacente]
3. Por quê [resposta 2]? → [Causa profunda]
4. Por quê [resposta 3]? → [Processo/sistema]
5. Por quê [resposta 4]? → **[Causa raiz SISTÊMICA]**

### **Causa Raiz**
**SISTÊMICA** ou **PONTUAL**?
- Se SISTÊMICA: Afeta múltiplas features → VÁLIDO para meta-learning
- Se PONTUAL: Afeta apenas feature atual → DESCARTAR

### **Solução Implementada**
```[language]
// ❌ ERRADO
[código incorreto]

// ✅ CORRETO
[código correto]
```

### **Meta-Learning ML-XX.1: [Nome do Learning]**

**Adicionar ao Workflow [N] (após [fase], antes de [fase])**:

```markdown
### Gate: [Nome do Gate]

**ANTES de [ação]**:
- [ ] [Checklist item 1]
- [ ] [Checklist item 2]
- [ ] [Checklist item N]

**Comando validação**:
```bash
# [Comando para validar]
```

**Se falhar**: [Ação corretiva]
```

**ROI**: Previne [tempo] por [unidade]

---

## 🐛 PROBLEMA 2: [Título do Problema]

[Repetir estrutura acima]

---

## ✅ APLICAÇÃO DOS META-LEARNINGS

### **Workflow [N]: [Nome do Workflow]**

Adicionar [N] novos gates:

**Após Fase [X] ([Nome da Fase])**:
```markdown
### [X.Y] Quality Gates (Pré-[Ação])

**Gate 1: [Nome]** (se [condição])
- [ ] [Checklist]

**Gate 2: [Nome]** (se [condição])
- [ ] [Checklist]

**Gate N: [Nome]** (se [condição])
- [ ] [Checklist]
```

---

## 📊 IMPACTO

**Bugs prevenidos**: [N] tipos ([tipo1], [tipo2], [tipoN])
**Tempo economizado**: [tempo] por [unidade]
**ROI**: [N]x+ ([cálculo])

**Aplicável a**: [Contexto de aplicação]
- [Condição 1]
- [Condição 2]
- [Condição N]

---

## 📚 REFERÊNCIAS

- **Docs Oficiais**: [Link]
- **Meta-Learning**: [Link para outro ML]
- **Workflow**: [Link para workflow afetado]
- **Migration/Code**: [Link para código]

---

**Última atualização**: YYYY-MM-DD
**Status**: [Aplicado/Pendente/Validado]
**ROI Validado**: ✅ [N]x+ / ⚠️ Estimado / ❌ Não medido
