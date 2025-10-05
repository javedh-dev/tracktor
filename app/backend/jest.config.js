import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  moduleDirectories: ["node_modules", "src"],
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],

  // Enhanced coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/__tests__/**",
    "!src/db/migrations/**",
    "!src/db/seeders/**",
    "!src/config/env.ts", // Environment validation might be hard to test
    "!index.ts", // Entry point
  ],

  // // Coverage thresholds to maintain quality
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80,
  //   },
  //   // Stricter thresholds for critical components
  //   "./src/services/": {
  //     branches: 85,
  //     functions: 90,
  //     lines: 85,
  //     statements: 85,
  //   },
  //   "./src/controllers/": {
  //     branches: 85,
  //     functions: 90,
  //     lines: 85,
  //     statements: 85,
  //   },
  // },

  // Coverage reporting
  coverageReporters: ["text", "text-summary", "html", "lcov", "json-summary"],
  coverageDirectory: "coverage",

  moduleNameMapper: {
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@db/(.*)$": "<rootDir>/src/db/$1",
    "^@exceptions/(.*)$": "<rootDir>/src/exceptions/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
  },
  transform: {
    ...tsJestTransformCfg,
    "^.+\\.(t|j)s$": ["ts-jest", { useESM: true }],
  },
  transformIgnorePatterns: ["node_modules/(?!@faker-js).+"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup/index.ts"],
  testTimeout: 30000,
  maxWorkers: 1,
  passWithNoTests: true,
  silent: false, // Enable output to see coverage reports
  verbose: true, // Show individual test results
};
