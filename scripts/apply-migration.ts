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

// Criar client com service role key (necessário para DDL)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration(migrationFile: string) {
  console.log(`📄 Lendo migration: ${migrationFile}`);

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('🔄 Aplicando migration...');

  // Executar SQL via RPC (Supabase não permite DDL via client diretamente)
  // Vamos executar statement por statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    console.log(`  → Executando: ${statement.substring(0, 60)}...`);

    const { error } = await supabase.rpc('exec_sql', {
      sql_string: statement + ';'
    });

    if (error) {
      console.error('❌ Erro ao executar statement:', error);
      process.exit(1);
    }
  }

  console.log('✅ Migration aplicada com sucesso!');
}

// Executar
applyMigration('20250125_002_update_study_status.sql')
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
