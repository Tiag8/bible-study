#!/usr/bin/env node

/**
 * Script de verificação de referências ao Supabase
 * Verifica se todos os arquivos usam apenas o projeto válido: fjddlffnlbrhgogkyplq
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_PROJECT_ID = 'fjddlffnlbrhgogkyplq';
const VALID_URL = 'https://fjddlffnlbrhgogkyplq.supabase.co';

// Projetos inválidos que devem ser substituídos
const INVALID_PROJECTS = [
  'azyqkstjgdplzhnppdgh',
  'ybxznkqqjifchvkigqnr',
  'clteam'
];

const INVALID_URLS = [
  'https://azyqkstjgdplzhnppdgh.supabase.co',
  'https://ybxznkqqjifchvkigqnr.supabase.co',
  'https://clteam.supabase.co'
];

// Arquivos críticos para verificar
const CRITICAL_FILES = [
  '.env',
  '.env.example',
  '.dockerenv.example',
  '.env.import.example',
  'supabase/config.toml',
  'migration.config.json',
  'scripts/smoke-test-lgpd-buttons.js'
];

// Arquivos que podem ter referências históricas (aceitáveis)
const HISTORICAL_FILES = [
  'docs/MIGRATION_GUIDE.md',
  'SUPABASE_MIGRATION_SUMMARY.md'
];

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Verificar project IDs inválidos
    for (const invalidId of INVALID_PROJECTS) {
      if (content.includes(invalidId)) {
        issues.push(`Found invalid project ID: ${invalidId}`);
      }
    }
    
    // Verificar URLs inválidas
    for (const invalidUrl of INVALID_URLS) {
      if (content.includes(invalidUrl)) {
        issues.push(`Found invalid URL: ${invalidUrl}`);
      }
    }
    
    // Verificar se usa o projeto válido
    if (!content.includes(VALID_PROJECT_ID) && !content.includes('seu-projeto') && !content.includes('your-project') && !content.includes('[seu-novo-projeto]')) {
      issues.push(`Missing valid project ID: ${VALID_PROJECT_ID}`);
    }
    
    return issues;
  } catch (error) {
    return [`Error reading file: ${error.message}`];
  }
}

console.log('🔍 Verificando referências ao Supabase...\n');

let hasErrors = false;

// Verificar arquivos críticos
console.log('📋 Arquivos críticos:');
for (const file of CRITICAL_FILES) {
  const filePath = path.join(__dirname, '..', file);
  const issues = checkFile(filePath);
  
  if (issues.length === 0) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - ${issues.length} problemas:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
    hasErrors = true;
  }
}

// Verificar scripts
console.log('\n📂 Scripts:');
const scriptsDir = path.join(__dirname, '..', 'scripts');
if (fs.existsSync(scriptsDir)) {
  const scripts = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
  
  for (const script of scripts) {
    const filePath = path.join(scriptsDir, script);
    const issues = checkFile(filePath);
    
    if (issues.length === 0) {
      console.log(`✅ scripts/${script} - OK`);
    } else {
      console.log(`❌ scripts/${script} - ${issues.length} problemas:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      hasErrors = true;
    }
  }
}

// Verificar arquivos de ambiente das edge functions
console.log('\n⚡ Edge Functions:');
const webhookEnvPath = path.join(__dirname, '..', 'supabase', 'functions', 'webhook-whatsapp-adapter', '.env.example');
if (fs.existsSync(webhookEnvPath)) {
  const issues = checkFile(webhookEnvPath);
  
  if (issues.length === 0) {
    console.log('✅ webhook-whatsapp-adapter/.env.example - OK');
  } else {
    console.log(`❌ webhook-whatsapp-adapter/.env.example - ${issues.length} problemas:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
    hasErrors = true;
  }
}

// Resumo
console.log('\n📊 Resumo:');
if (hasErrors) {
  console.log('❌ Foram encontradas referências inválidas ao Supabase!');
  console.log('👆 Corrija os problemas listados acima.');
  process.exit(1);
} else {
  console.log('✅ Todas as referências críticas estão usando o projeto válido!');
  console.log(`🎯 Projeto válido: ${VALID_PROJECT_ID}`);
  console.log(`🌐 URL válida: ${VALID_URL}`);
  console.log('\n📝 Nota: Arquivos de documentação podem ter referências históricas, o que é aceitável.');
}
