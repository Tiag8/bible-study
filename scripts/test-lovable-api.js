#!/usr/bin/env node

/**
 * Testa se a API Lovable está funcionando com a GEMINI_API_KEY
 */

import dotenv from 'dotenv';

dotenv.config();

// A chave que está no .env local (pode ser diferente da secret do Supabase)
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

console.log('🔍 Testando API Lovable Gateway\n');
console.log(`🔑 GEMINI_API_KEY: ${GEMINI_API_KEY?.substring(0, 20)}...`);

async function testLovableAPI() {
  const url = 'https://ai.gateway.lovable.dev/v1/chat/completions';

  console.log('\n📡 Enviando requisição de teste...');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: 'Responda apenas "OK" se você está funcionando.',
          },
        ],
        stream: false,
      }),
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ Erro na API Lovable:');
      console.error(errorText);

      if (response.status === 401) {
        console.log('\n💡 DIAGNÓSTICO: GEMINI_API_KEY inválida ou expirada!');
        console.log('\n📋 AÇÃO:');
        console.log('1. Verifique se a key está correta no .env');
        console.log('2. Verifique se a mesma key está configurada no Supabase:');
        console.log('   supabase secrets list --project-ref ${SUPABASE_PROJECT_REF}');
        console.log('3. Se necessário, atualize:');
        console.log(`   supabase secrets set GEMINI_API_KEY="${GEMINI_API_KEY}" --project-ref ${SUPABASE_PROJECT_REF}`);
      }

      if (response.status === 402) {
        console.log('\n💡 DIAGNÓSTICO: Créditos insuficientes no Lovable!');
        console.log('\n📋 AÇÃO:');
        console.log('Acesse o dashboard Lovable e adicione créditos.');
      }

      if (response.status === 429) {
        console.log('\n💡 DIAGNÓSTICO: Rate limit excedido!');
        console.log('Aguarde alguns minutos e tente novamente.');
      }

      process.exit(1);
    }

    // Sucesso!
    const data = await response.json();
    console.log('\n✅ API Lovable está funcionando!');
    console.log('📄 Resposta:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n✅ GEMINI_API_KEY está válida e funcionando!');
    console.log('\n💡 O problema do erro 500 NÃO é a API Lovable.');
    console.log('Possíveis causas restantes:');
    console.log('- RLS policies bloqueando queries no banco');
    console.log('- Erro na lógica da Edge Function');
    console.log('- Schema de tabela incorreto');
    console.log('\nVerifique os logs no Dashboard:');
    console.log('https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/logs/edge-functions');

    process.exit(0);

  } catch (err) {
    console.error('\n❌ Erro de rede:', err.message);
    process.exit(1);
  }
}

testLovableAPI();
