# Padrão: API Discovery Empírico

**Status**: Ativo
**Criado em**: 2025-11-02
**Autor**: Tiago
**Tags**: #padroes #api-integration #empirismo

---

## Contexto

Ao integrar APIs de terceiros, é comum encontrar **documentação incompleta, desatualizada ou inconsistente**. O "API Discovery Empírico" é uma estratégia sistemática para descobrir o comportamento real de uma API através de testes empíricos quando a documentação é inadequada.

Este padrão foi validado na integração UAZAPI WhatsApp, onde descobrimos que:
- Autenticação usa header `token` (não `Authorization: Bearer` como docs sugeriam)
- Payload real difere da documentação oficial
- Comportamentos críticos não documentados foram descobertos via testes

---

## Problema

**Cenários típicos**:
- Documentação oficial com exemplos incompletos
- Docs desatualizadas (API mudou, docs não)
- Comportamento real difere do especificado
- Suporte técnico lento/indisponível
- Edge cases não cobertos

**Consequências de não usar empirismo**:
- ❌ Perda de tempo seguindo docs erradas
- ❌ Frustração com erros misteriosos (401, 403, 500)
- ❌ Cargo cult programming (copiar sem entender)
- ❌ Bloqueio de desenvolvimento por falta de clareza

---

## Solução: Discovery Sistemático

### Princípios

1. **Empirismo primeiro**: Teste > Documentação > Suposição
2. **Isolamento de variáveis**: Mudar UMA coisa por vez
3. **Documentação interna**: Registrar learnings imediatamente
4. **Tests automatizados**: Validações viram testes (previne regressão)
5. **Revisão contínua**: Desafiar suposições periodicamente

### Processo (5 etapas)

#### 1. Análise Preliminar (30 min)

**Objetivo**: Entender o que DEVERIA funcionar (segundo docs).

```bash
# Checklist rápido
- [ ] Ler docs oficiais (mesmo se ruins)
- [ ] Procurar exemplos de código (GitHub, Stack Overflow)
- [ ] Identificar parâmetros críticos (auth, headers, body)
- [ ] Mapear endpoints principais
- [ ] Notar inconsistências/gaps óbvios
```

**Saída**: Lista de hipóteses iniciais.

#### 2. Teste de Fumaça (smoke test)

**Objetivo**: Confirmar conectividade básica.

```bash
# Exemplo: UAZAPI
curl -X GET https://api.uazapi.com/health \
  -H "Accept: application/json" \
  -v  # verbose para ver headers

# Validar:
✅ Endpoint responde (200/404 é OK, timeout/DNS é ❌)
✅ Headers de resposta (Content-Type, X-RateLimit-*, etc)
✅ Formato de erro (JSON, XML, plain text?)
```

**Saída**: Confirmação de conectividade.

#### 3. Discovery de Autenticação (critical path)

**Objetivo**: Descobrir auth correto (maior fonte de erros).

```bash
# Testar todas variações comuns
# Variação 1: Bearer token padrão
curl -X POST https://api.uazapi.com/messages \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"to":"5511999999999","text":"test"}'

# Resposta: 401 Unauthorized ❌

# Variação 2: Token em header customizado
curl -X POST https://api.uazapi.com/messages \
  -H "token: TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"to":"5511999999999","text":"test"}'

# Resposta: 200 OK ✅ (DESCOBERTO!)
```

**Estratégia de Teste Sistemático**:
```python
# Pseudo-código para testar auth headers
auth_variations = [
    ('Authorization', 'Bearer TOKEN'),
    ('Authorization', 'TOKEN'),  # sem Bearer
    ('token', 'TOKEN'),          # header customizado
    ('api-key', 'TOKEN'),
    ('x-api-key', 'TOKEN'),
]

for header_name, header_value in auth_variations:
    response = test_api_call(headers={header_name: header_value})
    if response.status_code == 200:
        print(f"✅ DESCOBERTO: {header_name}: {header_value}")
        break
    else:
        print(f"❌ Falhou: {header_name} → {response.status_code}")
```

