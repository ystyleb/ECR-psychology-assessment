<template>
  <BaseReportView
    mode="basic"
    :assessment-id="assessmentId"
    :loading="loading"
    :error="error"
    :report-data="basicReportData"
    :has-access="shouldShowUnlockButton"
    @retry="retryLoad"
  >
    <!-- 基础报告内容 -->
    <template #basic-content="{ reportData }">
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <AttachmentTypeCard 
          :attachment-type="reportData.basicResult.attachmentStyle"
          :description="attachmentDescription"
          class="mb-8"
        />
      </div>
    </template>

    <!-- 解锁按钮 -->
    <template #unlock-button="{ assessmentId }">
      <UnlockButton 
        :assessment-id="assessmentId"
        :is-processing="isPaymentLoading"
        @unlock="handleUnlock"
        @preview="handlePreview"
        @share="handleShareBasicReport"
      />
    </template>
  </BaseReportView>

  <!-- 详细报告预览模态窗口 -->
  <DetailedReportPreview
    :show="showPreview"
    :attachment-style="basicResult?.attachmentStyle"
    @close="showPreview = false"
    @unlock="handleUnlockFromPreview"
  />

  <!-- 基础报告分享模态窗口 -->
  <div
    v-if="showShareModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="showShareModal = false"
  >
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4" @click.stop>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">分享基础报告</h3>
          <button @click="showShareModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 报告预览卡片 -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
          <div class="text-center">
            <div class="text-2xl mb-2">{{ attachmentStyleEmoji }}</div>
            <h4 class="font-semibold text-gray-800 mb-1">{{ attachmentDescription?.title }}</h4>
            <p class="text-sm text-gray-600">ECR依恋类型测评结果</p>
          </div>
        </div>

        <!-- 分享选项 -->
        <div class="space-y-4">
          <!-- 链接分享 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">分享链接</h4>
            <div class="flex items-center space-x-2">
              <input
                ref="linkInput"
                :value="shareUrl"
                readonly
                class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              />
              <button
                @click="copyLink"
                class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">复制链接分享给朋友</p>
          </div>

          <!-- 社交媒体分享 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-700 mb-3">快速分享</h4>
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="shareToWeChat"
                class="flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <i class="fab fa-weixin"></i>
                <span class="text-sm">微信</span>
              </button>

              <button
                @click="shareToWeibo"
                class="flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <i class="fab fa-weibo"></i>
                <span class="text-sm">微博</span>
              </button>
            </div>
          </div>

          <!-- 隐私提醒 -->
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-start space-x-2">
              <i class="fas fa-info-circle text-blue-500 mt-1"></i>
              <div>
                <h4 class="text-sm font-medium text-blue-700 mb-1">隐私提醒</h4>
                <p class="text-xs text-blue-600">
                  分享的是您的基础测评结果，不包含详细分析内容。链接仅显示依恋类型，保护您的隐私。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center justify-end space-x-3 mt-6">
          <button
            @click="showShareModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 成功提示 -->
  <div
    v-if="showSuccessMessage"
    class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
  >
    <i class="fas fa-check mr-2"></i>
    {{ successMessage }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import { useReportData } from '@/composables/useReportData'
import { debugLog } from '@/utils/debugLog'

// 组件导入
import BaseReportView from '@/components/BaseReportView.vue'
import AttachmentTypeCard from '@/components/report/AttachmentTypeCard.vue'
import UnlockButton from '@/components/report/UnlockButton.vue'
import DetailedReportPreview from '@/components/report/DetailedReportPreview.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 响应式状态
const loading = ref(true)
const error = ref<string | null>(null)
const isPaymentLoading = ref(false)
const showPreview = ref(false)
const showShareModal = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')
const linkInput = ref<HTMLInputElement>()

// 计算属性
const assessmentId = computed(() => route.params.id as string)

const isReportUnlocked = computed(() => {
  return appStore.checkPaymentStatus(assessmentId.value).isPaid
})

// 开发环境下的UI显示控制 - 即使跳过支付也显示解锁按钮以便测试
const shouldShowUnlockButton = computed(() => {
  const isDevelopment = import.meta.env.DEV
  const skipPaymentInDev = import.meta.env.VITE_SKIP_PAYMENT_IN_DEV === 'true'
  
  // 开发环境下如果开启了跳过支付，仍然显示解锁按钮（返回false表示没有访问权限，这样解锁按钮会显示）
  if (isDevelopment && skipPaymentInDev) {
    console.log('🔧 开发环境：显示解锁按钮以便测试完整支付流程')
    return false // 表示UI上显示为"未解锁"状态
  }
  
  // 正常情况下根据实际支付状态决定
  return isReportUnlocked.value
})

const currentAssessment = computed(() => appStore.currentAssessment)
const basicResult = computed(() => {
  // 从日志中我们知道数据实际保存在basicResult中，强制类型转换
  const assessment = currentAssessment.value as any
  const result = assessment?.basicResult
  if (!result) return null
  
  // 转换为BasicResult类型，处理不同的属性名
  return {
    anxious: result.anxious,
    avoidant: result.avoidant,
    attachmentStyle: result.style
  }
})

// 使用报告数据组合式API
const { attachmentDescription, basicReportData } = useReportData(
  assessmentId,
  basicResult
)

// 分享相关计算属性
const shareUrl = computed(() => {
  const baseUrl = window.location.origin
  const reportPath = `/report/${assessmentId.value}`
  return `${baseUrl}${reportPath}`
})

const shareText = computed(() => {
  const attachmentType = attachmentDescription.value?.title || basicResult.value?.attachmentStyle
  return `我刚完成了ECR依恋测评，结果是${attachmentType}。快来看看我的测评结果！`
})

const attachmentStyleEmoji = computed(() => {
  const style = basicResult.value?.attachmentStyle?.toLowerCase()
  switch (style) {
    case 'secure':
    case '安全型':
      return '🤝'
    case 'anxious':
    case '焦虑型':
      return '😰'
    case 'avoidant':  
    case '回避型':
      return '🚪'
    case 'disorganized':
    case '混乱型':
      return '🌪️'
    default:
      return '📊'
  }
})

// 生命周期
onMounted(async () => {
  await loadBasicReport()
})

// 方法
const loadBasicReport = async () => {
  try {
    loading.value = true
    error.value = null
    
    debugLog.log('📈 ReportView: Loading report for assessment ID:', assessmentId.value)
    
    // 从统一store获取评估数据
    const hasAssessment = appStore.hasAssessment(assessmentId.value)
    debugLog.log('📈 ReportView: hasAssessment:', hasAssessment)
    
    if (!hasAssessment) {
      error.value = '未找到测评，请先完成测评'
      return
    }
    
    // 加载评估数据（如果需要）
    if (appStore.currentAssessment?.id !== assessmentId.value) {
      const success = await appStore.loadAssessment(assessmentId.value)
      debugLog.log('📈 ReportView: loadAssessment success:', success)
      if (!success) {
        error.value = '无法加载测评数据'
        return
      }
    }
    
    // 检查是否有结果
    const assessment = appStore.currentAssessment
    debugLog.log('📈 ReportView: Current assessment:', assessment)
    debugLog.log('📈 ReportView: Has result:', !!(assessment as any)?.basicResult)
    
    if (!assessment || !(assessment as any)?.basicResult) {
      error.value = '测评尚未完成，请先完成所有题目'
      return
    }
    
    debugLog.log('📈 ReportView: Basic result:', assessment.result)
  } catch (err) {
    console.error('Failed to load basic report:', err)
    error.value = err instanceof Error ? err.message : '报告加载失败'
  } finally {
    loading.value = false
  }
}

const retryLoad = () => {
  error.value = null
  loadBasicReport()
}

const handleUnlock = async () => {
  try {
    // 开发环境下如果跳过支付，直接跳转到详细报告页面
    const isDevelopment = import.meta.env.DEV
    const skipPaymentInDev = import.meta.env.VITE_SKIP_PAYMENT_IN_DEV === 'true'
    
    if (isDevelopment && skipPaymentInDev) {
      console.log('🔧 开发环境：跳过支付流程，直接跳转到详细报告页面')
      router.push(`/report/${assessmentId.value}/detailed`)
      return
    }
    
    isPaymentLoading.value = true
    debugLog.log('🔓 Starting payment process for assessment:', assessmentId.value)
    
    // 发起支付
    const session = await appStore.initiatePayment(assessmentId.value)
    
    if (session && (session as any).url) {
      debugLog.log('💳 Redirecting to payment URL:', (session as any).url)
      // 跳转到Stripe支付页面
      window.location.href = (session as any).url
    } else {
      console.error('❌ No payment URL received')
      appStore.showError('支付创建失败，请重试')
    }
  } catch (error) {
    console.error('❌ Payment initiation failed:', error)
    appStore.showError('支付创建失败，请重试')
  } finally {
    isPaymentLoading.value = false
  }
}

const handlePreview = () => {
  showPreview.value = true
  debugLog.log('👁️ Opening detailed report preview')
}

const handleUnlockFromPreview = () => {
  showPreview.value = false
  handleUnlock()
}

const handleShare = (platform: string, url: string) => {
  debugLog.log('📤 ReportView: Share event received', { platform, url })
}

const handleShareBasicReport = () => {
  debugLog.log('📤 ReportView: Share basic report clicked')
  showShareModal.value = true
}

const copyLink = async () => {
  debugLog.log('📋 Copying link:', shareUrl.value)
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    showSuccess('链接已复制到剪贴板')
  } catch (error) {
    debugLog.log('📋 Clipboard API failed, using fallback')
    // 降级方案
    if (linkInput.value) {
      linkInput.value.select()
      document.execCommand('copy')
      showSuccess('链接已复制到剪贴板')
    }
  }
}

const shareToWeChat = () => {
  debugLog.log('💬 Sharing to WeChat')
  showSuccess('请复制链接手动分享到微信')
  copyLink()
}

const shareToWeibo = () => {
  debugLog.log('🐦 Sharing to Weibo')
  const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(shareText.value)}`
  window.open(url, '_blank')
}

const showSuccess = (message: string) => {
  debugLog.log('✅ Showing success message:', message)
  successMessage.value = message
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}
</script>
