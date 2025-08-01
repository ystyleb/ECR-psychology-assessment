<template>
  <div
    class="insight-card bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl"
    :class="[importanceClass, { 'transform hover:scale-105': !isStatic }]"
  >
    <!-- 卡片头部 -->
    <div class="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
      <div class="flex items-center space-x-3 flex-1">
        <div
          class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
          :class="iconBgClass"
        >
          <i :class="[insight.icon, iconColorClass]" class="text-sm sm:text-base"></i>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-base sm:text-lg font-semibold text-gray-800 truncate">{{ insight.title }}</h3>
          <span class="inline-block px-2 py-1 text-xs rounded-full mt-1" :class="categoryClass">
            {{ categoryLabel }}
          </span>
        </div>
      </div>

      <!-- 重要性指示器 -->
      <div class="flex items-center space-x-1 flex-shrink-0">
        <div
          v-for="i in 3"
          :key="i"
          class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
          :class="i <= importanceLevel ? 'bg-yellow-400' : 'bg-gray-200'"
        ></div>
      </div>
    </div>

    <!-- 内容 -->
    <div class="mb-3 sm:mb-4">
      <p class="text-sm sm:text-base text-gray-600 leading-relaxed">{{ insight.content }}</p>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showActions" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
      <div class="flex flex-wrap gap-2">
        <button
          @click="toggleBookmark"
          class="flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm rounded-full transition-colors min-h-[36px] touch-manipulation"
          :class="
            isBookmarked
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          <i :class="isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'" class="text-xs"></i>
          <span>{{ isBookmarked ? '已收藏' : '收藏' }}</span>
        </button>

        <button
          @click="shareInsight"
          class="flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors min-h-[36px] touch-manipulation"
        >
          <i class="fas fa-share text-xs"></i>
          <span>分享</span>
        </button>
      </div>

      <button
        v-if="hasDetails"
        @click="toggleDetails"
        class="text-xs sm:text-sm text-blue-600 hover:text-blue-700 transition-colors py-2 px-1 min-h-[36px] touch-manipulation flex items-center"
      >
        <span>{{ showDetails ? '收起详情' : '查看详情' }}</span>
        <i :class="showDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="ml-1 text-xs"></i>
      </button>
    </div>

    <!-- 详细内容（可展开） -->
    <div v-if="hasDetails && showDetails" class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
      <div class="space-y-3">
        <div v-if="insight.examples" class="bg-gray-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-gray-700 mb-2">具体表现：</h4>
          <ul class="text-xs sm:text-sm text-gray-600 space-y-1">
            <li v-for="example in insight.examples" :key="example" class="flex items-start leading-relaxed">
              <i class="fas fa-circle text-xs text-gray-400 mt-1.5 mr-2 flex-shrink-0"></i>
              <span>{{ example }}</span>
            </li>
          </ul>
        </div>

        <div v-if="insight.suggestions" class="bg-blue-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-blue-700 mb-2">改善建议：</h4>
          <ul class="text-xs sm:text-sm text-blue-600 space-y-1">
            <li
              v-for="suggestion in insight.suggestions"
              :key="suggestion"
              class="flex items-start leading-relaxed"
            >
              <i class="fas fa-lightbulb text-xs text-blue-400 mt-1.5 mr-2 flex-shrink-0"></i>
              <span>{{ suggestion }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReportInsight } from '@/types'

interface ExtendedInsight extends ReportInsight {
  examples?: string[]
  suggestions?: string[]
}

interface Props {
  insight: ExtendedInsight
  showActions?: boolean
  isStatic?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  isStatic: false
})

const emit = defineEmits<{
  bookmark: [insightId: string, bookmarked: boolean]
  share: [insight: ExtendedInsight]
  viewDetails: [insightId: string]
}>()

const isBookmarked = ref(false)
const showDetails = ref(false)

const hasDetails = computed(() => {
  return !!(props.insight.examples?.length || props.insight.suggestions?.length)
})

const importanceLevel = computed(() => {
  switch (props.insight.importance) {
    case 'high':
      return 3
    case 'medium':
      return 2
    case 'low':
      return 1
    default:
      return 1
  }
})

const importanceClass = computed(() => {
  switch (props.insight.importance) {
    case 'high':
      return 'border-l-4 border-red-400'
    case 'medium':
      return 'border-l-4 border-yellow-400'
    case 'low':
      return 'border-l-4 border-green-400'
    default:
      return 'border-l-4 border-gray-400'
  }
})

const categoryClass = computed(() => {
  switch (props.insight.category) {
    case 'personality':
      return 'bg-purple-100 text-purple-600'
    case 'relationship':
      return 'bg-pink-100 text-pink-600'
    case 'growth':
      return 'bg-green-100 text-green-600'
    case 'compatibility':
      return 'bg-blue-100 text-blue-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
})

const categoryLabel = computed(() => {
  switch (props.insight.category) {
    case 'personality':
      return '个性特征'
    case 'relationship':
      return '关系模式'
    case 'growth':
      return '成长建议'
    case 'compatibility':
      return '兼容性分析'
    default:
      return '其他'
  }
})

const iconBgClass = computed(() => {
  switch (props.insight.category) {
    case 'personality':
      return 'bg-purple-100'
    case 'relationship':
      return 'bg-pink-100'
    case 'growth':
      return 'bg-green-100'
    case 'compatibility':
      return 'bg-blue-100'
    default:
      return 'bg-gray-100'
  }
})

const iconColorClass = computed(() => {
  switch (props.insight.category) {
    case 'personality':
      return 'text-purple-600'
    case 'relationship':
      return 'text-pink-600'
    case 'growth':
      return 'text-green-600'
    case 'compatibility':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
})

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
  emit('bookmark', props.insight.id, isBookmarked.value)
}

const shareInsight = () => {
  emit('share', props.insight)
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
  if (showDetails.value) {
    emit('viewDetails', props.insight.id)
  }
}
</script>

<style scoped>
.insight-card {
  @apply relative;
}

.insight-card::before {
  content: '';
  @apply absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
}

.insight-card:hover::before {
  @apply opacity-100;
}

.insight-card > * {
  @apply relative z-10;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .insight-card {
    @apply shadow-md;
  }
  
  .insight-card:hover {
    @apply shadow-lg;
    transform: none; /* 移动端禁用hover缩放效果 */
  }
  
  /* 触摸友好性 */
  .touch-manipulation {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  
  /* 增大点击区域 */
  button {
    @apply relative;
  }
  
  button::before {
    content: '';
    @apply absolute inset-0;
    min-width: 44px;
    min-height: 44px;
    margin: -6px;
  }
}

/* 平板优化 */
@media (min-width: 641px) and (max-width: 1024px) {
  .insight-card {
    @apply p-5;
  }
}
</style>
