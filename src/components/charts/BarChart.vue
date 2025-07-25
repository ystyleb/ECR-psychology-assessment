<template>
  <div class="bar-chart-container">
    <div class="chart-header mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">分数对比分析</h3>
      <p class="text-sm text-gray-600">您的得分与不同依恋类型典型分数的对比</p>
    </div>
    
    <div class="chart-wrapper relative">
      <canvas 
        ref="chartCanvas" 
        :width="canvasSize.width" 
        :height="canvasSize.height"
        class="max-w-full h-auto"
      ></canvas>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span class="text-gray-600">正在渲染图表...</span>
        </div>
      </div>
    </div>

    <!-- 图表说明 -->
    <div class="chart-legend mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="flex items-center">
        <div class="w-4 h-4 rounded bg-blue-500 mr-2"></div>
        <span class="text-xs text-gray-700">您的得分</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded bg-green-500 mr-2"></div>
        <span class="text-xs text-gray-700">安全型</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
        <span class="text-xs text-gray-700">焦虑型</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded bg-purple-500 mr-2"></div>
        <span class="text-xs text-gray-700">回避型</span>
      </div>
    </div>

    <!-- 详细分析 -->
    <div class="score-analysis mt-6 space-y-4">
      <div class="analysis-section">
        <h4 class="font-medium text-gray-800 mb-2">得分解读</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="score-item">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium text-gray-700">焦虑维度</span>
              <span class="text-sm font-bold text-blue-600">{{ formatScore(scores.anxious) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000"
                :style="{ width: `${(scores.anxious / 7) * 100}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-600 mt-1">{{ getScoreInterpretation('anxious', scores.anxious) }}</p>
          </div>
          
          <div class="score-item">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium text-gray-700">回避维度</span>
              <span class="text-sm font-bold text-purple-600">{{ formatScore(scores.avoidant) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-1000"
                :style="{ width: `${(scores.avoidant / 7) * 100}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-600 mt-1">{{ getScoreInterpretation('avoidant', scores.avoidant) }}</p>
          </div>
        </div>
      </div>

      <!-- 与典型类型对比 -->
      <div class="comparison-section">
        <h4 class="font-medium text-gray-800 mb-2">与典型依恋类型对比</h4>
        <div class="space-y-2">
          <div 
            v-for="(type, index) in attachmentTypes" 
            :key="type.name"
            class="flex items-center justify-between p-2 rounded-lg"
            :class="type.name === currentType ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'"
          >
            <div class="flex items-center">
              <div 
                class="w-3 h-3 rounded-full mr-2"
                :style="{ backgroundColor: type.color }"
              ></div>
              <span class="text-sm font-medium">{{ type.label }}</span>
              <span v-if="type.name === currentType" class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">您的类型</span>
            </div>
            <div class="text-sm text-gray-600">
              相似度: {{ calculateSimilarity(type) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import type { AttachmentStyle } from '@/types'

// 注册Chart.js组件
Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Props {
  scores: {
    anxious: number
    avoidant: number
  }
  currentType: AttachmentStyle
  animated?: boolean
  showComparison?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  animated: true,
  showComparison: true
})

// 响应式数据
const chartCanvas = ref<HTMLCanvasElement>()
const chartInstance = ref<Chart | null>(null)
const isLoading = ref(true)

// 典型依恋类型得分参考
const attachmentTypes = ref([
  {
    name: 'secure' as AttachmentStyle,
    label: '安全型',
    color: '#10B981',
    anxious: 2.8,
    avoidant: 2.5
  },
  {
    name: 'anxious' as AttachmentStyle,
    label: '焦虑型',
    color: '#F59E0B',
    anxious: 5.2,
    avoidant: 2.8
  },
  {
    name: 'avoidant' as AttachmentStyle,
    label: '回避型',
    color: '#8B5CF6',
    anxious: 2.9,
    avoidant: 5.1
  },
  {
    name: 'disorganized' as AttachmentStyle,
    label: '混乱型',
    color: '#EF4444',
    anxious: 4.8,
    avoidant: 4.6
  }
])

// 计算属性
const canvasSize = computed(() => ({
  width: 600,
  height: 300
}))

// 方法
const formatScore = (score: number): string => {
  return (Math.round(score * 10) / 10).toFixed(1)
}

const getScoreInterpretation = (dimension: 'anxious' | 'avoidant', score: number): string => {
  const interpretations = {
    anxious: {
      low: '较低焦虑水平',
      medium: '中等焦虑水平',
      high: '较高焦虑水平'
    },
    avoidant: {
      low: '较低回避倾向',
      medium: '中等回避倾向',
      high: '较高回避倾向'
    }
  }

  const level = score <= 3.0 ? 'low' : score <= 4.5 ? 'medium' : 'high'
  return interpretations[dimension][level]
}

const calculateSimilarity = (type: typeof attachmentTypes.value[0]): number => {
  const anxiousDiff = Math.abs(props.scores.anxious - type.anxious)
  const avoidantDiff = Math.abs(props.scores.avoidant - type.avoidant)
  const totalDiff = anxiousDiff + avoidantDiff
  const maxDiff = 8.0 // 最大可能差异
  const similarity = Math.max(0, Math.round((1 - totalDiff / maxDiff) * 100))
  return similarity
}

const createChart = async () => {
  if (!chartCanvas.value) return

  try {
    isLoading.value = true
    
    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) return

    // 准备数据
    const labels = ['焦虑维度', '回避维度']
    const datasets = [
      {
        label: '您的得分',
        data: [props.scores.anxious, props.scores.avoidant],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]

    // 如果显示对比，添加典型类型数据
    if (props.showComparison) {
      attachmentTypes.value.forEach(type => {
        datasets.push({
          label: type.label,
          data: [type.anxious, type.avoidant],
          backgroundColor: type.color + '80', // 添加透明度
          borderColor: type.color,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        })
      })
    }

    // 图表配置
    const config = {
      type: 'bar' as const,
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: props.animated ? {
          duration: 1200,
          easing: 'easeInOutCubic' as const,
        } : false,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              padding: 15,
              font: {
                size: 11
              },
              color: '#374151',
              usePointStyle: true,
              pointStyle: 'rectRounded'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: function(context: any) {
                const label = context.dataset.label || ''
                const value = Math.round(context.parsed.y * 10) / 10
                return `${label}: ${value}分`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#374151',
              font: {
                size: 12,
                weight: 'bold' as const
              }
            }
          },
          y: {
            beginAtZero: true,
            max: 7,
            grid: {
              color: 'rgba(156, 163, 175, 0.3)'
            },
            ticks: {
              stepSize: 1,
              color: '#6b7280',
              font: {
                size: 11
              },
              callback: function(value: any) {
                return value + '分'
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index' as const
        }
      }
    }

    // 创建图表实例
    chartInstance.value = new Chart(ctx, config)
    
    // 延迟隐藏加载状态
    setTimeout(() => {
      isLoading.value = false
    }, props.animated ? 600 : 100)

  } catch (error) {
    console.error('创建柱状图失败:', error)
    isLoading.value = false
  }
}

const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
}

const updateChart = () => {
  destroyChart()
  nextTick(() => {
    createChart()
  })
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    createChart()
  })
})

onUnmounted(() => {
  destroyChart()
})

// 暴露方法
defineExpose({
  updateChart,
  destroyChart
})
</script>

<style scoped>
.bar-chart-container {
  @apply bg-white rounded-lg p-6 shadow-sm border border-gray-200;
}

.chart-wrapper {
  @apply flex justify-center items-center;
  min-height: 300px;
}

.chart-header h3 {
  @apply text-gray-800;
}

.score-analysis {
  @apply bg-gray-50 rounded-lg p-4;
}

.analysis-section h4,
.comparison-section h4 {
  @apply text-gray-800;
}

.score-item {
  @apply bg-white rounded-lg p-3;
}

/* 暗色主题 */
[data-theme='dark'] .bar-chart-container {
  @apply bg-gray-800 border-gray-700;
}

[data-theme='dark'] .chart-header h3,
[data-theme='dark'] .chart-header p {
  @apply text-gray-200;
}

[data-theme='dark'] .score-analysis {
  @apply bg-gray-700;
}

[data-theme='dark'] .analysis-section h4,
[data-theme='dark'] .comparison-section h4 {
  @apply text-gray-200;
}

[data-theme='dark'] .score-item {
  @apply bg-gray-600;
}

[data-theme='dark'] .score-item span,
[data-theme='dark'] .score-item p {
  @apply text-gray-300;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .chart-wrapper {
    min-height: 250px;
  }
  
  .chart-legend {
    @apply grid-cols-2;
  }

  .score-analysis .grid {
    @apply grid-cols-1;
  }
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

.score-item {
  transition: all 0.3s ease;
}

.score-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>