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
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/__tests__/**"],
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
};
