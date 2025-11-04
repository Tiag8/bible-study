#!/usr/bin/env node

/**
 * Script para testar payload real da UAZAPI
 */

const WEBHOOK_URL = '${VITE_SUPABASE_URL}/functions/v1/webhook-whatsapp-adapter';

// Payload mínimo para teste
const SIMPLE_PAYLOAD = {
  "EventType": "messages",
  "instanceName": "test",
  "message": {
    "chatid": "556292451477@s.whatsapp.net",
    "text": "oi",
    "fromMe": false,
    "isGroup": false,
    "sender": "556292451477",
    "senderName": "Test User",
    "messageTimestamp": Date.now(),
    "messageid": "test_" + Date.now(),
    "messageType": "Conversation"
  },
  "chat": {
    "phone": "+55 62 9245-1477",
    "name": "Test User",
    "wa_chatid": "556292451477@s.whatsapp.net",
    "wa_isGroup": false
  }
};

async function testPayload() {
  console.log('🧪 Testando payload UAZAPI simples...');
  console.log('📤 Payload:', JSON.stringify(SIMPLE_PAYLOAD, null, 2));
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(SIMPLE_PAYLOAD)
    });
    
    const responseText = await response.text();
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📄 Response: ${responseText}`);
    
    if (response.ok) {
      console.log('✅ Webhook funcionando!');
    } else {
      console.log('⚠️ Erro no webhook');
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testPayload();
