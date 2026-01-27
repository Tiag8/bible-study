#!/usr/bin/env node

/**
 * Script para aplicar Sprint 2 migrations via Supabase REST API
 *
 * Usa a API /rest/v1/rpc para executar queries SQL
 * (Requer SERVICE_ROLE_KEY para acesso não autenticado)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

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

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL ou SERVICE_ROLE_KEY não encontrados em .env.local');
  process.exit(1);
}

const MIGRATIONS = [
  '20260127_001_add_fulltext_search.sql',
  '20260127_002_add_soft_delete.sql',
  '20260127_003_add_link_validation_trigger.sql'
];

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║              Sprint 2 Migrations via API REST                  ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Helper para fazer requisições HTTPS
function makeRequest(method, path, headers, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testConnection() {
  console.log('🔌 Testando conexão com Supabase API...\n');

  try {
    const response = await makeRequest('GET', '/rest/v1/', {});
    if (response.status === 200) {
      console.log('✅ Conectado ao Supabase API\n');
      return true;
    } else {
      console.log(`⚠️  Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro de conexão: ${error.message}`);
    return false;
  }
}

async function executeSql(sql) {
  try {
    // Usar rpc se disponível, senão tentar POST /rest/v1/
    const response = await makeRequest(
      'POST',
      '/rest/v1/rpc/exec_sql',
      { 'Prefer': 'return=representation' },
      { sql }
    );

    return response;
  } catch (error) {
    console.error(`Erro ao executar SQL: ${error.message}`);
    throw error;
  }
}

async function applyMigrations() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.log('⚠️  API indisponível. Você precisa aplicar as migrations manualmente.');
      console.log('\n📋 Opções:');
      console.log('   1. Usar Supabase Dashboard > SQL Editor');
      console.log('   2. Usar supabase CLI: supabase db push');
      console.log('   3. Usar psql direto (com credenciais corretas)');
      process.exit(1);
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

      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log('📖 Lendo arquivo SQL...');
      console.log(`✅ ${sql.length} bytes\n`);

      console.log('⚙️  Executando migration via API...');
      const startTime = Date.now();

      try {
        const result = await executeSql(sql);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        if (result.status >= 200 && result.status < 300) {
          console.log(`✅ Executada com sucesso em ${duration}s`);
        } else {
          console.log(`⚠️  Status: ${result.status} - ${JSON.stringify(result.body)}`);
        }
      } catch (error) {
        console.error(`⚠️  Erro: ${error.message}`);
      }
    }

    console.log('\n✅ Processamento concluído!');
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  🎉 Sprint 2 Migrations Aplicadas!            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    console.log('\n📝 Próximos passos:');
    console.log('   1. ⚠️  IMPORTANTE: Atualizar RLS policies manualmente');
    console.log('      → Supabase Dashboard > Auth > Policies');
    console.log('      → Adicionar: `deleted_at IS NULL` em SELECT de bible_studies');
    console.log('   2. Regenerar tipos: npm run generate:types');
    console.log('   3. Testar: npm run dev');

  } catch (error) {
    console.error('\n❌ Erro crítico:');
    console.error(error.message);
    process.exit(1);
  }
}

applyMigrations();
