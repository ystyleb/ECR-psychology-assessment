<template>
  <div class="echarts-quadrant-container">
    <div class="chart-header mb-3 sm:mb-4">
      <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">依恋类型四象限图</h3>
      <p class="text-xs sm:text-sm text-gray-600">基于焦虑和回避维度的依恋类型分布图</p>
    </div>
    
    <div class="chart-wrapper relative">
      <v-chart
        :option="chartOption"
        :style="{ 
          width: '100%', 
          height: isMobile ? '300px' : isTablet ? '400px' : '500px'
        }"
        autoresize
        @click="handleChartClick"
      />
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span class="text-gray-600">正在渲染图表...</span>
        </div>
      </div>
    </div>

    <!-- 位置分析 -->
    <div class="position-analysis mt-4 sm:mt-6 space-y-3 sm:space-y-4">
      <div class="analysis-section">
        <h4 class="font-medium text-gray-800 mb-2 text-sm sm:text-base">您的位置分析</h4>
        <div class="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 rounded-r-lg">
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
              <p class="text-xs sm:text-sm font-medium text-blue-800">
                {{ getPositionDescription() }}
              </p>
              <p class="text-xs sm:text-sm text-blue-700 mt-1">
                坐标: ({{ formatScore(scores.avoidant) }}, {{ formatScore(scores.anxious) }})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent
} from 'echarts/components'
import type { EChartsOption } from 'echarts'
import type { AttachmentStyle } from '@/types'

// 注册ECharts组件
use([
  CanvasRenderer,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent
])

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
const isLoading = ref(true)

// 移动端检测
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 640
})

const isTablet = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 640 && window.innerWidth < 1024
})

// 依恋类型坐标定义（当前未使用，保留以备后续功能）
// const _attachmentTypeCoordinates = {
//   secure: { x: 2.5, y: 2.8, label: '安全型', color: '#10B981' },
//   anxious: { x: 2.8, y: 5.2, label: '恐惧型', color: '#F59E0B' },
//   avoidant: { x: 5.1, y: 2.9, label: '专注型 / 迷恋型', color: '#8B5CF6' },
//   disorganized: { x: 4.6, y: 4.8, label: '冷漠型 / 疏离型', color: '#EF4444' }
// }

