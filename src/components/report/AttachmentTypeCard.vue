<template>
  <div
    class="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
    :class="[
      'border-l-4',
      {
        'border-green-500': attachmentType === 'secure',
        'border-orange-500': attachmentType === 'anxious',
        'border-blue-500': attachmentType === 'avoidant',
        'border-purple-500': attachmentType === 'disorganized'
      }
    ]"
  >
    <!-- 头部 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          :style="{ backgroundColor: description.bgColor }"
        >
          {{ description.icon }}
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-800">{{ description.name }}</h3>
          <p class="text-sm text-gray-600">{{ description.shortDescription }}</p>
        </div>
      </div>

      <!-- 置信度指示器 -->
      <div v-if="showConfidence" class="text-right">
        <div class="text-sm text-gray-500 mb-1">匹配度</div>
        <div class="flex items-center space-x-2">
          <div class="w-16 bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-500"
              :class="{
                'bg-green-500': attachmentType === 'secure',
                'bg-orange-500': attachmentType === 'anxious',
                'bg-blue-500': attachmentType === 'avoidant',
                'bg-purple-500': attachmentType === 'disorganized'
              }"
              :style="{ width: `${confidence}%` }"
            ></div>
          </div>
          <span class="text-sm font-medium text-gray-700">{{ confidence }}%</span>
        </div>
      </div>
    </div>

    <!-- 描述 -->
    <div class="mb-6">
      <p class="text-gray-700 leading-relaxed">{{ description.description }}</p>
    </div>

    <!-- 特征列表 -->
    <div v-if="showCharacteristics" class="mb-6">
      <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fas fa-list-ul mr-2 text-gray-500"></i>
        主要特征
      </h4>
      <ul class="space-y-2">
        <li
          v-for="(characteristic, index) in displayedCharacteristics"
          :key="index"
          class="flex items-start space-x-2 text-sm text-gray-600"
        >
          <i class="fas fa-check-circle text-green-500 mt-0.5 flex-shrink-0"></i>
          <span>{{ characteristic }}</span>
        </li>
      </ul>

      <!-- 展开/收起按钮 -->
      <button
        v-if="description.characteristics.length > maxCharacteristics"
        @click="toggleExpanded"
        class="mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        {{ isExpanded ? '收起' : `查看全部 ${description.characteristics.length} 项特征` }}
        <i :class="['fas ml-1', isExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </button>
    </div>

    <!-- 优势和挑战 -->
    <div v-if="showStrengthsAndChallenges" class="grid md:grid-cols-2 gap-4 mb-6">
      <!-- 优势 -->
      <div>
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
          <i class="fas fa-star mr-2 text-yellow-500"></i>
          优势
        </h4>
        <ul class="space-y-1">
          <li
            v-for="(strength, index) in description.strengths.slice(0, 3)"
            :key="index"
            class="text-sm text-gray-600 flex items-start space-x-2"
          >
            <i class="fas fa-plus-circle text-green-500 mt-0.5 flex-shrink-0 text-xs"></i>
            <span>{{ strength }}</span>
          </li>
        </ul>
      </div>

      <!-- 挑战 -->
      <div>
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
          <i class="fas fa-exclamation-triangle mr-2 text-orange-500"></i>
          挑战
        </h4>
        <ul class="space-y-1">
          <li
            v-for="(challenge, index) in description.challenges.slice(0, 3)"
            :key="index"
            class="text-sm text-gray-600 flex items-start space-x-2"
          >
            <i class="fas fa-minus-circle text-orange-500 mt-0.5 flex-shrink-0 text-xs"></i>
            <span>{{ challenge }}</span>
          </li>
        </ul>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AttachmentStyle, AttachmentTypeDescription } from '@/types'

interface Props {
  attachmentType: AttachmentStyle
  description: AttachmentTypeDescription
  confidence?: number
  isUnlocked?: boolean
  showConfidence?: boolean
  showCharacteristics?: boolean
  showStrengthsAndChallenges?: boolean
  showActions?: boolean
  maxCharacteristics?: number
}

defineEmits<{
  (e: 'unlock-detailed'): void
  (e: 'view-detailed'): void
  (e: 'share'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  confidence: 85,
  isUnlocked: false,
  showConfidence: true,
  showCharacteristics: true,
  showStrengthsAndChallenges: true,
  showActions: true,
  maxCharacteristics: 4
})

// 响应式状态
const isExpanded = ref(false)

// 计算属性
const displayedCharacteristics = computed(() => {
  if (isExpanded.value) {
    return props.description.characteristics
  }
  return props.description.characteristics.slice(0, props.maxCharacteristics)
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
/* 自定义动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 渐变背景动画 */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.gradient-animate {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}
</style>
