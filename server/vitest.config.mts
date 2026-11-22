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
     * Workers are reused across files (`isolate: false` above), which is what
     * takes this suite from ~43s to ~12s: isolation pays about 2s of worker
     * startup per file, and there are thirty-odd of them.
     *
     * The cost is the module registry. Every test file in a worker shares one,
     * so a module an earlier file already imported keeps its **real**
     * dependencies and this file's `vi.mock` factory is never applied — the
     * suite then asserts against the real singleton and fails with "expected
     * vi.fn() to have been called", in whatever order the files happened to run.
     *
     * The rule that follows, and the reason it is written here rather than in a
     * commit message: **a suite that uses `vi.mock` must reset the registry and
     * import the module under test inside `beforeEach`**, so the mock applies for
     * this file and not for whoever loaded the module first. The template is
     * `tests/unit/boards/boardCache.test.ts`:
     *
     *     beforeEach(async () => {
     *       vi.clearAllMocks();
     *       vi.resetModules();
     *       subject = await import(".../theModule.js");
     *     });
     *
     * Get that wrong and the failure is order-dependent, so it can pass on your
     * machine and fail in CI — or pass for a while and then stop. If a suite
     * cannot follow the rule, run it with `isolate: true` rather than leaving a
     * mock that only sometimes applies.
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
