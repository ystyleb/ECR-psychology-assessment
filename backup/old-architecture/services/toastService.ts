import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

export interface ToastAction {
  label: string
  handler: () => void
}

export interface ToastOptions {
  id?: string
  type?: ToastType
  title?: string
  message: string
  duration?: number
  persistent?: boolean
  closable?: boolean
  clickable?: boolean
  expandable?: boolean
  pauseOnHover?: boolean
  position?: ToastPosition
  showProgress?: boolean
  actions?: ToastAction[]
  onClick?: () => void
  onClose?: () => void
}

export interface Toast extends Required<Omit<ToastOptions, 'onClick' | 'onClose'>> {
  id: string
  visible: boolean
  createdAt: number
  onClick?: () => void
  onClose?: () => void
}

/**
 * Toast通知服务
 * 提供全局的消息通知功能
 */
class ToastService {
  private toasts = reactive<Toast[]>([])
  private idCounter = 0
  private maxToasts = 5

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `toast_${++this.idCounter}_${Date.now()}`
  }

  /**
   * 获取默认选项
   */
  private getDefaultOptions(): Partial<ToastOptions> {
    return {
      type: 'info',
      duration: 5000,
      persistent: false,
      closable: true,
      clickable: false,
      expandable: true,
      pauseOnHover: true,
      position: 'top-right',
      showProgress: true,
      actions: []
    }
  }

  /**
   * 添加Toast通知
   */
  add(options: ToastOptions): string {
    const defaultOptions = this.getDefaultOptions()
    const toast: Toast = {
      ...defaultOptions,
      ...options,
      id: options.id || this.generateId(),
      visible: true,
      createdAt: Date.now()
    } as Toast

    // 如果超过最大数量，移除最旧的非持久化Toast
    if (this.toasts.length >= this.maxToasts) {
      const oldestNonPersistent = this.toasts.find(t => !t.persistent)
      if (oldestNonPersistent) {
        this.remove(oldestNonPersistent.id)
      }
    }

    this.toasts.push(toast)
    return toast.id
  }

  /**
   * 移除Toast通知
   */
  remove(id: string): void {
    const index = this.toasts.findIndex(t => t.id === id)
    if (index > -1) {
      const toast = this.toasts[index]
      toast.visible = false

      // 延迟移除，等待动画完成
      setTimeout(() => {
        const currentIndex = this.toasts.findIndex(t => t.id === id)
        if (currentIndex > -1) {
          const removedToast = this.toasts.splice(currentIndex, 1)[0]
          if (removedToast.onClose) {
            removedToast.onClose()
          }
        }
      }, 300)
    }
  }

  /**
   * 清除所有Toast通知
   */
  clear(): void {
    this.toasts.forEach(toast => {
      toast.visible = false
    })

    setTimeout(() => {
      this.toasts.splice(0)
    }, 300)
  }

  /**
   * 清除指定类型的Toast通知
   */
  clearByType(type: ToastType): void {
    this.toasts.filter(toast => toast.type === type).forEach(toast => this.remove(toast.id))
  }

  /**
   * 获取所有Toast通知
   */
  getToasts(): Toast[] {
    return this.toasts
  }

  /**
   * 获取指定位置的Toast通知
   */
  getToastsByPosition(position: ToastPosition): Toast[] {
    return this.toasts.filter(toast => toast.position === position)
  }

  /**
   * 检查是否存在指定ID的Toast
   */
  exists(id: string): boolean {
    return this.toasts.some(toast => toast.id === id)
  }

  /**
   * 更新Toast通知
   */
  update(id: string, options: Partial<ToastOptions>): void {
    const toast = this.toasts.find(t => t.id === id)
    if (toast) {
      Object.assign(toast, options)
    }
  }

  // 便捷方法

  /**
   * 显示成功消息
   */
  success(message: string, options?: Partial<ToastOptions>): string {
    return this.add({
      type: 'success',
      message,
      ...options
    })
  }

  /**
   * 显示错误消息
   */
  error(message: string, options?: Partial<ToastOptions>): string {
    return this.add({
      type: 'error',
      message,
      duration: 8000, // 错误消息显示更长时间
      ...options
    })
  }

  /**
   * 显示警告消息
   */
  warning(message: string, options?: Partial<ToastOptions>): string {
    return this.add({
      type: 'warning',
      message,
      duration: 6000,
      ...options
    })
  }

  /**
   * 显示信息消息
   */
  info(message: string, options?: Partial<ToastOptions>): string {
    return this.add({
      type: 'info',
      message,
      ...options
    })
  }

  /**
   * 显示加载消息
   */
  loading(message: string, options?: Partial<ToastOptions>): string {
    return this.add({
      type: 'info',
      message,
      persistent: true,
      closable: false,
      showProgress: false,
      ...options
    })
  }

  /**
   * 显示确认消息（带操作按钮）
   */
  confirm(
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: Partial<ToastOptions>
  ): string {
    const actions: ToastAction[] = [
      {
        label: '确认',
        handler: () => {
          onConfirm()
          this.remove(toastId)
        }
      }
    ]

    if (onCancel) {
      actions.push({
        label: '取消',
        handler: () => {
          onCancel()
          this.remove(toastId)
        }
      })
    }

    const toastId = this.add({
      type: 'warning',
      message,
      persistent: true,
      actions,
      ...options
    })

    return toastId
  }

  /**
   * 显示进度消息
   */
  progress(message: string, progress: number, options?: Partial<ToastOptions>): string {
    const progressMessage = `${message} (${Math.round(progress)}%)`

    return this.add({
      type: 'info',
      message: progressMessage,
      persistent: true,
      closable: false,
      showProgress: true,
      ...options
    })
  }

  /**
   * 批量操作结果通知
   */
  batchResult(
    successCount: number,
    errorCount: number,
    operation: string,
    options?: Partial<ToastOptions>
  ): string {
    // const total = successCount + errorCount
    let type: ToastType = 'success'
    let message = ''

    if (errorCount === 0) {
      type = 'success'
      message = `${operation}完成，成功处理 ${successCount} 项`
    } else if (successCount === 0) {
      type = 'error'
      message = `${operation}失败，${errorCount} 项处理失败`
    } else {
      type = 'warning'
      message = `${operation}部分完成，成功 ${successCount} 项，失败 ${errorCount} 项`
    }

    return this.add({
      type,
      message,
      title: `批量${operation}结果`,
      duration: 8000,
      ...options
    })
  }

  /**
   * 设置最大Toast数量
   */
  setMaxToasts(max: number): void {
    this.maxToasts = Math.max(1, max)
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    byType: Record<ToastType, number>
    byPosition: Record<ToastPosition, number>
  } {
    const stats = {
      total: this.toasts.length,
      byType: {
        success: 0,
        error: 0,
        warning: 0,
        info: 0
      } as Record<ToastType, number>,
      byPosition: {
        'top-right': 0,
        'top-left': 0,
        'bottom-right': 0,
        'bottom-left': 0,
        'top-center': 0,
        'bottom-center': 0
      } as Record<ToastPosition, number>
    }

    this.toasts.forEach(toast => {
      stats.byType[toast.type]++
      stats.byPosition[toast.position]++
    })

    return stats
  }
}

// 创建单例实例
export const toastService = new ToastService()

// 导出类型和服务
export default toastService
export { ToastService }
