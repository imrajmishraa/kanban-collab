import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/", "coverage/", "node_modules/", "tests/load/", "tests/shell_testing/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    rules: {
      // Allow untyped callback params in the migration-heavy areas if needed;
      // tighten later by switching to tseslint.configs.recommendedTypeChecked.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);