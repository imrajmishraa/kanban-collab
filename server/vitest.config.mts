import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const dir = (path: string) => fileURLToPath(new URL(path, import.meta.url));

/**
 * Replaces jest.config.js.
 *
 * Vitest is already the runner in `client`, so this removes jest, ts-jest,
 * jest-config and the unpatched `deepmerge` advisory that came with them.
 *
 * Note on Vitest 5: `poolOptions` no longer exists. Serial execution is
 * `fileParallelism: false` plus `maxWorkers: 1`.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "tests/**/*.{test,spec}.ts",
      "src/**/*.{test,spec}.ts",
      "src/**/__tests__/**/*.ts",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],

    /* The websocket suites open real sockets and share the document registry,
       so test files must not run concurrently. */
    pool: "forks",
    fileParallelism: false,
    maxWorkers: 1,

    testTimeout: 20_000,
    hookTimeout: 20_000,

    coverage: {
      provider: "v8",
      reporter: ["text-summary", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/main.ts",
        "src/scripts/**",
        "src/**/index.ts",
      ],
    },
  },

  resolve: {
    alias: {
      "@": dir("./src"),
      "@config": dir("./src/config"),
      "@shared": dir("./src/shared"),
      "@infrastructure": dir("./src/infrastructure"),
      "@application": dir("./src/application"),
      "@interfaces": dir("./src/interfaces"),
    },
  },
});
