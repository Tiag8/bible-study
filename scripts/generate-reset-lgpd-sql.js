#!/usr/bin/env node

/**
 * Script que gera o SQL para reset LGPD
 * Não precisa de chaves API - apenas gera o SQL
 */

/**
 * Gera SQL para resetar LGPD de um usuário
 */
function generateResetSQL(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/^\+/, '');
  
  const sql = `-- ==========================================
-- RESET LGPD - Life Track Growth
-- Telefone: ${phoneNumber}
-- Data: ${new Date().toLocaleString('pt-BR')}
-- ==========================================

-- PASSO 1: Verificar usuário atual
SELECT 
  user_id, 
  phone_number, 
  whatsapp_consent_at, 
  whatsapp_consent_version, 
  whatsapp_verified,
  created_at
FROM lifetracker_profiles 
WHERE phone_number = '${cleanPhone}';

-- PASSO 2: Resetar consentimento LGPD
UPDATE lifetracker_profiles 
SET 
  whatsapp_consent_at = NULL,
  whatsapp_consent_version = NULL,
  whatsapp_verified = false,
  updated_at = NOW()
WHERE phone_number = '${cleanPhone}';

-- PASSO 3: Verificar resultado após reset
SELECT 
  user_id, 
  phone_number, 
  whatsapp_consent_at, 
  whatsapp_consent_version, 
  whatsapp_verified,
  updated_at
FROM lifetracker_profiles 
WHERE phone_number = '${cleanPhone}';

-- PASSO 4: Limpar conversas WhatsApp (opcional)
-- UPDATE lifetracker_coach_conversations 
-- SET status = 'deleted'
-- WHERE channel = 'whatsapp' 
-- AND user_id = (SELECT user_id FROM lifetracker_profiles WHERE phone_number = '${cleanPhone}');

-- ==========================================
-- INSTRUÇÕES:
-- 1. Copie este SQL inteiro
-- 2. Acesse: https://supabase.com/dashboard/project/fjddlffnlbrhgogkyplq
-- 3. Vá para: SQL Editor (menu lateral)
-- 4. Cole o SQL e clique em "Run"
-- 5. Confirme que whatsapp_consent_at está NULL
-- ==========================================`;

  return sql;
}

/**
 * Função principal
 */
async function main() {
  const phoneNumber = process.argv[2];
  
  if (!phoneNumber) {
    console.log('📋 Uso: node scripts/generate-reset-lgpd-sql.js [telefone]');
    console.log('💡 Exemplo: node scripts/generate-reset-lgpd-sql.js 556292451477');
    process.exit(1);
  }
  
  console.log('🚀 Gerador de SQL - Reset LGPD\n');
  
  const resetSQL = generateResetSQL(phoneNumber);
  
  console.log(resetSQL);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 PRÓXIMOS PASSOS:');
  console.log('=' .repeat(60));
  console.log('1. Copie o SQL acima');
  console.log('2. Execute no SQL Editor do Supabase Dashboard');
  console.log('3. Envie mensagem pelo WhatsApp');
  console.log('4. Deve receber menu de consentimento');
  console.log('5. Clique em ✅ ACEITO para testar');
  console.log('\n✅ Sistema pronto para teste completo!');
}

main();
