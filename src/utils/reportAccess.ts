import { useAppStore } from '@/store'
import reportService from '@/services/reportService'
import type { BasicReport, DetailedReportData } from '@/types'
import logger from '@/utils/logger'

/**
 * 检查是否有基础报告访问权限
 */
export async function canAccessBasicReport(assessmentId: string): Promise<boolean> {
  logger.log('🔐 canAccessBasicReport called for ID:', assessmentId)
  
  const appStore = useAppStore()
  
  // 检查是否存在评估数据
  const hasAssessment = appStore.hasAssessment(assessmentId)
  logger.log('🔐 hasAssessment result:', hasAssessment)
  if (!hasAssessment) {
    logger.log('🔐 Assessment not found, denying access')
    return false
  }
  
  // 如果当前store中已经有这个评估且ID匹配，就不需要重新加载
  if (appStore.currentAssessment?.id === assessmentId) {
    logger.log('🔐 Using current assessment from store, no need to reload')
  } else {
    // 尝试加载评估数据
    const success = await appStore.loadAssessment(assessmentId)
    logger.log('🔐 loadAssessment success:', success)
    logger.log('🔐 currentAssessment after load:', appStore.currentAssessment)
    
    if (!success || !appStore.currentAssessment) {
      logger.log('🔐 Failed to load assessment or no current assessment')
      return false
    }
  }
  
  // 检查是否已经完成并有结果
  const isComplete = appStore.isAssessmentComplete
  const hasResult = !!appStore.currentAssessment.basicResult
  logger.log('🔐 isAssessmentComplete:', isComplete)
  logger.log('🔐 has basicResult:', hasResult)
  
  const canAccess = isComplete && hasResult
  logger.log('🔐 Final canAccessBasicReport result:', canAccess)
  
  return canAccess
}

/**
 * 检查是否有详细报告访问权限
 */
export async function canAccessDetailedReport(assessmentId: string): Promise<boolean> {
  // 首先检查基础报告权限
  if (!(await canAccessBasicReport(assessmentId))) {
    return false
  }

  const appStore = useAppStore()
  // 检查是否已支付
  const paymentStatus = appStore.checkPaymentStatus(assessmentId)
  return paymentStatus.isPaid
}

/**
 * 获取基础报告
 */
export async function getBasicReport(assessmentId: string): Promise<BasicReport | null> {
  if (!canAccessBasicReport(assessmentId)) {
    return null
  }

  // 尝试从缓存获取
  let report = reportService.getReportByAssessmentId(assessmentId)

  if (!report) {
    // 生成基础报告
    const appStore = useAppStore()
    // 需要通过服务层获取评估数据
    const assessment = appStore.currentAssessment
    if (assessment && assessment.basicResult) {
      report = reportService.generateBasicReport(
        assessmentId,
        assessment.basicResult,
        {
          anxious: assessment.basicResult.anxious,
          avoidant: assessment.basicResult.avoidant,
          secure: 7 - Math.max(assessment.basicResult.anxious, assessment.basicResult.avoidant)
        },
        0.85 // 默认可靠性
      )
    }
  }

  return report
}

/**
 * 获取详细报告
 */
export async function getDetailedReport(assessmentId: string): Promise<DetailedReportData | null> {
  if (!canAccessDetailedReport(assessmentId)) {
    return null
  }

  // 尝试从缓存获取详细报告
  let detailedReport = reportService.getReportByAssessmentId(assessmentId) as DetailedReportData

  if (!detailedReport || detailedReport.type !== 'detailed') {
    // 获取基础报告
    const basicReport = await getBasicReport(assessmentId)
    if (!basicReport) {
      return null
    }

    // 生成详细报告
    detailedReport = reportService.generateDetailedReport(basicReport)
  }

  return detailedReport
}

/**
 * 获取访问状态信息
 */
export async function getAccessStatus(assessmentId: string) {
  const appStore = useAppStore()
  
  const hasAssessment = appStore.hasAssessment(assessmentId)
  const hasBasicAccess = await canAccessBasicReport(assessmentId)
  const hasDetailedAccess = await canAccessDetailedReport(assessmentId)
  const paymentStatus = appStore.checkPaymentStatus(assessmentId)

  return {
    hasAssessment,
    hasBasicAccess,
    hasDetailedAccess,
    needsPayment: hasBasicAccess && !hasDetailedAccess,
    accessInfo: { hasAccess: paymentStatus.isPaid }
  }
}

/**
 * 验证报告访问令牌
 */
export async function validateAccessToken(assessmentId: string, token?: string): Promise<boolean> {
  if (!token) {
    return canAccessDetailedReport(assessmentId)
  }

  // 这里可以添加更复杂的令牌验证逻辑
  // 目前简化为检查支付状态
  const appStore = useAppStore()
  const paymentStatus = appStore.checkPaymentStatus(assessmentId)
  return paymentStatus.isPaid
}

/**
 * 生成报告分享链接
 */
export async function generateShareLink(assessmentId: string, includeToken = false): Promise<string> {
  const baseUrl = window.location.origin
  const reportPath = `/report/${assessmentId}`

  if (includeToken && (await canAccessDetailedReport(assessmentId))) {
    // 生成带访问令牌的链接（用于分享详细报告）
    const appStore = useAppStore()
    const paymentStatus = appStore.checkPaymentStatus(assessmentId)

    if (paymentStatus.sessionId) {
      return `${baseUrl}${reportPath}/detailed?token=${paymentStatus.sessionId}`
    }
  }

  return `${baseUrl}${reportPath}`
}

/**
 * 检查报告是否过期
 */
export function isReportExpired(_assessmentId: string): boolean {
  // 简化实现，暂时返回false表示永不过期
  return false
}

/**
 * 获取报告过期时间
 */
export function getReportExpiryDate(_assessmentId: string): Date | null {
  // 简化实现，暂时返回null表示永不过期
  return null
}

/**
 * 清理过期的报告访问权限
 */
export function cleanupExpiredAccess(): void {
  // 这个方法应该定期调用以清理过期的访问权限
  // 具体实现取决于存储机制
  logger.log('Cleaning up expired report access...')
}

// 默认导出
export default {
  canAccessBasicReport,
  canAccessDetailedReport,
  getBasicReport,
  getDetailedReport,
  getAccessStatus,
  validateAccessToken,
  generateShareLink,
  isReportExpired,
  getReportExpiryDate,
  cleanupExpiredAccess
}