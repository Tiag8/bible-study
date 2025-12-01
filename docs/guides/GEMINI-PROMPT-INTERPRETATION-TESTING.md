# Guide: Gemini Prompt Interpretation Testing

> **Propósito**: Framework para validar que Gemini interpreta prompts como esperado.
>
> **Root Cause**: fix-coach-web Learning #3 - Regra "Máximo 1 emoji" foi interpretada como "sempre use 1 emoji" em vez de "use no máximo 1 se necessário".
>
> **ROI**: Previne 3+ bugs/ano (2h cada = 6h economizadas)

**Última atualização**: 2025-11-26
**Versão**: 1.0.0

---

## 🎯 Problema

LLMs (Gemini, GPT, Claude) interpretam prompts de forma **literal**, não **contextual**.

**Exemplo Real (fix-coach-web)**:

```
Regra no prompt: "Máximo 1 emoji por mensagem"

❌ Interpretação LLM: "Devo usar 1 emoji em toda mensagem"
✅ Intenção humana: "Use no máximo 1 emoji, apenas quando apropriado"
```

**Resultado**: Coach Web respondia com emoji em TODA mensagem, mesmo quando desnecessário.

---

## 🧪 Framework de Validação (3 Partes)

### Parte 1: Human Intended (O que você quer)

Antes de escrever a regra, documente:

```markdown
**Regra**: [texto da regra]
**Intenção**: [o que você realmente quer que aconteça]
**Casos de uso**:
- Quando SIM: [exemplos onde regra aplica]
- Quando NÃO: [exemplos onde regra NÃO aplica]
```

**Exemplo**:
```markdown
**Regra**: "Máximo 1 emoji por mensagem"
**Intenção**: Usar emoji apenas para celebrações ou ênfase especial
**Casos de uso**:
- Quando SIM: "Parabéns pelo streak! 🎉", "Meta atingida! 🏆"
- Quando NÃO: "Sim, posso ajudar.", "Aqui estão seus hábitos."
```

### Parte 2: Gemini Response (O que Gemini entende)

**Técnica**: Pergunte ao Gemini como ele interpreta a regra.

```typescript
// Test prompt
const testPrompt = `
Você recebeu esta regra: "${regra}"

Responda:
1. Como você interpreta esta regra?
2. Em quais situações você aplicaria?
3. Em quais situações você NÃO aplicaria?
4. Dê 3 exemplos de respostas seguindo esta regra.
`;
```

**Se interpretação divergir**: Reescreva a regra (ver Parte 3).

### Parte 3: Rewrite Pattern (Corrigindo ambiguidade)

**Padrão Correto**: Usar condicionais explícitos, não limites vagos.

```markdown
❌ AMBÍGUO (evitar):
- "Máximo X"
- "Mínimo X"
- "Até X"
- "No máximo X"
- "Pelo menos X"

✅ EXPLÍCITO (preferir):
- "Use X APENAS SE [condição]"
- "Use X QUANDO [situação específica]"
- "NÃO use X EXCETO [casos específicos]"
- "Default: NÃO. Exceção: [condições]"
```

**Exemplos de Rewrite**:

| Ambíguo | Explícito |
|---------|-----------|
| "Máximo 1 emoji" | "Emoji: Use APENAS se celebração OU ênfase necessária (default: sem emoji)" |
| "Respostas curtas" | "Respostas: 100-300 caracteres. SE pergunta complexa: até 500" |
| "Seja informal" | "Tom: Use 'você', evite 'senhor'. Gírias: apenas se usuário usar primeiro" |
| "Até 5 exemplos" | "Exemplos: 2-3 por resposta. SE tutorial: até 5" |

---

## ✅ Checklist Pré-Deploy (Gemini Prompts)

Antes de deployar qualquer mudança em system prompts:

### 1. Scan de Palavras Ambíguas
```bash
# Buscar padrões ambíguos no prompt
grep -iE "máximo|mínimo|até|no máximo|pelo menos|sempre|nunca" supabase/functions/_shared/*.ts
```

