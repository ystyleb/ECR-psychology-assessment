<template>
  <Teleport to="body">
    <div v-if="visible" class="toast-container fixed z-50" :class="positionClass">
      <Transition :name="transitionName" @after-leave="handleAfterLeave">
        <div
          v-show="show"
          class="toast-notification max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 overflow-hidden"
          :class="[typeClass, { 'cursor-pointer': clickable }]"
          @click="handleClick"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <!-- 进度条 -->
          <div
            v-if="showProgress"
            class="toast-progress absolute top-0 left-0 h-1 bg-current opacity-30 transition-all duration-100 ease-linear"
            :style="{ width: `${progressPercent}%` }"
          ></div>

          <!-- 内容区域 -->
          <div class="toast-content p-4">
            <div class="flex items-start">
              <!-- 图标 -->
              <div class="toast-icon flex-shrink-0 mr-3">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center"
                  :class="iconBgClass"
                >
                  <i :class="iconClass" class="text-sm"></i>
                </div>
              </div>

              <!-- 文本内容 -->
              <div class="toast-text flex-1 min-w-0">
                <h4 v-if="title" class="toast-title font-medium text-gray-900 mb-1">
                  {{ title }}
                </h4>
                <p
                  class="toast-message text-sm text-gray-600"
                  :class="{ 'line-clamp-2': !expanded }"
                >
                  {{ message }}
                </p>

                <!-- 展开/收起按钮 -->
                <button
                  v-if="expandable && message.length > 100"
                  @click.stop="toggleExpanded"
                  class="text-xs text-blue-600 hover:text-blue-700 mt-1"
                >
                  {{ expanded ? '收起' : '展开' }}
                </button>
              </div>

              <!-- 操作按钮 -->
              <div class="toast-actions flex items-center space-x-2 ml-3">
                <!-- 自定义操作按钮 -->
                <button
                  v-for="action in actions"
                  :key="action.label"
                  @click.stop="action.handler"
                  class="text-xs px-2 py-1 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {{ action.label }}
                </button>

                <!-- 关闭按钮 -->
                <button
                  v-if="closable"
                  @click.stop="close"
                  class="toast-close text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i class="fas fa-times text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'
type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

interface ToastAction {
  label: string
  handler: () => void
}

interface Props {
  // 基本属性
  type?: ToastType
  title?: string
  message: string

  // 显示控制
  visible?: boolean
  duration?: number
  persistent?: boolean

  // 交互控制
  closable?: boolean
  clickable?: boolean
  expandable?: boolean
  pauseOnHover?: boolean

  // 样式控制
  position?: ToastPosition
  showProgress?: boolean

  // 操作按钮
  actions?: ToastAction[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  visible: false,
  duration: 5000,
  persistent: false,
  closable: true,
  clickable: false,
  expandable: true,
  pauseOnHover: true,
  position: 'top-right',
  showProgress: true,
  actions: () => []
})

const emit = defineEmits<{
  close: []
  click: []
  'after-leave': []
}>()

// 响应式状态
const show = ref(false)
const expanded = ref(false)
const progressPercent = ref(100)
const isPaused = ref(false)

let timer: NodeJS.Timeout | null = null
let progressTimer: NodeJS.Timeout | null = null

// 计算属性
const positionClass = computed(() => {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }
  return positions[props.position]
})

const typeClass = computed(() => {
  const types = {
    success: 'border-green-500',
    error: 'border-red-500',
    warning: 'border-yellow-500',
    info: 'border-blue-500'
  }
  return types[props.type]
})

const iconClass = computed(() => {
  const icons = {
    success: 'fas fa-check text-white',
    error: 'fas fa-times text-white',
    warning: 'fas fa-exclamation text-white',
    info: 'fas fa-info text-white'
  }
  return icons[props.type]
})

const iconBgClass = computed(() => {
  const backgrounds = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }
  return backgrounds[props.type]
})

const transitionName = computed(() => {
  const isTop = props.position.includes('top')
  const isRight = props.position.includes('right')
  const isLeft = props.position.includes('left')

  if (isTop && isRight) return 'toast-slide-right'
  if (isTop && isLeft) return 'toast-slide-left'
  if (isRight) return 'toast-slide-right'
  if (isLeft) return 'toast-slide-left'
  return 'toast-fade'
})

// 监听visible变化
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      show.value = true
      startTimer()
    } else {
      show.value = false
    }
  }
)

// 生命周期
onMounted(() => {
  if (props.visible) {
    show.value = true
    startTimer()
  }
})

onUnmounted(() => {
  clearTimers()
})

// 方法
const startTimer = () => {
  if (props.persistent) return

  clearTimers()

  // 主计时器
  timer = setTimeout(() => {
    close()
  }, props.duration)

  // 进度条计时器
  if (props.showProgress) {
    const interval = 50
    const steps = props.duration / interval
    let currentStep = 0

    progressTimer = setInterval(() => {
      if (isPaused.value) return

      currentStep++
      progressPercent.value = Math.max(0, 100 - (currentStep / steps) * 100)

      if (currentStep >= steps) {
        clearInterval(progressTimer!)
      }
    }, interval)
  }
}

const clearTimers = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const pauseTimer = () => {
  if (!props.pauseOnHover) return
  isPaused.value = true
}

const resumeTimer = () => {
  if (!props.pauseOnHover) return
  isPaused.value = false
}

const close = () => {
  show.value = false
  clearTimers()
  emit('close')
}

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

const handleMouseEnter = () => {
  pauseTimer()
}

const handleMouseLeave = () => {
  resumeTimer()
}

const handleAfterLeave = () => {
  emit('after-leave')
}

const toggleExpanded = () => {
  expanded.value = !expanded.value
}
</script>

<style scoped>
.toast-container {
  pointer-events: none;
}

.toast-notification {
  pointer-events: auto;
}

.toast-progress {
  transition: width 0.1s linear;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 过渡动画 */
.toast-slide-right-enter-active,
.toast-slide-right-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-left-enter-active,
.toast-slide-left-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.toast-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 悬停效果 */
.toast-notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
  }

  .toast-container.top-4 {
    top: 1rem;
  }

  .toast-container.bottom-4 {
    bottom: 1rem;
  }

  .toast-notification {
    @apply max-w-none;
  }
}
</style>
