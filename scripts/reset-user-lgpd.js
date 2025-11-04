#!/usr/bin/env node

/**
 * Script para resetar status LGPD de um usuário específico
 * Permite testar novamente o fluxo de consentimento
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://${SUPABASE_PROJECT_REF}.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
  console.log('💡 Adicione ao .env: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Reseta o status LGPD de um usuário
 */
async function resetUserLGPD(phoneOrUserId) {
  console.log('🔄 Resetando status LGPD do usuário...\n');
  
  try {
    // Tentar encontrar por phone_number primeiro
    let userId = phoneOrUserId;
    
    if (phoneOrUserId.startsWith('55') || phoneOrUserId.startsWith('+')) {
      // Buscar user_id pelo phone_number
      console.log(`🔍 Buscando usuário pelo telefone: ${phoneOrUserId}`);
      
      const { data: profileData, error: profileError } = await supabase
        .from('lifetracker_profiles')
        .select('user_id, phone_number, whatsapp_consent_at, whatsapp_consent_version')
        .eq('phone_number', phoneOrUserId.replace('+', ''))
        .single();
      
      if (profileError || !profileData) {
        console.log(`❌ Usuário não encontrado pelo telefone: ${phoneOrUserId}`);
        
        // Tentar buscar por user_id direto
        console.log(`🔍 Tentando buscar como user_id: ${phoneOrUserId}`);
        userId = phoneOrUserId;
      } else {
        userId = profileData.user_id;
        console.log(`✅ Usuário encontrado: ${userId}`);
        console.log(`📊 Status atual:`);
        console.log(`   - Phone: ${profileData.phone_number}`);
        console.log(`   - Consent at: ${profileData.whatsapp_consent_at}`);
        console.log(`   - Version: ${profileData.whatsapp_consent_version}`);
      }
    }
    
    // Confirmar operação
    console.log(`\n⚠️ ATENÇÃO: Isso irá resetar o consentimento LGPD do usuário ${userId}`);
    console.log('📋 O que será feito:');
    console.log('   1. Remover whatsapp_consent_at');
    console.log('   2. Remover whatsapp_consent_version');
    console.log('   3. Definir whatsapp_verified = false');
    console.log('   4. Manter outros dados intactos');
    
    // Prosseguir com reset
    console.log('\n🔧 Executando reset...');
    
    const { error: resetError } = await supabase
      .from('lifetracker_profiles')
      .update({
        whatsapp_consent_at: null,
        whatsapp_consent_version: null,
        whatsapp_verified: false,
      })
      .eq('user_id', userId);
    
    if (resetError) {
      console.error('❌ Erro ao resetar LGPD:', resetError);
      return false;
    }
    
    console.log('✅ Status LGPD resetado com sucesso!');
    
    // Verificar resultado
    const { data: checkData, error: checkError } = await supabase
      .from('lifetracker_profiles')
      .select('user_id, phone_number, whatsapp_consent_at, whatsapp_consent_version, whatsapp_verified')
      .eq('user_id', userId)
      .single();
    
    if (!checkError && checkData) {
      console.log('\n📊 Novo status:');
      console.log(`   - User ID: ${checkData.user_id}`);
      console.log(`   - Phone: ${checkData.phone_number}`);
      console.log(`   - Consent at: ${checkData.whatsapp_consent_at}`);
      console.log(`   - Version: ${checkData.whatsapp_consent_version}`);
      console.log(`   - Verified: ${checkData.whatsapp_verified}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

/**
 * Lista usuários com consentimento LGPD
 */
async function listLGPDUsers() {
  console.log('📋 Listando usuários com consentimento LGPD...\n');
  
  try {
    const { data, error } = await supabase
      .from('lifetracker_profiles')
      .select('user_id, phone_number, whatsapp_consent_at, whatsapp_consent_version, whatsapp_verified')
      .not('whatsapp_consent_at', 'is', null)
      .order('whatsapp_consent_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('ℹ️ Nenhum usuário com consentimento LGPD encontrado');
      return;
    }
    
    console.log(`📊 Encontrados ${data.length} usuários com consentimento:\n`);
    
    data.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.user_id}`);
      console.log(`   Phone: ${user.phone_number}`);
      console.log(`   Consent: ${user.whatsapp_consent_at}`);
      console.log(`   Version: ${user.whatsapp_consent_version}`);
      console.log(`   Verified: ${user.whatsapp_verified}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Script principal
async function main() {
  const command = process.argv[2];
  const target = process.argv[3];
  
  console.log('🚀 Script de Reset LGPD - Life Track Growth\n');
  
  switch (command) {
    case 'reset':
      if (!target) {
        console.error('❌ Informe o user_id ou telefone');
        console.log('💡 Exemplo: node scripts/reset-user-lgpd.js reset 556292451477');
        console.log('💡 Exemplo: node scripts/reset-user-lgpd.js reset auth_user_123');
        process.exit(1);
      }
      
      const success = await resetUserLGPD(target);
      process.exit(success ? 0 : 1);
      
    case 'list':
      await listLGPDUsers();
      break;
      
    default:
      console.log('📋 Uso:');
      console.log('   node scripts/reset-user-lgpd.js reset [telefone|user_id]');
      console.log('   node scripts/reset-user-lgpd.js list');
      console.log('\n💡 Exemplos:');
      console.log('   node scripts/reset-user-lgpd.js reset 556292451477');
      console.log('   node scripts/reset-user-lgpd.js reset auth_user_123');
      console.log('   node scripts/reset-user-lgpd.js list');
  }
}

main();
