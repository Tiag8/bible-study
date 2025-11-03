#!/usr/bin/env node

/**
 * Atualiza referências às tabelas do Supabase no código fonte
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

// Arquivos a serem atualizados (encontrados via grep)
const FILES_TO_UPDATE = [
  'src/pages/Results.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Coach.tsx',
  'src/pages/Auth.tsx',
  'src/pages/AssessmentHistory.tsx',
  'src/pages/Assessment.tsx',
  'src/pages/Admin.tsx',
  'src/hooks/useWeeklyProgress.ts',
  'src/hooks/useMonthlyProgress.ts',
  'src/hooks/useMetricsData.ts',
  'src/hooks/useDashboardData.ts',
  'src/hooks/useCardDelete.ts',
  'src/contexts/OnboardingContext.tsx',
  'src/components/shared/EntityTimeline.tsx',
  'src/components/metrics/DayDetailsPanel.tsx',
  'src/components/habits/HabitRefinementPanel.tsx',
  'src/components/dashboard/HabitHistory.tsx',
  'src/components/dashboard/HabitCard.tsx',
  'src/components/dashboard/GoalCard.tsx',
  'src/components/dashboard/AddHabitDialog.tsx',
  'src/components/dashboard/AddGoalDialog.tsx',
  'src/components/coach/CoachChatInterface.tsx',
];

console.log('🔄 Atualizando referências às tabelas do Supabase...\n');

let totalReplacements = 0;
const filesUpdated = [];

for (const relativeFilePath of FILES_TO_UPDATE) {
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
    filesUpdated.push(relativeFilePath);
    totalReplacements += fileReplacements;
    console.log(`✅ ${relativeFilePath} (${fileReplacements} substituições)`);
  } else {
    console.log(`⏭️  ${relativeFilePath} (nenhuma alteração)`);
  }
}

console.log(`\n📊 RESUMO:`);
console.log(`   Arquivos processados: ${FILES_TO_UPDATE.length}`);
console.log(`   Arquivos atualizados: ${filesUpdated.length}`);
console.log(`   Total de substituições: ${totalReplacements}`);

if (filesUpdated.length > 0) {
  console.log(`\n✅ Código atualizado com sucesso!`);
  console.log(`\n📝 Arquivos modificados:`);
  filesUpdated.forEach(file => console.log(`   - ${file}`));

  console.log(`\n⚠️  IMPORTANTE: Revise as alterações antes de commitar:`);
  console.log(`   git diff src/`);
  console.log(`\n🧪 Próximos passos:`);
  console.log(`   1. Atualizar Edge Functions (supabase/functions/)`);
  console.log(`   2. Testar aplicação: npm run dev`);
  console.log(`   3. Verificar no navegador: http://localhost:8080\n`);
} else {
  console.log(`\nℹ️  Nenhum arquivo precisou ser atualizado.\n`);
}
