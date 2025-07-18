<template>
  <button :class="buttonClasses" :disabled="disabled || loading" :type="type" @click="handleClick">
    <!-- 加载状态图标 -->
    <div v-if="loading" class="button-loading">
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
          stroke-dasharray="32"
          stroke-dashoffset="32"
          opacity="0.3"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
          stroke-dasharray="32"
          stroke-dashoffset="24"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- 左侧图标 -->
    <i v-if="icon && iconPosition === 'left' && !loading" :class="iconClasses" />

    <!-- 按钮内容 -->
    <span v-if="$slots.default" :class="contentClasses">
      <slot />
    </span>

    <!-- 右侧图标 -->
    <i v-if="icon && iconPosition === 'right' && !loading" :class="iconClasses" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonVariant, ButtonSize } from '@/types'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  type?: 'button' | 'submit' | 'reset'
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  iconPosition: 'left',
  type: 'button'
})

const emit = defineEmits<Emits>()

// 计算按钮样式类
const buttonClasses = computed(() => {
  const classes = [
    'button-base',
    `button-${props.variant}`,
    `button-${props.size}`,
    {
      'button-block': props.block,
      'button-loading': props.loading,
      'button-disabled': props.disabled,
      'button-icon-only': props.icon && !$slots.default
    }
  ]
  return classes
})

// 计算图标样式类
const iconClasses = computed(() => [
  props.icon,
  'button-icon',
  {
    'button-icon-left': props.iconPosition === 'left',
    'button-icon-right': props.iconPosition === 'right'
  }
])

// 计算内容样式类
const contentClasses = computed(() => ({
  'button-content': true,
  'button-content-with-icon': !!props.icon
}))

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* 基础按钮样式 */
.button-base {
  @apply relative inline-flex items-center justify-center;
  @apply font-medium text-center whitespace-nowrap;
  @apply border border-transparent;
  @apply transition-all duration-200 ease-in-out;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply select-none;

  /* 使用设计系统变量 */
  border-radius: var(--radius-md);
  font-family: var(--font-family-sans);
}

/* 尺寸变体 */
.button-xs {
  @apply text-xs px-2 py-1;
  height: 1.5rem; /* 24px */
  min-width: 1.5rem;
}

.button-sm {
  @apply text-sm px-3 py-1.5;
  height: var(--button-height-sm);
  min-width: var(--button-height-sm);
  padding-left: var(--button-padding-x-sm);
  padding-right: var(--button-padding-x-sm);
}

.button-md {
  @apply text-base px-4 py-2;
  height: var(--button-height-md);
  min-width: var(--button-height-md);
  padding-left: var(--button-padding-x-md);
  padding-right: var(--button-padding-x-md);
}

.button-lg {
  @apply text-lg px-6 py-3;
  height: var(--button-height-lg);
  min-width: var(--button-height-lg);
  padding-left: var(--button-padding-x-lg);
  padding-right: var(--button-padding-x-lg);
}

.button-xl {
  @apply text-xl px-8 py-4;
  height: 3.5rem; /* 56px */
  min-width: 3.5rem;
}

/* 颜色变体 */
.button-primary {
  background: var(--gradient-primary);
  @apply text-white;
  @apply hover:opacity-90 focus:ring-primary-500;
  @apply active:scale-95;
}

.button-secondary {
  @apply bg-gray-100 text-gray-900 border-gray-300;
  @apply hover:bg-gray-200 focus:ring-gray-500;
  @apply active:scale-95;
}

.button-success {
  @apply bg-green-600 text-white;
  @apply hover:bg-green-700 focus:ring-green-500;
  @apply active:scale-95;
}

.button-warning {
  @apply bg-yellow-500 text-white;
  @apply hover:bg-yellow-600 focus:ring-yellow-500;
  @apply active:scale-95;
}

.button-danger {
  @apply bg-red-600 text-white;
  @apply hover:bg-red-700 focus:ring-red-500;
  @apply active:scale-95;
}

.button-ghost {
  @apply bg-transparent text-gray-700 border-gray-300;
  @apply hover:bg-gray-50 focus:ring-gray-500;
}

.button-link {
  @apply bg-transparent text-primary-600 border-transparent;
  @apply hover:text-primary-700 hover:underline;
  @apply focus:ring-primary-500;
  @apply p-0 h-auto min-w-0;
}

/* 块级按钮 */
.button-block {
  @apply w-full;
}

/* 加载状态 */
.button-loading {
  @apply cursor-wait;
}

.button-loading .button-content {
  @apply opacity-70;
}

/* 图标样式 */
.button-icon {
  @apply flex-shrink-0;
}

.button-icon-left {
  @apply mr-2;
}

.button-icon-right {
  @apply ml-2;
}

.button-icon-only .button-icon {
  @apply m-0;
}

/* 加载动画 */
.button-loading {
  @apply gap-2;
}

/* 禁用状态 */
.button-disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply hover:opacity-50 active:scale-100;
}

/* 暗色主题适配 */
[data-theme='dark'] .button-secondary {
  @apply bg-gray-700 text-gray-100 border-gray-600;
  @apply hover:bg-gray-600;
}

[data-theme='dark'] .button-ghost {
  @apply text-gray-300 border-gray-600;
  @apply hover:bg-gray-800;
}

[data-theme='dark'] .button-link {
  @apply text-primary-400;
  @apply hover:text-primary-300;
}
</style>
