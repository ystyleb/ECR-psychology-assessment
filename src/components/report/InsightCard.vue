<template>
  <div
    class="insight-card bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
    :class="[importanceClass, { 'transform hover:scale-105': !isStatic }]"
  >
    <!-- 卡片头部 -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          :class="iconBgClass"
        >
          <i :class="[insight.icon, iconColorClass]"></i>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800">{{ insight.title }}</h3>
          <span class="inline-block px-2 py-1 text-xs rounded-full" :class="categoryClass">
            {{ categoryLabel }}
          </span>
        </div>
      </div>

      <!-- 重要性指示器 -->
      <div class="flex items-center space-x-1">
        <div
          v-for="i in 3"
          :key="i"
          class="w-2 h-2 rounded-full"
          :class="i <= importanceLevel ? 'bg-yellow-400' : 'bg-gray-200'"
        ></div>
      </div>
    </div>

    <!-- 内容 -->
    <div class="mb-4">
      <p class="text-gray-600 leading-relaxed">{{ insight.content }}</p>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showActions" class="flex items-center justify-between">
      <div class="flex space-x-2">
        <button
          @click="toggleBookmark"
          class="flex items-center space-x-1 px-3 py-1 text-sm rounded-full transition-colors"
          :class="
            isBookmarked
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          <i :class="isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'"></i>
          <span>{{ isBookmarked ? '已收藏' : '收藏' }}</span>
        </button>

        <button
          @click="shareInsight"
          class="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
        >
          <i class="fas fa-share"></i>
          <span>分享</span>
        </button>
      </div>

      <button
        v-if="hasDetails"
        @click="toggleDetails"
        class="text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        {{ showDetails ? '收起详情' : '查看详情' }}
        <i :class="showDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="ml-1"></i>
      </button>
    </div>

    <!-- 详细内容（可展开） -->
    <div v-if="hasDetails && showDetails" class="mt-4 pt-4 border-t border-gray-100">
      <div class="space-y-3">
        <div v-if="insight.examples" class="bg-gray-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-gray-700 mb-2">具体表现：</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li v-for="example in insight.examples" :key="example" class="flex items-start">
              <i class="fas fa-circle text-xs text-gray-400 mt-2 mr-2"></i>
              <span>{{ example }}</span>
            </li>
          </ul>
        </div>

        <div v-if="insight.suggestions" class="bg-blue-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-blue-700 mb-2">改善建议：</h4>
          <ul class="text-sm text-blue-600 space-y-1">
            <li
              v-for="suggestion in insight.suggestions"
              :key="suggestion"
              class="flex items-start"
            >
              <i class="fas fa-lightbulb text-xs text-blue-400 mt-2 mr-2"></i>
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
</style>
