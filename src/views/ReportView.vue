<template>
  <BaseReportView
    mode="basic"
    :assessment-id="assessmentId"
    :loading="loading"
    :error="error"
    :report-data="basicReportData"
    :has-access="isReportUnlocked"
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
      />
    </template>
  </BaseReportView>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store'
import { useReportData } from '@/composables/useReportData'
import { debugLog } from '@/utils/debugLog'

// 组件导入
import BaseReportView from '@/components/BaseReportView.vue'
import AttachmentTypeCard from '@/components/report/AttachmentTypeCard.vue'
import UnlockButton from '@/components/report/UnlockButton.vue'

const route = useRoute()
// const _router = useRouter()
const appStore = useAppStore()

// 响应式状态
const loading = ref(true)
const error = ref<string | null>(null)
const isPaymentLoading = ref(false)

// 计算属性
const assessmentId = computed(() => route.params.id as string)

const isReportUnlocked = computed(() => {
  return appStore.checkPaymentStatus(assessmentId.value).isPaid
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
</script>
