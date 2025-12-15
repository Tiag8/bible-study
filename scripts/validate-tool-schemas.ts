#!/usr/bin/env npx ts-node

/**
 * Validate Tool Schemas
 * Verifica se as tools Gemini referenciam campos que existem no DB
 *
 * Uso: npx ts-node scripts/validate-tool-schemas.ts [target]
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const TOOLS_DIR = 'supabase/functions/_shared/tools';
const KNOWN_TABLES = [
  'lifetracker_habits',
  'lifetracker_habit_completions',
  'lifetracker_reminders',
  'lifetracker_goals',
  'lifetracker_goal_progress',
  'lifetracker_assessments',
  'lifetracker_assessment_answers',
  'lifetracker_users',
  'lifetracker_user_profiles',
  'lifetracker_life_areas',
  'lifetracker_chat_sessions',
  'lifetracker_chat_messages',
];

interface ValidationResult {
  tool: string;
  file: string;
  issues: string[];
  warnings: string[];
}

function extractTableReferences(content: string): string[] {
  const tablePattern = /lifetracker_\w+/g;
  const matches = content.match(tablePattern) || [];
  return [...new Set(matches)];
}

function validateToolFile(filePath: string, target?: string): ValidationResult {
  const content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split('/').pop() || filePath;

  const result: ValidationResult = {
    tool: fileName.replace('.ts', ''),
    file: filePath,
    issues: [],
    warnings: [],
  };

  // Se target especificado, só validar se o arquivo menciona o target
  if (target && !content.includes(target)) {
    return result;
  }

  // 1. Verificar tabelas referenciadas
  const tables = extractTableReferences(content);
  for (const table of tables) {
    if (!KNOWN_TABLES.includes(table)) {
      result.warnings.push(`Tabela '${table}' não está na lista conhecida - verificar se existe`);
    }
  }

  // 2. Verificar se há hardcoded field names que podem estar desatualizados
  const suspiciousPatterns = [
    { pattern: /streak_count/g, warning: 'Possível campo antigo: streak_count (atual: current_streak?)' },
    { pattern: /completedAt/g, warning: 'CamelCase detectado: completedAt (DB usa snake_case: completed_at)' },
    { pattern: /userId/g, warning: 'CamelCase detectado: userId (DB usa snake_case: user_id)' },
    { pattern: /habitId/g, warning: 'CamelCase detectado: habitId (DB usa snake_case: habit_id)' },
  ];

  for (const { pattern, warning } of suspiciousPatterns) {
    if (pattern.test(content)) {
      result.warnings.push(warning);
    }
  }

  // 3. Verificar se tool description está muito longa (>500 chars)
  const descMatch = content.match(/description:\s*[`"']([^`"']+)[`"']/);
  if (descMatch && descMatch[1].length > 500) {
    result.warnings.push(`Tool description muito longa (${descMatch[1].length} chars) - pode causar token overflow`);
  }

  // 4. Verificar se há TODOs ou FIXMEs
  if (/TODO|FIXME|HACK|XXX/i.test(content)) {
    result.warnings.push('Contém TODO/FIXME - revisar antes de deploy');
  }

  return result;
}

function main() {
  const target = process.argv[2];

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  TOOL SCHEMA VALIDATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  if (target) {
    console.log(`🎯 Target: ${target}`);
    console.log('');
  }

  let toolFiles: string[] = [];

  try {
    const files = readdirSync(TOOLS_DIR);
    toolFiles = files
      .filter(f => f.endsWith('.ts'))
      .map(f => join(TOOLS_DIR, f));
  } catch {
    console.log(`⚠️  Diretório ${TOOLS_DIR} não encontrado`);
    console.log('   Pulando validação de tools.');
    process.exit(0);
  }

  if (toolFiles.length === 0) {
    console.log('   (nenhuma tool encontrada)');
    process.exit(0);
  }

  let totalIssues = 0;
  let totalWarnings = 0;

  for (const file of toolFiles) {
    const result = validateToolFile(file, target);

    // Pular se não tem issues nem warnings
    if (result.issues.length === 0 && result.warnings.length === 0) {
      continue;
    }

    console.log(`📦 ${result.tool}`);
    console.log(`   ${result.file}`);

    for (const issue of result.issues) {
      console.log(`   ❌ ${issue}`);
      totalIssues++;
    }

    for (const warning of result.warnings) {
      console.log(`   ⚠️  ${warning}`);
      totalWarnings++;
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Tools analisadas: ${toolFiles.length}`);
  console.log(`   Issues: ${totalIssues}`);
  console.log(`   Warnings: ${totalWarnings}`);
  console.log('');

  if (totalIssues > 0) {
    console.log('❌ FALHOU - Corrija os issues antes de prosseguir');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('⚠️  PASSOU COM WARNINGS - Revisar antes de deploy');
    process.exit(0);
  } else {
    console.log('✅ PASSOU - Nenhum problema encontrado');
    process.exit(0);
  }
}

main();
