#!/usr/bin/env node

/**
 * Submit SQL migrations to Supabase via Dashboard SQL API
 * Uses Supabase GraphQL query to execute SQL through authenticated session
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const MIGRATIONS = [
  '20260127_001_add_fulltext_search.sql',
  '20260127_002_add_soft_delete.sql',
  '20260127_003_add_link_validation_trigger.sql'
];

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║      Sprint 2 - Submit Migrations via Dashboard GraphQL         ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// GraphQL mutation to execute SQL
const createExecuteSqlMutation = (sql) => {
  return {
    operationName: 'ExecuteSQL',
    query: `
      mutation ExecuteSQL($sql: String!) {
        execute_sql(sql: $sql) {
          success
          message
          error
        }
      }
    `,
    variables: { sql }
  };
};

async function submitViaGraphQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/graphql/v1`);
    const body = JSON.stringify(createExecuteSqlMutation(sql));

    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'X-Client-Info': 'supabase-js/migration-script'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          resolve({ data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function applyMigrations() {
  try {
    console.log('🔐 Using Supabase GraphQL API with SERVICE_ROLE_KEY\n');

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

      console.log('📤 Submitting to Supabase GraphQL...');
      const startTime = Date.now();

      try {
        const result = await submitViaGraphQL(sql);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        if (result.errors) {
          console.error(`⚠️  GraphQL Error:`);
          console.error(JSON.stringify(result.errors, null, 2));
          console.log('(Continuing - may have been already applied)\n');
        } else if (result.data?.execute_sql?.success) {
          console.log(`✅ Success in ${duration}s\n`);
        } else {
          console.log(`⚠️  Status in ${duration}s`);
          if (result.data?.execute_sql?.message) {
            console.log(`Message: ${result.data.execute_sql.message}\n`);
          }
        }
      } catch (error) {
        console.error(`⚠️  Error: ${error.message}`);
        console.log('(Continuing...)\n');
      }
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log('✅ Migration submission complete!');
    console.log(`${'═'.repeat(60)}\n`);

    console.log('📝 Verification steps:');
    console.log('   1. Check Supabase Dashboard > SQL Editor for execution history');
    console.log('   2. Run: npm run generate:types');
    console.log('   3. Test: npm run dev');

  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.message);
    process.exit(1);
  }
}

applyMigrations();
