#!/usr/bin/env tsx
/**
 * Script para deletar estudos duplicados de "2 Samuel 11"
 * Execute com: node -r dotenv/config scripts/delete-duplicates.ts dotenv_config_path=.env.local
 * Ou: NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/delete-duplicates.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcqgalxnapxerqcycieu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcWdhbHhuYXB4ZXJxY3ljaWV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTg0NzExMiwiZXhwIjoyMDU1NDIzMTEyfQ.kmzqeSyE-KFYBQsrXFWflVl9wUU6pH1hyan6uVGhleA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicates() {
  console.log('🔍 Buscando estudos de "2 Samuel" capítulo 11...\n');

  // Buscar todos os estudos de 2 Samuel 11
  const { data: studies, error } = await supabase
    .from('bible_studies')
    .select('id, title, book_name, chapter_number, created_at')
    .eq('book_name', '2 Samuel')
    .eq('chapter_number', 11)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erro ao buscar estudos:', error);
    return;
  }

  if (!studies || studies.length === 0) {
    console.log('✅ Nenhum estudo de "2 Samuel 11" encontrado.');
    return;
  }

  console.log(`📊 Encontrados ${studies.length} estudo(s):\n`);
  studies.forEach((study, index) => {
    console.log(`${index + 1}. ${study.title}`);
    console.log(`   ID: ${study.id}`);
    console.log(`   Criado em: ${new Date(study.created_at).toLocaleString('pt-BR')}\n`);
  });

  // Se houver duplicados (mais de 1), deletar todos exceto o primeiro
  if (studies.length > 1) {
    const toDelete = studies.slice(1); // Pegar todos exceto o primeiro
    console.log(`🗑️  Deletando ${toDelete.length} duplicado(s)...\n`);

    for (const study of toDelete) {
      const { error: deleteError } = await supabase
        .from('bible_studies')
        .delete()
        .eq('id', study.id);

      if (deleteError) {
        console.error(`❌ Erro ao deletar ${study.id}:`, deleteError);
      } else {
        console.log(`✅ Deletado: ${study.title} (${study.id})`);
      }
    }

    console.log('\n✨ Limpeza concluída!');
  } else {
    console.log('✅ Apenas 1 estudo encontrado. Nenhuma duplicata para deletar.');
  }
}

deleteDuplicates();