**Saída**: Auth correto confirmado.

#### 4. Validação de Payload (estrutura de dados)

**Objetivo**: Descobrir formato real de request/response.

```bash
# Testar payload mínimo (apenas campos obrigatórios)
curl -X POST https://api.uazapi.com/messages \
  -H "token: TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"5511999999999","text":"hello"}'

# Resposta: 200 OK ✅

# Adicionar campos opcionais (um por vez)
curl -X POST https://api.uazapi.com/messages \
  -H "token: TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "text": "hello",
    "from": "5511888888888"  # ← adicionar FROM
  }'

# Resposta: 400 Bad Request (campo FROM não suportado) ❌
```

**Estratégia de Isolamento**:
1. Começar com payload mínimo (apenas obrigatórios)
2. Adicionar UM campo opcional por vez
3. Se falhar, remover e tentar próximo
4. Documentar quais funcionam/não funcionam

**Saída**: Schema real do payload (não o da doc).

#### 5. Documentação & Testes Automatizados

**Objetivo**: Preservar learnings para futuro.

```typescript
// tests/api-discovery/uazapi-auth.test.ts

describe('UAZAPI Auth Discovery', () => {
  it('deve usar header "token" (não Authorization Bearer)', async () => {
    // ✅ CORRETO: Header customizado "token"
    const response = await fetch('https://api.uazapi.com/messages', {
      method: 'POST',
      headers: {
        'token': process.env.UAZAPI_TOKEN!,  // ← header descoberto
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '5511999999999',
        text: 'test',
      }),
    });

    expect(response.status).toBe(200);
  });

  it('NÃO deve aceitar Authorization Bearer', async () => {
    // ❌ INCORRETO: Padrão Bearer NÃO funciona
    const response = await fetch('https://api.uazapi.com/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UAZAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '5511999999999',
        text: 'test',
      }),
    });

    // Documenta comportamento descoberto
    expect(response.status).toBe(401);
  });
});
```

**Saída**: Tests que validam learnings (evita regressão).

---

## Exemplo Real: UAZAPI WhatsApp

### Problema Encontrado

Documentação UAZAPI não especificava claramente formato de autenticação. Tentamos padrão OAuth2 (Bearer token) sem sucesso.

### Discovery Aplicado

```bash
# 1. Análise Preliminar
# Docs mencionam "token", mas não formato exato
# Exemplos incompletos (faltam headers)

# 2. Smoke Test
curl -X GET https://stackia.uazapi.com/health
# ✅ Servidor responde (API ativa)

# 3. Discovery de Auth
# Tentativa 1: Bearer padrão
curl -X POST https://stackia.uazapi.com/send/text \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"number":"5562992451477","text":"test"}'
# ❌ 401 Unauthorized

# Tentativa 2: Token em header customizado
curl -X POST https://stackia.uazapi.com/send/text \
  -H "token: eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"number":"5562992451477","text":"test"}'
# ✅ 200 OK - DESCOBERTO!

# 4. Validação de Payload
# Testar campo "number" vs "to"
curl -X POST https://stackia.uazapi.com/send/text \
  -H "token: eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"to":"5562992451477","text":"test"}'
# ❌ 400 Bad Request (campo é "number", não "to")

curl -X POST https://stackia.uazapi.com/send/text \
  -H "token: eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"number":"5562992451477","text":"test"}'
# ✅ 200 OK - Campo correto é "number"
```

### Documentação Produzida

```typescript
// supabase/functions/webhook-whatsapp-adapter/index.ts

/**
 * Envia mensagem via UAZAPI
 *
 * ⚠️ DESCOBERTO EMPIRICAMENTE:
 * - Auth usa header "token" (não "Authorization: Bearer")
 * - Payload usa "number" (não "to")
 * - Phone deve estar sem + (apenas dígitos)
 *
 * @see docs/integracao/uazapi/auth-discovery.md
 */
async function sendUAZAPIMessage(phone: string, text: string): Promise<void> {
  const cleanPhone = phone.replace(/^\+/, '');

  // ✅ CORRETO: Token em header "token" (descoberto empiricamente)
  const response = await fetch(`${UAZAPI_SERVER_URL}/send/text`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'token': UAZAPI_INSTANCE_TOKEN,  // ← Header descoberto
    },
    body: JSON.stringify({
      number: cleanPhone,  // ← Campo descoberto
      text: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`UAZAPI send failed: ${response.status}`);
  }
}
```

