#!/usr/bin/env node

/**
 * Script para testar payload real do WhatsApp Cloud API
 */

const WEBHOOK_URL = 'https://fjddlffnlbrhgogkyplq.supabase.co/functions/v1/webhook-whatsapp-adapter';

// Payload real do WhatsApp Cloud API (formato que estamos recebendo)
const WHATSAPP_CLOUD_API_PAYLOAD = {
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "123456789",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "556292451477",
          "phone_number_id": "123456789"
        },
        "contacts": [{
          "profile": {
            "name": "Test User"
          },
          "wa_id": "556292451477"
        }],
        "messages": [{
          "from": "556292451477",
          "id": "wamid.HBgLNTYyOTI0NTE0NzcVAgASGBQzNkU1QjM4MzhEMUM3QjhBQjA=",
          "timestamp": "1698765432",
          "type": "button",
          "button": {
            "text": "❌ NÃO ACEITO",
            "payload": "naoaceito"
          }
        }]
      },
      "field": "messages"
    }]
  }]
};

// Payload de texto simples
const TEXT_PAYLOAD = {
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "123456789",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "556292451477",
          "phone_number_id": "123456789"
        },
        "contacts": [{
          "profile": {
            "name": "Test User"
          },
          "wa_id": "556292451477"
        }],
        "messages": [{
          "from": "556292451477",
          "id": "wamid.HBgLNTYyOTI0NTE0NzcVAgASGBQzNkU1QjM4MzhEMUM3QjhBQjB=",
          "timestamp": "1698765432",
          "type": "text",
          "text": {
            "body": "oi"
          }
        }]
      },
      "field": "messages"
    }]
  }]
};

async function testPayload(payload, name) {
  console.log(`\n🧪 Testando payload: ${name}`);
  console.log(`📤 Object: ${payload.object}`);
  console.log(`📤 Message Type: ${payload.entry[0].changes[0].value.messages[0].type}`);
  console.log(`📤 Message ID: ${payload.entry[0].changes[0].value.messages[0].id}`);
  
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
  console.log('🚀 Teste WhatsApp Cloud API vs UAZAPI Custom\n');
  
  // Testar texto simples primeiro
  await testPayload(TEXT_PAYLOAD, 'Texto Simples (WhatsApp Cloud API)');
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Testar botão NÃO ACEITO
  await testPayload(WHATSAPP_CLOUD_API_PAYLOAD, 'Botão NÃO ACEITO (WhatsApp Cloud API)');
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Análise:');
  console.log('- Se funcionar, parser híbrido está OK');
  console.log('- Se der erro, verificar sintaxe do código');
  console.log('- Payload format detectado nos logs');
}

main();
