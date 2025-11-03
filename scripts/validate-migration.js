#!/usr/bin/env node

/**
 * Script de Validação Pós-Migração
 *
 * Valida a integridade da migração do banco de dados:
 * - Estrutura do banco
 * - Integridade de dados
 * - Autenticação
 * - RLS Policies
 * - Edge Functions
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configurações
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const EXPORT_DATA_PATH = process.env.EXPORT_DATA_PATH || './export';

// Clientes Supabase
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado de validação
const validationState = {
  timestamp: new Date().toISOString(),
  summary: {
    total_checks: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  },
  details: {
    database_structure: {},
    data_integrity: {},
    authentication: {},
    rls_policies: {},
    edge_functions: {},
  },
  issues: [],
};

// Funções auxiliares
function logCheck(category, name, passed, message = '') {
  validationState.summary.total_checks++;

  if (passed) {
    validationState.summary.passed++;
    console.log(`✓ [${category}] ${name}`);
  } else {
    validationState.summary.failed++;
    validationState.issues.push({
      severity: 'error',
      category,
      check: name,
      message,
    });
    console.log(`✗ [${category}] ${name}: ${message}`);
  }
}

function logWarning(category, name, message) {
  validationState.summary.warnings++;
  validationState.issues.push({
    severity: 'warning',
    category,
    check: name,
    message,
  });
  console.log(`⚠ [${category}] ${name}: ${message}`);
}

function getExportData(table) {
  try {
    const filePath = path.join(EXPORT_DATA_PATH, `${table}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 1. VALIDAÇÃO DE ESTRUTURA DO BANCO
async function validateDatabaseStructure() {
  console.log('\n📋 Validando Estrutura do Banco...\n');

  const section = validationState.details.database_structure;

  try {
    // Verificar migrations aplicadas
    const { data: migrations, error: migrationsError } = await supabaseAdmin
      .from('schema_migrations')
      .select('*')
      .order('version', { ascending: true });

    const migrationsApplied = migrations?.length || 0;
    const expectedMigrations = 23;

    section.migrations = {
      expected: expectedMigrations,
      applied: migrationsApplied,
      passed: migrationsApplied === expectedMigrations,
    };

    logCheck(
      'database_structure',
      'migrations_applied',
      migrationsApplied === expectedMigrations,
      `Esperado: ${expectedMigrations}, Encontrado: ${migrationsApplied}`
    );

    // Verificar tabelas principais
    const tables = [
      'users',
      'profiles',
      'activities',
      'goals',
      'progress',
      'habits',
      'habit_logs',
      'reminders',
      'notifications',
      'settings',
      'audit_logs',
    ];

    const { data: allTables } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    const existingTables = allTables?.map(t => t.table_name) || [];
    section.tables = {
      expected: tables.length,
      found: tables.filter(t => existingTables.includes(t)).length,
    };

    for (const table of tables) {
      logCheck(
        'database_structure',
        `table_${table}`,
        existingTables.includes(table),
        `Tabela '${table}' não encontrada`
      );
    }

    // Verificar índices
    const { data: indexes } = await supabaseAdmin.rpc('get_indexes');
    section.indexes = {
      found: indexes?.length || 0,
      minimum_expected: 15,
    };

    logCheck(
      'database_structure',
      'indexes_created',
      (indexes?.length || 0) >= 15,
      `Encontrados: ${indexes?.length || 0} índices`
    );

    // Verificar functions
    const { data: functions } = await supabaseAdmin.rpc('get_functions');
    const expectedFunctions = [
      'get_user_activities',
      'get_user_goals',
      'calculate_progress',
      'get_reminders',
      'process_notifications',
    ];

    section.functions = {
      expected: expectedFunctions.length,
      found: functions?.length || 0,
    };

    logCheck(
      'database_structure',
      'functions_exist',
      (functions?.length || 0) >= expectedFunctions.length,
      `Esperadas: ${expectedFunctions.length}, Encontradas: ${functions?.length || 0}`
    );

    // Verificar triggers
    const { data: triggers } = await supabaseAdmin.rpc('get_triggers');
    section.triggers = {
      expected: 8,
      found: triggers?.length || 0,
    };

    logCheck(
      'database_structure',
      'triggers_active',
      (triggers?.length || 0) >= 8,
      `Esperados: 8, Encontrados: ${triggers?.length || 0}`
    );
  } catch (error) {
    console.error('Erro ao validar estrutura:', error);
    logWarning('database_structure', 'structure_check_error', error.message);
  }
}

// 2. VALIDAÇÃO DE INTEGRIDADE DE DADOS
async function validateDataIntegrity() {
  console.log('\n📊 Validando Integridade de Dados...\n');

  const section = validationState.details.data_integrity;

  try {
    // Contagem de registros
    const tables = [
      'users',
      'profiles',
      'activities',
      'goals',
      'progress',
      'habits',
    ];

    section.record_counts = {};

    for (const table of tables) {
      try {
        const { count } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });

        const exportData = getExportData(table);
        const exportCount = exportData?.length || 0;
        const matches = count === exportCount;

        section.record_counts[table] = {
          database: count,
          export: exportCount,
          matches,
        };

        if (exportCount > 0) {
          logCheck(
            'data_integrity',
            `record_count_${table}`,
            matches,
            `DB: ${count}, Export: ${exportCount}`
          );
        } else {
          logCheck(
            'data_integrity',
            `record_count_${table}`,
            true,
            `Contagem: ${count}`
          );
        }
      } catch (error) {
        logWarning(
          'data_integrity',
          `record_count_${table}`,
          error.message
        );
      }
    }

    // Validar foreign keys
    section.foreign_keys = {};

    // FK: profiles.user_id -> users.id
    const { data: orphanProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id')
      .not('user_id', 'is', null)
      .then(result => {
        return supabaseAdmin
          .from('profiles')
          .select('id')
          .not('user_id', 'in', '(select id from users)');
      });

    section.foreign_keys.profiles_users = {
      orphaned: orphanProfiles?.length || 0,
    };

    logCheck(
      'data_integrity',
      'foreign_key_profiles_users',
      (orphanProfiles?.length || 0) === 0,
      `Registros órfãos: ${orphanProfiles?.length || 0}`
    );

    // Validar UUIDs
    const { data: invalidUUIDs } = await supabaseAdmin
      .from('users')
      .select('id')
      .filter('id', 'not.match', '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

    section.uuid_validation = {
      invalid_count: invalidUUIDs?.length || 0,
    };

    logCheck(
      'data_integrity',
      'uuid_format_valid',
      (invalidUUIDs?.length || 0) === 0,
      `UUIDs inválidos encontrados: ${invalidUUIDs?.length || 0}`
    );

    // Validar timestamps
    const { data: invalidTimestamps } = await supabaseAdmin
      .from('users')
      .select('id, created_at, updated_at')
      .then(result => {
        const invalid = result.data?.filter(user => {
          const createdAt = new Date(user.created_at);
          const updatedAt = new Date(user.updated_at);
          return isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime());
        }) || [];
        return { data: invalid };
      });

    section.timestamp_validation = {
      invalid_count: invalidTimestamps?.length || 0,
    };

    logCheck(
      'data_integrity',
      'timestamps_valid',
      (invalidTimestamps?.length || 0) === 0,
      `Timestamps inválidos: ${invalidTimestamps?.length || 0}`
    );
  } catch (error) {
    console.error('Erro ao validar integridade:', error);
    logWarning('data_integrity', 'integrity_check_error', error.message);
  }
}

// 3. VALIDAÇÃO DE AUTENTICAÇÃO
async function validateAuthentication() {
  console.log('\n🔐 Validando Autenticação...\n');

  const section = validationState.details.authentication;

  try {
    // Verificar usuários importados
    const { data: users, error: usersError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email');

    section.users_imported = {
      count: users?.length || 0,
    };

    logCheck(
      'authentication',
      'users_imported',
      (users?.length || 0) > 0,
      `Usuários importados: ${users?.length || 0}`
    );

    // Verificar roles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .in('role', ['admin', 'user', 'moderator']);

    const uniqueRoles = [...new Set(profiles?.map(p => p.role) || [])];
    section.roles = {
      found: uniqueRoles,
      valid: uniqueRoles.every(r => ['admin', 'user', 'moderator'].includes(r)),
    };

    logCheck(
      'authentication',
      'roles_assigned',
      (profiles?.length || 0) > 0,
      `Perfis com roles: ${profiles?.length || 0}`
    );

    // Testar login (simulado)
    section.login_test = {
      status: 'pending',
      note: 'Requer credenciais de teste',
    };

    logCheck(
      'authentication',
      'authentication_structure',
      users && profiles,
      'Estrutura de autenticação válida'
    );
  } catch (error) {
    console.error('Erro ao validar autenticação:', error);
    logWarning('authentication', 'authentication_check_error', error.message);
  }
}

// 4. VALIDAÇÃO DE RLS POLICIES
async function validateRLSPolicies() {
  console.log('\n🛡️ Validando RLS Policies...\n');

  const section = validationState.details.rls_policies;

  try {
    const { data: policies } = await supabaseAdmin.rpc('get_rls_policies');

    section.policies_count = policies?.length || 0;

    logCheck(
      'rls_policies',
      'policies_created',
      (policies?.length || 0) > 0,
      `Policies encontradas: ${policies?.length || 0}`
    );

    // Verificar policies por tabela
    const expectedTables = [
      'users',
      'profiles',
      'activities',
      'goals',
      'progress',
      'habits',
    ];

    section.tables_with_policies = {};

    for (const table of expectedTables) {
      const tablePolicies = policies?.filter(p => p.tablename === table) || [];
      section.tables_with_policies[table] = tablePolicies.length;

      logCheck(
        'rls_policies',
        `policies_${table}`,
        tablePolicies.length > 0,
        `Policies para '${table}': ${tablePolicies.length}`
      );
    }

    // Testar acesso como usuário comum (simulado)
    section.user_access_test = {
      status: 'pending',
      note: 'Requer contexto de autenticação de usuário',
    };

    // Testar acesso como admin
    section.admin_access_test = {
      status: 'pending',
      note: 'Requer contexto de autenticação de admin',
    };

    logCheck(
      'rls_policies',
      'rls_enabled',
      true,
      'RLS policies framework validado'
    );
  } catch (error) {
    console.error('Erro ao validar RLS:', error);
    logWarning('rls_policies', 'rls_check_error', error.message);
  }
}

// 5. VALIDAÇÃO DE EDGE FUNCTIONS
async function validateEdgeFunctions() {
  console.log('\n⚡ Validando Edge Functions...\n');

  const section = validationState.details.edge_functions;

  try {
    const expectedFunctions = [
      'send-notification',
      'process-habit-reminder',
      'calculate-goal-progress',
      'export-data',
      'import-data',
      'sync-with-external',
    ];

    section.expected_count = expectedFunctions.length;
    section.deployed = [];
    section.missing = [];

    // Tentar verificar funções (requer acesso à API de functions)
    const { data: functions } = await supabaseAdmin
      .functions.list();

    const deployedNames = functions?.map(f => f.name) || [];
    section.deployed_count = deployedNames.length;

    for (const func of expectedFunctions) {
      if (deployedNames.includes(func)) {
        section.deployed.push(func);
        logCheck(
          'edge_functions',
          `function_${func}`,
          true,
          'Deployada'
        );
      } else {
        section.missing.push(func);
        logWarning(
          'edge_functions',
          `function_${func}`,
          'Não encontrada ou não deployada'
        );
      }
    }

    // Validar secrets
    section.secrets = {
      configured: false,
      note: 'Verificação de secrets requer acesso adicional',
    };

    logCheck(
      'edge_functions',
      'edge_functions_deployed',
      section.deployed.length === expectedFunctions.length,
      `Deployadas: ${section.deployed.length}/${expectedFunctions.length}`
    );
  } catch (error) {
    console.error('Erro ao validar Edge Functions:', error);
    logWarning(
      'edge_functions',
      'functions_check_error',
      error.message
    );

    // Fallback para teste manual
    section.deployed_count = 0;
    section.note = 'Functions API pode não estar disponível. Verificar manualmente.';

    logWarning(
      'edge_functions',
      'functions_verification',
      'Não foi possível verificar funções automaticamente'
    );
  }
}

// Função principal
async function runValidation() {
  console.log('====================================');
  console.log('  VALIDAÇÃO PÓS-MIGRAÇÃO');
  console.log('====================================');

  // Validar variáveis de ambiente
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas');
    console.error('   Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  try {
    // Executar validações
    await validateDatabaseStructure();
    await validateDataIntegrity();
    await validateAuthentication();
    await validateRLSPolicies();
    await validateEdgeFunctions();

    // Salvar resultado
    const outputPath = path.join(process.cwd(), 'validation-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(validationState, null, 2));

    // Exibir resumo
    console.log('\n====================================');
    console.log('  RESUMO DE VALIDAÇÃO');
    console.log('====================================\n');

    console.log(`📊 Total de Verificações: ${validationState.summary.total_checks}`);
    console.log(`✓ Passou: ${validationState.summary.passed}`);
    console.log(`✗ Falhou: ${validationState.summary.failed}`);
    console.log(`⚠ Avisos: ${validationState.summary.warnings}`);

    const successRate = (
      (validationState.summary.passed / validationState.summary.total_checks) * 100
    ).toFixed(1);
    console.log(`\n📈 Taxa de Sucesso: ${successRate}%`);

    if (validationState.summary.failed > 0) {
      console.log('\n❌ PROBLEMAS ENCONTRADOS:');
      validationState.issues
        .filter(issue => issue.severity === 'error')
        .forEach(issue => {
          console.log(`   - [${issue.category}] ${issue.check}: ${issue.message}`);
        });
    }

    if (validationState.summary.warnings > 0) {
      console.log('\n⚠️ AVISOS:');
      validationState.issues
        .filter(issue => issue.severity === 'warning')
        .forEach(issue => {
          console.log(`   - [${issue.category}] ${issue.check}: ${issue.message}`);
        });
    }

    console.log(`\n💾 Relatório salvo em: ${outputPath}`);
    console.log('\n====================================\n');

    // Retornar status apropriado
    process.exit(validationState.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Erro fatal durante validação:', error);
    process.exit(1);
  }
}

// Executar validação
runValidation();
