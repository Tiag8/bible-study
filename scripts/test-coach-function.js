#!/usr/bin/env node

/**
 * Script de Diagnóstico da Edge Function coach-chat
 *
 * Testa a Edge Function e identifica causas do erro 500
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente faltando!');
  console.error('SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🔍 Diagnóstico da Edge Function coach-chat\n');

// 1. Verificar tabelas do banco
async function checkTables() {
  console.log('1️⃣ Verificando tabelas do banco...');

  try {
    const { data: conversations, error: convError } = await supabase
      .from('lifetracker_coach_conversations')
      .select('id, user_id, title')
      .limit(5);

    if (convError) {
      console.error('❌ Tabela lifetracker_coach_conversations:', convError.message);
    } else {
      console.log(`✅ Tabela lifetracker_coach_conversations: ${conversations.length} conversas encontradas`);
      if (conversations.length > 0) {
        console.log(`   Primeira conversa: ${conversations[0].id}`);
      }
    }
  } catch (err) {
    console.error('❌ Erro ao verificar tabela conversations:', err.message);
  }

  try {
    const { data: messages, error: msgError } = await supabase
      .from('lifetracker_coach_messages')
      .select('id, conversation_id, role')
      .limit(5);

    if (msgError) {
      console.error('❌ Tabela lifetracker_coach_messages:', msgError.message);
    } else {
      console.log(`✅ Tabela lifetracker_coach_messages: ${messages.length} mensagens encontradas`);
    }
  } catch (err) {
    console.error('❌ Erro ao verificar tabela messages:', err.message);
  }

  console.log('');
}

// 2. Criar conversa de teste se necessário
async function getOrCreateTestConversation() {
  console.log('2️⃣ Obtendo/criando conversa de teste...');

  try {
    // Buscar usuário autenticado
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError || !users || users.length === 0) {
      console.error('❌ Nenhum usuário encontrado:', usersError?.message);
      return null;
    }

    const userId = users[0].id;
    console.log(`✅ Usuário encontrado: ${userId}`);

    // Buscar conversa existente
    const { data: conversations, error: convError } = await supabase
      .from('lifetracker_coach_conversations')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (conversations && conversations.length > 0) {
      console.log(`✅ Conversa existente: ${conversations[0].id}`);
      return { conversationId: conversations[0].id, userId };
    }

    // Criar nova conversa
    const { data: newConv, error: createError } = await supabase
      .from('lifetracker_coach_conversations')
      .insert({
        user_id: userId,
        title: 'Teste de Diagnóstico',
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar conversa:', createError.message);
      return null;
    }

    console.log(`✅ Nova conversa criada: ${newConv.id}`);
    return { conversationId: newConv.id, userId };
  } catch (err) {
    console.error('❌ Erro ao obter/criar conversa:', err.message);
    return null;
  }
}

// 3. Testar Edge Function
async function testEdgeFunction(conversationId) {
  console.log('\n3️⃣ Testando Edge Function...');

  const url = `${SUPABASE_URL}/functions/v1/coach-chat`;

  console.log(`📡 URL: ${url}`);
  console.log(`💬 Mensagem: "Olá, como está?"`);
  console.log(`🔑 Conversation ID: ${conversationId}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        conversationId,
        message: 'Olá, como está?',
      }),
    });

    console.log(`\n📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers:`);
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ Erro ${response.status}:`);
      console.error(errorText);

      // Tentar parsear como JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error('\n📄 Erro JSON:', JSON.stringify(errorJson, null, 2));
      } catch {
        // Não é JSON, já mostramos o texto
      }

      return false;
    }

    // Se for streaming
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      console.log('\n✅ Resposta em streaming recebida!');
      console.log('📺 Primeiras linhas do stream:');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let chunks = 0;

      while (chunks < 5 && reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        console.log(text);
        chunks++;
      }

      return true;
    }

    // Se for JSON normal
    const data = await response.json();
    console.log('\n✅ Resposta JSON:', JSON.stringify(data, null, 2));
    return true;

  } catch (err) {
    console.error('\n❌ Erro ao chamar Edge Function:', err.message);
    if (err.cause) {
      console.error('Causa:', err.cause);
    }
    return false;
  }
}

// 4. Executar diagnóstico
async function main() {
  await checkTables();

  const testData = await getOrCreateTestConversation();

  if (!testData) {
    console.error('\n❌ Não foi possível obter conversa de teste. Abortando.');
    process.exit(1);
  }

  const success = await testEdgeFunction(testData.conversationId);

  if (success) {
    console.log('\n✅ Edge Function funcionando corretamente!');
    process.exit(0);
  } else {
    console.log('\n❌ Edge Function falhou. Verifique os logs acima.');
    process.exit(1);
  }
}

main();
