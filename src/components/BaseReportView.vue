<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div :class="[
      'mx-auto px-4',
      mode === 'detailed' ? 'max-w-6xl' : 'max-w-4xl'
    ]">
      <!-- 页面头部 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ title }}</h1>
        <p class="text-gray-600">{{ subtitle }}</p>
      </div>

      <!-- 访问权限检查 -->
      <div v-if="mode === 'detailed' && !hasAccess" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="text-center">
          <i class="fas fa-lock text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">访问受限</h3>
          <p class="text-red-600 mb-4">您需要购买详细报告才能查看此内容</p>
          <button
            @click="redirectToBasicReport"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            返回购买页面
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">{{ loadingText }}</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">加载失败</h3>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button 
            @click="$emit('retry')" 
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>

      <!-- 报告内容 -->
      <div v-else-if="reportData" :class="[
        'space-y-8',
        mode === 'detailed' ? 'detailed-report-container' : 'basic-report-container'
      ]">
        <!-- 基础报告插槽 -->
        <slot name="basic-content" :report-data="reportData" />
        
        <!-- 详细报告插槽（仅在详细模式且有访问权限时显示） -->
        <slot 
          v-if="mode === 'detailed' && hasAccess" 
          name="detailed-content" 
          :report-data="reportData" 
        />
        
        <!-- 解锁按钮（基础模式且报告存在但未解锁时显示） -->
        <slot 
          v-if="mode === 'basic' && reportData && !hasAccess" 
          name="unlock-button" 
          :assessment-id="assessmentId"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { BasicReport } from '@/types/report'

interface Props {
  /** 报告模式：基础报告或详细报告 */
  mode: 'basic' | 'detailed'
  /** 评估ID */
  assessmentId: string
  /** 加载状态 */
  loading?: boolean
  /** 错误信息 */
  error?: string | null
  /** 报告数据 */
  reportData?: BasicReport | null
  /** 是否有访问权限（用于详细报告） */
  hasAccess?: boolean
}

interface Emits {
  /** 重试加载 */
  retry: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  reportData: null,
  hasAccess: true
})

defineEmits<Emits>()

const router = useRouter()

// 计算属性
const title = computed(() => {
  return props.mode === 'detailed' ? '详细报告' : '测评报告'
})

const subtitle = computed(() => {
  return props.mode === 'detailed' 
    ? '深度分析您的依恋风格和关系模式'
    : '您的依恋类型分析结果'
})

const loadingText = computed(() => {
  return props.mode === 'detailed' ? '正在加载详细报告...' : '正在加载报告...'
})

// 方法
const goBack = () => {
  router.push(`/report/${props.assessmentId}`)
}

const redirectToBasicReport = () => {
  router.push(`/report/${props.assessmentId}`)
}
</script>

<style scoped>
/* 动画和过渡效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 打印样式优化 */
@media print {
  .no-print {
    display: none !important;
  }

  .print-break {
    page-break-before: always;
  }

  /* 确保背景渐变在打印时显示 */
  .bg-gradient-to-br {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%) !important;
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* 打印时隐藏导航和不必要元素 */
  nav, header, .navigation, .sidebar {
    display: none !important;
  }

  /* 优化内容布局 */
  .detailed-report-container,
  .basic-report-container {
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
  }

  /* 确保白色卡片背景显示 */
  .bg-white {
    background-color: white !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* 优化阴影效果 */
  .shadow-lg {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  }
}

/* 打印模式下的特殊样式 */
:global(.print-mode) {
  overflow: visible !important;
}

:global(.print-export) {
  position: relative !important;
  transform: none !important;
  overflow: visible !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .max-w-6xl {
    max-width: 100%;
  }
  
  .max-w-4xl {
    max-width: 100%;
  }
}
</style> 