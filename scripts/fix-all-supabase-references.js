#!/usr/bin/env node

/**
 * Script para corrigir todas as referências ao Supabase
 * Substitui projetos inválidos pelo projeto válido fjddlffnlbrhgogkyplq
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_PROJECT_ID = 'fjddlffnlbrhgogkyplq';
const VALID_URL = 'https://fjddlffnlbrhgogkyplq.supabase.co';

// Mapeamento de substituições
const REPLACEMENTS = [
  {
    from: 'https://fjddlffnlbrhgogkyplq.supabase.co',
    to: VALID_URL
  },
  {
    from: 'https://fjddlffnlbrhgogkyplq.supabase.co',
    to: VALID_URL
  },
  {
    from: 'https://fjddlffnlbrhgogkyplq.supabase.co',
    to: VALID_URL
  },
  {
    from: 'db.fjddlffnlbrhgogkyplq.supabase.co',
    to: 'db.fjddlffnlbrhgogkyplq.supabase.co'
  },
  {
    from: '"project_id": "fjddlffnlbrhgogkyplq"',
    to: `"project_id": "${VALID_PROJECT_ID}"`
  },
  {
    from: '"project_id": "fjddlffnlbrhgogkyplq"',
    to: `"project_id": "${VALID_PROJECT_ID}"`
  }
];

// Arquivos para ignorar (documentação histórica)
const IGNORE_FILES = [
  'docs/MIGRATION_GUIDE.md',
  'SUPABASE_MIGRATION_SUMMARY.md',
  'MIGRATION_SUCCESS.md',
  'SESSION_SUMMARY.md'
];

// Arquivos críticos para processar
const CRITICAL_FILES = [
  '.env',
  'migration.config.json',
  'scripts/smoke-test-lgpd-buttons.js',
  'scripts/export-from-lovable.js',
  'scripts/migrate-data-with-new-uuid.js',
  'scripts/migrate-user-and-data.js',
  'scripts/migrate-data-from-lovable.js',
  'scripts/migrate-auth-password.js',
  'scripts/check-auth-users-lovable.js',
  'copy-password-from-lovable.js'
];

function shouldIgnoreFile(filePath) {
  return IGNORE_FILES.some(ignoreFile => filePath.includes(ignoreFile));
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const replacement of REPLACEMENTS) {
      if (content.includes(replacement.from)) {
        content = content.replaceAll(replacement.from, replacement.to);
        changed = true;
        console.log(`✅ ${filePath}: Substituído ${replacement.from} -> ${replacement.to}`);
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Erro ao processar ${filePath}: ${error.message}`);
    return false;
  }
}

console.log('🔧 Corrigindo referências ao Supabase...\n');

let fixedCount = 0;

// Processar arquivos críticos
console.log('📋 Arquivos críticos:');
for (const file of CRITICAL_FILES) {
  const filePath = path.join(__dirname, '..', file);
  
  if (shouldIgnoreFile(filePath)) {
    console.log(`⏭️  ${file} - Ignorado (documentação histórica)`);
    continue;
  }
  
  if (fs.existsSync(filePath)) {
    const changed = fixFile(filePath);
    if (changed) {
      fixedCount++;
    } else {
      console.log(`✅ ${file} - Já atualizado`);
    }
  } else {
    console.log(`❌ ${file} - Arquivo não encontrado`);
  }
}

// Processar todos os scripts JS
console.log('\n📂 Scripts JavaScript:');
const scriptsDir = path.join(__dirname, '..', 'scripts');
if (fs.existsSync(scriptsDir)) {
  const scripts = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
  
  for (const script of scripts) {
    const filePath = path.join(scriptsDir, script);
    
    if (shouldIgnoreFile(filePath)) {
      console.log(`⏭️  scripts/${script} - Ignorado`);
      continue;
    }
    
    const changed = fixFile(filePath);
    if (changed) {
      fixedCount++;
    }
  }
}

// Processar arquivos JSON
console.log('\n📄 Arquivos JSON:');
const jsonFiles = [
  'migration.config.json',
  'new-supabase-test-report.json'
];

for (const file of jsonFiles) {
  const filePath = path.join(__dirname, '..', file);
  
  if (shouldIgnoreFile(filePath)) {
    console.log(`⏭️  ${file} - Ignorado`);
    continue;
  }
  
  if (fs.existsSync(filePath)) {
    const changed = fixFile(filePath);
    if (changed) {
      fixedCount++;
    }
  }
}

// Resumo
console.log('\n📊 Resumo:');
console.log(`✅ Arquivos corrigidos: ${fixedCount}`);
console.log(`🎯 Projeto válido: ${VALID_PROJECT_ID}`);
console.log(`🌐 URL válida: ${VALID_URL}`);

if (fixedCount > 0) {
  console.log('\n🎉 Todas as referências foram atualizadas!');
  console.log('💡 Execute novamente o script de verificação para confirmar:');
  console.log('   node scripts/verify-supabase-references.js');
} else {
  console.log('\n✅ Nenhuma alteração necessária.');
}
