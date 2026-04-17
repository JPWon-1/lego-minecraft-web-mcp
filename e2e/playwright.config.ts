import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
  webServer: {
    command: "pnpm --filter @blockgame/web-app dev",
    port: 5173,
    cwd: "..",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
