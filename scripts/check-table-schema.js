#!/usr/bin/env node

/**
 * Script para verificar schema da tabela de mensagens
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fjddlffnlbrhgogkyplq.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTableSchema() {
  console.log('🔍 Verificando schema da tabela lifetracker_coach_messages...\n');
  
  try {
    // Tentar buscar estrutura via SQL (se permitido)
    const { data, error } = await supabase
      .from('lifetracker_coach_messages')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar tabela:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📊 Colunas encontradas:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof data[0][key]}`);
      });
    } else {
      console.log('ℹ️ Tabela vazia, mas acesso concedido');
    }
    
    // Verificar se existe coluna message_id
    console.log('\n🔍 Verificando coluna message_id...');
    
    const { data: messageCheck, error: messageError } = await supabase
      .from('lifetracker_coach_messages')
      .select('message_id')
      .limit(1);
    
    if (messageError && messageError.message.includes('column "message_id" does not exist')) {
      console.log('❌ Coluna message_id não existe');
      console.log('💡 Precisamos adicionar esta coluna para deduplicação');
    } else if (!messageError) {
      console.log('✅ Coluna message_id existe');
    } else {
      console.log('⚠️ Erro ao verificar message_id:', messageError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

checkTableSchema();