---

## Quando Usar

✅ **Use API Discovery quando**:
- Documentação oficial é incompleta/desatualizada
- Erros 401/403/500 sem explicação clara
- Suporte técnico lento/indisponível
- Deadline curto (não pode esperar docs melhorarem)
- API crítica para MVP (bloqueio inaceitável)

❌ **NÃO use quando**:
- Documentação é clara e atualizada (confie nela primeiro)
- API tem sandbox/staging para testes (use-o)
- Suporte técnico é responsivo (pergunte primeiro)
- API tem exemplos funcionais (valide e use)
- Discovery pode violar ToS (ex: rate limiting de teste)

---

## Benefícios

- ✅ **Desbloqueio rápido**: Descobre solução em 1-4h (vs dias esperando suporte)
- ✅ **Documentação precisa**: Registra comportamento REAL (não o documentado)
- ✅ **Testes de regressão**: Learnings viram tests (evita quebrar no futuro)
- ✅ **Confiança técnica**: Entende API profundamente (não cargo cult)
- ✅ **Escalabilidade**: Padrão reproduzível para outras APIs

---

## Anti-Padrões (Evitar)

### ❌ Cargo Cult Programming

```typescript
// ❌ RUIM: Copiar código sem entender
// (encontrado no Stack Overflow, não funciona na sua API)
fetch(url, {
  headers: { 'Authorization': 'Bearer ' + token }  // ← não testado
});
```

### ❌ Trial & Error sem Sistema

```typescript
// ❌ RUIM: Testar aleatoriamente sem documentar
// Tentou 10 coisas, funcionou, mas não sabe por quê
// Resultado: código frágil, regressão futura
```

### ❌ Ignorar Documentação Completamente

```typescript
// ❌ RUIM: Empirismo SEM ler docs primeiro
// Desperdiça tempo descobrindo coisas que estavam documentadas
```

---

## Ferramentas Úteis

1. **curl** - CLI para testes rápidos
2. **Postman/Insomnia** - UI para visualizar requests/responses
3. **Wireshark/Charles Proxy** - Inspecionar tráfego de rede
4. **Browser DevTools** - Network tab (se API tem Web UI)
5. **Diff tools** - Comparar payloads (expected vs actual)

---

## Checklist Rápido

```bash
API Discovery Checklist:
- [ ] Ler docs oficiais (mesmo se ruins)
- [ ] Smoke test (conectividade)
- [ ] Descobrir auth (testar variações)
- [ ] Validar payload (campos obrigatórios vs opcionais)
- [ ] Documentar learnings (ADR, código, testes)
- [ ] Criar tests automatizados (previne regressão)
- [ ] Adicionar comentários no código (explicar "porquê")
```

---

## Referências

- **ADR 004**: UAZAPI WhatsApp Integration (caso real de uso)
- **Código**: `/supabase/functions/webhook-whatsapp-adapter/index.ts`
- **Testes**: `/tests/api-discovery/` (futuro)
- **Meta-learnings**: `docs/meta-learnings.md#api-discovery`

---

## Notas Finais

**API Discovery Empírico não é gambiarra** - é engenharia pragmática quando documentação falha. A chave é:
1. Ser **sistemático** (não aleatório)
2. **Documentar** learnings (não deixar tribal knowledge)
3. **Automatizar** validações (tests previnem regressão)

**Diferença crítica**:
- **Cargo cult**: Copiar sem entender → código frágil
- **Empirismo**: Testar para entender → código robusto

---

**Última atualização**: 2025-11-02
**Status**: Padrão ativo (validado em produção)
**Casos de uso**: UAZAPI WhatsApp (100% descoberto empiricamente)
