# Padrão: Normalização de Telefone Brasileiro

**Status**: Ativo
**Criado em**: 2025-11-02
**Autor**: Tiago
**Tags**: #padroes #telefone #brasil #normalizacao

---

## Contexto

Telefones brasileiros passaram por **mudança histórica em 2016**: adição do **9º dígito** em números de celular. Isso criou inconsistência massiva em bases de dados (números com 8 vs 9 dígitos), quebra de integrações WhatsApp, e confusão em validações.

Este padrão documenta a normalização correta de telefones brasileiros para garantir compatibilidade com WhatsApp Business API (UAZAPI, Meta, etc).

---

## Problema

### Formato Histórico (até 2015)

Celulares brasileiros tinham **12 dígitos** (55 + DDD 2 dígitos + 8 dígitos):
```
5511999999999  ← 12 dígitos (55 = Brasil, 11 = DDD SP, 99999999 = número)
```

### Formato Atual (2016+)

Adicionado **9º dígito "9"** em celulares (agora 13 dígitos):
```
55119999999999  ← 13 dígitos (55 + 11 + 9 + 99999999)
                          ↑ 9º dígito adicionado
```

### Inconsistências Comuns

1. **Bases legadas**: Números com 8 dígitos (sem 9º)
2. **WhatsApp chatid**: Pode vir com 12 ou 13 dígitos
3. **Formatação visual**: +55 (11) 9 9999-9999 vs 5511999999999
4. **Telefones fixos**: Mantêm 8 dígitos (não adicionam 9º)

**Consequência**: Integração WhatsApp falha se número não estiver normalizado.

---

## Solução: Normalização em 4 Etapas

### Função de Normalização

```typescript
/**
 * Normaliza telefone brasileiro para formato WhatsApp (13 dígitos)
 *
 * Formato esperado: 5521999999999 (13 dígitos, sem +)
 *
 * Regras:
 * 1. Remove formatação visual (+, espaços, hífens, parênteses)
 * 2. Valida código do país (55)
 * 3. Adiciona 9º dígito se necessário (12 → 13 dígitos)
 * 4. Valida formato final (13 dígitos + 5º dígito = 9)
 *
 * @param input - Telefone em qualquer formato
 * @returns Telefone normalizado (13 dígitos)
 * @throws Error se formato inválido
 *
 * @example
 * normalizePhoneBR('+55 21 99999-9999')  // → '5521999999999'
 * normalizePhoneBR('5521999999999')      // → '5521999999999'
 * normalizePhoneBR('552199999999')       // → '5521999999999' (adiciona 9º)
 * normalizePhoneBR('556292451477')       // → '5562992451477' (adiciona 9º)
 */
function normalizePhoneBR(input: string): string {
  // ETAPA 1: Limpeza (remover formatação visual)
  let phone = input
    .replace(/@.*/, '')           // Remove @s.whatsapp.net (se chatid)
    .replace(/[^\d+]/g, '')       // Remove espaços, hífens, parênteses
    .replace(/^\+/, '');          // Remove + se presente

  // ETAPA 2: Validação de código do país
  if (!phone.startsWith('55')) {
    throw new Error(
      `Invalid Brazilian phone: ${input} (must start with 55)`
    );
  }

  // ETAPA 3: Adicionar 9º dígito se necessário (12 → 13 dígitos)
  if (phone.length === 12) {
    const countryCode = phone.substring(0, 2);   // "55"
    const areaCode = phone.substring(2, 4);      // DDD (ex: "21", "11")
    const number = phone.substring(4);           // 8 dígitos

    // Verificar se é celular (número começa com 6-9)
    const firstDigit = parseInt(number[0]);
    const isMobile = firstDigit >= 6 && firstDigit <= 9;

    if (isMobile) {
      // Adicionar 9º dígito
      phone = `${countryCode}${areaCode}9${number}`;
      console.log(`[normalizePhoneBR] Added 9th digit: ${input} → ${phone}`);
    } else {
      // Telefone fixo (raro em WhatsApp, mas válido)
      console.warn(`[normalizePhoneBR] Fixed line (unusual): ${phone}`);
    }
  } else if (phone.length !== 13) {
    throw new Error(
      `Invalid phone length: ${input} → ${phone} (${phone.length} digits, expected 12 or 13)`
    );
  }

  // ETAPA 4: Validação final (13 dígitos + 5º dígito = 9)
  if (phone.length === 13 && phone.charAt(4) !== '9') {
    throw new Error(
      `Invalid mobile format: ${phone} (5th digit must be 9)`
    );
  }

  console.log(`[normalizePhoneBR] ✅ Normalized: ${input} → ${phone}`);
  return phone;
}
```

---

## Casos de Uso

### Caso 1: Webhook UAZAPI (chatid → phone)

```typescript
// Payload UAZAPI
const payload = {
  message: {
    chatid: '556292451477@s.whatsapp.net',  // ← 12 dígitos (sem 9º)
    text: 'Olá!',
  },
};

// Extrair e normalizar
const phone = normalizePhoneBR(payload.message.chatid);
// → '5562992451477' (13 dígitos, 9º adicionado)
```

