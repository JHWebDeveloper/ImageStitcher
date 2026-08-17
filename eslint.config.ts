// @ts-check

import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
	globalIgnores([
		'build/**',
		'node_modules/**',
		'src/main/data/**'
	]),
	{
		plugins: {
			'@stylistic': stylistic
		},
		files: [
			'**/*.ts',
			'**/*.tsx',
			'**/*.js',
			'**/*.jsx'
		],
		extends: [
			eslint.configs.recommended,
			stylistic.configs.recommended,
			tseslint.configs.strict,
			tseslint.configs.stylistic
		],
		rules: {
			'@stylistic/array-bracket-spacing': ['off'],
			'@stylistic/arrow-parens': ['error', 'as-needed'],
			'@stylistic/brace-style': ['error', '1tbs'],
			'@stylistic/comma-dangle': ['error', {
				generics: 'ignore'
			}],
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/jsx-closing-bracket-location': ['error', 'after-props'],
			'@stylistic/jsx-indent-props': ['error', 'tab'],
			'@stylistic/multiline-ternary': ['off'],
			'@stylistic/no-tabs': ['error', {
				allowIndentationTabs: true
			}],
			'@typescript-eslint/no-empty-function': ['error', {
				allow: ['methods']
			}],
			'@typescript-eslint/no-empty-object-type': ['error', {
				allowInterfaces: 'with-single-extends'
			}]
		}
	}
])
