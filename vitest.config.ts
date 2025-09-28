import { defineConfig } from 'vitest/config';
import path from 'path';

// Keep Vitest and Playwright separate: exclude e2e specs
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      'dist/**',
    ],
    // Use forks to avoid worker thread signals blocked in some environments
    // Force single worker via forks to avoid signal issues
    pool: 'forks',
    maxWorkers: 1,
    minWorkers: 1,
  },
});
