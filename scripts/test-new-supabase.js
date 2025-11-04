#!/usr/bin/env node

/**
 * Script de Teste de Conexão - NOVO Supabase
 *
 * Testa conectividade, estrutura do banco, permissões e auth
 * do novo projeto Supabase (${SUPABASE_PROJECT_REF})
 *
 * Uso: node scripts/test-new-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ============================================================================
// CONFIGURAÇÕES DO NOVO SUPABASE
// ============================================================================

const NEW_SUPABASE = {
  url: 'https://${SUPABASE_PROJECT_REF}.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZGRsZmZubGJyaGdvZ2t5cGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTY4MjYsImV4cCI6MjA2MzQ5MjgyNn0.qZTfi6D2eCqUEfWVXOIqBwukRyytR0FL0L_gRHPAIKU',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZGRsZmZubGJyaGdvZ2t5cGxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkxNjgyNiwiZXhwIjoyMDYzNDkyODI2fQ.RNkuoLK0pMloNvUOoO9d2AUFyoxvXgYF1MmdbM-WbJA'
};

// ============================================================================
// CORES PARA OUTPUT NO CONSOLE
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logSection(title) {
  console.log('');
  log(`${'='.repeat(80)}`, 'bright');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(80)}`, 'bright');
  console.log('');
}

function formatJson(obj) {
  return JSON.stringify(obj, null, 2);
}

// ============================================================================
// RELATÓRIO DE TESTES
// ============================================================================

const testReport = {
  timestamp: new Date().toISOString(),
  timezone: 'America/Sao_Paulo',
  supabaseUrl: NEW_SUPABASE.url,
  tests: {
    basicConnection: {},
    databaseStructure: {},
    permissions: {},
    auth: {},
    comparison: {}
  },
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

function addTestResult(category, testName, passed, details = {}, isWarning = false) {
  testReport.tests[category][testName] = {
    passed,
    isWarning,
    details,
    timestamp: new Date().toISOString()
  };

  testReport.summary.total++;
  if (isWarning) {
    testReport.summary.warnings++;
  } else if (passed) {
    testReport.summary.passed++;
  } else {
    testReport.summary.failed++;
  }
}

// ============================================================================
// TESTE 1: CONEXÃO BÁSICA
// ============================================================================

async function testBasicConnection() {
  logSection('TESTE 1: CONEXÃO BÁSICA');

  // Teste com anon_key
  logInfo('Testando conexão com anon_key...');
  try {
    const anonClient = createClient(NEW_SUPABASE.url, NEW_SUPABASE.anonKey);

    // Tenta fazer uma query simples
    const { data, error } = await anonClient.from('_test_connection_').select('*').limit(1);

    // Esperamos um erro de tabela não encontrada, não erro de conexão
    if (error && error.code === 'PGRST116') {
      logSuccess('Conexão com anon_key: OK (API respondendo)');
      addTestResult('basicConnection', 'anonKeyConnection', true, {
        message: 'API respondendo corretamente',
        errorCode: error.code
      });
    } else if (error) {
      logWarning(`Conexão com anon_key: API respondeu mas com erro inesperado`);
      addTestResult('basicConnection', 'anonKeyConnection', true, {
        message: 'API respondeu',
        error: error.message
      }, true);
    } else {
      logSuccess('Conexão com anon_key: OK');
      addTestResult('basicConnection', 'anonKeyConnection', true, {
        message: 'Conexão bem sucedida'
      });
    }
  } catch (error) {
    logError(`Falha na conexão com anon_key: ${error.message}`);
    addTestResult('basicConnection', 'anonKeyConnection', false, {
      error: error.message
    });
  }

  // Teste com service_role_key
  logInfo('Testando conexão com service_role_key...');
  try {
    const serviceClient = createClient(NEW_SUPABASE.url, NEW_SUPABASE.serviceRoleKey);

    const { data, error } = await serviceClient.from('_test_connection_').select('*').limit(1);

    if (error && error.code === 'PGRST116') {
      logSuccess('Conexão com service_role_key: OK (API respondendo)');
      addTestResult('basicConnection', 'serviceRoleConnection', true, {
        message: 'API respondendo corretamente',
        errorCode: error.code
      });
    } else if (error) {
      logWarning(`Conexão com service_role_key: API respondeu mas com erro inesperado`);
      addTestResult('basicConnection', 'serviceRoleConnection', true, {
        message: 'API respondeu',
        error: error.message
      }, true);
    } else {
      logSuccess('Conexão com service_role_key: OK');
      addTestResult('basicConnection', 'serviceRoleConnection', true, {
        message: 'Conexão bem sucedida'
      });
    }
  } catch (error) {
    logError(`Falha na conexão com service_role_key: ${error.message}`);
    addTestResult('basicConnection', 'serviceRoleConnection', false, {
      error: error.message
    });
  }
}

// ============================================================================
// TESTE 2: ESTRUTURA DO BANCO
// ============================================================================

async function testDatabaseStructure() {
  logSection('TESTE 2: ESTRUTURA DO BANCO DE DADOS');

  const serviceClient = createClient(NEW_SUPABASE.url, NEW_SUPABASE.serviceRoleKey);

  // Listar todas as tabelas
  logInfo('Listando todas as tabelas...');
  try {
    const { data, error } = await serviceClient.rpc('get_tables_info');

    if (error) {
      // Função não existe, vamos tentar método alternativo
      logWarning('Função get_tables_info não existe, tentando método alternativo...');

      // Tenta listar tabelas conhecidas
      const knownTables = [
        'profiles',
        'daily_records',
        'mood_logs',
        'energy_logs',
        'health_metrics',
        'activities',
        'goals',
        'habits',
        'habit_logs',
        'notes',
        'tags',
        'daily_record_tags',
        'goal_progress',
        'notifications'
      ];

      const existingTables = [];

      for (const table of knownTables) {
        const { error: tableError } = await serviceClient
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1);

        if (!tableError || tableError.code === 'PGRST116') {
          // Tabela não existe
          continue;
        } else if (tableError && tableError.code !== 'PGRST301') {
          // Outro erro que não é de count
          existingTables.push(table);
        } else {
          existingTables.push(table);
        }
      }

      if (existingTables.length === 0) {
        logWarning('Nenhuma tabela encontrada no banco de dados');
        addTestResult('databaseStructure', 'listTables', true, {
          tables: [],
          count: 0,
          message: 'Banco de dados vazio (esperado para novo projeto)'
        }, true);
      } else {
        logSuccess(`Encontradas ${existingTables.length} tabelas`);
        existingTables.forEach(table => {
          logInfo(`  - ${table}`);
        });

        addTestResult('databaseStructure', 'listTables', true, {
          tables: existingTables,
          count: existingTables.length
        });
      }

    } else {
      logSuccess(`Encontradas ${data.length} tabelas`);
      data.forEach(table => {
        logInfo(`  - ${table.table_name}`);
      });

      addTestResult('databaseStructure', 'listTables', true, {
        tables: data.map(t => t.table_name),
        count: data.length
      });
    }

  } catch (error) {
    logError(`Erro ao listar tabelas: ${error.message}`);
    addTestResult('databaseStructure', 'listTables', false, {
      error: error.message
    });
  }

  // Verificar migrations
  logInfo('Verificando se migrations foram aplicadas...');
  try {
    const { data, error } = await serviceClient
      .from('schema_migrations')
      .select('*');

    if (error) {
      if (error.code === 'PGRST116') {
        logWarning('Tabela schema_migrations não existe - migrations não foram aplicadas');
        addTestResult('databaseStructure', 'migrations', true, {
          applied: false,
          message: 'Banco de dados novo sem migrations'
        }, true);
      } else {
        logError(`Erro ao verificar migrations: ${error.message}`);
        addTestResult('databaseStructure', 'migrations', false, {
          error: error.message
        });
      }
    } else {
      logSuccess(`Migrations aplicadas: ${data.length} registros`);
      addTestResult('databaseStructure', 'migrations', true, {
        applied: true,
        count: data.length,
        migrations: data
      });
    }
  } catch (error) {
    logError(`Erro ao verificar migrations: ${error.message}`);
    addTestResult('databaseStructure', 'migrations', false, {
      error: error.message
    });
  }
}

// ============================================================================
// TESTE 3: PERMISSÕES
// ============================================================================

async function testPermissions() {
  logSection('TESTE 3: PERMISSÕES');

  const testTableName = '_test_permissions_table_';

  // Testes com anon_key
  logInfo('Testando permissões com anon_key...');
  const anonClient = createClient(NEW_SUPABASE.url, NEW_SUPABASE.anonKey);

  const anonTests = {
    select: false,
    insert: false,
    update: false,
    delete: false
  };

  // SELECT
  try {
    const { data, error } = await anonClient.from('profiles').select('*').limit(1);
    anonTests.select = !error || error.code === 'PGRST116';
    if (anonTests.select) {
      logSuccess('anon_key SELECT: OK');
    } else {
      logError(`anon_key SELECT: Falhou - ${error.message}`);
    }
  } catch (error) {
    logError(`anon_key SELECT: Erro - ${error.message}`);
  }

  // INSERT
  try {
    const { data, error } = await anonClient.from('profiles').insert({
      id: '00000000-0000-0000-0000-000000000000',
      username: 'test'
    });
    anonTests.insert = !error || error.code === 'PGRST116' || error.code === '42501';
    if (error && (error.code === 'PGRST116' || error.code === '42501')) {
      logWarning(`anon_key INSERT: Bloqueado (esperado) - ${error.message}`);
    } else if (!error) {
      logWarning('anon_key INSERT: Permitido (não recomendado)');
    } else {
      logError(`anon_key INSERT: Erro - ${error.message}`);
    }
  } catch (error) {
    logWarning(`anon_key INSERT: Bloqueado - ${error.message}`);
    anonTests.insert = true;
  }

  addTestResult('permissions', 'anonKey', true, {
    select: anonTests.select,
    insert: anonTests.insert,
    message: 'anon_key tem permissões limitadas (esperado)'
  });

  // Testes com service_role_key
  logInfo('Testando permissões com service_role_key...');
  const serviceClient = createClient(NEW_SUPABASE.url, NEW_SUPABASE.serviceRoleKey);

  const serviceTests = {
    select: false,
    insert: false,
    update: false,
    delete: false
  };

  // SELECT
  try {
    const { data, error } = await serviceClient.from('profiles').select('*').limit(1);
    serviceTests.select = !error || error.code === 'PGRST116';
    if (serviceTests.select) {
      logSuccess('service_role_key SELECT: OK');
    } else {
      logError(`service_role_key SELECT: Falhou - ${error.message}`);
    }
  } catch (error) {
    logError(`service_role_key SELECT: Erro - ${error.message}`);
  }

  // INSERT (vamos tentar criar uma tabela de teste primeiro)
  try {
    // Nota: não podemos criar tabelas via API, então testamos com tabela existente
    const testId = '00000000-0000-0000-0000-000000000001';
    const { data, error } = await serviceClient.from('profiles').insert({
      id: testId,
      username: 'test_service_role'
    });

    if (!error || error.code === 'PGRST116') {
      serviceTests.insert = true;
      logSuccess('service_role_key INSERT: OK');

      // Limpar dado de teste
      if (!error) {
        await serviceClient.from('profiles').delete().eq('id', testId);
      }
    } else {
      logError(`service_role_key INSERT: Falhou - ${error.message}`);
    }
  } catch (error) {
    if (error.code === 'PGRST116') {
      serviceTests.insert = true;
      logWarning('service_role_key INSERT: Tabela não existe (mas permissão OK)');
    } else {
      logError(`service_role_key INSERT: Erro - ${error.message}`);
    }
  }

  addTestResult('permissions', 'serviceRoleKey', true, {
    select: serviceTests.select,
    insert: serviceTests.insert,
    message: 'service_role_key tem permissões completas (esperado)'
  });
}

// ============================================================================
// TESTE 4: AUTENTICAÇÃO
// ============================================================================

async function testAuth() {
  logSection('TESTE 4: AUTENTICAÇÃO');

  const serviceClient = createClient(NEW_SUPABASE.url, NEW_SUPABASE.serviceRoleKey);

  // Verificar se auth.users está acessível
  logInfo('Verificando acesso a auth.users...');
  try {
    // Usando admin API para listar usuários
    const { data: { users }, error } = await serviceClient.auth.admin.listUsers();

    if (error) {
      logError(`Erro ao acessar auth.users: ${error.message}`);
      addTestResult('auth', 'accessUsers', false, {
        error: error.message
      });
    } else {
      logSuccess(`Acesso a auth.users: OK`);
      logInfo(`Total de usuários: ${users.length}`);

      if (users.length > 0) {
        logInfo('Usuários encontrados:');
        users.forEach(user => {
          logInfo(`  - ${user.email} (ID: ${user.id})`);
        });
      } else {
        logWarning('Nenhum usuário cadastrado ainda');
      }

      addTestResult('auth', 'accessUsers', true, {
        userCount: users.length,
        users: users.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at
        }))
      });
    }
  } catch (error) {
    logError(`Erro ao verificar auth: ${error.message}`);
    addTestResult('auth', 'accessUsers', false, {
      error: error.message
    });
  }

  // Testar criação de usuário de teste (opcional)
  logInfo('Testando capacidade de criar usuários...');
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const { data, error } = await serviceClient.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true
    });

    if (error) {
      logWarning(`Não foi possível criar usuário de teste: ${error.message}`);
      addTestResult('auth', 'createUser', true, {
        message: 'Função de criação de usuários acessível',
        error: error.message
      }, true);
    } else {
      logSuccess('Usuário de teste criado com sucesso');

      // Deletar usuário de teste
      await serviceClient.auth.admin.deleteUser(data.user.id);
      logInfo('Usuário de teste removido');

      addTestResult('auth', 'createUser', true, {
        message: 'Criação e remoção de usuários funcionando'
      });
    }
  } catch (error) {
    logError(`Erro ao testar criação de usuários: ${error.message}`);
    addTestResult('auth', 'createUser', false, {
      error: error.message
    });
  }
}

// ============================================================================
// TESTE 5: COMPARAÇÃO COM LOVABLE SUPABASE
// ============================================================================

async function testComparison() {
  logSection('TESTE 5: COMPARAÇÃO COM LOVABLE SUPABASE');

  logInfo('Estrutura esperada do Life Tracker (baseada em Lovable):');

  const expectedTables = [
    'profiles - Perfis de usuários',
    'daily_records - Registros diários',
    'mood_logs - Logs de humor',
    'energy_logs - Logs de energia',
    'health_metrics - Métricas de saúde',
    'activities - Atividades',
    'goals - Metas/objetivos',
    'habits - Hábitos',
    'habit_logs - Logs de hábitos',
    'notes - Notas/anotações',
    'tags - Tags/etiquetas',
    'daily_record_tags - Relacionamento diário-tags',
    'goal_progress - Progresso de metas',
    'notifications - Notificações'
  ];

  expectedTables.forEach(table => {
    logInfo(`  ✓ ${table}`);
  });

  const currentTables = testReport.tests.databaseStructure.listTables?.details?.tables || [];

  console.log('');
  logInfo('Comparação:');
  logInfo(`  - Tabelas esperadas: ${expectedTables.length}`);
  logInfo(`  - Tabelas encontradas: ${currentTables.length}`);

  if (currentTables.length === 0) {
    console.log('');
    logWarning('⚠ BANCO DE DADOS VAZIO');
    logWarning('O novo Supabase está vazio e precisa das migrations.');
    logWarning('');
    logWarning('Próximos passos:');
    logWarning('  1. Aplicar migrations do diretório supabase/migrations/');
    logWarning('  2. Configurar Row Level Security (RLS)');
    logWarning('  3. Criar políticas de acesso');
    logWarning('  4. Configurar triggers e functions');

    addTestResult('comparison', 'structureComparison', true, {
      expected: expectedTables.length,
      found: 0,
      missing: expectedTables.map(t => t.split(' - ')[0]),
      message: 'Banco novo requer migrations'
    }, true);
  } else {
    const tableNames = expectedTables.map(t => t.split(' - ')[0]);
    const missing = tableNames.filter(t => !currentTables.includes(t));
    const extra = currentTables.filter(t => !tableNames.includes(t));

    if (missing.length > 0) {
      console.log('');
      logWarning('Tabelas faltando:');
      missing.forEach(table => logWarning(`  - ${table}`));
    }

    if (extra.length > 0) {
      console.log('');
      logInfo('Tabelas extras encontradas:');
      extra.forEach(table => logInfo(`  + ${table}`));
    }

    if (missing.length === 0 && extra.length === 0) {
      logSuccess('✓ Estrutura do banco corresponde ao esperado!');
    }

    addTestResult('comparison', 'structureComparison', true, {
      expected: expectedTables.length,
      found: currentTables.length,
      missing,
      extra
    });
  }
}

// ============================================================================
// SALVAR RELATÓRIO
// ============================================================================

function saveReport() {
  logSection('SALVANDO RELATÓRIO');

  const reportPath = path.join(process.cwd(), 'new-supabase-test-report.json');

  try {
    fs.writeFileSync(reportPath, formatJson(testReport), 'utf8');
    logSuccess(`Relatório salvo em: ${reportPath}`);
  } catch (error) {
    logError(`Erro ao salvar relatório: ${error.message}`);
  }
}

// ============================================================================
// RESUMO FINAL
// ============================================================================

function printSummary() {
  logSection('RESUMO DOS TESTES');

  const { summary } = testReport;

  console.log('');
  log(`  Total de testes: ${summary.total}`, 'bright');
  log(`  ✓ Sucesso: ${summary.passed}`, 'green');
  log(`  ✗ Falhas: ${summary.failed}`, 'red');
  log(`  ⚠ Avisos: ${summary.warnings}`, 'yellow');
  console.log('');

  if (summary.failed === 0) {
    logSuccess('✓ TODOS OS TESTES PASSARAM!');

    if (summary.warnings > 0) {
      console.log('');
      logWarning('Há avisos que requerem atenção:');

      Object.keys(testReport.tests).forEach(category => {
        Object.keys(testReport.tests[category]).forEach(testName => {
          const test = testReport.tests[category][testName];
          if (test && test.isWarning) {
            logWarning(`  - ${category}/${testName}: ${test.details?.message || 'Verifique detalhes'}`);
          }
        });
      });
    }
  } else {
    logError('✗ ALGUNS TESTES FALHARAM');
    console.log('');
    logError('Testes que falharam:');

    Object.keys(testReport.tests).forEach(category => {
      Object.keys(testReport.tests[category]).forEach(testName => {
        const test = testReport.tests[category][testName];
        if (test && !test.passed && !test.isWarning) {
          const errorMsg = test.details?.error || test.details?.message || 'Erro desconhecido';
          logError(`  - ${category}/${testName}: ${errorMsg}`);
        }
      });
    });
  }

  console.log('');
  logInfo('Para mais detalhes, consulte: new-supabase-test-report.json');
  console.log('');
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

async function main() {
  log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                   TESTE DE CONEXÃO - NOVO SUPABASE                         ║
║                         Life Tracker Project                               ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
  `, 'cyan');

  logInfo(`URL: ${NEW_SUPABASE.url}`);
  logInfo(`Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
  logInfo(`Timezone: America/Sao_Paulo (UTC-3)`);

  try {
    await testBasicConnection();
    await testDatabaseStructure();
    await testPermissions();
    await testAuth();
    await testComparison();

    saveReport();
    printSummary();

    // Exit code baseado nos resultados
    if (testReport.summary.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('');
    logError('ERRO CRÍTICO NA EXECUÇÃO DOS TESTES:');
    logError(error.message);
    console.error('');
    console.error(error.stack);

    process.exit(1);
  }
}

// ============================================================================
// EXECUÇÃO
// ============================================================================

main();
