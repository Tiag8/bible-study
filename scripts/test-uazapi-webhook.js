#!/usr/bin/env node

/**
 * Script de Teste: webhook-whatsapp-adapter
 *
 * Testa a Edge Function com payloads REAIS do UAZAPI
 *
 * Uso:
 *   node scripts/test-uazapi-webhook.js
 *
 * Pré-requisitos:
 *   - Edge Function deployada no Supabase
 *   - Variável SUPABASE_URL e SUPABASE_ANON_KEY no .env
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/webhook-whatsapp-adapter`;

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function success(msg) {
  log(colors.green, '✅', msg);
}

function error(msg) {
  log(colors.red, '❌', msg);
}

function warning(msg) {
  log(colors.yellow, '⚠️', msg);
}

function info(msg) {
  log(colors.blue, 'ℹ️', msg);
}

/**
 * Payload de teste 1: Mensagem de texto simples
 */
const TEST_1_SIMPLE_TEXT = {
  event: 'messages.upsert',
  timestamp: Math.floor(Date.now() / 1000),
  data: {
    key: {
      id: 'TEST_SIMPLE_TEXT_123ABC',
      fromMe: false,
      remoteJid: '5511999999999@s.whatsapp.net',
    },
    message: {
      conversation: 'Olá! Preciso de ajuda com meus hábitos de saúde.',
    },
    pushName: 'João Teste',
    messageTimestamp: Math.floor(Date.now() / 1000),
  },
};

/**
 * Payload de teste 2: Mensagem de texto estendida (reply)
 */
const TEST_2_EXTENDED_TEXT = {
  event: 'messages.upsert',
  timestamp: Math.floor(Date.now() / 1000),
  data: {
    key: {
      id: 'TEST_EXTENDED_456DEF',
      fromMe: false,
      remoteJid: '5511999999999@s.whatsapp.net',
    },
    message: {
      extendedTextMessage: {
        text: 'Sim, quero começar hoje! 💪',
        contextInfo: {
          stanzaId: 'ABC123',
          participant: '5511999999999@s.whatsapp.net',
        },
      },
    },
    pushName: 'João Teste',
    messageTimestamp: Math.floor(Date.now() / 1000),
  },
};

/**
 * Payload de teste 3: Imagem com legenda
 */
const TEST_3_IMAGE_WITH_CAPTION = {
  event: 'messages.upsert',
  timestamp: Math.floor(Date.now() / 1000),
  data: {
    key: {
      id: 'TEST_IMAGE_789GHI',
      fromMe: false,
      remoteJid: '5511999999999@s.whatsapp.net',
    },
    message: {
      imageMessage: {
        url: 'https://example.com/encrypted.jpg',
        mimetype: 'image/jpeg',
        caption: 'Olha minha foto de treino hoje! Como estou indo?',
        mediaKey: 'SBqPa+ZHCoVLDdbSve+7sUbh+YDHyf+XoRuuvxdXj48=',
        fileSha256: 'ABC123...',
        fileLength: '45678',
      },
    },
    pushName: 'João Teste',
    messageTimestamp: Math.floor(Date.now() / 1000),
  },
};

/**
 * Payload de teste 4: Mensagem enviada por você (fromMe = true)
 * ESPERADO: Webhook deve IGNORAR (retornar 200 mas não processar)
 */
const TEST_4_FROM_ME = {
  event: 'messages.upsert',
  timestamp: Math.floor(Date.now() / 1000),
  data: {
    key: {
      id: 'TEST_FROM_ME_ABC',
      fromMe: true, // ⚠️ fromMe = true
      remoteJid: '5511999999999@s.whatsapp.net',
    },
    message: {
      conversation: 'Esta é minha resposta automática ao usuário.',
    },
    messageTimestamp: Math.floor(Date.now() / 1000),
  },
};

/**
 * Payload de teste 5: Mensagem de grupo
 * ESPERADO: Webhook deve IGNORAR (Life Tracker não suporta grupos)
 */
const TEST_5_GROUP_MESSAGE = {
  event: 'messages.upsert',
  timestamp: Math.floor(Date.now() / 1000),
  data: {
    key: {
      id: 'TEST_GROUP_123',
      fromMe: false,
      remoteJid: '120363024567890123@g.us', // ⚠️ Grupo
    },
    message: {
      conversation: 'Mensagem enviada no grupo',
    },
    pushName: 'João Teste',
    messageTimestamp: Math.floor(Date.now() / 1000),
  },
};

/**
 * Payload de teste 6: Sticker (sem texto)
 * ESPERADO: Webhook deve IGNORAR (sem texto para processar)
 */
const TEST_6_STICKER_NO_TEXT = {
  event: 'messages.upsert',
  timestamp: Math.floor(Date.now() / 1000),
  data: {
    key: {
      id: 'TEST_STICKER_456',
      fromMe: false,
      remoteJid: '5511999999999@s.whatsapp.net',
    },
    message: {
      stickerMessage: {
        url: 'https://example.com/sticker.webp',
        mimetype: 'image/webp',
        mediaKey: 'ABC123...',
        fileSha256: 'DEF456...',
        fileLength: '12345',
      },
    },
    pushName: 'João Teste',
    messageTimestamp: Math.floor(Date.now() / 1000),
  },
};

