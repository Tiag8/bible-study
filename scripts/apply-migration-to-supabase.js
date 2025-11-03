#!/usr/bin/env node

/**
 * Script para aplicar a migration com prefixo lifetracker_ no novo Supabase
 *
 * Usa conexão direta PostgreSQL para executar o SQL
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
dotenv.config();

const SQL_FILE = path.join(__dirname, '../supabase/lifetracker-consolidated-migration.sql');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Erro: DATABASE_URL não encontrada no .env');
  console.error('   Configure a variável DATABASE_URL com a connection string do PostgreSQL');
  process.exit(1);
}

console.log('🚀 Aplicando migration no novo Supabase...\n');
console.log(`📁 Arquivo SQL: ${SQL_FILE}`);
console.log(`🔗 Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`); // Ocultar senha

async function applyMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado!\n');

    // Ler arquivo SQL
    console.log('📖 Lendo arquivo SQL...');
    const sql = fs.readFileSync(SQL_FILE, 'utf8');
    console.log(`✅ ${sql.length} bytes lidos\n`);

    // Executar SQL
    console.log('⚙️  Executando migration...');
    console.log('   (Isso pode levar 1-2 minutos)\n');

    const startTime = Date.now();
    await client.query(sql);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Migration executada com sucesso em ${duration}s!\n`);

    // Validar objetos criados
    console.log('🔍 Validando objetos criados...\n');

    // Contar tabelas
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'lifetracker_%'
    `);
    const tableCount = parseInt(tablesResult.rows[0].count);
    console.log(`📊 Tabelas criadas: ${tableCount} (esperado: 21)`);

    // Contar functions
    const functionsResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname LIKE 'lifetracker_%'
    `);
    const functionCount = parseInt(functionsResult.rows[0].count);
    console.log(`⚙️  Functions criadas: ${functionCount} (esperado: 11)`);

    // Contar triggers
    const triggersResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_trigger
      WHERE tgname LIKE 'lifetracker_%'
    `);
    const triggerCount = parseInt(triggersResult.rows[0].count);
    console.log(`🎯 Triggers criados: ${triggerCount} (esperado: 12)`);

    // Contar ENUMs
    const enumsResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_type t
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public'
      AND t.typname LIKE 'lifetracker_%'
      AND t.typtype = 'e'
    `);
    const enumCount = parseInt(enumsResult.rows[0].count);
    console.log(`📋 ENUMs criados: ${enumCount} (esperado: 5)`);

    // Listar todas as tabelas criadas
    console.log('\n📊 Tabelas criadas:');
    const tablesList = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'lifetracker_%'
      ORDER BY table_name
    `);
    tablesList.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });

    // Verificar RLS
    console.log('\n🔒 Verificando RLS (Row Level Security)...');
    const rlsResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename LIKE 'lifetracker_%'
      AND rowsecurity = true
    `);
    const rlsCount = parseInt(rlsResult.rows[0].count);
    console.log(`   ✅ RLS habilitado em ${rlsCount}/${tableCount} tabelas`);

    // Verificar policies
    const policiesResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename LIKE 'lifetracker_%'
    `);
    const policiesCount = parseInt(policiesResult.rows[0].count);
    console.log(`   ✅ ${policiesCount} policies criadas`);

    console.log('\n✅ Validação concluída!');
    console.log('\n🎉 Migration aplicada com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Atualizar código da aplicação para usar nomes com prefixo');
    console.log('   2. Gerar types TypeScript atualizado');
    console.log('   3. Testar aplicação localmente');

    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      duration_seconds: parseFloat(duration),
      objects_created: {
        tables: tableCount,
        functions: functionCount,
        triggers: triggerCount,
        enums: enumCount,
        policies: policiesCount
      },
      rls_enabled: rlsCount,
      tables_list: tablesList.rows.map(r => r.table_name),
      status: 'success'
    };

    const reportPath = path.join(__dirname, '../migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Relatório salvo: ${reportPath}`);

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migration:');
    console.error(error);

    // Salvar log de erro
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      status: 'error'
    };

    const errorPath = path.join(__dirname, '../migration-error.json');
    fs.writeFileSync(errorPath, JSON.stringify(errorLog, null, 2));
    console.error(`\n💾 Log de erro salvo: ${errorPath}`);

    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

// Executar
applyMigration();
