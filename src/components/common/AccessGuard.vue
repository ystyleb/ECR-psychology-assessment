<template>
  <div class="access-guard">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">正在验证访问权限...</p>
      </div>
    </div>

    <!-- 访问被拒绝 -->
    <div v-else-if="!hasAccess && !loading" class="access-denied">
      <div class="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="mb-6">
          <i :class="iconClass" :style="{ color: iconColor }" class="text-5xl mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ title }}</h3>
          <p class="text-gray-600">{{ message }}</p>
        </div>

        <!-- 解锁选项 -->
        <div v-if="showUnlockOption" class="mb-6">
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-gray-700 mb-2">解锁详细报告</h4>
            <div class="text-sm text-gray-600 space-y-1">
              <div class="flex items-center justify-center">
                <span class="text-2xl font-bold text-blue-600">¥19.9</span>
                <span class="text-sm text-gray-500 line-through ml-2">¥39.9</span>
              </div>
              <p>一次购买，永久访问</p>
            </div>
          </div>

          <button
            @click="handleUnlock"
            :disabled="unlocking"
            class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="unlocking" class="flex items-center justify-center">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              处理中...
            </span>
            <span v-else>
              <i class="fas fa-unlock mr-2"></i>
              立即解锁
            </span>
          </button>
        </div>

        <!-- 其他操作 -->
        <div class="flex flex-col space-y-2">
          <button
            v-if="showRetryOption"
            @click="handleRetry"
            class="text-blue-600 hover:text-blue-700 transition-colors"
          >
            <i class="fas fa-redo mr-1"></i>
            重新检查
          </button>

          <button
            v-if="showBackOption"
            @click="handleGoBack"
            class="text-gray-600 hover:text-gray-700 transition-colors"
          >
            <i class="fas fa-arrow-left mr-1"></i>
            返回上一页
          </button>

          <button
            v-if="showContactOption"
            @click="handleContact"
            class="text-green-600 hover:text-green-700 transition-colors"
          >
            <i class="fas fa-envelope mr-1"></i>
            联系客服
          </button>
        </div>
      </div>
    </div>

    <!-- 访问被允许，显示内容 -->
    <div v-else-if="hasAccess">
      <slot></slot>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
        <h3 class="text-lg font-semibold text-red-800 mb-2">验证失败</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
          @click="handleRetry"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment'
import { useUIStore } from '@/stores/ui'

type AccessType = 'payment' | 'auth' | 'permission' | 'custom'

interface Props {
  // 访问控制类型
  accessType: AccessType
  // 资源标识符（如assessmentId）
  resourceId?: string
  // 自定义验证函数
  customValidator?: () => Promise<boolean> | boolean
  // 显示选项
  showUnlockOption?: boolean
  showRetryOption?: boolean
  showBackOption?: boolean
  showContactOption?: boolean
  // 自定义文案
  title?: string
  message?: string
  icon?: string
  iconColor?: string
  // 自动重试
  autoRetry?: boolean
  retryInterval?: number
  maxRetries?: number
}

const props = withDefaults(defineProps<Props>(), {
  accessType: 'payment',
  showUnlockOption: true,
  showRetryOption: true,
  showBackOption: true,
  showContactOption: false,
  autoRetry: false,
  retryInterval: 5000,
  maxRetries: 3
})

const emit = defineEmits<{
  accessGranted: []
  accessDenied: [reason: string]
  unlockRequested: [resourceId: string]
  retryRequested: []
  contactRequested: []
}>()

const router = useRouter()
const paymentStore = usePaymentStore()
const uiStore = useUIStore()

// 响应式状态
const loading = ref(true)
const hasAccess = ref(false)
const error = ref<string | null>(null)
const unlocking = ref(false)
const retryCount = ref(0)

