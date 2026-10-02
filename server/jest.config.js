/* eslint-env node */
/** @type {import('jest').Config} */
const config = {
  // ── Core ────────────────────────────────────────────────
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/src"],

  // ── Test Discovery ──────────────────────────────────────
  testMatch: ["**/__tests__/**/*.(test|spec).ts", "**/?(*.)+(test|spec).ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],

  // ── TypeScript Transform ────────────────────────────────
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
        isolatedModules: true,
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "json"],

  // ── Module Resolution (path aliases) ────────────────────
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@application/(.*)$": "<rootDir>/src/application/$1",
    "^@interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
  },

  // ── Coverage ────────────────────────────────────────────
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/main.ts",
    "!src/scripts/**",
    "!src/**/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },

  // ── Behavior ────────────────────────────────────────────
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  detectOpenHandles: true,
  forceExit: true,
  verbose: true,
  testTimeout: 15_000,
  maxWorkers: "50%",
};

module.exports = config;
