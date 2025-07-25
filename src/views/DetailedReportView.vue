<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- 页面头部 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">详细报告</h1>
        <p class="text-gray-600">深度分析您的依恋风格和关系模式</p>

        <!-- 返回按钮 -->
        <div class="mt-4">
          <button
            @click="goBack"
            class="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <i class="fas fa-arrow-left"></i>
            <span>返回基础报告</span>
          </button>
        </div>
      </div>

      <!-- 访问验证 -->
      <div v-if="!hasAccess" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="text-center">
          <i class="fas fa-lock text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">访问受限</h3>
          <p class="text-red-600 mb-4">您需要购买详细报告才能查看此内容</p>
          <button
            @click="redirectToBasicReport"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            返回购买页面
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">正在加载详细报告...</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">加载失败</h3>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button
            @click="retryLoad"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>

      <!-- 详细报告内容 -->
      <div v-else-if="detailedReport" class="space-y-8">
        <!-- 报告概览 -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="text-center mb-8">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              :style="{ backgroundColor: detailedReport.attachmentDescription.bgColor }"
            >
              <span class="text-3xl">{{ detailedReport.attachmentDescription.icon }}</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              {{ detailedReport.attachmentDescription.name }}
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
              {{ detailedReport.attachmentDescription.description }}
            </p>
          </div>

          <!-- 得分总览 -->
          <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div class="text-center p-4 bg-red-50 rounded-lg">
              <div class="text-2xl font-bold text-red-600 mb-1">
                {{ detailedReport.scores.anxious.toFixed(1) }}
              </div>
              <div class="text-sm text-gray-600">焦虑依恋</div>
              <div class="text-xs text-gray-500 mt-1">
                第{{ detailedReport.percentiles.anxious }}百分位
              </div>
            </div>

            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 mb-1">
                {{ detailedReport.scores.avoidant.toFixed(1) }}
              </div>
              <div class="text-sm text-gray-600">回避依恋</div>
              <div class="text-xs text-gray-500 mt-1">
                第{{ detailedReport.percentiles.avoidant }}百分位
              </div>
            </div>

            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600 mb-1">
                {{ detailedReport.scores.secure.toFixed(1) }}
              </div>
              <div class="text-sm text-gray-600">安全依恋</div>
              <div class="text-xs text-gray-500 mt-1">
                第{{ detailedReport.percentiles.secure }}百分位
              </div>
            </div>
          </div>
        </div>

        <!-- 可视化图表 -->
        <div class="grid lg:grid-cols-2 gap-8">
          <!-- 雷达图 -->
          <RadarChart
            :data="{
              scores: detailedReport.scores,
              percentiles: detailedReport.percentiles
            }"
            title="依恋维度雷达图"
            description="您在各个依恋维度上的得分分布"
            :show-data-table="true"
            :show-actions="true"
          />
          
          <!-- 柱状图 -->
          <BarChart
            :data="{
              scores: detailedReport.scores,
              percentiles: detailedReport.percentiles,
              attachmentStyle: detailedReport.attachmentStyle
            }"
            title="依恋得分对比图"
            description="您的得分与人群平均水平的对比"
            :show-comparison="true"
            :show-suggestions="true"
            :show-actions="true"
          />
        </div>

        <!-- 得分对比分析 -->
        <ScoreComparison
          :data="{
            scores: detailedReport.scores,
            percentiles: detailedReport.percentiles,
            attachmentStyle: detailedReport.attachmentStyle
          }"
          title="综合对比分析"
          description="您的依恋得分与人群的全面对比"
          :show-trend="false"
          :show-actions="true"
          @export="handleExportComparison"
          @share="handleShareComparison"
          @view-detailed="handleViewDetailed"
        />

        <!-- 深度分析章节 -->
        <div class="detailed-analysis bg-white rounded-2xl shadow-lg p-8">
          <h3 class="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <i class="fas fa-microscope mr-3 text-blue-600"></i>
            深度心理分析
          </h3>

          <!-- 个性特征分析 -->
          <div class="mb-12">
            <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <i class="fas fa-user-circle mr-2 text-purple-600"></i>
              个性特征深度解读
            </h4>
            <div class="grid md:grid-cols-2 gap-6">
              <div
                v-for="(trait, index) in detailedReport.detailedContent.personalityTraits"
                :key="index"
                class="group p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <div class="flex items-start space-x-4">
                  <div
                    class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors"
                  >
                    <i class="fas fa-brain text-purple-600"></i>
                  </div>
                  <div>
                    <p class="text-gray-700 leading-relaxed">{{ trait }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 关系模式分析 -->
          <div class="mb-12">
            <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <i class="fas fa-heart mr-2 text-pink-600"></i>
              关系模式深度分析
            </h4>
            <div class="space-y-6">
              <div
                v-for="(pattern, index) in detailedReport.detailedContent.relationshipPatterns"
                :key="index"
                class="group p-6 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <div class="flex items-start space-x-4">
                  <div
                    class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-pink-200 transition-colors"
                  >
                    <i class="fas fa-users text-pink-600"></i>
                  </div>
                  <div>
                    <p class="text-gray-700 leading-relaxed">{{ pattern }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 优势与挑战对比 -->
          <div class="mb-12">
            <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <i class="fas fa-balance-scale mr-2 text-indigo-600"></i>
              优势与挑战全面分析
            </h4>
            <div class="grid lg:grid-cols-2 gap-8">
              <!-- 优势 -->
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <h5 class="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <i class="fas fa-star mr-2 text-green-600"></i>
                  您的核心优势
                </h5>
                <div class="space-y-4">
                  <div
                    v-for="(strength, index) in detailedReport.detailedContent
                      .strengthsAndChallenges.strengths"
                    :key="index"
                    class="flex items-start space-x-3 p-4 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all"
                  >
                    <div
                      class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <i class="fas fa-plus text-green-600 text-xs"></i>
                    </div>
                    <span class="text-gray-700 text-sm leading-relaxed">{{ strength }}</span>
                  </div>
                </div>
              </div>

              <!-- 挑战 -->
              <div class="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6">
                <h5 class="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                  <i class="fas fa-exclamation-triangle mr-2 text-orange-600"></i>
                  需要关注的挑战
                </h5>
                <div class="space-y-4">
                  <div
                    v-for="(challenge, index) in detailedReport.detailedContent
                      .strengthsAndChallenges.challenges"
                    :key="index"
                    class="flex items-start space-x-3 p-4 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all"
                  >
                    <div
                      class="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <i class="fas fa-minus text-orange-600 text-xs"></i>
                    </div>
                    <span class="text-gray-700 text-sm leading-relaxed">{{ challenge }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 成长建议 -->
          <div class="mb-12">
            <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <i class="fas fa-seedling mr-2 text-green-600"></i>
              个性化成长路径
            </h4>
            <div class="grid md:grid-cols-2 gap-6">
              <div
                v-for="(suggestion, index) in detailedReport.detailedContent.growthSuggestions"
                :key="index"
                class="group p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <div class="flex items-start space-x-4">
                  <div
                    class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors"
                  >
                    <i class="fas fa-arrow-up text-green-600"></i>
                  </div>
                  <div>
                    <p class="text-gray-700 leading-relaxed">{{ suggestion }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 兼容性分析 -->
          <div>
            <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <i class="fas fa-handshake mr-2 text-blue-600"></i>
              关系兼容性深度解析
            </h4>
            <div class="space-y-6">
              <div
                v-for="(analysis, index) in detailedReport.detailedContent.compatibilityAnalysis"
                :key="index"
                class="group p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <div class="flex items-start space-x-4">
                  <div
                    class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors"
                  >
                    <i class="fas fa-heart text-blue-600"></i>
                  </div>
                  <div>
                    <p class="text-gray-700 leading-relaxed">{{ analysis }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 报告操作 -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-6 text-center">报告操作</h3>
          <div class="flex flex-wrap gap-4 justify-center">
            <button
              @click="handleDownloadPDF"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <i class="fas fa-download"></i>
              <span>下载PDF报告</span>
            </button>

            <button
              @click="handleShare"
              class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <i class="fas fa-share-alt"></i>
              <span>分享报告</span>
            </button>

            <button
              @click="handlePrint"
              class="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <i class="fas fa-print"></i>
              <span>打印报告</span>
            </button>

            <button
              @click="handleSaveBookmark"
              class="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <i class="fas fa-bookmark"></i>
              <span>收藏报告</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment'
import { useUIStore } from '@/stores/ui'
import reportService from '@/services/reportService'
import type { DetailedReportData } from '@/types'

// 组件导入
import RadarChart from '@/components/charts/RadarChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import ScoreComparison from '@/components/charts/ScoreComparison.vue'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()
const uiStore = useUIStore()

// 响应式状态
const loading = ref(true)
const error = ref<string | null>(null)
const detailedReport = ref<DetailedReportData | null>(null)

// 计算属性
const assessmentId = computed(() => route.params.id as string)

const hasAccess = computed(() => {
  return paymentStore.isReportUnlocked(assessmentId.value)
})

// 生命周期
onMounted(async () => {
  if (!hasAccess.value) {
    return
  }
  await loadDetailedReport()
})

// 方法
const loadDetailedReport = async () => {
  try {
    loading.value = true
    error.value = null

    // 尝试加载详细报告
    let report = reportService.getReportByAssessmentId(assessmentId.value) as DetailedReportData

    if (!report || report.type !== 'detailed') {
      // 先获取基础报告
      const basicReport = reportService.getReportByAssessmentId(assessmentId.value)
      if (!basicReport) {
        error.value = '未找到基础报告，请先完成测评'
        return
      }

      // 生成详细报告
      report = reportService.generateDetailedReport(basicReport)
    }

    detailedReport.value = report
  } catch (err) {
    console.error('Failed to load detailed report:', err)
    error.value = err instanceof Error ? err.message : '详细报告加载失败'
  } finally {
    loading.value = false
  }
}

const handleExportComparison = () => {
  uiStore.showInfo('正在导出对比报告...')
  // 实际的PDF导出逻辑
}

const handleShareComparison = () => {
  if (navigator.share) {
    navigator.share({
      title: 'ECR依恋测评详细对比分析',
      text: '我的详细依恋测评对比分析，深度分析我的关系模式！',
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    uiStore.showSuccess('链接已复制到剪贴板')
  }
}

const handleViewDetailed = () => {
  // 滚动到详细分析部分
  const detailedSection = document.querySelector('.detailed-analysis')
  if (detailedSection) {
    detailedSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const goBack = () => {
  router.push(`/report/${assessmentId.value}`)
}

const redirectToBasicReport = () => {
  router.push(`/report/${assessmentId.value}`)
}

const retryLoad = () => {
  error.value = null
  loadDetailedReport()
}

const handleDownloadPDF = () => {
  uiStore.showInfo('PDF下载功能即将推出')
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: 'ECR依恋测评详细报告',
      text: '我的详细依恋测评报告，深度分析我的关系模式！',
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    uiStore.showSuccess('链接已复制到剪贴板')
  }
}

const handlePrint = () => {
  window.print()
}

const handleSaveBookmark = () => {
  // 保存到本地收藏
  const bookmarks = JSON.parse(localStorage.getItem('ecr_bookmarks') || '[]')
  const bookmark = {
    id: assessmentId.value,
    title: `${detailedReport.value?.attachmentDescription.name} - 详细报告`,
    url: window.location.href,
    createdAt: new Date().toISOString()
  }

  if (!bookmarks.find((b: { id: string }) => b.id === bookmark.id)) {
    bookmarks.push(bookmark)
    localStorage.setItem('ecr_bookmarks', JSON.stringify(bookmarks))
    uiStore.showSuccess('报告已收藏')
  } else {
    uiStore.showInfo('报告已在收藏夹中')
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
