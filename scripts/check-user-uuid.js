#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const lovableUserId = 'c68aac85-0829-4eed-9c32-ef09b28e4cc3';

// Buscar usuário via Admin API
const { data, error } = await client.auth.admin.listUsers();

if (error) {
  console.error('Erro:', error);
  process.exit(1);
}

const user = data.users.find(u => u.email === 'tiag8guimaraes@gmail.com');

console.log('\n📊 Comparação de UUIDs\n');
console.log('Lovable User ID:', lovableUserId);
console.log('Novo Supabase ID:', user?.id || 'USUÁRIO NÃO ENCONTRADO');
console.log('\nMatch:', user?.id === lovableUserId ? '✅ MESMO UUID - migração vai funcionar!' : '❌ UUIDs DIFERENTES - precisa ajuste');

if (user && user.id !== lovableUserId) {
  console.log('\n⚠️  AÇÃO NECESSÁRIA:');
  console.log('   1. Deletar usuário atual do novo Supabase');
  console.log('   2. Recriar com UUID do Lovable');
}
