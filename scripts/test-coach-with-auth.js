#!/usr/bin/env node

/**
 * Teste da Edge Function coach-chat com autenticação real
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente faltando!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Teste da Edge Function com autenticação real\n');

async function main() {
  // 1. Verificar se já existe sessão ativa
  console.log('1️⃣ Verificando sessão ativa...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.log('⚠️ Nenhuma sessão ativa. Tentando autenticar...');

    // 2. Listar usuários para pegar credenciais
    const adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();

    if (usersError || !users || users.length === 0) {
      console.error('❌ Não foi possível listar usuários:', usersError?.message);
      console.log('\n💡 Dica: Crie um usuário no Supabase Dashboard ou use o frontend para autenticar.');
      process.exit(1);
    }

    const user = users[0];
    console.log(`✅ Usuário encontrado: ${user.email || user.id}`);

    // Não podemos autenticar sem senha, então vamos usar magic link ou OAuth
    console.log('\n❌ Não é possível autenticar automaticamente sem credenciais.');
    console.log('\n📝 INSTRUÇÕES:');
    console.log('1. Abra o navegador em: http://localhost:8080');
    console.log('2. Faça login normalmente');
    console.log('3. Tente enviar uma mensagem ao coach no navegador');
    console.log('4. Se der erro 401, verifique:');
    console.log('   - Se a sessão está ativa (verifique localStorage)');
    console.log('   - Se o JWT não expirou');
    console.log('   - Se o usuário tem acesso à conversa (RLS policies)');
    process.exit(1);
  }

  console.log(`✅ Sessão ativa: ${session.user.email || session.user.id}`);
  console.log(`🔑 Access Token: ${session.access_token.substring(0, 20)}...`);

  // 3. Buscar ou criar conversa
  console.log('\n2️⃣ Buscando conversa...');
  const { data: conversations, error: convError } = await supabase
    .from('lifetracker_coach_conversations')
    .select('id')
    .eq('user_id', session.user.id)
    .limit(1);

  let conversationId;

  if (convError || !conversations || conversations.length === 0) {
    console.log('⚠️ Nenhuma conversa encontrada. Criando...');

    const { data: newConv, error: createError } = await supabase
      .from('lifetracker_coach_conversations')
      .insert({
        user_id: session.user.id,
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar conversa:', createError.message);
      process.exit(1);
    }

    conversationId = newConv.id;
    console.log(`✅ Conversa criada: ${conversationId}`);
  } else {
    conversationId = conversations[0].id;
    console.log(`✅ Conversa encontrada: ${conversationId}`);
  }

  // 4. Testar Edge Function
  console.log('\n3️⃣ Testando Edge Function...');

  const url = `${SUPABASE_URL}/functions/v1/coach-chat`;
  const testMessage = 'Olá, este é um teste de diagnóstico. Responda apenas "ok".';

  console.log(`📡 URL: ${url}`);
  console.log(`💬 Mensagem: "${testMessage}"`);
  console.log(`🔑 JWT: ${session.access_token.substring(0, 30)}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        conversationId,
        message: testMessage,
      }),
    });

    console.log(`\n📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ Erro ${response.status}:`);
      console.error(errorText);

      try {
        const errorJson = JSON.parse(errorText);
        console.error('\n📄 Erro JSON:', JSON.stringify(errorJson, null, 2));
      } catch {
        // Não é JSON
      }

      process.exit(1);
    }

    // Streaming response
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      console.log('\n✅ Resposta em streaming recebida!');
      console.log('📺 Conteúdo do stream:\n');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        process.stdout.write(text);
        fullResponse += text;
      }

      console.log('\n\n✅ Edge Function funcionando perfeitamente!');
      process.exit(0);
    }

    // JSON response
    const data = await response.json();
    console.log('\n✅ Resposta JSON:', JSON.stringify(data, null, 2));
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Erro ao chamar Edge Function:', err.message);
    if (err.cause) {
      console.error('Causa:', err.cause);
    }
    process.exit(1);
  }
}

main();
