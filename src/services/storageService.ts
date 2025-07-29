// 本地存储服务
import type { StorageService, AssessmentData } from '@/types'
import logger from '@/utils/logger'

class LocalStorageService implements StorageService {
  private encryptionKey = 'ecr_encryption_key'

  // 基础存储操作
  getItem<T = unknown>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      logger.error(`Failed to get item ${key}:`, error)
      return null
    }
  }

  setItem<T = unknown>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      logger.error(`Failed to set item ${key}:`, error)
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      logger.error(`Failed to remove item ${key}:`, error)
    }
  }

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      logger.error('Failed to clear storage:', error)
    }
  }

  // 加密存储操作（简化版，实际项目中应使用更安全的加密方法）
  getEncryptedItem<T = unknown>(key: string): T | null {
    try {
      const encryptedItem = localStorage.getItem(key)
      if (!encryptedItem) return null

      const decrypted = this.decrypt(encryptedItem)
      return JSON.parse(decrypted)
    } catch (error) {
      logger.error(`Failed to get encrypted item ${key}:`, error)
      return null
    }
  }

  setEncryptedItem<T = unknown>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value)
      const encrypted = this.encrypt(serialized)
      localStorage.setItem(key, encrypted)
    } catch (error) {
      logger.error(`Failed to set encrypted item ${key}:`, error)
    }
  }

  // 批量操作
  getMultipleItems<T = unknown>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {}
    keys.forEach(key => {
      result[key] = this.getItem<T>(key)
    })
    return result
  }

  setMultipleItems<T = unknown>(items: Record<string, T>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.setItem(key, value)
    })
  }

  removeMultipleItems(keys: string[]): void {
    keys.forEach(key => {
      this.removeItem(key)
    })
  }

  // 存储信息
  getStorageInfo(): { used: number; available: number; quota: number } {
    try {
      // 估算已使用的存储空间
      let used = 0
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += localStorage[key].length + key.length
        }
      }

      // 大多数浏览器的localStorage限制是5-10MB
      const quota = 5 * 1024 * 1024 // 5MB
      const available = quota - used

      return { used, available, quota }
    } catch (error) {
      logger.error('Failed to get storage info:', error)
      return { used: 0, available: 0, quota: 0 }
    }
  }

  // 简化的加密/解密方法（仅用于演示，生产环境应使用更安全的方法）
  private encrypt(text: string): string {
    // 这里使用简单的Base64编码作为演示
    // 实际项目中应该使用AES等加密算法
    return btoa(text)
  }

  private decrypt(encryptedText: string): string {
    try {
      return atob(encryptedText)
    } catch (error) {
      throw new Error('Failed to decrypt data')
    }
  }

  // 数据压缩（可选）
  compress(data: string): string {
    // 简单的压缩实现，实际项目中可以使用LZ-string等库
    return data
  }

  decompress(compressedData: string): string {
    return compressedData
  }

  // 数据验证
  validateData<T>(data: T, _schema?: unknown): boolean {
    // 这里可以实现数据验证逻辑
    return data !== null && data !== undefined
  }

  // 存储事件监听
  onStorageChange(callback: (event: StorageEvent) => void): () => void {
    window.addEventListener('storage', callback)

    // 返回清理函数
    return () => {
      window.removeEventListener('storage', callback)
    }
  }

  // 存储配额检查
  checkQuota(): Promise<{ usage: number; quota: number }> {
    return new Promise(resolve => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          resolve({
            usage: estimate.usage || 0,
            quota: estimate.quota || 0
          })
        })
      } else {
        const info = this.getStorageInfo()
        resolve({
          usage: info.used,
          quota: info.quota
        })
      }
    })
  }

  // 清理过期数据
  cleanupExpiredData(): void {
    const now = Date.now()
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('ecr_temp_')) {
        try {
          const item = this.getItem<{ data: unknown; expiresAt: number }>(key)
          if (item && item.expiresAt < now) {
            keysToRemove.push(key)
          }
        } catch (error) {
          // 如果解析失败，也删除这个键
          keysToRemove.push(key)
        }
      }
    }

    keysToRemove.forEach(key => this.removeItem(key))
  }

  // 设置临时数据（带过期时间）
  setTempItem<T>(key: string, value: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs
    const tempData = { data: value, expiresAt }
    this.setItem(`ecr_temp_${key}`, tempData)
  }

  // 获取临时数据
  getTempItem<T>(key: string): T | null {
    const tempData = this.getItem<{ data: T; expiresAt: number }>(`ecr_temp_${key}`)
    if (!tempData) return null

    if (tempData.expiresAt < Date.now()) {
      this.removeItem(`ecr_temp_${key}`)
      return null
    }

    return tempData.data
  }

  // ========== 测评数据专用方法 ==========

  /**
   * 保存测评数据
   */
  saveAssessment(data: AssessmentData): void {
    try {
      const assessments = this.getAssessments()
      assessments.set(data.id, data)

      const assessmentArray = Array.from(assessments.entries())
      this.setEncryptedItem('ecr_assessments', assessmentArray)

      // 保存最后更新时间
      this.setItem('ecr_assessments_updated', new Date().toISOString())
    } catch (error) {
      logger.error('Failed to save assessment:', error)
      throw new Error('保存测评数据失败')
    }
  }

  /**
   * 获取单个测评数据
   */
  getAssessment(id: string): AssessmentData | null {
    try {
      const assessments = this.getAssessments()
      return assessments.get(id) || null
    } catch (error) {
      logger.error('Failed to get assessment:', error)
      return null
    }
  }

  /**
   * 获取所有测评数据
   */
  getAssessments(): Map<string, AssessmentData> {
    try {
      const assessmentArray = this.getEncryptedItem<[string, AssessmentData][]>('ecr_assessments')
      if (!assessmentArray) {
        return new Map()
      }

      // 转换日期字符串为Date对象
      const processedArray = assessmentArray.map(([id, data]) => {
        return [
          id,
          {
            ...data,
            createdAt: new Date(data.createdAt),
            paymentStatus: data.paymentStatus
              ? {
                  ...data.paymentStatus,
                  unlockedAt: data.paymentStatus.unlockedAt
                    ? new Date(data.paymentStatus.unlockedAt)
                    : undefined,
                  expiresAt: data.paymentStatus.expiresAt
                    ? new Date(data.paymentStatus.expiresAt)
                    : undefined
                }
              : undefined
          }
        ] as [string, AssessmentData]
      })

      return new Map(processedArray)
    } catch (error) {
      logger.error('Failed to get assessments:', error)
      return new Map()
    }
  }

  /**
   * 删除测评数据
   */
  deleteAssessment(id: string): boolean {
    try {
      const assessments = this.getAssessments()
      const deleted = assessments.delete(id)

      if (deleted) {
        const assessmentArray = Array.from(assessments.entries())
        this.setEncryptedItem('ecr_assessments', assessmentArray)
        this.setItem('ecr_assessments_updated', new Date().toISOString())
      }

      return deleted
    } catch (error) {
      logger.error('Failed to delete assessment:', error)
      return false
    }
  }

  /**
   * 获取测评列表（用于展示）
   */
  getAssessmentList(): Array<{
    id: string
    createdAt: Date
    completed: boolean
    progress: number
    attachmentStyle?: string
  }> {
    try {
      const assessments = this.getAssessments()
      return Array.from(assessments.values())
        .map(assessment => {
          const completed = assessment.responses.every(r => r !== null)
          const progress = Math.round(
            (assessment.responses.filter(r => r !== null).length / 36) * 100
          )

          return {
            id: assessment.id,
            createdAt: assessment.createdAt,
            completed,
            progress,
            attachmentStyle: assessment.basicResult?.attachmentStyle
          }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      logger.error('Failed to get assessment list:', error)
      return []
    }
  }

  /**
   * 清理过期的测评数据
   */
  cleanupExpiredAssessments(retentionDays: number = 30): number {
    try {
      const assessments = this.getAssessments()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      let deletedCount = 0

      for (const [id, assessment] of assessments) {
        // 只删除未完成且超过保留期的测评
        const isCompleted = assessment.responses.every(r => r !== null)
        const isExpired = assessment.createdAt < cutoffDate

        if (!isCompleted && isExpired) {
          assessments.delete(id)
          deletedCount++
        }
      }

      if (deletedCount > 0) {
        const assessmentArray = Array.from(assessments.entries())
        this.setEncryptedItem('ecr_assessments', assessmentArray)
        this.setItem('ecr_assessments_updated', new Date().toISOString())
      }

      return deletedCount
    } catch (error) {
      logger.error('Failed to cleanup expired assessments:', error)
      return 0
    }
  }

  /**
   * 导出测评数据
   */
  exportAssessmentData(format: 'json' | 'csv' = 'json'): string {
    try {
      const assessments = this.getAssessments()
      const data = Array.from(assessments.values())

      if (format === 'json') {
        return JSON.stringify(data, null, 2)
      } else if (format === 'csv') {
        // 简化的CSV导出
        const headers = ['ID', '创建时间', '完成状态', '焦虑得分', '回避得分', '依恋类型']
        const rows = data.map(assessment => [
          assessment.id,
          assessment.createdAt.toISOString(),
          assessment.responses.every(r => r !== null) ? '已完成' : '未完成',
          assessment.basicResult?.anxious || '',
          assessment.basicResult?.avoidant || '',
          assessment.basicResult?.attachmentStyle || ''
        ])

        return [headers, ...rows].map(row => row.join(',')).join('\n')
      }

      return ''
    } catch (error) {
      logger.error('Failed to export assessment data:', error)
      throw new Error('导出测评数据失败')
    }
  }

  /**
   * 获取存储统计信息
   */
  getAssessmentStorageStats(): {
    totalAssessments: number
    completedAssessments: number
    storageUsed: number
    lastUpdated: Date | null
  } {
    try {
      const assessments = this.getAssessments()
      const completed = Array.from(assessments.values()).filter(a =>
        a.responses.every(r => r !== null)
      ).length

      const storageUsed = JSON.stringify(Array.from(assessments.entries())).length
      const lastUpdatedStr = this.getItem<string>('ecr_assessments_updated')
      const lastUpdated = lastUpdatedStr ? new Date(lastUpdatedStr) : null

      return {
        totalAssessments: assessments.size,
        completedAssessments: completed,
        storageUsed,
        lastUpdated
      }
    } catch (error) {
      logger.error('Failed to get storage stats:', error)
      return {
        totalAssessments: 0,
        completedAssessments: 0,
        storageUsed: 0,
        lastUpdated: null
      }
    }
  }
}

// 创建单例实例
export const storageService = new LocalStorageService()

// 导出类型和实例
export type { StorageService }
export default storageService
