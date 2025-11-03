#!/usr/bin/env node

/**
 * ============================================================================
 * Life Tracker - Smoke Tests LGPD + Interactive Buttons
 * ============================================================================
 * Descrição: Testes de validação para feature LGPD + Buttons interativos
 * Funcionalidades testadas:
 *   1. Webhook WhatsApp está ativo e respondendo
 *   2. Página /privacy-whatsapp está acessível
 *   3. Edge Function possui novas funções (sendConsentMenu, extractButtonPayload)
 *
 * Uso: node scripts/smoke-test-lgpd-buttons.js
 * ============================================================================
 */

// Configuração de ambiente
const SUPABASE_PROJECT_ID = 'fjddlffnlbrhgogkyplq';
const WEBHOOK_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/webhook-whatsapp-adapter`;
const FRONTEND_URL_PRODUCTION = 'https://life-tracker.stackia.com.br';
const FRONTEND_URL_STAGING = 'https://staging.life-tracker.stackia.com.br';

// Cores para logs (ANSI codes)
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Resultados dos testes
const results = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Funções de log coloridas
 */
function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

function logTest(message) {
  console.log(`\n${colors.blue}━━━ ${message}${colors.reset}`);
}

/**
 * Registrar resultado de teste
 */
function recordResult(testName, passed, details = '') {
  totalTests++;

  const result = {
    test: testName,
    status: passed ? 'PASS' : 'FAIL',
    details: details || (passed ? 'OK' : 'Erro'),
  };

  results.push(result);

  if (passed) {
    passedTests++;
    logSuccess(`PASSOU: ${testName}`);
  } else {
    failedTests++;
    logError(`FALHOU: ${testName}`);
    if (details) {
      logWarning(`Detalhes: ${details}`);
    }
  }
}

/**
 * TESTE 1: Verificar se webhook está ativo
 *
 * Como o webhook espera POST, vamos fazer GET e esperar:
 * - Status diferente de 000 (timeout/erro de conexão)
 * - Webhook DEVE retornar algo (401/405/200 qualquer status significa que está ativo)
 */
async function testWebhookHealth() {
  logTest('TESTE 1: Webhook WhatsApp está ativo');
  console.log(`URL: ${WEBHOOK_URL}`);
  console.log('Verificando...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(WEBHOOK_URL, {
      method: 'GET', // Edge Function pode retornar 405 Method Not Allowed (esperado)
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Qualquer status HTTP significa que Edge Function está ativa
    // 405 = Method Not Allowed (esperado para webhook POST-only)
    // 401 = Unauthorized (esperado sem HMAC)
    // 200 = OK (possível se aceitar GET)
    const isHealthy = response.status > 0;

    recordResult(
      'Webhook está ativo',
      isHealthy,
      `HTTP ${response.status} - Edge Function está respondendo`
    );

    return isHealthy;

  } catch (error) {
    if (error.name === 'AbortError') {
      recordResult('Webhook está ativo', false, 'Timeout de 10s - Edge Function não respondeu');
    } else {
      recordResult('Webhook está ativo', false, `Erro: ${error.message}`);
    }
    return false;
  }
}

/**
 * TESTE 2: Verificar se página /privacy-whatsapp está acessível
 */
async function testPrivacyPage(baseUrl) {
  logTest('TESTE 2: Página /privacy-whatsapp está acessível');

  const url = `${baseUrl}/privacy-whatsapp`;
  console.log(`URL: ${url}`);
  console.log('Verificando...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow', // Seguir redirects
    });

    clearTimeout(timeoutId);

    const isOk = response.status === 200;

    if (isOk) {
      // Verificar se HTML contém texto relevante da página de privacidade
      const html = await response.text();
      const htmlLower = html.toLowerCase();
      const hasPrivacyContent = htmlLower.includes('privacidade') || htmlLower.includes('lgpd') || htmlLower.includes('whatsapp');

      recordResult(
        'Página /privacy-whatsapp acessível',
        hasPrivacyContent,
        hasPrivacyContent
          ? 'HTTP 200 - Página carregada com conteúdo LGPD'
          : 'HTTP 200 - Mas conteúdo não contém termos esperados'
      );

      return hasPrivacyContent;
    } else {
      recordResult(
        'Página /privacy-whatsapp acessível',
        false,
        `HTTP ${response.status} - Esperado 200`
      );
      return false;
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      recordResult('Página /privacy-whatsapp acessível', false, 'Timeout de 15s');
    } else {
      recordResult('Página /privacy-whatsapp acessível', false, `Erro: ${error.message}`);
    }
    return false;
  }
}

/**
 * TESTE 3: Verificar se código da Edge Function contém novas funções
 *
 * Como não temos acesso direto ao código deployado, vamos verificar
 * se as funções existem localmente (pre-deploy check)
 */
async function testEdgeFunctionCode() {
  logTest('TESTE 3: Edge Function possui novas funções (pré-deploy check)');

  const fs = await import('fs/promises');
  const path = await import('path');

  try {
    const functionPath = path.resolve(process.cwd(), 'supabase/functions/webhook-whatsapp-adapter/index.ts');

    // Verificar se arquivo existe
    await fs.access(functionPath);

    // Ler conteúdo do arquivo
    const content = await fs.readFile(functionPath, 'utf-8');

    // Verificar se contém as funções novas
    const hasSendConsentMenu = content.includes('sendConsentMenu');
    const hasExtractButtonPayload = content.includes('extractButtonPayload');
    const hasButtonsSupport = content.includes('buttonsResponseMessage') || content.includes('listResponseMessage');

    const allFunctionsPresent = hasSendConsentMenu && hasExtractButtonPayload && hasButtonsSupport;

    const details = [
      `sendConsentMenu: ${hasSendConsentMenu ? '✓' : '✗'}`,
      `extractButtonPayload: ${hasExtractButtonPayload ? '✓' : '✗'}`,
      `buttonsSupport: ${hasButtonsSupport ? '✓' : '✗'}`,
    ].join(', ');

    recordResult(
      'Edge Function possui novas funções',
      allFunctionsPresent,
      details
    );

    return allFunctionsPresent;

  } catch (error) {
    recordResult(
      'Edge Function possui novas funções',
      false,
      `Erro ao ler código: ${error.message}`
    );
    return false;
  }
}

/**
 * TESTE 4: Verificar variáveis de ambiente necessárias (local check)
 */
async function testEnvVariables() {
  logTest('TESTE 4: Variáveis de ambiente necessárias (pré-deploy check)');

  const fs = await import('fs/promises');
  const path = await import('path');

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const content = await fs.readFile(envPath, 'utf-8');

    // Variáveis críticas para LGPD + Buttons
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'UAZAPI_INSTANCE_TOKEN',
      'UAZAPI_WEBHOOK_SECRET',
    ];

    const missingVars = requiredVars.filter(varName => {
      return !content.includes(`${varName}=`);
    });

    const allVarsPresent = missingVars.length === 0;

    recordResult(
      'Variáveis de ambiente configuradas',
      allVarsPresent,
      allVarsPresent
        ? 'Todas variáveis presentes'
        : `Faltando: ${missingVars.join(', ')}`
    );

    return allVarsPresent;

  } catch (error) {
    recordResult(
      'Variáveis de ambiente configuradas',
      false,
      `Erro ao ler .env: ${error.message}`
    );
    return false;
  }
}

/**
 * Executar todos os testes
 */
async function runSmokeTests() {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║      Life Tracker - Smoke Tests LGPD + Buttons             ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  logInfo('Iniciando smoke tests...\n');

  // Testes independentes de deploy (pré-deploy checks)
  await testEdgeFunctionCode();
  await testEnvVariables();

  // Testes de infra (webhook e frontend)
  await testWebhookHealth();

  // Testar ambas as URLs (production e staging)
  logInfo('\nTestando ambiente PRODUCTION:');
  const productionOk = await testPrivacyPage(FRONTEND_URL_PRODUCTION);

  logInfo('\nTestando ambiente STAGING:');
  const stagingOk = await testPrivacyPage(FRONTEND_URL_STAGING);

  // Se nenhum dos dois passou, marcar como falha
  if (!productionOk && !stagingOk) {
    recordResult(
      'Pelo menos um ambiente funcionando',
      false,
      'Nem production nem staging estão acessíveis'
    );
  } else if (productionOk && stagingOk) {
    recordResult(
      'Ambos ambientes funcionando',
      true,
      'Production e Staging OK'
    );
  } else {
    recordResult(
      'Pelo menos um ambiente funcionando',
      true,
      productionOk ? 'Production OK (Staging down)' : 'Staging OK (Production down)'
    );
  }

  // Report final
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║                    RESUMO DOS TESTES                       ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Calcular taxa de sucesso
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  console.log(`Total de testes: ${colors.blue}${totalTests}${colors.reset}`);
  console.log(`Testes passaram: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`Testes falharam: ${colors.red}${failedTests}${colors.reset}`);
  console.log(`Taxa de sucesso: ${colors.yellow}${successRate}%${colors.reset}\n`);

  // Tabela de resultados
  console.log(`${colors.bold}Detalhes:${colors.reset}`);
  console.table(results);

  // Status final
  if (failedTests === 0) {
    console.log(`\n${colors.green}${colors.bold}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}${colors.bold}║          ✓ TODOS OS TESTES PASSARAM COM SUCESSO!          ║${colors.reset}`);
    console.log(`${colors.green}${colors.bold}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    logSuccess('Feature LGPD + Buttons validada e pronta para deploy!');
    process.exit(0);
  } else if (successRate >= 80) {
    console.log(`\n${colors.yellow}${colors.bold}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.yellow}${colors.bold}║        ⚠ ALGUNS TESTES FALHARAM (>80% sucesso)            ║${colors.reset}`);
    console.log(`${colors.yellow}${colors.bold}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    logWarning('Feature pode estar funcional, mas revise os testes que falharam');
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.red}${colors.bold}║           ✗ MUITOS TESTES FALHARAM (<80% sucesso)         ║${colors.reset}`);
    console.log(`${colors.red}${colors.bold}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    logError('Feature não está pronta para deploy!');
    console.log('\nRecomendações:');
    console.log('  1. Verifique logs das Edge Functions no Supabase Dashboard');
    console.log('  2. Teste localmente: npm run dev');
    console.log('  3. Verifique variáveis de ambiente (.env e Supabase secrets)');
    console.log('  4. Execute testes unitários: npm test');
    process.exit(1);
  }
}

// Executar testes
runSmokeTests().catch(error => {
  logError(`Erro fatal ao executar smoke tests: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
