// 服务层相关类型定义

import type { AssessmentData, AttachmentStyle } from './assessment'

// HTTP方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// 请求配置接口
export interface RequestConfig {
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, unknown>
  data?: unknown
  timeout?: number
  withCredentials?: boolean
}

// 响应接口
export interface Response<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

// HTTP客户端接口
export interface HttpClient {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<Response<T>>
  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<Response<T>>
  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<Response<T>>
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<Response<T>>
  patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<Response<T>>
}

// 存储服务接口
export interface StorageService {
  // 基础存储操作
  getItem<T = unknown>(key: string): T | null
  setItem<T = unknown>(key: string, value: T): void
  removeItem(key: string): void
  clear(): void

  // 加密存储操作
  getEncryptedItem<T = unknown>(key: string): T | null
  setEncryptedItem<T = unknown>(key: string, value: T): void

  // 批量操作
  getMultipleItems<T = unknown>(keys: string[]): Record<string, T | null>
  setMultipleItems<T = unknown>(items: Record<string, T>): void
  removeMultipleItems(keys: string[]): void

  // 存储信息
  getStorageInfo(): {
    used: number
    available: number
    quota: number
  }
}

// 测评服务接口
export interface AssessmentService {
  // 题目管理
  getQuestions(): Promise<AssessmentQuestion[]>
  getQuestionById(id: number): Promise<AssessmentQuestion | null>
  validateResponse(questionId: number, response: number): boolean

  // 测评管理
  createAssessment(): Promise<string>
  saveAssessment(assessment: AssessmentData): Promise<void>
  getAssessment(id: string): Promise<AssessmentData | null>
  deleteAssessment(id: string): Promise<void>

  // 结果计算
  calculateScores(responses: number[]): Promise<{
    anxious: number
    avoidant: number
    attachmentStyle: AttachmentStyle
  }>

  // 报告生成
  generateBasicReport(assessmentId: string): Promise<BasicReport>
  generateDetailedReport(assessmentId: string): Promise<DetailedReport>
}

// 支付服务接口
export interface PaymentService {
  // 支付会话管理
  createPaymentSession(assessmentId: string): Promise<PaymentSession>
  getPaymentSession(sessionId: string): Promise<PaymentSession | null>

  // 支付验证
  verifyPayment(sessionId: string): Promise<PaymentResult>

  // 订单管理
  getOrderHistory(): Promise<OrderInfo[]>
  getOrderById(orderId: string): Promise<OrderInfo | null>

  // 退款处理
  requestRefund(orderId: string, reason?: string): Promise<RefundResult>
}

// 计算服务接口
export interface CalculationService {
  // ECR-R计分
  calculateAnxiousScore(responses: number[]): number
  calculateAvoidantScore(responses: number[]): number
  determineAttachmentStyle(anxious: number, avoidant: number): AttachmentStyle

  // 统计计算
  calculatePercentile(score: number, dimension: 'anxious' | 'avoidant'): number
  calculateReliability(responses: number[]): number

  // 报告生成辅助
  generatePersonalityTraits(attachmentStyle: AttachmentStyle, scores: AttachmentScores): string[]
  generateGrowthSuggestions(attachmentStyle: AttachmentStyle, scores: AttachmentScores): string[]
  generateCompatibilityAnalysis(attachmentStyle: AttachmentStyle): string[]
}

// 导出服务接口
export interface ExportService {
  // 数据导出
  exportAssessmentData(assessmentId: string, format: ExportFormat): Promise<Blob>
  exportAllData(format: ExportFormat): Promise<Blob>

  // 报告导出
  exportReportAsPDF(assessmentId: string): Promise<Blob>
  exportReportAsImage(assessmentId: string, format: 'png' | 'jpeg'): Promise<Blob>

  // 批量导出
  exportMultipleReports(assessmentIds: string[], format: ExportFormat): Promise<Blob>
}

