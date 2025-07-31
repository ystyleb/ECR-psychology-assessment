<template>
  <div class="radar-chart-container">
    <!-- 图表标题 -->
    <div class="chart-header mb-4">
      <h4 class="text-lg font-semibold text-gray-800 flex items-center">
        <i class="fas fa-chart-pie mr-2 text-blue-600"></i>
        {{ title || '依恋维度雷达图' }}
      </h4>
      <p v-if="description" class="text-sm text-gray-600 mt-1">{{ description }}</p>
    </div>

    <!-- 图表容器 -->
    <div class="chart-wrapper relative">
      <div class="aspect-square max-w-md mx-auto">
        <Radar
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
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p class="text-sm text-gray-600">正在生成图表...</p>
        </div>
      </div>
    </div>

    <!-- 图表说明 -->
    <div class="chart-legend mt-4">
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <span class="text-gray-700">焦虑依恋</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-gray-700">回避依恋</span>
        </div>
      </div>
      <div class="mt-3 p-3 bg-gray-50 rounded-lg">
        <p class="text-xs text-gray-600 leading-relaxed">
          雷达图展示了您在不同依恋维度上的得分分布。图形越向外扩展，表示该维度得分越高。
          理想的安全型依恋通常在焦虑和回避维度上都保持较低得分。
        </p>
      </div>
    </div>

    <!-- 数据表格（可选） -->
    <div v-if="showDataTable" class="data-table mt-4">
      <h5 class="font-medium text-gray-800 mb-2">详细数据</h5>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-3 py-2 text-left font-medium text-gray-700">维度</th>
              <th class="px-3 py-2 text-center font-medium text-gray-700">得分</th>
              <th class="px-3 py-2 text-center font-medium text-gray-700">百分位</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700">解释</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="index" class="border-t">
              <td class="px-3 py-2 font-medium" :style="{ color: item.color }">
                {{ item.label }}
              </td>
              <td class="px-3 py-2 text-center">{{ item.value.toFixed(1) }}</td>
              <td class="px-3 py-2 text-center">{{ item.percentile }}%</td>
              <td class="px-3 py-2 text-xs text-gray-600">{{ item.interpretation }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showActions" class="chart-actions mt-4 flex flex-wrap gap-2">
      <button
        @click="downloadChart"
        class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-download mr-2"></i>
        下载图表
      </button>
      <button
        @click="toggleDataTable"
        class="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
      >
        <i class="fas fa-table mr-2"></i>
        {{ showDataTable ? '隐藏' : '显示' }}数据
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import { Radar } from 'vue-chartjs'
import type { AttachmentScores, AttachmentPercentiles } from '@/types'

// 注册Chart.js组件
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  data: {
    scores: AttachmentScores
    percentiles?: AttachmentPercentiles
  }
  title?: string
  description?: string
  config?: Record<string, unknown>
  loading?: boolean
  showDataTable?: boolean
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
  showDataTable: false,
  showActions: true,
  chartId: 'radar-chart',
  datasetIdKey: 'label',
  width: 400,
  height: 400,
  cssClasses: '',
  styles: () => ({})
})

// 响应式状态
const showTableData = ref(props.showDataTable)

// 计算属性
const chartData = computed<ChartData<'radar'>>(() => {
  const scores = props.data.scores
  
  return {
    labels: ['焦虑依恋', '回避依恋'],
    datasets: [
      {
        label: '我的得分',
        data: [scores.anxious, scores.avoidant],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: '安全型参考',
        data: [2.0, 2.0], // 安全型依恋的典型得分
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 0.8)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: 'rgba(34, 197, 94, 0.8)',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'radar'>>(() => {
  const baseOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 7,
        stepSize: 1,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#374151'
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 10
          },
          color: '#6B7280'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle'
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
            const value = context.parsed.r
            const label = context.dataset.label
            const percentile = getPercentileForScore(context.label as string, value)
            return [
              `${label}: ${value.toFixed(1)}分`,
              percentile ? `超过 ${percentile}% 的人群` : ''
            ].filter(Boolean)
          }
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8
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
    beforeDraw: (chart: { ctx: CanvasRenderingContext2D; width: number; height: number }) => {
      const { ctx } = chart
      ctx.save()
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, chart.width, chart.height)
      ctx.restore()
    }
  }
])

const tableData = computed(() => {
  const scores = props.data.scores
  const percentiles = props.data.percentiles
  
  return [
    {
      label: '焦虑依恋',
      value: scores.anxious,
      percentile: percentiles?.anxious || 0,
      color: '#EF4444',
      interpretation: getScoreInterpretation(scores.anxious)
    },
    {
      label: '回避依恋',
      value: scores.avoidant,
      percentile: percentiles?.avoidant || 0,
      color: '#3B82F6',
      interpretation: getScoreInterpretation(scores.avoidant)
    }
  ]
})

// 方法
const getPercentileForScore = (dimension: string, _score: number): number | null => {
  if (!props.data.percentiles) return null
  
  switch (dimension) {
    case '焦虑依恋':
      return props.data.percentiles.anxious
    case '回避依恋':
      return props.data.percentiles.avoidant
    default:
      return null
  }
}

const getScoreInterpretation = (score: number): string => {
  if (score <= 2.5) {
    return '得分较低，该维度特征不明显'
  } else if (score <= 4.5) {
    return '得分中等，该维度特征适中'
  } else if (score <= 6.0) {
    return '得分较高，该维度特征比较明显'
  } else {
    return '得分很高，该维度特征非常明显'
  }
}

const toggleDataTable = () => {
  showTableData.value = !showTableData.value
}

const downloadChart = () => {
  const canvas = document.querySelector(`#${props.chartId} canvas`) as HTMLCanvasElement
  if (canvas) {
    const link = document.createElement('a')
    link.download = `ecr-radar-chart-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }
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
.radar-chart-container {
  @apply bg-white rounded-2xl shadow-lg p-6;
}

.chart-wrapper {
  @apply transition-all duration-300;
}

.chart-header h4 {
  @apply transition-colors duration-200;
}

.chart-header:hover h4 {
  @apply text-blue-700;
}

.data-table {
  @apply transition-all duration-300;
}

.data-table table {
  @apply border-collapse border-spacing-0;
}

.data-table th {
  @apply bg-gray-100 font-semibold;
}

.data-table td,
.data-table th {
  @apply border-b border-gray-200;
}

.data-table tr:hover {
  @apply bg-gray-50;
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
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.radar-chart-container {
  animation: fadeIn 0.6s ease-out;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .chart-wrapper .aspect-square {
    max-width: 280px;
  }
  
  .data-table {
    font-size: 0.75rem;
  }
  
  .chart-actions {
    flex-direction: column;
  }
  
  .chart-actions button {
    flex: none;
    width: 100%;
  }
}
</style>