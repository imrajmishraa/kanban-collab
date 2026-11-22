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
    isolate: false,
    include: [
      "tests/**/*.{test,spec}.ts",
      "src/**/*.{test,spec}.ts",
      "src/**/__tests__/**/*.ts",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],

    /* The websocket suites open real sockets and share the document registry,
       so test files must not run concurrently. */
    pool: "forks",
    /*
     * Files in parallel, each still in its own module graph.
     *
     * `isolate: false` is tempting — it takes this suite from ~43s to ~12s — and
     * it is wrong here: every test file shares one module registry, so a module
     * that an earlier file already loaded keeps its *real* dependencies and this
     * file's `vi.mock` factories never apply. The suites that mock a singleton
     * (`getCacheClient`, `connectionRegistry`, `documentManager`) then assert
     * against the real thing and fail with "expected vi.fn() to have been
     * called", in an order that depends on which file ran first.
     *
     * Parallel files buy most of the same wall-clock time (43s -> ~31s) without
     * touching the isolation contract. A suite that wants to be isolation-proof
     * anyway does `vi.resetModules()` and imports the module under test inside
     * `beforeEach` — see `tests/unit/boards/boardCache.test.ts`.
     */
    fileParallelism: true,
    maxWorkers: 4,

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
