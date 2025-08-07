import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  {
    ignores: [
      '**/eslint.config.js',
      '**/dist/',
      '**/graphql/',
      '**/node_modules/',
      '**/src/types/generated.ts',
      '**/templates/@runtime',
      '**/tests/compiler/generator/store.test',
      '**/tests/compiler/generator/components.test',
      '**/tests/compiler/generator/isolate.test',
      '**/tests/compiler/generator/dataQueries.test/dataQueries.js',
      '**/tests/compiler/generator/displayLogic.test',
      '**/tests/mocks/generated.ts',
      '**/tmp/',
    ],
  },
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.json',
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // taken from https://github.com/lydell/eslint-plugin-simple-import-sort?tab=readme-ov-file#custom-grouping
            ['^\\u0000'],
            ['^node:'],
            ['^@?(?!(graphql(?!-)|src|test))\\w'],
            ['^'],
            ['^\\.'],
          ],
        },
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: false,
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/max-params': ['error', { max: 3 }],
      '@typescript-eslint/no-empty-function': [
        'error',
        {
          allow: [],
        },
      ],
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-destructuring': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'func-style': ['error', 'expression'],
      'max-params': 'off',
      'no-empty-function': 'off',
      'no-duplicate-imports': 'error',
      'no-throw-literal': 'off',
      'no-useless-return': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-destructuring': 'off',
      'prefer-promise-reject-errors': 'off',
      'sort-keys': [
        'error',
        'asc',
        { caseSensitive: true, minKeys: 2, natural: true },
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
      ],
    },
  },
];
