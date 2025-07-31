<template>
  <div class="report-container max-w-6xl mx-auto p-6 space-y-8">
    <!-- 报告头部 -->
    <div class="report-header text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">您的ECR依恋风格报告</h1>
      <p class="text-gray-600">基于科学的ECR-R量表分析您的亲密关系依恋类型</p>
    </div>

    <!-- 依恋类型卡片 -->
    <AttachmentTypeCard 
      :attachment-type="result.style"
      :description="attachmentDescription"
      :confidence="confidence"
      :show-confidence="true"
    />

    <!-- 得分展示 -->
    <ScoreDisplay 
      :scores="result"
      :show-comparison="true"
      :show-explanation="true"
    />

    <!-- 基础描述 -->
    <BasicDescription 
      :attachment-type="result.style"
      :description="attachmentDescription.fullDescription"
    />

    <!-- 详细报告区域 -->
    <div v-if="showDetailedReport" class="detailed-report space-y-6">
      <!-- 洞察卡片 -->
      <InsightCard 
        v-for="(insight, index) in detailedReport?.insights || []"
        :key="index"
        :insight="insight"
        :index="index"
      />

      <!-- 建议卡片 -->
      <RecommendationCard 
        v-for="(recommendation, index) in detailedReport?.recommendations || []"
        :key="index"
        :recommendation="recommendation"
        :index="index"
      />
    </div>

    <!-- 未解锁状态 -->
    <div v-else class="locked-content">
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">解锁详细分析报告</h3>
          <p class="text-gray-600 mb-6">获取个性化的深度分析、成长建议和关系改善方案</p>
        </div>
        
        <UnlockButton 
          :assessment-id="assessmentId"
          :is-processing="isPaymentProcessing"
          @payment-success="handlePaymentSuccess"
          @payment-error="handlePaymentError"
        />
      </div>
    </div>

    <!-- 报告操作区域 -->
    <div v-if="showDetailedReport" class="report-actions flex flex-col sm:flex-row gap-4 pt-8">
      <ReportExporter 
        :report-data="exportData"
        :assessment-id="assessmentId"
        class="flex-1"
      />
      
      <ReportSharer 
        :assessment-id="assessmentId"
        :attachment-type="result.style"
        class="flex-1"
      />
    </div>

    <!-- 报告说明 -->
    <div class="report-disclaimer bg-gray-50 rounded-xl p-6 text-sm text-gray-600">
      <h4 class="font-semibold mb-2">报告说明</h4>
      <ul class="space-y-1">
        <li>• 本报告基于ECR-R量表科学分析，仅供参考</li>
        <li>• 依恋风格会随着生活经历和关系发展而变化</li>
        <li>• 建议结合专业心理咨询师的建议进行解读</li>
        <li>• 报告数据将在30天后自动删除以保护隐私</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useECR } from '@/store'
import type { BasicResult, DetailedReport } from '@/types'

// 导入子组件
import AttachmentTypeCard from './report/AttachmentTypeCard.vue'
import BasicDescription from './report/BasicDescription.vue'
import InsightCard from './report/InsightCard.vue'
import RecommendationCard from './report/RecommendationCard.vue'
import ReportExporter from './report/ReportExporter.vue'
import ReportSharer from './report/ReportSharer.vue'
import ScoreDisplay from './report/ScoreDisplay.vue'
import UnlockButton from './report/UnlockButton.vue'

interface Props {
  assessmentId: string
  result: BasicResult
  detailedReport?: DetailedReport
}

const props = defineProps<Props>()
const store = useECR()

// 响应式状态
const isPaymentProcessing = ref(false)

// 计算属性
const showDetailedReport = computed(() => {
  const paymentStatus = store.checkPaymentStatus(props.assessmentId)
  return paymentStatus.isPaid || !!props.detailedReport
})

const confidence = computed(() => {
  // 根据得分计算置信度
  const { anxious, avoidant } = props.result
  const maxDistance = Math.max(Math.abs(anxious - 4), Math.abs(avoidant - 4))
  return Math.min(95, Math.max(60, Math.round(maxDistance * 20 + 60)))
})

const attachmentDescription = computed(() => {
  const descriptions = {
    secure: {
      name: '安全型依恋',
      icon: '🌟',
      bgColor: '#10B981',
      shortDescription: '在关系中感到安全和自在',
      fullDescription: '您倾向于在亲密关系中感到舒适和安全。您相信伴侣，也愿意依赖他们，同时保持自己的独立性。'
    },
    anxious: {
      name: '焦虑型依恋',
      icon: '💫',
      bgColor: '#F59E0B',
      shortDescription: '渴望亲密但担心被拒绝',
      fullDescription: '您在关系中可能会感到不安，担心伴侣不够爱您或会离开您。您渴望亲密，但有时这种渴望可能会让伴侣感到压力。'
    },
    avoidant: {
      name: '回避型依恋',
      icon: '🔒',
      bgColor: '#3B82F6',
      shortDescription: '重视独立，难以完全信任他人',
      fullDescription: '您可能倾向于保持情感上的距离，认为过度依赖他人是有风险的。您重视自立，但有时可能会错过深层的情感连接。'
    },
    disorganized: {
      name: '混乱型依恋',
      icon: '🌀',
      bgColor: '#8B5CF6',
      shortDescription: '在亲密和距离之间摇摆',
      fullDescription: '您可能在渴望亲密和害怕受伤之间摇摆。这种矛盾的感受可能源于早期的复杂经历，需要更多的自我理解和成长。'
    }
  }
  return descriptions[props.result.style] || descriptions.secure
})

const exportData = computed(() => ({
  assessmentId: props.assessmentId,
  result: props.result,
  detailedReport: props.detailedReport,
  attachmentDescription: attachmentDescription.value,
  generatedAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
}))

// 方法
const handlePaymentSuccess = (_paymentResult: unknown) => {
  isPaymentProcessing.value = false
  store.showSuccess('支付成功！正在加载详细报告...')
  
  // 这里应该触发详细报告的加载
  // 实际项目中可能需要重新获取数据或更新状态
}

const handlePaymentError = (error: string) => {
  isPaymentProcessing.value = false
  store.showError(error || '支付失败，请重试')
}

// 生命周期
onMounted(() => {
  // 检查支付状态，如果已支付但没有详细报告，尝试加载
  if (showDetailedReport.value && !props.detailedReport) {
    // 这里可以添加加载详细报告的逻辑
    console.log('需要加载详细报告')
  }
})
</script>

<style scoped>
/* 容器动画 */
.report-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 锁定内容样式 */
.locked-content {
  position: relative;
  opacity: 0.95;
}

.locked-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 1rem;
  z-index: -1;
}

/* 详细报告区域动画 */
.detailed-report {
  animation: slideInUp 0.8s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 报告操作区域 */
.report-actions {
  border-top: 1px solid #e5e7eb;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .report-container {
    padding: 1rem;
  }
  
  .report-header h1 {
    font-size: 1.875rem;
  }
  
  .report-actions {
    flex-direction: column;
  }
}

/* 暗色主题 */
[data-theme='dark'] .report-container {
  color: #f3f4f6;
}

[data-theme='dark'] .report-header h1 {
  color: #f9fafb;
}

[data-theme='dark'] .report-disclaimer {
  background-color: #374151;
  color: #d1d5db;
}

[data-theme='dark'] .locked-content::before {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
}
</style>