#!/usr/bin/env node

/**
 * Script simplificado para resetar status LGPD
 * Usa anon key para buscar e solicita service role key para reset
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fjddlffnlbrhgogkyplq.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não encontrada no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Busca informações do usuário pelo telefone
 */
async function findUserByPhone(phoneNumber) {
  console.log(`🔍 Buscando usuário pelo telefone: ${phoneNumber}\n`);
  
  try {
    const { data, error } = await supabase
      .from('lifetracker_profiles')
      .select('user_id, phone_number, whatsapp_consent_at, whatsapp_consent_version, whatsapp_verified')
      .eq('phone_number', phoneNumber.replace('+', ''))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`❌ Usuário não encontrado com o telefone: ${phoneNumber}`);
        return null;
      }
      console.error('❌ Erro ao buscar usuário:', error.message);
      return null;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log(`   User ID: ${data.user_id}`);
    console.log(`   Phone: ${data.phone_number}`);
    console.log(`   Consent at: ${data.whatsapp_consent_at}`);
    console.log(`   Version: ${data.whatsapp_consent_version}`);
    console.log(`   Verified: ${data.whatsapp_verified}`);
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return null;
  }
}

/**
 * Gera o SQL para reset manual
 */
function generateResetSQL(userId, phoneNumber) {
  const sql = `-- Reset LGPD para o usuário ${userId}
-- Execute no SQL Editor do Supabase Dashboard

UPDATE lifetracker_profiles 
SET 
  whatsapp_consent_at = NULL,
  whatsapp_consent_version = NULL,
  whatsapp_verified = false
WHERE user_id = '${userId}';

-- Verificar resultado
SELECT user_id, phone_number, whatsapp_consent_at, whatsapp_consent_version, whatsapp_verified
FROM lifetracker_profiles 
WHERE user_id = '${userId}';`;
  
  return sql;
}

/**
 * Função principal
 */
async function main() {
  const phoneNumber = process.argv[2];
  
  if (!phoneNumber) {
    console.log('📋 Uso: node scripts/reset-user-lgpd-simple.js [telefone]');
    console.log('💡 Exemplo: node scripts/reset-user-lgpd-simple.js 556292451477');
    process.exit(1);
  }
  
  console.log('🚀 Reset LGPD - Life Track Growth (Versão Simplificada)\n');
  
  // 1. Buscar usuário
  const userData = await findUserByPhone(phoneNumber);
  
  if (!userData) {
    console.log('\n❌ Não foi possível encontrar o usuário');
    process.exit(1);
  }
  
  // 2. Gerar SQL para reset manual
  console.log('\n' + '='.repeat(60));
  console.log('📝 SQL PARA RESET MANUAL:');
  console.log('=' .repeat(60));
  
  const resetSQL = generateResetSQL(userData.user_id, phoneNumber);
  console.log(resetSQL);
  
  console.log('\n' + '='.repeat(60));
  console.log('🔧 INSTRUÇÕES:');
  console.log('=' .repeat(60));
  console.log('1. Copie o SQL acima');
  console.log('2. Acesse: https://supabase.com/dashboard/project/fjddlffnlbrhgogkyplq');
  console.log('3. Vá para: SQL Editor (no menu lateral)');
  console.log('4. Cole o SQL e clique em "Run"');
  console.log('5. Confirme que os campos estão NULL');
  
  console.log('\n💡 Após o reset:');
  console.log('   - Envie uma mensagem pelo WhatsApp');
  console.log('   - Deve receber o menu de consentimento novamente');
  console.log('   - Clique em ✅ ACEITO para testar o botão');
  
  console.log('\n🎉 Pronto para testar!');
}

main();
