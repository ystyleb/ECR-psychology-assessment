<template>
  <div class="basic-description bg-white rounded-2xl shadow-lg p-6">
    <!-- 标题 -->
    <div class="text-center mb-6">
      <h3 class="text-xl font-bold text-gray-800 mb-2">基础分析</h3>
      <p class="text-gray-600 text-sm">您的依恋风格基础特征</p>
    </div>

    <!-- 依恋类型概述 -->
    <div class="attachment-overview mb-6">
      <div class="flex items-center justify-center mb-4">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          :style="{ backgroundColor: description.bgColor }"
        >
          {{ description.icon }}
        </div>
      </div>

      <div class="text-center">
        <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ description.name }}</h4>
        <p class="text-gray-600 leading-relaxed">{{ description.shortDescription }}</p>
      </div>
    </div>

    <!-- 核心特征 -->
    <div class="core-characteristics mb-6">
      <h5 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fas fa-star mr-2 text-yellow-500"></i>
        核心特征
      </h5>
      <div class="grid gap-3">
        <div
          v-for="(characteristic, index) in displayedCharacteristics"
          :key="index"
          class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div
            class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <i class="fas fa-check text-blue-600 text-xs"></i>
          </div>
          <span class="text-gray-700 text-sm">{{ characteristic }}</span>
        </div>
      </div>

      <!-- 展开/收起按钮 -->
      <button
        v-if="description.characteristics.length > maxCharacteristics"
        @click="toggleExpanded"
        class="mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center"
      >
        <span>{{ isExpanded ? '收起' : `查看全部 ${description.characteristics.length} 项` }}</span>
        <i :class="['fas ml-1 text-xs', isExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </button>
    </div>

    <!-- 简要建议 -->
    <div class="basic-suggestions mb-6">
      <h5 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>
        基础建议
      </h5>
      <div class="space-y-2">
        <div
          v-for="(suggestion, index) in basicSuggestions"
          :key="index"
          class="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg"
        >
          <div
            class="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <i class="fas fa-arrow-up text-yellow-600 text-xs"></i>
          </div>
          <span class="text-gray-700 text-sm">{{ suggestion }}</span>
        </div>
      </div>
    </div>

    <!-- 关系提示 -->
    <div class="relationship-tips">
      <h5 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fas fa-heart mr-2 text-pink-500"></i>
        关系提示
      </h5>
      <div class="space-y-2">
        <div
          v-for="(tip, index) in relationshipTips"
          :key="index"
          class="flex items-start space-x-3 p-3 bg-pink-50 rounded-lg"
        >
          <div
            class="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <i class="fas fa-users text-pink-600 text-xs"></i>
          </div>
          <span class="text-gray-700 text-sm">{{ tip }}</span>
        </div>
      </div>
    </div>

    <!-- 解锁提示 -->
    <div
      v-if="showUnlockHint"
      class="unlock-hint mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
    >
      <div class="text-center">
        <i class="fas fa-lock text-blue-600 text-lg mb-2"></i>
        <p class="text-sm text-gray-700 mb-3">想要获得更深入的分析和个性化建议？</p>
        <button
          @click="$emit('unlock-detailed')"
          class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          解锁详细报告
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AttachmentTypeDescription, AttachmentStyle } from '@/types'

interface Props {
  description: AttachmentTypeDescription
  attachmentStyle: AttachmentStyle
  maxCharacteristics?: number
  showUnlockHint?: boolean
}

defineEmits<{
  (e: 'unlock-detailed'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  maxCharacteristics: 4,
  showUnlockHint: true
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

// 基础建议（从完整建议中选择前3个）
const basicSuggestions = computed(() => {
  const suggestions: Record<AttachmentStyle, string[]> = {
    secure: [
      '继续保持开放和诚实的沟通方式',
      '在关系中保持适度的独立性',
      '帮助伴侣建立更安全的依恋模式'
    ],
    anxious: [
      '学习情绪调节技巧，如深呼吸练习',
      '培养自我安抚的能力',
      '建立健康的个人兴趣和社交圈子'
    ],
    avoidant: [
      '练习情感表达，学会分享内心感受',
      '逐步增加与伴侣的情感连接',
      '认识到依赖他人不意味着失去独立性'
    ],
    disorganized: ['寻求专业心理咨询师的帮助', '学习情绪识别和调节技巧', '建立稳定的自我关怀习惯']
  }

  return suggestions[props.attachmentStyle] || []
})

// 关系提示
const relationshipTips = computed(() => {
  const tips: Record<AttachmentStyle, string[]> = {
    secure: ['与各种依恋类型都能建立良好关系', '在关系中起到稳定和支持的作用'],
    anxious: ['与安全型伴侣最为匹配', '需要伴侣提供更多的确认和支持'],
    avoidant: ['与安全型伴侣能够逐步建立信任', '需要伴侣给予足够的空间和耐心'],
    disorganized: ['最需要安全型伴侣提供稳定支持', '在关系中需要更多的耐心和理解']
  }

  return tips[props.attachmentStyle] || []
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
/* 悬停效果 */
.core-characteristics .flex:hover,
.basic-suggestions .flex:hover,
.relationship-tips .flex:hover {
  transform: translateX(2px);
}

/* 展开动画 */
.core-characteristics {
  transition: all 0.3s ease;
}

/* 解锁提示动画 */
.unlock-hint {
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
}

/* 图标动画 */
.fas {
  transition: transform 0.2s ease;
}

.flex:hover .fas {
  transform: scale(1.1);
}
</style>
