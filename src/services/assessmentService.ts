// 测评服务
import type {
  AssessmentService,
  AssessmentData,
  AssessmentQuestion,
  AttachmentStyle,
  BasicResult,
  DetailedReport
} from '@/types'
import { storageService } from './storageService'
import { calculationService } from './calculationService'

interface AttachmentScores {
  anxious: number
  avoidant: number
}

class ECRAssessmentService implements AssessmentService {
  private readonly storageKey = 'ecr_assessments'
  private readonly questionsKey = 'ecr_questions'

  // ECR-R量表36题
  private readonly defaultQuestions: AssessmentQuestion[] = [
    { id: 1, text: '我担心被抛弃', dimension: 'anxiety', reverse: false, order: 1 },
    { id: 2, text: '我发现很难依赖恋人', dimension: 'avoidance', reverse: false, order: 2 },
    { id: 3, text: '我经常担心恋人不再爱我', dimension: 'anxiety', reverse: false, order: 3 },
    {
      id: 4,
      text: '我发现恋人不愿意像我希望的那样亲近我',
      dimension: 'avoidance',
      reverse: false,
      order: 4
    },
    { id: 5, text: '我担心独自一人', dimension: 'anxiety', reverse: false, order: 5 },
    { id: 6, text: '我感到与恋人亲近很舒服', dimension: 'avoidance', reverse: true, order: 6 },
    {
      id: 7,
      text: '我经常担心恋人对我的关心不如我对他们的关心',
      dimension: 'anxiety',
      reverse: false,
      order: 7
    },
    { id: 8, text: '我发现很难允许自己依赖恋人', dimension: 'avoidance', reverse: false, order: 8 },
    { id: 9, text: '我很少担心被抛弃', dimension: 'anxiety', reverse: true, order: 9 },
    {
      id: 10,
      text: '我不喜欢向恋人表露我内心深处的感受',
      dimension: 'avoidance',
      reverse: false,
      order: 10
    }
    // ... 这里应该包含所有36题，为了演示只列出前10题
  ]

  // 获取所有题目
  async getQuestions(): Promise<AssessmentQuestion[]> {
    try {
      // 首先尝试从本地存储获取
      const storedQuestions = storageService.getItem<AssessmentQuestion[]>(this.questionsKey)

      if (storedQuestions && storedQuestions.length === 36) {
        return storedQuestions
      }

      // 如果本地没有或不完整，使用默认题目
      const questions = this.defaultQuestions

      // 保存到本地存储
      storageService.setItem(this.questionsKey, questions)

      return questions
    } catch (error) {
      console.error('Failed to get questions:', error)
      return this.defaultQuestions
    }
  }

  // 根据ID获取题目
  async getQuestionById(id: number): Promise<AssessmentQuestion | null> {
    try {
      const questions = await this.getQuestions()
      return questions.find(q => q.id === id) || null
    } catch (error) {
      console.error('Failed to get question by id:', error)
      return null
    }
  }

  // 验证回答
  validateResponse(questionId: number, response: number): boolean {
    // 检查回答是否在有效范围内（1-7）
    if (typeof response !== 'number' || response < 1 || response > 7) {
      return false
    }

    // 检查题目ID是否有效
    if (questionId < 1 || questionId > 36) {
      return false
    }

    return true
  }

  // 创建新测评
  async createAssessment(): Promise<string> {
    try {
      const id = this.generateAssessmentId()
      const assessment: AssessmentData = {
        id,
        createdAt: new Date(),
        responses: new Array(36).fill(null),
        basicResult: null,
        paymentStatus: {
          paid: false
        }
      }

      await this.saveAssessment(assessment)
      return id
    } catch (error) {
      console.error('Failed to create assessment:', error)
      throw new Error('Failed to create assessment')
    }
  }

  // 保存测评
  async saveAssessment(assessment: AssessmentData): Promise<void> {
    try {
      const assessments = this.getAllAssessments()
      assessments.set(assessment.id, assessment)

      const assessmentArray = Array.from(assessments.entries())
      storageService.setEncryptedItem(this.storageKey, assessmentArray)
    } catch (error) {
      console.error('Failed to save assessment:', error)
      throw new Error('Failed to save assessment')
    }
  }

  // 获取测评
  async getAssessment(id: string): Promise<AssessmentData | null> {
    try {
      const assessments = this.getAllAssessments()
      return assessments.get(id) || null
    } catch (error) {
      console.error('Failed to get assessment:', error)
      return null
    }
  }

  // 删除测评
  async deleteAssessment(id: string): Promise<void> {
    try {
      const assessments = this.getAllAssessments()
      assessments.delete(id)

      const assessmentArray = Array.from(assessments.entries())
      storageService.setEncryptedItem(this.storageKey, assessmentArray)
    } catch (error) {
      console.error('Failed to delete assessment:', error)
      throw new Error('Failed to delete assessment')
    }
  }

