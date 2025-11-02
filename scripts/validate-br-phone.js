#!/usr/bin/env node

// ============================================================================
// Life Tracker - Validador de Telefone Brasileiro
// ============================================================================
// Descrição: Valida e normaliza números de telefone brasileiros
// Uso: node scripts/validate-br-phone.js "(11) 98765-4321"
// Autor: Life Tracker Team
// Data: 2025-11-02
// ============================================================================

/**
 * Valida e normaliza número de telefone brasileiro
 *
 * Suporta formatos:
 * - (11) 98765-4321
 * - 11987654321
 * - +55 11 98765-4321
 * - 5511987654321
 * - 11 98765-4321
 * - 1198765-4321
 *
 * @param {string} phone - Número de telefone a validar
 * @returns {Object} Resultado da validação
 */
function validateBrazilianPhone(phone) {
  // Resultado padrão
  const result = {
    valid: false,
    normalized: null,
    type: null,
    area: null,
    error: null,
    suggestion: null
  };

  // Validar entrada
  if (!phone || typeof phone !== 'string') {
    result.error = 'Número de telefone inválido ou vazio';
    return result;
  }

  // Remover todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');

  // Validar comprimento
  if (cleaned.length < 10 || cleaned.length > 13) {
    result.error = 'Número de telefone deve ter entre 10 e 13 dígitos';
    result.suggestion = 'Formato esperado: (11) 98765-4321 ou 11987654321';
    return result;
  }

  // Remover código do país se presente (+55)
  let number = cleaned;
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    number = cleaned.substring(2);
  }

  // Extrair DDD (código de área)
  const area = number.substring(0, 2);
  const areaNumber = parseInt(area, 10);

  // Validar DDD (11-99 são válidos no Brasil)
  if (areaNumber < 11 || areaNumber > 99) {
    result.error = `DDD inválido: ${area}`;
    result.suggestion = 'DDDs válidos no Brasil: 11-99';
    return result;
  }

  // Extrair número local (sem DDD)
  let localNumber = number.substring(2);

  // Verificar se precisa adicionar o 9º dígito
  if (localNumber.length === 8) {
    const firstDigit = localNumber[0];

    // Celulares começam com 9, 8 ou 7 (após adicionar o 9º dígito)
    // Se não tem o 9º dígito e começa com 6-9, adicionar 9
    if (['6', '7', '8', '9'].includes(firstDigit)) {
      localNumber = '9' + localNumber;
      result.suggestion = 'Adicionado 9º dígito automaticamente (celular)';
    }
  }

  // Validar comprimento final
  if (localNumber.length !== 8 && localNumber.length !== 9) {
    result.error = `Número local inválido: deve ter 8 ou 9 dígitos (tem ${localNumber.length})`;
    return result;
  }

  // Determinar tipo (celular ou fixo)
  const firstDigit = localNumber[0];
  let type;

  if (localNumber.length === 9) {
    // Número com 9 dígitos
    if (firstDigit === '9') {
      type = 'mobile';
    } else {
      result.error = 'Número com 9 dígitos deve começar com 9 (celular)';
      return result;
    }
  } else {
    // Número com 8 dígitos
    if (['2', '3', '4', '5'].includes(firstDigit)) {
      type = 'landline';
    } else {
      result.error = 'Número com 8 dígitos deve começar com 2-5 (fixo)';
      result.suggestion = 'Se for celular, adicione o 9º dígito';
      return result;
    }
  }

  // Validar padrões específicos
  // Números não podem ter todos os dígitos iguais
  const allSame = /^(\d)\1+$/.test(localNumber);
  if (allSame) {
    result.error = 'Número inválido: todos os dígitos são iguais';
    return result;
  }

  // Montar número normalizado
  const normalized = `+55${area}${localNumber}`;
  const formatted = `+55 (${area}) ${localNumber.substring(0, localNumber.length - 4)}-${localNumber.substring(localNumber.length - 4)}`;

  // Retornar resultado válido
  result.valid = true;
  result.normalized = normalized;
  result.formatted = formatted;
  result.type = type;
  result.area = area;

  return result;
}

/**
 * Exibe ajuda do comando
 */
function showHelp() {
  console.log('Validador de Telefone Brasileiro - Life Tracker');
  console.log('');
  console.log('Uso:');
  console.log('  node scripts/validate-br-phone.js <número>');
  console.log('');
  console.log('Formatos suportados:');
  console.log('  - (11) 98765-4321');
  console.log('  - 11987654321');
  console.log('  - +55 11 98765-4321');
  console.log('  - 5511987654321');
  console.log('  - 11 98765-4321');
  console.log('  - 1198765-4321');
  console.log('');
  console.log('Exemplos:');
  console.log('  node scripts/validate-br-phone.js "(11) 98765-4321"');
  console.log('  node scripts/validate-br-phone.js "11987654321"');
  console.log('  node scripts/validate-br-phone.js "+55 21 3333-4444"');
  console.log('');
  console.log('Saída:');
  console.log('  JSON com os seguintes campos:');
  console.log('  - valid: booleano indicando se é válido');
  console.log('  - normalized: número normalizado (+5511987654321)');
  console.log('  - formatted: número formatado (+55 (11) 98765-4321)');
  console.log('  - type: "mobile" (celular) ou "landline" (fixo)');
  console.log('  - area: código de área (DDD)');
  console.log('  - error: mensagem de erro (se inválido)');
  console.log('  - suggestion: sugestão de correção (se aplicável)');
  console.log('');
}

/**
 * Formata resultado para exibição
 */
function formatResult(result) {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  };

  console.log('');

  if (result.valid) {
    console.log(`${colors.green}✓ Número válido${colors.reset}`);
    console.log('');
    console.log(`${colors.cyan}Tipo:${colors.reset} ${result.type === 'mobile' ? 'Celular' : 'Fixo'}`);
    console.log(`${colors.cyan}DDD:${colors.reset} ${result.area}`);
    console.log(`${colors.cyan}Normalizado:${colors.reset} ${result.normalized}`);
    console.log(`${colors.cyan}Formatado:${colors.reset} ${result.formatted}`);

    if (result.suggestion) {
      console.log('');
      console.log(`${colors.yellow}ℹ ${result.suggestion}${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ Número inválido${colors.reset}`);
    console.log('');
    console.log(`${colors.red}Erro:${colors.reset} ${result.error}`);

    if (result.suggestion) {
      console.log(`${colors.yellow}Sugestão:${colors.reset} ${result.suggestion}`);
    }
  }

  console.log('');
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);

  // Verificar se precisa exibir ajuda
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(0);
  }

  // Se for --json, retornar apenas JSON
  const jsonOutput = args.includes('--json');
  const phoneIndex = jsonOutput ? args.findIndex(arg => arg !== '--json') : 0;
  const phone = args[phoneIndex];

  if (!phone) {
    console.error('Erro: Número de telefone não especificado');
    console.log('');
    showHelp();
    process.exit(1);
  }

  // Validar telefone
  const result = validateBrazilianPhone(phone);

  // Exibir resultado
  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    formatResult(result);
  }

  // Exit code baseado na validade
  process.exit(result.valid ? 0 : 1);
}

// Executar se for chamado diretamente
if (require.main === module) {
  main();
}

// Exportar para uso em outros módulos
module.exports = { validateBrazilianPhone };
