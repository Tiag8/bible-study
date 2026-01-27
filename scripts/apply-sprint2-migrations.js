#!/usr/bin/env node

/**
 * Script para aplicar as 3 migrations do Sprint 2 ao Supabase
 *
 * Migrations:
 * 1. 20260127_001_add_fulltext_search.sql - Full-Text Search
 * 2. 20260127_002_add_soft_delete.sql - Soft Delete
 * 3. 20260127_003_add_link_validation_trigger.sql - Link Validation Trigger
 *
 * Usa conexão direta PostgreSQL via DATABASE_URL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Erro: DATABASE_URL não encontrada');
  console.error('   Verifique se .env.local existe e contém DATABASE_URL');
  process.exit(1);
}

// Migrations a aplicar
const MIGRATIONS = [
  '20260127_001_add_fulltext_search.sql',
  '20260127_002_add_soft_delete.sql',
  '20260127_003_add_link_validation_trigger.sql'
];

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║              Sprint 2 Migrations - Bible Study                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

async function applyMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao Supabase...');
    await client.connect();
    console.log('✅ Conectado!\n');

    // Aplicar cada migration
    for (let i = 0; i < MIGRATIONS.length; i++) {
      const migrationFile = MIGRATIONS[i];
      const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);

      console.log(`\n${'═'.repeat(60)}`);
      console.log(`📋 Migration ${i + 1}/${MIGRATIONS.length}: ${migrationFile}`);
      console.log(`${'═'.repeat(60)}\n`);

      // Verificar se arquivo existe
      if (!fs.existsSync(migrationPath)) {
        throw new Error(`Arquivo não encontrado: ${migrationPath}`);
      }

      // Ler SQL
      console.log('📖 Lendo arquivo SQL...');
      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log(`✅ ${sql.length} bytes\n`);

      // Executar
      console.log('⚙️  Executando migration...');
      const startTime = Date.now();

      try {
        await client.query(sql);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Executada com sucesso em ${duration}s\n`);
      } catch (error) {
        console.error(`❌ Erro ao executar migration: ${error.message}`);

        // Se foi um erro de sintaxe, mostrar mais contexto
        if (error.position) {
          console.error(`   Posição: ${error.position}`);
          const lines = sql.split('\n');
          const errorLine = sql.substring(0, error.position).split('\n').length;
          console.error(`   Linha: ${errorLine}`);
          if (errorLine <= lines.length) {
            console.error(`   Conteúdo: ${lines[errorLine - 1]}`);
          }
        }

        throw error;
      }
    }

    // Validar resultado
    console.log(`\n${'═'.repeat(60)}`);
    console.log('🔍 Validando objetos criados...');
    console.log(`${'═'.repeat(60)}\n`);

    // Contar tabelas com prefixo bible_
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'bible_%'
    `);
    const tableCount = parseInt(tablesResult.rows[0].count);
    console.log(`📊 Tabelas (prefixo bible_): ${tableCount}`);

    // Contar functions
    const functionsResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname LIKE 'bible_%'
    `);
    const functionCount = parseInt(functionsResult.rows[0].count);
    console.log(`⚙️  Functions (prefixo bible_): ${functionCount}`);

    // Contar triggers
    const triggersResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_trigger
      WHERE tgname LIKE 'before_%bible%'
    `);
    const triggerCount = parseInt(triggersResult.rows[0].count);
    console.log(`🎯 Triggers: ${triggerCount}`);

    // Listar tabelas sprint 2
    console.log('\n📊 Tabelas modificadas/criadas:');
    const tablesList = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('bible_studies', 'bible_study_links', 'bible_tags')
      ORDER BY table_name
    `);
    tablesList.rows.forEach((row) => {
      console.log(`   ✅ ${row.table_name}`);
    });

    // Verificar índices
    console.log('\n🔍 Índices criados:');
    const indexesResult = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname LIKE '%bible_%'
      AND indexname LIKE '%search%' OR indexname LIKE '%delete%' OR indexname LIKE '%link%'
      ORDER BY indexname
    `);
    if (indexesResult.rows.length > 0) {
      indexesResult.rows.forEach((row) => {
        console.log(`   ✅ ${row.indexname}`);
      });
    } else {
      console.log('   (Índices em validação)');
    }

    console.log('\n✅ Validação concluída!');
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  🎉 Migrations Aplicadas com Sucesso!         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    console.log('\n📝 Próximos passos:');
    console.log('   1. ⚠️  IMPORTANTE: Atualizar RLS policies manualmente no Dashboard');
    console.log('      → Adicionar filtro `deleted_at IS NULL` em SELECT policies de bible_studies');
    console.log('   2. Regenerar tipos TypeScript: npm run generate:types');
    console.log('   3. Testar aplicação: npm run dev');
    console.log('   4. Validar FTS: usar hook useSearch');
    console.log('   5. Validar Soft Delete: usar hook useSoftDelete');

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migrations:');
    console.error(error.message);

    if (error.detail) {
      console.error('\n📋 Detalhes:');
      console.error(error.detail);
    }

    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

// Executar
applyMigrations();
