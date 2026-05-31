import pluginVitest from '@vitest/eslint-plugin';
import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: [
            'coverage/**',
            'dist/**',
            'node_modules/**',
            'tmp/**',
            '.cache/**'
        ]
    },
    pluginJs.configs.recommended,
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
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            eqeqeq: ['error', 'always'],
            'no-undef': 'error',
            'no-empty': ['warn', { allowEmptyCatch: true }],
            'prefer-const': 'warn',
            'no-var': 'error',
            semi: ['error', 'always'],
            'no-shadow': 'warn',
            quotes: ['error', 'single', { avoidEscape: true }],
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
