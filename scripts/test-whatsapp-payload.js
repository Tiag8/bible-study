#!/usr/bin/env node

/**
 * Script para Testar Payloads WhatsApp UAZAPI
 * 
 * Criado após Meta-Learning: Debug de payloads consumiu 2h
 * Este script automatiza descoberta de formatos reais vs documentados
 * 
 * Uso: ./scripts/test-whatsapp-payload.js [payload-file.json]
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/webhook-whatsapp-adapter';

// Payloads reais descobertos em produção
const REAL_PAYLOADS = {
  // Botão NÃO ACEITO (formato REAL UAZAPI)
  button_nao_aceito: {
    "EventType": "messages",
    "instanceName": "lifetracker",
    "message": {
      "buttonOrListid": "naoaceito",
      "chatid": "556292451477@s.whatsapp.net",
      "content": {
        "Response": {
          "SelectedDisplayText": "❌ NÃO ACEITO"
        },
        "selectedButtonID": "naoaceito",  // ← 'D' maiúsculo (REAL!)
        "contextInfo": {
          "stanzaID": "3EB0B4DF04A20ACB0D869B",
          "participant": "5521988237489@s.whatsapp.net"
        },
        "type": 1
      },
      "messageType": "ButtonsResponseMessage",
      "messageid": "3A4D56C10B47856854AA",
      "fromMe": false,
      "wasSentByApi": false
    },
    "chat": {
      "phone": "+55 62 9245-1477",
      "wa_chatid": "556292451477@s.whatsapp.net",
      "wa_isGroup": false
    }
  },

  // Botão ACEITO (formato REAL)
  button_aceito: {
    "EventType": "messages",
    "instanceName": "lifetracker", 
    "message": {
      "buttonOrListid": "aceito",
      "chatid": "556292451477@s.whatsapp.net",
      "content": {
        "Response": {
          "SelectedDisplayText": "✅ ACEITO"
        },
        "selectedButtonID": "aceito",  // ← 'D' maiúsculo (REAL!)
        "type": 1
      },
      "messageType": "ButtonsResponseMessage",
      "messageid": "3B4D56C10B47856854BB",
      "fromMe": false,
      "wasSentByApi": false
    }
  },

  // Texto simples (controle)
  text_oi: {
    "EventType": "messages",
    "instanceName": "lifetracker",
    "message": {
      "chatid": "556292451477@s.whatsapp.net",
      "text": "oi",
      "content": "oi",
      "messageType": "Conversation",
      "messageid": "3C4D56C10B47856854CC",
      "fromMe": false,
      "wasSentByApi": false
    }
  }
};

/**
 * Testa um payload específico
 */
async function testPayload(name, payload) {
  console.log(`\n🧪 Testando payload: ${name}`);
  console.log(`📋 Tipo: ${payload.message.messageType}`);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-UAZAPI-Signature': 'dev-mode' // Assinatura fake para dev
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    const text = await response.text();
    
    console.log(`📊 Status: ${status}`);
    console.log(`📄 Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
    
    if (status === 200) {
      console.log(`✅ ${name}: SUCESSO`);
    } else {
      console.log(`❌ ${name}: FALHOU (${status})`);
    }
    
    return { success: status === 200, status, response: text };
    
  } catch (error) {
    console.error(`❌ ${name}: ERRO -`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Gera código parser baseado no payload real
 */
function generateParserCode(payload) {
  const messageType = payload.message.messageType;
  const content = payload.message.content;
  
  console.log(`\n🔧 Gerando parser para: ${messageType}`);
  
  if (messageType === 'ButtonsResponseMessage' && content?.selectedButtonID) {
    return `// Parser para ${messageType} (formato REAL UAZAPI)
if (content?.selectedButtonID) {
  const buttonId = content.selectedButtonID;
  const displayText = content.Response?.SelectedDisplayText;
  
  return {
    type: 'button',
    payload: buttonId,
    displayText: displayText,
    originalFormat: '${messageType}-Real'
  };
}`;
  }
  
  return `// Parser para ${messageType} não implementado ainda`;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Script de Teste WhatsApp Payload (Meta-Learning)');
  console.log(`🌐 Webhook: ${WEBHOOK_URL}`);
  
  const results = {};
  
  // Testar todos os payloads conhecidos
  for (const [name, payload] of Object.entries(REAL_PAYLOADS)) {
    results[name] = await testPayload(name, payload);
    
    // Gerar parser code se for novo formato
    if (results[name].success && payload.message.messageType.includes('Button')) {
      const parserCode = generateParserCode(payload);
      console.log(`\n💡 Código parser gerado:`);
      console.log(parserCode);
    }
  }
  
  // Resumo final
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('='.repeat(50));
  
  for (const [name, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${name}: ${result.success ? 'OK' : 'FALHOU'}`);
  }
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Taxa de sucesso: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  if (successCount === totalCount) {
    console.log('🎉 Todos os testes passaram! Webhook funcionando perfeitamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testPayload, generateParserCode, REAL_PAYLOADS };
