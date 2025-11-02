# Padrão: Logging Estruturado com Correlation ID

**Status**: Ativo
**Criado em**: 2025-11-02
**Autor**: Tiago
**Tags**: #padroes #logging #observability #debugging

---

## Contexto

Logs são fundamentais para debugging, monitoring e auditing. Em aplicações distribuídas (frontend + Edge Functions + banco + APIs externas), rastrear uma única requisição através de múltiplos serviços é crítico.

**Problema**: Como correlacionar logs de diferentes sistemas para rastrear um único fluxo (ex: mensagem WhatsApp → webhook → AI Coach → resposta)?

Este padrão documenta **logging estruturado com correlation ID** para rastreabilidade end-to-end.

---

## Problema

### Logs Não-Estruturados (Anti-Padrão)

```typescript
// ❌ RUIM: Logs sem contexto
console.log('Webhook received');
console.log('Processing message');
console.log('AI Coach responded');

// Resultado no Supabase Logs:
// Webhook received
// Processing message
// Webhook received  ← qual é qual?
// AI Coach responded
// Processing message
// ❌ Impossível correlacionar requests paralelos!
```

### Logs com Correlation ID (Padrão)

```typescript
// ✅ BOM: Correlation ID único por request
const correlationId = crypto.randomUUID();

console.log(`[${correlationId}] Webhook received`);
console.log(`[${correlationId}] Processing message`);
console.log(`[${correlationId}] AI Coach responded`);

// Resultado:
// [abc123] Webhook received
// [abc123] Processing message
// [abc123] AI Coach responded
// [xyz789] Webhook received  ← request diferente
// ✅ Fácil correlacionar: grep "[abc123]" logs
```

---

## Solução: Logging Estruturado (4 níveis)

### Nível 1: Correlation ID por Request

```typescript
// Edge Function handler
serve(async (req: Request) => {
  // Gerar correlation ID único
  const correlationId = crypto.randomUUID();

  console.log(`[${correlationId}] Request received: ${req.method} ${req.url}`);

  try {
    // Processar...
    const result = await processRequest(req, correlationId);

    console.log(`[${correlationId}] ✅ Request completed successfully`);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error(`[${correlationId}] ❌ Request failed:`, error);
    return new Response('Internal error', { status: 500 });
  }
});
```

### Nível 2: Propagar Correlation ID (cross-function)

```typescript
// Passar correlationId para funções internas
async function processRequest(req: Request, correlationId: string) {
  console.log(`[${correlationId}] Validating webhook...`);
  const isValid = await validateWebhook(req, correlationId);

  console.log(`[${correlationId}] Calling AI Coach...`);
  const response = await callAICoach(payload, correlationId);

  return response;
}

async function validateWebhook(req: Request, correlationId: string) {
  console.log(`[${correlationId}] Extracting signature...`);
  const signature = req.headers.get('X-Signature');

  console.log(`[${correlationId}] Computing HMAC...`);
  const isValid = verifyHMAC(signature, payload);

  console.log(`[${correlationId}] Signature validated: ${isValid}`);
  return isValid;
}
```

### Nível 3: Logging Estruturado (JSON)

```typescript
// Helper para logs estruturados
interface LogContext {
  correlationId: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  phase: string;
  message: string;
  metadata?: Record<string, any>;
}

function structuredLog(ctx: LogContext) {
  const log = {
    timestamp: new Date().toISOString(),
    ...ctx,
  };

  switch (ctx.level) {
    case 'INFO':
      console.log(JSON.stringify(log));
      break;
    case 'WARN':
      console.warn(JSON.stringify(log));
      break;
    case 'ERROR':
      console.error(JSON.stringify(log));
      break;
  }
}

// Uso
serve(async (req: Request) => {
  const correlationId = crypto.randomUUID();

  structuredLog({
    correlationId,
    level: 'INFO',
    phase: 'INIT',
    message: 'Webhook received',
    metadata: {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers),
    },
  });

  try {
    // Processar...
    structuredLog({
      correlationId,
      level: 'INFO',
      phase: 'VALIDATION',
      message: 'Signature validated',
    });

    structuredLog({
      correlationId,
      level: 'INFO',
      phase: 'COMPLETE',
      message: 'Request completed successfully',
      metadata: {
        elapsed: Date.now() - startTime,
      },
    });
  } catch (error) {
    structuredLog({
      correlationId,
      level: 'ERROR',
      phase: 'ERROR',
      message: 'Request failed',
      metadata: {
        error: error.message,
        stack: error.stack,
      },
    });
  }
});
```

### Nível 4: Logging Sem Dados Sensíveis