// 计算属性
const chartOption = computed<EChartsOption>(() => {
  // 移动端字体大小调整
  const fontSize = {
    title: isMobile.value ? 10 : isTablet.value ? 12 : 14,
    axis: isMobile.value ? 9 : isTablet.value ? 10 : 12,
    label: isMobile.value ? 8 : isTablet.value ? 10 : 13,
    tooltip: isMobile.value ? 10 : 12
  }
  
  return {
    animation: props.animated,
    animationDuration: props.animated ? 1500 : 0,
    animationEasing: 'cubicInOut',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: {
        color: '#fff',
        fontSize: fontSize.tooltip
      },
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      formatter(params: any) {
        if (params.seriesName === '您的位置') {
          return `<div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">您的位置</div>
            <div>焦虑维度: ${params.data[0].toFixed(2)}</div>
            <div>回避维度: ${params.data[1].toFixed(2)}</div>
            <div style="margin-top: 4px; font-size: 11px; color: #ccc;">
              坐标: (${params.data[0].toFixed(2)}, ${params.data[1].toFixed(2)})
            </div>
          </div>`
        }
        return params.name
      }
    },
    grid: {
      left: isMobile.value ? '15%' : '10%',
      right: isMobile.value ? '15%' : '10%',
      top: isMobile.value ? '20%' : '15%',
      bottom: isMobile.value ? '20%' : '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '焦虑',
      nameLocation: 'end',
      nameGap: isMobile.value ? 10 : 15,
      nameTextStyle: {
        fontSize: fontSize.title,
        fontWeight: 'bold',
        color: '#666'
      },
      min: 1,
      max: 7,
      interval: 1,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#333',
          width: 2
        },
        symbol: ['none', 'arrow'],
        symbolSize: [8, 12]
      },
      axisTick: {
        show: true,
        length: 6
      },
      axisLabel: {
        fontSize: fontSize.axis,
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '回避',
      nameLocation: 'end',
      nameGap: isMobile.value ? 10 : 15,
      nameTextStyle: {
        fontSize: fontSize.title,
        fontWeight: 'bold',
        color: '#666'
      },
      min: 1,
      max: 7,
      interval: 1,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#333',
          width: 2
        },
        symbol: ['none', 'arrow'],
        symbolSize: [8, 12]
      },
      axisTick: {
        show: true,
        length: 6
      },
      axisLabel: {
        fontSize: fontSize.axis,
        color: '#666'
      }
    },
    series: [
      // 用户位置点
      {
        name: '您的位置',
        type: 'scatter',
        data: [[props.scores.anxious, props.scores.avoidant]],
        symbolSize: 15,
        itemStyle: {
          color: '#3B82F6',
          borderColor: '#fff',
          borderWidth: 3,
          shadowColor: 'rgba(59, 130, 246, 0.3)',
          shadowBlur: 10
        },
        emphasis: {
          scale: 1.3,
          itemStyle: {
            borderWidth: 4,
            shadowBlur: 15
          }
        },
        markArea: {
          silent: true,
          data: [
            // 左下角 - 安全型
            [
              {
                name: '安全型',
                x: '10%',
                y: '50%',
                itemStyle: {
                  color: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  borderWidth: 1
                }
              },
              {
                x: '50%',
                y: '85%'
              }
            ],
            // 左上角 - 冷漠型/疏离型  
            [
              {
                name: '冷漠型 / 疏离型',
                x: '10%',
                y: '15%',
                itemStyle: {
                  color: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  borderWidth: 1
                }
              },
              {
                x: '50%',
                y: '50%'
              }
            ],
            // 右下角 - 专注型/迷恋型
            [
              {
                name: '专注型 / 迷恋型',
                x: '50%',
                y: '50%',
                itemStyle: {
                  color: 'rgba(139, 92, 246, 0.1)',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  borderWidth: 1
                }
              },
              {
                x: '90%',
                y: '85%'
              }
            ],
            // 右上角 - 恐惧型
            [
              {
                name: '恐惧型',
                x: '50%',
                y: '15%',
                itemStyle: {
                  color: 'rgba(245, 158, 11, 0.1)',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  borderWidth: 1
                }
              },
              {
                x: '90%',
                y: '50%'
              }
            ]
          ],
          label: {
            show: true,
            fontSize: fontSize.label,
            fontWeight: 'bold',
            color: '#666',
            position: 'inside'
          }
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: '#999',
            width: 1,
            type: 'solid'
          },
          data: [
            {
              xAxis: 4
            },
            {
              yAxis: 4
            }
          ]
        }
      }
    ],
    graphic: [
      // 坐标显示文本
      {
        type: 'text',
        left: `${((props.scores.anxious - 1) / 6) * 80 + 10}%`,
        top: `${85 - ((props.scores.avoidant - 1) / 6) * 70 + 5}%`,
        style: {
          text: `${props.scores.anxious.toFixed(2)}, ${props.scores.avoidant.toFixed(2)}`,
          font: `bold ${fontSize.axis}px Arial`,
          fill: '#3B82F6'
        }
      },
      // 象限标签
      {
        type: 'text',
        left: '15%',
        top: '20%',
        style: {
          text: '冷漠型 / 疏离型',
          font: `bold ${fontSize.label}px Arial`,
          fill: '#666'
        }
      },
      {
        type: 'text',
        right: '15%',
        top: '20%',
        style: {
          text: '恐惧型',
          font: `bold ${fontSize.label}px Arial`,
          fill: '#666',
          textAlign: 'right'
        }
      },
      {
        type: 'text',
        left: '15%',
        bottom: isMobile.value ? '25%' : '20%',
        style: {
          text: '安全型',
          font: `bold ${fontSize.label}px Arial`,
          fill: '#666'
        }
      },
      {
        type: 'text',
        right: '15%',
        bottom: isMobile.value ? '25%' : '20%',
        style: {
          text: '专注型 / 迷恋型',
          font: `bold ${fontSize.label}px Arial`,
          fill: '#666',
          textAlign: 'right'
        }
      },
      // 维度标签
      {
        type: 'text',
        left: '20%',
        top: isMobile.value ? '8%' : '10%',
        style: {
          text: '高',
          font: `${fontSize.axis}px Arial`,
          fill: '#f87171'
        }
      },
      {
        type: 'text',
        left: '20%',
        bottom: isMobile.value ? '5%' : '8%',
        style: {
          text: '低',
          font: `${fontSize.axis}px Arial`,
          fill: '#a3e635'
        }
      },
      {
        type: 'text',
        left: isMobile.value ? '5%' : '8%',
        bottom: '50%',
        style: {
          text: '低',
          font: `${fontSize.axis}px Arial`,
          fill: '#a3e635'
        }
      },
      {
        type: 'text',
        right: isMobile.value ? '5%' : '8%',
        bottom: '50%',
        style: {
          text: '高',
          font: `${fontSize.axis}px Arial`,
          fill: '#f87171'
        }
      }
    ]
  }
})

