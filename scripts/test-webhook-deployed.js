#!/usr/bin/env node

/**
 * Script para testar o webhook deployado com a correção
 * Envia o payload real para a função em produção
 */

const WEBHOOK_URL = 'https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/webhook-whatsapp-adapter';

// Payload real do botão (pode mudar para testar diferentes cenários)
const TEST_PAYLOADS = {
  aceito: {
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
        },
        "body": {
          "text": "Aperte aceitar se concorda com os termos"
        },
        "footer": {
          "text": "Escolha uma das opções abaixo"
        }
      },
      "messageType": "NativeFlowMessage",
      "messageid": "3EB0D3BDAF230F03ECDCA3",
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
  },
  naoaceito: {
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
                "buttonParamsJSON": "{\"id\": \"naoaceito\", \"display_text\": \"❌ NÃO ACEITO\", \"disabled\": false}"
              }
            ]
          }
        },
        "body": {
          "text": "Aperte aceitar se concorda com os termos"
        },
        "footer": {
          "text": "Escolha uma das opções abaixo"
        }
      },
      "messageType": "NativeFlowMessage",
      "messageid": "3EB0D3BDAF230F03ECDCA4",
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
  },
  texto: {
    "EventType": "messages",
    "instanceName": "test",
    "owner": "5521988237489",
    "token": "test-token",
    "message": {
      "chatid": "556292451477@s.whatsapp.net",
      "text": "Olá, este é um teste de mensagem normal",
      "content": "Olá, este é um teste de mensagem normal",
      "messageType": "Conversation",
      "messageid": "3EB0D3BDAF230F03ECDCA5",
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
  }
};

async function testWebhook(payloadName) {
  const payload = TEST_PAYLOADS[payloadName];
  
  if (!payload) {
    console.error(`❌ Payload "${payloadName}" não encontrado`);
    console.log('Disponíveis: aceito, naoaceito, texto');
    return;
  }
  
  console.log(`🧪 Testando webhook com payload: ${payloadName}`);
  console.log(`🌐 URL: ${WEBHOOK_URL}`);
  console.log(`📤 Enviando...`);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📄 Response: ${responseText}`);
    
    if (response.ok) {
      console.log('✅ Webhook processou com sucesso!');
    } else {
      console.log('⚠️ Webhook retornou erro');
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
}

// Script principal
console.log('🚀 Teste do Webhook WhatsApp Adapter (Deploy Corrigido)\n');

const testType = process.argv[2];

if (testType) {
  testWebhook(testType);
} else {
  console.log('📋 Use: node scripts/test-webhook-deployed.js [tipo]');
  console.log('📋 Tipos disponíveis:');
  console.log('   aceito    - Testa botão ACEITO');
  console.log('   naoaceito - Testa botão NÃO ACEITO');
  console.log('   texto     - Testa mensagem de texto normal');
  console.log('\n💡 Exemplo:');
  console.log('   node scripts/test-webhook-deployed.js aceito');
  console.log('   node scripts/test-webhook-deployed.js texto');
  
  // Testar todos sequencialmente
  console.log('\n🔄 Deseja testar todos os cenários?');
  console.log('Execute: node scripts/test-webhook-deployed.js all');
  
  if (testType === 'all') {
    console.log('\n🧪 Executando todos os testes...\n');
    
    setTimeout(() => testWebhook('aceito'), 1000);
    setTimeout(() => testWebhook('naoaceito'), 3000);
    setTimeout(() => testWebhook('texto'), 5000);
  }
}
