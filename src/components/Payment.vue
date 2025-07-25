<template>
  <div class="payment-container max-w-md mx-auto p-6">
    <!-- 支付卡片 -->
    <div class="payment-card bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold mb-2">解锁详细报告</h2>
          <p class="text-blue-100">获取个性化的深度分析和成长建议</p>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="p-6">
        <!-- 包含内容 -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">详细报告包含：</h3>
          <ul class="space-y-3">
            <li class="flex items-center text-sm text-gray-600">
              <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              深度个性化分析报告
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              关系改善具体建议
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              成长路径指导方案
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              PDF报告下载功能
            </li>
          </ul>
        </div>

        <!-- 价格信息 -->
        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600">一次性付费</div>
              <div class="text-2xl font-bold text-gray-800">¥29.9</div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500 line-through">原价 ¥59.9</div>
              <div class="text-sm text-green-600 font-medium">限时5折</div>
            </div>
          </div>
        </div>

        <!-- 支付按钮 -->
        <PaymentButton
          :assessment-id="assessmentId"
          :amount="2990"
          :is-processing="isProcessing"
          :disabled="disabled"
          @payment-start="handlePaymentStart"
          @payment-success="handlePaymentSuccess"
          @payment-error="handlePaymentError"
          @payment-cancel="handlePaymentCancel"
        />

        <!-- 支付说明 -->
        <div class="mt-4 text-center">
          <div class="text-xs text-gray-500 space-y-1">
            <p>• 支持微信、支付宝、银行卡支付</p>
            <p>• 安全加密，保护您的隐私</p>
            <p>• 7天无理由退款保障</p>
          </div>
        </div>

        <!-- 支付状态显示 -->
        <div v-if="paymentStatus" class="mt-6">
          <div 
            v-if="paymentStatus === 'success'"
            class="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
          >
            <svg class="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <div class="text-green-800 font-medium">支付成功！</div>
            <div class="text-green-600 text-sm">正在为您准备详细报告...</div>
          </div>

          <div 
            v-else-if="paymentStatus === 'error'"
            class="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
          >
            <svg class="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <div class="text-red-800 font-medium">支付失败</div>
            <div class="text-red-600 text-sm">{{ errorMessage }}</div>
          </div>

          <div 
            v-else-if="paymentStatus === 'pending'"
            class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
          >
            <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div class="text-blue-800 font-medium">处理中...</div>
            <div class="text-blue-600 text-sm">请稍候，正在处理您的支付</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 常见问题 -->
    <div class="mt-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">常见问题</h3>
      <div class="space-y-3">
        <details class="bg-white rounded-lg shadow-sm">
          <summary class="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
            支付后多久能看到详细报告？
          </summary>
          <div class="px-4 pb-4 text-sm text-gray-600">
            支付成功后，系统会立即生成您的详细报告，通常在1-2分钟内即可查看。
          </div>
        </details>
        
        <details class="bg-white rounded-lg shadow-sm">
          <summary class="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
            报告有效期多长？
          </summary>
          <div class="px-4 pb-4 text-sm text-gray-600">
            为保护您的隐私，报告将在30天后自动删除。建议您及时下载保存。
          </div>
        </details>
        
        <details class="bg-white rounded-lg shadow-sm">
          <summary class="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
            如何申请退款？
          </summary>
          <div class="px-4 pb-4 text-sm text-gray-600">
            如果您对报告不满意，可在7天内通过客服申请退款，我们会及时处理。
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useECR } from '@/store'
import type { PaymentStatus } from '@/types'
import PaymentButton from './payment/PaymentButton.vue'

interface Props {
  assessmentId: string
  disabled?: boolean
}

interface Emits {
  (e: 'payment-success', result: any): void
  (e: 'payment-error', error: string): void
  (e: 'payment-cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()
const store = useECR()

// 响应式状态
const isProcessing = ref(false)
const paymentStatus = ref<PaymentStatus | null>(null)
const errorMessage = ref('')

// 计算属性
const disabled = computed(() => props.disabled || isProcessing.value)

// 方法
const handlePaymentStart = () => {
  isProcessing.value = true
  paymentStatus.value = 'pending'
  errorMessage.value = ''
  store.showInfo('正在跳转到支付页面...')
}

const handlePaymentSuccess = (result: any) => {
  isProcessing.value = false
  paymentStatus.value = 'success'
  store.showSuccess('支付成功！正在生成详细报告...')
  emit('payment-success', result)
  
  // 3秒后清除成功状态
  setTimeout(() => {
    paymentStatus.value = null
  }, 3000)
}

const handlePaymentError = (error: string) => {
  isProcessing.value = false
  paymentStatus.value = 'error'
  errorMessage.value = error
  store.showError(error)
  emit('payment-error', error)
  
  // 5秒后清除错误状态
  setTimeout(() => {
    paymentStatus.value = null
    errorMessage.value = ''
  }, 5000)
}

const handlePaymentCancel = () => {
  isProcessing.value = false
  paymentStatus.value = null
  store.showWarning('支付已取消')
  emit('payment-cancel')
}

// 暴露方法给父组件
defineExpose({
  isProcessing,
  paymentStatus,
  handlePaymentStart,
  handlePaymentSuccess,
  handlePaymentError
})
</script>

<style scoped>
/* 支付卡片动画 */
.payment-card {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 支付状态动画 */
.payment-card [class*="bg-green-50"],
.payment-card [class*="bg-red-50"],
.payment-card [class*="bg-blue-50"] {
  animation: fadeInScale 0.4s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 常见问题样式 */
details {
  transition: all 0.3s ease;
}

details[open] {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

details summary {
  transition: background-color 0.2s ease;
}

details summary:hover {
  background-color: #f9fafb;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .payment-container {
    padding: 1rem;
    max-width: 100%;
  }
  
  .payment-card .p-6 {
    padding: 1.5rem;
  }
}

/* 暗色主题 */
[data-theme='dark'] .payment-card {
  background-color: #1f2937;
}

[data-theme='dark'] .payment-card h2,
[data-theme='dark'] .payment-card h3 {
  color: #f9fafb;
}

[data-theme='dark'] .payment-card .bg-gray-50 {
  background-color: #374151;
}

[data-theme='dark'] details {
  background-color: #374151;
}

[data-theme='dark'] details summary {
  color: #f3f4f6;
}

[data-theme='dark'] details summary:hover {
  background-color: #4b5563;
}

/* 打印样式 */
@media print {
  .payment-container {
    display: none;
  }
}
</style>