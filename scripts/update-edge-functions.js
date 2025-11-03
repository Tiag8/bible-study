#!/usr/bin/env node

/**
 * Atualiza referências às tabelas do Supabase nas Edge Functions
 * para incluir o prefixo 'lifetracker_'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeamento de nomes antigos para novos (com prefixo)
const TABLE_MAPPING = {
  'profiles': 'lifetracker_profiles',
  'habits': 'lifetracker_habits',
  'habit_entries': 'lifetracker_habit_entries',
  'habit_categories': 'lifetracker_habit_categories',
  'habit_refinements': 'lifetracker_habit_refinements',
  'goals': 'lifetracker_goals',
  'goal_entries': 'lifetracker_goal_entries',
  'assessment_history': 'lifetracker_assessment_history',
  'assessment_responses': 'lifetracker_assessment_responses',
  'ai_suggestions': 'lifetracker_ai_suggestions',
  'coach_conversations': 'lifetracker_coach_conversations',
  'coach_messages': 'lifetracker_coach_messages',
  'change_logs': 'lifetracker_change_logs',
  'milestones': 'lifetracker_milestones',
  'entity_versions': 'lifetracker_entity_versions',
  'user_roles': 'lifetracker_user_roles',
  'user_onboarding': 'lifetracker_user_onboarding',
  'life_areas': 'lifetracker_life_areas',
  'daily_insights': 'lifetracker_daily_insights',
  'growth_insights': 'lifetracker_growth_insights',
  'focus_area_suggestions': 'lifetracker_focus_area_suggestions',
};

// Edge Functions a serem atualizadas
const FUNCTIONS_TO_UPDATE = [
  'supabase/functions/analyze-assessment/index.ts',
  'supabase/functions/analyze-habit-performance/index.ts',
  'supabase/functions/coach-chat/index.ts',
  'supabase/functions/compare-assessments/index.ts',
];

console.log('🔄 Atualizando Edge Functions do Supabase...\n');

let totalReplacements = 0;
const functionsUpdated = [];

for (const relativeFilePath of FUNCTIONS_TO_UPDATE) {
  const filePath = path.join(process.cwd(), relativeFilePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${relativeFilePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;
  let modified = false;

  // Aplicar todas as substituições
  for (const [oldName, newName] of Object.entries(TABLE_MAPPING)) {
    // Padrões de uso comum no código
    const patterns = [
      // .from('tabela') ou .from("tabela")
      new RegExp(`\\.from\\(['"]${oldName}['"]\\)`, 'g'),
      // .table('tabela')
      new RegExp(`\\.table\\(['"]${oldName}['"]\\)`, 'g'),
      // tabela: 'nome'
      new RegExp(`table:\\s*['"]${oldName}['"]`, 'g'),
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        fileReplacements += matches.length;
        modified = true;

        // Substituir mantendo o estilo de aspas original
        content = content.replace(
          new RegExp(`\\.from\\(['"]${oldName}['"]\\)`, 'g'),
          `.from('${newName}')`
        );
        content = content.replace(
          new RegExp(`\\.table\\(['"]${oldName}['"]\\)`, 'g'),
          `.table('${newName}')`
        );
        content = content.replace(
          new RegExp(`table:\\s*['"]${oldName}['"]`, 'g'),
          `table: '${newName}'`
        );
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    functionsUpdated.push(relativeFilePath);
    totalReplacements += fileReplacements;
    console.log(`✅ ${relativeFilePath} (${fileReplacements} substituições)`);
  } else {
    console.log(`⏭️  ${relativeFilePath} (nenhuma alteração)`);
  }
}

console.log(`\n📊 RESUMO:`);
console.log(`   Edge Functions processadas: ${FUNCTIONS_TO_UPDATE.length}`);
console.log(`   Edge Functions atualizadas: ${functionsUpdated.length}`);
console.log(`   Total de substituições: ${totalReplacements}`);

if (functionsUpdated.length > 0) {
  console.log(`\n✅ Edge Functions atualizadas com sucesso!`);
  console.log(`\n📝 Funções modificadas:`);
  functionsUpdated.forEach(func => console.log(`   - ${func}`));

  console.log(`\n⚠️  IMPORTANTE: Faça deploy das Edge Functions:`);
  functionsUpdated.forEach(func => {
    const funcName = func.split('/')[2]; // Extrai nome da pasta
    console.log(`   supabase functions deploy ${funcName}`);
  });

  console.log(`\n🧪 Ou faça deploy de todas de uma vez:`);
  const uniqueFuncNames = [...new Set(functionsUpdated.map(f => f.split('/')[2]))];
  if (uniqueFuncNames.length > 1) {
    console.log(`   supabase functions deploy ${uniqueFuncNames.join(' ')}`);
  }
  console.log();
} else {
  console.log(`\nℹ️  Nenhuma Edge Function precisou ser atualizada.\n`);
}
