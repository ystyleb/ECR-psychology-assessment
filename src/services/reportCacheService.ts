import { storageService } from './storageService'
import type { BasicReport, DetailedReportData, BasicResult, AttachmentScores } from '@/types'
import logger from '@/utils/logger'

/**
 * 报告缓存服务
 * 提供报告生成结果的缓存功能，提高性能
 */
class ReportCacheService {
  private readonly cacheKey = 'ecr_report_cache'
  private readonly maxCacheSize = 50 // 最大缓存数量
  private readonly cacheExpiry = 24 * 60 * 60 * 1000 // 24小时过期

  // 内存缓存
  private memoryCache = new Map<
    string,
    {
      data: BasicReport | DetailedReportData
      timestamp: number
      accessCount: number
    }
  >()

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    assessmentId: string,
    basicResult: BasicResult,
    scores: AttachmentScores,
    type: 'basic' | 'detailed' = 'basic'
  ): string {
    const dataHash = this.hashObject({
      assessmentId,
      basicResult,
      scores,
      type
    })
    return `${type}_${assessmentId}_${dataHash}`
  }

  /**
   * 简单的对象哈希函数
   */
  private hashObject(obj: Record<string, unknown>): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort())
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 检查缓存是否过期
   */
  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.cacheExpiry
  }

  /**
   * 从内存缓存获取报告
   */
  getFromMemoryCache(cacheKey: string): BasicReport | DetailedReportData | null {
    const cached = this.memoryCache.get(cacheKey)
    if (!cached || this.isExpired(cached.timestamp)) {
      this.memoryCache.delete(cacheKey)
      return null
    }

    // 更新访问计数
    cached.accessCount++
    return cached.data
  }

  /**
   * 存储到内存缓存
   */
  setToMemoryCache(cacheKey: string, data: BasicReport | DetailedReportData): void {
    // 如果缓存已满，删除最少使用的项
    if (this.memoryCache.size >= this.maxCacheSize) {
      let leastUsedKey = ''
      let leastUsedCount = Infinity

      for (const [key, value] of this.memoryCache.entries()) {
        if (value.accessCount < leastUsedCount) {
          leastUsedCount = value.accessCount
          leastUsedKey = key
        }
      }

      if (leastUsedKey) {
        this.memoryCache.delete(leastUsedKey)
      }
    }

    this.memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      accessCount: 1
    })
  }

  /**
   * 从持久化存储获取缓存
   */
  private getFromPersistentCache(): Map<
    string,
    {
      data: BasicReport | DetailedReportData
      timestamp: number
    }
  > {
    try {
      const cached = storageService.getEncryptedItem<
        Record<
          string,
          {
            data: BasicReport | DetailedReportData
            timestamp: number
          }
        >
      >(this.cacheKey)

      if (!cached) return new Map()

      const cacheMap = new Map()
      for (const [key, value] of Object.entries(cached)) {
        if (!this.isExpired(value.timestamp)) {
          cacheMap.set(key, value)
        }
      }

      return cacheMap
    } catch (error) {
      logger.error('Failed to load persistent cache:', error)
      return new Map()
    }
  }

  /**
   * 保存到持久化存储
   */
  private saveToPersistentCache(
    cacheMap: Map<
      string,
      {
        data: BasicReport | DetailedReportData
        timestamp: number
      }
    >
  ): void {
    try {
      const cacheObject: Record<
        string,
        {
          data: BasicReport | DetailedReportData
          timestamp: number
        }
      > = {}

      for (const [key, value] of cacheMap.entries()) {
        cacheObject[key] = value
      }

      storageService.setEncryptedItem(this.cacheKey, cacheObject)
    } catch (error) {
      logger.error('Failed to save persistent cache:', error)
    }
  }

  /**
   * 获取缓存的基础报告
   */
  getCachedBasicReport(
    assessmentId: string,
    basicResult: BasicResult,
    scores: AttachmentScores
  ): BasicReport | null {
    const cacheKey = this.generateCacheKey(assessmentId, basicResult, scores, 'basic')

    // 先检查内存缓存
    const memoryResult = this.getFromMemoryCache(cacheKey)
    if (memoryResult) {
      return memoryResult as BasicReport
    }

    // 检查持久化缓存
    const persistentCache = this.getFromPersistentCache()
    const persistentResult = persistentCache.get(cacheKey)
    if (persistentResult && !this.isExpired(persistentResult.timestamp)) {
      // 加载到内存缓存
      this.setToMemoryCache(cacheKey, persistentResult.data)
      return persistentResult.data as BasicReport
    }

    return null
  }

  /**
   * 缓存基础报告
   */
  cacheBasicReport(
    assessmentId: string,
    basicResult: BasicResult,
    scores: AttachmentScores,
    report: BasicReport
  ): void {
    const cacheKey = this.generateCacheKey(assessmentId, basicResult, scores, 'basic')

    // 存储到内存缓存
    this.setToMemoryCache(cacheKey, report)

    // 存储到持久化缓存
    const persistentCache = this.getFromPersistentCache()
    persistentCache.set(cacheKey, {
      data: report,
      timestamp: Date.now()
    })

    // 限制持久化缓存大小
    if (persistentCache.size > this.maxCacheSize) {
      const entries = Array.from(persistentCache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

      // 删除最旧的条目
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize)
      toDelete.forEach(([key]) => persistentCache.delete(key))
    }

    this.saveToPersistentCache(persistentCache)
  }

  /**
   * 获取缓存的详细报告
   */
  getCachedDetailedReport(
    assessmentId: string,
    basicResult: BasicResult,
    scores: AttachmentScores
  ): DetailedReportData | null {
    const cacheKey = this.generateCacheKey(assessmentId, basicResult, scores, 'detailed')

    // 先检查内存缓存
    const memoryResult = this.getFromMemoryCache(cacheKey)
    if (memoryResult) {
      return memoryResult as DetailedReportData
    }

    // 检查持久化缓存
    const persistentCache = this.getFromPersistentCache()
    const persistentResult = persistentCache.get(cacheKey)
    if (persistentResult && !this.isExpired(persistentResult.timestamp)) {
      // 加载到内存缓存
      this.setToMemoryCache(cacheKey, persistentResult.data)
      return persistentResult.data as DetailedReportData
    }

    return null
  }

  /**
   * 缓存详细报告
   */
  cacheDetailedReport(
    assessmentId: string,
    basicResult: BasicResult,
    scores: AttachmentScores,
    report: DetailedReportData
  ): void {
    const cacheKey = this.generateCacheKey(assessmentId, basicResult, scores, 'detailed')

    // 存储到内存缓存
    this.setToMemoryCache(cacheKey, report)

    // 存储到持久化缓存
    const persistentCache = this.getFromPersistentCache()
    persistentCache.set(cacheKey, {
      data: report,
      timestamp: Date.now()
    })

    this.saveToPersistentCache(persistentCache)
  }

  /**
   * 清理过期缓存
   */
  cleanupExpiredCache(): void {
    // 清理内存缓存
    for (const [key, value] of this.memoryCache.entries()) {
      if (this.isExpired(value.timestamp)) {
        this.memoryCache.delete(key)
      }
    }

    // 清理持久化缓存
    const persistentCache = this.getFromPersistentCache()
    let hasChanges = false

    for (const [key, value] of persistentCache.entries()) {
      if (this.isExpired(value.timestamp)) {
        persistentCache.delete(key)
        hasChanges = true
      }
    }

    if (hasChanges) {
      this.saveToPersistentCache(persistentCache)
    }
  }

  /**
   * 清空所有缓存
   */
  clearAllCache(): void {
    this.memoryCache.clear()
    storageService.removeItem(this.cacheKey)
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    memorySize: number
    persistentSize: number
    totalHits: number
    hitRate: number
  } {
    const persistentCache = this.getFromPersistentCache()
    const totalHits = Array.from(this.memoryCache.values()).reduce(
      (sum, item) => sum + item.accessCount,
      0
    )

    return {
      memorySize: this.memoryCache.size,
      persistentSize: persistentCache.size,
      totalHits,
      hitRate: totalHits > 0 ? (totalHits / (totalHits + persistentCache.size)) * 100 : 0
    }
  }

  /**
   * 预热缓存 - 预加载常用报告
   */
  async warmupCache(assessmentIds: string[]): Promise<void> {
    // 这里可以实现预加载逻辑
    logger.log('Cache warmup for assessments:', assessmentIds)
  }
}

// 创建单例实例
export const reportCacheService = new ReportCacheService()

// 定期清理过期缓存
setInterval(
  () => {
    reportCacheService.cleanupExpiredCache()
  },
  60 * 60 * 1000
) // 每小时清理一次

export default reportCacheService
