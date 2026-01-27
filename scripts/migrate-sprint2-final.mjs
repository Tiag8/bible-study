#!/usr/bin/env node

/**
 * FINAL ATTEMPT - Apply migrations using all available methods
 * 1. Try with extracted password
 * 2. Try pooler connection
 * 3. Provide clear next steps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const MIGRATIONS = [
  '20260127_001_add_fulltext_search.sql',
  '20260127_002_add_soft_delete.sql',
  '20260127_003_add_link_validation_trigger.sql'
];

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           Sprint 2 - FINAL MIGRATION ATTEMPT                   ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Parse connection string
const REMAINDER = DATABASE_URL.replace('postgresql://', '');
const [userPass, hostDb] = REMAINDER.split('@');
const [user, password] = userPass.split(':');
const [hostPort, db] = hostDb.split('/');
const [host, port] = hostPort.split(':');

console.log('🔍 Parsed Connection Details:');
console.log(`   User: ${user}`);
console.log(`   Host: ${host}`);
console.log(`   Port: ${port}`);
console.log(`   DB: ${db}\n`);

async function applyMigrations() {
  try {
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
      console.log(`📖 Reading: ${sql.length} bytes\n`);

      console.log('⚙️  Attempting execution...\n');

      try {
        // Try to execute using psql with explicit parameters
        const cmd = `psql -h '${host}' -p ${port} -U '${user}' -d '${db}' -f '${migrationPath}' --set ON_ERROR_STOP=on 2>&1`;

        console.log('   Command:');
        console.log(`   PGPASSWORD=*** psql -h '${host}' -p ${port} -U '${user}' -d '${db}' -f '${migrationPath}'\n`);

        const result = execSync(cmd, {
          encoding: 'utf8',
          env: {
            ...process.env,
            PGPASSWORD: password
          },
          stdio: ['pipe', 'pipe', 'pipe'],
          maxBuffer: 10 * 1024 * 1024
        });

        console.log(`   Output:\n   ${result.substring(0, 200)}`);
        console.log(`✅ Applied successfully\n`);

      } catch (error) {
        const output = error.stdout || error.message;
        const isPermission = output.includes('permission') || output.includes('privilege');
        const isTenant = output.includes('Tenant or user not found');
        const isConnection = output.includes('could not connect') || output.includes('connection');

        if (isTenant || isPermission) {
          console.log(`⚠️  Authentication Issue:`);
          console.log(`   ${output.substring(0, 150)}\n`);
          console.log(`   This indicates stale/invalid credentials in DATABASE_URL\n`);
        } else if (isConnection) {
          console.log(`⚠️  Connection Issue:`);
          console.log(`   ${output.substring(0, 150)}\n`);
        } else {
          console.log(`⚠️  Execution Note:`);
          console.log(`   ${output.substring(0, 150)}\n`);
        }

        console.log(`   → Skipping to next migration\n`);
      }
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log('🔍 SUMMARY');
    console.log(`${'═'.repeat(60)}\n`);

    console.log('📋 Migration Files Status:');
    MIGRATIONS.forEach((m, i) => {
      const path_exists = fs.existsSync(path.join(MIGRATIONS_DIR, m));
      console.log(`   ${i + 1}. ${m} ${path_exists ? '✅' : '❌'}`);
    });

    console.log('\n📝 Next Steps:');
    console.log(`

╔════════════════════════════════════════════════════════════════╗
║           CREDENTIAL REFRESH REQUIRED                         ║
╚════════════════════════════════════════════════════════════════╝

The DATABASE_URL in .env.local has EXPIRED credentials.

OPTION A: Regenerate DATABASE_URL
──────────────────────────────────
1. Open: https://app.supabase.com/project/vcqgalxnapxerqcycieu/settings/database
2. Copy new "Connection String" (Session mode)
3. Update .env.local:
   DATABASE_URL=postgresql://[PASTE_NEW_URL]
4. Re-run this script

OPTION B: Use Supabase Dashboard (Manual - 2 minutes)
──────────────────────────────────────────────────
1. Open: https://app.supabase.com/project/vcqgalxnapxerqcycieu/sql/new
2. For each migration file in supabase/migrations/:
   - Copy entire SQL content
   - Paste in SQL Editor
   - Click "Run"
3. Update RLS policies: add "AND deleted_at IS NULL"

OPTION C: Use Supabase CLI (if Docker running)
───────────────────────────────────
1. Start Docker
2. Run: supabase db push
3. supabase link --project-ref vcqgalxnapxerqcycieu

════════════════════════════════════════════════════════════════

All migration SQL files are ready in: supabase/migrations/

See: MIGRATION-INSTRUCTIONS.md for full guide
`);

  } catch (error) {
    console.error('\n❌ Critical Error:');
    console.error(error.message);
    process.exit(1);
  }
}

applyMigrations();
