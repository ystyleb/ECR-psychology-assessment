import type {
  BasicReport,
  DetailedReportData,
  AttachmentTypeDescription,
  AttachmentScores,
  AttachmentPercentiles,
  ReportVisualization,
  ReportInsight,
  ReportRecommendation,
  ReportGenerationOptions,
  AttachmentStyle,
  BasicResult,
  DetailedReport
} from '@/types'

import { ATTACHMENT_DESCRIPTIONS } from '@/data/attachmentDescriptions'

/**
 * 报告生成服务
 */
class ReportService {
  private readonly storageKey = 'ecr_reports'

  /**
   * 生成基础报告
   */
  generateBasicReport(
    assessmentId: string,
    basicResult: BasicResult,
    scores: AttachmentScores,
    reliability: number
  ): BasicReport {
    const attachmentDescription = this.getAttachmentDescription(basicResult.attachmentStyle)
    const percentiles = this.calculatePercentiles(scores)

    const report: BasicReport = {
      id: `report_${assessmentId}_${Date.now()}`,
      assessmentId,
      type: 'basic',
      status: 'ready',
      createdAt: new Date(),
      updatedAt: new Date(),
      basicResult,
      attachmentDescription,
      scores,
      percentiles,
      reliability
    }

    this.saveReport(report)
    return report
  }

  /**
   * 生成详细报告
   */
  generateDetailedReport(
    basicReport: BasicReport,
    options: ReportGenerationOptions = {
      includeVisualizations: true,
      includeInsights: true,
      includeRecommendations: true,
      includeResources: true,
      language: 'zh',
      format: 'web'
    }
  ): DetailedReportData {
    const detailedContent = this.generateDetailedContent(basicReport.basicResult)
    const visualizations = options.includeVisualizations
      ? this.generateVisualizations(basicReport)
      : []
    const insights = options.includeInsights ? this.generateInsights(basicReport) : []
    const recommendations = options.includeRecommendations
      ? this.generateRecommendations(basicReport)
      : []

    const detailedReport: DetailedReportData = {
      ...basicReport,
      type: 'detailed',
      detailedContent,
      visualizations,
      insights,
      recommendations,
      accessInfo: {
        isUnlocked: false
      }
    }

    this.saveReport(detailedReport)
    return detailedReport
  }

  /**
   * 获取依恋类型描述
   */
  private getAttachmentDescription(style: AttachmentStyle): AttachmentTypeDescription {
    const description = ATTACHMENT_DESCRIPTIONS[style]
    if (!description) {
      throw new Error(`Unknown attachment style: ${style}`)
    }

    return {
      name: description.name,
      shortDescription: description.shortDescription,
      description: description.description,
      characteristics: description.characteristics,
      strengths: description.strengths,
      challenges: description.challenges,
      relationshipPatterns: description.relationshipPatterns,
      icon: description.icon,
      color: description.color,
      bgColor: description.bgColor
    }
  }

  /**
   * 计算百分位数
   */
  private calculatePercentiles(scores: AttachmentScores): AttachmentPercentiles {
    // 基于常模数据计算百分位数
    // 这里使用简化的计算，实际项目中应该使用真实的常模数据
    const anxiousPercentile = this.scoreToPercentile(scores.anxious, 3.56, 1.12)
    const avoidantPercentile = this.scoreToPercentile(scores.avoidant, 2.92, 1.25)
    const securePercentile = 100 - Math.max(anxiousPercentile, avoidantPercentile)

    return {
      anxious: Math.round(anxiousPercentile),
      avoidant: Math.round(avoidantPercentile),
      secure: Math.round(Math.max(0, securePercentile))
    }
  }

  /**
   * 分数转百分位数
   */
  private scoreToPercentile(score: number, mean: number, sd: number): number {
    const zScore = (score - mean) / sd
    // 简化的正态分布累积分布函数
    return this.normalCDF(zScore) * 100
  }

  /**
   * 正态分布累积分布函数（简化版）
   */
  private normalCDF(z: number): number {
    // 使用近似公式
    const t = 1 / (1 + 0.2316419 * Math.abs(z))
    const d = 0.3989423 * Math.exp((-z * z) / 2)
    let prob =
      d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

    if (z > 0) prob = 1 - prob
    return prob
  }

