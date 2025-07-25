// 统一导出所有类型定义

// 通用类型
export type * from './common'

// UI组件类型
export type * from './ui'

// 测评相关类型
export type * from './assessment'

// 支付相关类型
export type * from './payment'

// 报告相关类型
export type * from './report'

// 服务层类型
export type * from './services'

// 重新导出常用类型（便于使用）
export type {
  // 测评相关
  AttachmentStyle,
  AssessmentData,
  AssessmentQuestion,
  BasicResult,
  DetailedReport
} from './assessment'

export type {
  // 报告相关
  BasicReport,
  DetailedReportData,
  AttachmentTypeDescription,
  AttachmentScores,
  AttachmentPercentiles,
  ReportType,
  ReportStatus
} from './report'

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
