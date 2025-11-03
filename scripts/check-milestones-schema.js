#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Verificando schema da tabela lifetracker_milestones...\n');

async function checkSchema() {
  // Tentar inserir um registro vazio para ver o erro
  const { data, error } = await supabase
    .from('lifetracker_milestones')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Erro ao acessar tabela:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ Estrutura da tabela (baseado em registro existente):');
    console.log('Colunas:', Object.keys(data[0]).join(', '));
    console.log('\n📊 Exemplo de registro:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('⚠️ Tabela vazia, mas existe.');
    console.log('Tentando inserir um registro de teste...');

    // Tentar inserir para ver quais campos são obrigatórios
    const { data: { user }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !user || user.length === 0) {
      console.error('❌ Não foi possível obter usuário para teste');
      return;
    }

    const testUserId = user[0].id;

    // Tentar insert mínimo
    const { error: insertError } = await supabase
      .from('lifetracker_milestones')
      .insert({
        user_id: testUserId,
        type: 'pattern',
        title: 'Teste',
        description: 'Teste de schema',
        date: new Date().toISOString().split('T')[0],
      });

    if (insertError) {
      console.error('❌ Erro ao inserir (campos obrigatórios):');
      console.error(insertError.message);
      console.error(insertError.details);
      console.error(insertError.hint);
    } else {
      console.log('✅ Insert bem-sucedido! Campos obrigatórios: user_id, type, title, description, date');
    }
  }
}

checkSchema();
