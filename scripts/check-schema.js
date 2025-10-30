#!/usr/bin/env node

/**
 * Script genérico para verificar schema de tabelas Supabase
 *
 * Uso:
 *   node scripts/check-schema.js <tabela1> [tabela2] [...]
 *
 * Exemplos:
 *   node scripts/check-schema.js users
 *   node scripts/check-schema.js users profiles posts
 *
 * Requisitos:
 *   - .env com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 *   - @supabase/supabase-js instalado
 *   - dotenv instalado
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validar variáveis de ambiente
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos no .env');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Obter tabelas da linha de comando
const tables = process.argv.slice(2);

if (tables.length === 0) {
  console.error('❌ Erro: Forneça pelo menos uma tabela para verificar');
  console.log('\nUso: node scripts/check-schema.js <tabela1> [tabela2] [...]\n');
  console.log('Exemplos:');
  console.log('  node scripts/check-schema.js users');
  console.log('  node scripts/check-schema.js users profiles posts\n');
  process.exit(1);
}

console.log(`🔍 Verificando schema de ${tables.length} tabela(s)...\n`);

async function checkSchema() {
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    console.log(`${i + 1}️⃣ Tabela: ${table}`);

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ Erro: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`✅ Colunas: ${Object.keys(data[0]).join(', ')}`);
      console.log(`📊 Exemplo:\n${JSON.stringify(data[0], null, 2)}`);
    } else {
      console.log('⚠️ Tabela vazia (sem dados)');
    }

    if (i < tables.length - 1) {
      console.log(''); // Linha em branco entre tabelas
    }
  }

  // Testar ANON_KEY se disponível
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    console.log('\n3️⃣ Testando VITE_SUPABASE_ANON_KEY...');
    const anonClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: testData, error: testErr } = await anonClient
      .from(tables[0])
      .select('id')
      .limit(1);

    if (testErr) {
      console.error(`❌ ANON_KEY não funciona: ${testErr.message}`);
    } else {
      console.log('✅ ANON_KEY funciona!');
    }
  }
}

checkSchema();
