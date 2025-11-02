# Padrão: RLS para Webhooks Públicos

**Status**: Ativo
**Criado em**: 2025-11-02
**Autor**: Tiago
**Tags**: #padroes #rls #seguranca #webhooks #supabase

---

## Contexto

**Row Level Security (RLS)** é feature crítica do PostgreSQL/Supabase para garantir que usuários vejam apenas seus próprios dados. RLS funciona perfeitamente para **aplicações web tradicionais** (frontend → API com JWT).

**Problema**: Webhooks públicos (ex: UAZAPI WhatsApp) **não têm JWT de usuário** - são chamadas externas sem autenticação Supabase. Como garantir ownership sem quebrar RLS?

Este padrão documenta **validação manual de ownership** em Edge Functions que processam webhooks públicos.

---

## Problema

### RLS Tradicional (Web App)

```sql
-- Policy padrão: Usuário vê apenas seus dados
CREATE POLICY "users_select_own_data" ON lifetracker_coach_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Funciona perfeitamente quando:
-- 1. Usuário está logado (auth.uid() != NULL)
-- 2. Request tem JWT válido (Authorization: Bearer xxx)
```

**Request típico**:
```typescript
// Frontend com auth
const { data } = await supabase
  .from('lifetracker_coach_messages')
  .select('*')
  .eq('conversation_id', myConversationId);

// RLS valida automaticamente: auth.uid() = user_id ✅
```

### Webhook Público (WhatsApp)

```typescript
// Webhook UAZAPI (sem JWT!)
export async function handler(req: Request) {
  const payload = await req.json();
  const phone = extractPhone(payload.chatid);

  // ❌ PROBLEMA: Como validar ownership sem auth.uid()?
  const { userId, conversationId } = await getOrCreateUserFromPhone(phone);

  // ❌ PROBLEMA: Se usar client Supabase com JWT do usuário,
  //    precisamos gerar JWT manualmente (complexo)

  // ❌ PROBLEMA: Se usar service_role_key (bypass RLS),
  //    perdemos proteção RLS (risco de segurança)
}
```

**Dilema**:
1. **Usar service_role_key**: Bypass RLS (risco: lógica errada = vazamento de dados)
2. **Gerar JWT manualmente**: Complexo, requer secret JWT do Supabase
3. **Validar ownership manualmente**: Simples, mas precisa disciplina

---

## Solução: Validação Manual de Ownership

### Princípios

1. **Service role apenas onde necessário**: Usar apenas para operações específicas
2. **Validação explícita sempre**: NUNCA confiar em inputs externos
3. **Fail-closed**: Em caso de dúvida, rejeitar requisição
4. **Audit log**: Registrar tentativas suspeitas

### Padrão (3 camadas)

#### Camada 1: Autenticação (Phone → UserId)

```typescript
// supabase/functions/_shared/auth.ts

/**
 * Obtém ou cria usuário a partir de telefone WhatsApp
 *
 * CRÍTICO: Esta função usa service_role_key (bypass RLS).
 * NUNCA expor phone_number diretamente ao frontend.
 *
 * @param supabase - Cliente Supabase com service_role_key
 * @param phone - Telefone normalizado (ex: "5521999999999")
 * @returns { userId, conversationId, isNewUser }
 */
export async function getOrCreateUserFromPhone(
  supabase: SupabaseClient,
  phone: string
): Promise<{ userId: string; conversationId: string; isNewUser: boolean }> {
  // 1. Buscar usuário existente por telefone
  const { data: profile, error } = await supabase
    .from('lifetracker_profiles')
    .select('user_id')
    .eq('phone_number', phone)
    .single();

  let userId: string;
  let isNewUser = false;

  if (error || !profile) {
    // 2. Usuário não existe → criar novo
    console.log(`[auth] Creating new user for phone: ${phone}`);

    // 2a. Criar auth user (Supabase Auth)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: phone,
      phone_confirm: true,  // Auto-confirmar (WhatsApp já validou)
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    userId = authData.user.id;
    isNewUser = true;

    // 2b. Criar profile (via trigger ou manual)
    await supabase.from('lifetracker_profiles').insert({
      user_id: userId,
      phone_number: phone,
      whatsapp_verified: true,
    });
  } else {
    userId = profile.user_id;
  }

  // 3. Buscar ou criar conversation WhatsApp
  let { data: conversation } = await supabase
    .from('lifetracker_coach_conversations')
    .select('conversation_id')
    .eq('user_id', userId)
    .eq('channel', 'whatsapp')
    .eq('status', 'active')
    .single();

  if (!conversation) {
    // Criar nova conversation
    const { data: newConversation, error: convError } = await supabase
      .from('lifetracker_coach_conversations')
      .insert({
        user_id: userId,
        channel: 'whatsapp',
        status: 'active',
      })
      .select('conversation_id')
      .single();

    if (convError || !newConversation) {
      throw new Error(`Failed to create conversation: ${convError?.message}`);
    }

    conversation = newConversation;
  }

  return {
    userId,
    conversationId: conversation.conversation_id,
    isNewUser,
  };
}
```

