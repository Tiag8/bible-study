#!/usr/bin/env node

/**
 * Deletar usuário atual e recriar com UUID correto do Lovable
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;

dotenv.config();

const LOVABLE_USER_ID = 'c68aac85-0829-4eed-9c32-ef09b28e4cc3';
const LOVABLE_USER_EMAIL = 'tiag8guimaraes@gmail.com';
const NEW_WRONG_USER_ID = 'f1720462-00c0-4000-8a32-360b8cfd3a74';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

console.log('🔧 Corrigindo UUID do usuário...\n');

try {
  // 1. Deletar usuário errado
  console.log(`🗑️  Deletando usuário com UUID errado (${NEW_WRONG_USER_ID})...`);

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(NEW_WRONG_USER_ID);

  if (deleteError && !deleteError.message.includes('not found')) {
    throw new Error(`Erro ao deletar usuário: ${deleteError.message}`);
  }

  console.log('✅ Usuário deletado\n');

  // 2. Criar usuário com UUID correto via SQL
  console.log(`👤 Criando usuário com UUID correto do Lovable (${LOVABLE_USER_ID})...`);

  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await pgClient.connect();

  const now = new Date().toISOString();
  const encryptedPassword = `$2a$10$dummyhashwillberesetlater1234567890abcdefghijklmnopqrstu`; // Hash bcrypt válido mas temporário

  // Verificar se usuário já existe
  const checkUser = await pgClient.query(`SELECT id FROM auth.users WHERE id = $1`, [LOVABLE_USER_ID]);

  if (checkUser.rows.length === 0) {
    // Inserir em auth.users com UUID específico
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
      '{}',
      false,
      '',
      '',
      ''
    )
    `, [LOVABLE_USER_ID, LOVABLE_USER_EMAIL, encryptedPassword, now]);

    console.log('✅ Usuário criado em auth.users\n');
  } else {
    console.log('ℹ️  Usuário já existe em auth.users (pulando criação)\n');
  }

  // Verificar se identity já existe
  const checkIdentity = await pgClient.query(`SELECT id FROM auth.identities WHERE id = $1`, [LOVABLE_USER_ID]);

  if (checkIdentity.rows.length === 0) {
    // Criar identity
  await pgClient.query(`
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      created_at,
      updated_at,
      last_sign_in_at,
      email
    ) VALUES (
      $1,
      $1,
      $1,
      $2,
      'email',
      $3,
      $3,
      $3,
      $4
    )
  `, [
    LOVABLE_USER_ID,
    JSON.stringify({ sub: LOVABLE_USER_ID, email: LOVABLE_USER_EMAIL, email_verified: false, phone_verified: false }),
    now,
    LOVABLE_USER_EMAIL
    ]);

    console.log('✅ Identity criada\n');
  } else {
    console.log('ℹ️  Identity já existe (pulando criação)\n');
  }

  await pgClient.end();

  console.log('🎉 UUID corrigido com sucesso!');
  console.log(`   User ID: ${LOVABLE_USER_ID}`);
  console.log(`   Email: ${LOVABLE_USER_EMAIL}\n`);

  console.log('⚠️  IMPORTANTE: Redefina a senha do usuário:');
  console.log('   1. Acesse: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/users');
  console.log(`   2. Encontre ${LOVABLE_USER_EMAIL}`);
  console.log('   3. Clique em "Send password recovery" ou defina senha manualmente\n');

  console.log('✅ Agora você pode executar a migração de dados:');
  console.log('   node scripts/migrate-data-from-lovable.js\n');

} catch (error) {
  console.error('\n❌ Erro:');
  console.error(error);
  process.exit(1);
}
