#!/usr/bin/env node

/**
 * Script de migração completa: Auth User + Dados
 *
 * Passo 1: Criar usuário em auth.users no novo Supabase (com mesmo UUID)
 * Passo 2: Migrar dados das tabelas public.*
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configuração Lovable Supabase (origem)
const LOVABLE_CONFIG = {
  url: 'https://fjddlffnlbrhgogkyplq.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eXFrc3RqZ2RwbHpobnBwZGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjM0NjQsImV4cCI6MjA3NDk5OTQ2NH0.wSZ9ucFAvQshnkZgF5EI6CumqmVyPujm4nXJsmMvt08',
  auth: {
    email: 'tiag8guimaraes@gmail.com',
    password: '123456'
  }
};

// Configuração Novo Supabase (destino)
const NEW_SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  databaseUrl: process.env.DATABASE_URL
};

console.log('🚀 Migração Completa: Auth User + Dados\n');

// Validar configurações
if (!NEW_SUPABASE_CONFIG.url || !NEW_SUPABASE_CONFIG.serviceRoleKey || !NEW_SUPABASE_CONFIG.databaseUrl) {
  console.error('❌ Erro: Variáveis de ambiente faltando (.env)');
  process.exit(1);
}

// Criar clientes
const lovableClient = createClient(LOVABLE_CONFIG.url, LOVABLE_CONFIG.anonKey);
const newSupabaseClient = createClient(NEW_SUPABASE_CONFIG.url, NEW_SUPABASE_CONFIG.serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function migrateUserAndData() {
  try {
    // 1. Autenticar no Lovable para pegar user_id
    console.log('🔑 Autenticando no Lovable Supabase...');
    const { data: authData, error: authError } = await lovableClient.auth.signInWithPassword({
      email: LOVABLE_CONFIG.auth.email,
      password: LOVABLE_CONFIG.auth.password
    });

    if (authError) throw new Error(`Erro ao autenticar: ${authError.message}`);

    const lovableUserId = authData.user.id;
    const lovableUserEmail = authData.user.email;

    console.log(`✅ Autenticado como: ${lovableUserEmail}`);
    console.log(`   User ID: ${lovableUserId}\n`);

    // 2. Criar usuário no novo Supabase com mesmo UUID
    console.log('👤 Criando usuário no novo Supabase...');
    console.log(`   Usando PostgreSQL direto para criar com UUID específico\n`);

    const pgClient = new Client({
      connectionString: NEW_SUPABASE_CONFIG.databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    await pgClient.connect();

    // Verificar se usuário já existe
    const checkUser = await pgClient.query(
      `SELECT id FROM auth.users WHERE id = $1`,
      [lovableUserId]
    );

    if (checkUser.rows.length > 0) {
      console.log('   ℹ️  Usuário já existe no novo Supabase (pulando criação)\n');
    } else {
      // Criar usuário em auth.users com mesmo UUID
      const encryptedPassword = `$2a$10$DUMMY_HASH_WILL_BE_RESET_LATER`; // Hash temporário
      const now = new Date().toISOString();

      await pgClient.query(`
        INSERT INTO auth.users (
          id,
          instance_id,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          aud,
          role,
          raw_app_meta_data,
          raw_user_meta_data,
          is_super_admin,
          confirmation_token,
          email_change_token_new,
          recovery_token
        ) VALUES (
          $1,
          '00000000-0000-0000-0000-000000000000',
          $2,
          $3,
          $4,
          $4,
          $4,
          'authenticated',
          'authenticated',
          '{"provider":"email","providers":["email"]}',
          '{"full_name":"${lovableUserEmail.split('@')[0]}"}',
          false,
          '',
          '',
          ''
        )
      `, [lovableUserId, lovableUserEmail, encryptedPassword, now]);

      console.log('   ✅ Usuário criado em auth.users\n');

      // Criar identity
      await pgClient.query(`
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          created_at,
          updated_at
        ) VALUES (
          $1,
          $1,
          $2,
          'email',
          $3,
          $3
        )
      `, [
        lovableUserId,
        JSON.stringify({ sub: lovableUserId, email: lovableUserEmail }),
        now
      ]);

      console.log('   ✅ Identity criada\n');
    }

    await pgClient.end();

    console.log('✅ Usuário pronto no novo Supabase!\n');
    console.log('⚠️  IMPORTANTE: Redefina a senha do usuário no Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/fjddlffnlbrhgogkyplq/auth/users\n`);

    // 3. Agora migrar dados
    console.log('📊 Iniciando migração de dados...\n');

    // Usar o script de migração existente aqui ou reimplementar
    console.log('🎯 Execute agora: node scripts/migrate-data-from-lovable.js');
    console.log('   (O user_id já existe, então deve funcionar)\n');

  } catch (error) {
    console.error('\n❌ Erro:');
    console.error(error);
    process.exit(1);
  }
}

migrateUserAndData();
