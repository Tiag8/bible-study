import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Usar happy-dom ao invés de jsdom (mais leve e compatível)
    environment: 'happy-dom',

    // Setup files que rodam antes de cada teste
    setupFiles: ['./tests/setup.ts'],

    // Padrão de arquivos de teste
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'src/**/*.test.ts', 'src/**/*.test.tsx'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.tsx',
        'src/**/*.spec.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // Configurações de timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Globals (não precisa importar describe, it, expect, etc)
    globals: true,

    // Output verboso
    reporters: ['verbose'],
  },

  // Resolve aliases como no Next.js
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
