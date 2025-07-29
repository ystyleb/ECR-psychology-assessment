/**
 * 性能优化工具类
 * 提供各种性能优化相关的工具函数
 */

import logger from './logger'

// 扩展Performance类型以支持内存信息
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  }
}

// 防抖函数
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 延迟执行函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 批量处理函数
export function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize = 10,
  delayMs = 0
): Promise<R[]> {
  return new Promise(resolve => {
    const results: R[] = []
    let currentIndex = 0

    const processBatch = async () => {
      const endIndex = Math.min(currentIndex + batchSize, items.length)

      for (let i = currentIndex; i < endIndex; i++) {
        results.push(processor(items[i]))
      }

      currentIndex = endIndex

      if (currentIndex < items.length) {
        if (delayMs > 0) {
          await delay(delayMs)
        }
        // 使用 requestIdleCallback 或 setTimeout 来避免阻塞主线程
        if (window.requestIdleCallback) {
          window.requestIdleCallback(processBatch)
        } else {
          setTimeout(processBatch, 0)
        }
      } else {
        resolve(results)
      }
    }

    processBatch()
  })
}

// 内存使用监控
export class MemoryMonitor {
  private static instance: MemoryMonitor
  private measurements: Array<{ timestamp: number; used: number; total: number }> = []

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor()
    }
    return MemoryMonitor.instance
  }

  measure(): void {
    if ('memory' in performance) {
      const memory = (performance as PerformanceWithMemory).memory
      this.measurements.push({
        timestamp: Date.now(),
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize
      })

      // 只保留最近100次测量
      if (this.measurements.length > 100) {
        this.measurements = this.measurements.slice(-100)
      }
    }
  }

  getUsage(): { current: number; average: number; peak: number } | null {
    if (this.measurements.length === 0) return null

    const latest = this.measurements[this.measurements.length - 1]
    const average = this.measurements.reduce((sum, m) => sum + m.used, 0) / this.measurements.length
    const peak = Math.max(...this.measurements.map(m => m.used))

    return {
      current: latest.used,
      average,
      peak
    }
  }

  clear(): void {
    this.measurements = []
  }
}

// 性能计时器
export class PerformanceTimer {
  private timers: Map<string, number> = new Map()
  private results: Map<string, number[]> = new Map()

  start(name: string): void {
    this.timers.set(name, performance.now())
  }

  end(name: string): number | null {
    const startTime = this.timers.get(name)
    if (!startTime) return null

    const duration = performance.now() - startTime
    this.timers.delete(name)

    // 记录结果
    if (!this.results.has(name)) {
      this.results.set(name, [])
    }
    this.results.get(name)!.push(duration)

    return duration
  }

  getStats(name: string): { average: number; min: number; max: number; count: number } | null {
    const durations = this.results.get(name)
    if (!durations || durations.length === 0) return null

    return {
      average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      count: durations.length
    }
  }

  clear(name?: string): void {
    if (name) {
      this.results.delete(name)
      this.timers.delete(name)
    } else {
      this.results.clear()
      this.timers.clear()
    }
  }
}

// 图片懒加载
export function createLazyImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }

  return new IntersectionObserver(entries => {
    entries.forEach(callback)
  }, defaultOptions)
}

// 虚拟滚动辅助函数
export function calculateVirtualScrollItems(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number,
  overscan = 5
): { startIndex: number; endIndex: number; offsetY: number } {
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2)
  const offsetY = startIndex * itemHeight

  return { startIndex, endIndex, offsetY }
}

// 资源预加载
export function preloadResource(
  url: string,
  type: 'image' | 'script' | 'style' = 'image'
): Promise<void> {
  return new Promise((resolve, reject) => {
    let element: HTMLImageElement | HTMLScriptElement | HTMLLinkElement

    switch (type) {
      case 'image':
        element = new Image()
        element.onload = () => resolve()
        element.onerror = reject
        ;(element as HTMLImageElement).src = url
        break

      case 'script':
        element = document.createElement('script')
        element.onload = () => resolve()
        element.onerror = reject
        ;(element as HTMLScriptElement).src = url
        document.head.appendChild(element)
        break

      case 'style':
        element = document.createElement('link')
        element.onload = () => resolve()
        element.onerror = reject
        ;(element as HTMLLinkElement).rel = 'stylesheet'
        ;(element as HTMLLinkElement).href = url
        document.head.appendChild(element)
        break

      default:
        reject(new Error(`Unsupported resource type: ${type}`))
    }
  })
}

// Web Worker 工具
export function createWorker(workerFunction: Function): Worker {
  const blob = new Blob([`(${workerFunction.toString()})()`], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}

// 缓存装饰器
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// 性能监控
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startMonitoring(): void {
    // 监控导航性能
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          logger.log('Navigation timing:', entry)
        })
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navObserver)

      // 监控资源加载性能
      const resourceObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.duration > 1000) {
            // 只记录加载时间超过1秒的资源
            logger.warn('Slow resource:', entry.name, entry.duration)
          }
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    }
  }

  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  getNavigationTiming(): PerformanceNavigationTiming | null {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    return entries.length > 0 ? entries[0] : null
  }

  getResourceTimings(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  }
}

// 创建全局实例
export const memoryMonitor = MemoryMonitor.getInstance()
export const performanceTimer = new PerformanceTimer()
export const performanceMonitor = PerformanceMonitor.getInstance()

// 自动开始性能监控（在开发环境）
if (import.meta.env.DEV) {
  performanceMonitor.startMonitoring()

  // 定期监控内存使用
  setInterval(() => {
    memoryMonitor.measure()
  }, 5000)
}