### Caso 2: Input do Usuário (múltiplos formatos)

```typescript
// Usuário pode digitar qualquer formato
const inputs = [
  '+55 21 99999-9999',      // Visual formatado
  '(21) 99999-9999',        // Sem código de país
  '5521999999999',          // Já normalizado
  '552199999999',           // Sem 9º dígito
];

inputs.forEach(input => {
  try {
    const normalized = normalizePhoneBR(input);
    console.log(`${input} → ${normalized}`);
  } catch (error) {
    console.error(`${input} → ERRO: ${error.message}`);
  }
});

// Output:
// +55 21 99999-9999 → 5521999999999 ✅
// (21) 99999-9999 → ERRO: must start with 55 ❌
// 5521999999999 → 5521999999999 ✅
// 552199999999 → 5521999999999 ✅ (9º adicionado)
```

### Caso 3: Validação de Telefone Fixo

```typescript
// Telefone fixo (incomum em WhatsApp, mas válido)
const fixedLine = '5521123456';  // 12 dígitos, começa com 1-5 (fixo)

const normalized = normalizePhoneBR(fixedLine);
// → '5521123456' (mantém 12 dígitos, não adiciona 9º)
// ⚠️ Warning: Fixed line (unusual)
```

---

## Regras de Validação

### Estrutura do Telefone Brasileiro

```
55  21  9  99999999
│   │   │  │
│   │   │  └─ Número (8 dígitos)
│   │   └──── 9º dígito (celular, adicionado em 2016)
│   └──────── DDD (2 dígitos: 11-99)
└──────────── Código do país (Brasil = 55)
```

### Validações Críticas

1. **Código do país = 55** (Brasil)
2. **DDD válido** (11-99, 2 dígitos)
3. **Comprimento**:
   - Celular: **13 dígitos** (55 + 2 DDD + 9 + 8 número)
   - Fixo: **12 dígitos** (55 + 2 DDD + 8 número)
4. **5º dígito = 9** (se 13 dígitos, é celular)
5. **Primeiro dígito do número**:
   - Celular: 6-9
   - Fixo: 1-5

### DDDs Válidos (principais)

```typescript
const DDDs = {
  // Região Sudeste
  11: 'São Paulo (capital)',
  21: 'Rio de Janeiro (capital)',
  31: 'Belo Horizonte',
  // Região Sul
  41: 'Curitiba',
  51: 'Porto Alegre',
  // Região Nordeste
  71: 'Salvador',
  81: 'Recife',
  85: 'Fortaleza',
  // Região Norte
  92: 'Manaus',
  // Região Centro-Oeste
  61: 'Brasília',
  62: 'Goiânia',
  // ... 67 DDDs no total (11-99)
};
```

---

## Exemplo Real: UAZAPI Integration

### Código de Produção

```typescript
// supabase/functions/webhook-whatsapp-adapter/index.ts

/**
 * Extrai e normaliza telefone do chatid UAZAPI para formato WhatsApp brasileiro
 *
 * Formato esperado: 5521999999999 (13 dígitos, sem +)
 *
 * @param chatid - ID do chat UAZAPI (ex: "556292451477@s.whatsapp.net")
 * @returns Telefone normalizado (ex: "5562992451477")
 * @throws Error se formato inválido
 */
function extractPhone(chatid: string): string {
  // 1. Limpar chatid (remover @s.whatsapp.net, espaços, +)
  let phoneNumber = chatid
    .replace(/@.*/, '')           // Remove @s.whatsapp.net
    .replace(/[^\d+]/g, '')       // Remove espaços, hífens
    .replace(/^\+/, '');          // Remove + se presente

  // 2. Validar código do país (Brasil = 55)
  if (!phoneNumber.startsWith('55')) {
    throw new Error(`Invalid Brazilian phone: ${chatid} (must start with 55)`);
  }

  // 3. Adicionar 9º dígito se celular (12 → 13 dígitos)
  if (phoneNumber.length === 12) {
    const countryCode = phoneNumber.substring(0, 2);  // "55"
    const areaCode = phoneNumber.substring(2, 4);     // DDD
    const number = phoneNumber.substring(4);          // 8 dígitos

    // Verificar se é celular (número começa com 6-9)
    const firstDigit = parseInt(number[0]);
    const isMobile = firstDigit >= 6 && firstDigit <= 9;

    if (isMobile) {
      phoneNumber = `${countryCode}${areaCode}9${number}`;
      console.log(`[extractPhone] Added 9th digit: ${chatid} → ${phoneNumber}`);
    } else {
      console.warn(`[extractPhone] Fixed line (unusual): ${phoneNumber}`);
    }
  } else if (phoneNumber.length !== 13) {
    throw new Error(
      `Invalid phone length: ${chatid} → ${phoneNumber} (${phoneNumber.length} digits, expected 12 or 13)`
    );
  }

  // 4. Validação final: 13 dígitos + 5º dígito = 9 (celular)
  if (phoneNumber.length === 13 && phoneNumber.charAt(4) !== '9') {
    throw new Error(`Invalid mobile format: ${phoneNumber} (5th digit must be 9)`);
  }

  console.log(`[extractPhone] ✅ Phone normalized: ${chatid} → ${phoneNumber}`);
  return phoneNumber;
}
```

