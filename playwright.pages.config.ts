import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: 'pages.spec.ts',
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4174', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run preview -- --mode pages --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174/mekit/',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'pages-desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    {
      name: 'pages-mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium', channel: 'chrome' },
    },
  ],
})
