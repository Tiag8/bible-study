/**
 * Script para migrar password hash do Lovable Cloud para o novo Supabase
 *
 * Este script:
 * 1. Busca o encrypted_password do usuário no Lovable Cloud
 * 2. Atualiza o encrypted_password no novo Supabase (via SQL direto)
 * 3. Valida que a senha foi migrada corretamente
 *
 * IMPORTANTE: Este script usa SQL direto porque Admin API não permite
 * atualizar password_hash diretamente em usuários existentes.
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// Credenciais Lovable Cloud (origem)
const LOVABLE_CONFIG = {
  host: 'db.${SUPABASE_PROJECT_REF}.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'FairElephant987*', // Senha do Lovable Cloud
};

// Credenciais Novo Supabase (destino)
const NEW_SUPABASE_CONFIG = {
  host: 'db.${SUPABASE_PROJECT_REF}.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD, // Senha do .env
};

// UUID do usuário a ser migrado
const USER_UUID = 'c68aac85-0829-4eed-9c32-ef09b28e4cc3';
const USER_EMAIL = 'tiag8guimaraes@gmail.com';

async function migrarPasswordHash() {
  console.log('🔐 MIGRAÇÃO DE PASSWORD HASH\n');
  console.log('=' .repeat(60));

  let lovableClient = null;
  let newClient = null;

  try {
    // 1. Conectar ao Lovable Cloud
    console.log('\n1️⃣ Conectando ao Lovable Cloud...');
    lovableClient = new Client(LOVABLE_CONFIG);
    await lovableClient.connect();
    console.log('✅ Conectado ao Lovable Cloud');

    // 2. Buscar password hash do Lovable
    console.log('\n2️⃣ Buscando password hash do usuário no Lovable...');
    const lovableResult = await lovableClient.query(`
      SELECT
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at
      FROM auth.users
      WHERE id = $1
    `, [USER_UUID]);

    if (lovableResult.rows.length === 0) {
      console.error('❌ Usuário não encontrado no Lovable Cloud');
      return;
    }

    const lovableUser = lovableResult.rows[0];
    console.log('✅ Usuário encontrado no Lovable:');
    console.log('   Email:', lovableUser.email);
    console.log('   UUID:', lovableUser.id);
    console.log('   Email confirmado:', lovableUser.email_confirmed_at ? 'Sim' : 'Não');
    console.log('   Password hash:', lovableUser.encrypted_password ? '✅ Presente' : '❌ Ausente');

    if (!lovableUser.encrypted_password) {
      console.error('❌ Password hash não encontrado no Lovable Cloud');
      return;
    }

    // 3. Conectar ao novo Supabase
    console.log('\n3️⃣ Conectando ao novo Supabase...');
    newClient = new Client(NEW_SUPABASE_CONFIG);
    await newClient.connect();
    console.log('✅ Conectado ao novo Supabase');

    // 4. Verificar se usuário existe no novo Supabase
    console.log('\n4️⃣ Verificando usuário no novo Supabase...');
    const newResult = await newClient.query(`
      SELECT
        id,
        email,
        encrypted_password,
        email_confirmed_at
      FROM auth.users
      WHERE id = $1
    `, [USER_UUID]);

    if (newResult.rows.length === 0) {
      console.error('❌ Usuário não encontrado no novo Supabase');
      console.log('\n💡 Execute primeiro: node scripts/fix-user-uuid.js');
      return;
    }

    const newUser = newResult.rows[0];
    console.log('✅ Usuário encontrado no novo Supabase:');
    console.log('   Email:', newUser.email);
    console.log('   UUID:', newUser.id);
    console.log('   Password hash atual:', newUser.encrypted_password ? '✅ Presente' : '❌ Ausente');

    // 5. Comparar password hashes
    console.log('\n5️⃣ Comparando password hashes...');
    if (lovableUser.encrypted_password === newUser.encrypted_password) {
      console.log('✅ Password hash já está correto! Nenhuma ação necessária.');
      console.log('\n💡 Se ainda não consegue fazer login, verifique:');
      console.log('   - Email está correto: tiag8guimaraes@gmail.com');
      console.log('   - Senha está correta');
      console.log('   - Tente resetar senha no Supabase Dashboard');
      return;
    }

    console.log('⚠️  Password hashes são diferentes. Iniciando migração...');

    // 6. Atualizar password hash no novo Supabase
    console.log('\n6️⃣ Atualizando password hash...');
    await newClient.query(`
      UPDATE auth.users
      SET
        encrypted_password = $1,
        email_confirmed_at = $2,
        raw_user_meta_data = $3,
        updated_at = NOW()
      WHERE id = $4
    `, [
      lovableUser.encrypted_password,
      lovableUser.email_confirmed_at,
      lovableUser.raw_user_meta_data,
      USER_UUID
    ]);

    console.log('✅ Password hash atualizado com sucesso!');

    // 7. Verificar atualização
    console.log('\n7️⃣ Verificando atualização...');
    const verifyResult = await newClient.query(`
      SELECT encrypted_password
      FROM auth.users
      WHERE id = $1
    `, [USER_UUID]);

    if (verifyResult.rows[0].encrypted_password === lovableUser.encrypted_password) {
      console.log('✅ Verificação OK - Password hash migrado corretamente!');
    } else {
      console.error('❌ Erro na verificação - Password hash não foi atualizado');
    }

    // 8. Atualizar auth.identities também
    console.log('\n8️⃣ Verificando auth.identities...');
    const identityCheck = await newClient.query(`
      SELECT id, provider
      FROM auth.identities
      WHERE user_id = $1
    `, [USER_UUID]);

    if (identityCheck.rows.length === 0) {
      console.log('⚠️  auth.identities não encontrado. Criando...');

      // Buscar identity do Lovable
      const lovableIdentity = await lovableClient.query(`
        SELECT
          id,
          user_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        FROM auth.identities
        WHERE user_id = $1
      `, [USER_UUID]);

      if (lovableIdentity.rows.length > 0) {
        const identity = lovableIdentity.rows[0];
        await newClient.query(`
          INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [
          identity.id,
          identity.user_id,
          identity.identity_data,
          identity.provider,
          identity.last_sign_in_at,
          identity.created_at,
          identity.updated_at
        ]);
        console.log('✅ auth.identities criado com sucesso!');
      }
    } else {
      console.log('✅ auth.identities já existe');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRAÇÃO COMPLETA!\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Acesse: http://localhost:8080');
    console.log('   2. Tente fazer login com:');
    console.log(`      Email: ${USER_EMAIL}`);
    console.log('      Senha: [a mesma senha que você usava no Lovable]');
    console.log('\n💡 Se ainda não funcionar, verifique se a senha está correta');
    console.log('   ou resete a senha no Supabase Dashboard.');

  } catch (error) {
    console.error('\n❌ ERRO NA MIGRAÇÃO:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Fechar conexões
    if (lovableClient) {
      await lovableClient.end();
    }
    if (newClient) {
      await newClient.end();
    }
  }
}

migrarPasswordHash();
