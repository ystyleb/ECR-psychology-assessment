import { storageService } from './storageService'
import logger from '@/utils/logger'

// 访问日志条目接口
interface AccessLogEntry {
  id: string
  timestamp: Date
  userId?: string
  sessionId?: string
  resourceType: 'basic_report' | 'detailed_report' | 'assessment'
  resourceId: string
  action: 'view' | 'download' | 'share' | 'unlock_attempt' | 'unlock_success'
  accessMethod: 'direct' | 'payment' | 'token'
  userAgent?: string
  ipAddress?: string
  referrer?: string
  metadata?: Record<string, unknown>
}

// 访问统计接口
interface AccessStats {
  totalViews: number
  uniqueUsers: number
  viewsByResourceType: Record<string, number>
  viewsByAction: Record<string, number>
  viewsByDate: Record<string, number>
  averageSessionDuration: number
  conversionRate: number // 从基础报告到详细报告的转化率
}

// 用户会话接口
interface UserSession {
  sessionId: string
  startTime: Date
  endTime?: Date
  userId?: string
  actions: AccessLogEntry[]
  duration?: number
}

/**
 * 访问日志服务
 * 用于记录和分析用户对报告的访问行为
 */
class AccessLogService {
  private readonly logKey = 'ecr_access_logs'
  private readonly sessionKey = 'ecr_user_sessions'
  private readonly currentSessionId: string

  constructor() {
    this.currentSessionId = this.generateSessionId()
    this.initializeSession()
  }

  /**
   * 记录访问日志
   */
  logAccess(entry: Omit<AccessLogEntry, 'id' | 'timestamp' | 'sessionId'>): void {
    try {
      const logEntry: AccessLogEntry = {
        id: this.generateLogId(),
        timestamp: new Date(),
        sessionId: this.currentSessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        ...entry
      }

      // 保存日志条目
      this.saveLogEntry(logEntry)

      // 更新当前会话
      this.updateCurrentSession(logEntry)

      logger.log('Access logged:', logEntry)
    } catch (error) {
      logger.error('Failed to log access:', error)
    }
  }

  /**
   * 记录报告查看
   */
  logReportView(
    resourceType: AccessLogEntry['resourceType'],
    resourceId: string,
    metadata?: Record<string, unknown>
  ): void {
    this.logAccess({
      resourceType,
      resourceId,
      action: 'view',
      accessMethod: 'direct',
      metadata
    })
  }

  /**
   * 记录报告下载
   */
  logReportDownload(
    resourceType: AccessLogEntry['resourceType'],
    resourceId: string,
    format: string
  ): void {
    this.logAccess({
      resourceType,
      resourceId,
      action: 'download',
      accessMethod: 'direct',
      metadata: { format }
    })
  }

  /**
   * 记录报告分享
   */
  logReportShare(
    resourceType: AccessLogEntry['resourceType'],
    resourceId: string,
    platform: string
  ): void {
    this.logAccess({
      resourceType,
      resourceId,
      action: 'share',
      accessMethod: 'direct',
      metadata: { platform }
    })
  }

  /**
   * 记录解锁尝试
   */
  logUnlockAttempt(resourceId: string, method: 'payment' | 'token'): void {
    this.logAccess({
      resourceType: 'detailed_report',
      resourceId,
      action: 'unlock_attempt',
      accessMethod: method
    })
  }

  /**
   * 记录解锁成功
   */
  logUnlockSuccess(
    resourceId: string,
    method: 'payment' | 'token',
    paymentInfo?: Record<string, unknown>
  ): void {
    this.logAccess({
      resourceType: 'detailed_report',
      resourceId,
      action: 'unlock_success',
      accessMethod: method,
      metadata: paymentInfo
    })
  }

