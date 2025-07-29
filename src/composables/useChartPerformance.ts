import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { debounce, throttle, performanceTimer } from '@/utils/performance'
import type { Ref } from 'vue'
import logger from '@/utils/logger'

// 扩展Navigator类型以支持网络连接信息
interface NavigatorNetworkInformation extends Navigator {
  connection?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
}

// 扩展Performance类型以支持内存信息
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  }
}

/**
 * 图表性能优化组合式函数
 * 提供图表渲染性能优化相关功能
 */
export function useChartPerformance() {
  const isRendering = ref(false)
  const renderCount = ref(0)
  const lastRenderTime = ref(0)
  const averageRenderTime = ref(0)

  // 渲染性能统计
  const renderTimes: number[] = []

  /**
   * 开始渲染计时
   */
  const startRender = (chartId: string) => {
    isRendering.value = true
    performanceTimer.start(`chart_render_${chartId}`)
  }

  /**
   * 结束渲染计时
   */
  const endRender = (chartId: string) => {
    const duration = performanceTimer.end(`chart_render_${chartId}`)
    if (duration !== null) {
      lastRenderTime.value = duration
      renderTimes.push(duration)
      renderCount.value++

      // 只保留最近20次渲染时间
      if (renderTimes.length > 20) {
        renderTimes.shift()
      }

      // 计算平均渲染时间
      averageRenderTime.value =
        renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
    }
    isRendering.value = false
  }

  /**
   * 获取渲染性能统计
   */
  const getRenderStats = () => ({
    renderCount: renderCount.value,
    lastRenderTime: lastRenderTime.value,
    averageRenderTime: averageRenderTime.value,
    isRendering: isRendering.value
  })

  return {
    isRendering,
    renderCount,
    lastRenderTime,
    averageRenderTime,
    startRender,
    endRender,
    getRenderStats
  }
}

/**
 * 图表数据优化组合式函数
 * 提供数据处理和优化功能
 */
export function useChartDataOptimization() {
  /**
   * 数据采样 - 减少数据点数量以提高性能
   */
  const sampleData = <T>(data: T[], maxPoints: number): T[] => {
    if (data.length <= maxPoints) return data

    const step = data.length / maxPoints
    const sampled: T[] = []

    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[Math.floor(i)])
    }

    return sampled
  }

  /**
   * 数据聚合 - 将相近的数据点合并
   */
  const aggregateData = <T extends { value: number; label: string }>(
    data: T[],
    threshold: number
  ): T[] => {
    if (data.length === 0) return data

    const aggregated: T[] = []
    let currentGroup: T[] = [data[0]]

    for (let i = 1; i < data.length; i++) {
      const current = data[i]
      const lastInGroup = currentGroup[currentGroup.length - 1]

      if (Math.abs(current.value - lastInGroup.value) <= threshold) {
        currentGroup.push(current)
      } else {
        // 合并当前组
        if (currentGroup.length === 1) {
          aggregated.push(currentGroup[0])
        } else {
          const avgValue =
            currentGroup.reduce((sum, item) => sum + item.value, 0) / currentGroup.length
          aggregated.push({
            ...currentGroup[0],
            value: avgValue,
            label: `${currentGroup[0].label} (${currentGroup.length}项)`
          })
        }
        currentGroup = [current]
      }
    }

    // 处理最后一组
    if (currentGroup.length === 1) {
      aggregated.push(currentGroup[0])
    } else {
      const avgValue = currentGroup.reduce((sum, item) => sum + item.value, 0) / currentGroup.length
      aggregated.push({
        ...currentGroup[0],
        value: avgValue,
        label: `${currentGroup[0].label} (${currentGroup.length}项)`
      })
    }

    return aggregated
  }

  /**
   * 数据缓存
   */
  const dataCache = new Map<string, unknown>()

  const getCachedData = <T>(key: string, generator: () => T): T => {
    if (dataCache.has(key)) {
      return dataCache.get(key)
    }

    const data = generator()
    dataCache.set(key, data)

    // 限制缓存大小
    if (dataCache.size > 50) {
      const firstKey = dataCache.keys().next().value
      dataCache.delete(firstKey)
    }

    return data
  }

  const clearCache = (key?: string) => {
    if (key) {
      dataCache.delete(key)
    } else {
      dataCache.clear()
    }
  }

  return {
    sampleData,
    aggregateData,
    getCachedData,
    clearCache
  }
}

