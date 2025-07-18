// 题目管理服务
import type { AssessmentQuestion } from '@/types'
import {
  ORDERED_QUESTIONS,
  ANXIETY_QUESTION_IDS,
  AVOIDANCE_QUESTION_IDS,
  REVERSE_SCORED_IDS,
  SCALE_INFO,
  SCALE_LABELS
} from '@/data/questions'

export interface QuestionService {
  getQuestions(): AssessmentQuestion[]
  getQuestionById(id: number): AssessmentQuestion | null
  getQuestionByOrder(order: number): AssessmentQuestion | null
  validateResponse(questionId: number, response: number): boolean
  getQuestionsByDimension(dimension: 'anxiety' | 'avoidance'): AssessmentQuestion[]
  isReverseScored(questionId: number): boolean
  getScaleInfo(): typeof SCALE_INFO
  getScaleLabels(): typeof SCALE_LABELS
  getTotalQuestions(): number
  getRandomizedQuestions(): AssessmentQuestion[]
}

class ECRQuestionService implements QuestionService {
  private questions: AssessmentQuestion[]
  private questionMap: Map<number, AssessmentQuestion>
  private orderMap: Map<number, AssessmentQuestion>

  constructor() {
    this.questions = [...ORDERED_QUESTIONS]
    this.questionMap = new Map()
    this.orderMap = new Map()

    // 构建快速查找映射
    this.buildMaps()
  }

  /**
   * 构建题目映射表以提高查询性能
   */
  private buildMaps(): void {
    this.questions.forEach(question => {
      this.questionMap.set(question.id, question)
      this.orderMap.set(question.order, question)
    })
  }

  /**
   * 获取所有题目（按顺序排列）
   */
  getQuestions(): AssessmentQuestion[] {
    return [...this.questions]
  }

  /**
   * 根据题目ID获取题目
   */
  getQuestionById(id: number): AssessmentQuestion | null {
    return this.questionMap.get(id) || null
  }

  /**
   * 根据题目顺序获取题目
   */
  getQuestionByOrder(order: number): AssessmentQuestion | null {
    return this.orderMap.get(order) || null
  }

  /**
   * 验证回答是否有效
   */
  validateResponse(questionId: number, response: number): boolean {
    // 检查题目是否存在
    const question = this.getQuestionById(questionId)
    if (!question) {
      return false
    }

    // 检查回答是否在有效范围内 (1-7)
    if (typeof response !== 'number' || response < 1 || response > 7) {
      return false
    }

    // 检查是否为整数
    if (!Number.isInteger(response)) {
      return false
    }

    return true
  }

  /**
   * 根据维度获取题目
   */
  getQuestionsByDimension(dimension: 'anxiety' | 'avoidance'): AssessmentQuestion[] {
    return this.questions.filter(q => q.dimension === dimension)
  }

  /**
   * 检查题目是否需要反向计分
   */
  isReverseScored(questionId: number): boolean {
    return REVERSE_SCORED_IDS.includes(questionId)
  }

  /**
   * 获取量表信息
   */
  getScaleInfo(): typeof SCALE_INFO {
    return { ...SCALE_INFO }
  }

  /**
   * 获取量表选项标签
   */
  getScaleLabels(): typeof SCALE_LABELS {
    return { ...SCALE_LABELS }
  }

  /**
   * 获取题目总数
   */
  getTotalQuestions(): number {
    return this.questions.length
  }

  /**
   * 获取随机化的题目顺序（用于减少顺序效应）
   */
  getRandomizedQuestions(): AssessmentQuestion[] {
    const shuffled = [...this.questions]

    // Fisher-Yates 洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
  }

  /**
   * 获取焦虑依恋题目ID列表
   */
  getAnxietyQuestionIds(): number[] {
    return [...ANXIETY_QUESTION_IDS]
  }

  /**
   * 获取回避依恋题目ID列表
   */
  getAvoidanceQuestionIds(): number[] {
    return [...AVOIDANCE_QUESTION_IDS]
  }

  /**
   * 获取需要反向计分的题目ID列表
   */
  getReverseQuestionIds(): number[] {
    return [...REVERSE_SCORED_IDS]
  }

  /**
   * 批量验证回答
   */
  validateResponses(responses: Record<number, number>): {
    valid: boolean
    errors: string[]
    validCount: number
    totalCount: number
  } {
    const errors: string[] = []
    let validCount = 0
    const totalCount = Object.keys(responses).length

    for (const [questionIdStr, response] of Object.entries(responses)) {
      const questionId = parseInt(questionIdStr)

      if (this.validateResponse(questionId, response)) {
        validCount++
      } else {
        const question = this.getQuestionById(questionId)
        if (!question) {
          errors.push(`题目 ${questionId} 不存在`)
        } else {
          errors.push(`题目 ${questionId} 的回答 ${response} 无效`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      validCount,
      totalCount
    }
  }

  /**
   * 获取题目统计信息
   */
  getStatistics(): {
    totalQuestions: number
    anxietyQuestions: number
    avoidanceQuestions: number
    reverseQuestions: number
    dimensions: string[]
  } {
    return {
      totalQuestions: this.questions.length,
      anxietyQuestions: this.getQuestionsByDimension('anxiety').length,
      avoidanceQuestions: this.getQuestionsByDimension('avoidance').length,
      reverseQuestions: REVERSE_SCORED_IDS.length,
      dimensions: ['anxiety', 'avoidance']
    }
  }

  /**
   * 搜索题目（根据文本内容）
   */
  searchQuestions(keyword: string): AssessmentQuestion[] {
    if (!keyword.trim()) {
      return []
    }

    const lowerKeyword = keyword.toLowerCase()
    return this.questions.filter(question => question.text.toLowerCase().includes(lowerKeyword))
  }

  /**
   * 获取题目预览（用于展示）
   */
  getQuestionPreview(questionId: number): {
    question: AssessmentQuestion | null
    scaleLabels: typeof SCALE_LABELS
    isReverse: boolean
  } {
    const question = this.getQuestionById(questionId)
    return {
      question,
      scaleLabels: this.getScaleLabels(),
      isReverse: this.isReverseScored(questionId)
    }
  }

  /**
   * 验证题目集合的完整性
   */
  validateQuestionSet(): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查题目数量
    if (this.questions.length !== 36) {
      errors.push(`题目数量应为36题，实际为${this.questions.length}题`)
    }

    // 检查题目ID连续性
    const expectedIds = Array.from({ length: 36 }, (_, i) => i + 1)
    const actualIds = this.questions.map(q => q.id).sort((a, b) => a - b)
    const missingIds = expectedIds.filter(id => !actualIds.includes(id))
    if (missingIds.length > 0) {
      errors.push(`缺少题目ID: ${missingIds.join(', ')}`)
    }

    // 检查维度平衡性
    const anxietyCount = this.getQuestionsByDimension('anxiety').length
    const avoidanceCount = this.getQuestionsByDimension('avoidance').length
    if (anxietyCount !== 18 || avoidanceCount !== 18) {
      warnings.push(`维度不平衡: 焦虑${anxietyCount}题, 回避${avoidanceCount}题`)
    }

    // 检查反向计分题目
    const reverseCount = REVERSE_SCORED_IDS.length
    if (reverseCount < 6) {
      warnings.push(`反向计分题目较少: ${reverseCount}题`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// 创建单例实例
export const questionService = new ECRQuestionService()

// 导出类型和实例
export type { QuestionService }
export default questionService
