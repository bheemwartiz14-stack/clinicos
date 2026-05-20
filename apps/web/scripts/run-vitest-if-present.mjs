import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const testTargets = [
  "tests",
  "test",
  "__tests__",
  "vitest.config.ts",
  "vitest.config.js",
];

const hasVitestTarget = testTargets.some((target) => existsSync(target));

if (!hasVitestTarget) {
  console.log("No Vitest unit tests found; skipping.");
  process.exit(0);
}

const result = spawnSync("vitest", ["run"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