/**
 * 图表响应式优化组合式函数
 * 提供响应式渲染优化
 */
export function useChartResponsive(containerRef: Ref<HTMLElement | undefined>) {
  const containerSize = ref({ width: 0, height: 0 })
  const isVisible = ref(true)

  let resizeObserver: ResizeObserver | null = null
  let intersectionObserver: IntersectionObserver | null = null

  // 防抖的尺寸更新函数
  const debouncedUpdateSize = debounce((entries: ResizeObserverEntry[]) => {
    if (entries.length > 0) {
      const { width, height } = entries[0].contentRect
      containerSize.value = { width, height }
    }
  }, 100)

  // 节流的可见性检查函数
  const throttledVisibilityCheck = throttle((entries: IntersectionObserverEntry[]) => {
    if (entries.length > 0) {
      isVisible.value = entries[0].isIntersecting
    }
  }, 200)

  onMounted(async () => {
    await nextTick()

    if (!containerRef.value) return

    // 初始化尺寸
    const rect = containerRef.value.getBoundingClientRect()
    containerSize.value = { width: rect.width, height: rect.height }

    // 监听尺寸变化
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(debouncedUpdateSize)
      resizeObserver.observe(containerRef.value)
    }

    // 监听可见性变化
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(throttledVisibilityCheck, {
        threshold: 0.1
      })
      intersectionObserver.observe(containerRef.value)
    }
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    if (intersectionObserver) {
      intersectionObserver.disconnect()
    }
  })

  return {
    containerSize,
    isVisible
  }
}

/**
 * 图表动画优化组合式函数
 * 提供动画性能优化
 */
export function useChartAnimation() {
  const animationEnabled = ref(true)
  const reducedMotion = ref(false)

  onMounted(() => {
    // 检查用户是否偏好减少动画
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mediaQuery.matches

    // 监听偏好变化
    const handleChange = (e: MediaQueryListEvent) => {
      reducedMotion.value = e.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  })

  // 根据设备性能调整动画
  const getOptimalAnimationConfig = () => {
    const isLowEndDevice = navigator.hardwareConcurrency <= 2
    const isSlowConnection =
      'connection' in navigator &&
      (navigator as NavigatorNetworkInformation).connection?.effectiveType === 'slow-2g'

    if (reducedMotion.value || isLowEndDevice || isSlowConnection) {
      return {
        duration: 0,
        easing: 'linear'
      }
    }

    return {
      duration: animationEnabled.value ? 1000 : 0,
      easing: 'easeInOutQuart'
    }
  }

  const toggleAnimation = (enabled: boolean) => {
    animationEnabled.value = enabled
  }

  return {
    animationEnabled,
    reducedMotion,
    getOptimalAnimationConfig,
    toggleAnimation
  }
}

/**
 * 图表内存优化组合式函数
 * 提供内存管理优化
 */
export function useChartMemoryOptimization() {
  const chartInstances = new Set<object>()

  const registerChart = (chart: object) => {
    chartInstances.add(chart)
  }

  const unregisterChart = (chart: object) => {
    chartInstances.delete(chart)
  }

  const destroyAllCharts = () => {
    chartInstances.forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy()
      }
    })
    chartInstances.clear()
  }

  // 内存压力检测
  const checkMemoryPressure = () => {
    if ('memory' in performance) {
      const memory = (performance as PerformanceWithMemory).memory
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit

      if (usageRatio > 0.8) {
        logger.warn('High memory usage detected, consider optimizing charts')
        return 'high'
      } else if (usageRatio > 0.6) {
        return 'medium'
      }
    }
    return 'low'
  }

  onUnmounted(() => {
    destroyAllCharts()
  })

  return {
    registerChart,
    unregisterChart,
    destroyAllCharts,
    checkMemoryPressure
  }
}
