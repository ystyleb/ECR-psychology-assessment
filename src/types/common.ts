// 通用类型定义

// API响应基础接口
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: number
}

// 分页参数接口
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 分页响应接口
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 加载状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 通用状态接口
export interface AsyncState<T = unknown> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated?: Date
}

// 表单验证规则接口
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message: string
}

// 表单字段接口
export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'radio' | 'checkbox'
  value: unknown
  rules?: ValidationRule[]
  options?: Array<{ label: string; value: unknown }>
}

// 表单状态接口
export interface FormState {
  fields: Record<string, FormField>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
}

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

// 通知接口
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  createdAt: Date
}

// 主题类型
export type Theme = 'light' | 'dark' | 'auto'

// 语言类型
export type Language = 'zh-CN' | 'en-US'

// 设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

// 浏览器信息接口
export interface BrowserInfo {
  name: string
  version: string
  os: string
  device: DeviceType
  userAgent: string
}

// 用户偏好设置接口
export interface UserPreferences {
  theme: Theme
  language: Language
  notifications: boolean
  autoSave: boolean
  dataRetention: number // 数据保留天数
}

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
  stack?: string
}

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 日志条目接口
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
  error?: Error
}

// 统计数据接口
export interface Statistics {
  totalAssessments: number
  completedAssessments: number
  averageCompletionTime: number
  mostCommonAttachmentStyle: string
  userRetentionRate: number
}

// 导出数据格式类型
export type ExportFormat = 'json' | 'csv' | 'pdf'

// 导出选项接口
export interface ExportOptions {
  format: ExportFormat
  includePersonalData: boolean
  includeStatistics: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}
