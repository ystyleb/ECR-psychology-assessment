// 依恋类型枚举
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized'

// 测评问题接口
export interface AssessmentQuestion {
  id: number
  text: string
  dimension: 'anxiety' | 'avoidance'
  reverse: boolean
  order: number
}

// 基础测评结果
export interface BasicResult {
  anxious: number
  avoidant: number
  attachmentStyle: AttachmentStyle
}

// 详细报告内容
export interface DetailedReport {
  personalityTraits: string[]
  relationshipPatterns: string[]
  growthSuggestions: string[]
  strengthsAndChallenges: {
    strengths: string[]
    challenges: string[]
  }
  compatibilityAnalysis: string[]
}

// 支付状态
export interface PaymentStatus {
  sessionId?: string
  paid: boolean
  unlockedAt?: Date
  expiresAt?: Date
}

// 测评数据主接口
export interface AssessmentData {
  id: string
  createdAt: Date
  responses: (number | null)[] // 36题答案数组，null表示未回答
  basicResult: BasicResult | null
  detailedReport?: DetailedReport
  paymentStatus?: PaymentStatus
}

// 依恋类型描述
export interface AttachmentTypeDescription {
  name: string
  shortDescription: string
  characteristics: string[]
  strengths: string[]
  challenges: string[]
  suggestions: string[]
}

// 图表数据
export interface ChartData {
  type: 'radar' | 'bar' | 'quadrant'
  data: Record<string, unknown>
  options?: Record<string, unknown>
}