  /**
   * 生成详细内容
   */
  private generateDetailedContent(basicResult: BasicResult): DetailedReport {
    const style = basicResult.attachmentStyle
    const description = ATTACHMENT_DESCRIPTIONS[style]

    return {
      personalityTraits: this.generatePersonalityTraits(style),
      relationshipPatterns: description.relationshipPatterns,
      growthSuggestions: this.generateGrowthSuggestions(style),
      strengthsAndChallenges: {
        strengths: description.strengths,
        challenges: description.challenges
      },
      compatibilityAnalysis: this.generateCompatibilityAnalysis(style)
    }
  }

  /**
   * 生成个性特征
   */
  private generatePersonalityTraits(style: AttachmentStyle): string[] {
    const traits: Record<AttachmentStyle, string[]> = {
      secure: [
        '情绪稳定，能够有效调节自己的情感',
        '在人际关系中表现出信任和开放',
        '具有良好的自我价值感和自信心',
        '能够平衡独立性和亲密关系的需求',
        '在面对冲突时采用建设性的解决方式'
      ],
      anxious: [
        '对关系中的变化和威胁高度敏感',
        '倾向于寻求更多的关注和确认',
        '情绪波动较大，容易感到焦虑和不安',
        '对伴侣的行为和态度过度解读',
        '在关系中可能表现出依赖性'
      ],
      avoidant: [
        '重视个人独立和自主性',
        '在情感表达上相对保守和克制',
        '倾向于通过理性分析处理问题',
        '对过度亲密感到不适或压力',
        '在关系中保持一定的情感距离'
      ],
      disorganized: [
        '在亲密关系中表现出矛盾的行为模式',
        '情绪调节能力相对较弱',
        '对关系的期望和恐惧并存',
        '可能在不同情境下表现出不同的依恋行为',
        '需要更多的耐心和理解来建立稳定关系'
      ]
    }

    return traits[style] || []
  }

  /**
   * 生成成长建议
   */
  private generateGrowthSuggestions(style: AttachmentStyle): string[] {
    const suggestions: Record<AttachmentStyle, string[]> = {
      secure: [
        '继续保持开放和诚实的沟通方式',
        '在关系中发挥积极的引导作用',
        '帮助伴侣建立更安全的依恋模式',
        '在面对挑战时保持乐观和韧性',
        '不断学习和成长，提升关系质量'
      ],
      anxious: [
        '学习情绪调节技巧，如深呼吸和正念练习',
        '培养自我安抚的能力，减少对外部确认的依赖',
        '练习理性思考，避免过度解读伴侣的行为',
        '建立健康的个人兴趣和社交圈子',
        '寻求专业心理咨询师的帮助和指导'
      ],
      avoidant: [
        '练习情感表达，学会分享内心的感受',
        '逐步增加与伴侣的情感连接和亲密度',
        '认识到依赖他人并不意味着失去独立性',
        '学习识别和表达自己的情感需求',
        '在安全的环境中练习脆弱性和开放性'
      ],
      disorganized: [
        '寻求专业心理治疗师的帮助',
        '学习情绪调节和压力管理技巧',
        '建立稳定和可预测的日常生活模式',
        '在关系中建立清晰的边界和期望',
        '耐心地工作于建立更一致的依恋模式'
      ]
    }

    return suggestions[style] || []
  }

  /**
   * 生成兼容性分析
   */
  private generateCompatibilityAnalysis(style: AttachmentStyle): string[] {
    const compatibility: Record<AttachmentStyle, string[]> = {
      secure: [
        '与各种依恋类型都能建立良好关系',
        '能够为焦虑型伴侣提供安全感和稳定性',
        '可以帮助回避型伴侣逐步开放和信任',
        '在关系中起到平衡和稳定的作用',
        '最适合与同样安全型的伴侣建立关系'
      ],
      anxious: [
        '与安全型伴侣最为匹配，能获得所需的安全感',
        '与回避型伴侣可能形成追逐-逃避的模式',
        '与同样焦虑型的伴侣可能产生情绪放大效应',
        '需要伴侣提供更多的确认和支持',
        '在稳定的关系中能够逐步改善依恋模式'
      ],
      avoidant: [
        '与安全型伴侣最为匹配，能在安全环境中逐步开放',
        '与焦虑型伴侣可能产生距离-追逐的循环',
        '与同样回避型的伴侣可能缺乏情感连接',
        '需要伴侣给予足够的空间和耐心',
        '在理解和接纳的环境中能够建立更深的连接'
      ],
      disorganized: [
        '与安全型伴侣最为匹配，能提供稳定的支持',
        '需要伴侣具备高度的理解和包容能力',
        '在专业指导下能够改善关系模式',
        '需要时间和耐心来建立稳定的关系',
        '通过治疗和成长可以发展出更健康的依恋模式'
      ]
    }

    return compatibility[style] || []
  }

