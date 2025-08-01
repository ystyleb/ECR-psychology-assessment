<template>
  <div class="payment-success-page min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <!-- 成功状态卡片 -->
      <div class="success-card bg-white rounded-3xl shadow-2xl overflow-hidden">
        <!-- 头部装饰 -->
        <div
          class="success-header bg-gradient-to-r from-green-500 to-blue-500 p-8 text-center relative overflow-hidden"
        >
          <div class="success-decoration absolute inset-0 opacity-10">
            <div
              class="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"
            ></div>
            <div
              class="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"
            ></div>
          </div>

          <div class="relative z-10">
            <!-- 成功图标动画 -->
            <div class="success-icon mx-auto mb-6">
              <div
                class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce-in"
              >
                <svg
                  class="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- 标题 -->
            <h1 class="text-3xl font-bold text-white mb-2">支付成功！</h1>
            <p class="text-green-100 text-lg">您的详细报告已解锁</p>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="success-content p-8">
          <!-- 加载状态 -->
          <div v-if="isVerifying" class="verification-loading text-center py-8">
            <div class="loading-spinner mx-auto mb-4">
              <svg class="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
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
            <h3 class="text-lg font-semibold text-gray-800 mb-2">正在验证支付...</h3>
            <p class="text-gray-600">请稍候，我们正在确认您的支付状态</p>
          </div>

          <!-- 成功内容 -->
          <div v-else-if="verificationSuccess" class="success-details">
            <!-- 购买信息 -->
            <div class="purchase-info bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  class="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                购买详情
              </h3>

              <div class="info-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="info-item">
                  <div class="label text-sm text-gray-600 mb-1">商品</div>
                  <div class="value text-gray-800 font-medium">ECR详细报告</div>
                </div>

                <div class="info-item">
                  <div class="label text-sm text-gray-600 mb-1">金额</div>
                  <div class="value text-gray-800 font-medium">¥19.90</div>
                </div>

                <div class="info-item" v-if="paymentInfo.customerEmail">
                  <div class="label text-sm text-gray-600 mb-1">邮箱</div>
                  <div class="value text-gray-800 font-medium">{{ paymentInfo.customerEmail }}</div>
                </div>

                <div class="info-item">
                  <div class="label text-sm text-gray-600 mb-1">支付时间</div>
                  <div class="value text-gray-800 font-medium">{{ formatDate(new Date()) }}</div>
                </div>
              </div>
            </div>

            <!-- 功能特性 -->
            <div class="features-section mb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">您已解锁</h3>
              <div class="features-grid grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="feature in features"
                  :key="feature"
                  class="feature-item flex items-start"
                >
                  <svg
                    class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
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
                  <span class="text-gray-700">{{ feature }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons space-y-4">
              <button
                @click="goToReport"
                :disabled="isNavigatingToReport"
                class="primary-button w-full py-4 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg
                  v-if="!isNavigatingToReport"
                  class="w-5 h-5 mr-2 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 mr-2 inline-block animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                {{ isNavigatingToReport ? '正在加载报告...' : '查看详细报告' }}
              </button>


            </div>
          </div>

          <!-- 验证失败 -->
          <div v-else-if="verificationError" class="verification-error text-center py-8">
            <div class="error-icon mx-auto mb-4">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  class="w-8 h-8 text-red-500"
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
              </div>
            </div>

            <h3 class="text-lg font-semibold text-gray-800 mb-2">支付验证失败</h3>
            <p class="text-gray-600 mb-6">{{ errorMessage || '无法验证支付状态，请联系客服' }}</p>

            <div class="error-actions space-y-3">
              <button
                @click="retryVerification"
                class="retry-button w-full py-3 px-6 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200"
              >
                重试验证
              </button>

              <button
                @click="contactSupport"
                class="support-button w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                联系客服
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 返回首页链接 -->
      <div class="back-home text-center mt-8">
        <router-link
          to="/"
          class="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          返回首页
        </router-link>
      </div>
    </div>

    <!-- Toast 通知 -->
    <Transition name="slide-up">
      <div
        v-if="toastMessage"
        class="toast fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-xl z-50"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import { isFeatureEnabled } from '@/config/features'
// import { useUIStore } from '@/stores/ui'

// 响应式数据
const isVerifying = ref(true)
const verificationSuccess = ref(false)
const verificationError = ref(false)
const errorMessage = ref('')
const toastMessage = ref('')
const isNavigatingToReport = ref(false)
const paymentInfo = ref({
  customerEmail: '',
  receiptUrl: ''
})

// 功能特性列表
const features = [
  '详细的依恋风格分析',
  '个性特征深度解读',
  '专业成长建议',
  '关系兼容性分析',
  '永久访问权限',
  '个人发展路径'
]

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 计算属性
const sessionId = computed(() => route.query.session_id as string)
const assessmentId = computed(() => route.query.assessment_id as string)

// 方法
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const verifyPayment = async () => {
  if (!sessionId.value) {
    verificationError.value = true
    errorMessage.value = '缺少支付会话信息'
    isVerifying.value = false
    return
  }

  try {
    // 开发环境模拟支付验证成功
    if (isFeatureEnabled('enableDevelopmentTools') && sessionId.value.includes('mock_session')) {
      console.log('🔧 Development mode: Mock payment verification success')
      
      // 模拟支付状态更新
      const sessions = JSON.parse(localStorage.getItem('ecr_payment_sessions') || '{}')
      if (assessmentId.value && sessions[assessmentId.value]) {
        sessions[assessmentId.value].status = 'completed'
        localStorage.setItem('ecr_payment_sessions', JSON.stringify(sessions))
      }
      
      verificationSuccess.value = true
      isVerifying.value = false
      return
    }
    
    // 生产环境实际验证
    const result = await appStore.verifyPayment(sessionId.value)
    const success = result.success

    if (success) {
      verificationSuccess.value = true

      // 设置支付信息（模拟）
      paymentInfo.value = {
        customerEmail: 'user@example.com',
        receiptUrl: '#'
      }

      showToast('支付验证成功！')
    } else {
      verificationError.value = true
      errorMessage.value = '支付验证失败'
    }
  } catch (error) {
    console.error('Payment verification failed:', error)
    verificationError.value = true
    errorMessage.value = '验证过程中发生错误'
  } finally {
    isVerifying.value = false
  }
}

const retryVerification = async () => {
  isVerifying.value = true
  verificationError.value = false
  errorMessage.value = ''

  // 等待一秒后重试
  setTimeout(() => {
    verifyPayment()
  }, 1000)
}

const goToReport = async () => {
  if (isNavigatingToReport.value) return // 防止重复点击
  
  isNavigatingToReport.value = true
  
  try {
    // 模拟一个短暂的延时来展示loading状态
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (assessmentId.value) {
      // 跳转到详细报告页面
      router.push(`/report/${assessmentId.value}/detailed`)
    } else {
      // 没有assessmentId时跳转到首页
      router.push('/')
    }
  } catch (error) {
    console.error('Navigation failed:', error)
    showToast('跳转失败，请重试')
  } finally {
    // 延迟重置loading状态，确保用户能看到loading效果
    setTimeout(() => {
      isNavigatingToReport.value = false
    }, 1000)
  }
}

const downloadReceipt = () => {
  if (paymentInfo.value.receiptUrl) {
    window.open(paymentInfo.value.receiptUrl, '_blank')
  } else {
    showToast('收据下载链接不可用')
  }
}

const shareResult = async () => {
  const shareData = {
    title: 'ECR心理测评',
    text: '我刚完成了ECR亲密关系经历量表测评，了解了自己的依恋风格！',
    url: window.location.origin
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // 降级到复制链接
      await navigator.clipboard.writeText(shareData.url)
      showToast('链接已复制到剪贴板')
    }
  } catch (error) {
    console.error('Share failed:', error)
    showToast('分享功能暂不可用')
  }
}

