import { defineConfig } from 'vitest/config';

// Keep Vitest and Playwright separate: exclude e2e specs
export default defineConfig({
  test: {
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      'dist/**',
    ],
  },
});

