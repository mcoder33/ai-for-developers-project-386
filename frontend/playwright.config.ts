import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const apiPort = 3100;
const frontendPort = 4173;
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const localChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const localLaunchOptions =
  !process.env.CI && existsSync(localChromePath) ? { executablePath: localChromePath } : undefined;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    launchOptions: localLaunchOptions,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'go run .',
      cwd: '../backend',
      env: {
        GOCACHE: join(tmpdir(), 'hexlet-go-build-cache'),
        PORT: String(apiPort),
      },
      url: `${apiBaseUrl}/public/event-types`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `npm run dev -- --port ${frontendPort}`,
      env: {
        VITE_API_BASE_URL: apiBaseUrl,
      },
      url: `http://127.0.0.1:${frontendPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
