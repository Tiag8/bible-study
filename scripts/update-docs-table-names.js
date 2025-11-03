#!/usr/bin/env node

/**
 * Atualiza referências às tabelas do Supabase na documentação
 * para incluir o prefixo 'lifetracker_'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeamento de nomes antigos para novos (com prefixo)
const TABLE_MAPPING = {
  'assessment_responses': 'lifetracker_assessment_responses',
  'assessment_sessions': 'lifetracker_assessment_sessions',
  'assessment_history': 'lifetracker_assessment_history',
  'wheel_of_life_areas': 'lifetracker_life_areas',
  'habit_categories': 'lifetracker_habit_categories',
  'habit_entries': 'lifetracker_habit_entries',
  'habit_refinements': 'lifetracker_habit_refinements',
  'coach_conversations': 'lifetracker_coach_conversations',
  'coach_sessions': 'lifetracker_coach_sessions',
  'coach_messages': 'lifetracker_coach_messages',
  'user_roles': 'lifetracker_user_roles',
  'user_onboarding': 'lifetracker_user_onboarding',
  'ai_suggestions': 'lifetracker_ai_suggestions',
  'daily_insights': 'lifetracker_daily_insights',
  'growth_insights': 'lifetracker_growth_insights',
  'focus_area_suggestions': 'lifetracker_focus_area_suggestions',
  'goal_entries': 'lifetracker_goal_entries',
  'change_logs': 'lifetracker_change_logs',
  'entity_versions': 'lifetracker_entity_versions',
  'life_areas': 'lifetracker_life_areas',
  'milestones': 'lifetracker_milestones',
  'identities': 'lifetracker_identities',
  'profiles': 'lifetracker_profiles',
  'habits': 'lifetracker_habits',
  'goals': 'lifetracker_goals',
};

// Arquivo a ser atualizado
const FILE_TO_UPDATE = 'docs/MIGRATION_GUIDE.md';

console.log('🔄 Atualizando referências às tabelas na documentação...\n');

const filePath = path.join(process.cwd(), FILE_TO_UPDATE);

if (!fs.existsSync(filePath)) {
  console.log(`⚠️  Arquivo não encontrado: ${FILE_TO_UPDATE}`);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');
let totalReplacements = 0;

// Aplicar substituições em ordem (do mais específico para o menos específico)
const sortedEntries = Object.entries(TABLE_MAPPING).sort((a, b) => b[0].length - a[0].length);

for (const [oldName, newName] of sortedEntries) {
  // Padrões de uso comum em documentação
  const patterns = [
    // 'tabela' em arrays JavaScript
    new RegExp(`'${oldName}'`, 'g'),
    // "tabela" em arrays JavaScript
    new RegExp(`"${oldName}"`, 'g'),
    // FROM tabela em SQL
    new RegExp(`FROM ${oldName}([\\s,;)]|$)`, 'gi'),
    // ON tabela em SQL
    new RegExp(`ON ${oldName}([\\s,;)]|$)`, 'gi'),
    // tabela.json em nomes de arquivo
    new RegExp(`${oldName}\\.json`, 'g'),
  ];

  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      totalReplacements += matches.length;

      // Substituir mantendo o formato original
      content = content.replace(
        new RegExp(`'${oldName}'`, 'g'),
        `'${newName}'`
      );
      content = content.replace(
        new RegExp(`"${oldName}"`, 'g'),
        `"${newName}"`
      );
      content = content.replace(
        new RegExp(`FROM ${oldName}([\\s,;)]|$)`, 'gi'),
        `FROM ${newName}$1`
      );
      content = content.replace(
        new RegExp(`ON ${oldName}([\\s,;)]|$)`, 'gi'),
        `ON ${newName}$1`
      );
      content = content.replace(
        new RegExp(`${oldName}\\.json`, 'g'),
        `${newName}.json`
      );
    }
  }
}

fs.writeFileSync(filePath, content, 'utf8');

console.log(`📊 RESUMO:`);
console.log(`   Arquivo processado: ${FILE_TO_UPDATE}`);
console.log(`   Total de substituições: ${totalReplacements}`);

if (totalReplacements > 0) {
  console.log(`\n✅ Documentação atualizada com sucesso!`);
  console.log(`\n⚠️  IMPORTANTE: Revise as alterações antes de commitar:`);
  console.log(`   git diff ${FILE_TO_UPDATE}`);
} else {
  console.log(`\nℹ️  Nenhuma substituição necessária.\n`);
}
