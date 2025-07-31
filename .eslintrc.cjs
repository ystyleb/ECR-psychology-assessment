/*
 * @Author       : winsonyang 
 * @Date         : 2025-07-20 16:13:37
 * @LastEditors  : winsonyang 
 * @LastEditTime : 2025-07-25 17:00:20
 * @FilePath     : /ECR/.eslintrc.cjs
 * @Description  : 
 * 
 * Copyright (c) 2025 by Tencent, All Rights Reserved. 
 */
/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    // Vue相关规则
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'error',
    'vue/no-mutating-props': 'error',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    
    // TypeScript相关规则
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // 通用规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error'
  },
  env: {
    'vue/setup-compiler-macros': true
  },
  overrides: [
    {
      files: ['api/**/*.js', 'server-test.js', 'test-payment-simulation.cjs'],
      env: {
        node: true
      }
    },
    {
      files: ['tests/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
      env: {
        node: true,
        jest: true
      }
    }
  ]
}
