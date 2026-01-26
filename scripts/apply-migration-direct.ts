import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carregar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Criar client com service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function applyMigration() {
  console.log('📄 Aplicando migration: 20250125_002_update_study_status.sql');

  try {
    // 1. Remover constraint antiga
    console.log('  → Removendo constraint antiga...');
    const { error: dropError } = await supabase.rpc('query', {
      query: 'ALTER TABLE bible_studies DROP CONSTRAINT IF EXISTS bible_studies_status_check;'
    }).single();

    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('❌ Erro ao remover constraint:', dropError);
    }

    // 2. Adicionar nova constraint
    console.log('  → Adicionando nova constraint...');
    const { error: addError } = await supabase.rpc('query', {
      query: "ALTER TABLE bible_studies ADD CONSTRAINT bible_studies_status_check CHECK (status IN ('estudando', 'revisando', 'concluído'));"
    }).single();

    if (addError) {
      console.error('❌ Erro ao adicionar constraint:', addError);
      throw addError;
    }

    // 3. Migrar dados existentes
    console.log('  → Migrando dados existentes...');
    const { error: updateError } = await supabase.rpc('query', {
      query: `UPDATE bible_studies SET status = CASE
        WHEN status = 'draft' THEN 'estudando'
        WHEN status = 'completed' THEN 'concluído'
        ELSE 'estudando'
      END;`
    }).single();

    if (updateError) {
      console.error('❌ Erro ao migrar dados:', updateError);
      throw updateError;
    }

    // 4. Atualizar default
    console.log('  → Atualizando default...');
    const { error: defaultError } = await supabase.rpc('query', {
      query: "ALTER TABLE bible_studies ALTER COLUMN status SET DEFAULT 'estudando';"
    }).single();

    if (defaultError) {
      console.error('❌ Erro ao atualizar default:', defaultError);
      throw defaultError;
    }

    console.log('✅ Migration aplicada com sucesso!');
  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

applyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
