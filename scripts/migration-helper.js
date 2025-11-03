#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

// Emojis
const emojis = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  pending: '⏳',
  rocket: '🚀',
  database: '🗄️',
  checkmark: '✔️',
  cross: '✗',
  arrow: '➜',
  clock: '⏰',
  package: '📦',
};

// Log file path
const LOG_FILE = path.join(__dirname, '../migration.log');
const STATUS_FILE = path.join(__dirname, '../.migration-status.json');

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const prefix = `[${timestamp}]`;

  let output = `${prefix} ${message}`;

  // Add colors based on type
  switch (type) {
    case 'success':
      output = `${colors.green}${output}${colors.reset}`;
      break;
    case 'error':
      output = `${colors.red}${output}${colors.reset}`;
      break;
    case 'warning':
      output = `${colors.yellow}${output}${colors.reset}`;
      break;
    case 'info':
      output = `${colors.blue}${output}${colors.reset}`;
      break;
    case 'pending':
      output = `${colors.cyan}${output}${colors.reset}`;
      break;
  }

  console.log(output);

  // Also write to log file (without colors)
  fs.appendFileSync(LOG_FILE, `${prefix} ${message}\n`);
}

function header(title) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
  log(`Iniciando: ${title}`);
}

function section(title) {
  console.log(`\n${colors.cyan}${colors.bright}${emojis.arrow} ${title}${colors.reset}`);
  log(`Seção: ${title}`);
}

function printProgress(current, total, label = '') {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

  const output = `${label} [${bar}] ${percentage}% (${current}/${total})`;
  process.stdout.write(`\r${output}`);
}

function clearProgress() {
  process.stdout.write('\r' + ' '.repeat(80) + '\r');
}

function getStatusData() {
  if (fs.existsSync(STATUS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
    } catch (e) {
      return getDefaultStatus();
    }
  }
  return getDefaultStatus();
}

function getDefaultStatus() {
  return {
    exported: false,
    exported_at: null,
    exported_count: 0,
    migrations_applied: false,
    migrations_applied_at: null,
    imported: false,
    imported_at: null,
    imported_count: 0,
    validated: false,
    validated_at: null,
    validation_errors: [],
  };
}

function saveStatus(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

function executeCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    log(`Executando: ${command} ${args.join(' ')}`, 'pending');

    const proc = spawn(command, args, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });
  });
}

// Command handlers
async function showStatus() {
  header('Status da Migração');

  const status = getStatusData();

  console.log(`${emojis.database} Estado da Migração:\n`);

  // Exported
  const exported = status.exported ? `${emojis.success}` : `${emojis.error}`;
  const exportedTime = status.exported_at ? ` (${status.exported_at})` : '';
  const exportedCount = status.exported_count ? ` - ${status.exported_count} registros` : '';
  console.log(`  ${exported} Dados exportados?${exportedTime}${exportedCount}`);
  log(`Dados exportados: ${status.exported}`);

  // Migrations applied
  const migrations = status.migrations_applied ? `${emojis.success}` : `${emojis.error}`;
  const migrationsTime = status.migrations_applied_at ? ` (${status.migrations_applied_at})` : '';
  console.log(`  ${migrations} Migrations aplicadas?${migrationsTime}`);
  log(`Migrations aplicadas: ${status.migrations_applied}`);

  // Imported
  const imported = status.imported ? `${emojis.success}` : `${emojis.error}`;
  const importedTime = status.imported_at ? ` (${status.imported_at})` : '';
  const importedCount = status.imported_count ? ` - ${status.imported_count} registros` : '';
  console.log(`  ${imported} Dados importados?${importedTime}${importedCount}`);
  log(`Dados importados: ${status.imported}`);

  // Validated
  const validated = status.validated ? `${emojis.success}` : `${emojis.error}`;
  const validatedTime = status.validated_at ? ` (${status.validated_at})` : '';
  const errorCount = status.validation_errors?.length ? ` - ${status.validation_errors.length} erros` : '';
  console.log(`  ${validated} Validação completa?${validatedTime}${errorCount}`);
  log(`Validação completa: ${status.validated}`);

  // Progress bar
  const steps = [
    status.exported,
    status.migrations_applied,
    status.imported,
    status.validated,
  ].filter(Boolean).length;

  console.log(`\n${emojis.rocket} Progresso: ${steps}/4 etapas concluídas\n`);
  printProgress(steps, 4, 'Migração');
  console.log('\n');

  log('Status consultado com sucesso');
}

