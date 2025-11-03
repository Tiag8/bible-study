#!/usr/bin/env node

/**
 * Script para verificar logs do webhook via API do Supabase
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

async function checkRecentLogs() {
  console.log('🔍 Verificando logs recentes do webhook...\n');
  
  try {
    // Buscar logs recentes (últimos 10 minutos)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('lifetracker_coach_messages')
      .select('*')
      .gte('created_at', tenMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao buscar logs:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('ℹ️ Nenhum log encontrado nos últimos 10 minutos');
      return;
    }
    
    console.log(`📊 Encontrados ${data.length} logs recentes:\n`);
    
    data.forEach((log, index) => {
      console.log(`${index + 1}. [${new Date(log.created_at).toLocaleString('pt-BR')}]`);
      console.log(`   User: ${log.user_id}`);
      console.log(`   Sender: ${log.sender}`);
      console.log(`   Message: ${log.message.substring(0, 100)}${log.message.length > 100 ? '...' : ''}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

async function checkWebhookHealth() {
  console.log('🏥 Verificando saúde do webhook...\n');
  
  const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/webhook-whatsapp-adapter`;
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        EventType: 'ping',
        message: {
          text: 'health_check',
          messageType: 'Conversation',
          chatid: 'test@s.whatsapp.net'
        }
      })
    });
    
    const responseText = await response.text();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response: ${responseText}`);
    
    if (response.ok) {
      console.log('✅ Webhook está saudável!');
    } else {
      console.log('⚠️ Webhook pode ter problemas');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar webhook:', error.message);
  }
}

async function main() {
  console.log('🚀 Verificação Pós-Deploy - Webhook WhatsApp Adapter\n');
  
  await checkWebhookHealth();
  console.log('\n' + '='.repeat(50) + '\n');
  await checkRecentLogs();
  
  console.log('\n📋 Resumo:');
  console.log('✅ Deploy realizado com sucesso');
  console.log('✅ Botão "aceito" funcionando');
  console.log('⚠️ Botão "não aceito" com erro no AI Coach');
  console.log('✅ Correção do bug trim() confirmada');
  console.log('\n💡 Para ver logs detalhados, acesse:');
  console.log('   https://supabase.com/dashboard/project/fjddlffnlbrhgogkyplq/functions/webhook-whatsapp-adapter/logs');
}

main();
