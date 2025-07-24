<template>
  <div class="insight-card">
    <div class="card-header">
      <div class="header-icon">
        <component :is="iconComponent" class="w-6 h-6" />
      </div>
      <div class="header-content">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="showToggle" class="header-toggle">
        <button 
          @click="toggleExpanded"
          class="toggle-btn"
          :aria-label="isExpanded ? '收起' : '展开'"
        >
          <svg 
            class="w-5 h-5 transform transition-transform duration-200"
            :class="{ 'rotate-180': isExpanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>
    </div>

    <transition name="expand" @enter="onEnter" @leave="onLeave">
      <div v-show="isExpanded" class="card-content">
        <!-- 主要洞察内容 -->
        <div v-if="insight" class="insight-main">
          <div class="insight-text">{{ insight }}</div>
          <div v-if="confidence" class="confidence-indicator">
            <span class="confidence-label">可信度：</span>
            <div class="confidence-bar">
              <div 
                class="confidence-fill"
                :style="{ width: `${confidence}%` }"
                :class="getConfidenceClass(confidence)"
              ></div>
            </div>
            <span class="confidence-value">{{ confidence }}%</span>
          </div>
        </div>

        <!-- 特质列表 -->
        <div v-if="traits && traits.length > 0" class="traits-section">
          <h4 class="section-title">{{ traitsTitle || '主要特质' }}</h4>
          <div class="traits-grid">
            <div 
              v-for="(trait, index) in traits" 
              :key="index"
              class="trait-item"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="trait-indicator"></div>
              <span class="trait-text">{{ trait }}</span>
            </div>
          </div>
        </div>

        <!-- 关系模式 -->
        <div v-if="patterns && patterns.length > 0" class="patterns-section">
          <h4 class="section-title">{{ patternsTitle || '关系模式' }}</h4>
          <div class="patterns-list">
            <div 
              v-for="(pattern, index) in patterns" 
              :key="index"
              class="pattern-item"
            >
              <div class="pattern-icon">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="pattern-text">{{ pattern }}</span>
            </div>
          </div>
        </div>

        <!-- 建议或补充信息 -->
        <div v-if="suggestions && suggestions.length > 0" class="suggestions-section">
          <h4 class="section-title">{{ suggestionsTitle || '相关建议' }}</h4>
          <div class="suggestions-list">
            <div 
              v-for="(suggestion, index) in suggestions" 
              :key="index"
              class="suggestion-item"
            >
              <div class="suggestion-number">{{ index + 1 }}</div>
              <p class="suggestion-text">{{ suggestion }}</p>
            </div>
          </div>
        </div>

        <!-- 数据可视化 -->
        <div v-if="showChart && chartData" class="chart-section">
          <div class="chart-container">
            <canvas ref="chartCanvas" width="300" height="150"></canvas>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="showActions" class="card-actions">
          <button 
            v-if="showShareButton"
            @click="handleShare"
            class="action-btn secondary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
            </svg>
            分享洞察
          </button>
          <button 
            v-if="showSaveButton"
            @click="handleSave"
            class="action-btn primary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            保存
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

// 注册Chart.js组件
Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

interface Props {
  title: string
  subtitle?: string
  insight: string
  confidence?: number
  traits?: string[]
  patterns?: string[]
  suggestions?: string[]
  traitsTitle?: string
  patternsTitle?: string
  suggestionsTitle?: string
  iconType?: 'psychology' | 'relationship' | 'growth' | 'compatibility'
  variant?: 'default' | 'success' | 'warning' | 'info'
  showToggle?: boolean
  defaultExpanded?: boolean
  showChart?: boolean
  chartData?: any
  showActions?: boolean
  showShareButton?: boolean
  showSaveButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconType: 'psychology',
  variant: 'default',
  showToggle: true,
  defaultExpanded: false,
  showChart: false,
  showActions: false,
  showShareButton: false,
  showSaveButton: false
})

// 响应式状态
const isExpanded = ref(props.defaultExpanded)
const chartCanvas = ref<HTMLCanvasElement>()
const chartInstance = ref<Chart | null>(null)

// 计算属性
const iconComponent = computed(() => {
  const icons = {
    psychology: 'PsychologyIcon',
    relationship: 'RelationshipIcon', 
    growth: 'GrowthIcon',
    compatibility: 'CompatibilityIcon'
  }
  return icons[props.iconType] || 'PsychologyIcon'
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  
  if (isExpanded.value && props.showChart && props.chartData) {
    nextTick(() => {
      createChart()
    })
  }
}

const getConfidenceClass = (confidence: number) => {
  if (confidence >= 80) return 'high-confidence'
  if (confidence >= 60) return 'medium-confidence'
  return 'low-confidence'
}

const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = 'auto'
  const height = element.offsetHeight
  element.style.height = '0'
  element.offsetHeight // 强制重排
  element.style.height = height + 'px'
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = element.offsetHeight + 'px'
  element.offsetHeight // 强制重排
  element.style.height = '0'
}

const createChart = () => {
  if (!chartCanvas.value || !props.chartData) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // 销毁现有图表
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  // 创建新图表
  chartInstance.value = new Chart(ctx, {
    type: 'doughnut',
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 10 },
            padding: 10
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          cornerRadius: 6
        }
      }
    }
  })
}