/**
 * Payload de teste 7: Payload ANTIGO (formato errado que o código atual espera)
 * ESPERADO: Webhook deve FALHAR com 400 Bad Request
 */
const TEST_7_OLD_FORMAT_WRONG = {
  phone: '5511999999999',
  message: 'Olá! Preciso de ajuda.',
  messageId: 'OLD_FORMAT_123',
  timestamp: new Date().toISOString(),
  isGroup: false,
};

/**
 * Executar teste
 */
async function runTest(testName, payload, expectedStatus, expectedBehavior) {
  log(colors.cyan, `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  log(colors.bright, `\n🧪 TEST: ${testName}`);
  info(`Expected: ${expectedBehavior}`);
  console.log('\nPayload:', JSON.stringify(payload, null, 2));

  const startTime = Date.now();

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const elapsed = Date.now() - startTime;
    const statusOk = response.status === expectedStatus;

    let responseBody;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    console.log(`\n📊 Response:`);
    console.log(`  Status: ${response.status} ${response.statusText} ${statusOk ? '✅' : '❌'}`);
    console.log(`  Time: ${elapsed}ms`);
    console.log(`  Body:`, responseBody);

    if (statusOk) {
      success(`TEST PASSED: ${testName}`);
    } else {
      error(`TEST FAILED: ${testName}`);
      error(`Expected status ${expectedStatus}, got ${response.status}`);
    }

    return statusOk;
  } catch (err) {
    const elapsed = Date.now() - startTime;
    error(`TEST ERROR: ${testName}`);
    console.error(`  Time: ${elapsed}ms`);
    console.error(`  Error:`, err.message);
    return false;
  }
}

/**
 * Main
 */
async function main() {
  log(colors.bright, '\n╔════════════════════════════════════════════════════╗');
  log(colors.bright, '║  UAZAPI Webhook Test Suite                        ║');
  log(colors.bright, '╚════════════════════════════════════════════════════╝\n');

  info(`Webhook URL: ${WEBHOOK_URL}`);
  info(`Timestamp: ${new Date().toISOString()}\n`);

  const results = [];

  // Teste 1: Mensagem de texto simples (conversation)
  results.push(
    await runTest(
      'TEST 1: Simple Text Message (conversation)',
      TEST_1_SIMPLE_TEXT,
      200,
      'Should process and send AI Coach response'
    )
  );

  // Teste 2: Mensagem de texto estendida (extendedTextMessage)
  results.push(
    await runTest(
      'TEST 2: Extended Text Message (reply/formatting)',
      TEST_2_EXTENDED_TEXT,
      200,
      'Should extract text from extendedTextMessage.text'
    )
  );

  // Teste 3: Imagem com legenda (caption)
  results.push(
    await runTest(
      'TEST 3: Image with Caption',
      TEST_3_IMAGE_WITH_CAPTION,
      200,
      'Should extract text from imageMessage.caption'
    )
  );

  // Teste 4: Mensagem enviada por você (fromMe = true)
  results.push(
    await runTest(
      'TEST 4: Message from Me (fromMe = true)',
      TEST_4_FROM_ME,
      200,
      'Should IGNORE (return 200 but no processing)'
    )
  );

  // Teste 5: Mensagem de grupo
  results.push(
    await runTest(
      'TEST 5: Group Message (@g.us)',
      TEST_5_GROUP_MESSAGE,
      200,
      'Should IGNORE (Life Tracker does not support groups)'
    )
  );

  // Teste 6: Sticker sem texto
  results.push(
    await runTest(
      'TEST 6: Sticker (no text)',
      TEST_6_STICKER_NO_TEXT,
      200,
      'Should IGNORE (no text content to process)'
    )
  );

  // Teste 7: Payload antigo (formato errado)
  results.push(
    await runTest(
      'TEST 7: Old Payload Format (WRONG)',
      TEST_7_OLD_FORMAT_WRONG,
      400,
      'Should FAIL with 400 Bad Request (invalid structure)'
    )
  );

  // Resumo
  log(colors.cyan, `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  log(colors.bright, '\n📊 TEST SUMMARY');
  log(colors.cyan, `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const totalTests = results.length;
  const passedTests = results.filter((r) => r).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Tests: ${totalTests}`);
  success(`Passed: ${passedTests}`);

  if (failedTests > 0) {
    error(`Failed: ${failedTests}`);
  }

  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`\nPass Rate: ${passRate}%`);

  if (passedTests === totalTests) {
    log(colors.green, '\n✅ ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    log(colors.red, '\n❌ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

// Verificar configuração
if (!SUPABASE_URL) {
  error('VITE_SUPABASE_URL not found in .env');
  process.exit(1);
}

main().catch((err) => {
  error('Fatal error:');
  console.error(err);
  process.exit(1);
});
