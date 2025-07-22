<template>
  <div class="error-state" :class="[containerClass, { 'error-overlay': overlay }]">
    <!-- 背景遮罩 -->
    <div
      v-if="overlay"
      class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
    ></div>

    <!-- 错误内容 -->
    <div class="error-content relative z-10 text-center" :class="contentClass">
      <!-- 错误图标 -->
      <div class="error-icon mb-4">
        <div
          class="inline-flex items-center justify-center rounded-full"
          :class="iconContainerClass"
        >
          <i :class="iconClass" class="text-2xl"></i>
        </div>
      </div>

      <!-- 错误标题 -->
      <h3 class="error-title font-semibold mb-2" :class="titleClass">
        {{ title }}
      </h3>

      <!-- 错误描述 -->
      <p v-if="description" class="error-description mb-4" :class="descriptionClass">
        {{ description }}
      </p>

      <!-- 错误详情（可展开） -->
      <div v-if="details && showDetails" class="error-details mb-4">
        <div class="bg-gray-50 rounded-lg p-3 text-left">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">错误详情</span>
            <button @click="toggleDetails" class="text-xs text-gray-500 hover:text-gray-700">
              {{ detailsExpanded ? '收起' : '展开' }}
            </button>
          </div>
          <div
            v-show="detailsExpanded"
            class="text-xs text-gray-600 font-mono bg-white rounded p-2 max-h-32 overflow-y-auto"
          >
            {{ details }}
          </div>
        </div>
      </div>

      <!-- 建议操作 -->
      <div v-if="finalSuggestions && finalSuggestions.length > 0" class="error-suggestions mb-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">建议操作：</h4>
        <ul class="text-sm text-gray-600 space-y-1">
          <li v-for="(suggestion, index) in finalSuggestions" :key="index" class="flex items-start">
            <i class="fas fa-lightbulb text-yellow-500 mr-2 mt-0.5 text-xs"></i>
            <span>{{ suggestion }}</span>
          </li>
        </ul>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions flex flex-col sm:flex-row gap-2 justify-center">
        <!-- 重试按钮 -->
        <button
          v-if="retryable"
          @click="handleRetry"
          :disabled="retrying"
          class="btn-retry px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i :class="retrying ? 'fas fa-spinner fa-spin' : 'fas fa-redo'" class="mr-1"></i>
          {{ retrying ? '重试中...' : '重试' }}
        </button>

        <!-- 返回按钮 -->
        <button
          v-if="showBackButton"
          @click="handleGoBack"
          class="btn-back px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <i class="fas fa-arrow-left mr-1"></i>
          返回
        </button>

        <!-- 联系支持按钮 -->
        <button
          v-if="showContactButton"
          @click="handleContact"
          class="btn-contact px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <i class="fas fa-envelope mr-1"></i>
          联系客服
        </button>

        <!-- 自定义操作按钮 -->
        <slot name="actions"></slot>
      </div>

      <!-- 错误代码 -->
      <div v-if="errorCode" class="error-code mt-4 text-xs text-gray-400">
        错误代码: {{ errorCode }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

type ErrorType = 'network' | 'validation' | 'permission' | 'not-found' | 'server' | 'unknown'
type ErrorSize = 'sm' | 'md' | 'lg'

interface Props {
  // 基本属性
  type?: ErrorType
  size?: ErrorSize
  title?: string
  description?: string
  details?: string
  errorCode?: string

  // 建议操作
  suggestions?: string[]

  // 交互控制
  retryable?: boolean
  retrying?: boolean
  showBackButton?: boolean
  showContactButton?: boolean
  showDetails?: boolean

  // 样式控制
  overlay?: boolean
  customIcon?: string
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'unknown',
  size: 'md',
  title: '出现了一些问题',
  retryable: true,
  retrying: false,
  showBackButton: true,
  showContactButton: false,
  showDetails: false,
  overlay: false
})

const emit = defineEmits<{
  retry: []
  goBack: []
  contact: []
}>()

const router = useRouter()

// 响应式状态
const detailsExpanded = ref(false)

// 计算属性
const containerClass = computed(() => {
  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  return `flex items-center justify-center min-h-64 ${sizes[props.size]} ${props.customClass || ''}`
})

const contentClass = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }
  return `bg-white rounded-xl shadow-lg p-6 ${sizes[props.size]}`
})

const iconClass = computed(() => {
  if (props.customIcon) return props.customIcon

  const icons = {
    network: 'fas fa-wifi',
    validation: 'fas fa-exclamation-triangle',
    permission: 'fas fa-lock',
    'not-found': 'fas fa-search',
    server: 'fas fa-server',
    unknown: 'fas fa-exclamation-circle'
  }
  return icons[props.type]
})

const iconContainerClass = computed(() => {
  const colors = {
    network: 'bg-blue-100 text-blue-600',
    validation: 'bg-yellow-100 text-yellow-600',
    permission: 'bg-red-100 text-red-600',
    'not-found': 'bg-gray-100 text-gray-600',
    server: 'bg-red-100 text-red-600',
    unknown: 'bg-gray-100 text-gray-600'
  }

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }

  return `${colors[props.type]} ${sizes[props.size]}`
})

const titleClass = computed(() => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }
  return `text-gray-800 ${sizes[props.size]}`
})

const descriptionClass = computed(() => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  return `text-gray-600 ${sizes[props.size]}`
})

// 方法
const handleRetry = () => {
  emit('retry')
}

const handleGoBack = () => {
  emit('goBack')
  router.go(-1)
}

const handleContact = () => {
  emit('contact')
}

const toggleDetails = () => {
  detailsExpanded.value = !detailsExpanded.value
}

// 根据错误类型提供默认建议
const getDefaultSuggestions = (type: ErrorType): string[] => {
  const suggestions = {
    network: ['检查网络连接是否正常', '尝试刷新页面', '稍后再试'],
    validation: ['检查输入的信息是否正确', '确保所有必填字段都已填写', '联系客服获取帮助'],
    permission: ['确认您有访问权限', '尝试重新登录', '联系管理员获取权限'],
    'not-found': ['检查网址是否正确', '返回首页重新开始', '使用搜索功能查找内容'],
    server: ['稍后再试', '联系技术支持', '检查服务状态页面'],
    unknown: ['刷新页面重试', '清除浏览器缓存', '联系客服获取帮助']
  }

  return suggestions[type] || suggestions.unknown
}

// 如果没有提供建议，使用默认建议
const finalSuggestions = computed(() => {
  return props.suggestions || getDefaultSuggestions(props.type)
})
</script>

<style scoped>
.error-state {
  @apply relative;
}

.error-overlay {
  @apply fixed inset-0 z-50;
}

.error-content {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮样式 */
.btn-retry:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-back:hover,
.btn-contact:hover {
  transform: translateY(-1px);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .error-actions {
    @apply flex-col;
  }

  .error-content {
    @apply p-4;
  }
}
</style>
