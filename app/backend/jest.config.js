import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  moduleDirectories: ["node_modules", "src"],
  roots: ["<rootDir>/src"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^@utils$": "<rootDir>/src/utils",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@controllers$": "<rootDir>/src/controllers",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@db$": "<rootDir>/src/db",
    "^@db/(.*)$": "<rootDir>/src/db/$1",
    "^@exceptions$": "<rootDir>/src/exceptions",
    "^@exceptions/(.*)$": "<rootDir>/src/exceptions/$1",
    "^@routes$": "<rootDir>/src/routes",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@services$": "<rootDir>/src/services",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@middleware$": "<rootDir>/src/middleware",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@frontend$": "<rootDir>/frontend",
    "^@frontend/(.*)$": "<rootDir>/frontend/$1",
  },
  transform: {
    ...tsJestTransformCfg,
    "^.+\\.(t|j)s$": ["ts-jest", { useESM: true }],
  },
  transformIgnorePatterns: ["node_modules/(?!@faker-js).+"],
};
