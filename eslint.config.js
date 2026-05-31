import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: {
                ...globals.node
            }
        },
        rules: {
            semi: ['error', 'always'],
            quotes: ['error', 'single', { avoidEscape: true }],
            'no-console': ['warn', { allow: ['info', 'warn', 'error'] }]
        }
    }
];
