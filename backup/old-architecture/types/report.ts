import type { AttachmentStyle, BasicResult, DetailedReport } from './assessment'

// 报告类型枚举
export type ReportType = 'basic' | 'detailed'

// 报告状态
export type ReportStatus = 'generating' | 'ready' | 'error' | 'locked'

// 基础报告接口
export interface BasicReport {
  id: string
  assessmentId: string
  type: ReportType
  status: ReportStatus
  createdAt: Date
  updatedAt: Date
  basicResult: BasicResult
  attachmentDescription: AttachmentTypeDescription
  scores: AttachmentScores
  percentiles: AttachmentPercentiles
  reliability: number
}

// 详细报告接口
export interface DetailedReportData extends BasicReport {
  type: 'detailed'
  detailedContent: DetailedReport
  visualizations: ReportVisualization[]
  insights: ReportInsight[]
  recommendations: ReportRecommendation[]
  accessInfo: ReportAccessInfo
}

// 依恋类型描述
export interface AttachmentTypeDescription {
  name: string
  title: string
  shortDescription: string
  description: string
  characteristics: string[]
  strengths: string[]
  challenges: string[]
  relationshipPatterns: string[]
  icon: string
  color: string
  bgColor: string
}

// 依恋得分
export interface AttachmentScores {
  anxious: number
  avoidant: number
  secure: number // 计算得出的安全性得分
}

// 百分位数
export interface AttachmentPercentiles {
  anxious: number
  avoidant: number
  secure: number
}

// 报告可视化
export interface ReportVisualization {
  id: string
  type: 'radar' | 'bar' | 'quadrant' | 'line' | 'pie'
  title: string
  description: string
  data: ChartDataPoint[]
  config: ChartConfig
}

// 图表数据点
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  description?: string
}

// 图表配置
export interface ChartConfig {
  width?: number
  height?: number
  responsive?: boolean
  maintainAspectRatio?: boolean
  plugins?: Record<string, unknown>
  scales?: Record<string, unknown>
  elements?: Record<string, unknown>
  animation?: Record<string, unknown>
}

// 报告洞察
export interface ReportInsight {
  id: string
  category: 'personality' | 'relationship' | 'growth' | 'compatibility'
  title: string
  content: string
  importance: 'high' | 'medium' | 'low'
  icon: string
  color: string
}

// 报告建议
export interface ReportRecommendation {
  id: string
  category: 'immediate' | 'short_term' | 'long_term'
  title: string
  description: string
  actionItems: string[]
  resources?: ReportResource[]
  priority: 'high' | 'medium' | 'low'
}

// 报告资源
export interface ReportResource {
  type: 'book' | 'article' | 'video' | 'exercise' | 'app'
  title: string
  description: string
  url?: string
  author?: string
}

// 报告访问信息
export interface ReportAccessInfo {
  isUnlocked: boolean
  unlockedAt?: Date
  expiresAt?: Date
  accessToken?: string
  paymentSessionId?: string
}

// 报告生成选项
export interface ReportGenerationOptions {
  includeVisualizations: boolean
  includeInsights: boolean
  includeRecommendations: boolean
  includeResources: boolean
  language: 'zh' | 'en'
  format: 'web' | 'pdf'
}

// 报告导出选项
export interface ReportExportOptions {
  format: 'pdf' | 'json' | 'csv'
  includeCharts: boolean
  includePersonalInfo: boolean
  watermark?: string
}

// 报告统计信息
export interface ReportStats {
  totalReports: number
  basicReports: number
  detailedReports: number
  averageCompletionTime: number
  popularAttachmentTypes: Record<AttachmentStyle, number>
}

// 报告模板
export interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: ReportSection[]
  styles: ReportStyles
}

// 报告章节
export interface ReportSection {
  id: string
  title: string
  order: number
  type: 'text' | 'chart' | 'list' | 'table' | 'image'
  content: unknown
  visible: boolean
  required: boolean
}

// 报告样式
export interface ReportStyles {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  spacing: number
  borderRadius: number
}

// 报告错误
export interface ReportError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}

// 报告生成结果
export interface ReportGenerationResult {
  success: boolean
  report?: BasicReport | DetailedReportData
  error?: ReportError
  generationTime: number
}
