import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
	js.configs.recommended,
	{
		files: ['**/*.{js,ts}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2020
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2017
			}
		},
		plugins: {
			'@typescript-eslint': ts,
			'unused-imports': unusedImports
		},
		rules: {
			...ts.configs.recommended.rules,
			'unused-imports/no-unused-imports': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'no-prototype-builtins': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2017,
				$state: 'readonly'
			}
		},
		plugins: {
			svelte,
			'@typescript-eslint': ts,
			'unused-imports': unusedImports
		},
		rules: {
			...svelte.configs.recommended.rules,
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'error',
			'no-prototype-builtins': 'off'
		}
	},
	{
		ignores: [
			'node_modules/',
			'.svelte-kit/',
			'build/',
			'dist/',
			'*.config.js',
			'*.config.ts',
			'**/*.svelte.ts',
			'src/lib/components/ui/**'
		]
	}
];
