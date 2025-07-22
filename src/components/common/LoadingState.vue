<template>
  <div class="loading-state" :class="[sizeClass, fullScreenClass, { 'loading-overlay': overlay }]">
    <!-- 背景遮罩 -->
    <div
      v-if="overlay"
      class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
      :class="{ 'opacity-100': visible, 'opacity-0': !visible }"
    ></div>

    <!-- 加载内容 -->
    <div
      class="loading-content relative z-10 flex flex-col items-center justify-center"
      :class="{ 'animate-fade-in': visible }"
    >
      <!-- 加载动画 -->
      <div class="loading-animation mb-4">
        <!-- 默认旋转动画 -->
        <div
          v-if="type === 'spinner'"
          class="animate-spin rounded-full border-4 border-gray-200"
          :class="spinnerClass"
        >
          <div class="rounded-full border-4 border-transparent border-t-current"></div>
        </div>

        <!-- 脉冲动画 -->
        <div v-else-if="type === 'pulse'" class="flex space-x-2">
          <div
            v-for="i in 3"
            :key="i"
            class="rounded-full animate-pulse"
            :class="pulseClass"
            :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
          ></div>
        </div>

        <!-- 波浪动画 -->
        <div v-else-if="type === 'wave'" class="flex items-end space-x-1">
          <div
            v-for="i in 5"
            :key="i"
            class="bg-current animate-wave"
            :class="waveClass"
            :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
          ></div>
        </div>

        <!-- 进度条动画 -->
        <div
          v-else-if="type === 'progress'"
          class="w-full bg-gray-200 rounded-full overflow-hidden"
          :class="progressContainerClass"
        >
          <div
            class="h-full bg-current transition-all duration-300 ease-out"
            :style="{ width: `${progress}%` }"
            :class="{ 'animate-pulse': indeterminate }"
          ></div>
        </div>

        <!-- 自定义动画 -->
        <div v-else-if="type === 'custom'" class="custom-animation">
          <slot name="animation"></slot>
        </div>
      </div>

      <!-- 加载文本 -->
      <div v-if="message" class="loading-message text-center">
        <h3 v-if="title" class="font-semibold mb-1" :class="titleClass">
          {{ title }}
        </h3>
        <p class="text-sm" :class="messageClass">
          {{ message }}
        </p>
      </div>

      <!-- 进度信息 -->
      <div
        v-if="showProgress && (progress > 0 || progressText)"
        class="progress-info mt-2 text-center"
      >
        <div v-if="progressText" class="text-xs" :class="progressTextClass">
          {{ progressText }}
        </div>
        <div v-else-if="progress > 0" class="text-xs" :class="progressTextClass">
          {{ Math.round(progress) }}%
        </div>
      </div>

      <!-- 取消按钮 -->
      <button
        v-if="cancellable"
        @click="handleCancel"
        class="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        <i class="fas fa-times mr-1"></i>
        取消
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type LoadingType = 'spinner' | 'pulse' | 'wave' | 'progress' | 'custom'
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl'
type LoadingTheme = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

interface Props {
  // 基本属性
  visible?: boolean
  type?: LoadingType
  size?: LoadingSize
  theme?: LoadingTheme

  // 文本内容
  title?: string
  message?: string
  progressText?: string

  // 进度相关
  progress?: number
  showProgress?: boolean
  indeterminate?: boolean

  // 样式控制
  overlay?: boolean
  fullScreen?: boolean

  // 交互控制
  cancellable?: boolean

  // 自定义样式
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  type: 'spinner',
  size: 'md',
  theme: 'primary',
  progress: 0,
  showProgress: false,
  indeterminate: false,
  overlay: false,
  fullScreen: false,
  cancellable: false
})

const emit = defineEmits<{
  cancel: []
}>()

// 响应式状态
const mounted = ref(false)

// 计算属性
const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  }
  return props.fullScreen ? 'w-full h-full' : sizes[props.size]
})

const fullScreenClass = computed(() => {
  return props.fullScreen ? 'fixed inset-0 z-50' : 'relative'
})

const themeColors = computed(() => {
  const themes = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  }
  return themes[props.theme]
})

const spinnerClass = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }
  return `${sizes[props.size]} ${themeColors.value}`
})

const pulseClass = computed(() => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  }
  return `${sizes[props.size]} ${themeColors.value.replace('text-', 'bg-')}`
})

const waveClass = computed(() => {
  const sizes = {
    sm: 'w-1 h-4',
    md: 'w-1 h-6',
    lg: 'w-2 h-8',
    xl: 'w-2 h-10'
  }
  return `${sizes[props.size]} ${themeColors.value}`
})

const progressContainerClass = computed(() => {
  const sizes = {
    sm: 'h-1 w-32',
    md: 'h-2 w-48',
    lg: 'h-3 w-64',
    xl: 'h-4 w-80'
  }
  return sizes[props.size]
})

const titleClass = computed(() => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }
  return `${sizes[props.size]} ${themeColors.value}`
})

const messageClass = computed(() => {
  return `text-gray-600 ${props.customClass || ''}`
})

const progressTextClass = computed(() => {
  return `${themeColors.value} opacity-75`
})

// 生命周期
onMounted(() => {
  mounted.value = true
})

// 方法
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.loading-state {
  @apply flex items-center justify-center;
}

.loading-overlay {
  @apply absolute inset-0 z-40;
}

.loading-content {
  @apply p-6 bg-white rounded-lg shadow-lg;
}

/* 动画定义 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes wave {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-wave {
  animation: wave 1.2s infinite ease-in-out;
}

/* 全屏模式样式 */
.loading-state.fixed .loading-content {
  @apply bg-transparent shadow-none;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .loading-content {
    @apply p-4;
  }
}
</style>
