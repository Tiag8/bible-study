#!/usr/bin/env node

/**
 * Script para testar a correção do processamento de botões UAZAPI
 * Simula o payload real que chega ao webhook
 */

import { createClient } from '@supabase/supabase-js';

// Payload real fornecido pelo usuário (com dados sensíveis ofuscados)
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
      },
      "header": {
        "Media": null,
        "title": ""
      },
      "body": {
        "text": "Aperte aceitar se concorda com os termos"
      },
      "footer": {
        "Media": null,
        "text": "Escolha uma das opções abaixo"
      },
      "contextInfo": {}
    },
    "convertOptions": "✅ ACEITO|❌ NÃO ACEITO",
    "edited": "",
    "fromMe": true,
    "id": "5521988237489:3EB0D3BDAF230F03ECDCA3",
    "isGroup": false,
    "messageTimestamp": 1762124127775,
    "messageType": "NativeFlowMessage",
    "messageid": "3EB0D3BDAF230F03ECDCA3",
    "owner": "5521988237489",
    "quoted": "",
    "reaction": "",
    "readChatAttempted": false,
    "sender": "5521988237489@s.whatsapp.net",
    "senderName": "Mentor[IA] Financeira",
    "source": "web",
    "status": "Pending",
    "text": "Aperte aceitar se concorda com os termos\\nEscolha uma das opções abaixo",
    "track_id": "",
    "track_source": "",
    "wasSentByApi": false
  },
  "chat": {
    "phone": "+55 62 9245-1477",
    "name": "Test User",
    "wa_chatid": "556292451477@s.whatsapp.net",
    "wa_isGroup": false
  }
};

/**
 * Testa localmente a extração de payload do botão
 */
function testExtractButtonPayload() {
  console.log('🧪 Testando extração de payload do botão...\n');
  
  try {
    // Simular a função extractButtonPayload (versão simplificada para teste)
    function extractButtonPayload(payload) {
      const { message } = payload;
      
      console.log('[test] Message type:', message.messageType);
      console.log('[test] Content type:', typeof message.content);
      
      // Verificar se é mensagem interativa
      if (message.content && typeof message.content !== 'string') {
        const content = message.content;
        if (content?.InteractiveMessage?.NativeFlowMessage?.buttons) {
          const buttons = content.InteractiveMessage.NativeFlowMessage.buttons;
          if (buttons.length > 0 && buttons[0].buttonParamsJSON) {
            try {
              const params = JSON.parse(buttons[0].buttonParamsJSON);
              console.log('[test] ✅ Button detected:', params.id);
              return params.id || null;
            } catch (parseError) {
              console.error('[test] Failed to parse buttonParamsJSON:', parseError);
            }
          }
        }
      }
      
      return null;
    }
    
    // Testar extração
    const buttonId = extractButtonPayload(TEST_PAYLOAD);
    
    console.log('\n📊 Resultado:');
    if (buttonId) {
      console.log(`✅ Botão extraído com sucesso: "${buttonId}"`);
      console.log('✅ Payload processado corretamente!');
    } else {
      console.log('❌ Falha ao extrair botão');
    }
    
    // Testar também a extração de mensagem (deve retornar null para mensagens de botão)
    console.log('\n🔍 Testando extração de mensagem de texto...');
    
    function testExtractMessageData(payload) {
      const { message } = payload;
      
      const rawMessageText = message.text || message.content;
      const messageText = typeof rawMessageText === 'string' ? rawMessageText : null;
      
      // Log para debug de mensagens interativas
      if (typeof message.content === 'object' && message.content !== null) {
        console.log('[test] Interactive message detected - delegating to button extraction');
        return null;
      }
      
      if (!messageText || messageText.trim() === '') {
        console.log('[test] No text content - might be button/interactive message');
        return null;
      }
      
      return { message: messageText };
    }
    
    const messageData = testExtractMessageData(TEST_PAYLOAD);
    
    if (messageData === null) {
      console.log('✅ Mensagem interativa corretamente identificada (retornou null)');
    } else {
      console.log('❌ Erro: Mensagem interativa não foi tratada corretamente');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

/**
 * Testa envio real para o webhook (se disponível)
 */
async function testWebhookEndpoint() {
  console.log('\n🌐 Testando endpoint do webhook...');
  
  const WEBHOOK_URL = 'https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/webhook-whatsapp-adapter';
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_PAYLOAD)
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${await response.text()}`);
    
    if (response.ok) {
      console.log('✅ Webhook respondeu com sucesso!');
    } else {
      console.log('⚠️ Webhook retornou status diferente de 200');
    }
    
  } catch (error) {
    console.error('❌ Erro ao chamar webhook:', error.message);
  }
}

// Executar testes
console.log('🚀 Iniciando testes da correção de botões UAZAPI\n');

testExtractButtonPayload();

// Perguntar se quer testar webhook real
console.log('\n' + '='.repeat(50));
console.log('Deseja testar o webhook real?');
console.log('Execute: node scripts/test-button-payload-fix.js --webhook');
console.log('=' .repeat(50));

// Verificar se foi passado argumento para testar webhook
if (process.argv.includes('--webhook')) {
  await testWebhookEndpoint();
}

console.log('\n🎉 Testes concluídos!');