async function exportData() {
  header('Exportar Dados');

  try {
    section('Iniciando exportação do Lovable');

    // Check if export script exists
    const exportScript = path.join(__dirname, '../scripts/export-lovable.js');
    if (!fs.existsSync(exportScript)) {
      log('Script de exportação não encontrado', 'error');
      console.log(`${colors.red}${emojis.error} Script não encontrado: ${exportScript}${colors.reset}`);
      return;
    }

    await executeCommand('node', ['scripts/export-lovable.js']);

    // Update status
    const status = getStatusData();
    status.exported = true;
    status.exported_at = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    saveStatus(status);

    console.log(`\n${colors.green}${emojis.success} Dados exportados com sucesso!${colors.reset}\n`);
    log('Exportação concluída com sucesso');
  } catch (error) {
    console.log(`\n${colors.red}${emojis.error} Erro ao exportar dados: ${error.message}${colors.reset}\n`);
    log(`Erro ao exportar: ${error.message}`, 'error');
  }
}

async function importData() {
  header('Importar Dados');

  try {
    // Check if export file exists
    const exportFile = path.join(__dirname, '../data/export.json');
    if (!fs.existsSync(exportFile)) {
      log('Arquivo de export não encontrado', 'error');
      console.log(`${colors.red}${emojis.error} Arquivo não encontrado: ${exportFile}${colors.reset}`);
      console.log(`\n${colors.yellow}${emojis.warning} Execute primeiro: node scripts/migration-helper.js export${colors.reset}\n`);
      return;
    }

    section('Verificando arquivo de exportação');
    const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf-8'));
    log(`Arquivo de exportação contém dados`, 'info');

    section('Iniciando importação para novo Supabase');

    // Check if import script exists
    const importScript = path.join(__dirname, '../scripts/import-supabase.js');
    if (!fs.existsSync(importScript)) {
      log('Script de importação não encontrado', 'error');
      console.log(`${colors.red}${emojis.error} Script não encontrado: ${importScript}${colors.reset}`);
      return;
    }

    await executeCommand('node', ['scripts/import-supabase.js']);

    // Update status
    const status = getStatusData();
    status.imported = true;
    status.imported_at = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    status.imported_count = Object.keys(exportData).reduce((sum, key) => sum + (Array.isArray(exportData[key]) ? exportData[key].length : 0), 0);
    saveStatus(status);

    console.log(`\n${colors.green}${emojis.success} Dados importados com sucesso!${colors.reset}\n`);
    log('Importação concluída com sucesso');
  } catch (error) {
    console.log(`\n${colors.red}${emojis.error} Erro ao importar dados: ${error.message}${colors.reset}\n`);
    log(`Erro ao importar: ${error.message}`, 'error');
  }
}

async function validateData() {
  header('Validar Dados');

  try {
    section('Iniciando validação');

    // Check if validation script exists
    const validationScript = path.join(__dirname, '../scripts/validate-migration.js');
    if (!fs.existsSync(validationScript)) {
      log('Script de validação não encontrado', 'error');
      console.log(`${colors.red}${emojis.error} Script não encontrado: ${validationScript}${colors.reset}`);
      return;
    }

    await executeCommand('node', ['scripts/validate-migration.js']);

    // Update status
    const status = getStatusData();
    status.validated = true;
    status.validated_at = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    status.validation_errors = [];
    saveStatus(status);

    console.log(`\n${colors.green}${emojis.success} Validação concluída com sucesso!${colors.reset}\n`);
    log('Validação concluída com sucesso');
  } catch (error) {
    console.log(`\n${colors.yellow}${emojis.warning} Validação concluída com avisos: ${error.message}${colors.reset}\n`);
    log(`Validação com avisos: ${error.message}`, 'warning');
  }
}

