<template>
  <BaseReportView
    mode="detailed"
    :assessment-id="assessmentId"
    :loading="loading"
    :error="error"
    :report-data="basicReportData"
    :has-access="hasAccess"
    @retry="retryLoad"
  >
    <!-- 基础报告内容（在详细报告中也显示） -->
    <template #basic-content>
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center mb-8">
          <div
            class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            :style="{ backgroundColor: attachmentDescription?.bgColor }"
          >
            <span class="text-3xl">{{ attachmentDescription?.icon }}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            {{ attachmentDescription?.name }}
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            {{ attachmentDescription?.shortDescription }}
          </p>
        </div>

        <!-- 得分总览 -->
        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div class="text-center p-4 bg-red-50 rounded-lg">
            <div class="text-2xl font-bold text-red-600 mb-1">
              {{ scores?.anxious.toFixed(1) }}
            </div>
            <div class="text-sm text-gray-600">焦虑依恋</div>
            <div class="text-xs text-gray-500 mt-1">
              第{{ percentiles?.anxious }}百分位
            </div>
          </div>

          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600 mb-1">
              {{ scores?.avoidant.toFixed(1) }}
            </div>
            <div class="text-sm text-gray-600">回避依恋</div>
            <div class="text-xs text-gray-500 mt-1">
              第{{ percentiles?.avoidant }}百分位
            </div>
          </div>

          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600 mb-1">
              {{ scores?.secure.toFixed(1) }}
            </div>
            <div class="text-sm text-gray-600">安全依恋</div>
            <div class="text-xs text-gray-500 mt-1">
              第{{ percentiles?.secure }}百分位
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 详细报告内容 -->
    <template #detailed-content="{ reportData }">
      <!-- 可视化图表 -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center mb-8">
          <h3 class="text-xl font-bold text-gray-800 mb-2">数据可视化</h3>
          <p class="text-gray-600">您的依恋维度图表分析</p>
        </div>

        <!-- 核心图表 - 得分展示和四象限图 -->
        <div class="grid lg:grid-cols-2 gap-8 mb-8">
          <ScoreDisplay
            :scores="scores"
            :percentiles="percentiles"
          />

          <div>
            <!-- ECharts四象限图 -->
            <EChartsQuadrantChart
              v-if="scores && basicResult"
              :scores="{ anxious: scores.anxious, avoidant: scores.avoidant }"
              :current-type="basicResult.attachmentStyle"
              :animated="true"
              :show-movement-suggestion="false"
            />
          </div>
        </div>

        <!-- 
        高级图表功能暂时注释
        <div class="grid lg:grid-cols-2 gap-8">
          雷达图
          <RadarChart
            :data="{
              scores: scores,
              percentiles: percentiles
            }"
            title="依恋维度雷达图"
            description="您在各个依恋维度上的得分分布"
            :show-data-table="true"
            :show-actions="true"
          />
          
          柱状图
          <BarChart
            :data="{
              scores: scores,
              percentiles: percentiles,
              attachmentStyle: reportData.basicResult.attachmentStyle
            }"
            title="依恋得分对比图"
            description="您的得分与人群平均水平的对比"
            :show-comparison="true"
            :show-suggestions="true"
            :show-actions="true"
          />
        </div>
        -->

        <!-- 得分对比分析 -->
        <ScoreComparison
          :data="{
            scores: scores,
            percentiles: percentiles,
            attachmentStyle: reportData.basicResult.attachmentStyle
          }"
          title="综合对比分析"
          description="您的依恋得分与人群的全面对比"
          :show-trend="false"
          :show-actions="true"
          @export="handleExportComparison"
          @share="handleShareComparison"
          @view-detailed="handleViewDetailed"
        />
      </div>

      <!-- 深度分析章节 -->
      <div class="space-y-8">
        <!-- 特征分析 -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-6">详细特征分析</h3>
          
          <div class="grid md:grid-cols-2 gap-8">
            <!-- 优势 -->
            <div>
              <h4 class="text-lg font-semibold text-green-600 mb-4 flex items-center">
                <i class="fas fa-star mr-2"></i>
                您的优势
              </h4>
              <ul class="space-y-3">
                <li 
                  v-for="strength in attachmentDescription?.strengths" 
                  :key="strength"
                  class="flex items-start text-gray-700"
                >
                  <i class="fas fa-plus-circle text-green-500 mt-1 mr-3 flex-shrink-0"></i>
                  <span>{{ strength }}</span>
                </li>
              </ul>
            </div>

            <!-- 发展机会 -->
            <div>
              <h4 class="text-lg font-semibold text-orange-600 mb-4 flex items-center">
                <i class="fas fa-seedling mr-2"></i>
                发展机会
              </h4>
              <ul class="space-y-3">
                <li 
                  v-for="challenge in attachmentDescription?.challenges" 
                  :key="challenge"
                  class="flex items-start text-gray-700"
                >
                  <i class="fas fa-arrow-up text-orange-500 mt-1 mr-3 flex-shrink-0"></i>
                  <span>{{ challenge }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 建议指导 -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-6">成长建议</h3>
          
          <div class="space-y-4">
            <div 
              v-for="(suggestion, index) in attachmentDescription?.suggestions" 
              :key="index"
              class="flex items-start p-4 bg-blue-50 rounded-lg"
            >
              <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 flex-shrink-0 text-sm font-semibold">
                {{ index + 1 }}
              </div>
              <p class="text-gray-700">{{ suggestion }}</p>
            </div>
          </div>
        </div>

        <!-- 关系模式分析 -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-6">关系模式分析</h3>
          
          <div class="space-y-6">
            <div 
              v-for="pattern in attachmentDescription?.fullDescription?.relationshipPatterns" 
              :key="pattern"
              class="border-l-4 border-blue-500 pl-4 py-2"
            >
              <p class="text-gray-700">{{ pattern }}</p>
            </div>
          </div>
        </div>

        <!-- 兼容性分析 -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-6">关系兼容性分析</h3>
          
          <div class="space-y-4">
            <div 
              v-for="note in attachmentDescription?.fullDescription?.compatibilityNotes" 
              :key="note"
              class="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500"
            >
              <p class="text-gray-700">{{ note }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 报告导出和分享 -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center">
          <h3 class="text-xl font-bold text-gray-800 mb-4">导出和分享</h3>
          <div class="flex flex-wrap justify-center gap-4">
            <button
              @click="handleExportPDF"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-file-pdf mr-2"></i>
              导出PDF
            </button>
            <button
              @click="handleShare"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <i class="fas fa-share mr-2"></i>
              分享报告
            </button>
          </div>
        </div>
      </div>
    </template>
  </BaseReportView>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import { useReportData } from '@/composables/useReportData'
import { ExportService } from '@/services/exportService'

// 组件导入
import BaseReportView from '@/components/BaseReportView.vue'
import ScoreComparison from '@/components/charts/ScoreComparison.vue'
import ScoreDisplay from '@/components/report/ScoreDisplay.vue'
import EChartsQuadrantChart from '@/components/charts/EChartsQuadrantChart.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 响应式状态
const loading = ref(true)
const error = ref<string | null>(null)

// 计算属性
const assessmentId = computed(() => route.params.id as string)

const hasAccess = computed(() => {
  return appStore.checkPaymentStatus(assessmentId.value).isPaid
})

const currentAssessment = computed(() => appStore.currentAssessment)
const basicResult = computed(() => {
  // 从日志中我们知道数据实际保存在basicResult中，强制类型转换
  const assessment = currentAssessment.value as any
  const result = assessment?.basicResult
  if (!result) return null
  
  // 转换为BasicResult类型，只保留需要的属性
  return {
    anxious: result.anxious,
    avoidant: result.avoidant,
    attachmentStyle: result.style
  }
})

// 使用报告数据组合式API
const { attachmentDescription, scores, percentiles, basicReportData } = useReportData(
  assessmentId,
  basicResult
)

// 生命周期
onMounted(async () => {
  console.log('🔒 DetailedReportView: Checking access for assessment:', assessmentId.value)
  console.log('🔒 DetailedReportView: hasAccess:', hasAccess.value)
  
  if (!hasAccess.value) {
    console.log('🔒 DetailedReportView: No access, redirecting to basic report')
    // 没有访问权限，重定向到基础报告页面
    router.replace({ name: 'report', params: { id: assessmentId.value } })
    return
  }
  
  console.log('🔒 DetailedReportView: Access granted, loading detailed report')
  await loadDetailedReport()
})

// 方法
const loadDetailedReport = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('📈 DetailedReportView: Loading report for assessment ID:', assessmentId.value)
    
    // 从统一store获取评估数据
    const hasAssessment = appStore.hasAssessment(assessmentId.value)
    if (!hasAssessment) {
      error.value = '未找到测评，请先完成测评'
      return
    }
    
    // 加载评估数据（如果需要）
    if (appStore.currentAssessment?.id !== assessmentId.value) {
      const success = await appStore.loadAssessment(assessmentId.value)
      if (!success) {
        error.value = '无法加载测评数据'
        return
      }
    }
    
    // 检查是否有结果
    const assessment = appStore.currentAssessment
    if (!assessment || !(assessment as any)?.basicResult) {
      error.value = '测评尚未完成，请先完成所有题目'
      return
    }

    console.log('📈 DetailedReportView: Detailed report loaded successfully')
  } catch (err) {
    console.error('Failed to load detailed report:', err)
    error.value = err instanceof Error ? err.message : '详细报告加载失败'
  } finally {
    loading.value = false
  }
}

