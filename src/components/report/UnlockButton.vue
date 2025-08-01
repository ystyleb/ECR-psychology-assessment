<template>
  <div
    class="unlock-section bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
  >
    <!-- 标题 -->
    <div class="text-center mb-6">
      <div
        class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <i class="fas fa-lock text-white text-2xl"></i>
      </div>
      <h3 class="text-2xl font-bold text-gray-800 mb-2">解锁详细报告</h3>
      <p class="text-gray-600">获取完整的依恋风格分析和个性化建议</p>
    </div>

    <!-- 功能特性 -->
    <div class="grid md:grid-cols-2 gap-4 mb-6">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          :class="feature.bgColor"
        >
          <i :class="[feature.icon, feature.textColor]"></i>
        </div>
        <div>
          <h4 class="font-medium text-gray-800 text-sm">{{ feature.title }}</h4>
          <p class="text-xs text-gray-600 mt-1">{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <!-- 价格信息 -->
    <div class="text-center mb-6">
      <div class="flex items-center justify-center space-x-3 mb-2">
        <span class="text-3xl font-bold text-gray-800">¥{{ currentPrice }}</span>
        <span v-if="originalPrice > currentPrice" class="text-lg text-gray-500 line-through">
          ¥{{ originalPrice }}
        </span>
        <span
          v-if="originalPrice > currentPrice"
          class="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium"
        >
          {{ discountText }}
        </span>
      </div>
      <p class="text-sm text-gray-600">一次购买，永久访问</p>
    </div>

    <!-- 安全保障 -->
    <div class="bg-green-50 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-center space-x-6 text-sm text-green-700">
        <div class="flex items-center space-x-1">
          <i class="fas fa-shield-alt"></i>
          <span>安全支付</span>
        </div>
        <div class="flex items-center space-x-1">
          <i class="fas fa-lock"></i>
          <span>隐私保护</span>
        </div>
        <div class="flex items-center space-x-1">
          <i class="fas fa-infinity"></i>
          <span>永久访问</span>
        </div>
      </div>
    </div>

    <!-- 主要按钮 -->
    <div class="space-y-3">
      <button
        @click="handleUnlock"
        :disabled="isProcessing || isUnlocked"
        class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        :class="{
          'animate-pulse': isProcessing,
          'bg-green-600 hover:bg-green-700': isUnlocked
        }"
      >
        <div v-if="isProcessing" class="flex items-center justify-center space-x-2">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>处理中...</span>
        </div>
        <div v-else-if="isUnlocked" class="flex items-center justify-center space-x-2">
          <i class="fas fa-check-circle"></i>
          <span>已解锁</span>
        </div>
        <div v-else class="flex items-center justify-center space-x-2">
          <i class="fas fa-unlock"></i>
          <span>立即解锁详细报告</span>
        </div>
      </button>

      <!-- 辅助按钮 -->
      <div class="flex space-x-2">
        <button
          v-if="!isUnlocked"
          @click="$emit('preview')"
          class="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <i class="fas fa-eye mr-2"></i>
          预览详细报告
        </button>

        <button
          @click="$emit('share')"
          class="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <i class="fas fa-share-alt mr-2"></i>
          分享基础报告
        </button>
      </div>
    </div>

    <!-- 常见问题 -->
    <div v-if="showFAQ" class="mt-6 pt-6 border-t border-gray-200">
      <button
        @click="toggleFAQ"
        class="w-full flex items-center justify-between text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span>常见问题</span>
        <i
          :class="['fas transition-transform', faqExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"
        ></i>
      </button>

      <div v-if="faqExpanded" class="mt-3 space-y-3 text-sm text-gray-600">
        <div>
          <p class="font-medium text-gray-700 mb-1">Q: 详细报告包含什么内容？</p>
          <p>A: 包含深度的个性分析、关系模式解读、成长建议、兼容性分析等专业内容。</p>
        </div>
        <div>
          <p class="font-medium text-gray-700 mb-1">Q: 支付安全吗？</p>
          <p>A: 我们使用Stripe安全支付系统，您的支付信息完全加密保护。</p>
        </div>
        <div>
          <p class="font-medium text-gray-700 mb-1">Q: 可以重复查看吗？</p>
          <p>A: 是的，一次购买后您可以随时查看和下载您的详细报告。</p>
        </div>
      </div>
    </div>

    <!-- 限时优惠倒计时 -->
    <div
      v-if="showCountdown && timeLeft > 0"
      class="mt-4 p-3 bg-red-50 rounded-lg border border-red-200"
    >
      <div class="text-center">
        <p class="text-sm font-medium text-red-700 mb-2">限时优惠还剩：</p>
        <div class="flex justify-center space-x-2 text-red-600">
          <div class="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
            {{ Math.floor(timeLeft / 3600) }}
          </div>
          <span class="font-bold">:</span>
          <div class="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
            {{ Math.floor((timeLeft % 3600) / 60) }}
          </div>
          <span class="font-bold">:</span>
          <div class="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
            {{ timeLeft % 60 }}
          </div>
        </div>
        <p class="text-xs text-red-600 mt-1">小时 : 分钟 : 秒</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Feature {
  icon: string
  title: string
  description: string
  bgColor: string
  textColor: string
}

interface Props {
  assessmentId: string
  isUnlocked?: boolean
  isProcessing?: boolean
  originalPrice?: number
  currentPrice?: number
  showFAQ?: boolean
  showCountdown?: boolean
  countdownHours?: number
}

interface Emits {
  (e: 'unlock'): void
  (e: 'preview'): void
  (e: 'share'): void
}

const props = withDefaults(defineProps<Props>(), {
  isUnlocked: false,
  isProcessing: false,
  originalPrice: 39.9,
  currentPrice: 19.9,
  showFAQ: true,
  showCountdown: true,
  countdownHours: 24
})

const emit = defineEmits<Emits>()

// 响应式状态
const faqExpanded = ref(false)
const timeLeft = ref(props.countdownHours * 3600) // 转换为秒
let countdownTimer: number | null = null

// 功能特性
const features: Feature[] = [
  {
    icon: 'fas fa-chart-pie',
    title: '专业可视化图表',
    description: '雷达图、柱状图等多维度数据展示',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600'
  },
  {
    icon: 'fas fa-lightbulb',
    title: '个性化改善建议',
    description: '基于您的依恋类型定制的成长方案',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600'
  },
  {
    icon: 'fas fa-heart',
    title: '关系发展指导',
    description: '深入的关系模式分析和兼容性建议',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600'
  },
  {
    icon: 'fas fa-download',
    title: 'PDF报告下载',
    description: '支持下载保存，随时查看分享',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600'
  }
]

// 计算属性
const discountText = computed(() => {
  const discount = Math.round(
    ((props.originalPrice - props.currentPrice) / props.originalPrice) * 10
  )
  return `${discount}折优惠`
})

// 生命周期
onMounted(() => {
  if (props.showCountdown && timeLeft.value > 0) {
    startCountdown()
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

// 方法
const handleUnlock = () => {
  if (!props.isProcessing && !props.isUnlocked) {
    emit('unlock')
  }
}

const toggleFAQ = () => {
  faqExpanded.value = !faqExpanded.value
}

const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
    }
  }, 1000)
}
</script>

<style scoped>
.unlock-section {
  position: relative;
  overflow: hidden;
}

.unlock-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* 按钮悬停效果 */
.unlock-section button:hover {
  transform: translateY(-1px);
}

/* 特性卡片动画 */
.unlock-section .grid > div {
  transition: all 0.3s ease;
}

.unlock-section .grid > div:hover {
  transform: translateY(-2px);
}
</style>
