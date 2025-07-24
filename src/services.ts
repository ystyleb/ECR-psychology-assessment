// 统一服务层 - 合并所有services为单一文件
import type { 
  AssessmentData, 
  AssessmentQuestion, 
  AttachmentStyle, 
  BasicResult, 
  DetailedReport,
  PaymentSession,
  PaymentResult
} from '@/types'

// ECR题目数据（36题）
const ECR_QUESTIONS: AssessmentQuestion[] = [
  { id: 1, text: '我担心被抛弃', dimension: 'anxiety', reverse: false, order: 1 },
  { id: 2, text: '我发现很难依赖恋人', dimension: 'avoidance', reverse: false, order: 2 },
  { id: 3, text: '我经常担心恋人不再爱我', dimension: 'anxiety', reverse: false, order: 3 },
  { id: 4, text: '我发现恋人不愿意像我希望的那样亲近我', dimension: 'avoidance', reverse: false, order: 4 },
  { id: 5, text: '我担心独自一人', dimension: 'anxiety', reverse: false, order: 5 },
  { id: 6, text: '我感到与恋人亲近很舒服', dimension: 'avoidance', reverse: true, order: 6 },
  { id: 7, text: '我经常担心恋人对我的关心不如我对他们的关心', dimension: 'anxiety', reverse: false, order: 7 },
  { id: 8, text: '我发现很难允许自己依赖恋人', dimension: 'avoidance', reverse: false, order: 8 },
  { id: 9, text: '我很少担心被抛弃', dimension: 'anxiety', reverse: true, order: 9 },
  { id: 10, text: '我不喜欢向恋人表露我内心深处的感受', dimension: 'avoidance', reverse: false, order: 10 },
  { id: 11, text: '我经常希望恋人的感受能像我对他们的感受一样强烈', dimension: 'anxiety', reverse: false, order: 11 },
  { id: 12, text: '我想要与恋人非常亲近，这有时会把他们吓跑', dimension: 'avoidance', reverse: false, order: 12 },
  { id: 13, text: '我担心恋人不会像我爱他们那样爱我', dimension: 'anxiety', reverse: false, order: 13 },
  { id: 14, text: '我发现很难与恋人保持亲密', dimension: 'avoidance', reverse: false, order: 14 },
  { id: 15, text: '当恋人不在身边时我会感到轻松', dimension: 'anxiety', reverse: true, order: 15 },
  { id: 16, text: '我发现很难完全信任恋人', dimension: 'avoidance', reverse: false, order: 16 },
  { id: 17, text: '我担心我会被抛弃', dimension: 'anxiety', reverse: false, order: 17 },
  { id: 18, text: '我宁愿不向恋人表达自己的感受', dimension: 'avoidance', reverse: false, order: 18 },
  { id: 19, text: '我很少担心恋人会离开我', dimension: 'anxiety', reverse: true, order: 19 },
  { id: 20, text: '我发现很难依赖恋人', dimension: 'avoidance', reverse: false, order: 20 },
  { id: 21, text: '当我的恋人不赞成我时，我感觉很糟糕', dimension: 'anxiety', reverse: false, order: 21 },
  { id: 22, text: '我向恋人寻求很多安慰', dimension: 'avoidance', reverse: true, order: 22 },
  { id: 23, text: '当恋人离开一小段时间我会变得沮丧', dimension: 'anxiety', reverse: false, order: 23 },
  { id: 24, text: '我不喜欢向恋人敞开心扉', dimension: 'avoidance', reverse: false, order: 24 },
  { id: 25, text: '我告诉恋人几乎所有事情', dimension: 'avoidance', reverse: true, order: 25 },
  { id: 26, text: '我发现很难允许自己依赖恋人', dimension: 'avoidance', reverse: false, order: 26 },
  { id: 27, text: '当我需要恋人时，他们总是在身边', dimension: 'anxiety', reverse: true, order: 27 },
  { id: 28, text: '当恋人想要我更亲密时我会感到紧张', dimension: 'avoidance', reverse: false, order: 28 },
  { id: 29, text: '我担心独自生活', dimension: 'anxiety', reverse: false, order: 29 },
  { id: 30, text: '我感到与恋人亲近很容易', dimension: 'avoidance', reverse: true, order: 30 },
  { id: 31, text: '恋人想让我们更亲近，这让我很容易', dimension: 'avoidance', reverse: true, order: 31 },
  { id: 32, text: '我发现很难在情感上依赖恋人', dimension: 'avoidance', reverse: false, order: 32 },
  { id: 33, text: '我知道恋人会在我需要时出现在我身边', dimension: 'anxiety', reverse: true, order: 33 },
  { id: 34, text: '我想要与恋人融为一体', dimension: 'avoidance', reverse: false, order: 34 },
  { id: 35, text: '我发现恋人不想像我希望的那样亲近', dimension: 'anxiety', reverse: false, order: 35 },
  { id: 36, text: '我向恋人表达我的需要和感受是相对容易的', dimension: 'avoidance', reverse: true, order: 36 }
]

