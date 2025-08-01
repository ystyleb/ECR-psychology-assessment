import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface ExportOptions {
  filename?: string
  quality?: number
  format?: 'a4' | 'letter'
  margin?: number
}

export interface ShareOptions {
  title?: string
  text?: string
  url?: string
}

/**
 * 导出服务 - 处理PDF导出和报告分享功能
 */
export class ExportService {
  /**
   * 导出PDF
   * @param element - 要导出的DOM元素
   * @param options - 导出选项
   */
  static async exportToPDF(element: HTMLElement, options: ExportOptions = {}): Promise<void> {
    const {
      filename = 'ECR心理测评报告',
      quality = 0.95,
      format = 'a4',
      margin = 20
    } = options

    try {
      // 显示加载状态
      const loadingIndicator = this.showLoadingIndicator('正在生成PDF...')

      // 获取元素的完整高度和宽度
      const canvas = await html2canvas(element, {
        scale: 2, // 提高清晰度
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth
      })

      // 创建PDF文档
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format
      })

      // 获取PDF尺寸
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // 计算内容区域（减去边距）
      const contentWidth = pdfWidth - (margin * 2)
      const contentHeight = pdfHeight - (margin * 2)

      // 计算图片尺寸
      const imgWidth = contentWidth
      const imgHeight = (canvas.height * contentWidth) / canvas.width

      // 如果内容高度超过一页，需要分页
      if (imgHeight > contentHeight) {
        let yPosition = 0
        let pageNumber = 1

        while (yPosition < imgHeight) {
          // 计算当前页应该显示的内容高度
          const pageHeight = Math.min(contentHeight, imgHeight - yPosition)
          const canvasHeight = (pageHeight * canvas.width) / contentWidth

          // 创建当前页的canvas
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')!
          pageCanvas.width = canvas.width
          pageCanvas.height = canvasHeight

          // 绘制当前页内容
          pageCtx.drawImage(
            canvas,
            0, (yPosition / imgHeight) * canvas.height,
            canvas.width, canvasHeight,
            0, 0,
            canvas.width, canvasHeight
          )

          // 添加到PDF
          const pageDataURL = pageCanvas.toDataURL('image/jpeg', quality)
          if (pageNumber > 1) {
            pdf.addPage()
          }
          pdf.addImage(pageDataURL, 'JPEG', margin, margin, contentWidth, pageHeight)

          yPosition += pageHeight
          pageNumber++
        }
      } else {
        // 内容可以放在一页内
        const imgDataURL = canvas.toDataURL('image/jpeg', quality)
        pdf.addImage(imgDataURL, 'JPEG', margin, margin, imgWidth, imgHeight)
      }

      // 添加页脚信息
      this.addPDFFooter(pdf)

      // 保存PDF
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      pdf.save(`${filename}_${timestamp}.pdf`)

      this.hideLoadingIndicator(loadingIndicator)
      this.showSuccessMessage('PDF导出成功！')

    } catch (error) {
      console.error('PDF导出失败:', error)
      this.showErrorMessage('PDF导出失败，请重试')
      throw error
    }
  }

  /**
   * 分享报告
   * @param options - 分享选项
   */
  static async shareReport(options: ShareOptions = {}): Promise<void> {
    const {
      title = 'ECR心理测评报告',
      text = '我刚完成了ECR依恋风格测评，想与你分享我的测评结果。',
      url = window.location.href
    } = options

    try {
      // 检查是否支持原生分享API
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url
        })
        this.showSuccessMessage('分享成功！')
      } else {
        // 降级到复制链接
        await this.copyToClipboard(url)
        this.showSuccessMessage('链接已复制到剪贴板！')
      }
    } catch (error) {
      console.error('分享失败:', error)
      // 如果分享被取消或失败，尝试复制链接
      try {
        await this.copyToClipboard(url)
        this.showSuccessMessage('链接已复制到剪贴板！')
      } catch (copyError) {
        this.showErrorMessage('分享失败，请手动复制链接')
      }
    }
  }

  /**
   * 复制文本到剪贴板
   */
  private static async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  /**
   * 为PDF添加页脚
   */
  private static addPDFFooter(pdf: jsPDF): void {
    const pageCount = pdf.getNumberOfPages()
    const pageSize = pdf.internal.pageSize
    const pageHeight = pageSize.height || pageSize.getHeight()

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      
      // 添加页码
      pdf.text(
        `第 ${i} 页，共 ${pageCount} 页`,
        pageSize.width - 30,
        pageHeight - 10,
        { align: 'right' }
      )
      
      // 添加生成时间
      const now = new Date()
      const dateStr = now.toLocaleDateString('zh-CN')
      const timeStr = now.toLocaleTimeString('zh-CN')
      pdf.text(
        `生成时间：${dateStr} ${timeStr}`,
        20,
        pageHeight - 10
      )
    }
  }

  /**
   * 显示加载指示器
   */
  private static showLoadingIndicator(message: string): HTMLElement {
    const loading = document.createElement('div')
    loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
    loading.innerHTML = `
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-gray-700">${message}</span>
      </div>
    `
    document.body.appendChild(loading)
    return loading
  }

  /**
   * 隐藏加载指示器
   */
  private static hideLoadingIndicator(element: HTMLElement): void {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
  }

  /**
   * 显示成功消息
   */
  private static showSuccessMessage(message: string): void {
    this.showMessage(message, 'success')
  }

  /**
   * 显示错误消息
   */
  private static showErrorMessage(message: string): void {
    this.showMessage(message, 'error')
  }

  /**
   * 显示消息提示
   */
  private static showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.createElement('div')
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'
    
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300`
    toast.textContent = message
    toast.style.transform = 'translateY(-100%)'
    
    document.body.appendChild(toast)
    
    // 动画显示
    setTimeout(() => {
      toast.style.transform = 'translateY(0)'
    }, 100)
    
    // 3秒后移除
    setTimeout(() => {
      toast.style.transform = 'translateY(-100%)'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }
}

export default ExportService