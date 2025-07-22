import { usePaymentStore } from '@/stores/payment'
import { useAssessmentStore } from '@/stores/assessment'
import reportService from '@/services/reportService'
import type { BasicReport, DetailedReportData } from '@/types'

/**
 * 报告访问控制工具
 */
export class ReportAccessControl {
  private paymentStore = usePaymentStore()
  private assessmentStore = useAssessmentStore()

  /**
   * 检查是否有基础报告访问权限
   */
  canAccessBasicReport(assessmentId: string): boolean {
    // 检查是否存在评估数据
    const assessment = this.assessmentStore.getAssessment(assessmentId)
    return assessment !== null && assessment.basicResult !== null
  }

  /**
   * 检查是否有详细报告访问权限
   */
  canAccessDetailedReport(assessmentId: string): boolean {
    // 首先检查基础报告权限
    if (!this.canAccessBasicReport(assessmentId)) {
      return false
    }

    // 检查是否已支付
    return this.paymentStore.isReportUnlocked(assessmentId)
  }

  /**
   * 获取基础报告
   */
  async getBasicReport(assessmentId: string): Promise<BasicReport | null> {
    if (!this.canAccessBasicReport(assessmentId)) {
      return null
    }

    // 尝试从缓存获取
    let report = reportService.getReportByAssessmentId(assessmentId)

    if (!report) {
      // 生成基础报告
      const assessment = this.assessmentStore.getAssessment(assessmentId)
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
  async getDetailedReport(assessmentId: string): Promise<DetailedReportData | null> {
    if (!this.canAccessDetailedReport(assessmentId)) {
      return null
    }

    // 尝试从缓存获取详细报告
    let detailedReport = reportService.getReportByAssessmentId(assessmentId) as DetailedReportData

    if (!detailedReport || detailedReport.type !== 'detailed') {
      // 获取基础报告
      const basicReport = await this.getBasicReport(assessmentId)
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
  getAccessStatus(assessmentId: string) {
    const hasAssessment = this.assessmentStore.hasAssessment(assessmentId)
    const hasBasicAccess = this.canAccessBasicReport(assessmentId)
    const hasDetailedAccess = this.canAccessDetailedReport(assessmentId)

    return {
      hasAssessment,
      hasBasicAccess,
      hasDetailedAccess,
      needsPayment: hasBasicAccess && !hasDetailedAccess,
      accessInfo: this.paymentStore.getAccessInfo
        ? this.paymentStore.getAccessInfo(assessmentId)
        : { hasAccess: false }
    }
  }

  /**
   * 验证报告访问令牌
   */
  validateAccessToken(assessmentId: string, token?: string): boolean {
    if (!token) {
      return this.canAccessDetailedReport(assessmentId)
    }

    // 这里可以添加更复杂的令牌验证逻辑
    // 目前简化为检查支付状态
    return this.paymentStore.isReportUnlocked(assessmentId)
  }

  /**
   * 生成报告分享链接
   */
  generateShareLink(assessmentId: string, includeToken = false): string {
    const baseUrl = window.location.origin
    const reportPath = `/report/${assessmentId}`

    if (includeToken && this.canAccessDetailedReport(assessmentId)) {
      // 生成带访问令牌的链接（用于分享详细报告）
      const accessInfo = this.paymentStore.getAccessInfo
        ? this.paymentStore.getAccessInfo(assessmentId)
        : null

      if (accessInfo?.accessToken) {
        return `${baseUrl}${reportPath}/detailed?token=${accessInfo.accessToken}`
      }
    }

    return `${baseUrl}${reportPath}`
  }

  /**
   * 检查报告是否过期
   */
  isReportExpired(assessmentId: string): boolean {
    const accessInfo = this.paymentStore.getAccessInfo
      ? this.paymentStore.getAccessInfo(assessmentId)
      : null

    if (!accessInfo?.expiresAt) {
      return false // 没有过期时间表示永久有效
    }

    return new Date() > new Date(accessInfo.expiresAt)
  }

  /**
   * 获取报告过期时间
   */
  getReportExpiryDate(assessmentId: string): Date | null {
    const accessInfo = this.paymentStore.getAccessInfo
      ? this.paymentStore.getAccessInfo(assessmentId)
      : null

    return accessInfo?.expiresAt ? new Date(accessInfo.expiresAt) : null
  }

  /**
   * 清理过期的报告访问权限
   */
  cleanupExpiredAccess(): void {
    // 这个方法应该定期调用以清理过期的访问权限
    // 具体实现取决于存储机制
    console.log('Cleaning up expired report access...')
  }
}

// 创建单例实例
export const reportAccessControl = new ReportAccessControl()

// 导出便捷函数
export const canAccessBasicReport = (assessmentId: string) =>
  reportAccessControl.canAccessBasicReport(assessmentId)

export const canAccessDetailedReport = (assessmentId: string) =>
  reportAccessControl.canAccessDetailedReport(assessmentId)

export const getBasicReport = (assessmentId: string) =>
  reportAccessControl.getBasicReport(assessmentId)

export const getDetailedReport = (assessmentId: string) =>
  reportAccessControl.getDetailedReport(assessmentId)

export const getAccessStatus = (assessmentId: string) =>
  reportAccessControl.getAccessStatus(assessmentId)

export const generateShareLink = (assessmentId: string, includeToken = false) =>
  reportAccessControl.generateShareLink(assessmentId, includeToken)

export const isReportExpired = (assessmentId: string) =>
  reportAccessControl.isReportExpired(assessmentId)

export const getReportExpiryDate = (assessmentId: string) =>
  reportAccessControl.getReportExpiryDate(assessmentId)

// 默认导出
export default reportAccessControl
