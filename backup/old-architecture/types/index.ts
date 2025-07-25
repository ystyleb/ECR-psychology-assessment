// 统一导出所有类型定义

// 通用类型
export type * from './common'

// UI组件类型
export type * from './ui'

// 测评相关类型
export type * from './assessment'

// 支付相关类型
export type * from './payment'

// 服务层类型
export type * from './services'

// 重新导出常用类型（便于使用）
export type {
  // 测评相关
  AttachmentStyle,
  AssessmentData,
  AssessmentQuestion,
  BasicResult,
  DetailedReport,

  // 支付相关
  PaymentStatus,
  PaymentSession,
  PaymentResult,

  // 通用类型
  ApiResponse,
  LoadingState,
  AsyncState,
  NotificationType,

  // UI类型
  ButtonVariant,
  ButtonSize,
  ModalSize,
  AlertType,

  // 服务类型
  HttpMethod,
  RequestConfig,
  Response,
  ValidationResult
} from './assessment'

export type { PaymentStatus, PaymentSession, PaymentResult } from './payment'

export type {
  ApiResponse,
  LoadingState,
  AsyncState,
  NotificationType,
  Theme,
  Language,
  DeviceType
} from './common'

export type {
  ButtonVariant,
  ButtonSize,
  ModalSize,
  AlertType,
  ProgressType,
  ProgressStatus
} from './ui'

export type {
  HttpMethod,
  RequestConfig,
  Response,
  ValidationResult,
  StorageService,
  AssessmentService,
  PaymentService,
  CalculationService
} from './services'