  /**
   * 获取访问统计
   */
  getAccessStats(dateRange?: { start: Date; end: Date }): AccessStats {
    try {
      const logs = this.getAllLogs()
      const filteredLogs = dateRange
        ? logs.filter(log => log.timestamp >= dateRange.start && log.timestamp <= dateRange.end)
        : logs

      const stats: AccessStats = {
        totalViews: filteredLogs.length,
        uniqueUsers: new Set(filteredLogs.map(log => log.sessionId)).size,
        viewsByResourceType: {},
        viewsByAction: {},
        viewsByDate: {},
        averageSessionDuration: 0,
        conversionRate: 0
      }

      // 统计各维度数据
      filteredLogs.forEach(log => {
        // 按资源类型统计
        stats.viewsByResourceType[log.resourceType] =
          (stats.viewsByResourceType[log.resourceType] || 0) + 1

        // 按操作类型统计
        stats.viewsByAction[log.action] = (stats.viewsByAction[log.action] || 0) + 1

        // 按日期统计
        const dateKey = log.timestamp.toISOString().split('T')[0]
        stats.viewsByDate[dateKey] = (stats.viewsByDate[dateKey] || 0) + 1
      })

      // 计算转化率
      const basicViews = stats.viewsByResourceType['basic_report'] || 0
      const detailedViews = stats.viewsByResourceType['detailed_report'] || 0
      stats.conversionRate = basicViews > 0 ? (detailedViews / basicViews) * 100 : 0

      // 计算平均会话时长
      const sessions = this.getAllSessions()
      const completedSessions = sessions.filter(s => s.duration !== undefined)
      if (completedSessions.length > 0) {
        const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
        stats.averageSessionDuration = totalDuration / completedSessions.length
      }

      return stats
    } catch (error) {
      logger.error('Failed to get access stats:', error)
      return {
        totalViews: 0,
        uniqueUsers: 0,
        viewsByResourceType: {},
        viewsByAction: {},
        viewsByDate: {},
        averageSessionDuration: 0,
        conversionRate: 0
      }
    }
  }

  /**
   * 获取用户行为路径
   */
  getUserJourney(sessionId?: string): AccessLogEntry[] {
    try {
      const targetSessionId = sessionId || this.currentSessionId
      const logs = this.getAllLogs()
      return logs
        .filter(log => log.sessionId === targetSessionId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    } catch (error) {
      logger.error('Failed to get user journey:', error)
      return []
    }
  }

  /**
   * 清理过期日志
   */
  cleanupOldLogs(daysToKeep: number = 30): void {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const logs = this.getAllLogs()
      const filteredLogs = logs.filter(log => log.timestamp >= cutoffDate)

      this.saveAllLogs(filteredLogs)

      // 同时清理过期会话
      const sessions = this.getAllSessions()
      const filteredSessions = sessions.filter(session => session.startTime >= cutoffDate)
      this.saveAllSessions(filteredSessions)

      logger.log(`Cleaned up logs older than ${daysToKeep} days`)
    } catch (error) {
      logger.error('Failed to cleanup old logs:', error)
    }
  }

  /**
   * 结束当前会话
   */
  endCurrentSession(): void {
    try {
      const sessions = this.getAllSessions()
      const currentSession = sessions.find(s => s.sessionId === this.currentSessionId)

      if (currentSession && !currentSession.endTime) {
        currentSession.endTime = new Date()
        currentSession.duration =
          currentSession.endTime.getTime() - currentSession.startTime.getTime()
        this.saveAllSessions(sessions)
      }
    } catch (error) {
      logger.error('Failed to end current session:', error)
    }
  }

  // 私有方法
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeSession(): void {
    try {
      const sessions = this.getAllSessions()
      const newSession: UserSession = {
        sessionId: this.currentSessionId,
        startTime: new Date(),
        actions: []
      }

      sessions.push(newSession)
      this.saveAllSessions(sessions)
    } catch (error) {
      logger.error('Failed to initialize session:', error)
    }
  }

  private updateCurrentSession(logEntry: AccessLogEntry): void {
    try {
      const sessions = this.getAllSessions()
      const currentSession = sessions.find(s => s.sessionId === this.currentSessionId)

      if (currentSession) {
        currentSession.actions.push(logEntry)
        this.saveAllSessions(sessions)
      }
    } catch (error) {
      logger.error('Failed to update current session:', error)
    }
  }

  private saveLogEntry(entry: AccessLogEntry): void {
    const logs = this.getAllLogs()
    logs.push(entry)
    this.saveAllLogs(logs)
  }

  private getAllLogs(): AccessLogEntry[] {
    try {
      const logs = storageService.getEncryptedItem<AccessLogEntry[]>(this.logKey) || []
      return logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }))
    } catch (error) {
      logger.error('Failed to get all logs:', error)
      return []
    }
  }

  private saveAllLogs(logs: AccessLogEntry[]): void {
    storageService.setEncryptedItem(this.logKey, logs)
  }

  private getAllSessions(): UserSession[] {
    try {
      const sessions = storageService.getEncryptedItem<UserSession[]>(this.sessionKey) || []
      return sessions.map(session => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }))
    } catch (error) {
      logger.error('Failed to get all sessions:', error)
      return []
    }
  }

  private saveAllSessions(sessions: UserSession[]): void {
    storageService.setEncryptedItem(this.sessionKey, sessions)
  }
}

// 创建单例实例
export const accessLogService = new AccessLogService()

// 页面卸载时结束会话
window.addEventListener('beforeunload', () => {
  accessLogService.endCurrentSession()
})

export default accessLogService
export type { AccessLogEntry, AccessStats, UserSession }
