<!--
 * @Author       : winsonyang 
 * @Date         : 2025-07-22 15:15:34
 * @LastEditors  : winsonyang 
 * @LastEditTime : 2025-07-25 15:47:01
 * @FilePath     : /ECR/src/App.vue
 * @Description  : 
 * 
 * Copyright (c) 2025 by Tencent, All Rights Reserved. 
-->
<template>
  <StagewiseToolbar
    v-if="showDevelopmentTools"
    :config="{ plugins: [VuePlugin] }"
  />
  <div id="app" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { StagewiseToolbar } from '@stagewise/toolbar-vue'
import VuePlugin from '@stagewise-plugins/vue'
import { isFeatureEnabled } from '@/config/features'
import { features } from '@/services/featureService'

const showDevelopmentTools = isFeatureEnabled('enableDevelopmentTools')

// 在开发环境下输出功能开关调试信息
features.when('enableDebugMode', () => {
  features.debugInfo()
})
</script>

<style scoped>
#app {
  font-family:
    'PingFang SC',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    Roboto,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