  // 计算分数
  async calculateScores(responses: number[]): Promise<{
    anxious: number
    avoidant: number
    attachmentStyle: AttachmentStyle
  }> {
    try {
      // 验证响应数据
      const validation = calculationService.validateResponses(responses)
      if (!validation.valid) {
        throw new Error(`Invalid responses: ${validation.errors.join(', ')}`)
      }

      const anxious = calculationService.calculateAnxiousScore(responses)
      const avoidant = calculationService.calculateAvoidantScore(responses)
      const attachmentStyle = calculationService.determineAttachmentStyle(anxious, avoidant)

      return { anxious, avoidant, attachmentStyle }
    } catch (error) {
      console.error('Failed to calculate scores:', error)
      throw new Error('Failed to calculate scores')
    }
  }

  // 生成基础报告
  async generateBasicReport(assessmentId: string): Promise<BasicResult> {
    try {
      const assessment = await this.getAssessment(assessmentId)
      if (!assessment) {
        throw new Error('Assessment not found')
      }

      if (!assessment.basicResult) {
        // 如果还没有计算结果，先计算
        const scores = await this.calculateScores(assessment.responses as number[])
        assessment.basicResult = {
          anxious: scores.anxious,
          avoidant: scores.avoidant,
          attachmentStyle: scores.attachmentStyle
        }
        await this.saveAssessment(assessment)
      }

      return assessment.basicResult
    } catch (error) {
      console.error('Failed to generate basic report:', error)
      throw new Error('Failed to generate basic report')
    }
  }

  // 生成详细报告
  async generateDetailedReport(assessmentId: string): Promise<DetailedReport> {
    try {
      const basicResult = await this.generateBasicReport(assessmentId)
      const scores: AttachmentScores = {
        anxious: basicResult.anxious,
        avoidant: basicResult.avoidant
      }

      const personalityTraits = calculationService.generatePersonalityTraits(
        basicResult.attachmentStyle,
        scores
      )

      const growthSuggestions = calculationService.generateGrowthSuggestions(
        basicResult.attachmentStyle,
        scores
      )

      const compatibilityAnalysis = calculationService.generateCompatibilityAnalysis(
        basicResult.attachmentStyle
      )

      const detailedReport: DetailedReport = {
        ...basicResult,
        personalityTraits,
        relationshipPatterns: this.generateRelationshipPatterns(basicResult.attachmentStyle),
        growthSuggestions,
        strengthsAndChallenges: this.generateStrengthsAndChallenges(basicResult.attachmentStyle),
        compatibilityAnalysis
      }

      return detailedReport
    } catch (error) {
      console.error('Failed to generate detailed report:', error)
      throw new Error('Failed to generate detailed report')
    }
  }

  // 获取所有测评
  private getAllAssessments(): Map<string, AssessmentData> {
    try {
      const assessmentArray = storageService.getEncryptedItem<[string, AssessmentData][]>(
        this.storageKey
      )
      return assessmentArray ? new Map(assessmentArray) : new Map()
    } catch (error) {
      console.error('Failed to get all assessments:', error)
      return new Map()
    }
  }

  // 生成测评ID
  private generateAssessmentId(): string {
    return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 生成关系模式描述
  private generateRelationshipPatterns(attachmentStyle: AttachmentStyle): string[] {
    const patterns: Record<AttachmentStyle, string[]> = {
      secure: [
        '在关系中保持平衡的亲密度和独立性',
        '能够有效处理关系冲突',
        '对伴侣的行为给予积极解释',
        '在关系中表现出一致性和可预测性'
      ],
      anxious: [
        '倾向于过度关注关系状态',
        '容易将伴侣的行为解释为拒绝信号',
        '在关系中寻求过度的保证',
        '可能表现出控制或粘人的行为'
      ],
      avoidant: [
        '在关系中保持情感距离',
        '避免深度的情感交流',
        '倾向于独立解决问题',
        '可能在关系变得过于亲密时退缩'
      ],
      disorganized: [
        '在关系中表现出矛盾的行为',
        '既渴望亲密又害怕受伤',
        '关系模式可能不稳定',
        '需要更多的安全感和稳定性'
      ]
    }

    return patterns[attachmentStyle] || []
  }

  // 生成优势和挑战
  private generateStrengthsAndChallenges(attachmentStyle: AttachmentStyle): {
    strengths: string[]
    challenges: string[]
  } {
    const data: Record<AttachmentStyle, { strengths: string[]; challenges: string[] }> = {
      secure: {
        strengths: ['情绪稳定', '沟通能力强', '信任他人', '自我价值感高'],
        challenges: ['可能对不安全依恋的伴侣缺乏理解', '有时过于乐观']
      },
      anxious: {
        strengths: ['对关系高度投入', '情感丰富', '敏感细腻', '关爱他人'],
        challenges: ['情绪波动大', '容易焦虑', '需要过多确认', '可能过度依赖']
      },
      avoidant: {
        strengths: ['独立自主', '理性思考', '自我控制', '目标导向'],
        challenges: ['情感表达困难', '避免亲密', '可能显得冷漠', '难以寻求帮助']
      },
      disorganized: {
        strengths: ['适应性强', '经历丰富', '潜在的成长空间大'],
        challenges: ['情绪不稳定', '关系模式混乱', '自我认知不清', '需要专业帮助']
      }
    }

    return data[attachmentStyle] || { strengths: [], challenges: [] }
  }
}

// 创建单例实例
export const assessmentService = new ECRAssessmentService()

// 导出类型和实例
export type { AssessmentService }
export default assessmentService
