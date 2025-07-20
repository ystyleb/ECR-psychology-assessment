// 滑动手势支持
import { ref, onMounted, onUnmounted } from 'vue'

interface SwipeOptions {
  threshold?: number // 最小滑动距离
  timeout?: number // 最大滑动时间
  restraint?: number // 垂直方向最大偏移
}

interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function useSwipeGesture(
  element: HTMLElement | null,
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) {
  const { threshold = 50, timeout = 300, restraint = 100 } = options

  const startX = ref(0)
  const startY = ref(0)
  const startTime = ref(0)
  const isTracking = ref(false)

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX.value = touch.clientX
    startY.value = touch.clientY
    startTime.value = Date.now()
    isTracking.value = true
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isTracking.value) return

    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    const endTime = Date.now()

    const distanceX = endX - startX.value
    const distanceY = endY - startY.value
    const elapsedTime = endTime - startTime.value

    // 检查是否在时间限制内
    if (elapsedTime > timeout) {
      isTracking.value = false
      return
    }

    // 检查是否达到最小滑动距离
    const absDistanceX = Math.abs(distanceX)
    const absDistanceY = Math.abs(distanceY)

    if (absDistanceX >= threshold && absDistanceY <= restraint) {
      // 水平滑动
      if (distanceX > 0) {
        callbacks.onSwipeRight?.()
      } else {
        callbacks.onSwipeLeft?.()
      }
    } else if (absDistanceY >= threshold && absDistanceX <= restraint) {
      // 垂直滑动
      if (distanceY > 0) {
        callbacks.onSwipeDown?.()
      } else {
        callbacks.onSwipeUp?.()
      }
    }

    isTracking.value = false
  }

  const handleTouchCancel = () => {
    isTracking.value = false
  }

  onMounted(() => {
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
      element.addEventListener('touchcancel', handleTouchCancel, { passive: true })
    }
  })

  onUnmounted(() => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    }
  })

  return {
    isTracking: readonly(isTracking)
  }
}

// 键盘导航支持
export function useKeyboardNavigation(callbacks: {
  onNext?: () => void
  onPrevious?: () => void
  onSelect?: (value: number) => void
  onEscape?: () => void
}) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // 数字键选择答案
    if (e.key >= '1' && e.key <= '7') {
      e.preventDefault()
      callbacks.onSelect?.(parseInt(e.key))
    }
    // 方向键导航
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      callbacks.onPrevious?.()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      callbacks.onNext?.()
    }
    // ESC键退出
    else if (e.key === 'Escape') {
      e.preventDefault()
      callbacks.onEscape?.()
    }
    // 空格键确认
    else if (e.key === ' ') {
      e.preventDefault()
      callbacks.onNext?.()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}

// 设备检测
export function useDeviceDetection() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)
  const isTouchDevice = ref(false)
  const screenSize = ref({ width: 0, height: 0 })

  const updateDeviceInfo = () => {
    const width = window.innerWidth
    const height = window.innerHeight

    screenSize.value = { width, height }
    isMobile.value = width < 768
    isTablet.value = width >= 768 && width < 1024
    isDesktop.value = width >= 1024
    isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  onMounted(() => {
    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDeviceInfo)
  })

  return {
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),
    isTouchDevice: readonly(isTouchDevice),
    screenSize: readonly(screenSize)
  }
}

// 焦点管理
export function useFocusManagement() {
  const focusedElement = ref<HTMLElement | null>(null)

  const setFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus()
      focusedElement.value = element
    }
  }

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  return {
    focusedElement: readonly(focusedElement),
    setFocus,
    trapFocus
  }
}

// 可访问性支持
export function useAccessibility() {
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const setAriaLabel = (element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label)
  }

  const setAriaDescribedBy = (element: HTMLElement, describedById: string) => {
    element.setAttribute('aria-describedby', describedById)
  }

  return {
    announceToScreenReader,
    setAriaLabel,
    setAriaDescribedBy
  }
}

// 导入readonly函数
import { readonly } from 'vue'
