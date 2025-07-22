<template>
  <div class="toast-container-wrapper">
    <!-- 按位置分组显示Toast -->
    <div
      v-for="position in positions"
      :key="position"
      class="toast-position-container fixed z-50 pointer-events-none"
      :class="getPositionClass(position)"
    >
      <TransitionGroup :name="getTransitionName(position)" tag="div" class="space-y-2">
        <ToastNotification
          v-for="toast in getToastsByPosition(position)"
          :key="toast.id"
          :visible="toast.visible"
          :type="toast.type"
          :title="toast.title"
          :message="toast.message"
          :duration="toast.duration"
          :persistent="toast.persistent"
          :closable="toast.closable"
          :clickable="toast.clickable"
          :expandable="toast.expandable"
          :pause-on-hover="toast.pauseOnHover"
          :position="toast.position"
          :show-progress="toast.showProgress"
          :actions="toast.actions"
          @close="handleToastClose(toast.id)"
          @click="handleToastClick(toast)"
          @after-leave="handleToastAfterLeave(toast.id)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toastService } from '@/services/toastService'
import type { ToastPosition, Toast } from '@/services/toastService'
import ToastNotification from './ToastNotification.vue'

// 所有可能的位置
const positions: ToastPosition[] = [
  'top-right',
  'top-left',
  'top-center',
  'bottom-right',
  'bottom-left',
  'bottom-center'
]

// 计算属性
const allToasts = computed(() => toastService.getToasts())

// 方法
const getToastsByPosition = (position: ToastPosition): Toast[] => {
  return allToasts.value.filter(toast => toast.position === position)
}

const getPositionClass = (position: ToastPosition): string => {
  const classes = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }
  return classes[position]
}

const getTransitionName = (position: ToastPosition): string => {
  const isTop = position.includes('top')
  const isRight = position.includes('right')
  const isLeft = position.includes('left')

  if (isTop && isRight) return 'toast-slide-right'
  if (isTop && isLeft) return 'toast-slide-left'
  if (!isTop && isRight) return 'toast-slide-right'
  if (!isTop && isLeft) return 'toast-slide-left'
  return 'toast-fade'
}

const handleToastClose = (id: string) => {
  toastService.remove(id)
}

const handleToastClick = (toast: Toast) => {
  if (toast.onClick) {
    toast.onClick()
  }
}

const handleToastAfterLeave = (id: string) => {
  // Toast已经从DOM中移除，可以进行清理工作
  console.log(`Toast ${id} removed from DOM`)
}
</script>

<style scoped>
.toast-container-wrapper {
  @apply pointer-events-none;
}

.toast-position-container {
  @apply max-w-sm w-full;
}

/* 过渡动画 */
.toast-slide-right-enter-active,
.toast-slide-right-leave-active,
.toast-slide-right-move {
  transition: all 0.3s ease;
}

.toast-slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-left-enter-active,
.toast-slide-left-leave-active,
.toast-slide-left-move {
  transition: all 0.3s ease;
}

.toast-slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.toast-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.toast-fade-enter-active,
.toast-fade-leave-active,
.toast-fade-move {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .toast-position-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  /* 移动端时所有Toast都显示在顶部中央 */
  .toast-position-container.top-4.right-4,
  .toast-position-container.top-4.left-4,
  .toast-position-container.bottom-4.right-4,
  .toast-position-container.bottom-4.left-4,
  .toast-position-container.bottom-4 {
    top: 1rem;
    left: 1rem;
    right: 1rem;
    transform: none;
  }
}

/* 确保Toast在最高层级 */
.toast-position-container {
  z-index: 9999;
}
</style>
