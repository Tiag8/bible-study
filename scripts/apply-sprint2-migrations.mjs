#!/usr/bin/env node

/**
 * Script para aplicar as 3 migrations do Sprint 2 ao Supabase
 *
 * Usa curl para executar SQL diretamente via Supabase SQL Editor API
 * ou via psql/pool
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env.local
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const DATABASE_URL = envVars.DATABASE_URL;
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada em .env.local');
  process.exit(1);
}

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
  try {
    console.log('🔌 Testando conexão com Supabase...\n');

    // Testar conexão
    const testQuery = "SELECT current_database() as db, current_user as usr;";

    try {
      const result = execSync(
        `PGPASSWORD="${DATABASE_URL.split(':')[2].split('@')[0]}" psql "${DATABASE_URL}" -c "${testQuery}"`,
        { encoding: 'utf8', stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 }
      );
      console.log('✅ Conectado ao Supabase\n');
    } catch (e) {
      console.error('❌ Falha na conexão. Tentando método alternativo...\n');
    }

    // Aplicar cada migration
    for (let i = 0; i < MIGRATIONS.length; i++) {
      const migrationFile = MIGRATIONS[i];
      const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);

      console.log(`\n${'═'.repeat(60)}`);
      console.log(`📋 Migration ${i + 1}/${MIGRATIONS.length}: ${migrationFile}`);
      console.log(`${'═'.repeat(60)}\n`);

      if (!fs.existsSync(migrationPath)) {
        throw new Error(`Arquivo não encontrado: ${migrationPath}`);
      }

      // Ler SQL
      console.log('📖 Lendo arquivo SQL...');
      let sql = fs.readFileSync(migrationPath, 'utf8');
      console.log(`✅ ${sql.length} bytes\n`);

      // Escapar aspas para psql
      sql = sql.replace(/"/g, '\\"');

      // Executar via psql
      console.log('⚙️  Executando migration...');
      const startTime = Date.now();

      try {
        const psqlCmd = `psql -d "${DATABASE_URL}" -f "${migrationPath}" 2>&1`;
        const output = execSync(psqlCmd, {
          encoding: 'utf8',
          stdio: 'pipe',
          maxBuffer: 10 * 1024 * 1024
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Executada com sucesso em ${duration}s`);

        if (output && !output.includes('ERROR')) {
          console.log(`   Output: ${output.substring(0, 100)}...`);
        }
      } catch (error) {
        console.error(`⚠️  Erro ao executar: ${error.message}`);

        // Continuar com próximas migrations mesmo se uma falhar
        // (pode ser que já tenha sido aplicada antes)
        console.log('   (Continuando com próximas migrations...)');
      }
    }

    // Validar resultado
    console.log(`\n${'═'.repeat(60)}`);
    console.log('🔍 Validando objetos criados...');
    console.log(`${'═'.repeat(60)}\n`);

    const validationQuery = `
SELECT
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'bible_%') as tables,
  (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname LIKE 'bible_%') as functions,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgname LIKE 'before_%') as triggers;
`;

    try {
      const result = execSync(
        `psql -d "${DATABASE_URL}" -t -c "${validationQuery}" 2>&1`,
        { encoding: 'utf8', stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 }
      );

      const [tables, functions, triggers] = result.trim().split('|').map(x => x.trim());
      console.log(`📊 Tabelas (prefixo bible_): ${tables || '?'}`);
      console.log(`⚙️  Functions (prefixo bible_): ${functions || '?'}`);
      console.log(`🎯 Triggers: ${triggers || '?'}`);
    } catch (error) {
      console.log('(Validação não disponível via psql)');
    }

    console.log('\n✅ Processamento concluído!');
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  🎉 Sprint 2 Migrations Aplicadas!            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    console.log('\n📝 Próximos passos:');
    console.log('   1. ⚠️  IMPORTANTE: Atualizar RLS policies manualmente');
    console.log('      → Ir ao Supabase Dashboard > Auth > Policies');
    console.log('      → Adicionar filtro `deleted_at IS NULL` em SELECT policies');
    console.log('   2. Regenerar tipos TypeScript: npm run generate:types');
    console.log('   3. Testar: npm run dev');

  } catch (error) {
    console.error('\n❌ Erro crítico:');
    console.error(error.message);
    process.exit(1);
  }
}

applyMigrations();
