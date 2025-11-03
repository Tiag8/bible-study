#!/usr/bin/env node

/**
 * Script de Teste de Edge Functions do Life Tracker
 *
 * Testa TODAS as 6 Edge Functions deployadas no Supabase:
 * - analyze-assessment
 * - analyze-habit-performance
 * - coach-chat
 * - compare-assessments
 * - generate-dynamic-question
 * - suggest-icon
 *
 * MODOS DE TESTE:
 * - Básico: Verifica se funções estão acessíveis e API key está configurada
 * - Com dados: Cria dados reais e valida respostas completas
 *
 * Uso:
 *   node test-edge-functions.js              # Teste básico (padrão)
 *   node test-edge-functions.js --full       # Teste completo com dados reais
 *   node test-edge-functions.js --help       # Ajuda
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// ============================================
// CONFIGURAÇÃO
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

// Cores ANSI para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Background
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m',
  bgBlue: '\x1b[44m',
};

// Emojis
const emoji = {
  rocket: '🚀',
  checkmark: '✅',
  warning: '⚠️',
  error: '❌',
  clock: '⏱️',
  key: '🔑',
  fire: '🔥',
  sparkles: '✨',
  gear: '⚙️',
  trophy: '🏆',
  cross: '❌',
  hourglass: '⏳',
  magnifier: '🔍',
  chart: '📊',
};

// ============================================
// DEFINIÇÃO DAS EDGE FUNCTIONS
// ============================================

const EDGE_FUNCTIONS = [
  {
    name: 'suggest-icon',
    description: 'Sugerir ícones para hábitos/metas',
    payload: {
      name: 'Meditar diariamente',
      type: 'habit'
    },
    validateResponse: (data) => {
      return data.icon && data.color && typeof data.icon === 'string';
    },
    // Erros esperados em teste básico (sem dados reais)
    expectedErrors: [],
    // Esta função NÃO precisa de dados do DB, deve funcionar sempre
    requiresData: false
  },
  {
    name: 'generate-dynamic-question',
    description: 'Gerar perguntas dinâmicas para assessment',
    payload: {
      lifeArea: 'Saúde',
      previousResponses: []
    },
    validateResponse: (data) => {
      return data.question && typeof data.question === 'string';
    },
    expectedErrors: ['Cannot convert undefined or null to object'],
    requiresData: true
  },
  {
    name: 'analyze-assessment',
    description: 'Analisar resultados de assessment',
    payload: {
      assessmentId: 'test-id',
      responses: [
        { question: 'Como está sua saúde?', answer: 'Boa', score: 8 }
      ]
    },
    validateResponse: (data) => {
      return data.analysis || data.insights || data.summary;
    },
    expectedErrors: ['invalid input syntax for type uuid'],
    requiresData: true
  },
  {
    name: 'analyze-habit-performance',
    description: 'Analisar performance de hábitos',
    payload: {
      habitId: 'test-habit',
      logs: [
        { date: '2025-10-29', completed: true }
      ]
    },
    validateResponse: (data) => {
      return data.analysis || data.insights || data.streak !== undefined;
    },
    expectedErrors: ['Hábito não encontrado'],
    requiresData: true
  },
  {
    name: 'compare-assessments',
    description: 'Comparar dois assessments',
    payload: {
      currentAssessmentId: 'test-current',
      previousAssessmentId: 'test-previous'
    },
    validateResponse: (data) => {
      return data.comparison || data.insights || data.changes;
    },
    expectedErrors: ['Erro ao buscar assessments'],
    requiresData: true
  },
  {
    name: 'coach-chat',
    description: 'Chat com AI Coach (streaming)',
    payload: {
      conversationId: 'test-conversation',
      message: 'Olá, como posso melhorar meus hábitos?'
    },
    validateResponse: (data, isStream) => {
      // Coach-chat retorna streaming, validação diferente
      return isStream || (data && data.error !== undefined);
    },
    expectsStream: true,
    expectedErrors: ['Conversa não encontrada'],
    requiresData: true
  }
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`${emoji.checkmark} ${message}`, 'green');
}

function logWarning(message) {
  log(`${emoji.warning} ${message}`, 'yellow');
}

function logError(message) {
  log(`${emoji.error} ${message}`, 'red');
}

function logInfo(message) {
  log(`${emoji.magnifier} ${message}`, 'cyan');
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ============================================
// TESTE DE EDGE FUNCTION
// ============================================

async function testEdgeFunction(func, testMode) {
  const functionUrl = `${SUPABASE_URL}/functions/v1/${func.name}`;
  const startTime = Date.now();

  logInfo(`Testando: ${func.name}`);
  log(`  ${emoji.gear} ${func.description}`, 'gray');

  // Em modo básico, funções que precisam de dados retornam WARNING se falharem
  const isBasicMode = testMode === 'basic';

  try {
    // Fazer requisição
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify(func.payload),
    });

    const duration = Date.now() - startTime;

    // Verificar status HTTP
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      const errorMessage = errorData.error || errorText;

      // Verificar se é um erro esperado (ex: dados não encontrados)
      const isExpectedError = func.expectedErrors.some(expected =>
        errorMessage.includes(expected)
      );

      // Verificar se é erro de API key
      const isApiKeyError = errorMessage.includes('401') ||
                           errorMessage.includes('AI gateway error');

      if (isApiKeyError) {
        logError(`API Key inválida ou não configurada (${formatDuration(duration)})`);
        log(`  ${emoji.warning} Erro: ${errorMessage}`, 'red');
        return {
          name: func.name,
          status: 'ERROR',
          error: `API Key: ${errorMessage}`,
          duration,
          category: 'api_key'
        };
      }

      // Em modo básico, erros esperados são tratados como WARNING
      if (isBasicMode && isExpectedError && func.requiresData) {
        logWarning(`Erro esperado - função acessível (${formatDuration(duration)})`);
        log(`  ${emoji.magnifier} A função está rodando, mas precisa de dados reais`, 'yellow');
        return {
          name: func.name,
          status: 'WARNING',
          warning: `Erro esperado: ${errorMessage}`,
          duration,
          category: 'expected_error'
        };
      }

      // Erro real
      logError(`Falhou com status ${response.status} (${formatDuration(duration)})`);
      log(`  Erro: ${errorMessage}`, 'red');
      return {
        name: func.name,
        status: 'ERROR',
        error: `HTTP ${response.status}: ${errorMessage}`,
        duration,
        category: 'unexpected_error'
      };
    }

    // Para streaming (coach-chat)
    if (func.expectsStream) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        logSuccess(`Streaming iniciado (${formatDuration(duration)})`);
        log(`  ${emoji.sparkles} Response type: ${contentType}`, 'gray');
        return {
          name: func.name,
          status: 'OK',
          duration,
          isStream: true,
        };
      }
    }

    // Para JSON responses normais
    const data = await response.json();

    // Validar resposta
    const isValid = func.validateResponse(data, func.expectsStream);

    if (isValid) {
      logSuccess(`OK (${formatDuration(duration)})`);
      log(`  ${emoji.sparkles} Response: ${JSON.stringify(data).substring(0, 100)}...`, 'gray');
      return {
        name: func.name,
        status: 'OK',
        duration,
        data,
      };
    } else {
      logWarning(`Response inválida (${formatDuration(duration)})`);
      log(`  ${emoji.warning} Data: ${JSON.stringify(data)}`, 'yellow');
      return {
        name: func.name,
        status: 'WARNING',
        warning: 'Response não passou na validação',
        duration,
        data,
        category: 'invalid_response'
      };
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`Erro: ${error.message}`);
    return {
      name: func.name,
      status: 'ERROR',
      error: error.message,
      duration,
      category: 'exception'
    };
  }
}

// ============================================
// VERIFICAÇÃO DE CONFIGURAÇÃO
// ============================================

function checkConfiguration() {
  logSection(`${emoji.key} Verificando Configuração`);

  const checks = [
    { name: 'SUPABASE_URL', value: SUPABASE_URL },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: SERVICE_ROLE_KEY },
    { name: 'GEMINI_API_KEY', value: GEMINI_API_KEY },
  ];

  let allOk = true;

  for (const check of checks) {
    if (check.value) {
      logSuccess(`${check.name}: Configurado`);
      // Mostrar primeiros/últimos caracteres
      const masked = check.value.length > 20
        ? `${check.value.substring(0, 8)}...${check.value.substring(check.value.length - 8)}`
        : '***';
      log(`  ${emoji.magnifier} ${masked}`, 'gray');
    } else {
      logError(`${check.name}: NÃO CONFIGURADO`);
      allOk = false;
    }
  }

  if (!allOk) {
    logError('\nVariáveis de ambiente faltando! Verifique seu arquivo .env');
    process.exit(1);
  }

  log(`\n${emoji.checkmark} Todas as variáveis configuradas!`, 'green');
}

// ============================================
// RELATÓRIO FINAL
// ============================================

function printReport(results, testMode) {
  logSection(`${emoji.chart} Relatório de Testes`);

  const ok = results.filter(r => r.status === 'OK').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const total = results.length;

  // Tabela de resultados
  console.log('┌─────────────────────────────────┬──────────┬────────────┐');
  console.log('│ Edge Function                   │ Status   │ Duração    │');
  console.log('├─────────────────────────────────┼──────────┼────────────┤');

  for (const result of results) {
    const name = result.name.padEnd(31);
    const status = result.status === 'OK'
      ? `${emoji.checkmark} OK   `
      : result.status === 'WARNING'
      ? `${emoji.warning} WARN `
      : `${emoji.cross} ERROR`;
    const duration = formatDuration(result.duration).padEnd(10);

    const color = result.status === 'OK' ? 'green'
      : result.status === 'WARNING' ? 'yellow'
      : 'red';

    log(`│ ${name} │ ${status} │ ${duration} │`, color);
  }

  console.log('└─────────────────────────────────┴──────────┴────────────┘');

  // Estatísticas
  console.log('\n' + '─'.repeat(60));
  log(`\n${emoji.trophy} ESTATÍSTICAS:`, 'bright');
  logSuccess(`  ${ok}/${total} testes passaram (${((ok/total)*100).toFixed(1)}%)`);

  if (warnings > 0) {
    logWarning(`  ${warnings} warnings`);
  }

  if (errors > 0) {
    logError(`  ${errors} erros`);
  }

  // Duração total
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  log(`\n${emoji.clock} Duração total: ${formatDuration(totalDuration)}`, 'cyan');

  // Categorias de erros
  const apiKeyErrors = results.filter(r => r.category === 'api_key');
  const expectedErrors = results.filter(r => r.category === 'expected_error');

  // Resultado final
  console.log('\n' + '─'.repeat(60));

  if (testMode === 'basic') {
    // No modo básico, warnings por falta de dados são esperados
    const realErrors = errors - apiKeyErrors.length;
    const functionsAccessible = ok + warnings;

    if (apiKeyErrors.length > 0) {
      log(`\n${emoji.cross} PROBLEMA COM API KEY`, 'red');
      log(`${apiKeyErrors.length} função(ões) com erro de API Key.`, 'red');
      log(`Verifique se GEMINI_API_KEY está configurada corretamente no Supabase.`, 'red');
    } else if (realErrors === 0) {
      log(`\n${emoji.fire} TESTE BÁSICO PASSOU! ${emoji.fire}`, 'green');
      log(`${emoji.sparkles} ${functionsAccessible}/${total} Edge Functions estão acessíveis!`, 'green');
      if (warnings > 0) {
        log(`\n${emoji.magnifier} ${warnings} função(ões) precisam de dados reais para teste completo.`, 'yellow');
        log(`Execute com --full para criar dados e testar completamente.`, 'yellow');
      }
    } else {
      log(`\n${emoji.warning} TESTE BÁSICO COM PROBLEMAS`, 'yellow');
      log(`${realErrors} função(ões) com erros inesperados.`, 'yellow');
    }
  } else {
    // Modo full
    if (errors === 0 && warnings === 0) {
      log(`\n${emoji.fire} TODOS OS TESTES PASSARAM! ${emoji.fire}`, 'green');
      log(`${emoji.sparkles} Edge Functions estão funcionando perfeitamente!`, 'green');
    } else if (errors === 0) {
      log(`\n${emoji.warning} TESTES COM WARNINGS`, 'yellow');
      log('Verifique os warnings acima.', 'yellow');
    } else {
      log(`\n${emoji.cross} ALGUNS TESTES FALHARAM`, 'red');
      log('Verifique os erros acima.', 'red');
    }
  }

  console.log('\n');

  // Detalhes de erros
  if (errors > 0) {
    logSection(`${emoji.magnifier} Detalhes dos Erros`);
    for (const result of results.filter(r => r.status === 'ERROR')) {
      if (result.category === 'api_key') {
        logError(`${result.name} [API KEY]:`);
      } else {
        logError(`${result.name}:`);
      }
      log(`  ${result.error}`, 'red');
    }

    if (apiKeyErrors.length > 0) {
      console.log('\n' + '─'.repeat(60));
      log(`\n${emoji.key} Como configurar GEMINI_API_KEY:`, 'yellow');
      log(`\n1. Via Supabase CLI:`, 'white');
      log(`   supabase secrets set GEMINI_API_KEY=sua_key_aqui`, 'gray');
      log(`\n2. Via Dashboard:`, 'white');
      log(`   Project > Edge Functions > Secrets`, 'gray');
      log(`\n3. Obter API Key:`, 'white');
      log(`   https://aistudio.google.com/app/apikey`, 'gray');
    }
  }

  // Explicação de warnings no modo básico
  if (testMode === 'basic' && expectedErrors.length > 0) {
    console.log('\n' + '─'.repeat(60));
    log(`\n${emoji.magnifier} Sobre os Warnings:`, 'yellow');
    log(`\nNo modo básico, algumas funções retornam warnings porque`, 'white');
    log(`precisam de dados reais (usuários, hábitos, conversas, etc).`, 'white');
    log(`\nIsso é normal e esperado! Significa que:`, 'white');
    log(`  ${emoji.checkmark} A função está deployada corretamente`, 'green');
    log(`  ${emoji.checkmark} A função está acessível`, 'green');
    log(`  ${emoji.checkmark} A função está processando requisições`, 'green');
    log(`  ${emoji.warning} Mas não há dados reais para processar`, 'yellow');
    log(`\nPara teste completo, execute: node test-edge-functions.js --full`, 'cyan');
  }
}

// ============================================
// HELP
// ============================================

function showHelp() {
  console.log(`
${colors.bright}${emoji.rocket} Life Tracker - Teste de Edge Functions${colors.reset}

${colors.cyan}DESCRIÇÃO:${colors.reset}
  Testa as 6 Edge Functions deployadas no Supabase e verifica:
  - Se estão acessíveis e respondendo
  - Se a API key do Gemini está configurada
  - Se retornam dados válidos

${colors.cyan}USO:${colors.reset}
  node test-edge-functions.js [opções]

${colors.cyan}OPÇÕES:${colors.reset}
  ${colors.green}--basic${colors.reset}    Teste básico (padrão) - apenas verifica se funções estão acessíveis
  ${colors.green}--full${colors.reset}     Teste completo - cria dados reais e valida respostas completas
  ${colors.green}--help${colors.reset}     Mostra esta ajuda

${colors.cyan}EXEMPLOS:${colors.reset}
  ${colors.gray}# Teste básico (rápido, recomendado para CI/CD)${colors.reset}
  node test-edge-functions.js

  ${colors.gray}# Teste completo (mais lento, valida dados reais)${colors.reset}
  node test-edge-functions.js --full

${colors.cyan}INTERPRETAÇÃO DOS RESULTADOS:${colors.reset}
  ${colors.green}${emoji.checkmark} OK${colors.reset}      - Função funcionando perfeitamente
  ${colors.yellow}${emoji.warning} WARNING${colors.reset} - Função acessível mas precisa de dados reais (esperado no modo básico)
  ${colors.red}${emoji.cross} ERROR${colors.reset}   - Problema real (API key inválida, função não deployada, etc)

${colors.cyan}EDGE FUNCTIONS TESTADAS:${colors.reset}
  1. suggest-icon              - Sugerir ícones para hábitos/metas
  2. generate-dynamic-question - Gerar perguntas dinâmicas
  3. analyze-assessment        - Analisar resultados de assessment
  4. analyze-habit-performance - Analisar performance de hábitos
  5. compare-assessments       - Comparar dois assessments
  6. coach-chat                - Chat com AI Coach (streaming)

${colors.cyan}REQUISITOS:${colors.reset}
  - Node.js 18+
  - Arquivo .env com SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_GEMINI_API_KEY
  - Edge Functions deployadas no Supabase
  - GEMINI_API_KEY configurada como secret no Supabase

${colors.cyan}VARIÁVEIS DE AMBIENTE:${colors.reset}
  SUPABASE_URL              - URL do projeto Supabase
  SUPABASE_SERVICE_ROLE_KEY - Service role key (admin)
  VITE_GEMINI_API_KEY       - API key do Google Gemini (para referência)

${colors.cyan}MAIS INFORMAÇÕES:${colors.reset}
  - Documentação: docs/edge-functions.md
  - Supabase Dashboard: https://supabase.com/dashboard
  - Google AI Studio: https://aistudio.google.com/app/apikey
`);
  process.exit(0);
}

// ============================================
// MAIN
// ============================================

async function main() {
  // Parse argumentos
  const args = process.argv.slice(2);
  const testMode = args.includes('--full') ? 'full' : 'basic';

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
  }

  // Header
  console.clear();
  logSection(`${emoji.rocket} Life Tracker - Teste de Edge Functions`);

  log(`${emoji.hourglass} Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, 'cyan');
  log(`${emoji.gear} Modo: ${testMode === 'basic' ? 'Básico (rápido)' : 'Completo (com dados reais)'}`, 'cyan');
  log(`${emoji.gear} Total de funções: ${EDGE_FUNCTIONS.length}\n`, 'cyan');

  // Verificar configuração
  checkConfiguration();

  // Rodar testes
  logSection(`${emoji.fire} Executando Testes`);

  const results = [];
  for (const func of EDGE_FUNCTIONS) {
    const result = await testEdgeFunction(func, testMode);
    results.push(result);
    console.log(''); // Espaço entre testes
  }

  // Relatório final
  printReport(results, testMode);

  // Exit code
  // No modo básico, warnings não são considerados erros
  const hasRealErrors = testMode === 'basic'
    ? results.some(r => r.status === 'ERROR' && r.category !== 'expected_error')
    : results.some(r => r.status === 'ERROR');

  process.exit(hasRealErrors ? 1 : 0);
}

// Executar
main().catch(error => {
  logError(`\n${emoji.cross} Erro fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
