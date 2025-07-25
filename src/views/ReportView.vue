<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">测评报告</h1>
        <p class="text-gray-600">您的依恋类型分析结果</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">正在加载报告...</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">加载失败</h3>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button @click="retryLoad" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">重试</button>
        </div>
      </div>

      <!-- 基础报告 -->
      <div v-else-if="basicReport" class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <AttachmentTypeCard 
          :attachment-type="basicReport.attachmentStyle"
          :description="basicReport.attachmentDescription"
          class="mb-8"
        />

        <div class="grid md:grid-cols-2 gap-8 mb-8">
          <ScoreDisplay
            :scores="basicReport.scores"
            :percentiles="basicReport.percentiles"
          />

          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">主要特征</h3>
            <ul class="space-y-2 text-gray-600">
              <li v-for="trait in basicReport.attachmentDescription.characteristics.slice(0, 3)" :key="trait" class="flex items-start">
                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                <span>{{ trait }}</span>
              </li>
            </ul>
          </div>
        </div>

        <BasicDescription
          :description="basicReport.attachmentDescription"
          :attachment-style="basicReport.attachmentStyle"
        />
      </div>

      <!-- 解锁详细报告 -->
      <UnlockButton 
        v-if="basicReport && !isReportUnlocked"
        :assessment-id="assessmentId"
        @unlock="handleUnlock"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import reportService from '@/services/reportService'
import type { BasicReportData } from '@/types'

// 组件导入
import AttachmentTypeCard from '@/components/report/AttachmentTypeCard.vue'
import ScoreDisplay from '@/components/report/ScoreDisplay.vue'
import BasicDescription from '@/components/report/BasicDescription.vue'
import UnlockButton from '@/components/report/UnlockButton.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 响应式状态
const loading = ref(true)
const error = ref<string | null>(null)
const basicReport = ref<BasicReportData | null>(null)

// 计算属性
const assessmentId = computed(() => route.params.id as string)

const isReportUnlocked = computed(() => {
  return appStore.checkPaymentStatus(assessmentId.value).isPaid
})

