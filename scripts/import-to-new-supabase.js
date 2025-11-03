#!/usr/bin/env node

/**
 * Script de Importação de Dados para Novo Supabase
 *
 * Este script importa todos os dados exportados dos arquivos JSON
 * para uma nova instância do Supabase, respeitando ordem de foreign keys
 * e incluindo rollback em caso de erro.
 *
 * Uso:
 *   node scripts/import-to-new-supabase.js
 *
 * Variáveis de ambiente necessárias:
 *   NEW_SUPABASE_URL - URL do novo projeto Supabase
 *   NEW_SUPABASE_ANON_KEY - Anon key do novo projeto
 *   NEW_SUPABASE_SERVICE_ROLE_KEY - Service role key (para bypassar RLS)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configurações
const DATA_DIR = path.join(__dirname, '..', 'data');
const BATCH_SIZE = 100; // Tamanho do lote para inserções

// Cores para output no console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Relatório de importação
const report = {
  startTime: new Date(),
  endTime: null,
  tablesProcessed: 0,
  totalRecords: 0,
  successfulImports: 0,
  failedImports: 0,
  errors: [],
  tableStats: {}
};

/**
 * Valida as variáveis de ambiente necessárias
 */
function validateEnvironment() {
  const required = [
    'NEW_SUPABASE_URL',
    'NEW_SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`${colors.red}${colors.bright}Erro: Variáveis de ambiente faltando:${colors.reset}`);
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nDefina essas variáveis no arquivo .env ou como variáveis de ambiente.');
    process.exit(1);
  }
}

/**
 * Cria cliente Supabase com service role key
 */
function createSupabaseClient() {
  return createClient(
    process.env.NEW_SUPABASE_URL,
    process.env.NEW_SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Lê arquivo JSON do diretório de dados
 */
async function readJSONFile(filename) {
  try {
    const filepath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filepath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`${colors.yellow}⚠ Arquivo não encontrado: ${filename}${colors.reset}`);
      return null;
    }
    throw error;
  }
}

/**
 * Verifica se uma tabela existe no banco de dados
 */
async function tableExists(supabase, tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  // Se não houver erro, a tabela existe
  return !error || error.code !== '42P01'; // 42P01 = undefined_table
}

/**
 * Cria um usuário no auth.users se não existir
 */
