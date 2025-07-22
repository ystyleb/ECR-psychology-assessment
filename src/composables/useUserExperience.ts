import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { debounce } from '@/utils/performance'

/**
 * 用户体验优化组合式函数
 * 提供常见的UX模式和交互优化
 */

/**
 * 加载状态管理
 */
export function useLoadingState() {
  const loading = ref(false)
  const loadingMessage = ref('')
  const progress = ref(0)

  const startLoading = (message = '加载中...') => {
    loading.value = true
    loadingMessage.value = message
    progress.value = 0
  }

  const updateProgress = (value: number, message?: string) => {
    progress.value = Math.max(0, Math.min(100, value))
    if (message) {
      loadingMessage.value = message
    }
  }

  const stopLoading = () => {
    loading.value = false
    loadingMessage.value = ''
    progress.value = 0
  }

  return {
    loading,
    loadingMessage,
    progress,
    startLoading,
    updateProgress,
    stopLoading
  }
}

/**
 * 错误处理
 */
export function useErrorHandling() {
  const error = ref<string | null>(null)
  const errorDetails = ref<string | null>(null)
  const retryCount = ref(0)
  const maxRetries = ref(3)

  const setError = (message: string, details?: string) => {
    error.value = message
    errorDetails.value = details || null
  }

  const clearError = () => {
    error.value = null
    errorDetails.value = null
    retryCount.value = 0
  }

  const canRetry = computed(() => retryCount.value < maxRetries.value)

  const incrementRetry = () => {
    retryCount.value++
  }

  const handleError = (err: unknown, context = '操作') => {
    console.error(`${context} failed:`, err)

    let message = `${context}失败`
    let details = ''

    if (err instanceof Error) {
      message = err.message || message
      details = err.stack || ''
    } else if (typeof err === 'string') {
      message = err
    }

    setError(message, details)
  }

  return {
    error,
    errorDetails,
    retryCount,
    maxRetries,
    canRetry,
    setError,
    clearError,
    incrementRetry,
    handleError
  }
}

/**
 * 表单验证和提交
 */
export function useFormHandling() {
  const submitting = ref(false)
  const validationErrors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})

  const setFieldError = (field: string, message: string) => {
    validationErrors.value[field] = message
  }

  const clearFieldError = (field: string) => {
    delete validationErrors.value[field]
  }

  const clearAllErrors = () => {
    validationErrors.value = {}
  }

  const markFieldTouched = (field: string) => {
    touched.value[field] = true
  }

  const isFieldValid = (field: string) => {
    return !validationErrors.value[field]
  }

  const hasErrors = computed(() => {
    return Object.keys(validationErrors.value).length > 0
  })

  const startSubmitting = () => {
    submitting.value = true
  }

  const stopSubmitting = () => {
    submitting.value = false
  }

  return {
    submitting,
    validationErrors,
    touched,
    hasErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    markFieldTouched,
    isFieldValid,
    startSubmitting,
    stopSubmitting
  }
}

/**
 * 确认对话框
 */
export function useConfirmation() {
  const uiStore = useUIStore()

  const confirm = (
    message: string,
    title = '确认操作',
    options?: {
      confirmText?: string
      cancelText?: string
      type?: 'warning' | 'danger' | 'info'
    }
  ): Promise<boolean> => {
    return new Promise(resolve => {
      const toastId = uiStore.showWarning(message, {
        title,
        persistent: true,
        actions: [
          {
            label: options?.confirmText || '确认',
            handler: () => {
              uiStore.hideToast(toastId)
              resolve(true)
            }
          },
          {
            label: options?.cancelText || '取消',
            handler: () => {
              uiStore.hideToast(toastId)
              resolve(false)
            }
          }
        ]
      })
    })
  }

  return { confirm }
}

/**
 * 页面离开确认
 */
