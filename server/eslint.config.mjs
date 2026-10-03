import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // ── Global Ignores ──────────────────────────────────────
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "logs/**",
      "**/*.js", // ignore compiled JS
      "jest.config.js", // CommonJS config
    ],
  },

  // ── Base JS + TypeScript Recommended ────────────────────
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ── TypeScript source files ─────────────────────────────
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // ── Strictness (good for backend) ───────────────────
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/require-await": "off",

      // ── General quality ─────────────────────────────────
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // ── Test files (slightly more relaxed) ──────────────────
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "off",
    },
  },

  // ── Jest config (CommonJS) ──────────────────────────────
  {
    files: ["jest.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "writable",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
