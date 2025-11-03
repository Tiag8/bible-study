#!/usr/bin/env node

/**
 * Script para Verificar Usuários no Lovable Cloud Supabase
 *
 * Busca e lista todos os usuários autenticados no banco antigo (Lovable)
 * usando a Admin API ou conexão direta ao banco de dados.
 *
 * Uso: node scripts/check-auth-users-lovable.js
 */

import { createClient } from '@supabase/supabase-js';

// Configurações do Lovable Cloud Supabase (banco antigo)
const LOVABLE_URL = 'https://fjddlffnlbrhgogkyplq.supabase.co';
const LOVABLE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eXFrc3RqZ2RwbHpobnBwZGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjM0NjQsImV4cCI6MjA3NDk5OTQ2NH0.wSZ9ucFAvQshnkZgF5EI6CumqmVyPujm4nXJsmMvt08';
const USER_EMAIL = 'tiag8guimaraes@gmail.com';
const USER_PASSWORD = '123456';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  blue: '\x1b[34m'
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
 * Formata data para formato legível
 */
function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

/**
 * Verifica usuários via Admin API (via cliente autenticado)
 */
async function checkUsersViaAPI() {
  console.log('\n' + '='.repeat(80));
  log('VERIFICANDO USUÁRIOS VIA ADMIN API (MÉTODO 1)', colors.bright);
  console.log('='.repeat(80) + '\n');

  try {
    // Cria cliente Supabase
    log('Inicializando cliente Supabase Lovable...', colors.cyan);
    const supabase = createClient(LOVABLE_URL, LOVABLE_ANON_KEY);

    // Faz login
    log('Autenticando com credenciais do usuário...', colors.cyan);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD
    });

    if (authError) {
      throw new Error(`Falha na autenticação: ${authError.message}`);
    }

    const currentUser = authData.user;
    log(`Autenticado como: ${currentUser.email}`, colors.green);
    log(`User ID: ${currentUser.id}`, colors.gray);
    log(`Created At: ${formatDate(currentUser.created_at)}`, colors.gray);
    log(`Updated At: ${formatDate(currentUser.updated_at)}`, colors.gray);
    log(`Email Confirmed: ${currentUser.email_confirmed_at ? 'Sim' : 'Não'}`, colors.gray);

    // Tenta buscar dados da tabela de perfis
    log('\nBuscando perfis de usuários...', colors.cyan);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      log(`Erro ao buscar perfis: ${profilesError.message}`, colors.yellow);
    } else {
      log(`Perfis encontrados: ${profiles?.length || 0}`, colors.green);
      if (profiles && profiles.length > 0) {
        console.log('\n' + colors.bright + 'PERFIS ENCONTRADOS:' + colors.reset);
        profiles.forEach((profile, index) => {
          console.log(`\n  ${colors.blue}[${index + 1}]${colors.reset} ID: ${profile.id}`);
          console.log(`     Nome: ${profile.display_name || 'N/A'}`);
          console.log(`     Email: ${profile.email || 'N/A'}`);
          console.log(`     Criado: ${profile.created_at ? formatDate(profile.created_at) : 'N/A'}`);
        });
      }
    }

    // Faz logout
    await supabase.auth.signOut();
    log('\nDesconectado com sucesso.', colors.green);

    return { success: true, currentUser };

  } catch (error) {
    log(`ERRO: ${error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

/**
 * Exibe instruções para verificar via SQL Editor
 */
function displaySQLInstructions() {
  console.log('\n' + '='.repeat(80));
  log('MÉTODO ALTERNATIVO: VERIFICAR VIA SUPABASE DASHBOARD', colors.bright);
  console.log('='.repeat(80) + '\n');

  console.log(colors.cyan + 'PASSO 1: Acesse o Supabase Dashboard' + colors.reset);
  console.log('  URL: https://supabase.com/dashboard');
  console.log('  Project: Life Tracker (fjddlffnlbrhgogkyplq)');

  console.log('\n' + colors.cyan + 'PASSO 2: Vá para SQL Editor' + colors.reset);
  console.log('  Menu: SQL Editor (no painel esquerdo)');

  console.log('\n' + colors.cyan + 'PASSO 3: Execute a query abaixo:' + colors.reset);
  console.log(colors.yellow);
  console.log(`  SELECT
    id,
    email,
    created_at,
    updated_at,
    email_confirmed_at,
    phone,
    last_sign_in_at
  FROM auth.users
  ORDER BY created_at DESC;`);
  console.log(colors.reset);

  console.log('\n' + colors.cyan + 'PASSO 4: Para ver identidades vinculadas:' + colors.reset);
  console.log(colors.yellow);
  console.log(`  SELECT
    id,
    user_id,
    identity_data,
    created_at
  FROM auth.identities
  ORDER BY created_at DESC;`);
  console.log(colors.reset);

  console.log('\n' + colors.cyan + 'PASSO 5: Para ver sessões ativas:' + colors.reset);
  console.log(colors.yellow);
  console.log(`  SELECT
    id,
    user_id,
    created_at,
    updated_at,
    expires_at
  FROM auth.sessions
  WHERE NOT expires_at < NOW()
  ORDER BY created_at DESC;`);
  console.log(colors.reset);

  console.log('\n' + colors.green + '💡 DICA: Copie a query, cole no SQL Editor e clique em "Run"' + colors.reset);
  console.log('');
}

/**
 * Função principal
 */
async function main() {
  console.log('\n' + '='.repeat(80));
  log('VERIFICAÇÃO DE USUÁRIOS - LOVABLE CLOUD SUPABASE', colors.bright);
  log(`Database: Life Tracker (ID: fjddlffnlbrhgogkyplq)`, colors.cyan);
  log(`Timestamp: ${getTimestamp()}`, colors.gray);
  console.log('='.repeat(80));

  // Tenta verificar via API
  const result = await checkUsersViaAPI();

  // Exibe instruções alternativas
  displaySQLInstructions();

  // Resumo
  console.log('='.repeat(80));
  if (result.success) {
    log('✓ Verificação concluída com sucesso!', colors.green);
    console.log('\nINFORMAÇÕES IMPORTANTES:');
    console.log(`  • Usuário Atual ID: ${result.currentUser.id}`);
    console.log(`  • Email: ${result.currentUser.email}`);
    console.log(`  • Criado em: ${formatDate(result.currentUser.created_at)}`);
  } else {
    log('⚠ Erro ao conectar. Use o método SQL Editor alternativo.', colors.yellow);
  }

  console.log('\n' + colors.bright + 'PRÓXIMOS PASSOS:' + colors.reset);
  console.log('  1. Anote os IDs de usuário encontrados');
  console.log('  2. Prepare script de migração: node scripts/migrate-data-from-lovable.js');
  console.log('  3. Verifique dados no novo Supabase após migração');
  console.log('');
  console.log('='.repeat(80) + '\n');

  process.exit(result.success ? 0 : 1);
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  log(`ERRO NÃO TRATADO: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

// Executa script
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = import.meta.url.substring(0, import.meta.url.lastIndexOf('/'));

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
