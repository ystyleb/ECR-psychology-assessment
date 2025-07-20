<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- 卡片头部 -->
    <div v-if="$slots.header || title || subtitle" class="card-header">
      <slot name="header">
        <div v-if="title || subtitle" class="card-header-content">
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
      </slot>

      <!-- 头部操作区 -->
      <div v-if="$slots.actions" class="card-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- 卡片内容 -->
    <div v-if="$slots.default" class="card-body" :class="bodyClasses">
      <slot />
    </div>

    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>

    <!-- 加载遮罩 -->
    <div v-if="loading" class="card-loading">
      <div class="card-loading-spinner">
        <svg class="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  bordered?: boolean
  hoverable?: boolean
  loading?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  hoverable: false,
  loading: false,
  shadow: 'md',
  padding: 'md',
  clickable: false
})

const emit = defineEmits<Emits>()

// 计算卡片样式类
const cardClasses = computed(() => [
  'card-base',
  {
    'card-bordered': props.bordered,
    'card-hoverable': props.hoverable,
    'card-clickable': props.clickable,
    'card-loading': props.loading,
    [`card-shadow-${props.shadow}`]: props.shadow !== 'none'
  }
])

// 计算内容区样式类
const bodyClasses = computed(() => [
  {
    [`card-padding-${props.padding}`]: props.padding !== 'none'
  }
])

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* 基础卡片样式 */
.card-base {
  @apply relative bg-white overflow-hidden;
  @apply transition-all duration-200 ease-in-out;
  border-radius: var(--radius-lg);
  background-color: var(--bg-primary);
}

/* 边框 */
.card-bordered {
  @apply border;
  border-color: var(--card-border-color);
  border-width: var(--card-border-width);
}

/* 阴影变体 */
.card-shadow-sm {
  box-shadow: var(--shadow-sm);
}

.card-shadow-md {
  box-shadow: var(--shadow-md);
}

.card-shadow-lg {
  box-shadow: var(--shadow-lg);
}

.card-shadow-xl {
  box-shadow: var(--shadow-xl);
}

/* 悬停效果 */
.card-hoverable:hover {
  @apply transform -translate-y-1;
  box-shadow: var(--shadow-lg);
}

/* 可点击 */
.card-clickable {
  @apply cursor-pointer;
}

.card-clickable:hover {
  @apply transform -translate-y-0.5;
}

.card-clickable:active {
  @apply transform translate-y-0;
}

/* 卡片头部 */
.card-header {
  @apply flex items-start justify-between;
  @apply border-b;
  padding: var(--card-padding);
  border-color: var(--border-primary);
}

.card-header-content {
  @apply flex-1;
}

.card-title {
  @apply text-lg font-semibold mb-1;
  color: var(--text-primary);
}

.card-subtitle {
  @apply text-sm;
  color: var(--text-secondary);
}

.card-actions {
  @apply flex items-center gap-2 ml-4;
}

/* 卡片内容 */
.card-body {
  @apply relative;
}

.card-padding-sm {
  padding: var(--spacing-3);
}

.card-padding-md {
  padding: var(--card-padding);
}

.card-padding-lg {
  padding: var(--spacing-8);
}

/* 卡片底部 */
.card-footer {
  @apply border-t;
  padding: var(--card-padding);
  border-color: var(--border-primary);
  background-color: var(--bg-secondary);
}

/* 加载状态 */
.card-loading {
  @apply absolute inset-0 flex items-center justify-center;
  @apply bg-white bg-opacity-75;
  backdrop-filter: blur(2px);
  z-index: 10;
}

.card-loading-spinner {
  @apply text-primary-500;
}

/* 暗色主题适配 */
[data-theme='dark'] .card-base {
  background-color: var(--bg-secondary);
}

[data-theme='dark'] .card-footer {
  background-color: var(--bg-tertiary);
}

[data-theme='dark'] .card-loading {
  @apply bg-gray-800 bg-opacity-75;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .card-header {
    @apply flex-col items-start gap-3;
  }

  .card-actions {
    @apply ml-0 w-full justify-end;
  }
}

/* 特殊卡片变体 */
.card-gradient {
  background: var(--gradient-primary);
  @apply text-white;
}

.card-gradient .card-title,
.card-gradient .card-subtitle {
  @apply text-white;
}

.card-gradient .card-header,
.card-gradient .card-footer {
  @apply border-white border-opacity-20;
}

/* 卡片组合样式 */
.card-group {
  @apply grid gap-6;
}

.card-group-1 {
  @apply grid-cols-1;
}

.card-group-2 {
  @apply grid-cols-1 md:grid-cols-2;
}

.card-group-3 {
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

.card-group-4 {
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-4;
}

/* 卡片内的特殊元素 */
.card-image {
  @apply w-full h-48 object-cover;
}

.card-avatar {
  @apply w-12 h-12 rounded-full object-cover;
}

.card-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  @apply bg-primary-100 text-primary-800;
}

.card-divider {
  @apply border-t my-4;
  border-color: var(--border-primary);
}

/* 卡片状态变体 */
.card-success {
  @apply border-green-200 bg-green-50;
}

.card-warning {
  @apply border-yellow-200 bg-yellow-50;
}

.card-error {
  @apply border-red-200 bg-red-50;
}

.card-info {
  @apply border-blue-200 bg-blue-50;
}

[data-theme='dark'] .card-success {
  @apply border-green-800 bg-green-900 bg-opacity-20;
}

[data-theme='dark'] .card-warning {
  @apply border-yellow-800 bg-yellow-900 bg-opacity-20;
}

[data-theme='dark'] .card-error {
  @apply border-red-800 bg-red-900 bg-opacity-20;
}

[data-theme='dark'] .card-info {
  @apply border-blue-800 bg-blue-900 bg-opacity-20;
}
</style>
