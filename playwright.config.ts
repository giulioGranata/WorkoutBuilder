import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    // Store visual snapshots under tests/e2e/__screenshots__/
    snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{-projectName}{-platform}{ext}',
  },
  // Visual settings and defaults
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  },
  webServer: {
    command: 'npm run dev -- --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: isCI
    ? [
        {
          name: 'chromium-desktop',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 1280, height: 800 },
          },
        },
      ]
    : [
        {
          name: 'chromium-desktop',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 1280, height: 800 },
          },
        },
        {
          name: 'webkit-iphone13',
          use: {
            ...devices['iPhone 13'],
          },
        },
      ],
});
