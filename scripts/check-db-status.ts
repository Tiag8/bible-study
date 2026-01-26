#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcqgalxnapxerqcycieu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcWdhbHhuYXB4ZXJxY3ljaWV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTg0NzExMiwiZXhwIjoyMDU1NDIzMTEyfQ.kmzqeSyE-KFYBQsrXFWflVl9wUU6pH1hyan6uVGhleA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Verificando estrutura do banco...\n');

  const tables = [
    'bible_studies',
    'bible_study_links', 
    'bible_backlog',
    'bible_tags',
    'bible_profiles'
  ];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${table}: ERRO - ${error.message}`);
    } else {
      console.log(`✅ ${table}: OK (${count} registros)`);
    }
  }

  console.log('\n📊 Verificando valores de status:');
  const { data: statuses } = await supabase
    .from('bible_studies')
    .select('status');
  
  if (statuses) {
    const uniqueStatuses = [...new Set(statuses.map(s => s.status))];
    console.log('Status disponíveis:', uniqueStatuses.join(', '));
  }

  console.log('\n✨ Verificação concluída!');
}

checkDatabase();
