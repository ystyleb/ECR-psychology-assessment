<template>
  <div class="payment-button-container">
    <!-- 主要支付按钮 -->
    <button
      @click="handlePayment"
      :disabled="isDisabled"
      :class="[
        'payment-button w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform relative overflow-hidden',
        'focus:outline-none focus:ring-4 focus:ring-blue-200',
        'disabled:cursor-not-allowed disabled:transform-none',
        buttonVariantClasses
      ]"
      :aria-label="buttonAriaLabel"
    >
      <!-- 按钮内容 -->
      <div class="button-content flex items-center justify-center relative z-10">
        <!-- 加载动画 -->
        <div v-if="isLoading" class="loading-spinner mr-3">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <!-- 成功图标 -->
        <div v-else-if="isPaid" class="success-icon mr-3">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        <!-- 锁定图标 -->
        <div v-else-if="showLockIcon" class="lock-icon mr-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
        </div>

        <!-- 按钮文本 -->
        <span class="button-text">{{ buttonText }}</span>

        <!-- 价格显示 -->
        <span v-if="showPrice && !isPaid" class="price-text ml-2 font-bold">
          {{ formatPrice(price, currency) }}
        </span>
      </div>

      <!-- 按钮背景动画 -->
      <div
        v-if="!isDisabled"
        class="button-animation absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transform -skew-x-12 transition-all duration-700"
        :class="{ 'animate-shimmer': isHovered }"
      ></div>

      <!-- 波纹效果 -->
      <div
        ref="rippleRef"
        class="ripple-effect absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
      ></div>
    </button>

    <!-- 安全提示 -->
    <div v-if="showSecurityNote" class="security-note mt-3 text-center">
      <div class="flex items-center justify-center text-sm text-gray-600">
        <svg
          class="w-4 h-4 mr-2 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          ></path>
        </svg>
        <span>由 Stripe 提供安全支付保障</span>
      </div>
    </div>

    <!-- 功能说明 -->
    <div v-if="showFeatures" class="features-list mt-4">
      <div class="text-sm text-gray-600 mb-2 font-medium">您将获得：</div>
      <ul class="space-y-1">
        <li
          v-for="feature in features"
          :key="feature"
          class="flex items-center text-sm text-gray-700"
        >
          <svg
            class="w-4 h-4 mr-2 text-green-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <span>{{ feature }}</span>
        </li>
      </ul>
    </div>

    <!-- 错误提示 -->
    <Transition name="slide-down">
      <div v-if="error" class="error-message mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <svg
            class="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="text-sm text-red-700">{{ error }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/store'
import logger from '@/utils/logger'

interface Props {
  assessmentId: string
  variant?: 'primary' | 'secondary' | 'success' | 'disabled'
  size?: 'sm' | 'md' | 'lg'
  price?: number
  currency?: string
  showPrice?: boolean
  showSecurityNote?: boolean
  showFeatures?: boolean
  disabled?: boolean
  loading?: boolean
  features?: string[]
}

// 导入现有的支付类型
import type { PaymentSession, PaymentResult } from '@/types/payment'

interface Emits {
  (e: 'payment-initiated', session: PaymentSession): void
  (e: 'payment-success', result: PaymentResult): void
  (e: 'payment-error', error: string): void
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  price: 1990,
  currency: 'CNY',
  showPrice: true,
  showSecurityNote: true,
  showFeatures: true,
  disabled: false,
  loading: false,
  features: () => [
    '详细的依恋风格分析',
    '个性特征深度解读',
    '专业成长建议',
    '关系兼容性分析',
    '永久访问权限'
  ]
})

const emit = defineEmits<Emits>()

// 响应式引用
const rippleRef = ref<HTMLElement>()
const isHovered = ref(false)
const isProcessing = ref(false)

// 支付store（使用统一store）
const appStore = useAppStore()

// 计算属性
const isLoading = computed(() => {
  return props.loading || isProcessing.value || appStore.paymentStatus === 'loading'
})

const isPaid = computed(() => {
  return (
    appStore.checkPaymentStatus(props.assessmentId) || appStore.paymentStatus === 'success'
  )
})

const error = computed(() => {
  return appStore.paymentError
})

const isDisabled = computed(() => {
  return props.disabled || isLoading.value || isPaid.value
})

const showLockIcon = computed(() => {
  return !isPaid.value && !isLoading.value
})

const buttonText = computed(() => {
  if (isPaid.value) {
    return '已购买'
  }
  if (isLoading.value) {
    if (appStore.paymentStatus === 'verifying') {
      return '验证支付中...'
    }
    return '处理中...'
  }
  return '解锁详细报告'
})