/**
 * 统一服务类 - 整合所有业务逻辑
 */
class ECRService {
  private readonly STORAGE_KEYS = {
    assessments: 'ecr_assessments',
    sessions: 'ecr_payment_sessions',
    tokens: 'ecr_access_tokens'
  }

  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL || ''

  // 题目配置
  private readonly anxiousItems = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
  private readonly avoidantItems = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
  private readonly reverseItems = [6, 9, 15, 19, 22, 25, 27, 30, 31, 33, 36]

  // ===== 存储相关方法 =====
  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`存储失败:`, error)
    }
  }

  private removeItem(key: string): void {
    localStorage.removeItem(key)
  }

  // ===== 题目相关方法 =====
  async getQuestions(): Promise<AssessmentQuestion[]> {
    return ECR_QUESTIONS
  }

  getQuestionById(id: number): AssessmentQuestion | null {
    return ECR_QUESTIONS.find(q => q.id === id) || null
  }

  validateResponse(questionId: number, response: number): boolean {
    return response >= 1 && response <= 7 && questionId >= 1 && questionId <= 36
  }

  // ===== 计算相关方法 =====
  calculateAnxiousScore(responses: (number | null)[]): number {
    let sum = 0
    let count = 0

    this.anxiousItems.forEach(itemNum => {
      const response = responses[itemNum - 1]
      if (response !== null && response !== undefined) {
        let score = response
        if (this.reverseItems.includes(itemNum)) {
          score = 8 - response
        }
        sum += score
        count++
      }
    })

    return count > 0 ? Number((sum / count).toFixed(1)) : 0
  }

  calculateAvoidantScore(responses: (number | null)[]): number {
    let sum = 0
    let count = 0

    this.avoidantItems.forEach(itemNum => {
      const response = responses[itemNum - 1]
      if (response !== null && response !== undefined) {
        let score = response
        if (this.reverseItems.includes(itemNum)) {
          score = 8 - response
        }
        sum += score
        count++
      }
    })

    return count > 0 ? Number((sum / count).toFixed(1)) : 0
  }

  calculateAttachmentStyle(anxious: number, avoidant: number): AttachmentStyle {
    const midpoint = 4.0

    if (anxious < midpoint && avoidant < midpoint) {
      return 'secure'
    } else if (anxious >= midpoint && avoidant < midpoint) {
      return 'anxious'
    } else if (anxious < midpoint && avoidant >= midpoint) {
      return 'avoidant'
    } else {
      return 'disorganized'
    }
  }

  calculateResult(responses: (number | null)[]): BasicResult {
    const anxious = this.calculateAnxiousScore(responses)
    const avoidant = this.calculateAvoidantScore(responses)
    const style = this.calculateAttachmentStyle(anxious, avoidant)

    return {
      anxious,
      avoidant,
      style,
      timestamp: new Date(),
      completedAt: new Date()
    }
  }

  // ===== 测评相关方法 =====
  async createAssessment(): Promise<AssessmentData> {
    const assessment: AssessmentData = {
      id: `ecr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      responses: new Array(36).fill(null),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCompleted: false
    }

    // 保存到本地存储
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    assessments[assessment.id] = assessment
    this.setItem(this.STORAGE_KEYS.assessments, assessments)

    return assessment
  }

  async getAssessment(id: string): Promise<AssessmentData | null> {
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    return assessments[id] || null
  }

  async updateAssessment(assessment: AssessmentData): Promise<void> {
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    assessment.updatedAt = new Date()
    
    // 检查是否完成
    assessment.isCompleted = assessment.responses.every(r => r !== null)
    
    // 如果完成，计算结果
    if (assessment.isCompleted && !assessment.result) {
      assessment.result = this.calculateResult(assessment.responses)
    }

    assessments[assessment.id] = assessment
    this.setItem(this.STORAGE_KEYS.assessments, assessments)
  }

  async deleteAssessment(id: string): Promise<void> {
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    delete assessments[id]
    this.setItem(this.STORAGE_KEYS.assessments, assessments)
  }

  hasAssessment(id: string): boolean {
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    return !!assessments[id]
  }

  // ===== 支付相关方法 =====
  async createPaymentSession(assessmentId: string): Promise<PaymentSession> {
    try {
      const response = await fetch(`${this.baseUrl}/api/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId })
      })

      if (!response.ok) {
        throw new Error('支付会话创建失败')
      }

      const session = await response.json()
      
      // 保存会话信息
      const sessions = this.getItem<Record<string, any>>(this.STORAGE_KEYS.sessions) || {}
      sessions[assessmentId] = {
        sessionId: session.id,
        status: 'pending',
        createdAt: new Date(),
        assessmentId
      }
      this.setItem(this.STORAGE_KEYS.sessions, sessions)

      return session
    } catch (error) {
      console.error('创建支付会话失败:', error)
      throw error
    }
  }

  async verifyPayment(sessionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      const result = await response.json()
      
      if (result.success) {
        // 更新本地会话状态
        const sessions = this.getItem<Record<string, any>>(this.STORAGE_KEYS.sessions) || {}
        Object.keys(sessions).forEach(key => {
          if (sessions[key].sessionId === sessionId) {
            sessions[key].status = 'completed'
            sessions[key].paidAt = new Date()
          }
        })
        this.setItem(this.STORAGE_KEYS.sessions, sessions)
      }

      return result
    } catch (error) {
      console.error('支付验证失败:', error)
      return { success: false, error: '支付验证失败' }
    }
  }

  checkPaymentStatus(assessmentId: string): { isPaid: boolean; sessionId?: string } {
    const sessions = this.getItem<Record<string, any>>(this.STORAGE_KEYS.sessions) || {}
    const session = sessions[assessmentId]
    
    return {
      isPaid: session?.status === 'completed',
      sessionId: session?.sessionId
    }
  }

  // ===== 清理方法 =====
  cleanupExpiredData(): void {
    const now = Date.now()
    const expiryTime = 30 * 24 * 60 * 60 * 1000 // 30天

    // 清理过期测评
    const assessments = this.getItem<Record<string, AssessmentData>>(this.STORAGE_KEYS.assessments) || {}
    Object.keys(assessments).forEach(id => {
      const assessment = assessments[id]
      if (now - new Date(assessment.createdAt).getTime() > expiryTime) {
        delete assessments[id]
      }
    })
    this.setItem(this.STORAGE_KEYS.assessments, assessments)

    // 清理过期会话
    const sessions = this.getItem<Record<string, any>>(this.STORAGE_KEYS.sessions) || {}
    Object.keys(sessions).forEach(id => {
      const session = sessions[id]
      if (now - new Date(session.createdAt).getTime() > expiryTime) {
        delete sessions[id]
      }
    })
    this.setItem(this.STORAGE_KEYS.sessions, sessions)
  }
}

// 导出单一服务实例
export const ecrService = new ECRService()
export default ecrService