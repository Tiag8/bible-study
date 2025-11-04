#!/usr/bin/env node

/**
 * Script de Exportação de Dados do Supabase Lovable
 *
 * Exporta todas as tabelas do banco de dados Lovable em ordem de dependências
 * respeitando foreign keys e RLS (Row Level Security).
 *
 * Uso: node scripts/export-from-lovable.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase Lovable
const SUPABASE_URL = 'https://${SUPABASE_PROJECT_REF}.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eXFrc3RqZ2RwbHpobnBwZGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjM0NjQsImV4cCI6MjA3NDk5OTQ2NH0.wSZ9ucFAvQshnkZgF5EI6CumqmVyPujm4nXJsmMvt08';
const USER_EMAIL = 'tiag8guimaraes@gmail.com';
const USER_PASSWORD = '123456';

// Diretório de output
const OUTPUT_DIR = path.join(__dirname, '..', 'data');

// Tabelas em ordem de dependências (sem foreign keys primeiro)
const TABLES = [
  'profiles',
  'user_roles',
  'habit_categories',
  'habits',
  'goals',
  'habit_entries',
  'goal_entries',
  'assessment_responses',
  'assessment_history',
  'ai_suggestions',
  'coach_conversations',
  'coach_messages',
  'milestones',
  'user_onboarding'
];

// Cores para output no console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

/**
 * Formata timestamp para output
 */
function getTimestamp() {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

/**
 * Loga mensagem com cor e timestamp
 */
function log(message, color = colors.reset) {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${color}${message}${colors.reset}`);
}

/**
 * Cria diretório se não existir
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Diretório criado: ${dirPath}`, colors.cyan);
  }
}

/**
 * Salva dados em arquivo JSON
 */
function saveToJson(filename, data) {
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  return filePath;
}

/**
 * Exporta uma tabela específica
 */
async function exportTable(supabase, tableName, exportReport) {
  log(`Exportando tabela: ${tableName}...`, colors.cyan);

  const startTime = Date.now();

  try {
    // Busca todos os dados da tabela
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' });

    if (error) {
      throw error;
    }

    const recordCount = data ? data.length : 0;
    const duration = Date.now() - startTime;

    // Salva dados em arquivo JSON
    const filename = `${tableName}.json`;
    const filePath = saveToJson(filename, data || []);

    // Atualiza relatório
    exportReport.tables[tableName] = {
      status: 'success',
      records: recordCount,
      duration_ms: duration,
      file: filename,
      exported_at: new Date().toISOString()
    };

    log(
      `✓ ${tableName}: ${recordCount} registros exportados em ${duration}ms`,
      colors.green
    );

    return { success: true, count: recordCount };

  } catch (error) {
    const duration = Date.now() - startTime;

    // Registra erro no relatório
    exportReport.tables[tableName] = {
      status: 'error',
      error: error.message,
      duration_ms: duration,
      exported_at: new Date().toISOString()
    };

    log(`✗ ${tableName}: ERRO - ${error.message}`, colors.red);

    return { success: false, error: error.message };
  }
}

/**
 * Função principal de exportação
 */
async function main() {
  console.log('\n' + '='.repeat(70));
  log('EXPORTAÇÃO DE DADOS DO SUPABASE LOVABLE', colors.bright);
  console.log('='.repeat(70) + '\n');

  const startTime = Date.now();

  // Cria diretório de output
  ensureDirectoryExists(OUTPUT_DIR);

  // Inicializa relatório de exportação
  const exportReport = {
    export_started_at: new Date().toISOString(),
    export_completed_at: null,
    total_duration_ms: 0,
    source: {
      url: SUPABASE_URL,
      user: USER_EMAIL
    },
    tables: {},
    summary: {
      total_tables: TABLES.length,
      successful: 0,
      failed: 0,
      total_records: 0
    }
  };

  try {
    // Cria cliente Supabase
    log('Inicializando cliente Supabase...', colors.cyan);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Faz login para contornar RLS
    log('Autenticando usuário...', colors.cyan);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD
    });

    if (authError) {
      throw new Error(`Falha na autenticação: ${authError.message}`);
    }

    log(`✓ Autenticado como: ${authData.user.email}`, colors.green);
    log(`User ID: ${authData.user.id}`, colors.gray);
    console.log('');

    // Exporta cada tabela em ordem
    for (let i = 0; i < TABLES.length; i++) {
      const tableName = TABLES[i];
      const tableNumber = i + 1;

      log(`[${tableNumber}/${TABLES.length}] Processando ${tableName}...`, colors.bright);

      const result = await exportTable(supabase, tableName, exportReport);

      if (result.success) {
        exportReport.summary.successful++;
        exportReport.summary.total_records += result.count;
      } else {
        exportReport.summary.failed++;
      }

      console.log('');
    }

    // Faz logout
    await supabase.auth.signOut();

  } catch (error) {
    log(`ERRO CRÍTICO: ${error.message}`, colors.red);
    exportReport.critical_error = error.message;
  }

  // Finaliza relatório
  const totalDuration = Date.now() - startTime;
  exportReport.export_completed_at = new Date().toISOString();
  exportReport.total_duration_ms = totalDuration;

  // Salva relatório
  const reportPath = saveToJson('export-report.json', exportReport);

  // Exibe resumo
  console.log('='.repeat(70));
  log('RESUMO DA EXPORTAÇÃO', colors.bright);
  console.log('='.repeat(70));
  console.log('');
  console.log(`Total de tabelas:      ${exportReport.summary.total_tables}`);
  console.log(`${colors.green}Exportadas com sucesso: ${exportReport.summary.successful}${colors.reset}`);
  console.log(`${colors.red}Falhas:                ${exportReport.summary.failed}${colors.reset}`);
  console.log(`${colors.bright}Total de registros:    ${exportReport.summary.total_records}${colors.reset}`);
  console.log(`Tempo total:           ${(totalDuration / 1000).toFixed(2)}s`);
  console.log('');
  console.log(`Diretório de output:   ${OUTPUT_DIR}`);
  console.log(`Relatório salvo em:    ${reportPath}`);
  console.log('');
  console.log('='.repeat(70) + '\n');

  // Exibe lista de arquivos gerados
  if (exportReport.summary.successful > 0) {
    log('Arquivos gerados:', colors.bright);
    for (const [tableName, info] of Object.entries(exportReport.tables)) {
      if (info.status === 'success') {
        console.log(`  ${colors.green}✓${colors.reset} ${info.file} (${info.records} registros)`);
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${tableName}.json (${info.error})`);
      }
    }
    console.log('');
  }

  // Exit code baseado no sucesso
  const exitCode = exportReport.summary.failed > 0 ? 1 : 0;

  if (exitCode === 0) {
    log('✓ Exportação concluída com sucesso!', colors.green);
  } else {
    log('⚠ Exportação concluída com erros!', colors.yellow);
  }

  console.log('');
  process.exit(exitCode);
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  log(`ERRO NÃO TRATADO: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

// Executa script
if (require.main === module) {
  main();
}

module.exports = { main, exportTable };
