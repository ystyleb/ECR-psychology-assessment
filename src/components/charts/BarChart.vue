<template>
  <div class="bar-chart-container">
    <!-- 图表标题 -->
    <div class="chart-header mb-4">
      <h4 class="text-lg font-semibold text-gray-800 flex items-center">
        <i class="fas fa-chart-bar mr-2 text-green-600"></i>
        {{ title || '依恋得分对比图' }}
      </h4>
      <p v-if="description" class="text-sm text-gray-600 mt-1">{{ description }}</p>
    </div>

    <!-- 图表容器 -->
    <div class="chart-wrapper relative">
      <div class="chart-canvas-container">
        <Bar
          :data="chartData"
          :options="chartOptions"
          :chart-id="chartId"
          :dataset-id-key="datasetIdKey"
          :plugins="chartPlugins"
          :css-classes="cssClasses"
          :styles="styles"
          :width="width"
          :height="height"
        />
      </div>

      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p class="text-sm text-gray-600">正在生成图表...</p>
        </div>
      </div>
    </div>

    <!-- 得分解释 -->
    <div class="score-interpretation mt-4">
      <div class="grid md:grid-cols-3 gap-4">
        <div
          v-for="(item, index) in interpretationData"
          :key="index"
          class="interpretation-card p-4 rounded-lg"
          :class="item.bgClass"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: item.color }"
            >
              <i :class="item.icon" class="text-white text-sm"></i>
            </div>
            <div>
              <h5 class="font-medium text-gray-800">{{ item.label }}</h5>
              <p class="text-2xl font-bold" :style="{ color: item.color }">
                {{ item.value.toFixed(1) }}
              </p>
              <p class="text-xs text-gray-600 mt-1">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对比分析 -->
    <div v-if="showComparison" class="comparison-analysis mt-6">
      <h5 class="font-medium text-gray-800 mb-3 flex items-center">
        <i class="fas fa-balance-scale mr-2 text-purple-600"></i>
        与人群对比
      </h5>
      <div class="space-y-3">
        <div
          v-for="(comparison, index) in comparisonData"
          :key="index"
          class="comparison-item p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-700">{{ comparison.dimension }}</span>
            <span class="text-sm text-gray-600">超过 {{ comparison.percentile }}% 的人群</span>
          </div>
          <div class="relative">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-1000 ease-out"
                :style="{
                  width: `${comparison.percentile}%`,
                  backgroundColor: comparison.color
                }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <p class="text-xs text-gray-600 mt-2">{{ comparison.interpretation }}</p>
        </div>
      </div>
    </div>

    <!-- 建议卡片 -->
    <div v-if="showSuggestions" class="suggestions mt-6">
      <h5 class="font-medium text-gray-800 mb-3 flex items-center">
        <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>
        基于得分的建议
      </h5>
      <div class="grid gap-3">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-card p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400"
        >
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <i class="fas fa-arrow-up text-yellow-600 text-xs"></i>
            </div>
            <div>
              <h6 class="font-medium text-gray-800 mb-1">{{ suggestion.title }}</h6>
              <p class="text-sm text-gray-700">{{ suggestion.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showActions" class="chart-actions mt-6 flex flex-wrap gap-2">
      <button
        @click="downloadChart"
        class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
      >
        <i class="fas fa-download mr-2"></i>
        下载图表
      </button>
      <button
        @click="toggleComparison"
        class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
      >
        <i class="fas fa-users mr-2"></i>
        {{ showComparison ? '隐藏' : '显示' }}对比
      </button>
      <button
        @click="exportData"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
      >
        <i class="fas fa-file-export mr-2"></i>
        导出数据
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import type { AttachmentScores, AttachmentPercentiles, AttachmentStyle } from '@/types'

// 注册Chart.js组件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  data: {
    scores: AttachmentScores
    percentiles?: AttachmentPercentiles
    attachmentStyle?: AttachmentStyle
  }
  title?: string
  description?: string
  config?: Record<string, any>
  loading?: boolean
  showComparison?: boolean
  showSuggestions?: boolean
  showActions?: boolean
  chartId?: string
  datasetIdKey?: string
  width?: number
  height?: number
  cssClasses?: string
  styles?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showComparison: true,
  showSuggestions: true,
  showActions: true,
  chartId: 'bar-chart',
  datasetIdKey: 'label',
  width: 400,
  height: 300,
  cssClasses: '',
  styles: () => ({})
})

