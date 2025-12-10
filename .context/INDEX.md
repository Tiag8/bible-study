# 📚 Context Index - feat/fix-list-of-facts

**Branch**: `feat/fix-list-of-facts`
**Created**: 2025-12-10 06:28 -03
**Feature**: fix-list-of-facts

---

## 📖 Ordem de Leitura (Para LLM)

**⚠️ SEMPRE ler nesta ordem ANTES de qualquer ação**:

1. **feat-fix-list-of-facts_workflow-progress.md** - Onde estou agora? (qual workflow ativo)
2. **feat-fix-list-of-facts_temp-memory.md** - Estado atual resumido (o que foi feito, próximos passos)
3. **feat-fix-list-of-facts_decisions.md** - Decisões já tomadas (por quê escolhemos X?)
4. **feat-fix-list-of-facts_validation-loop.md** - Tentativas Workflow 6 (se existir - loop crítico)
5. **feat-fix-list-of-facts_attempts.log** - Histórico completo (todas tentativas, sucesso + falhas)

---

## 📄 Descrição dos Arquivos

### feat-fix-list-of-facts_workflow-progress.md
**O que é**: Registro de CADA workflow executado (0-13)
**Quando atualizar**: Início (registrar start) e fim (registrar complete) de cada workflow
**Formato**:
```markdown
### Workflow X: [Nome] ✅ COMPLETO
- **Data**: YYYY-MM-DD HH:MM
- **Actions**: [lista de ações executadas]
- **Outputs**: [outputs gerados]
- **Next**: Workflow Y ([Nome])
```

### feat-fix-list-of-facts_temp-memory.md
**O que é**: Resumo do estado atual da branch
**Quando atualizar**: SEMPRE que estado mudar (código, decisão, bloqueio)
**Seções**:
- Estado Atual (onde estou, o que foi feito)
- Próximos Passos (TODOs)
- Decisões Pendentes (precisa escolher X?)
- Bloqueios/Questões (aguardando Y)

### feat-fix-list-of-facts_decisions.md
**O que é**: Log de decisões chave (arquitetura, stack, trade-offs)
**Quando atualizar**: Sempre que decisão importante for tomada
**Formato**:
```markdown
## Workflow X - [Nome]
- **Decisão**: [O que decidimos]
- **Por quê**: [Justificativa]
- **Trade-off**: [O que sacrificamos]
- **Alternativas consideradas**: [X, Y, Z]
```

### feat-fix-list-of-facts_validation-loop.md
**O que é**: Loop de tentativa/erro do Workflow 6 (User Validation)
**Quando atualizar**: Durante Workflow 6 (cada tentativa)
**Formato**:
```markdown
### Iteração N ([SUCESSO/FALHA])
- **Tentativa**: [O que tentei]
- **Resultado**: [O que aconteceu]
- **Erro** (se falha): [Mensagem de erro]
- **Causa Root** (se falha): [Por quê falhou]
- **Próxima tentativa**: [O que vou tentar agora]
```

### feat-fix-list-of-facts_attempts.log
**O que é**: Log append-only de TODAS tentativas (timestamp obrigatório)
**Quando atualizar**: TODA interação (workflow start/end, tentativa, decisão)
**Formato**:
```
[YYYY-MM-DD HH:MM] WORKFLOW: X ([Nome]) - [START/COMPLETO]
[YYYY-MM-DD HH:MM] ATTEMPT: [O que tentei]
[YYYY-MM-DD HH:MM] ✅ SUCESSO: [O que funcionou]
[YYYY-MM-DD HH:MM] ❌ FALHOU: [O que falhou] (causa: [X])
[YYYY-MM-DD HH:MM] DECISION: [Decisão tomada]
```

---

## ⚠️ REGRA CRÍTICA

**TODA interação DEVE atualizar pelo menos 1 arquivo acima.**

**Checklist pré-interação**:
- [ ] Li INDEX.md?
- [ ] Li workflow-progress.md (onde estou)?
- [ ] Li temp-memory.md (estado atual)?
- [ ] Li decisions.md (decisões já tomadas)?
- [ ] Se Workflow 6: Li validation-loop.md?
- [ ] Li últimas 30 linhas de attempts.log?

**Checklist pós-interação**:
- [ ] Atualizei workflow-progress.md (se workflow mudou)?
- [ ] Atualizei temp-memory.md (se estado mudou)?
- [ ] Logei em attempts.log?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Se Workflow 6: Atualizei validation-loop.md?

---

**Ver também**: `.claude/CLAUDE.md` Regra #12 (obrigatoriedade de atualização)
