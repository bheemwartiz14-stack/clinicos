import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const testGlobs = [
  "e2e",
  "tests/e2e",
  "tests",
  "playwright.config.ts",
  "playwright.config.js",
];

const hasPlaywrightTarget = testGlobs.some((target) => existsSync(target));

if (!hasPlaywrightTarget) {
  console.log("No Playwright e2e tests found; skipping.");
  process.exit(0);
}

const result = spawnSync("playwright", ["test"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