// 响应式状态
const showComparisonData = ref(props.showComparison)

// 计算属性
const chartData = computed<ChartData<'bar'>>(() => {
  const scores = props.data.scores
  
  return {
    labels: ['焦虑依恋', '回避依恋', '安全依恋'],
    datasets: [
      {
        label: '我的得分',
        data: [scores.anxious, scores.avoidant, scores.secure],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(239, 68, 68, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(34, 197, 94, 0.9)'
        ],
        hoverBorderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)'
        ]
      },
      {
        label: '人群平均',
        data: [3.5, 3.2, 4.1], // 假设的人群平均值
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderColor: 'rgba(156, 163, 175, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'bar'>>(() => {
  const baseOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#374151'
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 7,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          },
          color: '#6B7280',
          callback: (value: number) => {
            return `${value}分`  
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 12
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => {
            return `${context[0].label}`
          },
          label: (context) => {
            const value = context.parsed.y
            const label = context.dataset.label
            return `${label}: ${value.toFixed(1)}分`
          },
          afterLabel: (context) => {
            if (context.datasetIndex === 0) {
              const dimension = context.label as string
              const percentile = getPercentileForDimension(dimension)
              return percentile ? `超过 ${percentile}% 的人群` : ''
            }
            return ''
          }
        }
      }
    },
    elements: {
      bar: {
        borderWidth: 2
      }
    }
  }

  // 合并用户配置
  if (props.config) {
    return { ...baseOptions, ...props.config }
  }

  return baseOptions
})

const chartPlugins = computed(() => [
  {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart: any) => {
      const { ctx } = chart
      ctx.save()
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, chart.width, chart.height)
      ctx.restore()
    }
  }
])

const interpretationData = computed(() => {
  const scores = props.data.scores
  
  return [
    {
      label: '焦虑依恋',
      value: scores.anxious,
      color: '#EF4444',
      bgClass: 'bg-red-50',
      icon: 'fas fa-heart-broken',
      description: getScoreLevel(scores.anxious)
    },
    {
      label: '回避依恋',
      value: scores.avoidant,
      color: '#3B82F6',
      bgClass: 'bg-blue-50',
      icon: 'fas fa-shield-alt',
      description: getScoreLevel(scores.avoidant)
    },
    {
      label: '安全依恋',
      value: scores.secure,
      color: '#22C55E',
      bgClass: 'bg-green-50',
      icon: 'fas fa-heart',
      description: getScoreLevel(scores.secure)
    }
  ]
})

const comparisonData = computed(() => {
  const percentiles = props.data.percentiles
  if (!percentiles) return []
  
  return [
    {
      dimension: '焦虑依恋',
      percentile: percentiles.anxious,
      color: '#EF4444',
      interpretation: getPercentileInterpretation(percentiles.anxious, 'anxious')
    },
    {
      dimension: '回避依恋',
      percentile: percentiles.avoidant,
      color: '#3B82F6',
      interpretation: getPercentileInterpretation(percentiles.avoidant, 'avoidant')
    },
    {
      dimension: '安全依恋',
      percentile: percentiles.secure || 0,
      color: '#22C55E',
      interpretation: getPercentileInterpretation(percentiles.secure || 0, 'secure')
    }
  ]
})

