<template>
  <div class="score-comparison-container">
    <!-- 标题 -->
    <div class="chart-header mb-6">
      <h4 class="text-xl font-semibold text-gray-800 flex items-center">
        <i class="fas fa-balance-scale mr-3 text-purple-600"></i>
        {{ title || '得分对比分析' }}
      </h4>
      <p v-if="description" class="text-sm text-gray-600 mt-2">{{ description }}</p>
    </div>

    <!-- 主要对比区域 -->
    <div class="main-comparison mb-8">
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- 得分对比图 -->
        <div class="score-chart bg-gray-50 rounded-xl p-6 min-h-[480px] flex flex-col">
          <h5 class="font-medium text-gray-800 mb-4 flex items-center">
            <i class="fas fa-chart-line mr-2 text-blue-600"></i>
            我的得分 vs 人群平均
          </h5>
          
          <div class="space-y-6 flex-1">
            <div
              v-for="(item, index) in comparisonItems"
              :key="index"
              class="comparison-bar-item"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="font-medium text-gray-700">{{ item.label }}</span>
                <div class="text-right">
                  <div class="text-lg font-bold" :style="{ color: item.color }">
                    {{ item.myScore.toFixed(1) }}
                  </div>
                  <div class="text-xs text-gray-500">vs {{ item.avgScore.toFixed(1) }} (平均)</div>
                </div>
              </div>
              
              <!-- 对比条形图 -->
              <div class="relative">
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="h-3 rounded-full transition-all duration-1500 ease-out flex"
                    style="width: 100%"
                  >
                    <!-- 我的得分 -->
                    <div
                      class="h-3 rounded-l-full transition-all duration-1500 relative"
                      :style="{
                        width: `${(item.myScore / 7) * 50}%`,
                        backgroundColor: item.color
                      }"
                    >
                      <!-- 指示点 -->
                      <div
                        class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-md"
                        :style="{ backgroundColor: item.color }"
                      ></div>
                    </div>
                    <!-- 人群平均 -->
                    <div
                      class="h-3 rounded-r-full transition-all duration-1500"
                      :style="{
                        width: `${(item.avgScore / 7) * 50}%`,
                        backgroundColor: '#9CA3AF'
                      }"
                    ></div>
                  </div>
                </div>
                
                <!-- 标尺 -->
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>3.5</span>
                  <span>7</span>
                </div>
              </div>
              
              <!-- 解释 -->
              <div class="mt-2 p-2 bg-white rounded-lg">
                <p class="text-xs text-gray-600">{{ item.interpretation }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 百分位分布 -->
        <div class="percentile-chart bg-gray-50 rounded-xl p-6 min-h-[480px] flex flex-col">
          <h5 class="font-medium text-gray-800 mb-4 flex items-center">
            <i class="fas fa-users mr-2 text-green-600"></i>
            在人群中的位置
          </h5>
          
          <div class="space-y-6 flex-1">
            <div
              v-for="(item, index) in percentileItems"
              :key="index"
              class="percentile-item"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="font-medium text-gray-700">{{ item.label }}</span>
                <div class="text-right">
                  <div class="text-lg font-bold" :style="{ color: item.color }">
                    第{{ item.percentile }}百分位
                  </div>
                  <div class="text-xs text-gray-500">超过{{ item.percentile }}%的人群</div>
                </div>
              </div>
              
              <!-- 百分位可视化 -->
              <div class="relative">
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="h-3 rounded-full transition-all duration-1500 ease-out relative"
                    :style="{
                      width: `${item.percentile}%`,
                      backgroundColor: item.color
                    }"
                  >
                    <!-- 指示点 -->
                    <div
                      class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-md"
                      :style="{ backgroundColor: item.color }"
                    ></div>
                  </div>
                </div>
                
                <!-- 分位数标记 -->
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <!-- 分位数解释 -->
              <div class="mt-2 p-2 bg-white rounded-lg">
                <p class="text-xs text-gray-600">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 综合分析 -->
    <div class="comprehensive-analysis">
      <h5 class="font-medium text-gray-800 mb-4 flex items-center">
        <i class="fas fa-microscope mr-2 text-indigo-600"></i>
        综合分析
      </h5>
      
      <div class="grid md:grid-cols-2 gap-6">
        <!-- 优势分析 -->
        <div class="analysis-card bg-green-50 border border-green-200 rounded-xl p-6">
          <h6 class="font-semibold text-green-800 mb-3 flex items-center">
            <i class="fas fa-thumbs-up mr-2"></i>
            相对优势
          </h6>
          <div class="space-y-3">
            <div
              v-for="(strength, index) in strengthAnalysis"
              :key="index"
              class="flex items-start space-x-3"
            >
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <i class="fas fa-check text-green-600 text-xs"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-green-800">{{ strength.title }}</p>
                <p class="text-xs text-green-700 mt-1">{{ strength.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 发展空间 -->
        <div class="analysis-card bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h6 class="font-semibold text-orange-800 mb-3 flex items-center">
            <i class="fas fa-arrow-up mr-2"></i>
            发展空间
          </h6>
          <div class="space-y-3">
            <div
              v-for="(area, index) in developmentAreas"
              :key="index"
              class="flex items-start space-x-3"
            >
              <div class="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <i class="fas fa-exclamation text-orange-600 text-xs"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-orange-800">{{ area.title }}</p>
                <p class="text-xs text-orange-700 mt-1">{{ area.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史趋势（如果有多次测评数据） -->
    <div v-if="showTrend && trendData.length > 1" class="trend-analysis mt-8">
      <h5 class="font-medium text-gray-800 mb-4 flex items-center">
        <i class="fas fa-chart-line mr-2 text-blue-600"></i>
        变化趋势
      </h5>
      
      <div class="bg-gray-50 rounded-xl p-6">
        <p class="text-sm text-gray-600 mb-4">
          基于您的{{ trendData.length }}次测评记录，观察到以下变化趋势：
        </p>
        
        <div class="grid gap-4">
          <div
            v-for="(trend, index) in trendAnalysis"
            :key="index"
            class="trend-item flex items-center space-x-4 p-3 bg-white rounded-lg"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="trend.changeClass"
            >
              <i :class="trend.icon" class="text-white"></i>
            </div>
            <div class="flex-1">
              <h6 class="font-medium text-gray-800">{{ trend.dimension }}</h6>
              <p class="text-sm text-gray-600">{{ trend.description }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-xs text-gray-500">变化幅度:</span>
                <span
                  class="text-xs font-semibold"
                  :class="trend.changeTextClass"
                >
                  {{ trend.change > 0 ? '+' : '' }}{{ trend.change.toFixed(1) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮
    <div v-if="showActions" class="actions mt-8 flex flex-wrap gap-3">
      <button
        @click="exportComparison"
        class="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
      >
        <i class="fas fa-download mr-2"></i>
        导出对比报告
      </button>
      <button
        @click="shareComparison"
        class="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <i class="fas fa-share-alt mr-2"></i>
        分享对比结果
      </button>
      <button
        @click="viewDetailedAnalysis"
        class="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
      >
        <i class="fas fa-microscope mr-2"></i>
        查看详细分析
      </button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AttachmentScores, AttachmentPercentiles, AttachmentStyle } from '@/types'

interface TrendDataPoint {
  date: string
  scores: AttachmentScores
}

interface Props {
  data: {
    scores: AttachmentScores
    percentiles?: AttachmentPercentiles
    attachmentStyle?: AttachmentStyle
  }
  title?: string
  description?: string
  showTrend?: boolean
  trendData?: TrendDataPoint[]
  showActions?: boolean
}

interface Emits {
  (e: 'export'): void
  (e: 'share'): void
  (e: 'view-detailed'): void
}

const props = withDefaults(defineProps<Props>(), {
  showTrend: false,
  trendData: () => [],
  showActions: true
})

defineEmits<Emits>()

// 计算属性
const comparisonItems = computed(() => {
  const scores = props.data.scores
  
  return [
    {
      label: '焦虑依恋',
      myScore: scores.anxious,
      avgScore: 3.2, // 人群平均值
      color: '#EF4444',
      interpretation: getComparisonInterpretation(scores.anxious, 3.2, 'anxious')
    },
    {
      label: '回避依恋',
      myScore: scores.avoidant,
      avgScore: 3.0,
      color: '#3B82F6',
      interpretation: getComparisonInterpretation(scores.avoidant, 3.0, 'avoidant')
    },
    {
      label: '安全依恋',
      myScore: scores.secure,
      avgScore: 4.1,
      color: '#22C55E',
      interpretation: getComparisonInterpretation(scores.secure, 4.1, 'secure')
    }
  ]
})

const percentileItems = computed(() => {
  const percentiles = props.data.percentiles
  if (!percentiles) return []
  
  return [
    {
      label: '焦虑依恋',
      percentile: percentiles.anxious,
      color: '#EF4444',
      description: getPercentileDescription(percentiles.anxious, 'anxious')
    },
    {
      label: '回避依恋',
      percentile: percentiles.avoidant,
      color: '#3B82F6',
      description: getPercentileDescription(percentiles.avoidant, 'avoidant')
    },
    {
      label: '安全依恋',
      percentile: percentiles.secure || 50,
      color: '#22C55E',
      description: getPercentileDescription(percentiles.secure || 50, 'secure')
    }
  ]
})

const strengthAnalysis = computed(() => {
  const scores = props.data.scores
  const strengths = []
  
  if (scores.secure > 4.5) {
    strengths.push({
      title: '安全依恋能力强',
      description: '您具有良好的情感调节能力和关系维护技巧'
    })
  }
  
  if (scores.anxious < 3.0) {
    strengths.push({
      title: '情绪稳定性好',
      description: '在关系中不容易产生过度的焦虑和担忧'
    })
  }
  
  if (scores.avoidant < 3.0) {
    strengths.push({
      title: '亲密接纳度高',
      description: '能够舒适地与他人建立亲密的情感连接'
    })
  }
  
  // 如果没有明显优势，给出一般性的积极反馈
  if (strengths.length === 0) {
    strengths.push({
      title: '具有发展潜力',
      description: '您的依恋模式显示出良好的适应性和改善空间'
    })
  }
  
  return strengths
})

const developmentAreas = computed(() => {
  const scores = props.data.scores
  const areas = []
  
  if (scores.anxious > 4.0) {
    areas.push({
      title: '情绪调节',
      description: '可以通过正念练习和认知重构来管理关系焦虑'
    })
  }
  
  if (scores.avoidant > 4.0) {
    areas.push({
      title: '情感表达',
      description: '练习更开放地表达情感和需求，增进关系亲密度'
    })
  }
  
  if (scores.secure < 3.5) {
    areas.push({
      title: '安全感建立',
      description: '通过自我关怀和建立支持性关系来增强内在安全感'
    })
  }
  
  return areas
})

const trendAnalysis = computed(() => {
  if (!props.showTrend || props.trendData.length < 2) return []
  
  const first = props.trendData[0]
  const latest = props.trendData[props.trendData.length - 1]
  
  return [
    {
      dimension: '焦虑依恋',
      change: latest.scores.anxious - first.scores.anxious,
      description: getTrendDescription(latest.scores.anxious - first.scores.anxious, 'anxious'),
      icon: latest.scores.anxious - first.scores.anxious > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
      changeClass: latest.scores.anxious - first.scores.anxious > 0 ? 'bg-red-500' : 'bg-green-500',
      changeTextClass: latest.scores.anxious - first.scores.anxious > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      dimension: '回避依恋',
      change: latest.scores.avoidant - first.scores.avoidant,
      description: getTrendDescription(latest.scores.avoidant - first.scores.avoidant, 'avoidant'),
      icon: latest.scores.avoidant - first.scores.avoidant > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
      changeClass: latest.scores.avoidant - first.scores.avoidant > 0 ? 'bg-red-500' : 'bg-green-500',
      changeTextClass: latest.scores.avoidant - first.scores.avoidant > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      dimension: '安全依恋',
      change: latest.scores.secure - first.scores.secure,
      description: getTrendDescription(latest.scores.secure - first.scores.secure, 'secure'),
      icon: latest.scores.secure - first.scores.secure > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
      changeClass: latest.scores.secure - first.scores.secure > 0 ? 'bg-green-500' : 'bg-red-500',
      changeTextClass: latest.scores.secure - first.scores.secure > 0 ? 'text-green-600' : 'text-red-600'
    }
  ]
})

// 方法
const getComparisonInterpretation = (myScore: number, avgScore: number, _dimension: string): string => {
  const diff = myScore - avgScore
  const absDiff = Math.abs(diff)
  
  if (absDiff < 0.5) {
    return '您的得分接近人群平均水平'
  } else if (diff > 0) {
    return `您的得分比人群平均高${absDiff.toFixed(1)}分`
  } else {
    return `您的得分比人群平均低${absDiff.toFixed(1)}分`
  }
}

const getPercentileDescription = (percentile: number, dimension: string): string => {
  if (percentile < 25) {
    return `您在${dimension}维度上的得分较低，属于较为少见的情况`
  } else if (percentile < 50) {
    return `您在${dimension}维度上的得分低于平均水平，但仍在正常范围内`
  } else if (percentile < 75) {
    return `您在${dimension}维度上的得分高于平均水平，属于较为常见的情况`
  } else {
    return `您在${dimension}维度上的得分明显高于大多数人`
  }
}

const getTrendDescription = (change: number, dimension: string): string => {
  const absChange = Math.abs(change)
  
  if (absChange < 0.3) {
    return '变化较小，保持相对稳定'
  } else if (change > 0) {
    if (dimension === 'secure') {
      return '呈上升趋势，这是积极的变化'
    } else {
      return '呈上升趋势，需要关注'
    }
  } else {
    if (dimension === 'secure') {
      return '呈下降趋势，需要关注'
    } else {
      return '呈下降趋势，这是积极的变化'
    }
  }
}
</script>

<style scoped>
.score-comparison-container {
  @apply bg-white rounded-2xl shadow-lg p-8;
}

.comparison-bar-item {
  @apply transition-all duration-300 hover:bg-white hover:shadow-sm rounded-lg p-3 -m-3;
}

.percentile-item {
  @apply transition-all duration-300 hover:bg-white hover:shadow-sm rounded-lg p-3 -m-3;
}

.analysis-card {
  @apply transition-all duration-300 hover:shadow-md;
}

.trend-item {
  @apply transition-all duration-300 hover:shadow-md;
}

.actions button {
  @apply transition-all duration-200 transform;
}

.actions button:hover {
  @apply scale-105 shadow-lg;
}

.actions button:active {
  @apply scale-95;
}

/* 动画效果 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.main-comparison > .grid > div:first-child {
  animation: slideInLeft 0.6s ease-out;
}

.main-comparison > .grid > div:last-child {
  animation: slideInRight 0.6s ease-out;
}

.comprehensive-analysis {
  animation: slideInLeft 0.8s ease-out;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-comparison .grid {
    @apply grid-cols-1 gap-6;
  }
}

@media (max-width: 768px) {
  .score-comparison-container {
    @apply p-6;
  }
  
  .comprehensive-analysis .grid {
    @apply grid-cols-1;
  }
  
  .actions {
    @apply flex-col space-y-3;
  }
  
  .actions button {
    @apply w-full;
  }
}

@media (max-width: 640px) {
  .score-comparison-container {
    @apply p-4;
  }
  
  .chart-header h4 {
    @apply text-lg;
  }
}
</style>