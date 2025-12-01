# ADR-035: AI-First Architecture Pattern

## Status
Accepted

## Data
2025-11-23

## Context

### Problema
Handlers de webhook WhatsApp tradicionalmente implementam lógica condicional complexa:
- Switch/case para cada estado do fluxo
- Validações hardcoded por etapa
- Lógica de transição de estados no handler
- Formatação de respostas inline

Resultado: Handlers com 500-700+ linhas, difíceis de manter e estender.

### Evidência do Problema
`webhook-whatsapp-onboarding-v2` v1.0 tinha 638 linhas com:
- 15+ condicionais de estado
- Validações duplicadas
- Lógica de negócio misturada com orquestração
- Difícil adicionar novos estados

## Decision

**Adotar AI-First Architecture**: Gemini Tools processam TODA lógica de negócio, handler apenas orquestra.

### Princípios

1. **Handler = Orquestrador Mínimo**
   - Recebe mensagem
   - Chama Gemini com contexto
   - Executa tool calls retornadas
   - Envia resposta

2. **Gemini = Cérebro do Fluxo**
   - Decide próximo estado
   - Valida inputs via tools
   - Gera respostas personalizadas
   - Gerencia edge cases

3. **Tools = Ações Atômicas**
   - Cada tool faz UMA coisa
   - Retorna resultado estruturado
   - Handler executa sem lógica adicional

### Arquitetura

```
┌─────────────────┐
│   WhatsApp      │
│   Webhook       │
└────────┬────────┘
         │ mensagem
         ▼
┌─────────────────┐
│    Handler      │  ← 117 linhas (orquestração)
│  (Orquestrador) │
└────────┬────────┘
         │ contexto + mensagem
         ▼
┌─────────────────┐
│    Gemini       │  ← Decide tudo
│   (Cérebro)     │
└────────┬────────┘
         │ tool_calls[]
         ▼
┌─────────────────┐
│     Tools       │  ← Ações atômicas
│  (Executores)   │
└─────────────────┘
```

## Implementation

### Handler Mínimo (Padrão)

```typescript
// webhook-whatsapp-onboarding-v2/index.ts (117 linhas)
Deno.serve(async (req) => {
  const { message, userId, metadata } = await parseRequest(req);

  // 1. Construir contexto
  const context = buildContext(metadata, message);

  // 2. Chamar Gemini (ele decide TUDO)
  const result = await geminiChatHandler({
    systemPrompt: ONBOARDING_SYSTEM_PROMPT,
    userMessage: message,
    context,
    tools: ONBOARDING_TOOLS,
  });

  // 3. Executar tool calls (sem lógica adicional)
  for (const toolCall of result.toolCalls) {
    await executeToolCall(toolCall, userId);
  }

  // 4. Enviar resposta (Gemini já formatou)
  await sendWhatsAppMessage(userId, result.response);

  return new Response(JSON.stringify({ success: true }));
});
```

### System Prompt (Controle do Fluxo)

```typescript
const ONBOARDING_SYSTEM_PROMPT = `
Você é o assistente de onboarding do Life Track Growth.

## Fluxo de Estados
1. WELCOME → Apresentação
2. ASK_NAME → Coletar nome
3. ASK_HABIT → Coletar primeiro hábito
4. CONFIRM_HABIT → Confirmar hábito
5. ASK_REMINDER → Configurar lembrete
6. COMPLETE → Finalizar

## Regras
- Use get_user_state para saber estado atual
- Use update_user_state para transições
- Use create_habit quando usuário confirmar
- Responda SEMPRE em português casual
`;
```

### Tools Atômicas

```typescript
const ONBOARDING_TOOLS = [
  {
    name: "get_user_state",
    description: "Obtém estado atual do onboarding",
    parameters: { userId: "string" },
  },
  {
    name: "update_user_state",
    description: "Atualiza estado do onboarding",
    parameters: { userId: "string", newState: "string", metadata: "object" },
  },
  {
    name: "create_habit",
    description: "Cria hábito para o usuário",
    parameters: { userId: "string", habitName: "string", frequency: "string" },
  },
  {
    name: "set_reminder",
    description: "Configura lembrete do hábito",
    parameters: { userId: "string", habitId: "string", time: "string" },
  },
];
```

## Consequences

### Positivos

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| LOC Handler | 638 | 117 | **-82%** |
| Condicionais | 15+ | 2 | **-87%** |
| Novos Estados | 2-4h | 15min | **-90%** |
| Debugging | Difícil | Logs Gemini | Simplificado |

1. **Manutenibilidade**: Handler trivial de entender
2. **Extensibilidade**: Novo estado = editar prompt, não código
3. **Flexibilidade**: Gemini adapta respostas ao contexto
4. **Testabilidade**: Tools isoladas, fáceis de testar

### Negativos

1. **Dependência Gemini**: Fluxo quebra se API indisponível
   - Mitigação: Fallback para respostas estáticas

2. **Debugging Diferente**: Lógica em prompt, não código
   - Mitigação: Logs detalhados de tool calls

3. **Custo API**: Mais chamadas Gemini
   - Mitigação: Context caching (75-90% economia)

4. **Latência**: Roundtrip Gemini adiciona ~500ms
   - Mitigação: Aceitável para chat assíncrono

## Evidence

### feat-onboarding-2-0 (v4.5.0 STABLE)

**Antes (v1.0)**:
- 638 linhas handler
- 15+ condicionais switch/case
- Lógica de validação inline
- 4h para adicionar Partner Mode

**Depois (v4.5.0)**:
- 117 linhas handler
- 2 condicionais (auth check)
- Lógica 100% em Gemini Tools
- 30min para adicionar novos fluxos

**Commits de Evidência**:
- `781773e` - v4.3.1 Partner Mode metadata-based
- `2f07f59` - v4.1.0 AI-First architecture refactoring

## Quando Usar

### Recomendado
- Fluxos conversacionais (onboarding, suporte)
- Estados dinâmicos (dependem de contexto)
- Respostas personalizadas necessárias
- Extensibilidade frequente

### Não Recomendado
- Fluxos críticos de pagamento (hardcode obrigatório)
- Operações síncronas < 100ms
- Cenários offline-first
- Compliance rígido (auditoria de código)

## Related ADRs

- ADR-018: NLP-First Habit Creation
- ADR-023: Gemini Token Limit 9000
- ADR-022: AI Context Persistence UUID

---

*Criado: 2025-11-23 | Feature: feat-onboarding-2-0 v4.5.0*