async function showSummary() {
  header('Resumo Completo da Migração');

  const status = getStatusData();

  console.log(`${emojis.database} Contagem de Registros:\n`);

  if (status.exported_count > 0) {
    console.log(`  ${emojis.checkmark} Lovable (exportado): ${colors.bright}${status.exported_count}${colors.reset} registros`);
  } else {
    console.log(`  ${emojis.cross} Lovable: Dados ainda não exportados`);
  }

  if (status.imported_count > 0) {
    console.log(`  ${emojis.checkmark} Novo Supabase (importado): ${colors.bright}${status.imported_count}${colors.reset} registros`);
  } else {
    console.log(`  ${emojis.cross} Novo Supabase: Dados ainda não importados`);
  }

  if (status.exported_count > 0 && status.imported_count > 0) {
    const diff = Math.abs(status.exported_count - status.imported_count);
    if (diff === 0) {
      console.log(`  ${colors.green}${emojis.success} Diferença: ${colors.reset}0 registros (perfeito!)\n`);
    } else {
      console.log(`  ${colors.yellow}${emojis.warning} Diferença: ${diff} registros${colors.reset}\n`);
    }
  } else {
    console.log('\n');
  }

  console.log(`${emojis.rocket} Progresso da Migração:\n`);

  const steps = [
    { name: 'Dados exportados', done: status.exported, time: status.exported_at },
    { name: 'Migrations aplicadas', done: status.migrations_applied, time: status.migrations_applied_at },
    { name: 'Dados importados', done: status.imported, time: status.imported_at },
    { name: 'Validação completa', done: status.validated, time: status.validated_at },
  ];

  steps.forEach((step, index) => {
    const icon = step.done ? `${colors.green}${emojis.success}${colors.reset}` : `${colors.red}${emojis.error}${colors.reset}`;
    const time = step.time ? ` ${colors.dim}(${step.time})${colors.reset}` : '';
    console.log(`  ${icon} ${step.name}${time}`);
  });

  console.log('\n');
  const completedSteps = steps.filter(s => s.done).length;
  printProgress(completedSteps, steps.length, 'Progresso geral');
  console.log('\n');

  if (status.validation_errors && status.validation_errors.length > 0) {
    console.log(`${colors.yellow}${emojis.warning} Erros de Validação:${colors.reset}\n`);
    status.validation_errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('\n');
  }

  // Próximos passos
  console.log(`${emojis.info} Próximos Passos:\n`);

  if (!status.exported) {
    console.log(`  1. ${colors.cyan}node scripts/migration-helper.js export${colors.reset} - Exportar dados do Lovable`);
  }
  if (!status.migrations_applied) {
    console.log(`  ${status.exported ? '2' : ''}. ${colors.cyan}node scripts/migration-helper.js migrations${colors.reset} - Aplicar migrations`);
  }
  if (!status.imported) {
    const step = [status.exported, status.migrations_applied].filter(Boolean).length + 1;
    console.log(`  ${step}. ${colors.cyan}node scripts/migration-helper.js import${colors.reset} - Importar dados`);
  }
  if (!status.validated) {
    const step = [status.exported, status.migrations_applied, status.imported].filter(Boolean).length + 1;
    console.log(`  ${step}. ${colors.cyan}node scripts/migration-helper.js validate${colors.reset} - Validar dados`);
  }

  console.log('\n');
  log('Resumo exibido com sucesso');
}

function showHelp() {
  console.log(`
${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.blue}║${colors.reset}         ${colors.bright}Migration Helper - Life Tracker${colors.reset}${colors.bright}${colors.blue}         ║${colors.reset}
${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}Uso:${colors.reset}
  node scripts/migration-helper.js [comando]

${colors.bright}Comandos:${colors.reset}
  ${colors.cyan}status${colors.reset}      Mostra o status atual da migração
  ${colors.cyan}export${colors.reset}      Exporta dados do Lovable
  ${colors.cyan}import${colors.reset}      Importa dados para o novo Supabase
  ${colors.cyan}validate${colors.reset}    Valida os dados importados
  ${colors.cyan}summary${colors.reset}     Mostra um resumo completo da migração
  ${colors.cyan}migrations${colors.reset}  Aplica migrations ao novo Supabase
  ${colors.cyan}--help${colors.reset}      Mostra esta mensagem

${colors.bright}Exemplos:${colors.reset}
  node scripts/migration-helper.js status
  node scripts/migration-helper.js export
  node scripts/migration-helper.js import
  node scripts/migration-helper.js validate
  node scripts/migration-helper.js summary

${colors.bright}Logs:${colors.reset}
  Todos os comandos são registrados em: migration.log

${colors.bright}Status:${colors.reset}
  O status da migração é salvo em: .migration-status.json

  `);
}

// Main
async function main() {
  const command = process.argv[2];

  // Ensure log directory exists
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  log(`Iniciando Migration Helper - Comando: ${command || 'nenhum'}`);

  try {
    switch (command) {
      case 'status':
        await showStatus();
        break;
      case 'export':
        await exportData();
        break;
      case 'import':
        await importData();
        break;
      case 'validate':
        await validateData();
        break;
      case 'summary':
        await showSummary();
        break;
      case 'migrations':
        header('Aplicar Migrations');
        section('Aplicando migrations ao novo Supabase');
        console.log(`${colors.cyan}${emojis.pending} Execute as migrations no seu banco de dados${colors.reset}\n`);
        log('Migrations - instruções exibidas');
        break;
      case '--help':
      case '-h':
      case '':
        showHelp();
        break;
      default:
        console.log(`${colors.red}${emojis.error} Comando desconhecido: ${command}${colors.reset}\n`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.log(`\n${colors.red}${emojis.error} Erro: ${error.message}${colors.reset}\n`);
    log(`Erro fatal: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();
