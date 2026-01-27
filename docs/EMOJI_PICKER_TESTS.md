# Emoji Picker - Test Suite Documentation

## Overview

Criada suite completa de testes para a implementação do emoji picker com trigger `:`.

**Status**: ✅ Ready to execute

---

## Test Files Created

### 1. **E2E Tests (Playwright)**
**File**: `tests/emoji-picker.spec.ts`
**Coverage**: 15 test cases
**Type**: Integration tests (full user interactions)

**Testes inclusos:**
- [x] Abrir menu ao digitar `:`
- [x] Buscar por keywords (`love`, `fire`, `star`)
- [x] Navegação com setas UP/DOWN
- [x] Seleção com Enter
- [x] Inserção de emoji com espaço automático
- [x] Fechar com Escape
- [x] Fechar ao clicar fora
- [x] Atualizar query em tempo real
- [x] Múltiplos emojis em sequência
- [x] Backspace atualiza filtro

**Como executar:**
```bash
# Instalar dependências (se ainda não instaladas)
npm install

# Rodar testes Playwright
npx playwright test tests/emoji-picker.spec.ts

# Rodar com modo UI (para debug)
npx playwright test tests/emoji-picker.spec.ts --ui

# Rodar em modo debug
npx playwright test tests/emoji-picker.spec.ts --debug
```

---

### 2. **Unit Tests - Emoji Data**
**File**: `src/lib/emoji-data.test.ts`
**Coverage**: 14 test cases
**Type**: Unit tests (função `searchEmojis`)

**Testes inclusos:**
- [x] searchEmojis retorna array vazio quando query não existe
- [x] Busca case-insensitive
- [x] Prioriza shortname sobre keywords
- [x] Limita máximo 12 resultados
- [x] Valida integridade de dados (duplicatas, propriedades obrigatórias)
- [x] Busca por keywords específicas (`love`, `fire`, `heart`, `music`)

**Como executar:**
```bash
# Você precisa configurar Vitest primeiro
npm install -D vitest

# Rodar testes do emoji-data
npx vitest src/lib/emoji-data.test.ts

# Rodar em modo watch
npx vitest src/lib/emoji-data.test.ts --watch

# Gerar coverage
npx vitest src/lib/emoji-data.test.ts --coverage
```

---

### 3. **Unit Tests - Hook Logic**
**File**: `src/components/Editor/useEmojiSuggestion.test.ts`
**Coverage**: 25+ test cases
**Type**: Unit tests (lógica do hook e regex patterns)

**Testes inclusos:**
- [x] Regex pattern validation
- [x] State transitions (open/close)
- [x] Navigation logic (Arrow keys)
- [x] Menu close conditions
- [x] Emoji insertion calculations
- [x] Performance benchmarks

**Como executar:**
```bash
npx vitest src/components/Editor/useEmojiSuggestion.test.ts
```

---

## Test Statistics

| Test Suite | Files | Cases | Type |
|-----------|-------|-------|------|
| E2E (Playwright) | 1 | 15 | Integration |
| Unit (Emoji Data) | 1 | 14 | Unit |
| Unit (Hook Logic) | 1 | 25+ | Unit |
| **TOTAL** | **3** | **54+** | Mixed |

---

## Coverage Target

```
Statements   : 100% (searchEmojis, regex patterns, state logic)
Branches     : 95%+ (edge cases covered)
Functions    : 100% (selectEmoji, handleKeyDown, handleInput)
Lines        : 100% (emoji-data.ts, useEmojiSuggestion.ts core logic)
```

---

## Setup Instructions

### Prerequisites
```bash
# Ensure Node.js 22+
node --version

# Install dependencies
npm install

# Install Playwright browsers (E2E)
npx playwright install

# Install Vitest (Unit tests)
npm install -D vitest
```

### Configure vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
```

---

## Running All Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run all unit tests
npm run test:unit

# Run all tests (E2E + Unit)
npm run test

# Run with coverage
npm run test:coverage
```

### Add to package.json
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:debug": "vitest --inspect-brk --inspect --loader=ts-node/esm"
  }
}
```

---

## Test Execution Order (Recommended)

1. **Unit Tests First** (fast, <5s)
   ```bash
   npx vitest
   ```

2. **E2E Tests** (slower, requires server)
   ```bash
   npm run dev &  # Start dev server
   npx playwright test
   ```

---

## Debugging Failed Tests

### Playwright Debug Mode
```bash
# Run single test in debug mode
npx playwright test tests/emoji-picker.spec.ts --debug

# With UI inspector
npx playwright test tests/emoji-picker.spec.ts --ui
```

### Vitest Debug Mode
```bash
# Attach debugger and run tests
node --inspect-brk ./node_modules/vitest/vitest.mjs
```

---

## Quality Gate Checklist

- [x] E2E tests cover all user interactions
- [x] Unit tests validate core logic
- [x] Performance tests included (<1ms search)
- [x] Edge cases tested (empty query, special chars, navigation limits)
- [x] Data integrity validated (no duplicates, required fields)
- [x] Regex patterns validated
- [x] State transitions validated
- [x] Menu open/close logic tested

---

## Recommendations for Implementation

### Phase 1 (Required before merge)
- [ ] Install and configure Vitest
- [ ] Run unit tests locally: `npx vitest`
- [ ] Fix any failing tests
- [ ] Verify linting: `npm run lint`
- [ ] Build passes: `npm run build`

### Phase 2 (Before GA - General Availability)
- [ ] Set up CI/CD pipeline for tests
- [ ] Run E2E tests in headless mode
- [ ] Add GitHub Actions workflow
- [ ] Achieve 90%+ coverage

### Phase 3 (Optional - Sprint Future)
- [ ] Add visual regression tests (Playwright screenshot comparison)
- [ ] Performance profiling (measurable < 1ms search)
- [ ] Accessibility testing (axe-core integration)
- [ ] Mobile/responsive testing

---

## Test Maintenance

### When to Update Tests
- [ ] Feature changes → Update E2E tests
- [ ] Logic changes → Update unit tests
- [ ] New emojis added → Update data tests
- [ ] Regex pattern changes → Update validation tests

### Code Coverage Goals
- Core logic: 100%
- Edge cases: 95%+
- Components: 90%+
- Overall: 85%+

---

## Troubleshooting

### "Cannot find module 'vitest'"
```bash
npm install -D vitest
npx vitest --version
```

### Playwright tests timeout
```bash
# Increase timeout
npx playwright test --timeout=60000

# Or edit playwright.config.ts
export default defineConfig({
  timeout: 60000,
});
```

### Tests pass locally but fail in CI
- [ ] Check Node version (22+)
- [ ] Verify environment variables
- [ ] Clear cache: `rm -rf node_modules && npm install`
- [ ] Run in same Node version as CI

---

## References

- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://martinfowler.com/articles/practical-test-pyramids.html)

---

**Last Updated**: 2026-01-27
**Test Suite Version**: 1.0
**Status**: Ready for execution