const contactSupport = () => {
  // 可以跳转到客服页面或显示联系方式
  showToast('客服邮箱：support@ecr-assessment.com')
}

const showToast = (message: string) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// 生命周期
onMounted(() => {
  // 验证支付
  verifyPayment()

  // 显示成功提示
  appStore.showSuccess('支付成功！')
})
</script>

<style scoped>
/* 成功动画 */
@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 卡片阴影动画 */
.success-card {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮悬停效果 */
.primary-button:hover:not(:disabled) {
  transform: scale(1.02) translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.primary-button:disabled:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.secondary-button:hover {
  transform: translateY(-1px);
}

/* Toast 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* 信息网格样式 */
.info-grid .info-item {
  padding: 0.75rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

/* 功能特性样式 */
.features-grid .feature-item {
  padding: 0.5rem 0;
}

/* 加载动画优化 */
.loading-spinner svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* 响应式设计 */
@media (max-width: 640px) {
  .success-header {
    padding: 2rem 1.5rem;
  }

  .success-content {
    padding: 1.5rem;
  }

  .primary-button,
  .secondary-button {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .success-card {
    border: 2px solid #000;
  }

  .info-item {
    border-width: 2px;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .animate-bounce-in,
  .success-card,
  .primary-button,
  .secondary-button {
    animation: none;
    transition: none;
  }
}

/* 暗色主题适配 */
[data-theme='dark'] .success-card {
  background-color: #1f2937;
  color: #f3f4f6;
}

[data-theme='dark'] .info-item {
  background-color: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

[data-theme='dark'] .secondary-button {
  background-color: #374151;
  color: #f3f4f6;
}

/* 打印样式 */
@media print {
  .action-buttons,
  .back-home,
  .toast {
    display: none;
  }

  .success-card {
    box-shadow: none;
    border: 1px solid #000;
  }
}
</style>
