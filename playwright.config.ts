import { defineConfig, devices } from '@playwright/test';

// Jalankan dengan server dev/prod di BASE_URL (default http://127.0.0.1:8331).
// Chromium lokal: set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ke cache
// ~/.cache/ms-playwright/chromium-1234 — JANGAN `npx playwright install`
// di VM ini (menghapus cache browser tooling video-demo).
// Di CI (GitHub runner) browser di-install oleh workflow.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:8331',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
      // VM dev: tile + font lewat forwarder 127.0.0.1:18081
      // (PLAYWRIGHT_PROXY=http://127.0.0.1:18081). Di CI tidak di-set —
      // runner punya internet langsung.
      args: process.env.PLAYWRIGHT_PROXY
        ? [`--proxy-server=${process.env.PLAYWRIGHT_PROXY}`]
        : [],
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