// const _sortedDistances = computed(() => {
//   const distances = Object.entries(attachmentTypeCoordinates).map(([name, coords]) => {
//     const distance = Math.sqrt(
//       Math.pow(props.scores.avoidant - coords.x, 2) + 
//       Math.pow(props.scores.anxious - coords.y, 2)
//     )
//     return {
//       name: name as AttachmentStyle,
//       label: coords.label,
//       color: coords.color,
//       distance: distance.toFixed(2)
//     }
//   })
//   
//   return distances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
// })

// 方法
const formatScore = (score: number): string => {
  return (Math.round(score * 100) / 100).toFixed(2)
}

const getPositionDescription = (): string => {
  const { anxious, avoidant } = props.scores
  
  if (anxious < 4 && avoidant < 4) {
    return '您位于安全型区域，在关系中表现出较高的安全感和信任感。'
  } else if (anxious >= 4 && avoidant < 4) {
    return '您位于专注型/迷恋型区域，可能在关系中感到不安，渴望更多的亲密和确认。'
  } else if (anxious < 4 && avoidant >= 4) {
    return '您位于冷漠型/疏离型区域，倾向于保持独立，可能会避免过度的情感依赖。'
  } else {
    return '您位于恐惧型区域，在亲密和距离之间可能会有矛盾的感受。'
  }
}

const handleChartClick = (params: any) => {
  console.log('Chart clicked:', params)
}

// 生命周期
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, props.animated ? 800 : 100)
})

// 监听数据变化
watch(
  () => props.scores,
  () => {
    // 数据变化时重新计算
  },
  { deep: true }
)
</script>

<style scoped>
.echarts-quadrant-container {
  @apply bg-white rounded-lg p-6 shadow-sm border border-gray-200;
}

.chart-wrapper {
  @apply flex justify-center items-center relative;
}

.chart-header h3 {
  @apply text-gray-800;
}

.position-analysis {
  @apply bg-gray-50 rounded-lg p-4;
}

.analysis-section h4,
.distance-analysis h4 {
  @apply text-gray-800;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .chart-wrapper {
    min-height: 280px;
  }
  
  .echarts-quadrant-container {
    padding: 1rem;
  }
  
  .position-analysis {
    padding: 0.75rem;
    margin-top: 1rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .chart-wrapper {
    min-height: 380px;
  }
}

@media (max-width: 768px) {
  .chart-wrapper {
    /* 保留原有的样式作为退路 */
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

.echarts-quadrant-container {
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