const handleShare = () => {
  // 实现分享逻辑
  if (navigator.share) {
    navigator.share({
      title: props.title,
      text: props.insight,
      url: window.location.href
    })
  } else {
    // 降级处理：复制到剪贴板
    navigator.clipboard?.writeText(`${props.title}: ${props.insight}`)
  }
}

const handleSave = () => {
  // 实现保存逻辑
  const data = {
    title: props.title,
    insight: props.insight,
    traits: props.traits,
    patterns: props.patterns,
    suggestions: props.suggestions,
    savedAt: new Date().toISOString()
  }
  
  const saved = localStorage.getItem('saved_insights') || '[]'
  const savedInsights = JSON.parse(saved)
  savedInsights.push(data)
  localStorage.setItem('saved_insights', JSON.stringify(savedInsights))
}

// 生命周期
onMounted(() => {
  if (isExpanded.value && props.showChart && props.chartData) {
    nextTick(() => {
      createChart()
    })
  }
})
</script>

<style scoped>
.insight-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
  transition: all 0.3s ease;
}

.insight-card:hover {
  @apply shadow-md;
  transform: translateY(-2px);
}

.card-header {
  @apply flex items-center justify-between p-4 bg-gradient-to-r;
}

.card-header.default {
  @apply from-blue-50 to-indigo-50;
}

.card-header.success {
  @apply from-green-50 to-emerald-50;
}

.card-header.warning {
  @apply from-yellow-50 to-orange-50;
}

.card-header.info {
  @apply from-purple-50 to-pink-50;
}

.header-icon {
  @apply flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-3;
}

.header-icon svg {
  @apply text-blue-600;
}

.header-content {
  @apply flex-1;
}

.card-title {
  @apply text-lg font-semibold text-gray-800 mb-1;
}

.card-subtitle {
  @apply text-sm text-gray-600;
}

.toggle-btn {
  @apply p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors;
}

.card-content {
  @apply overflow-hidden;
}

.expand-enter-active,
.expand-leave-active {
  transition: height 0.3s ease;
}

.insight-main {
  @apply p-4 border-b border-gray-100;
}

.insight-text {
  @apply text-gray-800 leading-relaxed mb-4;
}

.confidence-indicator {
  @apply flex items-center space-x-3;
}

.confidence-label {
  @apply text-sm font-medium text-gray-600;
}

.confidence-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.confidence-fill {
  @apply h-full rounded-full transition-all duration-500;
}

.confidence-fill.high-confidence {
  @apply bg-green-500;
}

.confidence-fill.medium-confidence {
  @apply bg-yellow-500;
}

.confidence-fill.low-confidence {
  @apply bg-red-500;
}

.confidence-value {
  @apply text-sm font-semibold text-gray-700;
}

.section-title {
  @apply text-sm font-semibold text-gray-800 mb-3;
}

.traits-section,
.patterns-section,
.suggestions-section {
  @apply p-4 border-b border-gray-100;
}

.traits-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-2;
}

.trait-item {
  @apply flex items-center p-2 bg-gray-50 rounded-lg;
  animation: slideInUp 0.4s ease-out forwards;
}

.trait-indicator {
  @apply w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0;
}

.trait-text {
  @apply text-sm text-gray-700;
}

.patterns-list,
.suggestions-list {
  @apply space-y-3;
}

.pattern-item {
  @apply flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors;
}

.pattern-icon {
  @apply text-green-600 mr-3 mt-0.5;
}

.pattern-text {
  @apply text-sm text-gray-700 leading-relaxed;
}

.suggestion-item {
  @apply flex items-start;
}

.suggestion-number {
  @apply w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0;
}

.suggestion-text {
  @apply text-sm text-gray-700 leading-relaxed;
}

.chart-section {
  @apply p-4 border-b border-gray-100;
}

.chart-container {
  @apply flex justify-center;
  height: 150px;
}

.card-actions {
  @apply flex justify-end space-x-3 p-4 bg-gray-50;
}

.action-btn {
  @apply flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors;
}

.action-btn.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.action-btn.secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

/* 动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色主题 */
[data-theme='dark'] .insight-card {
  @apply bg-gray-800 border-gray-700;
}

[data-theme='dark'] .card-header {
  @apply from-gray-700 to-gray-800;
}

[data-theme='dark'] .card-title,
[data-theme='dark'] .insight-text,
[data-theme='dark'] .section-title {
  @apply text-gray-200;
}

[data-theme='dark'] .card-subtitle,
[data-theme='dark'] .trait-text,
[data-theme='dark'] .pattern-text,
[data-theme='dark'] .suggestion-text {
  @apply text-gray-400;
}

[data-theme='dark'] .trait-item {
  @apply bg-gray-700;
}

[data-theme='dark'] .pattern-item:hover {
  @apply bg-gray-700;
}

[data-theme='dark'] .card-actions {
  @apply bg-gray-700;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .traits-grid {
    @apply grid-cols-1;
  }
  
  .card-actions {
    @apply flex-col space-x-0 space-y-2;
  }
  
  .action-btn {
    @apply w-full justify-center;
  }
}
</style>