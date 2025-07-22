<template>
  <div
    class="recommendation-card bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
    :class="{ 'transform hover:scale-105': !isStatic }"
  >
    <!-- 卡片头部 -->
    <div class="p-4 text-white" :class="headerBgClass">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ recommendation.title }}</h3>
        <div class="px-2 py-1 rounded-full text-xs font-medium" :class="priorityClass">
          {{ priorityLabel }}
        </div>
      </div>
      <div class="mt-1 text-sm opacity-90">{{ categoryLabel }}</div>
    </div>

    <!-- 卡片内容 -->
    <div class="p-6">
      <p class="text-gray-600 mb-4">{{ recommendation.description }}</p>

      <!-- 行动项目 -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-2">行动建议：</h4>
        <ul class="space-y-2">
          <li
            v-for="(item, index) in recommendation.actionItems"
            :key="index"
            class="flex items-start"
          >
            <div
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5"
              :class="actionItemBgClass"
            >
              <span class="text-xs font-medium text-white">{{ index + 1 }}</span>
            </div>
            <span class="text-gray-600">{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- 资源列表 -->
      <div v-if="recommendation.resources && recommendation.resources.length > 0">
        <h4 class="text-sm font-semibold text-gray-700 mb-2">推荐资源：</h4>
        <div class="space-y-2">
          <div
            v-for="(resource, index) in recommendation.resources"
            :key="index"
            class="bg-gray-50 rounded-lg p-3"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 mr-3">
                <i :class="resourceIcon(resource.type)" class="text-gray-500"></i>
              </div>
              <div>
                <h5 class="text-sm font-medium text-gray-800">{{ resource.title }}</h5>
                <p v-if="resource.author" class="text-xs text-gray-500">{{ resource.author }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ resource.description }}</p>
                <a
                  v-if="resource.url"
                  :href="resource.url"
                  target="_blank"
                  class="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  查看资源 <i class="fas fa-external-link-alt ml-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片底部 -->
    <div v-if="showActions" class="px-6 py-4 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <button
          @click="toggleSaved"
          class="flex items-center space-x-1 px-3 py-1 text-sm rounded-full transition-colors"
          :class="
            isSaved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          <i :class="isSaved ? 'fas fa-bookmark' : 'far fa-bookmark'"></i>
          <span>{{ isSaved ? '已保存' : '保存' }}</span>
        </button>

        <button
          @click="shareRecommendation"
          class="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
        >
          <i class="fas fa-share"></i>
          <span>分享</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReportRecommendation, ReportResource } from '@/types'

interface Props {
  recommendation: ReportRecommendation
  showActions?: boolean
  isStatic?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  isStatic: false
})

const emit = defineEmits<{
  save: [recommendationId: string, saved: boolean]
  share: [recommendation: ReportRecommendation]
}>()

const isSaved = ref(false)

const headerBgClass = computed(() => {
  switch (props.recommendation.category) {
    case 'immediate':
      return 'bg-gradient-to-r from-red-500 to-red-600'
    case 'short_term':
      return 'bg-gradient-to-r from-blue-500 to-blue-600'
    case 'long_term':
      return 'bg-gradient-to-r from-green-500 to-green-600'
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600'
  }
})

const actionItemBgClass = computed(() => {
  switch (props.recommendation.category) {
    case 'immediate':
      return 'bg-red-500'
    case 'short_term':
      return 'bg-blue-500'
    case 'long_term':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
})

const priorityClass = computed(() => {
  switch (props.recommendation.priority) {
    case 'high':
      return 'bg-red-100 text-red-600'
    case 'medium':
      return 'bg-yellow-100 text-yellow-600'
    case 'low':
      return 'bg-green-100 text-green-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
})

const priorityLabel = computed(() => {
  switch (props.recommendation.priority) {
    case 'high':
      return '高优先级'
    case 'medium':
      return '中优先级'
    case 'low':
      return '低优先级'
    default:
      return '普通'
  }
})

const categoryLabel = computed(() => {
  switch (props.recommendation.category) {
    case 'immediate':
      return '立即行动'
    case 'short_term':
      return '短期目标'
    case 'long_term':
      return '长期发展'
    default:
      return '一般建议'
  }
})

const resourceIcon = (type: ReportResource['type']) => {
  switch (type) {
    case 'book':
      return 'fas fa-book'
    case 'article':
      return 'fas fa-file-alt'
    case 'video':
      return 'fas fa-video'
    case 'exercise':
      return 'fas fa-dumbbell'
    case 'app':
      return 'fas fa-mobile-alt'
    default:
      return 'fas fa-link'
  }
}

const toggleSaved = () => {
  isSaved.value = !isSaved.value
  emit('save', props.recommendation.id, isSaved.value)
}

const shareRecommendation = () => {
  emit('share', props.recommendation)
}
</script>

<style scoped>
.recommendation-card {
  @apply relative;
}

.recommendation-card::before {
  content: '';
  @apply absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05));
}

.recommendation-card:hover::before {
  @apply opacity-100;
}
</style>
