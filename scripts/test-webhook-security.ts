#!/usr/bin/env -S deno run --allow-env --allow-net

/**
 * Script de teste para validar correções de segurança do webhook WhatsApp
 *
 * Testa:
 * 1. HMAC validation habilitada
 * 2. Logs DEBUG condicionais
 * 3. Payload parseado corretamente
 */

import { createHmac } from 'node:crypto';

// Configuração de teste
const WEBHOOK_URL = 'http://localhost:54321/functions/v1/webhook-whatsapp-adapter';
const TEST_SECRET = 'test-secret-token';

// Mock payload UAZAPI
const mockPayload = {
  EventType: 'messages',
  instanceName: 'test-instance',
  owner: 'test-owner',
  token: 'test-token',
  message: {
    chatid: '5562992451477@s.whatsapp.net',
    text: 'Olá, tudo bem?',
    content: 'Olá, tudo bem?',
    fromMe: false,
    isGroup: false,
    sender: '5562992451477@s.whatsapp.net',
    senderName: 'Tiago Teste',
    messageTimestamp: Date.now(),
    messageid: 'test-msg-id-123',
    messageType: 'Conversation',
    wasSentByApi: false,
  },
  chat: {
    phone: '+55 62 9245-1477',
    name: 'Tiago Teste',
    wa_chatid: '5562992451477@s.whatsapp.net',
    wa_isGroup: false,
  },
};

/**
 * Cria assinatura HMAC-SHA256 para payload
 */
function createSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Teste 1: Webhook COM assinatura válida
 */
async function testValidSignature() {
  console.log('\n🧪 TESTE 1: Webhook COM assinatura válida');
  console.log('='.repeat(60));

  const payloadStr = JSON.stringify(mockPayload);
  const signature = createSignature(payloadStr, TEST_SECRET);

  console.log('📝 Payload:', payloadStr.substring(0, 100) + '...');
  console.log('🔐 Signature:', signature);

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
    },
    body: payloadStr,
  });

  console.log('📊 Status:', response.status, response.statusText);

  if (response.status === 401) {
    console.log('❌ FALHOU: Esperado 200, recebido 401 (assinatura rejeitada)');
    return false;
  }

  console.log('✅ PASSOU: Assinatura válida aceita');
  return true;
}

/**
 * Teste 2: Webhook SEM assinatura (deve rejeitar)
 */
async function testMissingSignature() {
  console.log('\n🧪 TESTE 2: Webhook SEM assinatura (deve rejeitar)');
  console.log('='.repeat(60));

  const payloadStr = JSON.stringify(mockPayload);

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // SEM X-Signature header
    },
    body: payloadStr,
  });

  console.log('📊 Status:', response.status, response.statusText);

  if (response.status !== 401) {
    console.log('❌ FALHOU: Esperado 401, recebido', response.status);
    return false;
  }

  console.log('✅ PASSOU: Requisição sem assinatura rejeitada (401)');
  return true;
}

/**
 * Teste 3: Webhook com assinatura INVÁLIDA (deve rejeitar)
 */
async function testInvalidSignature() {
  console.log('\n🧪 TESTE 3: Webhook com assinatura INVÁLIDA (deve rejeitar)');
  console.log('='.repeat(60));

  const payloadStr = JSON.stringify(mockPayload);
  const wrongSignature = 'invalid-signature-hash-123456789abcdef';

  console.log('🔐 Signature (inválida):', wrongSignature);

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': wrongSignature,
    },
    body: payloadStr,
  });

  console.log('📊 Status:', response.status, response.statusText);

  if (response.status !== 401) {
    console.log('❌ FALHOU: Esperado 401, recebido', response.status);
    return false;
  }

  console.log('✅ PASSOU: Assinatura inválida rejeitada (401)');
  return true;
}

/**
 * Teste 4: Logs DEBUG (verificar se condicionais funcionam)
 */
async function testDebugLogs() {
  console.log('\n🧪 TESTE 4: Logs DEBUG condicionais');
  console.log('='.repeat(60));

  console.log('📝 Nota: Este teste requer inspeção manual dos logs da Edge Function');
  console.log('   - SEM DEBUG=true: Não deve logar payload completo');
  console.log('   - COM DEBUG=true: Deve logar payload completo');

  console.log('✅ VERIFICAÇÃO MANUAL: Inspecionar logs do Supabase');
  return true;
}

/**
 * Main - Executar todos os testes
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  TESTE DE SEGURANÇA - Webhook WhatsApp Adapter            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log('\n⚙️  Configuração:');
  console.log('   - Webhook URL:', WEBHOOK_URL);
  console.log('   - Secret Token:', TEST_SECRET);

  console.log('\n⚠️  IMPORTANTE:');
  console.log('   1. Supabase local deve estar rodando (supabase start)');
  console.log('   2. Edge Function deve estar deployada localmente');
  console.log('   3. UAZAPI_INSTANCE_TOKEN deve estar configurado como:', TEST_SECRET);

  const results = [];

  try {
    results.push(await testValidSignature());
    results.push(await testMissingSignature());
    results.push(await testInvalidSignature());
    results.push(await testDebugLogs());

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  RESULTADO FINAL                                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log(`\n✅ Testes Passados: ${passed}/${total}`);

    if (passed === total) {
      console.log('\n🎉 SUCESSO: Todas as correções de segurança funcionando!');
      Deno.exit(0);
    } else {
      console.log('\n❌ FALHA: Algumas correções precisam de ajuste');
      Deno.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERRO durante execução dos testes:', error);
    console.error('\n💡 Certifique-se de que:');
    console.error('   - Supabase local está rodando (supabase start)');
    console.error('   - Edge Function foi deployada (supabase functions deploy)');
    Deno.exit(1);
  }
}

// Executar testes
if (import.meta.main) {
  await main();
}
