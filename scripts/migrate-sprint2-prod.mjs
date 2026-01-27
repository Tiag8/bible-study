#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const MIGRATIONS = [
  '20260127_001_add_fulltext_search.sql',
  '20260127_002_add_soft_delete.sql',
  '20260127_003_add_link_validation_trigger.sql'
];

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║         Sprint 2 - Apply Migrations to Supabase                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

async function applyMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    for (let i = 0; i < MIGRATIONS.length; i++) {
      const migrationFile = MIGRATIONS[i];
      const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);

      console.log(`\n${'═'.repeat(60)}`);
      console.log(`📋 Migration ${i + 1}/${MIGRATIONS.length}: ${migrationFile}`);
      console.log(`${'═'.repeat(60)}\n`);

      if (!fs.existsSync(migrationPath)) {
        throw new Error(`File not found: ${migrationPath}`);
      }

      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log('📖 Reading SQL file...');
      console.log(`✅ ${sql.length} bytes\n`);

      console.log('⚙️  Executing migration...');
      const startTime = Date.now();

      try {
        await client.query(sql);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Success in ${duration}s\n`);
      } catch (error) {
        console.error(`❌ Error: ${error.message}\n`);
        throw error;
      }
    }

    // Validate
    console.log(`\n${'═'.repeat(60)}`);
    console.log('🔍 Validating objects created...');
    console.log(`${'═'.repeat(60)}\n`);

    const result = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name LIKE 'bible_%') as tables_count,
        (SELECT COUNT(*) FROM pg_proc p
         JOIN pg_namespace n ON p.pronamespace = n.oid
         WHERE n.nspname = 'public' AND p.proname LIKE 'bible_%') as functions_count,
        (SELECT COUNT(*) FROM pg_trigger
         WHERE tgname LIKE 'before_%') as triggers_count;
    `);

    const { tables_count, functions_count, triggers_count } = result.rows[0];
    console.log(`📊 Tables (prefix bible_): ${tables_count}`);
    console.log(`⚙️  Functions (prefix bible_): ${functions_count}`);
    console.log(`🎯 Triggers (BEFORE): ${triggers_count}`);

    // List tables
    console.log('\n📊 Modified tables:');
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('bible_studies', 'bible_study_links', 'bible_tags')
      ORDER BY table_name;
    `);

    tablesResult.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    console.log('\n✅ Validation complete!');
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                 🎉 Migrations Applied Successfully!           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    console.log('\n📝 Next steps:');
    console.log('   1. ⚠️  IMPORTANT: Update RLS policies manually');
    console.log('      → Add filter: AND deleted_at IS NULL');
    console.log('   2. Regenerate types: npm run generate:types');
    console.log('   3. Test: npm run dev');
    console.log('   4. Build: npm run build');

  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.message);
    if (error.detail) console.error(`Details: ${error.detail}`);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed');
  }
}

applyMigrations();
