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
   * 导出为图片 - 完美保留视觉效果，不分页
   * @param element - 要导出的DOM元素
   * @param options - 导出选项
   */
  static async exportToImage(element: HTMLElement, options: ExportOptions = {}): Promise<void> {
    const {
      filename = 'ECR心理测评报告',
      quality = 0.95
    } = options

    try {
      // 显示加载状态
      const loadingIndicator = this.showLoadingIndicator('正在生成图片...')

      // 临时修改元素样式以优化导出效果
      const exportData = this.prepareElementForExport(element)

      // 等待样式应用
      await new Promise(resolve => setTimeout(resolve, 500))

      // 获取元素的完整高度和宽度，生成高质量图片
      const canvas = await html2canvas(element, {
        scale: 2, // 适中的缩放比例，避免内存问题
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f0f9ff', // 使用和渐变背景相近的颜色
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth - 30, // 增加宽度给右侧留空间
        foreignObjectRendering: true,
        imageTimeout: 30000,
        removeContainer: false,
        scrollX: -10, // 向右偏移100px
        scrollY: 220,
        onclone: (clonedDoc) => {
          // 在克隆文档中只做最基本的样式确保
          const clonedElement = clonedDoc.querySelector('.detailed-report-container') as HTMLElement
          if (clonedElement) {
            clonedElement.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
            clonedElement.style.minHeight = 'auto'
          }
          
          // 确保其他隐藏元素变为可见
          const hiddenElements = clonedDoc.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]') as NodeListOf<HTMLElement>
          hiddenElements.forEach(el => {
            if (el.style.display === 'none') {
              el.style.display = 'block'
            }
            if (el.style.visibility === 'hidden') {
              el.style.visibility = 'visible'
            }
          })
        }
      })

      // 恢复原始样式和重新插入删除的元素
      this.restoreElementStyles(element, exportData)

      // 创建下载链接
      const imgDataURL = canvas.toDataURL('image/png', quality)
      const link = document.createElement('a')
      link.download = `${filename}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
      link.href = imgDataURL
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      this.hideLoadingIndicator(loadingIndicator)
      this.showSuccessMessage('图片导出成功！')

    } catch (error) {
      console.error('图片导出失败:', error)
      this.showErrorMessage('图片导出失败，请重试')
      throw error
    }
  }

  /**
   * 准备元素用于导出 - 优化样式
   */
  private static prepareElementForExport(element: HTMLElement): { styles: Map<HTMLElement, string>, removedElements: Array<{element: HTMLElement, parent: HTMLElement, nextSibling: Node | null}> } {
    const originalStyles = new Map<HTMLElement, string>()
    const removedElements: Array<{element: HTMLElement, parent: HTMLElement, nextSibling: Node | null}> = []
    
    // 保存并优化主容器样式 - 简化设置，主要通过html2canvas配置调整位置
    originalStyles.set(element, element.style.cssText)
    element.style.cssText += `
      position: relative !important;
      transform: none !important;
      overflow: visible !important;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%) !important;
      padding: 2rem !important;
      box-sizing: border-box !important;
      display: block !important;
      margin: 0 !important;
      min-height: auto !important;
    `

    // 临时删除不需要导出的元素 - 更直接有效
    const noExportElements = element.querySelectorAll('.no-export') as NodeListOf<HTMLElement>
    noExportElements.forEach(el => {
      const parent = el.parentElement!
      const nextSibling = el.nextSibling
      removedElements.push({ element: el, parent, nextSibling })
      parent.removeChild(el)
    })

    // 临时删除包含导出相关文本的元素
    const allDivs = element.querySelectorAll('div') as NodeListOf<HTMLElement>
    allDivs.forEach(div => {
      if (div.textContent?.includes('导出和分享') || 
          div.textContent?.includes('导出图片') ||
          div.textContent?.includes('打印PDF')) {
        const parent = div.parentElement
        if (parent && !removedElements.find(r => r.element === div)) {
          const nextSibling = div.nextSibling
          removedElements.push({ element: div, parent, nextSibling })
          parent.removeChild(div)
        }
      }
    })

    // 临时删除所有导出相关的按钮
    const buttons = element.querySelectorAll('button') as NodeListOf<HTMLElement>
    buttons.forEach(btn => {
      if (btn.textContent?.includes('导出') || 
          btn.textContent?.includes('分享') || 
          btn.textContent?.includes('打印')) {
        const parent = btn.parentElement
        if (parent && !removedElements.find(r => r.element === btn)) {
          const nextSibling = btn.nextSibling
          removedElements.push({ element: btn, parent, nextSibling })
          parent.removeChild(btn)
        }
      }
    })

    // 优化所有白色背景卡片
    const whiteCards = element.querySelectorAll('.bg-white') as NodeListOf<HTMLElement>
    whiteCards.forEach(card => {
      if (!originalStyles.has(card)) {
        originalStyles.set(card, card.style.cssText)
      }
      card.style.cssText += `
        background-color: #ffffff !important;
        border-radius: 16px !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        margin-bottom: 2rem !important;
        padding: 2rem !important;
        box-sizing: border-box !important;
      `
    })

    // 确保所有容器元素的可见性，但不强制修改宽度
    const containers = element.querySelectorAll('.space-y-8, .grid, .flex') as NodeListOf<HTMLElement>
    containers.forEach(container => {
      if (!originalStyles.has(container)) {
        originalStyles.set(container, container.style.cssText)
      }
      container.style.cssText += `
        overflow: visible !important;
        min-height: auto !important;
      `
    })

    // 优化彩色背景元素
    const colorBgs = element.querySelectorAll('.bg-red-50, .bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50') as NodeListOf<HTMLElement>
    colorBgs.forEach(bg => {
      if (!originalStyles.has(bg)) {
        originalStyles.set(bg, bg.style.cssText)
      }
      const computedStyle = window.getComputedStyle(bg)
      bg.style.backgroundColor = computedStyle.backgroundColor
      bg.style.cssText += `
        border-radius: 8px !important;
        padding: 1rem !important;
        margin: 0.5rem 0 !important;
      `
    })

    // 确保所有文本清晰可见
    const textElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li') as NodeListOf<HTMLElement>
    textElements.forEach(el => {
      if (!originalStyles.has(el)) {
        originalStyles.set(el, el.style.cssText)
      }
      el.style.cssText += `
        color: inherit !important;
        opacity: 1 !important;
        visibility: visible !important;
      `
    })

    // 确保图表和组件正常显示
    const chartElements = element.querySelectorAll('canvas, svg') as NodeListOf<HTMLElement>
    chartElements.forEach(chart => {
      if (!originalStyles.has(chart)) {
        originalStyles.set(chart, chart.style.cssText)
      }
      chart.style.cssText += `
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
      `
    })

    return { styles: originalStyles, removedElements }
  }

  /**
   * 恢复元素原始样式和重新插入删除的元素
   */
  private static restoreElementStyles(element: HTMLElement, data: { styles: Map<HTMLElement, string>, removedElements: Array<{element: HTMLElement, parent: HTMLElement, nextSibling: Node | null}> }): void {
    // 恢复样式
    data.styles.forEach((style, el) => {
      el.style.cssText = style
    })
    
    // 重新插入删除的元素
    data.removedElements.forEach(({ element: el, parent, nextSibling }) => {
      if (nextSibling) {
        parent.insertBefore(el, nextSibling)
      } else {
        parent.appendChild(el)
      }
    })
  }

  /**
   * 为单页PDF添加页脚
   */
  private static addSinglePageFooter(pdf: jsPDF): void {
    const pageSize = pdf.internal.pageSize
    const pageWidth = pageSize.width || pageSize.getWidth()
    const pageHeight = pageSize.height || pageSize.getHeight()

    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    
    // 添加生成时间
    const now = new Date()
    const dateStr = now.toLocaleDateString('zh-CN')
    const timeStr = now.toLocaleTimeString('zh-CN')
    pdf.text(
      `生成时间：${dateStr} ${timeStr}  |  ECR心理测评系统`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
  }

  /**
   * 使用浏览器打印功能导出PDF (备用方案)
   * @param element - 要导出的DOM元素
   * @param options - 导出选项
   */
  static async exportWithBrowserPrint(element: HTMLElement, options: ExportOptions = {}): Promise<void> {
    const {
      filename = 'ECR心理测评报告'
    } = options

    try {
      // 显示提示信息
      this.showMessage('请在打印对话框中选择"保存为PDF"选项', 'success')
      
      // 添加打印样式类
      document.body.classList.add('print-mode')
      element.classList.add('print-export')
      
      // 设置页面标题
      const originalTitle = document.title
      document.title = filename
      
      // 使用浏览器原生打印
      window.print()
      
      // 清理
      setTimeout(() => {
        document.body.classList.remove('print-mode')
        element.classList.remove('print-export')
        document.title = originalTitle
      }, 1000)

    } catch (error) {
      console.error('打印导出失败:', error)
      this.showErrorMessage('打印导出失败，请重试')
      throw error
    }
  }

  /**
   * 备用导出方法 - 使用html2canvas (如果用户需要)
   * @param element - 要导出的DOM元素
   * @param options - 导出选项
   */
  static async exportToPDFWithCanvas(element: HTMLElement, options: ExportOptions = {}): Promise<void> {
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
        backgroundColor: null, // 保持透明背景，让html2canvas捕获原始背景
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth,
        foreignObjectRendering: true // 启用更好的渲染支持
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