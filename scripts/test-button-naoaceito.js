#!/usr/bin/env node

/**
 * Script para testar o payload real do botão NÃO ACEITO
 * Baseado no log que mostrou ButtonsResponseMessage
 */

const WEBHOOK_URL = 'https://fjddlffnlbrhgogkyplq.supabase.co/functions/v1/webhook-whatsapp-adapter';

// Payload simulado baseado no log do usuário
const TEST_PAYLOAD_NAOACEITO = {
  "EventType": "messages",
  "instanceName": "test",
  "owner": "5521988237489",
  "token": "test-token",
  "message": {
    "chatid": "556292451477@s.whatsapp.net",
    "content": {
      "ButtonsResponseMessage": {
        "selectedButtonId": "naoaceito",
        "displayText": "❌ NÃO ACEITO"
      }
    },
    "messageType": "ButtonsResponseMessage",
    "messageid": "TEST_NAOACEITO_" + Date.now(),
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

// Payload para teste de ACEITO (funcionando)
const TEST_PAYLOAD_ACEITO = {
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
    "messageid": "TEST_ACEITO_" + Date.now(),
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

async function testPayload(payload, name) {
  console.log(`\n🧪 Testando payload: ${name}`);
  console.log(`📤 MessageType: ${payload.message.messageType}`);
  console.log(`📤 MessageId: ${payload.message.messageid}`);
  
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
      console.log('✅ Sucesso!');
    } else {
      console.log('⚠️ Erro');
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

async function main() {
  console.log('🚀 Teste de Botões - ACEITO vs NÃO ACEITO\n');
  
  // Testar NÃO ACEITO primeiro
  await testPayload(TEST_PAYLOAD_NAOACEITO, 'NÃO ACEITO (ButtonsResponseMessage)');
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Testar ACEITO para comparação
  await testPayload(TEST_PAYLOAD_ACEITO, 'ACEITO (NativeFlowMessage)');
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Análise:');
  console.log('- Se NÃO ACEITO funcionar, correção OK');
  console.log('- Se ACEITO der erro, problema no AI Coach');
  console.log('- Se ambos derem 500, verificar logs');
}

main();