```typescript
// ❌ RUIM: Logar dados sensíveis (LGPD/GDPR violation)
console.log(`[${correlationId}] Message: "${message}"`);  // ← conteúdo sensível!
console.log(`[${correlationId}] User phone: ${phone}`);   // ← PII!

// ✅ BOM: Logar apenas metadados (não conteúdo)
console.log(`[${correlationId}] Message received (${message.length} chars)`);
console.log(`[${correlationId}] User authenticated (phone hash: ${hashPhone(phone)})`);
```

---

## Exemplo Real: Life Tracker Webhook

### Handler Completo

```typescript
// supabase/functions/webhook-whatsapp-adapter/index.ts

serve(async (req: Request) => {
  const startTime = Date.now();
  const correlationId = crypto.randomUUID();

  // Cachear dados extraídos para error handling
  let extractedData: ExtractedMessageData | null = null;

  console.log(`[${correlationId}] Webhook received - Method: ${req.method}`);

  try {
    // FASE 1: Validação HMAC
    console.log(`[${correlationId}] PHASE 1: Validating webhook signature...`);
    const { isValid, payload } = await validateWebhook(req);

    if (!isValid) {
      console.warn(`[${correlationId}] SECURITY: Invalid webhook signature - REJECTED`);
      return new Response('Unauthorized', { status: 401 });
    }
    console.log(`[${correlationId}] PHASE 1: Signature validated ✓`);

    // FASE 2: Parse do Payload
    console.log(`[${correlationId}] PHASE 2: Processing UAZAPI payload...`);

    // DEBUG: Logar payload completo (apenas em modo debug)
    if (Deno.env.get('DEBUG') === 'true') {
      console.log(`[${correlationId}] DEBUG: Raw payload:`, JSON.stringify(payload, null, 2));
    }

    extractedData = extractMessageData(payload);

    if (!extractedData) {
      console.warn(`[${correlationId}] VALIDATION: Could not extract message data (audio/sticker/unsupported type)`);
      return new Response('OK', { status: 200 });
    }

    const { phone, message, messageId, fromMe, isGroup, pushName } = extractedData;

    // FILTRO: Ignorar mensagens enviadas por nós
    if (fromMe) {
      console.log(`[${correlationId}] IGNORED: Message sent by us (fromMe: true)`);
      return new Response('OK', { status: 200 });
    }

    // FILTRO: Ignorar grupos
    if (isGroup) {
      console.log(`[${correlationId}] IGNORED: Group message not supported`);
      return new Response('OK', { status: 200 });
    }

    // Log de dados (sem conteúdo sensível)
    console.log(`[${correlationId}] PHASE 2: Payload parsed - Phone: ${phone}, User: ${pushName || 'N/A'}, MessageId: ${messageId}, Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // FASE 3: Autenticação
    console.log(`[${correlationId}] PHASE 3: Authenticating user from phone...`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { userId, conversationId, isNewUser } = await getOrCreateUserFromPhone(supabase, phone);
    console.log(`[${correlationId}] PHASE 3: User authenticated - UserId: ${userId}, ConversationId: ${conversationId}, NewUser: ${isNewUser}`);

    // FASE 4: Verificação LGPD
    console.log(`[${correlationId}] PHASE 4: Checking LGPD consent...`);
    const hasConsent = await hasWhatsAppConsent(supabase, userId);

    if (!hasConsent) {
      console.log(`[${correlationId}] PHASE 4: No consent - sending consent request...`);
      await sendUAZAPIMessage(phone, CONSENT_MESSAGE);

      const elapsed = Date.now() - startTime;
      console.log(`[${correlationId}] Webhook completed (consent flow) in ${elapsed}ms`);

      return new Response(
        JSON.stringify({ status: 'consent_flow', elapsed }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${correlationId}] PHASE 4: Consent verified ✓`);

    // FASE 5: Rate Limiting
    console.log(`[${correlationId}] PHASE 5: Checking rate limit...`);
    const canSend = await checkRateLimit(supabase, userId);

    if (!canSend) {
      console.warn(`[${correlationId}] RATE_LIMIT: User ${userId} exceeded ${RATE_LIMIT_MSGS_PER_HOUR} messages/hour limit`);

      return new Response(
        JSON.stringify({ status: 'rate_limited' }),
        { status: 429 }
      );
    }

    console.log(`[${correlationId}] PHASE 5: Rate limit OK ✓`);

    // FASE 6: Chamar AI Coach
    console.log(`[${correlationId}] PHASE 6: Calling AI Coach (max ${WEBHOOK_TIMEOUT_MS}ms)...`);

    const coachResponse = await callWithTimeout(
      callCoachChatAndBuffer(conversationId, message, correlationId),
      WEBHOOK_TIMEOUT_MS
    );

    console.log(`[${correlationId}] PHASE 6: Coach response received (${coachResponse.length} chars): "${coachResponse.substring(0, 100)}${coachResponse.length > 100 ? '...' : ''}"`);

    // FASE 7: Enviar Resposta
    console.log(`[${correlationId}] PHASE 7: Sending response via UAZAPI...`);
    await sendUAZAPIMessage(phone, coachResponse);
    console.log(`[${correlationId}] PHASE 7: Response sent ✓`);

    // FASE 8: Registrar Uso
    console.log(`[${correlationId}] PHASE 8: Registering message usage...`);
    await registerMessageSent(supabase, userId);
    console.log(`[${correlationId}] PHASE 8: Usage registered ✓`);

    const elapsed = Date.now() - startTime;
    console.log(`[${correlationId}] ✅ Webhook completed successfully in ${elapsed}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        elapsed,
        messageLength: coachResponse.length,
        correlationId
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const elapsed = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[${correlationId}] ❌ ERROR after ${elapsed}ms:`, errorMessage);
    console.error(`[${correlationId}] Error stack:`, error instanceof Error ? error.stack : 'N/A');

    // Tentar enviar mensagem de erro ao usuário
    if (extractedData?.phone) {
      try {
        const errorUserMessage = '😔 Desculpe, ocorreu um erro ao processar sua mensagem.\n\n' +
                                'Tente novamente em alguns minutos.';

        await sendUAZAPIMessage(extractedData.phone, errorUserMessage);
        console.log(`[${correlationId}] Error message sent to user`);
      } catch (notifyError) {
        console.error(`[${correlationId}] Failed to send error message to user:`, notifyError);
      }
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        elapsed,
        correlationId
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
```

---

## Boas Práticas

### ✅ DO

1. **Gerar correlation ID no início** (`crypto.randomUUID()`)
2. **Incluir em TODOS os logs** (`[${correlationId}]`)
3. **Propagar para sub-funções** (passar como parâmetro)
4. **Logar fases críticas** (PHASE 1, 2, 3...)
5. **Logar tempo de execução** (elapsed time)
6. **Sanitizar dados sensíveis** (não logar message content, phone)
7. **Incluir metadata útil** (messageId, userId, statusCode)
8. **Retornar correlationId na resposta** (útil para suporte)

### ❌ DON'T

1. **Logar dados sensíveis** (message content, passwords, tokens)
2. **Logar PII** (phone, email, CPF sem hash)
3. **Logs verbosos demais** (não logar cada byte processado)
4. **Logs sem contexto** ("Error" sem detalhe)
5. **Logs não-estruturados** (não misturar formatos)

---

## Query de Logs (Supabase)

### Buscar por Correlation ID

```bash
# Supabase CLI
$ supabase functions logs webhook-whatsapp-adapter | grep "[abc-123-xyz]"

# Output:
# [abc-123-xyz] Webhook received - Method: POST
# [abc-123-xyz] PHASE 1: Validating webhook signature...
# [abc-123-xyz] PHASE 1: Signature validated ✓
# [abc-123-xyz] PHASE 2: Processing UAZAPI payload...
# ...
# [abc-123-xyz] ✅ Webhook completed successfully in 2341ms
```

### Buscar Erros

```bash
# Buscar apenas ERRORs
$ supabase functions logs webhook-whatsapp-adapter | grep "❌ ERROR"

# Output:
# [xyz-789] ❌ ERROR after 1234ms: TIMEOUT
# [def-456] ❌ ERROR after 567ms: Invalid phone format
```

### Estatísticas de Performance

```bash
# Buscar tempo de execução
$ supabase functions logs webhook-whatsapp-adapter | grep "completed successfully in"

# Output:
# [abc-123] ✅ Webhook completed successfully in 2341ms
# [def-456] ✅ Webhook completed successfully in 1987ms
# [ghi-789] ✅ Webhook completed successfully in 3012ms

# Calcular média (com awk)
$ supabase functions logs webhook-whatsapp-adapter \
  | grep "completed successfully in" \
  | awk '{print $NF}' \
  | sed 's/ms//' \
  | awk '{sum+=$1; count++} END {print "Média:", sum/count, "ms"}'

# Output: Média: 2446 ms
```

---

## Benefícios

- ✅ **Rastreabilidade**: Correlacionar logs de múltiplos sistemas
- ✅ **Debugging**: Identificar problema em fluxo específico
- ✅ **Monitoring**: Calcular P95/P99 latency
- ✅ **Auditing**: Provar compliance (LGPD, GDPR)
- ✅ **Suporte**: Usuário reporta erro → correlationId → logs completos

---

## Referências

- **Código**: `/supabase/functions/webhook-whatsapp-adapter/index.ts`
- **Supabase Docs**: Edge Functions Logging
- **ADR 004**: UAZAPI Integration (logging strategy)

---

**Última atualização**: 2025-11-02
**Status**: Padrão ativo (usado em produção)
**Casos de uso**: Todos Edge Functions, especialmente webhooks públicos
