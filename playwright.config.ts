import { defineConfig, devices } from "@playwright/test";

/**
 * Minimal E2E regression suite for the Synergy marketing site + admin gate.
 *
 * Env:
 * - PLAYWRIGHT_BASE_URL — default http://127.0.0.1:3000
 * - PLAYWRIGHT_SKIP_WEBSERVER=1 — use an already-running server (e.g. npm run dev)
 *
 * Do not put production admin passwords in the repo. These smokes never log in.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        // Requires `npm run build` first. Prefer PLAYWRIGHT_SKIP_WEBSERVER=1 with `npm run dev`.
        command: "npx next start -H 127.0.0.1 -p 3000",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
