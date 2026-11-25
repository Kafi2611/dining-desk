import { defineConfig } from "vitest/config";

// Selenium tests go in tests/e2e (added in PR 7).
export default defineConfig({
  test: {
    include: ["tests/e2e/**/*.test.ts"],
    passWithNoTests: true,
  },
});
