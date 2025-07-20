import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    // 测试环境配置
    environment: 'jsdom',

    // 全局测试设置
    globals: true,

    // 测试文件匹配模式
    include: ['src/**/*.{test,spec}.{js,ts,vue}', 'tests/**/*.{test,spec}.{js,ts,vue}'],

    // 排除的文件
    exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/coverage/**',
        '**/*.test.{js,ts,vue}',
        '**/*.spec.{js,ts,vue}',
        'src/main.ts',
        'src/router/index.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },

    // 测试超时设置
    testTimeout: 10000,

    // 设置文件
    setupFiles: ['./tests/setup.ts'],

    // 环境变量
    env: {
      NODE_ENV: 'test'
    }
  }
})