  /**
   * 生成可视化图表
   */
  private generateVisualizations(report: BasicReport): ReportVisualization[] {
    const visualizations: ReportVisualization[] = []

    // 雷达图 - 依恋维度
    visualizations.push({
      id: 'attachment_radar',
      type: 'radar',
      title: '依恋维度分析',
      description: '您在不同依恋维度上的得分分布',
      data: [
        { label: '焦虑依恋', value: report.scores.anxious, color: '#ef4444' },
        { label: '回避依恋', value: report.scores.avoidant, color: '#3b82f6' },
        { label: '安全依恋', value: report.scores.secure, color: '#10b981' }
      ],
      config: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 7,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    })

    // 柱状图 - 百分位数
    visualizations.push({
      id: 'percentile_bar',
      type: 'bar',
      title: '百分位数对比',
      description: '您的得分在人群中的相对位置',
      data: [
        { label: '焦虑依恋', value: report.percentiles.anxious, color: '#ef4444' },
        { label: '回避依恋', value: report.percentiles.avoidant, color: '#3b82f6' },
        { label: '安全依恋', value: report.percentiles.secure, color: '#10b981' }
      ],
      config: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value: number) => `${value}%`
            }
          }
        }
      }
    })

    return visualizations
  }

  /**
   * 生成洞察
   */
  private generateInsights(_report: BasicReport): ReportInsight[] {
    // 这里可以根据具体的分数和类型生成个性化的洞察
    return []
  }

  /**
   * 生成建议
   */
  private generateRecommendations(_report: BasicReport): ReportRecommendation[] {
    // 这里可以根据具体的分数和类型生成个性化的建议
    return []
  }

  /**
   * 保存报告
   */
  private saveReport(report: BasicReport | DetailedReportData): void {
    try {
      const reports = this.getAllReports()
      reports.set(report.id, report)
      localStorage.setItem(this.storageKey, JSON.stringify(Array.from(reports.entries())))
    } catch (error) {
      console.error('Failed to save report:', error)
    }
  }

  /**
   * 获取所有报告
   */
  private getAllReports(): Map<string, BasicReport | DetailedReportData> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const entries = JSON.parse(stored)
        // 反序列化日期字段
        const revivedEntries = entries.map(([key, report]: [string, Record<string, unknown>]) => {
          if (report.createdAt && typeof report.createdAt === 'string') {
            report.createdAt = new Date(report.createdAt)
          }
          if (report.updatedAt && typeof report.updatedAt === 'string') {
            report.updatedAt = new Date(report.updatedAt)
          }
          // 处理accessInfo中的日期
          if (report.accessInfo) {
            if (report.accessInfo.unlockedAt && typeof report.accessInfo.unlockedAt === 'string') {
              report.accessInfo.unlockedAt = new Date(report.accessInfo.unlockedAt)
            }
            if (report.accessInfo.expiresAt && typeof report.accessInfo.expiresAt === 'string') {
              report.accessInfo.expiresAt = new Date(report.accessInfo.expiresAt)
            }
          }
          return [key, report]
        })
        return new Map(revivedEntries)
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
    }
    return new Map()
  }

  /**
   * 获取报告
   */
  getReport(reportId: string): BasicReport | DetailedReportData | null {
    const reports = this.getAllReports()
    return reports.get(reportId) || null
  }

  /**
   * 根据评估ID获取报告
   */
  getReportByAssessmentId(assessmentId: string): BasicReport | DetailedReportData | null {
    const reports = this.getAllReports()
    for (const report of reports.values()) {
      if (report.assessmentId === assessmentId) {
        return report
      }
    }
    return null
  }
}

// 导出单例实例
export const reportService = new ReportService()
export default reportService