const retryLoad = () => {
  error.value = null
  loadDetailedReport()
}

const handleExportComparison = () => {
  console.log('导出对比报告...')
  // 实际的导出逻辑
}

const handleShareComparison = () => {
  console.log('分享对比报告...')
  // 实际的分享逻辑
}

const handleViewDetailed = () => {
  console.log('查看详细信息...')
  // 实际的查看逻辑
}

const handleExportPDF = async () => {
  try {
    console.log('开始导出PDF...')
    
    // 获取整个报告容器元素
    const reportElement = document.querySelector('.detailed-report-container') as HTMLElement
    if (!reportElement) {
      console.error('未找到报告容器元素')
      return
    }

    // 生成文件名
    const assessment = currentAssessment.value as any
    const style = assessment?.basicResult?.style || 'Unknown'
    const filename = `ECR心理测评详细报告_${style}型依恋风格`

    await ExportService.exportToPDF(reportElement, {
      filename,
      quality: 0.95,
      format: 'a4',
      margin: 15
    })

    console.log('PDF导出完成')
  } catch (error) {
    console.error('PDF导出失败:', error)
  }
}

const handleShare = async () => {
  try {
    console.log('开始分享报告...')
    
    const assessment = currentAssessment.value as any
    const style = assessment?.basicResult?.style || 'Unknown'
    
    await ExportService.shareReport({
      title: 'ECR心理测评详细报告',
      text: `我刚完成了ECR依恋风格测评，测评结果显示我是${style}型依恋风格。这个专业的心理测评帮助我更好地了解了自己在亲密关系中的模式。`,
      url: window.location.href
    })

    console.log('报告分享完成')
  } catch (error) {
    console.error('报告分享失败:', error)
  }
}
</script>

<style scoped>
/* 打印样式 */
@media print {
  .no-print {
    display: none !important;
  }

  .print-break {
    page-break-before: always;
  }

  .bg-gradient-to-br,
  .bg-gradient-to-r {
    background: white !important;
    border: 1px solid #e5e7eb !important;
  }
}

/* 动画效果 */
.group:hover .group-hover\:bg-purple-200 {
  transition: background-color 0.3s ease;
}

.group:hover .group-hover\:bg-pink-200 {
  transition: background-color 0.3s ease;
}

.group:hover .group-hover\:bg-green-200 {
  transition: background-color 0.3s ease;
}

.group:hover .group-hover\:bg-blue-200 {
  transition: background-color 0.3s ease;
}

/* 渐变背景动画 */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 6s ease infinite;
}
</style>
