#!/usr/bin/env node

/**
 * Script de migração de dados do Lovable Supabase para o novo Supabase
 *
 * Usa autenticação no Lovable para ler os dados (RLS policies permitem)
 * e insere no novo Supabase usando service_role_key (bypass RLS)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configuração Lovable Supabase (origem)
const LOVABLE_CONFIG = {
  url: 'https://${SUPABASE_PROJECT_REF}.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eXFrc3RqZ2RwbHpobnBwZGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjM0NjQsImV4cCI6MjA3NDk5OTQ2NH0.wSZ9ucFAvQshnkZgF5EI6CumqmVyPujm4nXJsmMvt08',
  auth: {
    email: 'tiag8guimaraes@gmail.com',
    password: '123456'
  }
};

// Configuração Novo Supabase (destino)
const NEW_SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};

// Mapeamento de tabelas: nome_antigo → nome_novo
const TABLE_MAPPING = {
  // Core tables
  'profiles': 'lifetracker_profiles',
  'user_roles': 'lifetracker_user_roles',
  'user_onboarding': 'lifetracker_user_onboarding',
  'user_sessions': 'lifetracker_user_sessions',

  // Habits
  'habit_categories': 'lifetracker_habit_categories',
  'habits': 'lifetracker_habits',
  'habit_entries': 'lifetracker_habit_entries',
  'habit_refinements': 'lifetracker_habit_refinements',

  // Goals
  'goals': 'lifetracker_goals',
  'goal_entries': 'lifetracker_goal_entries',
  'milestones': 'lifetracker_milestones',

  // Identity & Assessments
  'identities': 'lifetracker_identities',
  'assessment_history': 'lifetracker_assessment_history',
  'assessment_responses': 'lifetracker_assessment_responses',
  'assessment_partial_progress': 'lifetracker_assessment_partial_progress',

  // AI & Coach
  'ai_suggestions': 'lifetracker_ai_suggestions',
  'coach_conversations': 'lifetracker_coach_conversations',
  'coach_messages': 'lifetracker_coach_messages',
  'coach_nudges': 'lifetracker_coach_nudges',

  // Audit
  'change_logs': 'lifetracker_change_logs',
  'entity_versions': 'lifetracker_entity_versions'
};

// Ordem de migração (respeitar foreign keys)
const MIGRATION_ORDER = [
  'profiles',           // Primeiro: perfis dos usuários
  'user_roles',         // Segundo: roles (depende de profiles)
  'user_onboarding',    // Onboarding
  'identities',         // Identidades
  'user_sessions',      // Sessões
  'habit_categories',   // Categorias de hábitos
  'habits',             // Hábitos (depende de categories, profiles)
  'habit_entries',      // Entradas de hábitos (depende de habits)
  'habit_refinements',  // Refinamentos
  'goals',              // Metas (depende de habits, profiles)
  'goal_entries',       // Entradas de metas (depende de goals)
  'milestones',         // Marcos (depende de habits)
  'assessment_history', // Histórico de assessments
  'assessment_responses', // Respostas (depende de assessment_history)
  'assessment_partial_progress', // Progresso parcial
  'ai_suggestions',     // Sugestões AI
  'coach_conversations', // Conversas
  'coach_messages',     // Mensagens (depende de conversations)
  'coach_nudges',       // Nudges
  'change_logs',        // Logs de mudanças
  'entity_versions'     // Versões de entidades
];

console.log('🚀 Iniciando migração de dados Lovable → Novo Supabase\n');

// Validar configurações
if (!NEW_SUPABASE_CONFIG.url || !NEW_SUPABASE_CONFIG.serviceRoleKey) {
  console.error('❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env');
  process.exit(1);
}

// Criar clientes Supabase
const lovableClient = createClient(LOVABLE_CONFIG.url, LOVABLE_CONFIG.anonKey);
const newSupabaseClient = createClient(NEW_SUPABASE_CONFIG.url, NEW_SUPABASE_CONFIG.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Estatísticas da migração
const stats = {
  startTime: Date.now(),
  tablesProcessed: 0,
  totalRecords: 0,
  errors: [],
  tableDetails: {}
};

async function migrateData() {
  try {
    // 1. Autenticar no Lovable
    console.log('🔑 Autenticando no Lovable Supabase...');
    const { data: authData, error: authError } = await lovableClient.auth.signInWithPassword({
      email: LOVABLE_CONFIG.auth.email,
      password: LOVABLE_CONFIG.auth.password
    });

    if (authError) {
      throw new Error(`Erro ao autenticar: ${authError.message}`);
    }

    console.log(`✅ Autenticado como: ${authData.user.email}\n`);

    // 2. Migrar cada tabela na ordem correta
    for (const oldTableName of MIGRATION_ORDER) {
      const newTableName = TABLE_MAPPING[oldTableName];

      console.log(`\n📊 Migrando: ${oldTableName} → ${newTableName}`);
      console.log('─'.repeat(60));

      try {
        // Buscar dados do Lovable
        console.log('   📥 Buscando dados do Lovable...');
        const { data: records, error: fetchError } = await lovableClient
          .from(oldTableName)
          .select('*');

        if (fetchError) {
          console.warn(`   ⚠️  Erro ao buscar ${oldTableName}: ${fetchError.message}`);
          stats.errors.push({
            table: oldTableName,
            operation: 'fetch',
            error: fetchError.message
          });
          continue;
        }

        if (!records || records.length === 0) {
          console.log('   ℹ️  Tabela vazia (0 registros)');
          stats.tableDetails[oldTableName] = { records: 0, status: 'empty' };
          continue;
        }

        console.log(`   ✅ ${records.length} registros encontrados`);

        // Inserir no novo Supabase
        console.log(`   📤 Inserindo em ${newTableName}...`);

        // Inserir em lotes de 100 (limite do Supabase)
        const batchSize = 100;
        let inserted = 0;

        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);

          const { error: insertError } = await newSupabaseClient
            .from(newTableName)
            .insert(batch);

          if (insertError) {
            console.error(`   ❌ Erro ao inserir batch ${i}-${i + batch.length}: ${insertError.message}`);
            stats.errors.push({
              table: oldTableName,
              operation: 'insert',
              batch: `${i}-${i + batch.length}`,
              error: insertError.message
            });
            // Tentar inserir registro por registro para identificar o problema
            for (const record of batch) {
              const { error: singleError } = await newSupabaseClient
                .from(newTableName)
                .insert([record]);

              if (!singleError) {
                inserted++;
              } else {
                console.error(`      ⚠️  Registro ${record.id} falhou: ${singleError.message}`);
                stats.errors.push({
                  table: oldTableName,
                  operation: 'insert_single',
                  recordId: record.id,
                  error: singleError.message
                });
              }
            }
          } else {
            inserted += batch.length;
          }
        }

        console.log(`   ✅ ${inserted}/${records.length} registros migrados`);

        stats.tablesProcessed++;
        stats.totalRecords += inserted;
        stats.tableDetails[oldTableName] = {
          records: records.length,
          inserted: inserted,
          status: inserted === records.length ? 'success' : 'partial'
        };

      } catch (tableError) {
        console.error(`   ❌ Erro na migração da tabela: ${tableError.message}`);
        stats.errors.push({
          table: oldTableName,
          operation: 'table_migration',
          error: tableError.message
        });
      }
    }

    // 3. Relatório final
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`⏱️  Duração: ${duration}s`);
    console.log(`📋 Tabelas processadas: ${stats.tablesProcessed}/${MIGRATION_ORDER.length}`);
    console.log(`📦 Total de registros migrados: ${stats.totalRecords}`);
    console.log(`❌ Erros: ${stats.errors.length}`);

    console.log('\n📊 Detalhes por tabela:');
    Object.entries(stats.tableDetails).forEach(([table, details]) => {
      const icon = details.status === 'success' ? '✅' : details.status === 'partial' ? '⚠️' : 'ℹ️';
      console.log(`   ${icon} ${table}: ${details.inserted || 0}/${details.records} registros`);
    });

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Erros encontrados:');
      stats.errors.forEach((err, i) => {
        console.log(`   ${i + 1}. [${err.table}] ${err.operation}: ${err.error}`);
      });
    }

    // Salvar relatório
    const reportPath = path.join(__dirname, '../data-migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      ...stats,
      duration: parseFloat(duration),
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`\n💾 Relatório salvo: ${reportPath}`);

    if (stats.errors.length === 0) {
      console.log('\n🎉 Migração concluída com sucesso!');
    } else {
      console.log('\n⚠️  Migração concluída com alguns erros. Verifique o relatório.');
    }

  } catch (error) {
    console.error('\n❌ Erro fatal na migração:');
    console.error(error);
    process.exit(1);
  }
}

// Executar migração
migrateData();
