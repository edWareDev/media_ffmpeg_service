import pluginVitest from '@vitest/eslint-plugin';
import globals from 'globals';
import pluginJs from '@eslint/js';
import { flatConfigs as importXFlatConfigs } from 'eslint-plugin-import-x';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: [
            '**/coverage/**',
            '**/dist/**',
            '**/dist-protected/**',
            '**/node_modules/**',
            '**/tmp/**',
            '**/.cache/**'
        ]
    },
    pluginJs.configs.recommended,
    importXFlatConfigs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        linterOptions: {
            reportUnusedDisableDirectives: 'error'
        },
        plugins: {
            vitest: pluginVitest
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            eqeqeq: ['error', 'always'],
            'no-undef': 'error',
            'no-empty': ['warn', { allowEmptyCatch: true }],
            'prefer-const': 'warn',
            'no-var': 'error',
            semi: ['error', 'always'],
            'no-shadow': 'warn',
            quotes: ['error', 'single', { avoidEscape: true }],
            'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
            'import-x/no-unresolved': ['error', { commonjs: true }],
            'import-x/no-cycle': ['error', { maxDepth: Infinity }],
            'import-x/no-self-import': 'error'
        }
    },
    {
        files: [
            'eslint.config.js',
            'config/**/*.js',
            'src/main.js',
            'src/bootstrap/**/*.js',
            'src/infrastructure/services/mongoDB.client.js',
            'src/infrastructure/services/redis.client.js'
        ],
        rules: {
            'no-console': ['warn', { allow: ['info', 'warn', 'error'] }]
        }
    },
    {
        files: ['**/*.test.js', '**/*.spec.js'],
        languageOptions: {
            globals: {
                ...pluginVitest.environments.env.globals
            }
        },
        plugins: {
            vitest: pluginVitest
        },
        rules: {
            'vitest/no-focused-tests': 'error',
            'vitest/no-disabled-tests': 'warn',
            'vitest/expect-expect': 'warn',
            'vitest/prefer-to-have-length': 'warn',
            'vitest/prefer-lowercase-title': 'warn'
        }
    }
];