const buttonAriaLabel = computed(() => {
  if (isPaid.value) {
    return '报告已解锁'
  }
  if (isLoading.value) {
    return '正在处理支付请求'
  }
  return `解锁详细报告，价格 ${formatPrice(props.price, props.currency)}`
})

const buttonVariantClasses = computed(() => {
  if (isPaid.value) {
    return 'bg-green-500 text-white border-2 border-green-500 shadow-lg'
  }

  if (isDisabled.value) {
    return 'bg-gray-300 text-gray-500 border-2 border-gray-300 cursor-not-allowed'
  }

  switch (props.variant) {
    case 'primary':
      return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-2 border-transparent shadow-xl hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-2xl'
    case 'secondary':
      return 'bg-white text-blue-600 border-2 border-blue-600 shadow-lg hover:bg-blue-50 hover:scale-105'
    case 'success':
      return 'bg-green-500 text-white border-2 border-green-500 shadow-lg hover:bg-green-600 hover:scale-105'
    default:
      return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-2 border-transparent shadow-xl hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-2xl'
  }
})

// 方法
const formatPrice = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount / 100)
}

const handlePayment = async (event: Event) => {
  if (isDisabled.value) return

  emit('click')

  // 创建波纹效果
  createRippleEffect(event)

  // 如果已购买，直接返回
  if (isPaid.value) {
    return
  }

  try {
    isProcessing.value = true

    // 发起支付
    const session = await appStore.initiatePayment(props.assessmentId)

    if (session) {
      emit('payment-initiated', session)
    }
  } catch (error) {
    logger.error('Payment initiation failed:', error)
    const errorMessage = error instanceof Error ? error.message : '支付启动失败'
    emit('payment-error', errorMessage)
  } finally {
    isProcessing.value = false
  }
}

const createRippleEffect = (event: Event) => {
  if (!rippleRef.value || isDisabled.value) return

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = (event as MouseEvent).clientX - rect.left - size / 2
  const y = (event as MouseEvent).clientY - rect.top - size / 2

  const ripple = document.createElement('div')
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  `

  rippleRef.value.appendChild(ripple)

  setTimeout(() => {
    ripple.remove()
  }, 600)
}

const handleMouseEnter = () => {
  if (!isDisabled.value) {
    isHovered.value = true
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
}

// 检查访问状态
const checkAccessStatus = async () => {
  try {
    const hasAccess = appStore.checkPaymentStatus(props.assessmentId)
    if (hasAccess) {
      appStore.paymentStatus = 'success'
    }
  } catch (error) {
    logger.error('Failed to check access status:', error)
  }
}

// 生命周期
onMounted(() => {
  checkAccessStatus()

  // 添加鼠标事件监听器
  const buttonElement = document.querySelector('.payment-button')
  if (buttonElement) {
    buttonElement.addEventListener('mouseenter', handleMouseEnter)
    buttonElement.addEventListener('mouseleave', handleMouseLeave)
  }
})

onUnmounted(() => {
  // 清理事件监听器
  const buttonElement = document.querySelector('.payment-button')
  if (buttonElement) {
    buttonElement.removeEventListener('mouseenter', handleMouseEnter)
    buttonElement.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<style scoped>
/* 波纹动画 */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* 闪光动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-12deg);
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: translateX(200%) skewX(-12deg);
    opacity: 0;
  }
}

.animate-shimmer {
  animation: shimmer 1.5s ease-in-out;
}

/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 按钮悬停效果 */
.payment-button:not(:disabled):hover {
  transform: translateY(-2px);
}

.payment-button:not(:disabled):active {
  transform: translateY(0);
}

/* 加载动画优化 */
.loading-spinner svg {
  animation-duration: 1s;
}

/* 成功状态动画 */
.success-icon svg {
  animation: bounce-in 0.5s ease-out;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .payment-button {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }

  .button-text {
    font-size: 0.95rem;
  }

  .price-text {
    font-size: 0.9rem;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .payment-button {
    border-width: 3px;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .payment-button,
  .loading-spinner svg,
  .success-icon svg,
  .button-animation {
    animation: none;
    transition: none;
  }
}

/* 暗色主题 */
[data-theme='dark'] .payment-button {
  border-color: rgba(255, 255, 255, 0.2);
}

[data-theme='dark'] .security-note {
  color: #d1d5db;
}

[data-theme='dark'] .features-list {
  color: #d1d5db;
}

/* 打印样式 */
@media print {
  .payment-button {
    display: none;
  }
}
</style>
