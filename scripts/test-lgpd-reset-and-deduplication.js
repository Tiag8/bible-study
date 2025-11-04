#!/usr/bin/env node

/**
 * Script completo para testar:
 * 1. Reset de status LGPD
 * 2. Deduplicação de mensagens
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '${VITE_SUPABASE_URL}';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
  console.log('💡 Adicione ao .env: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Payload de teste para botão "aceito"
const TEST_PAYLOAD = {
  "EventType": "messages",
  "instanceName": "test",
  "owner": "5521988237489",
  "token": "test-token",
  "message": {
    "chatid": "556292451477@s.whatsapp.net",
    "content": {
      "InteractiveMessage": {
        "NativeFlowMessage": {
          "buttons": [
            {
              "name": "quick_reply",
              "buttonParamsJSON": "{\"id\": \"aceito\", \"display_text\": \"✅ ACEITO\", \"disabled\": false}"
            }
          ]
        }
      }
    },
    "messageType": "NativeFlowMessage",
    "messageid": "TEST_MSG_" + Date.now(),
    "messageTimestamp": Date.now(),
    "sender": "5521988237489@s.whatsapp.net",
    "senderName": "Test User",
    "fromMe": false,
    "isGroup": false
  },
  "chat": {
    "phone": "+55 62 9245-1477",
    "name": "Test User",
    "wa_chatid": "556292451477@s.whatsapp.net",
    "wa_isGroup": false
  }
};

/**
 * Testa reset LGPD de um usuário
 */
async function testLGPDReset(phoneNumber) {
  console.log('🧪 Testando reset LGPD...\n');
  
  try {
    // Buscar usuário pelo telefone
    const { data: profile, error: profileError } = await supabase
      .from('lifetracker_profiles')
      .select('user_id, whatsapp_consent_at, whatsapp_consent_version')
      .eq('phone_number', phoneNumber)
      .single();
    
    if (profileError || !profile) {
      console.log(`❌ Usuário não encontrado: ${phoneNumber}`);
      return false;
    }
    
    console.log(`📊 Status atual do usuário ${profile.user_id}:`);
    console.log(`   - Consent at: ${profile.whatsapp_consent_at}`);
    console.log(`   - Version: ${profile.whatsapp_consent_version}`);
    
    // Resetar consentimento
    const { error: resetError } = await supabase
      .from('lifetracker_profiles')
      .update({
        whatsapp_consent_at: null,
        whatsapp_consent_version: null,
        whatsapp_verified: false,
      })
      .eq('user_id', profile.user_id);
    
    if (resetError) {
      console.error('❌ Erro ao resetar:', resetError);
      return false;
    }
    
    console.log('✅ Status LGPD resetado!');
    
    // Verificar resultado
    const { data: checkData } = await supabase
      .from('lifetracker_profiles')
      .select('whatsapp_consent_at, whatsapp_consent_version, whatsapp_verified')
      .eq('user_id', profile.user_id)
      .single();
    
    console.log('📊 Novo status:');
    console.log(`   - Consent at: ${checkData.whatsapp_consent_at}`);
    console.log(`   - Version: ${checkData.whatsapp_consent_version}`);
    console.log(`   - Verified: ${checkData.whatsapp_verified}`);
    
    return profile.user_id;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

/**
 * Testa deduplicação enviando mesma mensagem múltiplas vezes
 */
async function testDeduplication(messageId) {
  console.log('\n🧪 Testando deduplicação...\n');
  
  const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/webhook-whatsapp-adapter`;
  
  // Primeiro envio
  console.log('📤 Enviando mensagem pela 1ª vez...');
  const response1 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...TEST_PAYLOAD,
      message: {
        ...TEST_PAYLOAD.message,
        messageid: messageId
      }
    })
  });
  
  console.log(`Status 1: ${response1.status}`);
  const text1 = await response1.text();
  console.log(`Response 1: ${text1}`);
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Segundo envio (deveria ser ignorado)
  console.log('\n📤 Enviando mesma mensagem pela 2ª vez...');
  const response2 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...TEST_PAYLOAD,
      message: {
        ...TEST_PAYLOAD.message,
        messageid: messageId
      }
    })
  });
  
  console.log(`Status 2: ${response2.status}`);
  const text2 = await response2.text();
  console.log(`Response 2: ${text2}`);
  
  // Verificar se apenas uma mensagem foi salva
  console.log('\n🔍 Verificando mensagens salvas...');
  const { data: messages, error: msgError } = await supabase
    .from('lifetracker_coach_messages')
    .select('message_id, created_at')
    .eq('message_id', messageId);
  
  if (msgError) {
    console.error('❌ Erro ao verificar mensagens:', msgError);
    return false;
  }
  
  const messageCount = messages?.length || 0;
  console.log(`📊 Mensagens encontradas com ID ${messageId}: ${messageCount}`);
  
  if (messageCount === 1) {
    console.log('✅ Deduplicação funcionou!');
    return true;
  } else {
    console.log('❌ Deduplicação falhou!');
    return false;
  }
}

/**
 * Teste completo
 */
async function runCompleteTest(phoneNumber) {
  console.log('🚀 Teste Completo: Reset LGPD + Deduplicação\n');
  
  // 1. Reset LGPD
  const userId = await testLGPDReset(phoneNumber);
  if (!userId) {
    console.log('❌ Falha no reset LGPD');
    return;
  }
  
  // 2. Testar deduplicação
  const testMessageId = 'DEDUP_TEST_' + Date.now();
  const dedupSuccess = await testDeduplication(testMessageId);
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMO DOS TESTES:');
  console.log(`✅ Reset LGPD: ${userId ? 'SUCESSO' : 'FALHA'}`);
  console.log(`✅ Deduplicação: ${dedupSuccess ? 'SUCESSO' : 'FALHA'}`);
  
  if (userId && dedupSuccess) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('💡 Agora você pode:');
    console.log('   1. Enviar mensagem pelo WhatsApp');
    console.log('   2. Receber menu de consentimento');
    console.log('   3. Clicar no botão ✅ ACEITO');
    console.log('   4. Sistema não deve duplicar mensagens');
  } else {
    console.log('\n⚠️ Alguns testes falharam - verifique os logs');
  }
}

// Executar teste
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log('📋 Uso: node scripts/test-lgpd-reset-and-deduplication.js [telefone]');
  console.log('💡 Exemplo: node scripts/test-lgpd-reset-and-deduplication.js 556292451477');
  process.exit(1);
}

runCompleteTest(phoneNumber);
