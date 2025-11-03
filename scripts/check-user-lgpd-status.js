#!/usr/bin/env node

/**
 * Script para verificar status LGPD de um usuário
 * Usa apenas SQL gerado para consulta manual
 */

/**
 * Gera SQL para verificar status LGPD
 */
function generateCheckSQL(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/^\+/, '');
  
  const sql = `-- ==========================================
-- VERIFICAR STATUS LGPD - Life Track Growth
-- Telefone: ${phoneNumber}
-- Data: ${new Date().toLocaleString('pt-BR')}
-- ==========================================

-- Status atual do consentimento
SELECT 
  user_id,
  phone_number,
  CASE 
    WHEN whatsapp_consent_at IS NULL THEN '❌ SEM CONSENTIMENTO'
    WHEN whatsapp_consent_version = 'v1.0' THEN '✅ CONSENTIMENTO ATIVO'
    ELSE '⚠️ VERSÃO ANTIGA'
  END as consent_status,
  whatsapp_consent_at,
  whatsapp_consent_version,
  whatsapp_verified,
  created_at,
  updated_at
FROM lifetracker_profiles 
WHERE phone_number = '${cleanPhone}';

-- Conversas recentes (últimas 5)
SELECT 
  id,
  status,
  channel,
  created_at,
  updated_at
FROM lifetracker_coach_conversations 
WHERE user_id = (
  SELECT user_id FROM lifetracker_profiles 
  WHERE phone_number = '${cleanPhone}'
)
ORDER BY created_at DESC 
LIMIT 5;

-- Mensagens recentes (últimas 10)
SELECT 
  id,
  role,
  LEFT(content, 50) as preview,
  message_id,
  created_at
FROM lifetracker_coach_messages 
WHERE user_id = (
  SELECT user_id FROM lifetracker_profiles 
  WHERE phone_number = '${cleanPhone}'
)
ORDER BY created_at DESC 
LIMIT 10;

-- ==========================================
-- INTERPRETAÇÃO:
-- - consent_status: ❌ = precisa aceitar, ✅ = pode usar
-- - whatsapp_verified: false = precisa verificar telefone
-- - message_id: presente = deduplicação ativa
-- ==========================================`;

  return sql;
}

/**
 * Função principal
 */
async function main() {
  const phoneNumber = process.argv[2];
  
  if (!phoneNumber) {
    console.log('📋 Uso: node scripts/check-user-lgpd-status.js [telefone]');
    console.log('💡 Exemplo: node scripts/check-user-lgpd-status.js 556292451477');
    process.exit(1);
  }
  
  console.log('🔍 Verificador de Status LGPD\n');
  
  const checkSQL = generateCheckSQL(phoneNumber);
  
  console.log(checkSQL);
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 COMO USAR:');
  console.log('=' .repeat(60));
  console.log('1. Copie o SQL acima');
  console.log('2. Execute no SQL Editor do Supabase Dashboard');
  console.log('3. Verifique o consent_status');
  console.log('4. Se ❌, envie mensagem WhatsApp para testar');
}

main();
