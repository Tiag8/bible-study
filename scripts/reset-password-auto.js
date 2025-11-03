/**
 * Script automático para resetar senha do usuário para "123456"
 *
 * Define a mesma senha que você usava no Lovable Cloud
 *
 * Uso: node scripts/reset-password-auto.js
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const USER_UUID = 'c68aac85-0829-4eed-9c32-ef09b28e4cc3';
const USER_EMAIL = 'tiag8guimaraes@gmail.com';
const NEW_PASSWORD = '123456'; // Mesma senha do Lovable

const DATABASE_URL = process.env.DATABASE_URL;

async function resetPassword() {
  console.log('🔐 RESETAR SENHA AUTOMÁTICO\n');
  console.log('=' .repeat(60));

  let client = null;

  try {
    console.log(`\n📝 Usuário: ${USER_EMAIL}`);
    console.log(`   UUID: ${USER_UUID}`);
    console.log(`   Nova senha: ${NEW_PASSWORD}\n`);

    // 1. Gerar bcrypt hash
    console.log('1️⃣ Gerando hash bcrypt da senha...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, saltRounds);
    console.log('✅ Hash gerado:', passwordHash.substring(0, 30) + '...');

    // 2. Conectar ao banco
    console.log('\n2️⃣ Conectando ao banco de dados...');
    client = new Client({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await client.connect();
    console.log('✅ Conectado');

    // 3. Verificar se usuário existe
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
      return;
    }

    const user = checkResult.rows[0];
    console.log('✅ Usuário encontrado');
    console.log('   Email:', user.email);
    console.log('   Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não');

    // 4. Atualizar senha
    console.log('\n4️⃣ Atualizando senha no auth.users...');
    await client.query(`
      UPDATE auth.users
      SET
        encrypted_password = $1,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
      WHERE id = $2
    `, [passwordHash, USER_UUID]);

    console.log('✅ Senha atualizada com sucesso!');

    // 5. Verificar e criar auth.identities se necessário
    console.log('\n5️⃣ Verificando auth.identities...');
    const identityCheck = await client.query(`
      SELECT id, provider
      FROM auth.identities
      WHERE user_id = $1
    `, [USER_UUID]);

    if (identityCheck.rows.length === 0) {
      console.log('⚠️  auth.identities não encontrado. Criando...');

      const identityId = `${USER_UUID}`;

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
          $1,
          $2,
          jsonb_build_object('sub', $2::text, 'email', $3, 'email_verified', true, 'provider', 'email'),
          'email',
          NULL,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING
      `, [identityId, USER_UUID, USER_EMAIL]);

      console.log('✅ auth.identities criado');
    } else {
      console.log('✅ auth.identities já existe');
      console.log('   Provider:', identityCheck.rows[0].provider);
    }

    // 6. Verificação final
    console.log('\n6️⃣ Verificação final...');
    const finalCheck = await client.query(`
      SELECT
        u.id,
        u.email,
        u.encrypted_password IS NOT NULL as has_password,
        u.email_confirmed_at IS NOT NULL as email_confirmed,
        (SELECT COUNT(*) FROM auth.identities WHERE user_id = u.id) as identity_count
      FROM auth.users u
      WHERE u.id = $1
    `, [USER_UUID]);

    const status = finalCheck.rows[0];
    console.log('✅ Status do usuário:');
    console.log('   Tem senha:', status.has_password ? 'Sim' : 'Não');
    console.log('   Email confirmado:', status.email_confirmed ? 'Sim' : 'Não');
    console.log('   Identities:', status.identity_count);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SENHA RESETADA COM SUCESSO!\n');
    console.log('📝 Credenciais para login:');
    console.log(`   Email: ${USER_EMAIL}`);
    console.log(`   Senha: ${NEW_PASSWORD}`);
    console.log('\n💡 Acesse: http://localhost:8080');
    console.log('\n🔄 Próximos passos:');
    console.log('   1. Faça login com as credenciais acima');
    console.log('   2. Se funcionar, todos os dados já estão migrados!');
    console.log('   3. Se precisar, mude a senha dentro da aplicação');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Detalhes:', error);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

resetPassword();
