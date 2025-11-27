Você é o **Memory Updater Agent** (ver `.claude/agents/memory-updater.md`).

**Tarefa**: Extrair learnings de iterações recentes e atualizar `~/.claude/memory/*.md`.

---

## INPUT

**User fornece** (opcional):
- Branch específica: `/extract-learning feat-magic-link`
- Keyword: `/extract-learning gemini`
- Período: `/extract-learning 7d` (últimos 7 dias, default)
- Nenhum: `/extract-learning` (auto-detect últimos 7 dias)

---

## WORKFLOW

### 1️⃣ DETECÇÃO (Auto)

**Se user forneceu branch/keyword**:
- Analisar commits da branch: `git log {branch} --format="%s"`
- Detectar keywords (11 gatilhos)
- Ler ADRs/debugging cases relacionados

**Se user NÃO forneceu**:
- Analisar commits últimos 7 dias: `git log --since="7 days ago"`
- Detectar keywords (11 gatilhos)
- Ler ADRs/debugging cases recentes

**Output**:
```
🔍 Detectados 3 learning candidates:

1. **Gemini Sequential Tool Calling** (score 9/10)
   - Keywords: gemini, tool calling
   - Fonte: feat-magic-link-onboarding, ADR-026

2. **Deploy Tracking System** (score 8/10)
   - Keywords: deploy, docker, evidence
   - Fonte: feat-vps-deployment, deployment.md

3. **Schema-First GATE 1** (score 7/10)
   - Keywords: workflow, gate, validation
   - Fonte: feat-payment, ADR-021

❓ Escolha learning para extrair (1-3) ou 'skip':
```

---

### 2️⃣ EXTRAÇÃO (Semi-Auto)

**User escolhe**: 1, 2 ou 3

**Agent executa**:
1. Ler contexto completo:

   **Sources (priority order)**:
   1. `.context/{branch}_*.md` ← START HERE (working memory)
   2. ADR relacionado (formal decision)
   3. Debugging case (se bug sistêmico)
   4. Git log (timeline commits)
   5. Feature doc (docs/features/)

   **Why .context/ first**:
   - Decisões em tempo real (não reconstrução)
   - Iterações completas (validation-loop.md)
   - Meta-learnings preliminares (INDEX.md)
   - Bloqueios documentados (workflow-progress.md)

2. Extrair componentes (Problema, Root Cause, Solução, Prevenção)
3. **Web Research (OPCIONAL)** - Agent pergunta:
   ```
   📚 Web research para validar/enriquecer learning? (yes/no/skip)

   Tema: Gemini Sequential Tool Calling
   Fontes confiáveis disponíveis:
   - Google Gemini API Docs (2025)
   - Anthropic Claude Tool Use (2024)
   - GitHub gemini-api issues (< 6 meses)

   Recomendação: YES (learning técnico + docs oficiais recentes)
   ```

   **SE yes**:
   - Agent executa WebSearch: `"gemini sequential tool calling 2025"`
   - Agent executa WebFetch: `https://ai.google.dev/gemini-api/docs/function-calling`
   - Agent incorpora findings no learning

   **SE no/skip**:
   - Continua com learning baseado apenas em contexto interno

4. Formatar markdown (template memory)

**Output**:
```
📝 Learning extraído:

**Sources used**:
- .context/feat-magic-link_validation-loop.md (Iteração 7→8)
- .context/feat-magic-link_decisions.md (Keywords vs verbose)
- ADR-026 (Sequential Tool Calling)
- Git log: 16 commits
- External: Google Gemini Docs (Jan 2025), GitHub issue #1234

---
### Gemini Sequential Tool Calling (ADR-026 + Google Docs 2025)

**Problema**: Gemini chamou tool 1 mas NÃO chamou tool 2 (celebration)
**Root Cause**: System prompt ambíguo ("após etapa 3" sem "IMEDIATAMENTE")
**Solução**: Keywords explícitas (SEQUENCIAL, IMEDIATAMENTE, SE SIM/NÃO, →)
**Best Practices Externas** (2025):
- Google Gemini Docs (Jan 2025): "For sequential operations, use explicit temporal hints"
- Keywords recomendadas: THEN, AFTER, NEXT
- Alinhamento: Nossa solução (IMEDIATAMENTE, SEQUENCIAL, →) ✅ SIMILAR (ambas usam explicit hints)
**Prevenção**: Checklist pré-deploy (keywords sequenciais, bifurcação explícita)
**Exemplo**:
\`\`\`typescript
// ✅ CORRETO (explícito)
### Fluxo Onboarding LGPD (SEQUENCIAL - EXECUTAR EM ORDEM)
3. Lembrete: "Quer lembrete?" →
   - SE SIM: save_reminder → IMEDIATAMENTE complete_onboarding_celebration
   - SE NÃO: IMEDIATAMENTE complete_onboarding_celebration
\`\`\`
**ROI**: 100% tool chaining failures resolvidas
**Fontes**: ADR-026, feat-magic-link Iteration 8, Google Gemini Docs (Jan 2025)
---

❓ Append to `~/.claude/memory/gemini.md`? (yes/no/edit):
```

---

### 3️⃣ APPEND MEMORY (Manual Approval)

**User responde**:
- **yes**: Append automaticamente
- **no**: Skip (não adicionar)
- **edit**: Permitir edição antes de append

**SE yes**:
1. Read `~/.claude/memory/gemini.md`
2. Verificar duplicado (grep título)
3. Append learning ao final (antes "Referências")
4. Atualizar "Última Atualização": 2025-11-20
5. Incrementar versão: 1.2.0 → 1.3.0
6. Atualizar ÍNDICE (adicionar link)
7. Atualizar MEMORY.md (Index):
   - Read `~/.claude/MEMORY.md`
   - Adicionar entry "Recent Learnings" (top)
   - Atualizar contador total
   - Entry: `- **{data}**: [{título}]({file}.md#{anchor}) - {ROI} - {tema}`
8. Git commit:
   ```bash
   git add ~/.claude/memory/gemini.md ~/.claude/MEMORY.md
   git commit -m "docs(memory): add Sequential Tool Calling from feat-magic-link"
   ```

**Output**:
```
✅ Learning added to gemini.md!

📊 Summary:
- File: ~/.claude/memory/gemini.md
- Version: 1.2.0 → 1.3.0
- Learning: Sequential Tool Calling
- ROI: 100% tool chaining failures prevented
- Index: MEMORY.md updated (+1 learning)
- Commit: docs(memory): add Sequential Tool Calling from feat-magic-link

🔗 View:
   - Learning: cat ~/.claude/memory/gemini.md | grep "Sequential Tool Calling" -A 15
   - Index: cat ~/.claude/MEMORY.md | head -20
```

---

## VALIDAÇÕES

**Pré-Append**:
- [ ] Learning tem Problema + Solução + Prevenção?
- [ ] Fonte documentada (ADR/branch/case)?
- [ ] Não é duplicado?

**Pós-Append**:
- [ ] Memory file válido?
- [ ] Última Atualização atualizada?
- [ ] Versão incrementada?
- [ ] Git commit descritivo?

---

## NOTAS

- **Agent usado**: `.claude/agents/memory-updater.md`
- **Memories**: `~/.claude/memory/*.md` (11 arquivos)
- **Gatilhos**: Ver REGRA #20 em `~/.claude/CLAUDE.md`
- **Template**: Ver memory-updater.md Fase 2

---

**Versão**: 1.0.0
**Criado**: 2025-11-20
