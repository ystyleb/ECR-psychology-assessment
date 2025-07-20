<template>
  <div class="progress-bar-container">
    <!-- 进度信息 -->
    <div class="progress-info flex justify-between items-center mb-3">
      <span class="progress-label text-sm font-medium text-gray-700">
        {{ label }}
      </span>
      <span class="progress-text text-sm font-medium text-gray-700">
        {{ current }}/{{ total }}
      </span>
    </div>

    <!-- 进度条 -->
    <div
      class="progress-track w-full bg-gray-200 rounded-full h-3 shadow-inner relative overflow-hidden"
    >
      <!-- 背景渐变 -->
      <div class="progress-bg absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200"></div>

      <!-- 进度填充 -->
      <div
        class="progress-fill h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
        :class="progressClasses"
        :style="{ width: `${percentage}%` }"
      >
        <!-- 进度条渐变 -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        <!-- 动画效果 -->
        <div
          v-if="animated"
          class="progress-shine absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-shine"
        ></div>
      </div>

      <!-- 里程碑标记 -->
      <div v-if="showMilestones" class="milestones absolute inset-0">
        <div
          v-for="milestone in milestones"
          :key="milestone.value"
          class="milestone absolute top-0 bottom-0 w-0.5 bg-white opacity-60"
          :style="{ left: `${(milestone.value / total) * 100}%` }"
          :title="milestone.label"
        ></div>
      </div>
    </div>

    <!-- 详细信息 -->
    <div class="progress-details flex justify-between text-xs text-gray-500 mt-2">
      <span class="progress-percentage">{{ percentage }}% 完成</span>
      <span v-if="estimatedTime" class="estimated-time"> 预计剩余 {{ estimatedTime }} </span>
    </div>

    <!-- 阶段指示器 -->
    <div v-if="showStages" class="stages mt-4">
      <div class="flex justify-between items-center">
        <div v-for="(stage, index) in stages" :key="index" class="stage flex-1 text-center">
          <div
            class="stage-indicator w-3 h-3 rounded-full mx-auto mb-1 transition-all duration-300"
            :class="getStageClasses(stage, index)"
          ></div>
          <div class="stage-label text-xs" :class="getStageTextClasses(stage, index)">
            {{ stage.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Milestone {
  value: number
  label: string
}

interface Stage {
  label: string
  threshold: number
  completed?: boolean
}

interface Props {
  current: number
  total: number
  label?: string
  animated?: boolean
  showMilestones?: boolean
  showStages?: boolean
  estimatedTime?: string
  milestones?: Milestone[]
  stages?: Stage[]
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  label: '测评进度',
  animated: true,
  showMilestones: false,
  showStages: false,
  color: 'blue',
  milestones: () => [],
  stages: () => [
    { label: '开始', threshold: 0 },
    { label: '进行中', threshold: 25 },
    { label: '接近完成', threshold: 75 },
    { label: '完成', threshold: 100 }
  ]
})

// 计算属性
const percentage = computed(() => {
  return Math.min(100, Math.max(0, Math.round((props.current / props.total) * 100)))
})

const progressClasses = computed(() => {
  const baseClasses = []

  // 颜色主题
  switch (props.color) {
    case 'green':
      baseClasses.push('from-green-500 to-green-600')
      break
    case 'purple':
      baseClasses.push('from-purple-500 to-purple-600')
      break
    case 'orange':
      baseClasses.push('from-orange-500 to-orange-600')
      break
    default:
      baseClasses.push('from-blue-500 to-purple-600')
  }

  // 进度状态
  if (percentage.value === 100) {
    baseClasses.push('progress-complete')
  } else if (percentage.value >= 75) {
    baseClasses.push('progress-near-complete')
  } else if (percentage.value >= 25) {
    baseClasses.push('progress-in-progress')
  } else {
    baseClasses.push('progress-started')
  }

  return baseClasses
})

// 方法
const getStageClasses = (stage: Stage, index: number) => {
  const currentPercentage = percentage.value

  if (currentPercentage >= stage.threshold) {
    return 'bg-green-500 shadow-lg'
  } else if (index === getCurrentStageIndex()) {
    return 'bg-blue-500 animate-pulse'
  } else {
    return 'bg-gray-300'
  }
}

const getStageTextClasses = (stage: Stage, index: number) => {
  const currentPercentage = percentage.value

  if (currentPercentage >= stage.threshold) {
    return 'text-green-600 font-medium'
  } else if (index === getCurrentStageIndex()) {
    return 'text-blue-600 font-medium'
  } else {
    return 'text-gray-500'
  }
}

const getCurrentStageIndex = () => {
  const currentPercentage = percentage.value

  for (let i = props.stages.length - 1; i >= 0; i--) {
    if (currentPercentage >= props.stages[i].threshold) {
      return Math.min(i + 1, props.stages.length - 1)
    }
  }

  return 0
}
</script>

<style scoped>
/* 进度条动画 */
.progress-fill {
  position: relative;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

/* 闪光动画 */
@keyframes shine {
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(200%) skewX(-12deg);
  }
}

.animate-shine {
  animation: shine 2s infinite;
}

/* 进度状态样式 */
.progress-started {
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.progress-in-progress {
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
}

.progress-near-complete {
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

.progress-complete {
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
  background: linear-gradient(90deg, #22c55e, #16a34a) !important;
}

/* 里程碑样式 */
.milestone {
  position: relative;
}

.milestone::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -1px;
  width: 3px;
  height: calc(100% + 4px);
  background: white;
  border-radius: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 阶段指示器动画 */
.stage-indicator {
  transition: all 0.3s ease;
}

.stage-indicator.bg-green-500 {
  animation: completePulse 0.5s ease-out;
}

@keyframes completePulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    transform: scale(1.2);
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .progress-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .progress-details {
    flex-direction: column;
    gap: 0.25rem;
  }

  .stages {
    margin-top: 0.75rem;
  }

  .stage-label {
    font-size: 0.625rem;
  }
}

/* 暗色主题适配 */
[data-theme='dark'] .progress-track {
  background-color: #374151;
}

[data-theme='dark'] .progress-bg {
  background: linear-gradient(to right, #374151, #4b5563);
}

[data-theme='dark'] .progress-label,
[data-theme='dark'] .progress-text {
  color: #f3f4f6;
}

[data-theme='dark'] .progress-details {
  color: #9ca3af;
}

[data-theme='dark'] .milestone::before {
  background: #6b7280;
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .progress-fill,
  .stage-indicator,
  .animate-shine {
    animation: none;
    transition: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .progress-track {
    border: 1px solid #000;
  }

  .progress-fill {
    border: 1px solid #000;
  }
}
</style>