const suggestions = computed(() => {
  const scores = props.data.scores
  
  const baseSuggestions = []
  
  // 基于焦虑得分的建议
  if (scores.anxious > 4.0) {
    baseSuggestions.push({
      title: '管理焦虑情绪',
      content: '您的焦虑依恋得分较高，建议学习情绪调节技巧，如正念练习和深呼吸。'
    })
  }
  
  // 基于回避得分的建议
  if (scores.avoidant > 4.0) {
    baseSuggestions.push({
      title: '增强情感连接',
      content: '您的回避依恋得分较高，建议逐步练习情感表达，增加与他人的情感连接。'
    })
  }
  
  // 基于安全得分的建议
  if (scores.secure > 5.0) {
    baseSuggestions.push({
      title: '维持健康关系',
      content: '您的安全依恋得分较高，继续保持开放沟通和相互支持的关系模式。'
    })
  } else if (scores.secure < 3.0) {
    baseSuggestions.push({
      title: '建立安全感',
      content: '建议通过自我关怀和建立支持性关系来增强内在安全感。'
    })
  }
  
  return baseSuggestions
})

// 方法
const getPercentileForDimension = (dimension: string): number | null => {
  if (!props.data.percentiles) return null
  
  switch (dimension) {
    case '焦虑依恋':
      return props.data.percentiles.anxious
    case '回避依恋':
      return props.data.percentiles.avoidant
    case '安全依恋':
      return props.data.percentiles.secure || null
    default:
      return null
  }
}

const getScoreLevel = (score: number): string => {
  if (score <= 2.0) return '较低'
  if (score <= 3.5) return '中等偏低'
  if (score <= 5.0) return '中等'
  if (score <= 6.0) return '中等偏高'
  return '较高'
}

const getPercentileInterpretation = (percentile: number, dimension: string): string => {
  if (percentile < 25) {
    return `您在${dimension}维度上的得分低于大多数人`
  } else if (percentile < 75) {
    return `您在${dimension}维度上的得分处于中等水平`
  } else {
    return `您在${dimension}维度上的得分高于大多数人`
  }
}

const toggleComparison = () => {
  showComparisonData.value = !showComparisonData.value
}

const downloadChart = () => {
  const canvas = document.querySelector(`#${props.chartId} canvas`) as HTMLCanvasElement
  if (canvas) {
    const link = document.createElement('a')
    link.download = `ecr-bar-chart-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }
}

const exportData = () => {
  const data = {
    scores: props.data.scores,
    percentiles: props.data.percentiles,
    timestamp: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.download = `ecr-data-${Date.now()}.json`
  link.href = url
  link.click()
  
  URL.revokeObjectURL(url)
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    // 数据变化时的处理逻辑
  },
  { deep: true }
)

// 生命周期
onMounted(() => {
  // 组件挂载后的初始化逻辑
})
</script>

<style scoped>
.bar-chart-container {
  @apply bg-white rounded-2xl shadow-lg p-6;
}

.chart-wrapper {
  @apply transition-all duration-300;
}

.chart-canvas-container {
  @apply min-h-0;
}

.interpretation-card {
  @apply transition-all duration-300 hover:shadow-md cursor-pointer;
}

.interpretation-card:hover {
  @apply transform -translate-y-1;
}

.comparison-item {
  @apply transition-all duration-300;
}

.comparison-item:hover {
  @apply bg-gray-100;
}

.suggestion-card {
  @apply transition-all duration-300 hover:shadow-md;
}

.suggestion-card:hover {
  @apply transform translate-x-1;
}

.chart-actions button {
  @apply transition-all duration-200 transform;
}

.chart-actions button:hover {
  @apply scale-105 shadow-md;
}

.chart-actions button:active {
  @apply scale-95;
}

/* 动画效果 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bar-chart-container {
  animation: slideInUp 0.6s ease-out;
}

.interpretation-card {
  animation: slideInUp 0.6s ease-out;
}

.interpretation-card:nth-child(1) { animation-delay: 0.1s; }
.interpretation-card:nth-child(2) { animation-delay: 0.2s; }
.interpretation-card:nth-child(3) { animation-delay: 0.3s; }

/* 响应式设计 */
@media (max-width: 768px) {
  .bar-chart-container {
    @apply p-4;
  }
  
  .interpretationData {
    @apply grid-cols-1;
  }
  
  .chart-actions {
    @apply flex-col space-y-2;
  }
  
  .chart-actions button {
    @apply w-full;
  }
}

@media (max-width: 640px) {
  .chart-canvas-container {
    @apply overflow-x-auto;
  }
}
</style>