#### Camada 2: Validação de Ownership (Manual)

```typescript
// supabase/functions/_shared/auth.ts

/**
 * Valida que conversationId pertence ao userId
 *
 * CRÍTICO: Validação manual de ownership (RLS bypass por service_role).
 * SEMPRE chamar antes de acessar dados sensíveis.
 *
 * @param supabase - Cliente Supabase com service_role_key
 * @param conversationId - ID da conversa
 * @param userId - ID do usuário
 * @returns true se ownership válido, throw Error se inválido
 * @throws Error se conversationId não pertence ao userId
 */
export async function ensureConversationOwnership(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('lifetracker_coach_conversations')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .single();

  if (error || !data) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }

  if (data.user_id !== userId) {
    // 🚨 CRITICAL: Tentativa de acesso não-autorizado
    console.error(`[SECURITY] Ownership violation: conversationId=${conversationId}, expectedUserId=${userId}, actualUserId=${data.user_id}`);
    throw new Error('Unauthorized: Conversation does not belong to user');
  }

  // Ownership validado ✅
  console.log(`[auth] Ownership validated: conversationId=${conversationId} → userId=${userId}`);
}
```

#### Camada 3: Uso no Webhook (Combinação)

```typescript
// supabase/functions/webhook-whatsapp-adapter/index.ts

serve(async (req: Request) => {
  try {
    // 1. Validar signature HMAC (layer 1: autenticidade do webhook)
    const { isValid, payload } = await validateWebhook(req);
    if (!isValid) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Extrair dados
    const phone = extractPhone(payload.message.chatid);
    const message = payload.message.text;

    // 3. Autenticar usuário (phone → userId)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { userId, conversationId } = await getOrCreateUserFromPhone(supabase, phone);

    // 4. CRÍTICO: Validar ownership ANTES de acessar dados sensíveis
    await ensureConversationOwnership(supabase, conversationId, userId);

    // 5. Agora é seguro acessar dados da conversation
    const { data: messages } = await supabase
      .from('lifetracker_coach_messages')
      .select('*')
      .eq('conversation_id', conversationId)  // ✅ Ownership já validado
      .order('created_at', { ascending: false })
      .limit(10);

    // 6. Processar mensagem...
    const response = await callAICoach(conversationId, message);

    // 7. Salvar resposta (ownership já validado)
    await supabase.from('lifetracker_coach_messages').insert({
      conversation_id: conversationId,
      user_id: userId,  // ✅ Validated
      sender: 'assistant',
      content: response,
    });

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal error', { status: 500 });
  }
});
```

---

## Validações Obrigatórias

### Checklist de Segurança

```typescript
/**
 * Checklist: Validações obrigatórias em webhooks públicos
 *
 * [ ] 1. Validar signature HMAC (autenticidade do webhook)
 * [ ] 2. Extrair identificador único (phone, email, userId externo)
 * [ ] 3. Mapear para userId interno (getOrCreateUser)
 * [ ] 4. Validar ownership manual (ensureOwnership)
 * [ ] 5. Acessar dados (agora seguro)
 * [ ] 6. Audit log (registrar tentativas suspeitas)
 */
```

### Exemplo: Validar antes de CADA operação crítica

```typescript
// ✅ BOM: Validação explícita
async function sendMessageToUser(conversationId: string, userId: string, text: string) {
  // 1. Validar ownership
  await ensureConversationOwnership(supabase, conversationId, userId);

  // 2. Agora é seguro inserir
  await supabase.from('lifetracker_coach_messages').insert({
    conversation_id: conversationId,
    user_id: userId,
    content: text,
  });
}

// ❌ RUIM: Sem validação (risco: userId errado = vazamento)
async function sendMessageToUser(conversationId: string, userId: string, text: string) {
  // ❌ Se userId estiver errado, mensagem vai para usuário errado!
  await supabase.from('lifetracker_coach_messages').insert({
    conversation_id: conversationId,
    user_id: userId,  // ← NÃO validado!
    content: text,
  });
}
```

---

## Exemplo Real: Life Tracker

### Estrutura de Código

