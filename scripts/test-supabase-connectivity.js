#!/usr/bin/env node

/**
 * Script de teste de conectividade com o Supabase
 * Verifica se o projeto válido fjddlffnlbrhgogkyplq está acessível
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const PROJECT_ID = 'fjddlffnlbrhgogkyplq';
const PROJECT_URL = 'https://fjddlffnlbrhgogkyplq.supabase.co';

// Carregar credenciais do ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || PROJECT_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔌 Testando conectividade com o Supabase...\n');

// Verificar variáveis de ambiente
console.log('📋 Configuração:');
console.log(`🌐 URL: ${SUPABASE_URL}`);
console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY ? 'Configurada' : '❌ Não configurada'}`);

if (!SUPABASE_ANON_KEY) {
  console.log('\n❌ Erro: VITE_SUPABASE_ANON_KEY não encontrada no ambiente!');
  console.log('💡 Configure a variável no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnectivity() {
  try {
    console.log('\n🔄 Testando conexão...');
    
    // Teste 1: Verificar se o projeto está acessível
    const { data: projectInfo, error: projectError } = await supabase
      .from('_supabase_health_check')
      .select('*')
      .limit(1);
    
    if (projectError && projectError.code !== 'PGRST116') {
      throw projectError;
    }
    
    console.log('✅ Projeto acessível');
    
    // Teste 2: Verificar se as tabelas do life tracker existem
    console.log('\n📊 Verificando tabelas do Life Tracker...');
    
    const tables = [
      'lifetracker_profiles',
      'lifetracker_habits',
      'lifetracker_goals',
      'lifetracker_assessment_history'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: Erro - ${error.message}`);
        } else {
          console.log(`✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Erro inesperado - ${err.message}`);
      }
    }
    
    // Teste 3: Verificar Edge Functions
    console.log('\n⚡ Verificando Edge Functions...');
    
    const functions = [
      'webhook-whatsapp-adapter',
      'analyze-habits',
      'generate-insights'
    ];
    
    for (const funcName of functions) {
      try {
        const response = await fetch(`${PROJECT_URL}/functions/v1/${funcName}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok || response.status === 405) {
          console.log(`✅ ${funcName}: OK`);
        } else {
          console.log(`⚠️  ${funcName}: Status ${response.status}`);
        }
      } catch (err) {
        console.log(`❌ ${funcName}: Erro - ${err.message}`);
      }
    }
    
    console.log('\n🎉 Teste de conectividade concluído!');
    console.log(`🎯 Projeto: ${PROJECT_ID}`);
    console.log(`🌐 Dashboard: https://supabase.com/dashboard/project/${PROJECT_ID}`);
    
  } catch (error) {
    console.log('\n❌ Erro durante o teste de conectividade:');
    console.log(error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 Verifique se a VITE_SUPABASE_ANON_KEY está correta');
    } else if (error.message.includes('fetch')) {
      console.log('\n💡 Verifique sua conexão com a internet');
    } else {
      console.log('\n💡 Verifique se o projeto Supabase está ativo');
    }
    
    process.exit(1);
  }
}

// Executar teste
testConnectivity();