**SE encontrar**: Reescrever usando padrão explícito.

### 2. Teste de Interpretação
```typescript
// Adicionar ao teste (manual ou automatizado)
const rules = extractRulesFromPrompt(SYSTEM_PROMPT);

for (const rule of rules) {
  const interpretation = await gemini.generateContent(`
    Como você interpreta: "${rule}"?
    Responda em 1 frase.
  `);

  console.log(`Regra: ${rule}`);
  console.log(`Interpretação: ${interpretation}`);
  // Validar manualmente se interpretação está correta
}
```

### 3. Validação Token Budget
```bash
# Verificar que prompt < 9000 tokens (ADR-023)
./scripts/validate-gemini-token-budget.sh
```

### 4. Teste Real (Obrigatório)
- [ ] Enviar 3-5 mensagens de teste
- [ ] Verificar que comportamento está correto
- [ ] Verificar que regras são seguidas (não exageradas)

---

## 📚 Exemplos de Bugs Prevenidos

### Bug 1: Emoji Overuse (fix-coach-web)

**Regra original**: "Máximo 1 emoji por mensagem"
**Bug**: Coach usava emoji em TODA resposta
**Fix**:
```
"Emoji: Use APENAS se rapport do usuário sugerir OU se necessário
para comunicação (não por padrão)"
```

### Bug 2: Response Length (hipotético)

**Regra original**: "Respostas curtas"
**Bug potencial**: Respostas de 10 palavras, sem contexto
**Fix**:
```
"Respostas: 100-300 caracteres. Incluir: confirmação da ação +
próximo passo sugerido. SE pergunta complexa: até 500"
```

### Bug 3: Formality (hipotético)

**Regra original**: "Seja informal"
**Bug potencial**: Gírias e linguagem muito casual
**Fix**:
```
"Tom: Brasileiro informal (você, não senhor). Evite: gírias,
abreviações (vc, tb). Permitido: contrações normais (tá, pra)"
```

---

## 🔗 Integração com Workflows

### Workflow 5a (Implementation)
Adicionar antes de deploy de prompts:

```markdown
### Fase X.5: Prompt Interpretation Validation

**SE modificou system prompt**:
1. [ ] Scan palavras ambíguas (`grep -iE "máximo|mínimo|até"`)
2. [ ] Rewrite usando padrão explícito
3. [ ] Teste interpretação (perguntar ao Gemini)
4. [ ] Teste real (3-5 mensagens)

**Red Flags**:
- Palavras: "máximo", "mínimo", "sempre", "nunca" sem condição
- Limites vagos sem casos de uso
- Regras que podem ser interpretadas de 2+ formas
```

### Workflow 4.5 (Pre-Implementation)
Adicionar check em GATE 1:

```markdown
### GATE 1.5: Prompt Interpretation Check

**SE feature usa Gemini AI**:
- [ ] System prompt usa padrões explícitos (não ambíguos)?
- [ ] Validei interpretação com teste Gemini?
- [ ] Token budget < 9000? (ADR-023)
```

---

## 📖 Referências

- **ADR-023**: Gemini System Prompt Token Limit (9000)
- **fix-coach-web**: Learning #3 (Prompt Interpretation Testing)
- **Memory Global**: `~/.claude/memory/prompt.md` v1.4.0
- **Memory Global**: `~/.claude/memory/gemini.md` (Token limits)

---

## 📝 Template de Documentação

Ao criar nova regra em prompt, documentar:

```markdown
## Regra: [Nome]

**Texto**: "[texto exato no prompt]"

**Intenção**: [o que você quer]

**Interpretação esperada Gemini**: [como Gemini deve entender]

**Casos de uso**:
- ✅ Aplicar: [exemplos]
- ❌ Não aplicar: [exemplos]

**Validação**: [como testar]
```

---

**Próxima atualização**: Quando novo padrão de ambiguidade for identificado.

**Status**: Ativo ✅