### Casos de Teste

```typescript
// tests/phone-normalization.test.ts

describe('Phone Normalization BR', () => {
  it('deve adicionar 9º dígito (12 → 13 dígitos)', () => {
    const input = '556292451477';  // 12 dígitos (sem 9º)
    const expected = '5562992451477';  // 13 dígitos (com 9º)

    expect(normalizePhoneBR(input)).toBe(expected);
  });

  it('deve manter número já com 13 dígitos', () => {
    const input = '5562992451477';
    expect(normalizePhoneBR(input)).toBe(input);
  });

  it('deve remover formatação visual', () => {
    const input = '+55 62 9 9245-1477';
    const expected = '5562992451477';

    expect(normalizePhoneBR(input)).toBe(expected);
  });

  it('deve remover @s.whatsapp.net (chatid)', () => {
    const input = '556292451477@s.whatsapp.net';
    const expected = '5562992451477';

    expect(normalizePhoneBR(input)).toBe(expected);
  });

  it('deve rejeitar telefone não-brasileiro (sem 55)', () => {
    expect(() => normalizePhoneBR('12125551234')).toThrow(
      'must start with 55'
    );
  });

  it('deve rejeitar comprimento inválido', () => {
    expect(() => normalizePhoneBR('55119999')).toThrow(
      'Invalid phone length'
    );
  });

  it('deve validar 5º dígito = 9 (celular)', () => {
    const invalid = '5511899999999';  // 5º dígito = 8 (inválido)
    expect(() => normalizePhoneBR(invalid)).toThrow(
      '5th digit must be 9'
    );
  });

  it('deve manter telefone fixo (12 dígitos, começa com 1-5)', () => {
    const fixedLine = '55211234567';  // 12 dígitos, começa com 1 (fixo)
    expect(normalizePhoneBR(fixedLine)).toBe(fixedLine);
  });
});
```

---

## Quando Usar

✅ **Use normalização quando**:
- Integrar com WhatsApp Business API (UAZAPI, Meta, etc)
- Armazenar telefones em banco (formato único)
- Comparar telefones (unicidade)
- Validar input de usuário (formulários)
- Processar webhooks WhatsApp (chatid → phone)

❌ **NÃO normalize se**:
- Apenas exibir para usuário (manter formatação visual)
- API espera formato específico diferente (validar docs)
- Telefone internacional (não-Brasil)

---

## Benefícios

- ✅ **Consistência**: Um único formato em toda aplicação
- ✅ **WhatsApp compatibility**: Funciona com UAZAPI, Meta API
- ✅ **Histórico**: Corrige bases legadas (adiciona 9º automaticamente)
- ✅ **Validação robusta**: Detecta formatos inválidos
- ✅ **Logs claros**: Rastreabilidade de transformações

---

## Anti-Padrões (Evitar)

### ❌ Assumir 9º dígito sempre presente

```typescript
// ❌ RUIM: Quebra com telefones legados (12 dígitos)
const phone = chatid.replace(/@.*/, '');  // ← sem adicionar 9º
```

### ❌ Validação superficial

```typescript
// ❌ RUIM: Não valida 5º dígito = 9
if (phone.length === 13) {
  return phone;  // ← pode ser inválido (ex: 5511899999999)
}
```

### ❌ Múltiplos formatos no banco

```typescript
// ❌ RUIM: Armazenar telefones em formatos diferentes
// Base de dados:
// - '5511999999999'       (normalizado)
// - '+55 11 99999-9999'   (formatado)
// - '11999999999'         (sem código de país)
// → Impossível comparar/buscar
```

---

## Referências

- **ANATEL (Agência Nacional de Telecomunicações)**: Resolução 553/2010 (9º dígito)
- **WhatsApp Business API**: Phone number format
- **Código**: `/supabase/functions/webhook-whatsapp-adapter/index.ts` (extractPhone)
- **ADR 004**: UAZAPI WhatsApp Integration

---

## Notas Finais

**Histórico do 9º dígito**:
- **2012-2016**: Implementação gradual por região
- **São Paulo (DDD 11)**: Primeiro estado (2012)
- **Goiânia (DDD 62)**: Um dos últimos (2016)
- **Hoje**: 100% dos celulares têm 9º dígito

**Por que bases legadas ainda têm 12 dígitos?**:
- Cadastros antigos (pré-2016) não atualizados
- Importações de planilhas desatualizadas
- Usuários digitaram número sem 9º dígito

**Solução**: Normalização automática (adiciona 9º se ausente).

---

**Última atualização**: 2025-11-02
**Status**: Padrão ativo (usado em produção)
**Casos de uso**: UAZAPI webhook, autenticação WhatsApp, validação de input