export function usePageLeaveConfirmation(hasUnsavedChanges: () => boolean) {
  const router = useRouter()

  const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (hasUnsavedChanges()) {
      event.preventDefault()
      event.returnValue = ''
      return ''
    }
  }

  const routerGuard = () => {
    return hasUnsavedChanges()
  }

  onMounted(() => {
    window.addEventListener('beforeunload', beforeUnloadHandler)

    // 添加路由守卫
    router.beforeEach((to, from, next) => {
      if (routerGuard()) {
        if (confirm('您有未保存的更改，确定要离开吗？')) {
          next()
        } else {
          next(false)
        }
      } else {
        next()
      }
    })
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
  })
}

/**
 * 自动保存
 */
export function useAutoSave(
  saveFunction: () => Promise<void>,
  interval = 30000 // 30秒
) {
  const lastSaved = ref<Date | null>(null)
  const saving = ref(false)
  const autoSaveEnabled = ref(true)

  let autoSaveTimer: NodeJS.Timeout | null = null

  const debouncedSave = debounce(async () => {
    if (!autoSaveEnabled.value || saving.value) return

    try {
      saving.value = true
      await saveFunction()
      lastSaved.value = new Date()
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      saving.value = false
    }
  }, 2000)

  const startAutoSave = () => {
    if (autoSaveTimer) return

    autoSaveTimer = setInterval(() => {
      debouncedSave()
    }, interval)
  }

  const stopAutoSave = () => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  const toggleAutoSave = () => {
    autoSaveEnabled.value = !autoSaveEnabled.value
    if (autoSaveEnabled.value) {
      startAutoSave()
    } else {
      stopAutoSave()
    }
  }

  const manualSave = async () => {
    await debouncedSave()
  }

  onMounted(() => {
    if (autoSaveEnabled.value) {
      startAutoSave()
    }
  })

  onUnmounted(() => {
    stopAutoSave()
  })

  return {
    lastSaved,
    saving,
    autoSaveEnabled,
    startAutoSave,
    stopAutoSave,
    toggleAutoSave,
    manualSave
  }
}

/**
 * 键盘快捷键
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const handleKeydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    const ctrl = event.ctrlKey || event.metaKey
    const shift = event.shiftKey
    const alt = event.altKey

    let shortcutKey = ''
    if (ctrl) shortcutKey += 'ctrl+'
    if (shift) shortcutKey += 'shift+'
    if (alt) shortcutKey += 'alt+'
    shortcutKey += key

    const handler = shortcuts[shortcutKey]
    if (handler) {
      event.preventDefault()
      handler()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}

/**
 * 滚动到顶部/底部
 */
export function useScrollControl() {
  const scrollToTop = (smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  const scrollToBottom = (smooth = true) => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  const scrollToElement = (element: HTMLElement | string, smooth = true) => {
    const target =
      typeof element === 'string' ? (document.querySelector(element) as HTMLElement) : element

    if (target) {
      target.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      })
    }
  }

  return {
    scrollToTop,
    scrollToBottom,
    scrollToElement
  }
}

/**
 * 复制到剪贴板
 */
export function useClipboard() {
  const uiStore = useUIStore()

  const copyToClipboard = async (text: string, successMessage = '已复制到剪贴板') => {
    try {
      await navigator.clipboard.writeText(text)
      uiStore.showSuccess(successMessage)
      return true
    } catch (error) {
      // 降级方案
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        uiStore.showSuccess(successMessage)
        return true
      } catch (fallbackError) {
        uiStore.showError('复制失败，请手动复制')
        return false
      }
    }
  }

  return { copyToClipboard }
}

/**
 * 网络状态监控
 */
export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const uiStore = useUIStore()

  const handleOnline = () => {
    isOnline.value = true
    uiStore.showSuccess('网络连接已恢复')
  }

  const handleOffline = () => {
    isOnline.value = false
    uiStore.showWarning('网络连接已断开，请检查网络设置')
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return { isOnline }
}
