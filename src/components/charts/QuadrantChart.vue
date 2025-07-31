<template>
  <div class="quadrant-chart-container">
    <div class="chart-header mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">依恋类型四象限图</h3>
      <p class="text-sm text-gray-600">基于焦虑和回避维度的依恋类型分布图</p>
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

      <!-- 象限标签覆盖层 -->
      <div class="quadrant-labels absolute inset-0 pointer-events-none">
        <div class="absolute top-4 left-4 text-xs font-medium text-gray-600 bg-white bg-opacity-90 px-2 py-1 rounded">
          高焦虑 + 低回避<br>
          <span class="text-yellow-600 font-bold">焦虑型</span>
        </div>
        <div class="absolute top-4 right-4 text-xs font-medium text-gray-600 bg-white bg-opacity-90 px-2 py-1 rounded text-right">
          高焦虑 + 高回避<br>
          <span class="text-red-600 font-bold">混乱型</span>
        </div>
        <div class="absolute bottom-4 left-4 text-xs font-medium text-gray-600 bg-white bg-opacity-90 px-2 py-1 rounded">
          低焦虑 + 低回避<br>
          <span class="text-green-600 font-bold">安全型</span>
        </div>
        <div class="absolute bottom-4 right-4 text-xs font-medium text-gray-600 bg-white bg-opacity-90 px-2 py-1 rounded text-right">
          低焦虑 + 高回避<br>
          <span class="text-purple-600 font-bold">回避型</span>
        </div>
      </div>
    </div>

    <!-- 图表说明 -->
    <div class="chart-legend mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="flex items-center">
        <div class="w-4 h-4 rounded-full bg-blue-500 mr-2 border-2 border-white shadow"></div>
        <span class="text-sm text-gray-700">您的位置</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded bg-green-500 mr-2"></div>
        <span class="text-sm text-gray-700">安全型</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
        <span class="text-sm text-gray-700">焦虑型</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded bg-purple-500 mr-2"></div>
        <span class="text-sm text-gray-700">回避型</span>
      </div>
    </div>

    <!-- 位置分析 -->
    <div class="position-analysis mt-6 space-y-4">
      <div class="analysis-section">
        <h4 class="font-medium text-gray-800 mb-2">您的位置分析</h4>
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-blue-800">
                {{ getPositionDescription() }}
              </p>
              <p class="text-sm text-blue-700 mt-1">
                坐标: ({{ formatScore(scores.avoidant) }}, {{ formatScore(scores.anxious) }})
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 距离分析 -->
      <div class="distance-analysis">
        <h4 class="font-medium text-gray-800 mb-3">与各类型的距离</h4>
        <div class="space-y-2">
          <div 
            v-for="type in sortedDistances" 
            :key="type.name"
            class="flex items-center justify-between p-3 rounded-lg border"
            :class="type.name === currentType ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'"
          >
            <div class="flex items-center">
              <div 
                class="w-3 h-3 rounded mr-3"
                :style="{ backgroundColor: type.color }"
              ></div>
              <div>
                <span class="text-sm font-medium text-gray-800">{{ type.label }}</span>
                <span v-if="type.name === currentType" class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">最近</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-800">{{ type.distance }}</div>
              <div class="text-xs text-gray-600">距离</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 移动建议 -->
      <div class="movement-suggestion" v-if="showMovementSuggestion">
        <h4 class="font-medium text-gray-800 mb-2">发展方向建议</h4>
        <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-800">
                {{ getMovementSuggestion() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { Chart, ScatterController, LinearScale, PointElement, Tooltip, Legend } from 'chart.js'
import type { AttachmentStyle } from '@/types'

// 注册Chart.js组件
Chart.register(ScatterController, LinearScale, PointElement, Tooltip, Legend)

interface Props {
  scores: {
    anxious: number
    avoidant: number
  }
  currentType: AttachmentStyle
  animated?: boolean
  showMovementSuggestion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  animated: true,
  showMovementSuggestion: true
})

// 响应式数据
const chartCanvas = ref<HTMLCanvasElement>()
const chartInstance = ref<Chart | null>(null)
const isLoading = ref(true)

// 依恋类型坐标定义
const attachmentTypeCoordinates = {
  secure: { x: 2.5, y: 2.8, label: '安全型', color: '#10B981' },
  anxious: { x: 2.8, y: 5.2, label: '焦虑型', color: '#F59E0B' },
  avoidant: { x: 5.1, y: 2.9, label: '回避型', color: '#8B5CF6' },
  disorganized: { x: 4.6, y: 4.8, label: '混乱型', color: '#EF4444' }
}

// 计算属性
const canvasSize = computed(() => ({
  width: 500,
  height: 500
}))

const sortedDistances = computed(() => {
  const distances = Object.entries(attachmentTypeCoordinates).map(([name, coords]) => {
    const distance = Math.sqrt(
      Math.pow(props.scores.avoidant - coords.x, 2) + 
      Math.pow(props.scores.anxious - coords.y, 2)
    )
    return {
      name: name as AttachmentStyle,
      label: coords.label,
      color: coords.color,
      distance: distance.toFixed(2)
    }
  })
  
  return distances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
})

// 方法
const formatScore = (score: number): string => {
  return (Math.round(score * 10) / 10).toFixed(1)
}

const getPositionDescription = (): string => {
  const { anxious, avoidant } = props.scores
  
  if (anxious < 3.5 && avoidant < 3.5) {
    return '您位于安全型区域，在关系中表现出较高的安全感和信任感。'
  } else if (anxious >= 3.5 && avoidant < 3.5) {
    return '您位于焦虑型区域，可能在关系中感到不安，渴望更多的亲密和确认。'
  } else if (anxious < 3.5 && avoidant >= 3.5) {
    return '您位于回避型区域，倾向于保持独立，可能会避免过度的情感依赖。'
  } else {
    return '您位于混乱型区域，在亲密和距离之间可能会有矛盾的感受。'
  }
}

const getMovementSuggestion = (): string => {
  const { anxious, avoidant } = props.scores
  const secureCoords = attachmentTypeCoordinates.secure
  
  const anxiousDiff = anxious - secureCoords.y
  const avoidantDiff = avoidant - secureCoords.x
  
  let suggestion = '建议向安全型方向发展：'
  
  if (anxiousDiff > 0.5) {
    suggestion += '降低关系焦虑，练习自我安抚技巧；'
  }
  if (avoidantDiff > 0.5) {
    suggestion += '增加对他人的信任，尝试更多情感表达；'
  }
  if (anxiousDiff <= 0.5 && avoidantDiff <= 0.5) {
    suggestion += '保持当前良好的依恋模式，继续发展健康的关系技能。'
  }
  
  return suggestion.replace(/；$/, '。')
}

const createChart = async () => {
  if (!chartCanvas.value) return

  try {
    isLoading.value = true
    
    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) return

    // 创建数据集
    const datasets = [
      // 用户位置
      {
        label: '您的位置',
        data: [{
          x: props.scores.avoidant,
          y: props.scores.anxious
        }],
        backgroundColor: '#3B82F6',
        borderColor: '#ffffff',
        borderWidth: 3,
        pointRadius: 12,
        pointHoverRadius: 15,
        showLine: false
      },
      // 典型类型位置
      ...Object.entries(attachmentTypeCoordinates).map(([_name, coords]) => ({
        label: coords.label,
        data: [{ x: coords.x, y: coords.y }],
        backgroundColor: `${coords.color  }80`,
        borderColor: coords.color,
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10,
        showLine: false
      }))
    ]

    // 图表配置
    const config = {
      type: 'scatter' as const,
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: props.animated ? {
          duration: 1500,
          easing: 'easeInOutCubic' as const,
        } : false,
        plugins: {
          legend: {
            display: false // 使用自定义图例
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              title(context: any) {
                return context[0].dataset.label
              },
              label(context: any) {
                const x = Math.round(context.parsed.x * 10) / 10
                const y = Math.round(context.parsed.y * 10) / 10
                return `坐标: (${x}, ${y})`
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: 1,
            max: 7,
            title: {
              display: true,
              text: '回避维度 →',
              color: '#374151',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.3)'
            },
            ticks: {
              stepSize: 1,
              color: '#6b7280'
            }
          },
          y: {
            type: 'linear',
            min: 1,
            max: 7,
            title: {
              display: true,
              text: '焦虑维度 ↑',
              color: '#374151',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.3)'
            },
            ticks: {
              stepSize: 1,
              color: '#6b7280'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'nearest' as const
        }
      }
    }

    // 创建图表实例
    chartInstance.value = new Chart(ctx, config)
    
    setTimeout(() => {
      isLoading.value = false
    }, props.animated ? 800 : 100)

  } catch (error) {
    console.error('创建四象限图失败:', error)
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
.quadrant-chart-container {
  @apply bg-white rounded-lg p-6 shadow-sm border border-gray-200;
}

.chart-wrapper {
  @apply flex justify-center items-center relative;
  min-height: 400px;
}

.chart-header h3 {
  @apply text-gray-800;
}

.position-analysis {
  @apply bg-gray-50 rounded-lg p-4;
}

.analysis-section h4,
.distance-analysis h4,
.movement-suggestion h4 {
  @apply text-gray-800;
}

/* 象限标签样式 */
.quadrant-labels {
  z-index: 10;
}

.quadrant-labels > div {
  backdrop-filter: blur(4px);
}

/* 暗色主题 */
[data-theme='dark'] .quadrant-chart-container {
  @apply bg-gray-800 border-gray-700;
}

[data-theme='dark'] .chart-header h3,
[data-theme='dark'] .chart-header p {
  @apply text-gray-200;
}

[data-theme='dark'] .position-analysis {
  @apply bg-gray-700;
}

[data-theme='dark'] .analysis-section h4,
[data-theme='dark'] .distance-analysis h4,
[data-theme='dark'] .movement-suggestion h4 {
  @apply text-gray-200;
}

[data-theme='dark'] .quadrant-labels > div {
  @apply bg-gray-800 bg-opacity-90 text-gray-300;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-wrapper {
    min-height: 350px;
  }
  
  .chart-legend {
    @apply grid-cols-2;
  }

  .quadrant-labels > div {
    @apply text-xs px-1 py-1;
  }
}

/* 动画效果 */
@keyframes bounceIn {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.quadrant-chart-container {
  animation: bounceIn 0.8s ease-out;
}

.distance-analysis > div > div {
  transition: all 0.3s ease;
}

.distance-analysis > div > div:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>