import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",

  testEnvironment: "node",

  roots: ["<rootDir>/test"],

  testMatch: ["**/*.test.ts"],

  moduleFileExtensions: ["ts", "js", "json"],

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },

  clearMocks: true,

  detectOpenHandles: true,

  forceExit: true,

  verbose: true,
};

export default config;