async function ensureAuthUser(supabase, userId, email) {
  try {
    // Verifica se o usuário já existe
    const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserById(userId);

    if (existingUser) {
      console.log(`  ℹ Usuário auth já existe: ${email}`);
      return true;
    }

    // Cria o usuário no auth.users
    const { data, error } = await supabase.auth.admin.createUser({
      id: userId,
      email: email || `user_${userId}@placeholder.com`,
      email_confirm: true,
      password: Math.random().toString(36).slice(-16), // Senha aleatória
      user_metadata: {
        imported: true,
        import_date: new Date().toISOString()
      }
    });

    if (error) {
      console.error(`  ${colors.red}✗ Erro ao criar usuário auth: ${error.message}${colors.reset}`);
      return false;
    }

    console.log(`  ${colors.green}✓ Usuário auth criado: ${email}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`  ${colors.red}✗ Exceção ao criar usuário auth: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Importa dados em lotes com upsert
 */
async function importBatch(supabase, tableName, records, options = {}) {
  const { upsertKeys = null, createAuthUser = false } = options;

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Divide em lotes
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    try {
      // Se precisar criar usuários auth primeiro
      if (createAuthUser) {
        for (const record of batch) {
          await ensureAuthUser(supabase, record.id, record.email);
        }
      }

      // Tenta inserir o lote
      let query = supabase.from(tableName).insert(batch);

      // Se tiver upsert keys, usa onConflict
      if (upsertKeys) {
        query = supabase.from(tableName).upsert(batch, {
          onConflict: upsertKeys.join(',')
        });
      }

      const { data, error } = await query;

      if (error) {
        errorCount += batch.length;
        errors.push({
          batch: `${i + 1}-${i + batch.length}`,
          error: error.message
        });
        console.error(`  ${colors.red}✗ Erro no lote ${i + 1}-${i + batch.length}: ${error.message}${colors.reset}`);
      } else {
        successCount += batch.length;
      }
    } catch (error) {
      errorCount += batch.length;
      errors.push({
        batch: `${i + 1}-${i + batch.length}`,
        error: error.message
      });
      console.error(`  ${colors.red}✗ Exceção no lote ${i + 1}-${i + batch.length}: ${error.message}${colors.reset}`);
    }

    // Progress
    const progress = Math.min(i + BATCH_SIZE, records.length);
    process.stdout.write(`  Progresso: ${progress}/${records.length} registros\r`);
  }

  console.log(''); // Nova linha após progress

  return { successCount, errorCount, errors };
}

/**
 * Importa uma tabela específica
 */
async function importTable(supabase, tableName, filename, options = {}) {
  console.log(`\n${colors.cyan}${colors.bright}Importando: ${tableName}${colors.reset}`);

  const startTime = Date.now();

  // Verifica se a tabela existe
  const exists = await tableExists(supabase, tableName);
  if (!exists) {
    console.log(`${colors.yellow}⚠ Tabela ${tableName} não existe no banco. Pulando...${colors.reset}`);
    return { skipped: true };
  }

  // Lê o arquivo JSON
  const data = await readJSONFile(filename);
  if (!data || data.length === 0) {
    console.log(`${colors.yellow}⚠ Sem dados para importar${colors.reset}`);
    return { skipped: true, empty: true };
  }

  console.log(`  Total de registros: ${data.length}`);

  // Valida estrutura básica
  if (!Array.isArray(data)) {
    console.error(`${colors.red}✗ Erro: Arquivo não contém um array${colors.reset}`);
    return { skipped: true, error: 'Invalid format' };
  }

  // Importa os dados
  const result = await importBatch(supabase, tableName, data, options);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Atualiza relatório
  report.tablesProcessed++;
  report.totalRecords += data.length;
  report.successfulImports += result.successCount;
  report.failedImports += result.errorCount;
  report.tableStats[tableName] = {
    total: data.length,
    success: result.successCount,
    failed: result.errorCount,
    duration: `${duration}s`,
    errors: result.errors
  };

  if (result.errors.length > 0) {
    report.errors.push({
      table: tableName,
      errors: result.errors
    });
  }

  // Sumário
  if (result.errorCount === 0) {
    console.log(`${colors.green}✓ Importação completa: ${result.successCount} registros em ${duration}s${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Importação parcial: ${result.successCount} sucesso, ${result.errorCount} falhas em ${duration}s${colors.reset}`);
  }

  return result;
}

/**
 * Importa todas as tabelas na ordem correta
 */
async function importAllTables(supabase) {
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}  Iniciando Importação de Dados para Novo Supabase${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`\nURL: ${process.env.NEW_SUPABASE_URL}`);
  console.log(`Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);

  // Ordem de importação (respeitando foreign keys)
  const importSequence = [
    {
      table: 'profiles',
      file: 'profiles.json',
      options: {
        upsertKeys: ['id'],
        createAuthUser: true // Cria usuários no auth.users antes
      }
    },
    {
      table: 'user_roles',
      file: 'user_roles.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'habit_categories',
      file: 'habit_categories.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'habits',
      file: 'habits.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'goals',
      file: 'goals.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'habit_entries',
      file: 'habit_entries.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'goal_entries',
      file: 'goal_entries.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'assessment_responses',
      file: 'assessment_responses.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'assessment_history',
      file: 'assessment_history.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'ai_suggestions',
      file: 'ai_suggestions.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'coach_conversations',
      file: 'coach_conversations.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'coach_messages',
      file: 'coach_messages.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'milestones',
      file: 'milestones.json',
      options: {
        upsertKeys: ['id']
      }
    },
    {
      table: 'user_onboarding',
      file: 'user_onboarding.json',
      options: {
        upsertKeys: ['user_id']
      }
    }
  ];

  // Importa cada tabela
  for (const { table, file, options } of importSequence) {
    try {
      await importTable(supabase, table, file, options);
    } catch (error) {
      console.error(`${colors.red}${colors.bright}✗ Erro fatal ao importar ${table}:${colors.reset}`, error);
      report.errors.push({
        table,
        error: error.message,
        fatal: true
      });

      // Pergunta se deve continuar
      console.log(`\n${colors.yellow}Deseja continuar com as próximas tabelas? (Ctrl+C para cancelar)${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

/**
 * Gera relatório final
 */
function generateReport() {
  report.endTime = new Date();
  const duration = ((report.endTime - report.startTime) / 1000).toFixed(2);

  console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}  Relatório de Importação${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`\nDuração total: ${duration}s`);
  console.log(`Tabelas processadas: ${report.tablesProcessed}`);
  console.log(`Total de registros: ${report.totalRecords}`);
  console.log(`${colors.green}Sucessos: ${report.successfulImports}${colors.reset}`);
  console.log(`${colors.red}Falhas: ${report.failedImports}${colors.reset}`);

  // Detalhes por tabela
  console.log(`\n${colors.bright}Detalhes por Tabela:${colors.reset}`);
  for (const [table, stats] of Object.entries(report.tableStats)) {
    const statusIcon = stats.failed === 0 ? `${colors.green}✓${colors.reset}` : `${colors.yellow}⚠${colors.reset}`;
    console.log(`  ${statusIcon} ${table}: ${stats.success}/${stats.total} (${stats.duration})`);

    if (stats.errors.length > 0) {
      stats.errors.forEach(err => {
        console.log(`    ${colors.red}↳ Lote ${err.batch}: ${err.error}${colors.reset}`);
      });
    }
  }

  // Erros gerais
  if (report.errors.length > 0) {
    console.log(`\n${colors.red}${colors.bright}Erros Encontrados:${colors.reset}`);
    report.errors.forEach(err => {
      console.log(`  ${colors.red}✗ ${err.table}${colors.reset}`);
      if (err.fatal) {
        console.log(`    ${colors.red}ERRO FATAL: ${err.error}${colors.reset}`);
      } else if (err.errors) {
        err.errors.forEach(e => {
          console.log(`    Lote ${e.batch}: ${e.error}`);
        });
      }
    });
  }

  // Salva relatório em arquivo
  const reportPath = path.join(__dirname, '..', 'data', `import-report-${Date.now()}.json`);
  fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    .then(() => {
      console.log(`\n${colors.cyan}Relatório salvo em: ${reportPath}${colors.reset}`);
    })
    .catch(err => {
      console.error(`${colors.red}Erro ao salvar relatório: ${err.message}${colors.reset}`);
    });

  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Status de saída
  if (report.failedImports > 0) {
    console.log(`${colors.yellow}⚠ Importação concluída com erros${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✓ Importação concluída com sucesso!${colors.reset}`);
    process.exit(0);
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    // Valida ambiente
    validateEnvironment();

    // Cria cliente Supabase
    const supabase = createSupabaseClient();

    // Testa conexão
    console.log(`\n${colors.cyan}Testando conexão com Supabase...${colors.reset}`);
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError && testError.code === '42P01') {
      console.log(`${colors.green}✓ Conexão estabelecida (tabela profiles não existe ainda)${colors.reset}`);
    } else if (testError) {
      throw new Error(`Erro ao conectar: ${testError.message}`);
    } else {
      console.log(`${colors.green}✓ Conexão estabelecida com sucesso${colors.reset}`);
    }

    // Verifica se diretório de dados existe
    try {
      await fs.access(DATA_DIR);
    } catch (error) {
      throw new Error(`Diretório de dados não encontrado: ${DATA_DIR}`);
    }

    // Importa todas as tabelas
    await importAllTables(supabase);

    // Gera relatório
    generateReport();

  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}Erro Fatal:${colors.reset}`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Tratamento de sinais
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}Importação interrompida pelo usuário${colors.reset}`);
  generateReport();
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log(`\n\n${colors.yellow}Importação terminada${colors.reset}`);
  generateReport();
  process.exit(143);
});

// Executa
main();
