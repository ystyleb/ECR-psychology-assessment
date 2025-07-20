// UI相关类型定义

// 按钮变体类型
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost'
  | 'link'

// 按钮尺寸类型
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// 按钮属性接口
export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
}

// 输入框类型
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'

// 输入框属性接口
export interface InputProps {
  type?: InputType
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  autocomplete?: string
}

// 模态框尺寸类型
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// 模态框属性接口
export interface ModalProps {
  visible: boolean
  title?: string
  size?: ModalSize
  closable?: boolean
  maskClosable?: boolean
  centered?: boolean
  destroyOnClose?: boolean
}

// 卡片属性接口
export interface CardProps {
  title?: string
  subtitle?: string
  bordered?: boolean
  hoverable?: boolean
  loading?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

// 进度条类型
export type ProgressType = 'line' | 'circle' | 'dashboard'

// 进度条状态
export type ProgressStatus = 'normal' | 'success' | 'warning' | 'error'

// 进度条属性接口
export interface ProgressProps {
  type?: ProgressType
  percent: number
  status?: ProgressStatus
  showInfo?: boolean
  strokeWidth?: number
  strokeColor?: string
  trailColor?: string
}

// 提示框类型
export type AlertType = 'success' | 'info' | 'warning' | 'error'

// 提示框属性接口
export interface AlertProps {
  type: AlertType
  message: string
  description?: string
  closable?: boolean
  showIcon?: boolean
  banner?: boolean
}

// 标签页项接口
export interface TabItem {
  key: string
  label: string
  content?: string
  disabled?: boolean
  closable?: boolean
  icon?: string
}

// 标签页属性接口
export interface TabsProps {
  activeKey: string
  items: TabItem[]
  type?: 'line' | 'card' | 'editable-card'
  size?: 'small' | 'default' | 'large'
  position?: 'top' | 'right' | 'bottom' | 'left'
}

// 菜单项接口
export interface MenuItem {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  children?: MenuItem[]
  path?: string
  external?: boolean
}

// 面包屑项接口
export interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
}

// 分页属性接口
export interface PaginationProps {
  current: number
  total: number
  pageSize: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  pageSizeOptions?: number[]
}

// 表格列定义接口
export interface TableColumn<T = unknown> {
  key: string
  title: string
  dataIndex?: keyof T
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, record: T, index: number) => string | JSX.Element
}

// 表格属性接口
export interface TableProps<T = unknown> {
  columns: TableColumn<T>[]
  dataSource: T[]
  loading?: boolean
  pagination?: PaginationProps | false
  rowKey?: string | ((record: T) => string)
  bordered?: boolean
  size?: 'small' | 'default' | 'large'
}

// 图标属性接口
export interface IconProps {
  name: string
  size?: number | string
  color?: string
  spin?: boolean
  rotate?: number
}

// 头像属性接口
export interface AvatarProps {
  src?: string
  alt?: string
  size?: number | 'small' | 'default' | 'large'
  shape?: 'circle' | 'square'
  icon?: string
}

// 徽章属性接口
export interface BadgeProps {
  count?: number
  dot?: boolean
  showZero?: boolean
  overflowCount?: number
  color?: string
  text?: string
}

// 工具提示属性接口
export interface TooltipProps {
  title: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click' | 'focus'
  visible?: boolean
  arrow?: boolean
}

// 抽屉属性接口
export interface DrawerProps {
  visible: boolean
  title?: string
  placement?: 'top' | 'right' | 'bottom' | 'left'
  width?: number | string
  height?: number | string
  closable?: boolean
  maskClosable?: boolean
}

// 骨架屏属性接口
export interface SkeletonProps {
  loading: boolean
  active?: boolean
  avatar?: boolean
  paragraph?: {
    rows?: number
    width?: number | string | Array<number | string>
  }
  title?: boolean
}

// 空状态属性接口
export interface EmptyProps {
  image?: string
  description?: string
  children?: JSX.Element
}

// 回到顶部属性接口
export interface BackTopProps {
  visibilityHeight?: number
  target?: () => HTMLElement | Window
  duration?: number
}

// 锚点项接口
export interface AnchorItem {
  key: string
  href: string
  title: string
  children?: AnchorItem[]
}

// 锚点属性接口
export interface AnchorProps {
  items: AnchorItem[]
  offsetTop?: number
  bounds?: number
  showInkInFixed?: boolean
}
