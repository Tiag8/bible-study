#!/usr/bin/env node

/**
 * Script para adicionar prefixo "lifetracker_" em todos os objetos do banco de dados
 *
 * Adiciona prefixo em:
 * - ENUMs (frequency_type → lifetracker_frequency_type)
 * - Tabelas (habits → lifetracker_habits)
 * - Functions (handle_updated_at → lifetracker_handle_updated_at)
 * - Triggers (on_auth_user_created → lifetracker_on_auth_user_created)
 * - Indexes (idx_habits_user_id → idx_lifetracker_habits_user_id)
 * - Materialized Views (admin_metrics_summary → lifetracker_admin_metrics_summary)
 *
 * NÃO adiciona prefixo em:
 * - Tabelas do schema auth (auth.users)
 * - Funções built-in do PostgreSQL
 * - Palavras-chave SQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = '/Users/tiago/Downloads/consolidated-migration.sql';
const OUTPUT_FILE = path.join(__dirname, '../supabase/lifetracker-consolidated-migration.sql');

// Lista de tabelas que serão prefixadas
const TABLES = [
  'profiles',
  'user_roles',
  'user_onboarding',
  'user_sessions',
  'habit_categories',
  'habits',
  'habit_entries',
  'habit_refinements',
  'goals',
  'goal_entries',
  'milestones',
  'identities',
  'assessment_history',
  'assessment_responses',
  'assessment_partial_progress',
  'ai_suggestions',
  'coach_conversations',
  'coach_messages',
  'coach_nudges',
  'change_logs',
  'entity_versions'
];

// Lista de ENUMs que serão prefixados
const ENUMS = [
  'frequency_type',
  'suggestion_type',
  'milestone_type',
  'timeframe_type',
  'app_role'
];

// Lista de Functions que serão prefixadas
const FUNCTIONS = [
  'handle_updated_at',
  'has_role',
  'handle_new_user',
  'sync_goal_current_value',
  'log_entity_changes',
  'generate_coach_nudge_for_update',
  'cleanup_old_change_logs',
  'grant_admin_role',
  'revoke_admin_role',
  'get_admin_metrics',
  'refresh_admin_metrics'
];

// Lista de Triggers que serão prefixados
const TRIGGERS = [
  'on_auth_user_created',
  'update_profiles_updated_at',
  'update_habits_updated_at',
  'update_goals_updated_at',
  'update_goal_entries_updated_at',
  'update_identities_updated_at',
  'update_user_onboarding_updated_at',
  'sync_goal_value_on_entry_change',
  'log_habit_changes',
  'log_goal_changes',
  'generate_nudge_on_habit_update',
  'generate_nudge_on_goal_update'
];

// Lista de Indexes que serão prefixados
const INDEXES = [
  'idx_habits_user_id',
  'idx_habit_entries_habit_date',
  'idx_goals_user_id',
  'idx_goal_entries_goal_date',
  'idx_coach_nudges_user_unread',
  'idx_change_logs_entity'
];

// Materialized Views
const MATERIALIZED_VIEWS = [
  'admin_metrics_summary'
];

console.log('🔄 Processando SQL com prefixo lifetracker_...\n');

// Ler arquivo SQL
let sql = fs.readFileSync(INPUT_FILE, 'utf8');
const originalLength = sql.length;

// 1. ADICIONAR PREFIXO EM ENUMS
console.log('📋 Adicionando prefixo em ENUMs...');
ENUMS.forEach(enumName => {
  // CREATE TYPE
  sql = sql.replace(
    new RegExp(`CREATE TYPE public\\.${enumName}`, 'g'),
    `CREATE TYPE public.lifetracker_${enumName}`
  );

  // Uso como cast (::app_role)
  sql = sql.replace(
    new RegExp(`::${enumName}`, 'g'),
    `::lifetracker_${enumName}`
  );

  // Uso como tipo em colunas - APENAS quando é o tipo, não o nome da coluna
  // Padrão: "nome_coluna tipo_enum" seguido de palavra-chave SQL
  // Exemplo: "role app_role NOT NULL" → "role lifetracker_app_role NOT NULL"
  // Captura: identifier + espaço + enum_name + espaço/vírgula/parêntese
  // EXCETO quando precedido por palavras-chave SQL (SELECT, FROM, WHERE, GROUP BY, ORDER BY, etc.)
  sql = sql.replace(
    new RegExp(`((?:^|[^A-Z])\\w+\\s+)${enumName}(\\s+(?:NOT NULL|DEFAULT|,|;|\\)))`, 'g'),
    (match, p1, p2) => {
      // Não substituir se precedido por palavras-chave SQL
      const sqlKeywords = /\\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|AND|OR|AS|BY)\\s+\\w+\\s+$/i;
      if (sqlKeywords.test(p1)) {
        return match; // Retornar sem modificar
      }
      return `${p1}lifetracker_${enumName}${p2}`;
    }
  );

  // Também capturar quando é só: "identifier enum_name," (sem NOT NULL)
  sql = sql.replace(
    new RegExp(`(\\w+\\s+)${enumName}(,)`, 'g'),
    `$1lifetracker_${enumName}$2`
  );

  // Capturar quando usado como tipo de parâmetro em funções
  // Exemplo: "FUNCTION name(param app_role)" ou "(_param app_role)"
  sql = sql.replace(
    new RegExp(`(\\w+\\s+)${enumName}(\\))`, 'g'),
    `$1lifetracker_${enumName}$2`
  );

  console.log(`  ✅ ${enumName} → lifetracker_${enumName}`);
});

// 2. ADICIONAR PREFIXO EM TABELAS
console.log('\n📊 Adicionando prefixo em Tabelas...');
TABLES.forEach(tableName => {
  // CREATE TABLE
  sql = sql.replace(
    new RegExp(`CREATE TABLE public\\.${tableName}`, 'g'),
    `CREATE TABLE public.lifetracker_${tableName}`
  );

  // ALTER TABLE
  sql = sql.replace(
    new RegExp(`ALTER TABLE public\\.${tableName}`, 'g'),
    `ALTER TABLE public.lifetracker_${tableName}`
  );

  // REFERENCES (foreign keys)
  sql = sql.replace(
    new RegExp(`REFERENCES public\\.${tableName}\\(`, 'g'),
    `REFERENCES public.lifetracker_${tableName}(`
  );

  // FROM/JOIN queries
  sql = sql.replace(
    new RegExp(`FROM public\\.${tableName}(?!\\w)`, 'g'),
    `FROM public.lifetracker_${tableName}`
  );

  sql = sql.replace(
    new RegExp(`JOIN public\\.${tableName}(?!\\w)`, 'g'),
    `JOIN public.lifetracker_${tableName}`
  );

  // INSERT INTO
  sql = sql.replace(
    new RegExp(`INSERT INTO public\\.${tableName}`, 'g'),
    `INSERT INTO public.lifetracker_${tableName}`
  );

  // UPDATE
  sql = sql.replace(
    new RegExp(`UPDATE public\\.${tableName}`, 'g'),
    `UPDATE public.lifetracker_${tableName}`
  );

  // DELETE FROM
  sql = sql.replace(
    new RegExp(`DELETE FROM public\\.${tableName}`, 'g'),
    `DELETE FROM public.lifetracker_${tableName}`
  );

  // ON table (policies, triggers)
  sql = sql.replace(
    new RegExp(`ON public\\.${tableName}(?!\\w)`, 'g'),
    `ON public.lifetracker_${tableName}`
  );

  // Triggers: AFTER/BEFORE ... ON table
  sql = sql.replace(
    new RegExp(`ON public\\.${tableName}\\s+FOR`, 'g'),
    `ON public.lifetracker_${tableName} FOR`
  );

  console.log(`  ✅ ${tableName} → lifetracker_${tableName}`);
});

// 3. ADICIONAR PREFIXO EM FUNCTIONS
console.log('\n⚙️  Adicionando prefixo em Functions...');
FUNCTIONS.forEach(funcName => {
  // CREATE OR REPLACE FUNCTION
  sql = sql.replace(
    new RegExp(`CREATE OR REPLACE FUNCTION public\\.${funcName}\\(`, 'g'),
    `CREATE OR REPLACE FUNCTION public.lifetracker_${funcName}(`
  );

  // EXECUTE FUNCTION (triggers)
  sql = sql.replace(
    new RegExp(`EXECUTE FUNCTION public\\.${funcName}\\(`, 'g'),
    `EXECUTE FUNCTION public.lifetracker_${funcName}(`
  );

  // Chamadas diretas: public.function_name()
  sql = sql.replace(
    new RegExp(`public\\.${funcName}\\(`, 'g'),
    `public.lifetracker_${funcName}(`
  );

  console.log(`  ✅ ${funcName} → lifetracker_${funcName}`);
});

// 4. ADICIONAR PREFIXO EM TRIGGERS
console.log('\n🎯 Adicionando prefixo em Triggers...');
TRIGGERS.forEach(triggerName => {
  // CREATE TRIGGER
  sql = sql.replace(
    new RegExp(`CREATE TRIGGER ${triggerName}`, 'g'),
    `CREATE TRIGGER lifetracker_${triggerName}`
  );

  console.log(`  ✅ ${triggerName} → lifetracker_${triggerName}`);
});

// 5. ADICIONAR PREFIXO EM INDEXES
console.log('\n📑 Adicionando prefixo em Indexes...');
INDEXES.forEach(indexName => {
  // CREATE INDEX
  sql = sql.replace(
    new RegExp(`CREATE INDEX ${indexName}`, 'g'),
    `CREATE INDEX lifetracker_${indexName}`
  );

  console.log(`  ✅ ${indexName} → lifetracker_${indexName}`);
});

// 6. ADICIONAR PREFIXO EM MATERIALIZED VIEWS
console.log('\n👁️  Adicionando prefixo em Materialized Views...');
MATERIALIZED_VIEWS.forEach(viewName => {
  // CREATE MATERIALIZED VIEW
  sql = sql.replace(
    new RegExp(`CREATE MATERIALIZED VIEW public\\.${viewName}`, 'g'),
    `CREATE MATERIALIZED VIEW public.lifetracker_${viewName}`
  );

  // REFRESH MATERIALIZED VIEW
  sql = sql.replace(
    new RegExp(`REFRESH MATERIALIZED VIEW CONCURRENTLY public\\.${viewName}`, 'g'),
    `REFRESH MATERIALIZED VIEW CONCURRENTLY public.lifetracker_${viewName}`
  );

  // CREATE UNIQUE INDEX ON view
  sql = sql.replace(
    new RegExp(`CREATE UNIQUE INDEX ON public\\.${viewName}`, 'g'),
    `CREATE UNIQUE INDEX ON public.lifetracker_${viewName}`
  );

  // SELECT FROM view
  sql = sql.replace(
    new RegExp(`FROM public\\.${viewName}(?!\\w)`, 'g'),
    `FROM public.lifetracker_${viewName}`
  );

  // Alias (ex: ams in get_admin_metrics)
  sql = sql.replace(
    new RegExp(`public\\.${viewName} ams`, 'g'),
    `public.lifetracker_${viewName} ams`
  );

  console.log(`  ✅ ${viewName} → lifetracker_${viewName}`);
});

// 7. FIX: TG_TABLE_NAME comparisons dentro de functions
console.log('\n🔧 Ajustando comparações TG_TABLE_NAME...');
TABLES.forEach(tableName => {
  // IF TG_TABLE_NAME = 'table'
  sql = sql.replace(
    new RegExp(`TG_TABLE_NAME = '${tableName}'`, 'g'),
    `TG_TABLE_NAME = 'lifetracker_${tableName}'`
  );
  console.log(`  ✅ TG_TABLE_NAME = '${tableName}' → 'lifetracker_${tableName}'`);
});

// Salvar arquivo modificado
console.log(`\n💾 Salvando arquivo modificado em: ${OUTPUT_FILE}`);
fs.writeFileSync(OUTPUT_FILE, sql, 'utf8');

const newLength = sql.length;
const diff = newLength - originalLength;

console.log(`\n✅ Processamento concluído!`);
console.log(`   Tamanho original: ${originalLength} bytes`);
console.log(`   Tamanho novo: ${newLength} bytes`);
console.log(`   Diferença: +${diff} bytes (devido aos prefixos adicionados)`);
console.log(`\n📄 Arquivo salvo: ${OUTPUT_FILE}`);
console.log(`\n🚀 Próximo passo: Executar o SQL no Supabase`);
console.log(`   node scripts/apply-migration-to-supabase.js`);