// 分析服务接口
export interface AnalyticsService {
  // 事件跟踪
  trackEvent(eventName: string, properties?: Record<string, unknown>): void
  trackPageView(pageName: string, properties?: Record<string, unknown>): void

  // 用户行为分析
  trackAssessmentStart(assessmentId: string): void
  trackAssessmentComplete(assessmentId: string, duration: number): void
  trackPaymentAttempt(assessmentId: string): void
  trackPaymentSuccess(assessmentId: string, amount: number): void

  // 性能监控
  trackPerformance(metricName: string, value: number): void
  trackError(error: Error, context?: Record<string, unknown>): void
}

// 通知服务接口
export interface NotificationService {
  // 浏览器通知
  requestPermission(): Promise<NotificationPermission>
  showNotification(title: string, options?: NotificationOptions): void

  // 应用内通知
  showToast(message: string, type?: NotificationType): void
  showAlert(title: string, message: string, type?: AlertType): void

  // 通知历史
  getNotificationHistory(): Notification[]
  clearNotificationHistory(): void
}

// 缓存服务接口
export interface CacheService {
  // 基础缓存操作
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>

  // 缓存信息
  has(key: string): Promise<boolean>
  keys(): Promise<string[]>
  size(): Promise<number>

  // 批量操作
  getMultiple<T = unknown>(keys: string[]): Promise<Record<string, T | null>>
  setMultiple<T = unknown>(items: Record<string, T>, ttl?: number): Promise<void>
  deleteMultiple(keys: string[]): Promise<void>
}

// 验证服务接口
export interface ValidationService {
  // 数据验证
  validateAssessmentResponse(questionId: number, response: number): ValidationResult
  validateAssessmentData(data: AssessmentData): ValidationResult

  // 表单验证
  validateForm(
    formData: Record<string, unknown>,
    rules: Record<string, ValidationRule[]>
  ): ValidationResult
  validateField(value: unknown, rules: ValidationRule[]): ValidationResult

  // 业务规则验证
  validatePaymentAmount(amount: number): ValidationResult
  validateAssessmentCompletion(responses: (number | null)[]): ValidationResult
}

// 验证结果接口
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

// 服务工厂接口
export interface ServiceFactory {
  createStorageService(): StorageService
  createAssessmentService(): AssessmentService
  createPaymentService(): PaymentService
  createCalculationService(): CalculationService
  createExportService(): ExportService
  createAnalyticsService(): AnalyticsService
  createNotificationService(): NotificationService
  createCacheService(): CacheService
  createValidationService(): ValidationService
}

// 导入缺失的类型
interface AssessmentQuestion {
  id: number
  text: string
  dimension: 'anxiety' | 'avoidance'
  reverse: boolean
  order: number
}

interface BasicReport {
  attachmentStyle: AttachmentStyle
  scores: AttachmentScores
  description: string
  characteristics: string[]
  suggestions: string[]
}

interface DetailedReport extends BasicReport {
  personalityTraits: string[]
  relationshipPatterns: string[]
  growthSuggestions: string[]
  compatibilityAnalysis: string[]
}

interface AttachmentScores {
  anxious: number
  avoidant: number
}

interface PaymentSession {
  id: string
  assessmentId: string
  amount: number
  currency: string
  status: string
  createdAt: Date
  expiresAt: Date
}

interface PaymentResult {
  success: boolean
  sessionId: string
  assessmentId: string
  error?: string
}

interface OrderInfo {
  id: string
  assessmentId: string
  amount: number
  status: string
  createdAt: Date
}

interface RefundResult {
  success: boolean
  refundId: string
  amount: number
  reason?: string
}

type ExportFormat = 'json' | 'csv' | 'pdf'
type NotificationType = 'success' | 'error' | 'warning' | 'info'
type AlertType = 'success' | 'info' | 'warning' | 'error'

interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message: string
}

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  createdAt: Date
}
