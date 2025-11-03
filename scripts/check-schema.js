#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Verificando schema das tabelas coach...\n');

async function checkSchema() {
  // Verificar lifetracker_coach_conversations
  console.log('1️⃣ Tabela: lifetracker_coach_conversations');
  const { data: convs, error: convErr } = await supabase
    .from('lifetracker_coach_conversations')
    .select('*')
    .limit(1);

  if (convErr) {
    console.error('❌ Erro:', convErr.message);
  } else if (convs && convs.length > 0) {
    console.log('✅ Colunas:', Object.keys(convs[0]).join(', '));
    console.log('📊 Exemplo:', JSON.stringify(convs[0], null, 2));
  } else {
    console.log('⚠️ Tabela vazia');
  }

  console.log('\n2️⃣ Tabela: lifetracker_coach_messages');
  const { data: msgs, error: msgErr } = await supabase
    .from('lifetracker_coach_messages')
    .select('*')
    .limit(1);

  if (msgErr) {
    console.error('❌ Erro:', msgErr.message);
  } else if (msgs && msgs.length > 0) {
    console.log('✅ Colunas:', Object.keys(msgs[0]).join(', '));
    console.log('📊 Exemplo:', JSON.stringify(msgs[0], null, 2));
  } else {
    console.log('⚠️ Tabela vazia');
  }

  // Verificar VITE_SUPABASE_ANON_KEY
  console.log('\n3️⃣ Testando VITE_SUPABASE_ANON_KEY...');
  const anonClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data: testData, error: testErr } = await anonClient
    .from('lifetracker_coach_conversations')
    .select('id')
    .limit(1);

  if (testErr) {
    console.error('❌ ANON_KEY não funciona:', testErr.message);
  } else {
    console.log('✅ ANON_KEY funciona!');
  }
}

checkSchema();
