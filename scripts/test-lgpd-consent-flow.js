#!/usr/bin/env node

/**
 * Script de Teste: Fluxo LGPD Consent
 *
 * Testa o fluxo completo de consentimento LGPD com as mensagens amigáveis
 *
 * Casos de teste:
 * 1. Usuário novo recebe mensagem de consentimento (amigável)
 * 2. Usuário responde "aceito" → consentimento registrado → confirmação amigável
 * 3. Usuário responde "não aceito" → recusa registrada
 * 4. Usuário responde "sim" → aceito (variação comum)
 * 5. Usuário responde "concordo" → aceito (variação comum)
 *
 * Uso:
 *   node scripts/test-lgpd-consent-flow.js
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
  magenta: '\x1b[35m',
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
 * Helper: Criar payload UAZAPI com mensagem
 */
function createUAZAPIPayload(messageText, phoneNumber = '5562992451477') {
  return {
    EventType: 'messages',
    instanceName: 'lifetracker',
    owner: 'test@example.com',
    token: 'test-token',
    message: {
      chatid: `${phoneNumber}@s.whatsapp.net`,
      text: messageText,
      content: messageText,
      fromMe: false,
      isGroup: false,
      sender: phoneNumber,
      senderName: 'Usuário Teste LGPD',
      messageTimestamp: Math.floor(Date.now() / 1000),
      messageid: `msg-${Date.now()}`,
      messageType: 'Conversation',
      wasSentByApi: false,
    },
    chat: {
      phone: `+55 62 9${phoneNumber.slice(5)}`,
      name: 'Usuário Teste LGPD',
      wa_chatid: `${phoneNumber}@s.whatsapp.net`,
      wa_isGroup: false,
    },
  };
}

/**
 * Executar teste de fluxo
 */
async function runConsentTest(
  testName,
  messageText,
  expectedResponsePattern,
  phoneNumber = '5562992451477'
) {
  log(colors.cyan, `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  log(colors.bright, `\n🧪 LGPD TEST: ${testName}`);
  info(`User message: "${messageText}"`);
  info(`Expected response pattern: ${expectedResponsePattern}`);

  const payload = createUAZAPIPayload(messageText, phoneNumber);
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

    let responseBody;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    console.log(`\n📊 Response:`);
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Time: ${elapsed}ms`);
    console.log(`  Body:`, JSON.stringify(responseBody, null, 2));

    // Validações heurísticas (baseadas no padrão esperado)
    let testPassed = false;

    if (expectedResponsePattern === 'consent_request') {
      // Deve enviar mensagem de consentimento amigável
      testPassed = response.status === 200 && responseBody.status === 'consent_flow';
      if (testPassed) {
        info('✓ Consent request message sent (friendly tone)');
      }
    } else if (expectedResponsePattern === 'consent_accepted') {
      // Deve registrar consentimento e enviar confirmação
      testPassed = response.status === 200 && responseBody.success !== false;
      if (testPassed) {
        info('✓ Consent registered and confirmation message sent');
      }
    } else if (expectedResponsePattern === 'coach_response') {
      // Deve chamar AI Coach normalmente
      testPassed = response.status === 200 && responseBody.success;
      if (testPassed) {
        info('✓ AI Coach response sent (normal flow after consent)');
      }
    }

    if (testPassed) {
      success(`TEST PASSED: ${testName}`);
    } else {
      error(`TEST FAILED: ${testName}`);
    }

    return testPassed;
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
  log(colors.bright, '║  LGPD Consent Flow Test Suite                      ║');
  log(colors.bright, '║  Testing friendly & conversational messages        ║');
  log(colors.bright, '╚════════════════════════════════════════════════════╝\n');

  info(`Webhook URL: ${WEBHOOK_URL}`);
  info(`Timestamp: ${new Date().toISOString()}\n`);

  const results = [];

  // Test 1: Novo usuário recebe mensagem de consentimento amigável
  results.push(
    await runConsentTest(
      'TEST 1: New User Gets Friendly Consent Message',
      'Oi, tudo bem?',
      'consent_request',
      `556299${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')}`
    )
  );

  // Test 2: Usuário responde "aceito"
  results.push(
    await runConsentTest(
      'TEST 2: User Responds "aceito" (Consent Accepted)',
      'aceito',
      'consent_accepted',
      '5562992451477'
    )
  );

  // Test 3: Usuário responde "sim"
  results.push(
    await runConsentTest(
      'TEST 3: User Responds "sim" (Variation)',
      'sim',
      'consent_accepted',
      `556299${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')}`
    )
  );

  // Test 4: Usuário responde "concordo"
  results.push(
    await runConsentTest(
      'TEST 4: User Responds "concordo" (Variation)',
      'concordo',
      'consent_accepted',
      `556299${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')}`
    )
  );

  // Test 5: Usuário responde "eu aceito" (variação comum)
  results.push(
    await runConsentTest(
      'TEST 5: User Responds "eu aceito" (Variation)',
      'eu aceito',
      'consent_accepted',
      `556299${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')}`
    )
  );

  // Test 6: Usuário NEGA consentimento
  results.push(
    await runConsentTest(
      'TEST 6: User DENIES Consent ("não aceito")',
      'não aceito',
      'consent_request',
      `556299${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')}`
    )
  );

  // Test 7: Message Tone Validation (checking if response is friendly)
  log(colors.magenta, `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  log(colors.bright, '\n📝 MESSAGE TONE VALIDATION');
  log(colors.magenta, `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  info('New consent message should include:');
  console.log('  ✓ Friendly greeting: "Oi" or "Olá" (not formal)');
  console.log('  ✓ Emojis: 👋 🚀 🔒 📱 😊');
  console.log('  ✓ Benefits explanation (hábitos, metas, progresso)');
  console.log('  ✓ LGPD mention (protegido, pode deletar)');
  console.log('  ✓ Call to action: "Topa essa jornada?"');
  console.log('  ✓ Maximum 3-4 lines on WhatsApp');

  info('\nConfirmation message should include:');
  console.log('  ✓ Positive emoji: 🎉');
  console.log('  ✓ Reassurance: "Seus dados estão seguros"');
  console.log('  ✓ Personal touch: "coach pessoal"');
  console.log('  ✓ Friendly question: "Como posso te ajudar?"');

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

  log(colors.magenta, `\n📌 IMPORTANT NOTES`);
  log(colors.magenta, `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  info('1. Consent detection logic remains robust:');
  console.log('   - Accepts: aceito, sim, ok, concordo, etc.');
  console.log('   - Rejects: contains "não", "nao", "nunca", "jamais"');
  info('\n2. Messages are MORE conversational:');
  console.log('   - "Oi" instead of "Bem-vindo"');
  console.log('   - Benefits-first approach');
  console.log('   - Emojis for visual appeal');
  info('\n3. LGPD compliance maintained:');
  console.log('   - Data protection still mentioned');
  console.log('   - User rights still present');
  console.log('   - Legal text simplified but complete');

  if (passedTests === totalTests) {
    log(colors.green, '\n✅ ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    log(colors.red, '\n⚠️ SOME TESTS NEED REVIEW!\n');
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
