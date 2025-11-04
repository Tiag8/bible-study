#!/usr/bin/env node

/**
 * Teste mínimo do webhook
 */

const WEBHOOK_URL = 'https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/webhook-whatsapp-adapter';

// Payload super simples
const MINIMO_PAYLOAD = {
  test: "hello"
};

async function test() {
  console.log('🧪 Teste mínimo...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(MINIMO_PAYLOAD)
    });
    
    const responseText = await response.text();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response: ${responseText}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();
