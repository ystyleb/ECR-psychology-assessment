// 统一类型定义 - 合并所有types为单一文件

// ===== 核心业务类型 =====

// 依恋类型
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized'

// 测评问题
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
  style: AttachmentStyle
  timestamp: Date
  completedAt: Date
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
  generatedAt: Date
}

// 测评数据主接口
export interface AssessmentData {
  id: string
  createdAt: Date
  updatedAt: Date
  responses: (number | null)[] // 36题答案数组，null表示未回答
  result?: BasicResult
  detailedReport?: DetailedReport
  isCompleted: boolean
}

// ===== 支付相关类型 =====

// 支付状态
export type PaymentStatus = 'idle' | 'loading' | 'pending' | 'success' | 'error'

// 支付会话
export interface PaymentSession {
  id: string
  assessmentId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'expired'
  stripeSessionId?: string
  createdAt: Date
  expiresAt: Date
}

// 支付结果
export interface PaymentResult {
  success: boolean
  sessionId?: string
  assessmentId?: string
  accessToken?: string
  expiresAt?: Date
  error?: string
}

// ===== UI相关类型 =====

// 加载状态
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

// 主题类型
export type Theme = 'light' | 'dark'

// 设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

// 按钮变体
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

// 按钮尺寸
export type ButtonSize = 'sm' | 'md' | 'lg'

// ===== 通用类型 =====

// API响应基础接口
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: number
}

// 用户偏好设置
export interface UserPreferences {
  theme: Theme
  language: 'zh-CN' | 'en-US'
  notifications: boolean
  autoSave: boolean
  dataRetention: number // 数据保留天数
}

// 浏览器信息
export interface BrowserInfo {
  name: string
  version: string
  os: string
  device: DeviceType
  userAgent: string
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message: string
}

// 错误信息
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}

// 统计数据
export interface Statistics {
  totalAssessments: number
  completedAssessments: number
  averageCompletionTime: number
  mostCommonAttachmentStyle: AttachmentStyle
}

// 导出格式
export type ExportFormat = 'json' | 'csv' | 'pdf'

// ===== 常用联合类型 =====

// 所有可能的状态
export type AppState = LoadingState | PaymentStatus

// 所有UI组件尺寸
export type ComponentSize = ButtonSize

// 所有UI组件变体
export type ComponentVariant = ButtonVariant