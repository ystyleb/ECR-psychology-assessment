<template>
  <div class="payment-cancel-page min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <!-- 取消状态卡片 -->
      <div class="cancel-card bg-white rounded-3xl shadow-2xl overflow-hidden">
        <!-- 头部装饰 -->
        <div
          class="cancel-header bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center relative overflow-hidden"
        >
          <div class="cancel-decoration absolute inset-0 opacity-10">
            <div
              class="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"
            ></div>
            <div
              class="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"
            ></div>
          </div>

          <div class="relative z-10">
            <!-- 取消图标 -->
            <div class="cancel-icon mx-auto mb-6">
              <div
                class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse-scale"
              >
                <svg
                  class="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- 标题 -->
            <h1 class="text-3xl font-bold text-white mb-2">支付已取消</h1>
            <p class="text-orange-100 text-lg">没关系，您可以随时重新购买</p>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="cancel-content p-8">
          <!-- 说明信息 -->
          <div class="explanation-section mb-8">
            <div class="explanation-card bg-orange-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  class="w-5 h-5 mr-2 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                了解支付取消的原因
              </h3>

              <div class="reasons-list space-y-3">
                <div class="reason-item flex items-start">
                  <div class="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3"></div>
                  <span class="text-gray-700">您主动取消了支付流程</span>
                </div>
                <div class="reason-item flex items-start">
                  <div class="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3"></div>
                  <span class="text-gray-700">支付过程中遇到了技术问题</span>
                </div>
                <div class="reason-item flex items-start">
                  <div class="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3"></div>
                  <span class="text-gray-700">银行卡或支付方式验证失败</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 您仍可以获得的内容 -->
          <div class="free-features-section mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">您仍可以免费获得</h3>
            <div class="features-grid grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="feature in freeFeatures"
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

          <!-- 详细报告预览 -->
          <div class="premium-preview mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">详细报告包含的额外内容</h3>
            <div
              class="preview-card bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200"
            >
              <div class="premium-features grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="feature in premiumFeatures"
                  :key="feature"
                  class="premium-item flex items-start"
                >
                  <svg
                    class="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    ></path>
                  </svg>
                  <span class="text-gray-700">{{ feature }}</span>
                </div>
              </div>

              <div class="pricing-info mt-6 text-center">
                <div class="price text-2xl font-bold text-blue-600 mb-2">仅需 ¥19.90</div>
                <div class="price-description text-sm text-gray-600">一次购买，永久访问</div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons space-y-4">
            <!-- 主要操作 -->
            <div class="primary-actions space-y-3">
              <button
                v-if="assessmentId"
                @click="retryPayment"
                :disabled="isRetrying"
                class="primary-button w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="!isRetrying"
                  class="w-5 h-5 mr-2 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 mr-2 inline-block animate-spin"
                  fill="none"
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
                {{ isRetrying ? '正在跳转...' : '重新购买详细报告' }}
              </button>

              <button
                @click="viewBasicReport"
                class="secondary-button w-full py-3 px-6 bg-green-100 text-green-700 rounded-2xl font-medium hover:bg-green-200 transition-all duration-300"
              >
                <svg
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
                查看基础报告
              </button>
            </div>

            <!-- 次要操作 -->
            <div class="secondary-actions flex flex-col sm:flex-row gap-3">
              <button
                @click="contactSupport"
                class="support-button flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                <svg
                  class="w-4 h-4 mr-2 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                需要帮助？
              </button>

              <router-link
                to="/"
                class="home-button flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 text-center"
              >
                <svg
                  class="w-4 h-4 mr-2 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                返回首页
              </router-link>
            </div>
          </div>
        </div>
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
import logger from '@/utils/logger'
// import { useUIStore } from '@/stores/ui'

// 响应式数据
const isRetrying = ref(false)
const toastMessage = ref('')

// 免费功能列表
const freeFeatures = ['基础依恋类型判断', '简要特征描述', '基础评分展示', '测评历史记录']

// 付费功能列表
const premiumFeatures = [
  '详细的个性特征分析',
  '深度关系模式解读',
  '专业成长建议',
  '兼容性分析报告',
  '个人发展路径',
  '专业心理学解释'
]

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
// const uiStore = useUIStore()

// 计算属性
const assessmentId = computed(() => route.query.assessment_id as string)

// 方法
const retryPayment = async () => {
  if (!assessmentId.value) {
    showToast('缺少测评信息，请重新进行测评')
    return
  }

  try {
    isRetrying.value = true
    showToast('正在跳转到支付页面...')

    // 重置支付状态
    paymentStore.resetPaymentState()

    // 发起新的支付
    const session = await paymentStore.initiatePayment(assessmentId.value)

    if (session) {
      // 如果成功创建会话，会自动跳转到 Stripe
      logger.log('Payment retry initiated:', session)
    }
  } catch (error) {
    logger.error('Retry payment failed:', error)
    showToast('支付跳转失败，请稍后重试')
  } finally {
    isRetrying.value = false
  }
}

const viewBasicReport = () => {
  if (assessmentId.value) {
    router.push(`/assessment/${assessmentId.value}/report`)
  } else {
    router.push('/assessments')
  }
}

const contactSupport = () => {
  showToast('客服邮箱：support@ecr-assessment.com')

  // 可以在这里添加更多客服功能，比如在线聊天
  const supportInfo = {
    email: 'support@ecr-assessment.com',
    wechat: 'ECR-Support',
    phone: '400-123-4567'
  }

  logger.log('Support contact info:', supportInfo)
}

const showToast = (message: string) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// 生命周期
onMounted(() => {
  // 清理支付状态
  paymentStore.cancelPayment()

  // 记录取消事件（用于分析）
  logger.log('Payment cancelled:', {
    assessmentId: assessmentId.value,
    timestamp: new Date().toISOString(),
    sessionId: route.query.session_id
  })

  // 显示提示
  uiStore.showInfo('支付已取消，您可以随时重新购买')
})
</script>

<style scoped>
/* 取消动画 */
@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-pulse-scale {
  animation: pulse-scale 2s ease-in-out infinite;
}

/* 卡片动画 */
.cancel-card {
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

.secondary-button:hover,
.support-button:hover,
.home-button:hover {
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

/* 功能特性样式 */
.feature-item,
.premium-item {
  padding: 0.5rem 0;
}

.reason-item {
  padding: 0.25rem 0;
}

/* 价格展示 */
.pricing-info {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .cancel-header {
    padding: 2rem 1.5rem;
  }

  .cancel-content {
    padding: 1.5rem;
  }

  .primary-button,
  .secondary-button,
  .support-button {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }

  .features-grid,
  .premium-features {
    grid-template-columns: 1fr;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .cancel-card {
    border: 2px solid #000;
  }

  .explanation-card,
  .preview-card {
    border-width: 2px;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-scale,
  .cancel-card,
  .primary-button,
  .secondary-button {
    animation: none;
    transition: none;
  }
}

/* 暗色主题适配 */
[data-theme='dark'] .cancel-card {
  background-color: #1f2937;
  color: #f3f4f6;
}

[data-theme='dark'] .explanation-card {
  background-color: #374151;
  color: #f3f4f6;
}

[data-theme='dark'] .preview-card {
  background: linear-gradient(to right, #374151, #4b5563);
  border-color: #6b7280;
}

/* 打印样式 */
@media print {
  .action-buttons,
  .toast {
    display: none;
  }

  .cancel-card {
    box-shadow: none;
    border: 1px solid #000;
  }
}
</style>
