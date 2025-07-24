<template>
  <div class="radar-chart-container">
    <div class="chart-header mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">依恋维度分析</h3>
      <p class="text-sm text-gray-600">您在焦虑和回避两个维度上的得分分布</p>
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
    <div class="chart-legend mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex items-center">
        <div class="w-4 h-4 rounded bg-blue-500 mr-2"></div>
        <span class="text-sm text-gray-700">您的得分</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded bg-gray-300 border-2 border-gray-400 mr-2"></div>
        <span class="text-sm text-gray-700">平均水平</span>
      </div>
    </div>

    <!-- 维度解释 -->
    <div class="dimensions-explanation mt-6 space-y-3">
      <div class="explanation-item">
        <div class="flex items-center mb-1">
          <div class="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
          <span class="font-medium text-gray-800">焦虑维度 ({{ Math.round(scores.anxious * 10) / 10 }}分)</span>
        </div>
        <p class="text-sm text-gray-600 ml-4">
          {{ getAnxietyDescription(scores.anxious) }}
        </p>
      </div>
      
      <div class="explanation-item">
        <div class="flex items-center mb-1">
          <div class="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
          <span class="font-medium text-gray-800">回避维度 ({{ Math.round(scores.avoidant * 10) / 10 }}分)</span>
        </div>
        <p class="text-sm text-gray-600 ml-4">
          {{ getAvoidanceDescription(scores.avoidant) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'

// 注册Chart.js组件
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  scores: {
    anxious: number
    avoidant: number
  }
  showComparison?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showComparison: true,
  animated: true
})

// 响应式数据
const chartCanvas = ref<HTMLCanvasElement>()
const chartInstance = ref<Chart | null>(null)
const isLoading = ref(true)

// 计算属性
const canvasSize = computed(() => ({
  width: 400,
  height: 400
}))

// 方法
const getAnxietyDescription = (score: number): string => {
  if (score <= 2.5) return '您在关系中表现出较低的焦虑，通常能够保持情绪稳定。'
  if (score <= 4.0) return '您的焦虑水平适中，在多数情况下能够有效管理关系压力。'
  if (score <= 5.5) return '您可能会在关系中感到一定程度的焦虑，担心伴侣的反应。'
  return '您在关系中容易感到强烈焦虑，经常担心被拒绝或遗弃。'
}

const getAvoidanceDescription = (score: number): string => {
  if (score <= 2.5) return '您很愿意在关系中保持亲密，容易信任他人。'
  if (score <= 4.0) return '您能够建立亲密关系，但有时会保持一定的情感距离。'
  if (score <= 5.5) return '您倾向于在关系中保持独立，可能会避免过度依赖。'
  return '您更喜欢保持情感距离，认为过度依赖他人是有风险的。'
}

const createChart = async () => {
  if (!chartCanvas.value) return

  try {
    isLoading.value = true
    
    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) return

    // 准备数据
    const userData = [
      props.scores.anxious,
      props.scores.avoidant,
      (props.scores.anxious + props.scores.avoidant) / 2, // 综合指标
      Math.abs(props.scores.anxious - props.scores.avoidant) // 差异指标
    ]

    const averageData = [3.5, 3.5, 3.5, 1.0] // 平均水平参考

    const chartData = {
      labels: ['焦虑依恋', '回避依恋', '整体水平', '维度差异'],
      datasets: [
        {
          label: '您的得分',
          data: userData,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    }

    // 如果显示对比，添加平均水平
    if (props.showComparison) {
      chartData.datasets.push({
        label: '平均水平',
        data: averageData,
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderColor: 'rgba(156, 163, 175, 0.8)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointBackgroundColor: 'rgba(156, 163, 175, 0.8)',
        pointBorderColor: '#fff',
        pointRadius: 3,
        pointHoverRadius: 5,
      })
    }

    // 图表配置
    const config = {
      type: 'radar' as const,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: props.animated ? {
          duration: 1500,
          easing: 'easeInOutCubic' as const,
        } : false,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              padding: 20,
              font: {
                size: 12
              },
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            callbacks: {
              label: function(context: any) {
                const label = context.dataset.label || ''
                const value = Math.round(context.parsed.r * 10) / 10
                return `${label}: ${value}分`
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 7,
            ticks: {
              stepSize: 1,
              showLabelBackdrop: false,
              color: '#6b7280',
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.3)'
            },
            angleLines: {
              color: 'rgba(156, 163, 175, 0.3)'
            },
            pointLabels: {
              color: '#374151',
              font: {
                size: 12,
                weight: 'bold' as const
              },
              padding: 15
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
    
    // 延迟隐藏加载状态以显示动画
    setTimeout(() => {
      isLoading.value = false
    }, props.animated ? 800 : 100)

  } catch (error) {
    console.error('创建雷达图失败:', error)
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

// 暴露方法供父组件调用
defineExpose({
  updateChart,
  destroyChart
})
</script>

<style scoped>
.radar-chart-container {
  @apply bg-white rounded-lg p-6 shadow-sm border border-gray-200;
}

.chart-wrapper {
  @apply flex justify-center items-center;
  min-height: 300px;
}

.chart-header h3 {
  @apply text-gray-800;
}

.dimensions-explanation {
  @apply bg-gray-50 rounded-lg p-4;
}

.explanation-item {
  @apply py-2;
}

.explanation-item:not(:last-child) {
  @apply border-b border-gray-200;
}

/* 暗色主题 */
[data-theme='dark'] .radar-chart-container {
  @apply bg-gray-800 border-gray-700;
}

[data-theme='dark'] .chart-header h3,
[data-theme='dark'] .chart-header p {
  @apply text-gray-200;
}

[data-theme='dark'] .dimensions-explanation {
  @apply bg-gray-700;
}

[data-theme='dark'] .explanation-item {
  @apply border-gray-600;
}

[data-theme='dark'] .explanation-item span,
[data-theme='dark'] .explanation-item p {
  @apply text-gray-300;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .chart-wrapper {
    min-height: 250px;
  }
  
  .chart-legend {
    @apply grid-cols-1;
  }
}

/* 加载动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.radar-chart-container {
  animation: fadeIn 0.5s ease-out;
}
</style>