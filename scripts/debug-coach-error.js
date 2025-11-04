#!/usr/bin/env node

/**
 * Debug detalhado do erro 500 no coach-chat
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('🔍 Debug do erro 500 no coach-chat\n');

async function main() {
  // 1. Autenticar como admin e pegar usuário
  console.log('1️⃣ Obtendo usuário do banco...');
  const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();

  if (usersError || !users || users.length === 0) {
    console.error('❌ Erro ao listar usuários:', usersError?.message);
    process.exit(1);
  }

  const user = users[0];
  console.log(`✅ Usuário: ${user.email} (${user.id})`);

  // 2. Criar conversa usando service role key
  console.log('\n2️⃣ Criando conversa de teste...');

  // Primeiro verificar se já existe
  const { data: existingConvs } = await adminClient
    .from('lifetracker_coach_conversations')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  let conversationId;

  if (existingConvs && existingConvs.length > 0) {
    conversationId = existingConvs[0].id;
    console.log(`✅ Conversa existente: ${conversationId}`);
  } else {
    const { data: newConv, error: createError } = await adminClient
      .from('lifetracker_coach_conversations')
      .insert({
        user_id: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar conversa:', createError);
      process.exit(1);
    }

    conversationId = newConv.id;
    console.log(`✅ Conversa criada: ${conversationId}`);
  }

  // 3. Gerar token JWT válido para o usuário
  console.log('\n3️⃣ Gerando token JWT válido...');

  // Criar sessão temporária
  const { data: { session }, error: sessionError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email,
  });

  if (sessionError) {
    console.error('❌ Erro ao gerar link:', sessionError);
    console.log('\n⚠️ Tentando com abordagem alternativa...');

    // Abordagem alternativa: usar service role key diretamente
    console.log('\n4️⃣ Testando Edge Function com SERVICE_ROLE_KEY...');

    const url = `${SUPABASE_URL}/functions/v1/coach-chat`;
    const testMessage = 'Olá, este é um teste de diagnóstico.';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
          conversationId,
          message: testMessage,
        }),
      });

      console.log(`📊 Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('\n❌ Erro completo:');
        console.error(errorText);

        try {
          const errorJson = JSON.parse(errorText);
          console.error('\n📄 Erro JSON:');
          console.error(JSON.stringify(errorJson, null, 2));
        } catch {
          // Não é JSON
        }

        // Verificar se é erro de autenticação
        if (response.status === 401) {
          console.log('\n💡 DIAGNÓSTICO: Erro de autenticação');
          console.log('Possíveis causas:');
          console.log('- verify_jwt = true na config.toml');
          console.log('- JWT expirado ou inválido');
          console.log('- Service role key não bypass JWT verification');
        }

        // Verificar se é erro 500
        if (response.status === 500) {
          console.log('\n💡 DIAGNÓSTICO: Erro interno do servidor');
          console.log('Possíveis causas:');
          console.log('- API Lovable com problema (GEMINI_API_KEY inválida?)');
          console.log('- Tabelas com schema incorreto');
          console.log('- RLS policies bloqueando queries');
          console.log('- Erro na lógica da Edge Function');
          console.log('\n📋 AÇÃO NECESSÁRIA:');
          console.log('Acesse os logs no Dashboard:');
          console.log(`https://supabase.com/dashboard/${SUPABASE_PROJECT_REF}/logs/edge-functions`);
          console.log('\nOu teste a API Lovable diretamente:');
          console.log('curl -X POST https://ai.gateway.lovable.dev/v1/chat/completions \\');
          console.log(`  -H "Authorization: Bearer YOUR_GEMINI_KEY" \\`);
          console.log('  -H "Content-Type: application/json" \\');
          console.log('  -d \'{"model":"google/gemini-2.5-flash","messages":[{"role":"user","content":"test"}]}\'');
        }

        process.exit(1);
      }

      // Sucesso!
      console.log('\n✅ Edge Function respondeu!');

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        console.log('📺 Stream recebido:');
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          process.stdout.write(text);
          fullText += text;
        }

        console.log('\n\n✅ Edge Function funcionando perfeitamente!');
        process.exit(0);
      }

    } catch (err) {
      console.error('\n❌ Erro de rede:', err.message);
      if (err.cause) {
        console.error('Causa:', err.cause);
      }
      process.exit(1);
    }
  }
}

main();