```
supabase/functions/
├── _shared/
│   ├── auth.ts                    # getOrCreateUserFromPhone, ensureOwnership
│   ├── security.ts                # validateWebhook (HMAC)
│   └── lgpd.ts                    # hasConsent, recordConsent
├── webhook-whatsapp-adapter/
│   └── index.ts                   # Handler principal (combina tudo)
└── coach-chat/
    └── index.ts                   # AI Coach (usa RLS tradicional + JWT)
```

### Fluxo Completo

```typescript
// webhook-whatsapp-adapter/index.ts

serve(async (req: Request) => {
  const correlationId = crypto.randomUUID();

  try {
    // FASE 1: Validação HMAC (autenticidade)
    console.log(`[${correlationId}] PHASE 1: Validating webhook signature...`);
    const { isValid, payload } = await validateWebhook(req);
    if (!isValid) {
      return new Response('Unauthorized', { status: 401 });
    }

    // FASE 2: Extrair dados
    console.log(`[${correlationId}] PHASE 2: Processing payload...`);
    const extractedData = extractMessageData(payload);
    if (!extractedData) {
      return new Response('OK', { status: 200 });
    }
    const { phone, message } = extractedData;

    // FASE 3: Autenticação (phone → userId + conversationId)
    console.log(`[${correlationId}] PHASE 3: Authenticating user...`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { userId, conversationId } = await getOrCreateUserFromPhone(supabase, phone);

    // FASE 4: Validação de Ownership (CRÍTICO!)
    console.log(`[${correlationId}] PHASE 4: Validating ownership...`);
    await ensureConversationOwnership(supabase, conversationId, userId);

    // FASE 5: Verificar consentimento LGPD
    const hasConsent = await hasWhatsAppConsent(supabase, userId);
    if (!hasConsent) {
      // Solicitar consentimento...
      return new Response('OK', { status: 200 });
    }

    // FASE 6: Chamar AI Coach (seguro, ownership validado)
    const response = await callCoachChat(conversationId, message);

    // FASE 7: Enviar resposta via WhatsApp
    await sendUAZAPIMessage(phone, response);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error(`[${correlationId}] Error:`, error);
    return new Response('Internal error', { status: 500 });
  }
});
```

---

## Quando Usar

✅ **Use validação manual quando**:
- Webhook público (sem JWT de usuário)
- Edge Function com service_role_key (bypass RLS)
- Mapear identificador externo → userId interno
- Acessar dados sensíveis (mensagens, hábitos, metas)

❌ **NÃO precisa se**:
- Request tem JWT válido (RLS funciona automaticamente)
- Edge Function não acessa dados de usuário
- Operação é read-only pública (ex: health check)

---

## Benefícios

- ✅ **Segurança equivalente a RLS**: Validação explícita garante ownership
- ✅ **Audit trail**: Logs de tentativas não-autorizadas
- ✅ **Fail-closed**: Rejeita em caso de dúvida
- ✅ **Simples**: Não precisa gerar JWT manualmente

---

## Anti-Padrões (Evitar)

### ❌ Confiar em inputs externos

```typescript
// ❌ RUIM: Aceitar userId do payload sem validar
const { userId, conversationId } = payload;  // ← pode ser fake!

await supabase.from('lifetracker_coach_messages').insert({
  conversation_id: conversationId,  // ← NÃO validado!
  user_id: userId,                  // ← pode ser de outro usuário!
  content: 'response',
});
```

### ❌ Service role sem validação

```typescript
// ❌ RUIM: Usar service_role_key sem validar ownership
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ← Sem validação! Se conversationId for inválido, vai quebrar ou vazar dados
const { data } = await supabase
  .from('lifetracker_coach_messages')
  .select('*')
  .eq('conversation_id', conversationId);  // ← ownership não validado!
```

### ❌ Validação superficial

```typescript
// ❌ RUIM: Validar apenas existência (não ownership)
const { data } = await supabase
  .from('lifetracker_coach_conversations')
  .select('*')
  .eq('conversation_id', conversationId)
  .single();

if (!data) {
  throw new Error('Conversation not found');
}

// ← Falta validar: data.user_id === userId esperado!
```

---

## Referências

- **Supabase Docs**: Row Level Security (RLS)
- **PostgreSQL Docs**: Row Security Policies
- **Código**: `/supabase/functions/_shared/auth.ts`
- **ADR 004**: UAZAPI Integration (validação manual C2)

---

## Notas Finais

**Por que não gerar JWT manualmente?**
- Complexo (requer secret JWT do Supabase)
- Frágil (JWT pode expirar durante request)
- Desnecessário (validação manual é mais simples)

**Regra de ouro**: Service role + validação manual = segurança equivalente a RLS.

---

**Última atualização**: 2025-11-02
**Status**: Padrão ativo (usado em produção)
**Casos de uso**: Webhook WhatsApp, webhooks públicos em geral
