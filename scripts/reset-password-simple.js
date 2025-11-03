/**
 * Script simples para resetar senha do usuário usando SQL direto
 *
 * Este script:
 * 1. Conecta diretamente ao PostgreSQL do novo Supabase
 * 2. Gera um novo bcrypt hash para a senha fornecida
 * 3. Atualiza o encrypted_password do usuário
 *
 * Uso: node scripts/reset-password-simple.js
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const { Client } = pg;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const USER_UUID = 'c68aac85-0829-4eed-9c32-ef09b28e4cc3';
const USER_EMAIL = 'tiag8guimaraes@gmail.com';

// Parse DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;

async function resetPassword() {
  console.log('🔐 RESETAR SENHA DO USUÁRIO\n');
  console.log('=' .repeat(60));

  let client = null;

  try {
    // 1. Solicitar nova senha
    console.log(`\n📝 Usuário: ${USER_EMAIL}`);
    console.log(`   UUID: ${USER_UUID}\n`);

    const newPassword = await question('Digite a nova senha (mínimo 6 caracteres): ');

    if (newPassword.length < 6) {
      console.error('❌ Senha muito curta. Mínimo 6 caracteres.');
      rl.close();
      return;
    }

    // 2. Gerar bcrypt hash
    console.log('\n1️⃣ Gerando hash bcrypt da senha...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    console.log('✅ Hash gerado');

    // 3. Conectar ao banco
    console.log('\n2️⃣ Conectando ao banco de dados...');
    client = new Client({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await client.connect();
    console.log('✅ Conectado');

    // 4. Verificar se usuário existe
    console.log('\n3️⃣ Verificando usuário...');
    const checkResult = await client.query(`
      SELECT id, email, email_confirmed_at
      FROM auth.users
      WHERE id = $1
    `, [USER_UUID]);

    if (checkResult.rows.length === 0) {
      console.error('❌ Usuário não encontrado no banco de dados');
      console.log('\n💡 O usuário pode ter sido deletado. Execute:');
      console.log('   node scripts/fix-user-uuid.js');
      rl.close();
      return;
    }

    console.log('✅ Usuário encontrado');

    // 5. Atualizar senha
    console.log('\n4️⃣ Atualizando senha...');
    await client.query(`
      UPDATE auth.users
      SET
        encrypted_password = $1,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
      WHERE id = $2
    `, [passwordHash, USER_UUID]);

    console.log('✅ Senha atualizada com sucesso!');

    // 6. Verificar auth.identities
    console.log('\n5️⃣ Verificando auth.identities...');
    const identityCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM auth.identities
      WHERE user_id = $1
    `, [USER_UUID]);

    if (parseInt(identityCheck.rows[0].count) === 0) {
      console.log('⚠️  auth.identities não encontrado. Criando...');
      await client.query(`
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          $1,
          jsonb_build_object('sub', $1::text, 'email', $2),
          'email',
          NULL,
          NOW(),
          NOW()
        )
      `, [USER_UUID, USER_EMAIL]);
      console.log('✅ auth.identities criado');
    } else {
      console.log('✅ auth.identities já existe');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ SENHA RESETADA COM SUCESSO!\n');
    console.log('📝 Agora você pode fazer login com:');
    console.log(`   Email: ${USER_EMAIL}`);
    console.log(`   Senha: ${newPassword}`);
    console.log('\n💡 Acesse: http://localhost:8080');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (client) {
      await client.end();
    }
    rl.close();
  }
}

resetPassword();
