import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    // 生产环境禁用Vue DevTools
    __VUE_PROD_DEVTOOLS__: false,
    // 生产环境关闭Vue选项API的警告
    __VUE_OPTIONS_API__: true,
    // 禁用HMR在生产环境
    __VUE_PROD_HMR__: false
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://ecr-kappa.vercel.app',
        changeOrigin: true,
        secure: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['@vueuse/core']
        }
      }
    }
  }
}))