// 辅助函数
const getAttachmentDescription = (style: string) => {
  const descriptions = {
    secure: {
      name: '安全型依恋',
      shortDescription: '安全型依恋者通常对自己和他人都有积极的看法，能够建立稳定、信任的关系。',
      characteristics: [
        '容易与他人建立亲密关系',
        '在关系中感到安全和舒适',
        '能够有效沟通情感需求',
        '对伴侣和关系有合理期待',
        '具备良好的情绪调节能力'
      ],
      strengths: [
        '关系稳定性强',
        '沟通能力优秀',
        '情绪成熟度高',
        '冲突解决能力强'
      ],
      challenges: [
        '可能对他人依恋类型缺乏理解',
        '在面对不安全依恋伴侣时需要更多耐心'
      ],
      suggestions: [
        '继续保持健康的关系模式',
        '帮助伴侣建立更安全的依恋体验',
        '在关系中保持开放和支持的态度'
      ],
      icon: '🛡️',
      color: '#10b981',
      bgColor: '#dcfce7'
    },
    anxious: {
      name: '焦虑型依恋',
      shortDescription: '焦虑型依恋者往往担心被抛弃，需要频繁的确认和安慰。',
      characteristics: [
        '经常担心被伴侣抛弃',
        '需要频繁的关爱确认',
        '情绪波动较大',
        '对关系变化敏感',
        '倾向于过度分析伴侣行为'
      ],
      strengths: [
        '对关系高度投入',
        '情感表达丰富',
        '对伴侣需求敏感',
        '重视关系质量'
      ],
      challenges: [
        '容易产生不安全感',
        '可能给伴侣造成压力',
        '情绪调节困难',
        '害怕独处'
      ],
      suggestions: [
        '学习情绪调节技巧',
        '培养自我安抚能力',
        '建立独立的兴趣和社交圈',
        '与伴侣进行开放沟通'
      ],
      icon: '💗',
      color: '#f97316',
      bgColor: '#fed7aa'
    },
    avoidant: {
      name: '回避型依恋',
      shortDescription: '回避型依恋者倾向于独立，避免过度亲密，不太愿意依赖他人。',
      characteristics: [
        '重视独立和自主性',
        '不舒服过度亲密',
        '难以表达深层情感',
        '倾向于情感距离',
        '不喜欢依赖他人'
      ],
      strengths: [
        '独立性强',
        '自我调节能力好',
        '在压力下表现稳定',
        '目标导向明确'
      ],
      challenges: [
        '情感表达困难',
        '可能让伴侣感到距离感',
        '难以寻求帮助',
        '关系深度有限'
      ],
      suggestions: [
        '练习情感表达',
        '尝试适度依赖伴侣',
        '开放地讨论关系需求',
        '培养情感连接的习惯'
      ],
      icon: '🏔️',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    disorganized: {
      name: '混乱型依恋',
      shortDescription: '混乱型依恋者表现出矛盾的行为模式，既渴望又害怕亲密关系。',
      characteristics: [
        '对亲密关系有矛盾感受',
        '行为模式不一致',
        '情绪调节困难',
        '既需要又害怕依恋',
        '关系中缺乏安全感'
      ],
      strengths: [
        '情感丰富复杂',
        '具有深度思考能力',
        '对关系有强烈渴望',
        '经历多样化'
      ],
      challenges: [
        '关系模式不稳定',
        '情绪波动剧烈',
        '难以预测的行为',
        '内心冲突较多'
      ],
      suggestions: [
        '寻求专业心理帮助',
        '学习情绪管理技巧',
        '建立稳定的支持系统',
        '练习自我觉察和反思'
      ],
      icon: '🌀',
      color: '#8b5cf6',
      bgColor: '#e9d5ff'
    }
  }
  
  return descriptions[style as keyof typeof descriptions] || {
    name: '未知依恋类型',
    shortDescription: '未知依恋类型',
    characteristics: [],
    strengths: [],
    challenges: [],
    suggestions: [],
    icon: '❓',
    color: '#6b7280',
    bgColor: '#f3f4f6'
  }
}

// 生命周期
onMounted(async () => {
  await loadBasicReport()
})

// 方法
const loadBasicReport = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('📈 ReportView: Loading report for assessment ID:', assessmentId.value)
    
    // 从统一store获取评估数据
    const hasAssessment = appStore.hasAssessment(assessmentId.value)
    console.log('📈 ReportView: hasAssessment:', hasAssessment)
    
    if (!hasAssessment) {
      error.value = '未找到测评，请先完成测评'
      return
    }
    
    // 加载评估数据（如果需要）
    if (appStore.currentAssessment?.id !== assessmentId.value) {
      const success = await appStore.loadAssessment(assessmentId.value)
      console.log('📈 ReportView: loadAssessment success:', success)
      if (!success) {
        error.value = '无法加载测评数据'
        return
      }
    }
    
    // 检查是否有结果
    const assessment = appStore.currentAssessment
    console.log('📈 ReportView: Current assessment:', assessment)
    console.log('📈 ReportView: Has basicResult:', !!assessment?.basicResult)
    
    if (!assessment || !assessment.basicResult) {
      error.value = '测评尚未完成，请先完成所有题目'
      return
    }
    
    // 使用评估结果生成报告显示数据
    const basicResult = assessment.basicResult
    console.log('📈 ReportView: Basic result:', basicResult)
    
    // 创建报告显示数据
    basicReport.value = {
      type: 'basic',
      assessmentId: assessmentId.value,
      attachmentStyle: basicResult.style,
      scores: {
        anxious: basicResult.anxious,
        avoidant: basicResult.avoidant,
        secure: 7 - Math.max(basicResult.anxious, basicResult.avoidant)
      },
      percentiles: {
        anxious: Math.round((basicResult.anxious / 7) * 100),
        avoidant: Math.round((basicResult.avoidant / 7) * 100),
        secure: Math.round(((7 - Math.max(basicResult.anxious, basicResult.avoidant)) / 7) * 100)
      },
      attachmentDescription: getAttachmentDescription(basicResult.style),
      generatedAt: new Date()
    }
    
    console.log('📈 ReportView: Created basic report:', basicReport.value)
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

const handleUnlock = () => {
  // 支付成功后跳转到详细报告
  router.push(`/report/${assessmentId.value}/detailed`)
}
</script>