// 计算属性
const iconClass = computed(() => {
  if (props.icon) return props.icon

  switch (props.accessType) {
    case 'payment':
      return 'fas fa-lock'
    case 'auth':
      return 'fas fa-user-lock'
    case 'permission':
      return 'fas fa-shield-alt'
    default:
      return 'fas fa-exclamation-circle'
  }
})

const iconColor = computed(() => {
  return props.iconColor || '#f59e0b'
})

const title = computed(() => {
  if (props.title) return props.title

  switch (props.accessType) {
    case 'payment':
      return '需要付费解锁'
    case 'auth':
      return '需要登录'
    case 'permission':
      return '权限不足'
    default:
      return '访问受限'
  }
})

const message = computed(() => {
  if (props.message) return props.message

  switch (props.accessType) {
    case 'payment':
      return '此内容需要付费后才能查看，请先购买详细报告。'
    case 'auth':
      return '请先登录您的账户以继续访问。'
    case 'permission':
      return '您没有足够的权限访问此内容。'
    default:
      return '您无法访问此内容。'
  }
})

// 生命周期
onMounted(async () => {
  await checkAccess()

  if (props.autoRetry && !hasAccess.value && !error.value) {
    startAutoRetry()
  }
})

// 监听资源ID变化
watch(
  () => props.resourceId,
  async () => {
    if (props.resourceId) {
      await checkAccess()
    }
  }
)

// 方法
const checkAccess = async () => {
  try {
    loading.value = true
    error.value = null

    let accessGranted = false

    switch (props.accessType) {
      case 'payment':
        if (props.resourceId) {
          accessGranted = paymentStore.isReportUnlocked(props.resourceId)
        }
        break

      case 'auth':
        // 这里可以添加认证逻辑
        accessGranted = true // 暂时允许
        break

      case 'permission':
        // 这里可以添加权限检查逻辑
        accessGranted = true // 暂时允许
        break

      case 'custom':
        if (props.customValidator) {
          accessGranted = await props.customValidator()
        }
        break
    }

    hasAccess.value = accessGranted

    if (accessGranted) {
      emit('accessGranted')
    } else {
      emit('accessDenied', `Access denied for ${props.accessType}`)
    }
  } catch (err) {
    console.error('Access check failed:', err)
    error.value = err instanceof Error ? err.message : '访问验证失败'
  } finally {
    loading.value = false
  }
}

const handleUnlock = async () => {
  if (!props.resourceId) return

  try {
    unlocking.value = true
    emit('unlockRequested', props.resourceId)

    await paymentStore.initiatePayment(props.resourceId)
  } catch (err) {
    console.error('Unlock failed:', err)
    uiStore.showError('解锁失败，请重试')
  } finally {
    unlocking.value = false
  }
}

const handleRetry = async () => {
  retryCount.value++
  emit('retryRequested')
  await checkAccess()
}

const handleGoBack = () => {
  router.go(-1)
}

const handleContact = () => {
  emit('contactRequested')
  uiStore.showInfo('客服功能即将推出')
}

const startAutoRetry = () => {
  const interval = setInterval(async () => {
    if (retryCount.value >= props.maxRetries) {
      clearInterval(interval)
      return
    }

    if (!hasAccess.value && !loading.value) {
      await handleRetry()
    } else {
      clearInterval(interval)
    }
  }, props.retryInterval)
}

// 导出方法供父组件使用
defineExpose({
  checkAccess,
  hasAccess: computed(() => hasAccess.value),
  loading: computed(() => loading.value),
  error: computed(() => error.value)
})
</script>

<style scoped>
.access-guard {
  @apply w-full;
}

.access-denied,
.error-state {
  @apply flex items-center justify-center min-h-96 p-4;
}

/* 动画效果 */
.access-denied > div,
.error-state > div {
  animation: fadeInUp 0.5s ease-out;
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

/* 响应式调整 */
@media (max-width: 640px) {
  .access-denied,
  .error-state {
    @apply min-h-80 p-2;
  }
}
</style>
