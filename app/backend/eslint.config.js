import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
      },
      globals: {
        ...globals.node,
        ...globals.es2017,
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      "unused-imports": unusedImports,
    },
    rules: {
      ...ts.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      // "*.config.js",
      // "*.config.ts",
      "**/*.test.{js,ts}",
    ],
  },
];
