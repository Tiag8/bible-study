/**
 * Script para resolver problema de autenticação no novo Supabase
 *
 * Opções:
 * 1. Resetar senha do usuário no novo Supabase (recomendado)
 * 2. Criar novo usuário com senha conhecida
 *
 * Uso: node scripts/fix-auth-password.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Novo Supabase (Admin API)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const USER_UUID = 'c68aac85-0829-4eed-9c32-ef09b28e4cc3';
const USER_EMAIL = 'tiag8guimaraes@gmail.com';

async function fixAuthPassword() {
  console.log('🔐 RESOLVER PROBLEMA DE AUTENTICAÇÃO\n');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar se usuário existe
    console.log('\n1️⃣ Verificando usuário no novo Supabase...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }

    const existingUser = users.users.find(u => u.id === USER_UUID);

    if (!existingUser) {
      console.log('❌ Usuário não encontrado no novo Supabase');
      console.log('\n💡 Vou criar um novo usuário para você...');

      const newPassword = await question('Digite a nova senha (mínimo 6 caracteres): ');

      if (newPassword.length < 6) {
        console.error('❌ Senha muito curta. Mínimo 6 caracteres.');
        rl.close();
        return;
      }

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: USER_EMAIL,
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Tiago Guimarães'
        }
      });

      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError.message);
        rl.close();
        return;
      }

      console.log('✅ Usuário criado com sucesso!');
      console.log('   UUID:', newUser.user.id);
      console.log('   Email:', newUser.user.email);
      console.log('\n📝 Use estas credenciais para fazer login:');
      console.log(`   Email: ${USER_EMAIL}`);
      console.log(`   Senha: ${newPassword}`);
      rl.close();
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log('   UUID:', existingUser.id);
    console.log('   Email:', existingUser.email);
    console.log('   Email confirmado:', existingUser.email_confirmed_at ? 'Sim' : 'Não');
    console.log('   Último login:', existingUser.last_sign_in_at || 'Nunca');

    // 2. Resetar senha
    console.log('\n2️⃣ Resetando senha do usuário...');
    console.log('⚠️  Como você é o único usuário, vou definir uma nova senha diretamente.\n');

    const newPassword = await question('Digite a nova senha (mínimo 6 caracteres): ');

    if (newPassword.length < 6) {
      console.error('❌ Senha muito curta. Mínimo 6 caracteres.');
      rl.close();
      return;
    }

    // Atualizar senha do usuário
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      USER_UUID,
      {
        password: newPassword,
        email_confirm: true,
      }
    );

    if (updateError) {
      console.error('❌ Erro ao atualizar senha:', updateError.message);
      rl.close();
      return;
    }

    console.log('✅ Senha atualizada com sucesso!');
    console.log('\n' + '='.repeat(60));
    console.log('✅ PROBLEMA RESOLVIDO!\n');
    console.log('📝 Agora você pode fazer login com:');
    console.log(`   Email: ${USER_EMAIL}`);
    console.log(`   Senha: ${newPassword}`);
    console.log('\n💡 Acesse: http://localhost:8080');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  } finally {
    rl.close();
  }
}

fixAuthPassword();
